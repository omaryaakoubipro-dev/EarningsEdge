'use client';

import { useState, useEffect, useCallback } from 'react';
import WatchlistGrid from '@/components/dashboard/watchlist/WatchlistGrid';
import AddTickerSearch from '@/components/dashboard/watchlist/AddTickerSearch';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { WatchlistItem } from '@/lib/types';

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to load watchlist');
      setItems(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleAdd = async (ticker: string) => {
    setError(null);
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? 'Failed to add ticker');
      return false;
    }
    const newItem = await res.json();
    setItems((prev) => {
      const exists = prev.some((i) => i.ticker === newItem.ticker);
      if (exists) return prev;
      return [newItem, ...prev].sort((a, b) => {
        if (!a.next_earnings_date) return 1;
        if (!b.next_earnings_date) return -1;
        return a.next_earnings_date.localeCompare(b.next_earnings_date);
      });
    });
    return true;
  };

  const handleRemove = async (ticker: string) => {
    const res = await fetch(`/api/watchlist?ticker=${ticker}`, { method: 'DELETE' });
    if (res.ok) setItems((prev) => prev.filter((i) => i.ticker !== ticker));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Watchlist</h1>
          <p className="text-sm text-gray-400 mt-1">
            {items.length} {items.length === 1 ? 'company' : 'companies'} tracked
          </p>
        </div>
        <AddTickerSearch onAdd={handleAdd} />
      </div>

      {error && (
        <div className="bg-miss/10 border border-miss/30 text-miss rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 text-sm animate-pulse">Loading your watchlist…</p>
        </div>
      ) : (
        <WatchlistGrid items={items} onRemove={handleRemove} />
      )}
    </div>
  );
}
