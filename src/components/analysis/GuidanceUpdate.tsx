import { ArrowUpCircle, ArrowDownCircle, MinusCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GuidanceUpdate as GuidanceType } from '@/lib/types';

interface Props {
  guidance: GuidanceType;
}

const ACTION_CONFIG = {
  raised: { icon: ArrowUpCircle, color: 'text-beat', bg: 'bg-beat/10', label: 'Guidance Raised' },
  maintained: { icon: MinusCircle, color: 'text-inline', bg: 'bg-inline/10', label: 'Guidance Maintained' },
  lowered: { icon: ArrowDownCircle, color: 'text-miss', bg: 'bg-miss/10', label: 'Guidance Lowered' },
  withdrawn: { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-800', label: 'Guidance Withdrawn' },
  none: { icon: MinusCircle, color: 'text-gray-400', bg: 'bg-gray-800', label: 'No Guidance Provided' },
};

export default function GuidanceUpdate({ guidance }: Props) {
  if (!guidance) return null;

  const config = ACTION_CONFIG[guidance.action] ?? ACTION_CONFIG.none;
  const Icon = config.icon;

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-white mb-4">Guidance Update</h2>

      <div className={cn('flex items-center gap-3 rounded-lg px-4 py-3 mb-4', config.bg)}>
        <Icon className={cn('w-5 h-5 flex-shrink-0', config.color)} />
        <span className={cn('font-semibold text-sm', config.color)}>{config.label}</span>
      </div>

      {guidance.details && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Management View</p>
          <p className="text-sm text-gray-300 leading-relaxed">{guidance.details}</p>
        </div>
      )}

      {guidance.vsExpectations && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">vs. Street Consensus</p>
          <p className="text-sm text-gray-300 leading-relaxed">{guidance.vsExpectations}</p>
        </div>
      )}
    </div>
  );
}
