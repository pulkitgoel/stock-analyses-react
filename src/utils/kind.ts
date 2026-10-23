import { Analysis } from '../types/analysis';

/**
 * What a piece of work is: long-form `research`, or a `pulse` daily note.
 *
 * This is the axis a reader picks first — a briefing on what just happened, or
 * a piece of work on one company. `market` (india/global, see market.ts) is the
 * second question, and until now it was the only one the routing answered, so
 * /india and /global each served a daily note beside a 2,600-word deep dive
 * with nothing but the card to tell them apart.
 *
 * The two families are also wildly unequal: Policy Pulse is roughly 235 of 294
 * articles and drew one top-15 page in the 92-day baseline, against the deep
 * dives taking essentially all of it (AGENTS.md 7.3). Separate sections let
 * each build its own signal.
 *
 * Derived at build time by scripts/lib/kind.js and written onto each article as
 * `kind`, so the sitemap, the prerender and the app read one value. Nothing
 * here re-derives it; `kindOf` only falls back when the field is missing, which
 * can happen for a tree built before this landed.
 */
export type ArticleKind = 'research' | 'pulse';

export const KINDS: ArticleKind[] = ['research', 'pulse'];

export const KIND_LABEL: Record<ArticleKind, string> = {
  research: 'Research',
  pulse: 'Daily Pulse',
};

export const KIND_HEADING: Record<ArticleKind, string> = {
  research: 'Stock research',
  pulse: 'Daily Pulse',
};

export const KIND_BLURB: Record<ArticleKind, string> = {
  research: 'Deep dives on single companies — delivery data, promoter trends, quarterly results and the valuation case, written to stand on their own.',
  pulse: 'The daily note on what Delhi and Washington did, and which tickers it moves. Four editions a day, each with its own impact table.',
};

const PULSE_TAGS = new Set(['policy-pulse', 'policy-tracker']);

/**
 * The article's kind. Reads the build-time value; the tag check is a fallback
 * for a stale build, not a second implementation to keep in sync — if it starts
 * disagreeing with scripts/lib/kind.js, the generator has not been re-run.
 */
export function kindOf(a: Analysis): ArticleKind {
  if (a.kind === 'research' || a.kind === 'pulse') return a.kind;
  if (a.tags.some((t) => PULSE_TAGS.has(t.toLowerCase()))) return 'pulse';
  if (/^\s*policy\s*pulse\b/i.test(a.title)) return 'pulse';
  return 'research';
}

/** Paginated route for a kind section. Page 1 is the bare URL, as with markets. */
export function kindPath(kind: ArticleKind, page = 1): string {
  const base = kind === 'research' ? '/research' : '/pulse';
  return page === 1 ? base : `${base}/page/${page}`;
}

export function articlesForKind(analyses: Analysis[], kind: ArticleKind): Analysis[] {
  return analyses.filter((a) => kindOf(a) === kind);
}

/** The other section, for cross-linking. */
export function otherKind(kind: ArticleKind): ArticleKind {
  return kind === 'research' ? 'pulse' : 'research';
}
