import type { ArticleKind } from '../utils/kind';
import type { MarketKey } from '../utils/market';

export interface Analysis {
  title: string;
  ticker: string;
  file: string;
  slug?: string;
  date: string;
  /**
   * Revision date, from the optional `updated:` frontmatter. Distinct from
   * `date`, which is the publication date and never changes. When present it
   * becomes dateModified in the prerendered JSON-LD and is shown beside the
   * publication date on the article page.
   */
  updated?: string;
  tags: string[];
  summary: string;
  model?: string;
  /**
   * Which beat the article belongs to. Derived at build time by
   * scripts/lib/market.js from the edition name, tags and tickers, and
   * overridable with an explicit `market:` in frontmatter.
   */
  market?: MarketKey;
  /**
   * Research or daily pulse. Derived at build time by scripts/lib/kind.js from
   * the tags and title, and overridable with an explicit `kind:` in frontmatter.
   */
  kind?: ArticleKind;
  /**
   * The dated call, present only on the articles whose frontmatter opts into the
   * watchlist. Carried on the record so the takeaway panel (7.15) can render the
   * figures synchronously: the panel sits above the fold, and fetching them would
   * mean it either shifts when they arrive or gates the page on a promise, which
   * is the defect 3.14 records.
   */
  priceAtAnalysis?: number;
  support?: number;
  resistance?: number;
  verdict?: string;
}

/**
 * One dated impact call: an event, the stock it touched, which way, why, and
 * how strongly the author believed it.
 *
 * Extracted at build time from the impact tables in the Policy Pulse editions
 * (scripts/lib/impact.js). This is the site's most distinctive asset — a causal
 * history of what moved a stock, which neither a fundamentals database nor a
 * newsfeed publishes — and it previously existed only inside article prose.
 */
export interface ImpactCall {
  ticker: string;
  /** Article the call came from. */
  slug: string;
  title: string;
  date: string;
  direction: 'positive' | 'negative' | 'watch';
  /** Author's confidence, 1-5. Null on older articles that predate the scores. */
  confidence: number | null;
  /** True when the call was a deduction, flagged in the source as inferred. */
  inferred: boolean;
  reason: string;
}

// A curated watchlist entry, derived from an analysis whose frontmatter opts in
// with `watchlist: true` and provides the technical levels below.
export interface WatchlistEntry {
  slug: string;
  ticker: string;
  title: string;
  date: string;
  /** Yahoo Finance symbol used for the live quote, e.g. "RELIANCE.NS". */
  yahooSymbol: string;
  /** Price at the time the analysis was published. */
  priceAtAnalysis: number;
  /** Primary support / resistance the agent suggested. */
  support: number;
  resistance: number;
  /** Optional extra levels rendered as secondary ticks. */
  supports?: number[];
  resistances?: number[];
  verdict?: string;
}

/** Live quote returned by the backend /api/quote endpoint. */
export interface LiveQuote {
  price: number;
  change: number;
  changePct: number;
  currency: string;
  ts: number;
}

export type PushSubscriptionData = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};
