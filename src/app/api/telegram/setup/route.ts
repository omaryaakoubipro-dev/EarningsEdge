import { NextResponse } from 'next/server';

/**
 * GET /api/telegram/setup
 * Visit this URL once in your browser to register the webhook with Telegram.
 * Telegram will then send all bot messages to /api/telegram/webhook automatically.
 */
export async function GET(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set' }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL not set — add your Vercel URL to environment variables' }, { status: 500 });
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  // Register the webhook with Telegram
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ['message'],
      drop_pending_updates: true,
    }),
  });

  const data = await res.json();

  if (data.ok) {
    // Also fetch current webhook info to confirm
    const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const info = await infoRes.json();

    return NextResponse.json({
      success: true,
      message: `Webhook registered successfully!`,
      webhookUrl,
      telegramResponse: data,
      webhookInfo: info.result,
    });
  }

  return NextResponse.json({
    success: false,
    error: data.description ?? 'Failed to set webhook',
    telegramResponse: data,
  }, { status: 500 });
}
