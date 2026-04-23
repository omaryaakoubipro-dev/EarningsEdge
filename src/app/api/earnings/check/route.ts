import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getEarningsCalendar } from '@/lib/fmp/client';
import { format, subDays } from 'date-fns';

/**
 * Cron endpoint — runs every 4 hours via Vercel Cron.
 * 1. Gets all unique tickers across all watchlists
 * 2. Checks if any ticker has new earnings reported since the last check
 * 3. For each new earnings, triggers analysis
 */
export async function GET(req: Request) {
  // Validate cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get all unique tickers from all watchlists
  const { data: watchlistRows, error: wlError } = await supabase
    .from('watchlist')
    .select('ticker, user_id, next_earnings_date');

  if (wlError) return NextResponse.json({ error: wlError.message }, { status: 500 });
  if (!watchlistRows?.length) return NextResponse.json({ checked: 0 });

  const tickers = Array.from(new Set(watchlistRows.map((r) => r.ticker)));

  // Fetch earnings calendar for the past 3 days to catch recently reported
  const today = format(new Date(), 'yyyy-MM-dd');
  const pastDate = format(subDays(new Date(), 3), 'yyyy-MM-dd');
  const futureDate = format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  let calendar;
  try {
    calendar = await getEarningsCalendar(pastDate, futureDate);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch earnings calendar' }, { status: 502 });
  }

  // Filter to our watched tickers
  const relevantEntries = calendar.filter((e) => tickers.includes(e.symbol));

  // Update next_earnings_date for all watched tickers
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

  // Find earnings reported in the past 3 days that we haven't analyzed yet
  const recentlyReported = relevantEntries.filter(
    (e) => e.date >= pastDate && e.date <= today && e.eps !== null
  );

  const analyzed: string[] = [];
  const errors: string[] = [];

  for (const entry of recentlyReported) {
    // Check if we already have an analysis for this ticker + date
    const { data: existing } = await supabase
      .from('earnings_analyses')
      .select('id')
      .eq('ticker', entry.symbol)
      .eq('report_date', entry.date)
      .maybeSingle();

    if (existing) continue; // Already analyzed

    // Trigger analysis
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/earnings/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CRON_SECRET ?? ''}`,
        },
        body: JSON.stringify({
          ticker: entry.symbol,
          reportDate: entry.date,
        }),
      });

      if (res.ok) {
        analyzed.push(entry.symbol);
      } else {
        const errBody = await res.text();
        errors.push(`${entry.symbol}: ${errBody}`);
      }
    } catch (err) {
      errors.push(`${entry.symbol}: ${String(err)}`);
    }
  }

  return NextResponse.json({
    checked: tickers.length,
    recentEarnings: recentlyReported.length,
    analyzed,
    errors,
    timestamp: new Date().toISOString(),
  });
}
