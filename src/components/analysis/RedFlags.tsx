import { AlertTriangle } from 'lucide-react';

interface Props {
  flags: string[];
}

export default function RedFlags({ flags }: Props) {
  if (!flags?.length) return null;

  return (
    <div className="card p-5 border-miss/20">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-miss" />
        <h2 className="font-semibold text-white">Red Flags</h2>
        <span className="ml-auto text-xs bg-miss/10 text-miss px-2 py-0.5 rounded-full font-medium">
          {flags.length}
        </span>
      </div>

      <ul className="space-y-2.5">
        {flags.map((flag, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="text-miss text-xs mt-1 flex-shrink-0">⚑</span>
            <p className="text-sm text-gray-300 leading-relaxed">{flag}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
