/**
 * Tag routes, and the rule that gates which of them are worth building.
 *
 * AGENTS.md section 7.5: `/tag/{tag}` pages exist so the archive is crawlable
 * and so related articles link to each other. But there are 335 distinct tags
 * across 254 articles and most appear once or twice, so a page per tag would
 * publish roughly 300 near-empty documents that compete with the articles
 * themselves for crawl budget. That is the same failure that produced 625
 * company hubs, 233 of them backed by a single passing mention (invariant 3.7),
 * so the same medicine applies: a floor on coverage.
 *
 * Keep MIN_TAG_ARTICLES in sync with scripts/generate-sitemap.js and
 * scripts/generate-og-files.py. Those two must agree exactly or the sitemap and
 * the prerender will disagree about which tag pages exist.
 */
import { Analysis } from '../types/analysis';

/** Below this many articles a tag page renders for readers but is noindex. */
export const MIN_TAG_ARTICLES = 12;

export interface TagStat {
  /** The tag exactly as written in front matter, for display. */
  tag: string;
  /** URL-safe form, used in the route and the prerendered filename. */
  slug: string;
  count: number;
  /** Newest article date carrying the tag. */
  latest: string;
}

/**
 * URL-safe form of a tag.
 *
 * Lowercased and reduced to [a-z0-9-] so the route, the sitemap entry and the
 * prerendered filename always agree. Mirrors tag_slug() in
 * scripts/generate-og-files.py.
 */
export function tagSlug(tag: string): string {
  return String(tag)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function tagPath(tag: string): string {
  return `/tag/${tagSlug(tag)}`;
}

/**
 * Every tag with its article count, newest first by count.
 *
 * Matching is done on the slug so a tag written `Policy-Pulse` and one written
 * `policy-pulse` cannot produce two pages for the same topic.
 */
export function tagStats(analyses: Analysis[]): TagStat[] {
  const bySlug = new Map<string, TagStat>();
  for (const a of analyses) {
    const date = a.date ?? '';
    // Dedupe per article: a piece tagged both `EMS` and `ems` is one article on
    // /tag/ems, not two.
    const seen = new Set<string>();
    for (const raw of a.tags ?? []) {
      const slug = tagSlug(raw);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const stat = bySlug.get(slug);
      if (stat) {
        stat.count += 1;
        if (date > stat.latest) stat.latest = date;
      } else {
        bySlug.set(slug, { tag: String(raw), slug, count: 1, latest: date });
      }
    }
  }
  return [...bySlug.values()].sort((x, y) => y.count - x.count || x.slug.localeCompare(y.slug));
}

/** The tags that clear the coverage floor, i.e. the ones in the sitemap. */
export function indexableTags(analyses: Analysis[]): TagStat[] {
  return tagStats(analyses).filter((t) => t.count >= MIN_TAG_ARTICLES);
}

/** Articles carrying a tag slug, newest first. */
export function articlesForTag(analyses: Analysis[], slug: string): Analysis[] {
  return analyses
    .filter((a) => (a.tags ?? []).some((t) => tagSlug(t) === slug))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}
