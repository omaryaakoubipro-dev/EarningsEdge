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
  const update: TelegramUpdate = await req.json();
  const message = update.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = String(message.chat.id);
  const text = message.text.toLowerCase().trim();
  const supabase = createAdminClient();

  try {
    if (text === '/start' || text === '/help') {
      await sendSimpleMessage(chatId, `👋 Welcome to EarningsEdge!\n\nCommands:\n/watchlist — View your watchlist\n/next — Upcoming earnings dates\n/latest — Latest analysis`);
      return NextResponse.json({ ok: true });
    }

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
      const { data: watchlist } = await supabase.from('watchlist').select('ticker').eq('user_id', OWNER_ID);
      const tickers = (watchlist ?? []).map((w) => w.ticker);
      const { data: latestAnalysis } = await supabase
        .from('earnings_analyses')
        .select('*')
        .in('ticker', tickers)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      await sendLatestAnalysis(chatId, latestAnalysis);
    } else {
      await sendSimpleMessage(chatId, 'Unknown command. Try /watchlist, /next, or /latest');
    }
  } catch (err) {
    console.error('Telegram webhook error:', err);
  }

  return NextResponse.json({ ok: true });
}
