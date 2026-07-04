import { WatchlistEntry, LiveQuote } from '../types/analysis';

// Curated watchlist is generated at build time from analysis frontmatter
// (scripts/generate-analyses-data.js → public/watchlist.json).
export async function fetchWatchlist(): Promise<WatchlistEntry[]> {
  try {
    const res = await fetch('/watchlist.json');
    if (!res.ok) throw new Error('watchlist unavailable');
    const data = await res.json();
    return data.watchlist ?? [];
  } catch {
    return [];
  }
}

// Live quotes come from the backend /api/quote endpoint (yfinance, ~15 min
// delayed). Returns a map keyed by Yahoo symbol; a symbol maps to null when its
// quote could not be fetched (backend down, symbol unknown, rate-limited).
export async function fetchQuotes(symbols: string[]): Promise<Record<string, LiveQuote | null>> {
  if (symbols.length === 0) return {};
  try {
    const res = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols.join(','))}`);
    if (!res.ok) throw new Error('quote request failed');
    const data = await res.json();
    return data.quotes ?? {};
  } catch {
    return {};
  }
}
