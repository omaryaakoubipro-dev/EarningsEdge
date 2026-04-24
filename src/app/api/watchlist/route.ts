import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCompanyProfile, getEarningsCalendar } from '@/lib/fmp/client';
import { OWNER_ID } from '@/lib/owner';

export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', OWNER_ID)
    .order('next_earnings_date', { ascending: true, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message, hint: error.hint, details: error.details }, { status: 500 });

  const items = data ?? [];
  // Enrich with last_report_date from analyses
  const analysisIds = items.map((w) => w.last_analysis_id).filter(Boolean) as string[];
  if (analysisIds.length) {
    const { data: reports } = await supabase
      .from('earnings_analyses')
      .select('id, report_date')
      .in('id', analysisIds);
    const reportMap = new Map(reports?.map((r) => [r.id, r.report_date]) ?? []);
    return NextResponse.json(items.map((w) => ({
      ...w,
      last_report_date: w.last_analysis_id ? (reportMap.get(w.last_analysis_id) ?? null) : null,
    })));
  }
  return NextResponse.json(items.map((w) => ({ ...w, last_report_date: null })));
}

export async function POST(req: Request) {
  const supabase = createAdminClient();
  const body = await req.json();
  const ticker = (body.ticker as string)?.toUpperCase().trim();
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });

  let profile;
  try {
    profile = await getCompanyProfile(ticker);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch company data' }, { status: 502 });
  }
  if (!profile) return NextResponse.json({ error: `Ticker ${ticker} not found` }, { status: 404 });

  let nextEarningsDate: string | null = null;
  try {
    const today = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const calendar = await getEarningsCalendar(today, future);
    const entry = calendar.find((e) => e.symbol === ticker);
    if (entry) nextEarningsDate = entry.date;
  } catch {
    // Non-fatal
  }

  const { data, error } = await supabase
    .from('watchlist')
    .upsert(
      {
        user_id: OWNER_ID,
        ticker,
        company_name: profile.companyName,
        sector: profile.sector,
        industry: profile.industry,
        logo_url: profile.image,
        current_price: profile.price,
        price_change: profile.changes,
        price_change_pct: profile.changesPercentage,
        market_cap: profile.mktCap,
        next_earnings_date: nextEarningsDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,ticker' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });

  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', OWNER_ID)
    .eq('ticker', ticker);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
