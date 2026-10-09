/**
 * Ticker tokenisation and the NON_COMPANY exclusion set.
 *
 * AGENTS.md invariant 3.6: the `ticker` frontmatter field is a colon-delimited
 * string, and matching must be by whole token, never by substring. A
 * `includes()` check once made /company/ge list 74 articles when only 8
 * mentioned GE, and put Muthoot Finance under /company/mu.
 *
 * The same rule is implemented for the build scripts in
 * scripts/generate-sitemap.js and scripts/generate-og-files.py, and all copies
 * must agree. This module is the single frontend copy, shared by the company
 * hub and the article pages.
 */

/** Index and exchange tokens that appear inside ticker strings but are not companies. */
export const NON_COMPANY = new Set([
  'NSE', 'BSE', 'NASDAQ', 'NYSE', 'NIFTY', 'NIFTY_IT', 'BANKNIFTY', 'SENSEX',
  'US', 'IT', 'SPX', 'NDX', 'DJI', 'FII', 'DII', 'GEMS',
]);

/**
 * Split the colon-delimited ticker field into exact company tokens.
 *
 * Legacy entries used '/' as a delimiter as well as ':', so both are split on.
 */
export function tickerTokens(raw: string | undefined): string[] {
  const out: string[] = [];
  for (const token of String(raw ?? '').split(/[:/]/)) {
    const t = token.trim().toUpperCase();
    if (t && !NON_COMPANY.has(t)) out.push(t);
  }
  return out;
}

/**
 * Path to a company hub.
 *
 * Lowercase, matching the canonical URL that generate-og-files.py and
 * CompanyPage emit, and the filenames the prerender writes.
 */
export function companyHubPath(ticker: string): string {
  return `/company/${ticker.trim().toLowerCase()}`;
}
