import CompanyCard from './CompanyCard';
import { BarChart2 } from 'lucide-react';
import type { WatchlistItem } from '@/lib/types';

interface Props {
  items: WatchlistItem[];
  onRemove: (ticker: string) => void;
}

export default function WatchlistGrid({ items, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <BarChart2 className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Your watchlist is empty</h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          Search for a company or ticker symbol above to start tracking earnings and receiving AI-powered analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <CompanyCard key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}
