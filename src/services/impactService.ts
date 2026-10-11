import { ImpactCall } from '../types/analysis';

/**
 * Dated impact history, keyed by lowercase ticker.
 *
 * Built from the stock-impact tables in the Policy Pulse editions by
 * scripts/lib/impact.js and written to public/impact.json. Roughly 2,300 dated
 * calls across 258 tickers.
 *
 * Fetched rather than bundled: it is ~96 KB gzipped and only company pages need
 * it, so putting it in the entry bundle would charge every visitor for it.
 * Cached in-module so navigating between company pages fetches once.
 */
let cache: Promise<Record<string, ImpactCall[]>> | null = null;

export function fetchImpactIndex(): Promise<Record<string, ImpactCall[]>> {
  if (!cache) {
    cache = fetch('/impact.json')
      .then((res) => (res.ok ? res.json() : {}))
      // A missing or malformed file must not take the company page down with
      // it; the impact history is an enhancement, not the page.
      .catch(() => ({}));
  }
  return cache;
}

export async function fetchImpactFor(ticker: string): Promise<ImpactCall[]> {
  const index = await fetchImpactIndex();
  return index[ticker.toLowerCase()] ?? [];
}
