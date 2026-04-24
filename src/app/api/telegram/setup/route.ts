import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set in environment variables' }, { status: 500 });
  }

  // Auto-detect app URL from the incoming request if env var not set
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
    ?? new URL(req.url).origin;

  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  // Register the webhook with Telegram
  const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ['message'],
      drop_pending_updates: true,
    }),
  });
  const setData = await setRes.json();

  // Get current webhook info to confirm
  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const infoData = await infoRes.json();

  // Get bot info to confirm token is valid
  const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const meData = await meRes.json();

  return NextResponse.json({
    success: setData.ok,
    webhookUrl,
    setWebhookResult: setData,
    webhookInfo: infoData.result,
    botInfo: meData.result ?? meData,
  });
}
