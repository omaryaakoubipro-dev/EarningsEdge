'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import type { TickerSearchResult } from '@/lib/types';

interface Props {
  onAdd: (ticker: string) => Promise<boolean>;
}

export default function AddTickerSearch({ onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TickerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (q: string) => {
    if (q.length < 1) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/ticker/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim()) {
      debounceRef.current = setTimeout(() => search(query.trim()), 300);
    } else {
      setResults([]);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (symbol: string) => {
    setAdding(symbol);
    setOpen(false);
    const ok = await onAdd(symbol);
    if (ok) {
      setQuery('');
      setResults([]);
    }
    setAdding(null);
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-80">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search ticker or company…"
            className="input pl-9 text-sm"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-bg-secondary border border-bg-border rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50 animate-slide-up">
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => handleSelect(r.symbol)}
              disabled={!!adding}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors text-left group disabled:opacity-50"
            >
              <div>
                <span className="font-mono font-semibold text-white text-sm">{r.symbol}</span>
                <span className="text-gray-400 text-xs ml-2 truncate max-w-[180px] inline-block align-bottom">
                  {r.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{r.exchangeShortName}</span>
                {adding === r.symbol ? (
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 text-gray-500 group-hover:text-accent transition-colors" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length > 0 && !searching && results.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-bg-secondary border border-bg-border rounded-xl shadow-xl shadow-black/50 px-4 py-3 text-sm text-gray-500 z-50">
          No results for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
