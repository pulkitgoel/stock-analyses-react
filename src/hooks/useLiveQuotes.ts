import { useEffect, useRef, useState } from 'react';
import { LiveQuote } from '../types/analysis';
import { fetchQuotes } from '../services/watchlistService';

export type QuoteStatus = 'loading' | 'live' | 'unavailable';

// Poll the backend for live quotes on an interval. Returns the latest quote map
// plus a coarse status for the UI ("live" once at least one quote resolves,
// "unavailable" if the feed can't be reached).
export function useLiveQuotes(symbols: string[], intervalMs = 15000) {
  const [quotes, setQuotes] = useState<Record<string, LiveQuote | null>>({});
  const [status, setStatus] = useState<QuoteStatus>('loading');
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const key = symbols.join(',');
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if (!key) {
      setStatus('unavailable');
      return;
    }
    let active = true;
    const list = key.split(',');

    const tick = async () => {
      const next = await fetchQuotes(list);
      if (!active) return;
      const gotSomething = Object.values(next).some(Boolean);
      setQuotes((prev) => ({ ...prev, ...next }));
      setStatus(gotSomething ? 'live' : 'unavailable');
      if (gotSomething) setUpdatedAt(Date.now());
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [key, intervalMs]);

  return { quotes, status, updatedAt };
}
