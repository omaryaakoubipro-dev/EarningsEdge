import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisMetric } from '@/lib/types';

interface Props {
  metrics: AnalysisMetric[];
}

export default function MetricsTable({ metrics }: Props) {
  if (!metrics?.length) return null;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-bg-border">
        <h2 className="font-semibold text-white">Key Metrics</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bg-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Metric</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Reported</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Consensus</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Year-Ago</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-border">
            {metrics.map((metric) => (
              <tr key={metric.name} className="hover:bg-white/2 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-200">{metric.name}</td>
                <td className={cn(
                  'px-5 py-3 text-right font-mono font-semibold',
                  metric.beat === true ? 'text-beat' :
                  metric.beat === false ? 'text-miss' : 'text-white'
                )}>
                  {metric.reported || '—'}
                </td>
                <td className="px-5 py-3 text-right font-mono text-gray-400">
                  {metric.consensus || '—'}
                </td>
                <td className="px-5 py-3 text-right font-mono text-gray-500">
                  {metric.yearAgo || '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  {metric.beat === true ? (
                    <Check className="w-4 h-4 text-beat inline-block" />
                  ) : metric.beat === false ? (
                    <X className="w-4 h-4 text-miss inline-block" />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
