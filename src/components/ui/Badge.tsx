import { cn, verdictBg, verdictLabel } from '@/lib/utils';
import type { Verdict } from '@/lib/types';

interface Props {
  verdict: Verdict | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
}

export default function VerdictBadge({ verdict, size = 'md', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        verdictBg(verdict),
        className
      )}
    >
      {verdictLabel(verdict)}
    </span>
  );
}
