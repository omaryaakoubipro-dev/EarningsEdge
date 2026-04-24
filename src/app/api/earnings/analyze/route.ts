import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCompanyProfile, getFullFinancialData } from '@/lib/fmp/client';
import { analyzeEarnings } from '@/lib/claude/analyzer';
import { sendAnalysisAlert } from '@/lib/telegram/bot';
import { OWNER_ID } from '@/lib/owner';

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

  const supabase = createAdminClient();

  const profile = await getCompanyProfile(ticker);
  if (!profile) return NextResponse.json({ error: `Ticker ${ticker} not found` }, { status: 404 });

  const reportDateObj = new Date(reportDate);
  const fiscalYear = reportDateObj.getFullYear();
  const fiscalQuarter = Math.ceil((reportDateObj.getMonth() + 1) / 3);
  const period = `Q${fiscalQuarter} ${fiscalYear}`;

  let financialData;
  try {
    financialData = await getFullFinancialData(ticker);
  } catch (err) {
    return NextResponse.json({ error: `FMP data fetch failed: ${String(err)}` }, { status: 502 });
  }

  let analysis;
  try {
    analysis = await analyzeEarnings(ticker, profile.companyName, period, fiscalYear, fiscalQuarter, reportDate, financialData);
  } catch (err) {
    return NextResponse.json({ error: `Analysis failed: ${String(err)}` }, { status: 500 });
  }

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

  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 500 });

  await supabase
    .from('watchlist')
    .update({ last_verdict: analysis.verdict, last_analysis_id: savedAnalysis.id, updated_at: new Date().toISOString() })
    .eq('ticker', ticker);

  // Send Telegram alert if configured
  const { data: pref } = await supabase
    .from('user_preferences')
    .select('telegram_chat_id, telegram_enabled')
    .eq('user_id', OWNER_ID)
    .maybeSingle();

  if (pref?.telegram_enabled && pref.telegram_chat_id) {
    try {
      await sendAnalysisAlert(pref.telegram_chat_id, savedAnalysis);
      await supabase.from('alert_history').insert({
        user_id: OWNER_ID,
        ticker,
        analysis_id: savedAnalysis.id,
        verdict: analysis.verdict,
        summary: analysis.summary,
        channel: 'telegram',
        delivered: true,
      });
    } catch (err) {
      console.error('Telegram alert failed:', err);
    }
  }

  return NextResponse.json({ success: true, analysisId: savedAnalysis.id, verdict: analysis.verdict, ticker, period });
}
