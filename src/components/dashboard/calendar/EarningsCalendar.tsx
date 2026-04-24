'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import VerdictBadge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { WatchlistItem } from '@/lib/types';

interface Props {
  items: WatchlistItem[];
}

export default function EarningsCalendar({ items }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad with leading empty slots to align day-of-week
  const startDOW = monthStart.getDay(); // 0=Sun
  const leadingDays = Array(startDOW).fill(null);

  const earningsMap = new Map<string, WatchlistItem[]>();
  for (const item of items) {
    if (item.next_earnings_date) {
      const key = item.next_earnings_date;
      if (!earningsMap.has(key)) earningsMap.set(key, []);
      earningsMap.get(key)!.push(item);
    }
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-white">{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 border-b border-bg-border">
        {DOW_LABELS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Leading empty cells */}
        {leadingDays.map((_, i) => (
          <div key={`lead-${i}`} className="border-r border-b border-bg-border min-h-[100px] p-2 bg-bg-primary/30" />
        ))}

        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const events = earningsMap.get(key) ?? [];
          const today = isToday(day);

          return (
            <div
              key={key}
              className={cn(
                'border-r border-b border-bg-border min-h-[100px] p-2 transition-colors',
                today ? 'bg-accent/5' : 'hover:bg-white/2'
              )}
            >
              {/* Day number */}
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium mb-1',
                today ? 'bg-accent text-white' : 'text-gray-400'
              )}>
                {format(day, 'd')}
              </div>

              {/* Earnings events */}
              <div className="space-y-1">
                {events.map((item) => (
                  <div
                    key={item.ticker}
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded font-mono font-semibold truncate',
                      item.last_verdict === 'beat' ? 'bg-beat/20 text-beat' :
                      item.last_verdict === 'miss' ? 'bg-miss/20 text-miss' :
                      item.last_verdict === 'inline' ? 'bg-inline/20 text-inline' :
                      'bg-accent/20 text-accent'
                    )}
                    title={item.company_name}
                  >
                    {item.ticker}
                  </div>
                ))}
                {events.length > 2 && (
                  <div className="text-xs text-gray-500 pl-1">+{events.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-bg-border flex flex-wrap gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-beat" /> Beat
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-miss" /> Miss
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-inline" /> Inline
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent" /> Upcoming
        </span>
      </div>
    </div>
  );
}
