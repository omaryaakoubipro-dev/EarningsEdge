import type { EarningsAnalysis } from '../types';
import { verdictLabel } from '../utils';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://earningsedge.app';

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function telegramPost(method: string, body: object) {
  const res = await fetch(`${TG_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${JSON.stringify(data)}`);
  return data;
}

export async function sendAnalysisAlert(chatId: string, analysis: EarningsAnalysis) {
  const emoji = analysis.verdict === 'beat' ? '🟢' : analysis.verdict === 'miss' ? '🔴' : '🟡';
  const verdict = verdictLabel(analysis.verdict);

  const revenueMetric = analysis.metrics.find((m) => m.name === 'Revenue');
  const epsMetric = analysis.metrics.find((m) => m.name === 'EPS');

  const lines = [
    `${emoji} *${analysis.ticker} — ${verdict}*`,
    `_${analysis.period}_`,
    '',
    `📋 ${escapeMarkdown(analysis.summary)}`,
    '',
    '📊 *Key Metrics*',
    revenueMetric ? `Revenue: ${revenueMetric.reported} _(est. ${revenueMetric.consensus})_` : null,
    epsMetric ? `EPS: ${epsMetric.reported} _(est. ${epsMetric.consensus})_` : null,
    '',
    `⭐ Quality Score: *${analysis.quality_score}/10*`,
    '',
    `[View Full Analysis →](${APP_URL}/analysis/${analysis.id})`,
  ].filter(Boolean).join('\n');

  await telegramPost('sendMessage', {
    chat_id: chatId,
    text: lines,
    parse_mode: 'Markdown',
    disable_web_page_preview: false,
  });
}

export async function sendWatchlistMessage(chatId: string, items: { ticker: string; nextEarnings: string | null }[]) {
  if (!items.length) {
    await telegramPost('sendMessage', {
      chat_id: chatId,
      text: '📋 Your watchlist is empty. Add tickers at ' + APP_URL,
    });
    return;
  }

  const lines = ['📋 *Your Watchlist*', ''];
  for (const item of items.slice(0, 20)) {
    const date = item.nextEarnings ? `📅 ${item.nextEarnings}` : '📅 TBD';
    lines.push(`• *${item.ticker}* — ${date}`);
  }
  lines.push('', `[Open Dashboard →](${APP_URL}/dashboard)`);

  await telegramPost('sendMessage', {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  });
}

export async function sendNextEarnings(chatId: string, items: { ticker: string; date: string }[]) {
  if (!items.length) {
    await telegramPost('sendMessage', { chat_id: chatId, text: 'No upcoming earnings in your watchlist.' });
    return;
  }
  const lines = ['🗓 *Upcoming Earnings*', ''];
  items.slice(0, 10).forEach((item) => lines.push(`• *${item.ticker}* — ${item.date}`));
  lines.push('', `[View Calendar →](${APP_URL}/dashboard/calendar)`);

  await telegramPost('sendMessage', {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  });
}

export async function sendLatestAnalysis(chatId: string, analysis: EarningsAnalysis | null) {
  if (!analysis) {
    await telegramPost('sendMessage', { chat_id: chatId, text: 'No analyses yet for your watchlist.' });
    return;
  }
  await sendAnalysisAlert(chatId, analysis);
}

export async function sendSimpleMessage(chatId: string, text: string) {
  await telegramPost('sendMessage', { chat_id: chatId, text });
}

export async function setWebhook(webhookUrl: string) {
  return telegramPost('setWebhook', { url: webhookUrl });
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
