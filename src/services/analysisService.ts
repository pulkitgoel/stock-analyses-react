import { Analysis } from '../types/analysis';

const API_BASE = '/api';

export async function fetchAnalyses(): Promise<Analysis[]> {
  const res = await fetch(`${API_BASE}/analyses`);
  if (!res.ok) throw new Error('Failed to fetch analyses');
  const data = await res.json();
  return (data.analyses || []).map((a: Analysis) => ({
    ...a,
    slug: a.slug || a.file.replace('.html', ''),
  }));
}

export async function fetchAnalysisContent(slug: string): Promise<string> {
  const res = await fetch(`/analyses/${slug}.md`);
  if (!res.ok) throw new Error('Content not found');
  return res.text();
}
