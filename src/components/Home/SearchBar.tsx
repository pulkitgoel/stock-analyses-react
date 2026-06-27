import { Search } from 'lucide-react';
import { SortMode } from '../../hooks/useSearch';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}

const modes: { key: SortMode; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'alpha', label: 'A–Z' },
];

export default function SearchBar({ query, onQueryChange, sortMode, onSortChange }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
      <div className="relative flex-1">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search stocks, tickers, tags..."
          className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm outline-none transition-all"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      </div>
      <div className="flex gap-1.5">
        {modes.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSortChange(key)}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-all border"
            style={{
              background: sortMode === key ? 'var(--accent-glow)' : 'transparent',
              borderColor: sortMode === key ? 'var(--accent)' : 'var(--border)',
              color: sortMode === key ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
