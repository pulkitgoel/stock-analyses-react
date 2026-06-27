import { X } from 'lucide-react';

interface TagPillsProps {
  allTags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagPills({ allTags, activeTags, onToggle }: TagPillsProps) {
  const tagCounts = allTags.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 18);

  const clearTags = () => {
    activeTags.forEach(t => onToggle(t));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {activeTags.length > 0 && (
        <button
          onClick={clearTags}
          className="focus-ring flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all"
          style={{
            background: 'var(--surface-soft)',
            border: '1px solid var(--border-light)',
            color: 'var(--text)',
          }}
        >
          <X size={13} /> Clear
        </button>
      )}
      {sortedTags.map(([tag, count]) => {
        const active = activeTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className="focus-ring flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold whitespace-nowrap transition-all duration-200"
            style={{
              background: active ? 'var(--accent)' : 'var(--bg-elevated)',
              border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
              color: active ? 'var(--accent-contrast)' : 'var(--text-muted)',
            }}
          >
            {tag}
            <span
              className="rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold leading-none"
              style={{
                background: active ? 'rgba(0,0,0,0.18)' : 'var(--surface-soft)',
                color: active ? 'var(--accent-contrast)' : 'var(--text-dim)',
              }}
            >{count}</span>
          </button>
        );
      })}
    </div>
  );
}
