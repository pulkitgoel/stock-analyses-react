import { Analysis } from '../types/analysis';

/**
 * The two beats this site publishes, and the routes that keep them apart.
 *
 * Indian equity research is the core: the deep dives, and the Modi / Ministries
 * policy editions. Alongside it runs a global macro beat — the Trump/US and
 * Global Spillover editions — read for what it means to an investor holding
 * Indian and American names at once.
 *
 * They were one undifferentiated pile, and the aggregate signal went the wrong
 * way: the seven most-mentioned tickers were American, and Search Console
 * showed the site at position 7.2 in the United States against 25.1 in India,
 * on a site whose stated purpose is Indian stocks. Separate sections let each
 * beat build its own topical authority instead of diluting the other.
 *
 * The value itself is derived at build time by scripts/lib/market.js and lands
 * on each article as `market`, so nothing re-derives it at runtime.
 */
export type MarketKey = 'india' | 'global';

export const MARKETS: MarketKey[] = ['india', 'global'];

export const MARKET_LABEL: Record<MarketKey, string> = {
  india: 'India',
  global: 'Global',
};

export const MARKET_HEADING: Record<MarketKey, string> = {
  india: 'India research',
  global: 'Global macro',
};

export const MARKET_BLURB: Record<MarketKey, string> = {
  india: 'Deep-dive research on Indian companies, plus the policy and regulatory decisions that move them.',
  global: 'US and global macro, read for what it means to an investor holding Indian and American names side by side.',
};

/** Paginated route for a section, or for the combined archive when market is null. */
export function sectionPath(market: MarketKey | null, page = 1): string {
  const base = market ? `/${market}` : '/analyses';
  if (!market) return `${base}/page/${page}`;
  // Page 1 is the bare section URL, so there is one canonical URL per page and
  // no /page/1 duplicate to canonicalise away.
  return page === 1 ? base : `${base}/page/${page}`;
}

export function articlesForMarket(analyses: Analysis[], market: MarketKey): Analysis[] {
  return analyses.filter((a) => a.market === market);
}

/** The other section, for cross-linking. */
export function otherMarket(market: MarketKey): MarketKey {
  return market === 'india' ? 'global' : 'india';
}
