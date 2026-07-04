export interface Analysis {
  title: string;
  ticker: string;
  file: string;
  slug?: string;
  date: string;
  tags: string[];
  summary: string;
  model?: string;
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
