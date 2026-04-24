'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, TrendingUp, TrendingDown, Clock, CalendarDays } from 'lucide-react';
import VerdictBadge from '@/components/ui/Badge';
import { formatCurrency, formatPercent, daysUntilEarnings, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { WatchlistItem } from '@/lib/types';

interface Props {
  item: WatchlistItem;
  onRemove: (ticker: string) => void;
}

export default function CompanyCard({ item, onRemove }: Props) {
  const priceUp = (item.price_change ?? 0) >= 0;
  const daysLabel = daysUntilEarnings(item.next_earnings_date);
  const earningsSoon = item.next_earnings_date && daysLabel !== 'Reported';

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(item.ticker);
  };

  return (
    <div className="card hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/30 group animate-slide-up relative overflow-hidden">
      {/* Verdict accent bar */}
      {item.last_verdict && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-0.5',
            item.last_verdict === 'beat' ? 'bg-beat' :
            item.last_verdict === 'miss' ? 'bg-miss' : 'bg-inline'
          )}
        />
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {item.logo_url ? (
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                <Image
                  src={item.logo_url}
                  alt={item.ticker}
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent text-xs font-bold">{item.ticker.slice(0, 2)}</span>
              </div>
            )}
            <div>
              <p className="font-mono font-bold text-white text-base">{item.ticker}</p>
              <p className="text-xs text-gray-400 truncate max-w-[120px]">{item.company_name}</p>
            </div>
          </div>

          <button
            onClick={handleRemove}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-miss/20 hover:text-miss text-gray-500"
            title="Remove from watchlist"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-2xl font-semibold text-white">
              {item.current_price != null ? `$${item.current_price.toFixed(2)}` : '—'}
            </p>
            {item.price_change != null && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', priceUp ? 'text-beat' : 'text-miss')}>
                {priceUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercent(item.price_change_pct ? item.price_change_pct / 100 : null)}
              </div>
            )}
          </div>
          {item.last_verdict && (
            <VerdictBadge verdict={item.last_verdict} size="sm" />
          )}
        </div>

        {/* Footer — earnings dates */}
        <div className="pt-4 border-t border-bg-border space-y-1.5">
          {item.last_report_date && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Last reported: {formatDate(item.last_report_date)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {item.next_earnings_date
                  ? `Next earnings: ${daysLabel}`
                  : 'Next earnings: TBD'}
              </span>
            </div>
            {item.last_analysis_id && (
              <Link
                href={`/analysis/${item.last_analysis_id}`}
                className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
              >
                View analysis →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
