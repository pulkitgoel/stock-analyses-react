import { X } from 'lucide-react';

interface TagPillsProps {
  allTags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

const tagIcons: Record<string, string> = {
  fundamental: '📊', technical: '📈', earnings: '💰',
  concall: '🎙️', 'deep-dive': '🔍', 'us-stocks': '🇺🇸',
  'market-analysis': '📉', 'fii-dii': '🏛️', 'institutional-gems': '💎',
  'ai': '🤖', 'defense': '🛡️', 'it-sector': '💻',
  'retail': '🛍️', 'construction': '🏗️', 'infrastructure': '🏗️',
  'crash': '⚠️', 'global': '🌍', 'valuation': '💰',
};

export default function TagPills({ allTags, activeTags, onToggle }: TagPillsProps) {
  // Count occurrences and get unique tags sorted by frequency
  const tagCounts = allTags.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag]) => tag);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1" style={{ scrollbarWidth: 'none' }}>
      {activeTags.length > 0 && (
        <button
          onClick={() => activeTags.forEach(t => onToggle(t))}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[0.6rem] sm:text-xs font-medium whitespace-nowrap transition-all border shrink-0"
          style={{
            background: 'var(--accent-glow)',
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
          }}
        >
          <X size={10} /> Clear
        </button>
      )}
      {sortedTags.map((tag) => {
        const active = activeTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className="px-2.5 sm:px-3 py-1 rounded-full text-[0.55rem] sm:text-xs font-medium whitespace-nowrap transition-all border shrink-0"
            style={{
              background: active ? 'var(--accent)' : 'transparent',
              borderColor: active ? 'var(--accent)' : 'var(--border)',
              color: active ? '#fff' : 'var(--text-muted)',
            }}
          >
            {tagIcons[tag] || '📌'} {tag}
          </button>
        );
      })}
    </div>
  );
}
