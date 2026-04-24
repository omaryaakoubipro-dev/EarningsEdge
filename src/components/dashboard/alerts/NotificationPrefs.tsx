'use client';

import { useState } from 'react';
import { Send, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserPreferences } from '@/lib/types';

interface Props {
  prefs: Partial<UserPreferences>;
  onUpdate: (updates: Partial<UserPreferences>) => Promise<boolean>;
}

export default function NotificationPrefs({ prefs, onUpdate }: Props) {
  const [chatId, setChatId] = useState(prefs.telegram_chat_id ?? '');
  const [telegramEnabled, setTelegramEnabled] = useState(prefs.telegram_enabled ?? false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const ok = await onUpdate({
        telegram_chat_id: chatId || null,
        telegram_enabled: telegramEnabled,
      });
      setStatus(ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const BOT_URL = 'https://t.me/earnings_edge_bot';

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-5">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-accent" />
          Telegram Alerts
        </h2>

        {/* Setup instructions */}
        <div className="bg-bg-secondary rounded-lg p-4 space-y-2 text-sm text-gray-300">
          <p className="font-medium text-white text-xs uppercase tracking-wide text-gray-400 mb-2">
            Setup Instructions
          </p>
          <ol className="space-y-2 text-sm list-decimal list-inside text-gray-300">
            <li>
              <a
                href={BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover inline-flex items-center gap-1"
              >
                Open EarningsEdge Bot <ExternalLink className="w-3 h-3" />
              </a>
              {' '}on Telegram
            </li>
            <li>Send the bot the message <code className="font-mono text-xs bg-bg-primary px-1.5 py-0.5 rounded">/start</code></li>
            <li>Copy your Chat ID from the bot's reply</li>
            <li>Paste it below and save</li>
          </ol>
        </div>

        {/* Chat ID input */}
        <div>
          <label className="label">Your Telegram Chat ID</label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="e.g. 123456789"
            className="input font-mono"
          />
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-200">Enable Telegram notifications</p>
            <p className="text-xs text-gray-500 mt-0.5">Receive alerts when earnings are analyzed</p>
          </div>
          <button
            role="switch"
            aria-checked={telegramEnabled}
            onClick={() => setTelegramEnabled(!telegramEnabled)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200',
              telegramEnabled ? 'bg-accent' : 'bg-gray-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                telegramEnabled ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || status !== 'idle'}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 disabled:cursor-not-allowed',
            status === 'saved'
              ? 'bg-beat/20 text-beat border border-beat/40'
              : status === 'error'
              ? 'bg-miss/20 text-miss border border-miss/40'
              : 'bg-accent hover:bg-accent-hover text-white disabled:opacity-50'
          )}
        >
          {status === 'saved' ? (
            <span className="flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              Saved — you'll receive alerts on Telegram
            </span>
          ) : status === 'error' ? (
            <span className="flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4" />
              Failed to save — check Vercel logs
            </span>
          ) : saving ? (
            'Saving…'
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>

      {/* Bot commands reference */}
      <div className="card p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Bot Commands</p>
        <div className="space-y-2">
          {[
            { cmd: '/watchlist', desc: 'Show your watchlist' },
            { cmd: '/next', desc: 'Next upcoming earnings' },
            { cmd: '/latest', desc: 'Latest analysis' },
          ].map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-center justify-between">
              <code className="font-mono text-xs text-accent">{cmd}</code>
              <span className="text-xs text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
