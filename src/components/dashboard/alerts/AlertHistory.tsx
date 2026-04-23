import Link from 'next/link';
import { Bell, BellOff } from 'lucide-react';
import VerdictBadge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { AlertHistoryItem } from '@/lib/types';

interface Props {
  alerts: AlertHistoryItem[];
}

const CHANNEL_ICONS: Record<string, string> = {
  telegram: '✈️',
  email: '📧',
};

export default function AlertHistory({ alerts }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-bg-border flex items-center gap-2">
        <Bell className="w-4 h-4 text-gray-400" />
        <h2 className="font-semibold text-white">Notification History</h2>
        <span className="ml-auto text-xs text-gray-500">{alerts.length} alerts</span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <BellOff className="w-8 h-8 mx-auto mb-3 text-gray-600" />
          <p>No alerts sent yet.</p>
          <p className="text-sm mt-1">Alerts appear here once earnings analyses are delivered.</p>
        </div>
      ) : (
        <div className="divide-y divide-bg-border">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
              <span className="text-sm mt-0.5">{CHANNEL_ICONS[alert.channel] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold text-white text-sm">{alert.ticker}</span>
                  <VerdictBadge verdict={alert.verdict} size="sm" />
                  {!alert.delivered && (
                    <span className="text-xs text-miss bg-miss/10 px-1.5 py-0.5 rounded">Failed</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{alert.summary}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs text-gray-500">{formatDate(alert.sent_at, 'MMM d')}</span>
                {alert.analysis_id && (
                  <Link
                    href={`/analysis/${alert.analysis_id}`}
                    className="text-xs text-accent hover:text-accent-hover"
                  >
                    View →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
