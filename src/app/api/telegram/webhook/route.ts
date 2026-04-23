import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
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
    message_id: number;
    from?: { id: number; first_name?: string; username?: string };
    chat: { id: number };
    text?: string;
  };
}

/**
 * POST /api/telegram/webhook
 * Receives updates from the Telegram Bot API
 */
export async function POST(req: Request) {
  const update: TelegramUpdate = await req.json();
  const message = update.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = String(message.chat.id);
  const text = message.text.toLowerCase().trim();
  const supabase = createServiceClient();

  try {
    if (text === '/start' || text === '/help') {
      await sendSimpleMessage(
        chatId,
        `👋 Welcome to EarningsEdge!\n\nCommands:\n/watchlist — View your watchlist\n/next — Upcoming earnings dates\n/latest — Latest analysis\n\nOpen the dashboard: ${process.env.NEXT_PUBLIC_APP_URL}`
      );
      return NextResponse.json({ ok: true });
    }

    // Look up user by telegram_chat_id
    const { data: pref } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('telegram_chat_id', chatId)
      .maybeSingle();

    if (!pref) {
      await sendSimpleMessage(
        chatId,
        `❌ Your Telegram account isn't linked yet.\n\nGo to EarningsEdge → Alerts tab → enter this chat ID: ${chatId}`
      );
      return NextResponse.json({ ok: true });
    }

    const userId = pref.user_id;

    if (text === '/watchlist') {
      const { data: watchlist } = await supabase
        .from('watchlist')
        .select('ticker, next_earnings_date')
        .eq('user_id', userId)
        .order('next_earnings_date', { ascending: true, nullsFirst: false });

      await sendWatchlistMessage(
        chatId,
        (watchlist ?? []).map((w) => ({
          ticker: w.ticker,
          nextEarnings: w.next_earnings_date ? formatDate(w.next_earnings_date) : null,
        }))
      );
    } else if (text === '/next') {
      const { data: watchlist } = await supabase
        .from('watchlist')
        .select('ticker, next_earnings_date')
        .eq('user_id', userId)
        .gte('next_earnings_date', new Date().toISOString().split('T')[0])
        .order('next_earnings_date', { ascending: true })
        .limit(10);

      await sendNextEarnings(
        chatId,
        (watchlist ?? []).map((w) => ({
          ticker: w.ticker,
          date: formatDate(w.next_earnings_date) ?? 'TBD',
        }))
      );
    } else if (text === '/latest') {
      // Get the latest analysis for any watched ticker
      const { data: watchlist } = await supabase
        .from('watchlist')
        .select('ticker')
        .eq('user_id', userId);

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
      await sendSimpleMessage(
        chatId,
        'Unknown command. Try /watchlist, /next, or /latest'
      );
    }
  } catch (err) {
    console.error('Telegram webhook error:', err);
  }

  return NextResponse.json({ ok: true });
}
