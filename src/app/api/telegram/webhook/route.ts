import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { OWNER_ID } from '@/lib/owner';
import {
  sendWatchlistMessage,
  sendNextEarnings,
  sendLatestAnalysis,
  sendSimpleMessage,
} from '@/lib/telegram/bot';
import { formatDate } from '@/lib/utils';

interface TelegramUpdate {
  update_id: number;
  message?: {
    chat: { id: number };
    text?: string;
  };
}

export async function POST(req: Request) {
  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = String(message.chat.id);
  const text = message.text.toLowerCase().trim();

  // Handle /start and /help immediately — no DB needed
  if (text === '/start' || text === '/help') {
    try {
      await sendSimpleMessage(
        chatId,
        `👋 Welcome to EarningsEdge!\n\nYour chat ID is: ${chatId}\n\nCommands:\n/watchlist — View your watchlist\n/next — Upcoming earnings\n/latest — Latest analysis\n\nOpen dashboard: ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://earningsedge.vercel.app'}`
      );
    } catch (err) {
      console.error('Failed to send /start reply:', err);
    }
    return NextResponse.json({ ok: true });
  }

  // All other commands need DB access
  const supabase = createAdminClient();

  try {
    if (text === '/watchlist') {
      const { data: watchlist } = await supabase
        .from('watchlist')
        .select('ticker, next_earnings_date')
        .eq('user_id', OWNER_ID)
        .order('next_earnings_date', { ascending: true, nullsFirst: false });

      await sendWatchlistMessage(chatId, (watchlist ?? []).map((w) => ({
        ticker: w.ticker,
        nextEarnings: w.next_earnings_date ? formatDate(w.next_earnings_date) : null,
      })));

    } else if (text === '/next') {
      const { data: watchlist } = await supabase
        .from('watchlist')
        .select('ticker, next_earnings_date')
        .eq('user_id', OWNER_ID)
        .gte('next_earnings_date', new Date().toISOString().split('T')[0])
        .order('next_earnings_date', { ascending: true })
        .limit(10);

      await sendNextEarnings(chatId, (watchlist ?? []).map((w) => ({
        ticker: w.ticker,
        date: formatDate(w.next_earnings_date) ?? 'TBD',
      })));

    } else if (text === '/latest') {
      const { data: watchlist } = await supabase
        .from('watchlist').select('ticker').eq('user_id', OWNER_ID);
      const tickers = (watchlist ?? []).map((w) => w.ticker);
      const { data: latestAnalysis } = await supabase
        .from('earnings_analyses')
        .select('*')
        .in('ticker', tickers.length ? tickers : ['__none__'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      await sendLatestAnalysis(chatId, latestAnalysis);

    } else {
      await sendSimpleMessage(chatId, 'Unknown command. Try /watchlist, /next, or /latest');
    }
  } catch (err) {
    console.error('Telegram webhook error:', err);
    try {
      await sendSimpleMessage(chatId, '⚠️ An error occurred. Please try again.');
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
