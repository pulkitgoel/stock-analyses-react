import { useState, useMemo } from 'react';
import { Analysis } from '../types/analysis';
import { Category, getCategory } from '../utils/category';

export type SortMode = 'newest' | 'oldest' | 'alpha';

export function useSearch(analyses: Analysis[]) {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [category, setCategory] = useState<Category>('all');

  const counts = useMemo(() => {
    let stocks = 0;
    let policy = 0;
    for (const a of analyses) {
      if (getCategory(a) === 'policy') policy++;
      else stocks++;
    }
    return { all: analyses.length, stocks, policy };
  }, [analyses]);

  const filtered = useMemo(() => {
    let result = [...analyses];

    if (category !== 'all') {
      result = result.filter((a) => getCategory(a) === category);
    }

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
  }, [analyses, query, sortMode, category]);

  return { query, setQuery, sortMode, setSortMode, category, setCategory, counts, filtered };
}
