import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getCompanyProfile, getFullFinancialData } from '@/lib/fmp/client';
import { analyzeEarnings } from '@/lib/claude/analyzer';
import { sendAnalysisAlert } from '@/lib/telegram/bot';

/**
 * POST /api/earnings/analyze
 * Body: { ticker: string, reportDate: string }
 * Protected by CRON_SECRET
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const ticker = (body.ticker as string)?.toUpperCase().trim();
  const reportDate = body.reportDate as string;
  if (!ticker || !reportDate) {
    return NextResponse.json({ error: 'ticker and reportDate required' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Get company profile
  const profile = await getCompanyProfile(ticker);
  if (!profile) return NextResponse.json({ error: `Ticker ${ticker} not found` }, { status: 404 });

  // Determine fiscal period from the report date
  const reportDateObj = new Date(reportDate);
  const fiscalYear = reportDateObj.getFullYear();
  const fiscalQuarter = Math.ceil((reportDateObj.getMonth() + 1) / 3);
  const period = `Q${fiscalQuarter} ${fiscalYear}`;

  // Fetch all financial data in parallel
  let financialData;
  try {
    financialData = await getFullFinancialData(ticker);
  } catch (err) {
    return NextResponse.json({ error: `FMP data fetch failed: ${String(err)}` }, { status: 502 });
  }

  // Run Claude analysis
  let analysis;
  try {
    analysis = await analyzeEarnings(
      ticker,
      profile.companyName,
      period,
      fiscalYear,
      fiscalQuarter,
      reportDate,
      financialData
    );
  } catch (err) {
    return NextResponse.json({ error: `Analysis failed: ${String(err)}` }, { status: 500 });
  }

  // Save analysis to Supabase
  const { data: savedAnalysis, error: saveError } = await supabase
    .from('earnings_analyses')
    .insert({
      ...analysis,
      raw_income_statement: financialData.income,
      raw_balance_sheet: financialData.balance,
      raw_cash_flow: financialData.cashflow,
    })
    .select()
    .single();

  if (saveError) {
    return NextResponse.json({ error: `Save failed: ${saveError.message}` }, { status: 500 });
  }

  // Update watchlist entries for this ticker with last verdict
  await supabase
    .from('watchlist')
    .update({
      last_verdict: analysis.verdict,
      last_analysis_id: savedAnalysis.id,
      updated_at: new Date().toISOString(),
    })
    .eq('ticker', ticker);

  // Send Telegram alerts to all users who have this ticker on their watchlist
  const { data: watchlistUsers } = await supabase
    .from('watchlist')
    .select('user_id')
    .eq('ticker', ticker);

  if (watchlistUsers?.length) {
    const userIds = watchlistUsers.map((r) => r.user_id);

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .in('user_id', userIds)
      .eq('telegram_enabled', true)
      .not('telegram_chat_id', 'is', null);

    for (const pref of prefs ?? []) {
      try {
        await sendAnalysisAlert(pref.telegram_chat_id!, savedAnalysis);

        // Log the alert
        await supabase.from('alert_history').insert({
          user_id: pref.user_id,
          ticker,
          analysis_id: savedAnalysis.id,
          verdict: analysis.verdict,
          summary: analysis.summary,
          channel: 'telegram',
          delivered: true,
        });
      } catch (err) {
        console.error(`Telegram alert failed for user ${pref.user_id}:`, err);
      }
    }
  }

  return NextResponse.json({
    success: true,
    analysisId: savedAnalysis.id,
    verdict: analysis.verdict,
    ticker,
    period,
  });
}
