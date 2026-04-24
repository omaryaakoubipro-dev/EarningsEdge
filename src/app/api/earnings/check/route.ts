import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEarningsCalendar } from '@/lib/fmp/client';
import { format, subDays } from 'date-fns';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: watchlistRows, error: wlError } = await supabase
    .from('watchlist')
    .select('ticker, next_earnings_date');

  if (wlError) return NextResponse.json({ error: wlError.message }, { status: 500 });
  if (!watchlistRows?.length) return NextResponse.json({ checked: 0 });

  const tickers = Array.from(new Set(watchlistRows.map((r) => r.ticker)));

  const today = format(new Date(), 'yyyy-MM-dd');
  const pastDate = format(subDays(new Date(), 3), 'yyyy-MM-dd');
  const futureDate = format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  let calendar;
  try {
    calendar = await getEarningsCalendar(pastDate, futureDate);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch earnings calendar' }, { status: 502 });
  }

  const relevantEntries = calendar.filter((e) => tickers.includes(e.symbol));

  // Update next_earnings_date
  for (const ticker of tickers) {
    const upcoming = calendar
      .filter((e) => e.symbol === ticker && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (upcoming) {
      await supabase
        .from('watchlist')
        .update({ next_earnings_date: upcoming.date, updated_at: new Date().toISOString() })
        .eq('ticker', ticker);
    }
  }

  const recentlyReported = relevantEntries.filter(
    (e) => e.date >= pastDate && e.date <= today && e.eps !== null
  );

  const analyzed: string[] = [];
  const errors: string[] = [];

  for (const entry of recentlyReported) {
    const { data: existing } = await supabase
      .from('earnings_analyses')
      .select('id')
      .eq('ticker', entry.symbol)
      .eq('report_date', entry.date)
      .maybeSingle();

    if (existing) continue;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/earnings/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CRON_SECRET ?? ''}`,
        },
        body: JSON.stringify({ ticker: entry.symbol, reportDate: entry.date }),
      });
      if (res.ok) analyzed.push(entry.symbol);
      else errors.push(`${entry.symbol}: ${await res.text()}`);
    } catch (err) {
      errors.push(`${entry.symbol}: ${String(err)}`);
    }
  }

  return NextResponse.json({ checked: tickers.length, recentEarnings: recentlyReported.length, analyzed, errors });
}
