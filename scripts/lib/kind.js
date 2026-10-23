/**
 * Which kind of thing an article is: `research` or `pulse`.
 *
 * This is the axis a reader picks first. Someone arriving at the site wants
 * either a briefing on what just happened, or a piece of work on one company.
 * `market` (india/global, see market.js) is the second question, not the first,
 * and until now it was the only one the routing answered — so /india and
 * /global each served a daily note next to a 2,600-word deep dive with nothing
 * but the card to tell them apart.
 *
 * The split also matters because the two families are wildly unequal. Policy
 * Pulse is roughly 235 of 294 articles and, per AGENTS.md 7.3, drew one top-15
 * page in the 92-day baseline against the deep dives taking essentially all of
 * it. Keeping them in separate sections means each accumulates its own signal,
 * and it leaves the option of treating them differently later without touching
 * the other.
 *
 * Like `market`, this is written into analyses.json by
 * generate-analyses-data.js so the sitemap, the prerender and the app all read
 * one derived value rather than each re-deriving it. That duplication is the
 * hazard AGENTS.md 3.6 and 7.5 both record: the ticker rule and the tag floor
 * are each implemented three times and have drifted. Deriving once avoids
 * adding a fourth instance of the same mistake.
 *
 * Frontmatter always wins. `kind: research` on a Policy Pulse retrospective is
 * a deliberate override, not an error.
 */

export const KINDS = ['research', 'pulse'];
export const DEFAULT_KIND = 'research';

/**
 * The tags that mark the daily series. `policy-pulse` is the tag the publishing
 * skill applies and the one that selects NewsArticle schema in
 * generate-og-files.py; `policy-tracker` is an older spelling still present in
 * the library.
 */
const PULSE_TAGS = new Set(['policy-pulse', 'policy-tracker']);

/**
 * Title fallback. The series has shipped under 22 different spellings
 * (market.js records the same problem), so match only the leading series name
 * rather than any full pattern. This catches the handful of early notes that
 * predate consistent tagging.
 */
const PULSE_TITLE = /^\s*policy\s*pulse\b/i;

export function classifyKind(data) {
  if (typeof data.kind === 'string') {
    const explicit = data.kind.trim().toLowerCase();
    if (KINDS.includes(explicit)) return explicit;
  }

  const tags = Array.isArray(data.tags) ? data.tags : [];
  if (tags.some((t) => PULSE_TAGS.has(String(t).toLowerCase()))) return 'pulse';

  if (typeof data.title === 'string' && PULSE_TITLE.test(data.title)) return 'pulse';

  // Default to research: an unclassified piece is a deep dive or a market note,
  // because the daily series is the thing that is reliably tagged.
  return DEFAULT_KIND;
}
