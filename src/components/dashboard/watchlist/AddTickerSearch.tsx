'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface Props {
  onAdd: (ticker: string) => Promise<boolean>;
}

export default function AddTickerSearch({ onAdd }: Props) {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) return;

    setLoading(true);
    setError(null);
    const ok = await onAdd(symbol);
    if (ok) {
      setTicker('');
    } else {
      setError(`Could not find "${symbol}"`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            value={ticker}
            onChange={(e) => { setTicker(e.target.value.toUpperCase()); setError(null); }}
            placeholder="Enter ticker (e.g. AAPL)"
            className="input w-56 font-mono uppercase text-sm pr-3"
            maxLength={10}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !ticker.trim()}
          className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {loading ? 'Adding…' : 'Add'}
        </button>
      </div>
      {error && <p className="text-xs text-miss">{error}</p>}
    </form>
  );
}
