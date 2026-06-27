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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {/* Search input — icon is a separate non-overlapping region */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          height: '48px',
        }}
        onFocus={() => {/* handled on input */}}
      >
        {/* Icon zone — visually separated, never overlaps text */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            flexShrink: 0,
            color: 'var(--text-dim)',
          }}
        >
          <Search size={17} />
        </span>

        {/* Divider */}
        <span
          style={{
            width: '1px',
            alignSelf: 'stretch',
            background: 'var(--border)',
            flexShrink: 0,
            margin: '10px 0',
          }}
        />

        {/* Text input */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by stock, ticker, sector, tag..."
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            paddingLeft: '14px',
            paddingRight: '14px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text)',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            const wrap = e.currentTarget.closest('div') as HTMLElement;
            if (wrap) wrap.style.borderColor = 'var(--accent)';
          }}
          onBlur={(e) => {
            const wrap = e.currentTarget.closest('div') as HTMLElement;
            if (wrap) wrap.style.borderColor = 'var(--border)';
          }}
        />
      </div>

      {/* Sort toggle — three separate pill buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          Sort by:
        </span>
        {modes.map(({ key, label }) => {
          const active = sortMode === key;
          return (
            <button
              key={key}
              onClick={() => onSortChange(key)}
              style={{
                height: '32px',
                padding: '0 14px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                color: active ? 'var(--accent-contrast)' : 'var(--text-muted)',
                transition: 'all 180ms ease',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
