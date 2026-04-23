import { TrendingUp, TrendingDown } from 'lucide-react';
import type { WhatStoodOut as WhatStoodOutType } from '@/lib/types';

interface Props {
  whatStoodOut: WhatStoodOutType;
}

export default function WhatStoodOut({ whatStoodOut }: Props) {
  const { positives = [], negatives = [] } = whatStoodOut ?? {};
  if (!positives.length && !negatives.length) return null;

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-white mb-4">What Stood Out</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {positives.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-beat text-xs font-medium uppercase tracking-wide mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Positives
            </div>
            {positives.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-beat mt-1 flex-shrink-0">+</span>
                <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        )}

        {negatives.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-miss text-xs font-medium uppercase tracking-wide mb-2">
              <TrendingDown className="w-3.5 h-3.5" />
              Concerns
            </div>
            {negatives.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-miss mt-1 flex-shrink-0">−</span>
                <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
