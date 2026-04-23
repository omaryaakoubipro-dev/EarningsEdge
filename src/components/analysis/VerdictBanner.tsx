import { cn, verdictBg, verdictLabel } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Verdict } from '@/lib/types';

interface Props {
  verdict: Verdict;
  summary: string;
}

const VERDICT_ICONS = {
  beat: TrendingUp,
  miss: TrendingDown,
  inline: Minus,
};

export default function VerdictBanner({ verdict, summary }: Props) {
  const Icon = VERDICT_ICONS[verdict];

  return (
    <div
      className={cn(
        'rounded-xl border px-6 py-5 flex items-start gap-4',
        verdictBg(verdict)
      )}
    >
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
        verdict === 'beat' ? 'bg-beat/20' :
        verdict === 'miss' ? 'bg-miss/20' : 'bg-inline/20'
      )}>
        <Icon className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold">{verdictLabel(verdict)}</span>
        </div>
        <p className="text-sm leading-relaxed opacity-90">{summary}</p>
      </div>
    </div>
  );
}
