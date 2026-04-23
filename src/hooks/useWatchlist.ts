'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WatchlistItem } from '@/lib/types';

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await globalThis.fetch('/api/watchlist');
      if (!res.ok) throw new Error('Failed to load watchlist');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const add = useCallback(async (ticker: string): Promise<boolean> => {
    const res = await globalThis.fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
    });
    if (!res.ok) return false;
    const newItem = await res.json();
    setItems((prev) => {
      const exists = prev.some((i) => i.ticker === newItem.ticker);
      if (exists) return prev;
      return [...prev, newItem].sort((a, b) => {
        if (!a.next_earnings_date) return 1;
        if (!b.next_earnings_date) return -1;
        return a.next_earnings_date.localeCompare(b.next_earnings_date);
      });
    });
    return true;
  }, []);

  const remove = useCallback(async (ticker: string) => {
    const res = await globalThis.fetch(`/api/watchlist?ticker=${ticker}`, { method: 'DELETE' });
    if (res.ok) setItems((prev) => prev.filter((i) => i.ticker !== ticker));
  }, []);

  return { items, loading, error, refresh: fetch, add, remove };
}
