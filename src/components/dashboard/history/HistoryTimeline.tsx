'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import VerdictBadge from '@/components/ui/Badge';
import MetricsChart from './MetricsChart';
import { formatDate, qualityScoreColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { EarningsAnalysis } from '@/lib/types';

interface Props {
  ticker: string;
  companyName: string;
  analyses: EarningsAnalysis[];
}

export default function HistoryTimeline({ ticker, companyName, analyses }: Props) {
  if (!analyses.length) {
    return (
      <div className="card p-12 text-center text-gray-400">
        <p className="text-lg font-medium text-white mb-2">{ticker}</p>
        <p className="text-sm">No analyses yet. They appear here after earnings are reported.</p>
      </div>
    );
  }

  const beatCount = analyses.filter((a) => a.verdict === 'beat').length;
  const missCount = analyses.filter((a) => a.verdict === 'miss').length;
  const beatRate = Math.round((beatCount / analyses.length) * 100);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{ticker}</h2>
            <p className="text-sm text-gray-400">{companyName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{beatRate}%</p>
            <p className="text-xs text-gray-400">Beat rate</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Total Reports', value: analyses.length, color: 'text-white' },
            { label: 'Beats', value: beatCount, color: 'text-beat' },
            { label: 'Misses', value: missCount, color: 'text-miss' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={cn('text-xl font-bold', color)}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <MetricsChart analyses={analyses} />
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300 px-1">Earnings History</h3>
        {analyses.map((analysis, i) => (
          <Link
            key={analysis.id}
            href={`/analysis/${analysis.id}`}
            className="card p-4 flex items-start gap-4 hover:border-gray-600 transition-all group"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center flex-shrink-0 mt-1">
              <div className={cn(
                'w-3 h-3 rounded-full flex-shrink-0',
                analysis.verdict === 'beat' ? 'bg-beat' :
                analysis.verdict === 'miss' ? 'bg-miss' : 'bg-inline'
              )} />
              {i < analyses.length - 1 && (
                <div className="w-px flex-1 bg-bg-border mt-1 min-h-[20px]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-white">{analysis.period}</span>
                <VerdictBadge verdict={analysis.verdict} size="sm" />
                <span className={cn('text-xs font-medium ml-auto', qualityScoreColor(analysis.quality_score))}>
                  Q-Score: {analysis.quality_score}/10
                </span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{analysis.summary}</p>
              <p className="text-xs text-gray-600 mt-1.5">{formatDate(analysis.report_date)}</p>
            </div>

            <span className="text-xs text-accent group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
