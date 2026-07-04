import { Analysis } from '../types/analysis';
import { ANALYSES } from '../data/analyses.generated';

// Analysis metadata is generated at build time from the frontmatter in
// public/analyses/*.md (see scripts/generate-analyses-data.js), so the list is
// always in sync with the markdown that actually ships. There is no separate
// hand-maintained array to keep up to date.
export async function fetchAnalyses(): Promise<Analysis[]> {
  return ANALYSES;
}

/** Remove a leading frontmatter block before the markdown is rendered. */
function stripFrontmatter(md: string): string {
  if (!md.startsWith('---')) return md;
  const close = md.indexOf('\n---', 3);
  if (close === -1) return md;
  const afterFence = md.indexOf('\n', close + 1);
  return afterFence === -1 ? '' : md.slice(afterFence + 1).replace(/^\n+/, '');
}

export async function fetchAnalysisContent(slug: string): Promise<string> {
  const res = await fetch(`/analyses/${slug}.md`);
  if (!res.ok) throw new Error('Content not found');
  return stripFrontmatter(await res.text());
}
