import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, format, parseISO } from 'date-fns';
import type { Verdict } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined, compact = true): string {
  if (value == null) return '—';
  if (compact) {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '—';
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export function daysUntilEarnings(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  const days = differenceInDays(parseISO(dateStr), new Date());
  if (days < 0) return 'Reported';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days}d`;
}

export function formatDate(dateStr: string | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function verdictColor(verdict: Verdict | null | undefined): string {
  switch (verdict) {
    case 'beat': return 'text-beat';
    case 'miss': return 'text-miss';
    case 'inline': return 'text-inline';
    default: return 'text-gray-400';
  }
}

export function verdictBg(verdict: Verdict | null | undefined): string {
  switch (verdict) {
    case 'beat': return 'bg-beat/10 text-beat border-beat/30';
    case 'miss': return 'bg-miss/10 text-miss border-miss/30';
    case 'inline': return 'bg-inline/10 text-inline border-inline/30';
    default: return 'bg-gray-800 text-gray-400 border-gray-700';
  }
}

export function verdictLabel(verdict: Verdict | null | undefined): string {
  switch (verdict) {
    case 'beat': return 'Beat';
    case 'miss': return 'Miss';
    case 'inline': return 'Inline';
    default: return 'Pending';
  }
}

export function qualityScoreColor(score: number): string {
  if (score >= 8) return 'text-beat';
  if (score >= 6) return 'text-inline';
  return 'text-miss';
}

export function quarterLabel(fiscal_year: number, fiscal_quarter: number): string {
  return `Q${fiscal_quarter} FY${fiscal_year}`;
}
