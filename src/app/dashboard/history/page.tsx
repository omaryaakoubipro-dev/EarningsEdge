'use client';

import { useState, useEffect } from 'react';
import HistoryTimeline from '@/components/dashboard/history/HistoryTimeline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { EarningsAnalysis, WatchlistItem } from '@/lib/types';

export default function HistoryPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [analyses, setAnalyses] = useState<EarningsAnalysis[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [wlRes, analysesRes] = await Promise.all([
        fetch('/api/watchlist'),
        fetch('/api/analyses'),
      ]);
      const items: WatchlistItem[] = await wlRes.json();
      const data: EarningsAnalysis[] = await analysesRes.json();
      setWatchlist(Array.isArray(items) ? items : []);
      setAnalyses(Array.isArray(data) ? data : []);
      if (items.length) setSelectedTicker(items[0].ticker);
      setLoading(false);
    }
    load();
  }, []);

  const tickerAnalyses = selectedTicker
    ? analyses.filter((a) => a.ticker === selectedTicker)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">History</h1>
        <p className="text-sm text-gray-400 mt-1">Earnings trends and analysis history by company</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 text-sm animate-pulse">Loading history…</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-lg">No companies on your watchlist yet.</p>
        </div>
      ) : (
        <div className="flex gap-6 flex-col lg:flex-row">
          <aside className="lg:w-48 flex-shrink-0">
            <div className="card p-2 space-y-0.5">
              {watchlist.map((item) => (
                <button
                  key={item.ticker}
                  onClick={() => setSelectedTicker(item.ticker)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTicker === item.ticker
                      ? 'bg-accent/20 text-accent'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.ticker}
                  <span className="block text-xs font-normal text-gray-500 truncate">
                    {item.company_name}
                  </span>
                </button>
              ))}
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            {selectedTicker && (
              <HistoryTimeline
                ticker={selectedTicker}
                companyName={watchlist.find((w) => w.ticker === selectedTicker)?.company_name ?? ''}
                analyses={tickerAnalyses}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
