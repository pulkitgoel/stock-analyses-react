import { Layers, LineChart, Landmark } from 'lucide-react';
import { Category } from '../../utils/category';

interface CategoryTabsProps {
  category: Category;
  onCategoryChange: (c: Category) => void;
  counts: { all: number; stocks: number; policy: number };
}

const tabs: { key: Category; label: string; Icon: typeof Layers; countKey: 'all' | 'stocks' | 'policy' }[] = [
  { key: 'all', label: 'All', Icon: Layers, countKey: 'all' },
  { key: 'stocks', label: 'Stock Research', Icon: LineChart, countKey: 'stocks' },
  { key: 'policy', label: 'Policy Pulse', Icon: Landmark, countKey: 'policy' },
];

export default function CategoryTabs({ category, onCategoryChange, counts }: CategoryTabsProps) {
  return (
    <div role="tablist" aria-label="Filter by category" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {tabs.map(({ key, label, Icon, countKey }) => {
        const active = category === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onCategoryChange(key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '40px',
              padding: '0 16px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: active ? 'var(--accent)' : 'var(--bg-elevated)',
              color: active ? 'var(--accent-contrast)' : 'var(--text-muted)',
              transition: 'all 180ms ease',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={15} />
            {label}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '22px',
                height: '20px',
                padding: '0 6px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 900,
                background: active ? 'rgba(0,0,0,0.18)' : 'var(--surface-soft)',
                color: active ? 'var(--accent-contrast)' : 'var(--text-dim)',
              }}
            >
              {counts[countKey]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
