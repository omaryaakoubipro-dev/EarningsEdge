'use client';

import { useState, useEffect } from 'react';
import EarningsCalendar from '@/components/dashboard/calendar/EarningsCalendar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { WatchlistItem } from '@/lib/types';

export default function CalendarPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/watchlist')
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Earnings Calendar</h1>
        <p className="text-sm text-gray-400 mt-1">
          Upcoming earnings dates for your watchlist
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 text-sm animate-pulse">Loading calendar…</p>
        </div>
      ) : (
        <EarningsCalendar items={items} />
      )}
    </div>
  );
}
