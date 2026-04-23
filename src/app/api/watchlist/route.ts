import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCompanyProfile } from '@/lib/fmp/client';

// GET /api/watchlist — fetch the authenticated user's watchlist
export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('next_earnings_date', { ascending: true, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/watchlist — add a ticker { ticker: string }
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const ticker = (body.ticker as string)?.toUpperCase().trim();
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });

  // Fetch company profile from FMP
  let profile;
  try {
    profile = await getCompanyProfile(ticker);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch company data' }, { status: 502 });
  }

  if (!profile) return NextResponse.json({ error: `Ticker ${ticker} not found` }, { status: 404 });

  // Fetch upcoming earnings date
  const today = new Date().toISOString().split('T')[0];
  const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  let nextEarningsDate: string | null = null;

  try {
    const { getEarningsCalendar } = await import('@/lib/fmp/client');
    const calendar = await getEarningsCalendar(today, future);
    const entry = calendar.find((e) => e.symbol === ticker);
    if (entry) nextEarningsDate = entry.date;
  } catch {
    // Non-fatal — earnings date will be filled in on next cron run
  }

  const { data, error } = await supabase
    .from('watchlist')
    .upsert(
      {
        user_id: user.id,
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

// DELETE /api/watchlist?ticker=AAPL — remove a ticker
export async function DELETE(req: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });

  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('ticker', ticker);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
