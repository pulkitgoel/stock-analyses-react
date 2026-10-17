import { Analysis } from '../types/analysis';
import { ANALYSES } from '../data/analyses.generated';

// Analysis metadata is generated at build time from the frontmatter in
// public/analyses/*.md (see scripts/generate-analyses-data.js), so the list is
// always in sync with the markdown that actually ships. There is no separate
// hand-maintained array to keep up to date.
//
// It is compiled into the bundle, so reading it is synchronous and must stay
// that way. This was `async fetchAnalyses()`, and every listing page gated its
// first render on the resulting promise: `if (loading) return <LoadingSpinner />`.
// Since the app mounts with createRoot, React discards the prerendered markup
// (AGENTS.md 7.1), so the first client paint replaced a complete page with a
// spinner and the second painted it back — the whole document collapsed and
// re-expanded for one microtask. That is what PageSpeed measured as CLS 0.71 on
// the mobile homepage, billed to `<footer>` because the footer is the largest
// box that moved (AGENTS.md 7.9). A promise around a constant bought nothing
// and cost the worst number on the site, so there is deliberately no async
// accessor here to fall back into.
export function getAnalyses(): Analysis[] {
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
