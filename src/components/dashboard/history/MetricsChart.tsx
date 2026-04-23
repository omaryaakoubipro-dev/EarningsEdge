'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { EarningsAnalysis } from '@/lib/types';

interface Props {
  analyses: EarningsAnalysis[];
}

interface ChartPoint {
  period: string;
  revenue: number | null;
  eps: number | null;
  qualityScore: number;
}

function parseValue(value: string | undefined | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[$,B|M|K|%+]/g, '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  if (value.includes('B')) return num * 1e9;
  if (value.includes('M')) return num * 1e6;
  if (value.includes('K')) return num * 1e3;
  return num;
}

const VERDICT_COLORS = { beat: '#10B981', miss: '#EF4444', inline: '#F59E0B' };

export default function MetricsChart({ analyses }: Props) {
  const chartData: ChartPoint[] = [...analyses]
    .sort((a, b) => (a.report_date ?? '').localeCompare(b.report_date ?? ''))
    .map((a) => {
      const rev = a.metrics?.find((m) => m.name === 'Revenue');
      const eps = a.metrics?.find((m) => m.name === 'EPS');
      return {
        period: a.period,
        revenue: rev?.reported ? parseValue(rev.reported) : null,
        eps: eps?.reported ? parseValue(eps.reported) : null,
        qualityScore: a.quality_score,
      };
    });

  if (!chartData.length) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
        No chart data available yet
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-bg-secondary border border-bg-border rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="font-semibold text-white mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.name === 'Quality' ? `${p.value}/10` : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-300">Quality Score Over Time</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="period" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={7} stroke="#374151" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="qualityScore"
            name="Quality"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
