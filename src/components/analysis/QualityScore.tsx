import { cn, qualityScoreColor } from '@/lib/utils';

interface Props {
  score: number;
}

const SCORE_LABELS: Record<string, string> = {
  '9-10': 'Exceptional',
  '7-8': 'High Quality',
  '5-6': 'Average',
  '3-4': 'Below Average',
  '0-2': 'Poor',
};

function getLabel(score: number): string {
  if (score >= 9) return 'Exceptional';
  if (score >= 7) return 'High Quality';
  if (score >= 5) return 'Average';
  if (score >= 3) return 'Below Average';
  return 'Poor';
}

const QUALITY_FACTORS = [
  'Earnings quality',
  'FCF vs net income',
  'Guidance visibility',
  'Balance sheet health',
  'Absence of red flags',
];

export default function QualityScore({ score }: Props) {
  const pct = (score / 10) * 100;
  const color = qualityScoreColor(score);
  const label = getLabel(score);

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-white mb-4">Quality Score</h2>

      {/* Score display */}
      <div className="text-center mb-5">
        <div className={cn('text-5xl font-bold tabular-nums', color)}>
          {score.toFixed(1)}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          out of 10 — <span className={cn('font-medium', color)}>{label}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-bg-secondary rounded-full overflow-hidden mb-5">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            score >= 7 ? 'bg-beat' : score >= 5 ? 'bg-inline' : 'bg-miss'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Factor breakdown */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Based on</p>
        <ul className="space-y-1.5">
          {QUALITY_FACTORS.map((factor) => (
            <li key={factor} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
              {factor}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
