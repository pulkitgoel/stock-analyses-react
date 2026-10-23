import { Analysis } from '../types/analysis';

/**
 * Presentation helpers shared by the listing components.
 *
 * These exist because of a content problem the listings cannot fix: a Policy
 * Pulse title is series boilerplate plus a date and nothing else — "Policy
 * Pulse — Global Spillover — 23 Oct 2026". CONTENT-PLAYBOOK.md section 2 is
 * explicit that this wastes the first 52 characters on words nobody searches,
 * and 7.3 defines retitling as off limits until the 2026-11-07 experiment is
 * read. So the listing works with what it has.
 */

/** "2026-10-23" -> "23 Oct 2026". Falls back to the raw string if unparseable. */
export function displayDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** The first `max` tickers, split on the colon-delimited field (3.6). */
export function leadTickers(a: Analysis, max = 3): string[] {
  return (a.ticker ? a.ticker.split(/[:/]/).filter(Boolean) : []).slice(0, max);
}

const SERIES_PREFIX = /^\s*policy\s*pulse\s*[-–—:]?\s*/i;
const EDITION_PREFIX = /^(trump\s*\/?\s*us(\s*watch)?|modi\s*\/?\s*india\s*govt|ministries\s*&?\s*regulators?|global(\s*spillover|\s*watch)?)\s*[-–—:]?\s*/i;

/** Three or more real words — enough to be a claim rather than a date. */
function readsAsClaim(text: string): boolean {
  return (text.match(/[A-Za-z]{3,}/g) ?? []).length >= 3;
}

/** First sentence of the summary, capped so a row stays one or two lines. */
function firstSentence(summary: string, cap = 110): string {
  const s = (summary ?? '').trim();
  if (!s) return '';
  const end = s.search(/[.!?](\s|$)/);
  const sentence = end > 20 ? s.slice(0, end + 1) : s;
  if (sentence.length <= cap) return sentence;
  const cut = sentence.lastIndexOf(' ', cap);
  return `${sentence.slice(0, cut > 40 ? cut : cap).trimEnd()}…`;
}

/**
 * What a Pulse row should lead with.
 *
 * Stripping the boilerplate off a current title leaves "23 Oct 2026" — the date
 * and nothing else. A row whose headline and link text are a bare date tells a
 * reader nothing and gives a crawler a date as anchor text, which is worse than
 * the boilerplate it replaced. So when the remainder does not read as a claim,
 * fall through to the summary, which section 4 of AGENTS.md requires to stand
 * on its own. Presentation only: the article's own title is untouched.
 */
export function pulseHeadline(a: Analysis): string {
  const stripped = (a.title ?? '').replace(SERIES_PREFIX, '').replace(EDITION_PREFIX, '').trim();
  if (readsAsClaim(stripped)) return stripped;
  const claim = firstSentence(a.summary ?? '');
  return claim || a.title;
}
