import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { OWNER_ID } from '@/lib/owner';

export async function GET() {
  const supabase = createAdminClient();

  const { data: watchlist } = await supabase
    .from('watchlist')
    .select('ticker')
    .eq('user_id', OWNER_ID);

  const tickers = (watchlist ?? []).map((w) => w.ticker);
  if (!tickers.length) return NextResponse.json([]);

  const { data, error } = await supabase
    .from('earnings_analyses')
    .select('*')
    .in('ticker', tickers)
    .order('report_date', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
