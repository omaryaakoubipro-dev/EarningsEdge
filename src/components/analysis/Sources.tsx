import { ExternalLink, FileText, Globe, BarChart2 } from 'lucide-react';
import type { AnalysisSource } from '@/lib/types';

interface Props {
  sources: AnalysisSource[];
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  press_release: FileText,
  sec_filing: FileText,
  analyst: BarChart2,
  news: Globe,
  other: Globe,
};

const TYPE_LABELS: Record<string, string> = {
  press_release: 'Press Release',
  sec_filing: 'SEC Filing',
  analyst: 'Analyst Note',
  news: 'News',
  other: 'Source',
};

export default function Sources({ sources }: Props) {
  if (!sources?.length) return null;

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
        <ExternalLink className="w-4 h-4 text-gray-400" />
        Sources
      </h2>
      <ul className="space-y-2.5">
        {sources.map((source, i) => {
          const Icon = TYPE_ICONS[source.type] ?? Globe;
          return (
            <li key={i}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 group hover:bg-white/3 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 group-hover:text-white transition-colors leading-relaxed truncate">
                    {source.title}
                  </p>
                  <p className="text-xs text-gray-600">{TYPE_LABELS[source.type] ?? 'Source'}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-accent transition-colors flex-shrink-0 mt-0.5" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
