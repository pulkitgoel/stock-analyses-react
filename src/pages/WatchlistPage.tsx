import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  type Variants,
} from 'motion/react';
import { ArrowUpRight, Radio, TrendingUp, TrendingDown } from 'lucide-react';
import { WatchlistEntry, LiveQuote } from '../types/analysis';
import { fetchWatchlist } from '../services/watchlistService';
import { useLiveQuotes } from '../hooks/useLiveQuotes';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const inr = (n: number, decimals = 2) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Spring-animated number so live-price changes glide instead of jumping. */
function AnimatedNumber({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 120, damping: 26, mass: 0.6 });
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  useMotionValueEvent(spring, 'change', (v) => setDisplay(v));
  return <>{inr(display, decimals)}</>;
}

/** Horizontal support→resistance gauge with an animated live-price marker. */
function Gauge({ entry, price, hasLive }: { entry: WatchlistEntry; price: number; hasLive: boolean }) {
  const levels = [
    entry.support,
    entry.resistance,
    entry.priceAtAnalysis,
    price,
    ...(entry.supports ?? []),
    ...(entry.resistances ?? []),
  ].filter((n) => typeof n === 'number' && Number.isFinite(n)) as number[];

  const lo = Math.min(...levels);
  const hi = Math.max(...levels);
  const pad = (hi - lo) * 0.08 || 1;
  const domainLo = lo - pad;
  const domainHi = hi + pad;
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - domainLo) / (domainHi - domainLo)) * 100));

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{ position: 'relative', height: '44px' }}>
        {/* animated live-price pill */}
        <motion.div
          initial={false}
          animate={{ left: `${pct(price)}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          style={{ position: 'absolute', top: 0, transform: 'translateX(-50%)', zIndex: 3 }}
        >
          <div
            style={{
              fontSize: '0.62rem',
              fontWeight: 900,
              padding: '2px 7px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              background: hasLive ? 'var(--accent)' : 'var(--surface-strong)',
              color: hasLive ? 'var(--accent-contrast)' : 'var(--text-dim)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            ₹{inr(price)}
          </div>
          <div
            style={{
              width: '2px',
              height: '12px',
              margin: '2px auto 0',
              background: hasLive ? 'var(--accent)' : 'var(--text-dim)',
            }}
          />
        </motion.div>

        {/* track */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            left: 0,
            right: 0,
            height: '8px',
            borderRadius: '999px',
            background: 'var(--surface-soft)',
            overflow: 'hidden',
          }}
        >
          {/* support zone */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct(entry.support)}%`, background: 'color-mix(in srgb, var(--green) 30%, transparent)' }} />
          {/* resistance zone */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, left: `${pct(entry.resistance)}%`, background: 'color-mix(in srgb, var(--red) 30%, transparent)' }} />
        </div>

        {/* support / resistance ticks */}
        <div style={{ position: 'absolute', top: '26px', left: `${pct(entry.support)}%`, width: '2px', height: '16px', background: 'var(--green)', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'absolute', top: '26px', left: `${pct(entry.resistance)}%`, width: '2px', height: '16px', background: 'var(--red)', transform: 'translateX(-50%)' }} />
        {/* analysis-time price tick (dim) */}
        <div style={{ position: 'absolute', top: '28px', left: `${pct(entry.priceAtAnalysis)}%`, width: '2px', height: '12px', background: 'var(--text-dim)', opacity: 0.7, transform: 'translateX(-50%)' }} title={`At analysis: ₹${inr(entry.priceAtAnalysis)}`} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.68rem', fontWeight: 700 }}>
        <span style={{ color: 'var(--green)' }}>Support ₹{inr(entry.support, 0)}</span>
        <span style={{ color: 'var(--text-dim)' }}>Analysis ₹{inr(entry.priceAtAnalysis, 0)}</span>
        <span style={{ color: 'var(--red)' }}>Resistance ₹{inr(entry.resistance, 0)}</span>
      </div>
    </div>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
};

function WatchlistCard({ entry, quote }: { entry: WatchlistEntry; quote: LiveQuote | null | undefined }) {
  const hasLive = !!quote;
  const price = quote?.price ?? entry.priceAtAnalysis;
  const changePct = quote?.changePct ?? 0;
  const sinceAnalysis = ((price - entry.priceAtAnalysis) / entry.priceAtAnalysis) * 100;
  const up = changePct >= 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      className="premium-card"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent)' }}>{entry.ticker}</span>
            {entry.verdict && (
              <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.04em', padding: '2px 8px', borderRadius: '999px', background: 'var(--surface-soft)', color: 'var(--text-dim)' }}>
                {entry.verdict}
              </span>
            )}
          </div>
          <h3 style={{ marginTop: '6px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{entry.title}</h3>
        </div>
        <Link to={`/analysis/${entry.slug}`} title="View analysis" style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginTop: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
            {hasLive ? 'Live price' : 'Last analysis price'}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
            ₹<AnimatedNumber value={price} />
          </div>
        </div>
        {hasLive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 800, color: up ? 'var(--green)' : 'var(--red)' }}>
            {up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {up ? '+' : ''}{changePct.toFixed(2)}%
          </div>
        )}
      </div>

      <div style={{ marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Since analysis (₹{inr(entry.priceAtAnalysis, 0)}, {entry.date}):{' '}
        <span style={{ fontWeight: 800, color: sinceAnalysis >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {sinceAnalysis >= 0 ? '+' : ''}{sinceAnalysis.toFixed(1)}%
        </span>
      </div>

      <Gauge entry={entry} price={price} hasLive={hasLive} />
    </motion.div>
  );
}

export default function WatchlistPage() {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist().then((w) => {
      setEntries(w);
      setLoading(false);
    });
  }, []);

  const symbols = useMemo(() => entries.map((e) => e.yahooSymbol), [entries]);
  const { quotes, status, updatedAt } = useLiveQuotes(symbols);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        {/* Private page: reachable only by direct URL, never indexed or linked. */}
        <meta name="robots" content="noindex,nofollow" />
        <title>Watchlist — stocksfundamentals.online</title>
      </Helmet>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="surface-card rounded-[2rem]"
          style={{ padding: '2rem 2rem 1.75rem' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', margin: 0 }}>
                Watchlist
              </h1>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Live prices tracked against the support &amp; resistance from each analysis.
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', background: 'var(--surface-soft)', border: '1px solid var(--border)' }}>
              <motion.span
                animate={{ opacity: status === 'live' ? [1, 0.25, 1] : 0.4 }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                style={{ width: '8px', height: '8px', borderRadius: '999px', background: status === 'live' ? 'var(--green)' : 'var(--text-dim)' }}
              />
              <Radio size={13} style={{ color: 'var(--text-dim)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                {status === 'live' ? 'Live · Yahoo (delayed)' : status === 'loading' ? 'Connecting…' : 'Live feed unavailable'}
                {updatedAt && status === 'live' ? ` · ${new Date(updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
              </span>
            </div>
          </div>
        </motion.div>

        {entries.length === 0 ? (
          <div className="surface-card rounded-[2rem]" style={{ marginTop: '2rem', padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            No stocks on the watchlist yet.
          </div>
        ) : (
          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2"
            style={{ gap: '1.5rem', marginTop: '2rem' }}
          >
            {entries.map((entry) => (
              <WatchlistCard key={entry.slug} entry={entry} quote={quotes[entry.yahooSymbol]} />
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}
