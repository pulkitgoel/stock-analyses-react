import { useState, useMemo } from 'react';
import { Analysis } from '../types/analysis';

export type SortMode = 'newest' | 'oldest' | 'alpha';

export function useSearch(analyses: Analysis[]) {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const filtered = useMemo(() => {
    let result = [...analyses];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.ticker.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        (a.summary || '').toLowerCase().includes(q)
      );
    }

    if (sortMode === 'newest') result.sort((a, b) => b.date.localeCompare(a.date));
    else if (sortMode === 'oldest') result.sort((a, b) => a.date.localeCompare(b.date));
    else if (sortMode === 'alpha') result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [analyses, query, sortMode]);

  return { query, setQuery, sortMode, setSortMode, filtered };
}
