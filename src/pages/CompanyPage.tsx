import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowUpRight, Building2 } from 'lucide-react';
import { Analysis } from '../types/analysis';
import { getAnalyses } from '../services/analysisService';
import { fetchImpactFor } from '../services/impactService';
import ImpactHistory from '../components/Company/ImpactHistory';
import { ImpactCall } from '../types/analysis';
import { tickerTokens } from '../utils/tickers';

// Ticker tokenisation and the NON_COMPANY exclusion set live in
// src/utils/tickers.ts (AGENTS.md invariant 3.6) so the article pages can link
// tickers to their hubs without a second copy drifting out of sync.

// Tag that marks the daily policy-commentary series.
const NEWS_TAG = 'policy-pulse';

// A hub needs at least this many non-series articles to be worth indexing.
// Kept in sync with MIN_RESEARCH_ARTICLES in scripts/generate-sitemap.js.
const MIN_RESEARCH_ARTICLES = 1;

// ...or a substantial dated impact history, which is content in its own right.
// Keep in sync with generate-sitemap.js and generate-og-files.py.
const MIN_IMPACT_CALLS = 8;

function isSeriesArticle(a: Analysis): boolean {
  return (a.tags ?? []).map((t) => String(t).toLowerCase()).includes(NEWS_TAG);
}

function AnalysisCardLink({ analysis: a }: { analysis: Analysis }) {
  return (
    <Link
      to={`/analysis/${a.slug}`}
      className="analysis-card premium-card group rounded-[1.75rem] no-underline transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.background = 'var(--bg-card-hover)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'var(--bg-card)';
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-lg px-2.5 py-1 font-mono text-xs font-bold truncate max-w-[150px] sm:max-w-[250px]"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
              title={a.ticker}
            >
              {a.ticker}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>{a.date}</span>
          </div>
          <h2 className="text-lg font-bold leading-snug" style={{ color: 'var(--text)' }}>{a.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>{a.summary}</p>
        </div>
        <ArrowUpRight size={18} className="hidden shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block" style={{ color: 'var(--accent)' }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {a.tags.slice(0, 5).map((tag) => (
          <span key={tag} className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: 'var(--surface-soft)', color: 'var(--text-muted)' }}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

// Bundled constant. See services/analysisService.ts: gating the first render on
// a promise over this is what caused the CLS fail, so the article list is
// filtered synchronously. The impact history is a real network call and keeps
// its own state — it is an enhancement, so the page renders without waiting for
// it rather than showing a spinner. That means `indexable` below is computed
// from `impact = []` on the first render and settles when the fetch lands; the
// prerendered file already carries the correct robots tag either way
// (AGENTS.md 3.2, 3.7), and this race is unchanged from the previous version,
// which never awaited the impact fetch either.
const ALL_ANALYSES = getAnalyses();

export default function CompanyPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const [impact, setImpact] = useState<ImpactCall[]>([]);

  const analyses = useMemo(() => {
    const wanted = (ticker ?? '').toUpperCase();
    if (!wanted) return [];
    return ALL_ANALYSES.filter(
      (a) => tickerTokens(a.ticker).includes(wanted) ||
      a.tags.some((t) => t.toUpperCase() === wanted)
    );
  }, [ticker]);

  useEffect(() => {
    if (!ticker) return;
    setImpact([]);
    fetchImpactFor(ticker.toUpperCase()).then(setImpact).catch(() => setImpact([]));
  }, [ticker]);

  const tickerUpper = ticker?.toUpperCase() || '';
  const byDateDesc = (a: Analysis, b: Analysis) => b.date.localeCompare(a.date);

  // Research pieces are what the hub is actually for. Series editions that merely
  // name the ticker go below, so the real analysis is not buried under daily news.
  const research = analyses.filter((a) => !isSeriesArticle(a)).sort(byDateDesc);
  const mentions = analyses.filter(isSeriesArticle).sort(byDateDesc);

  // Thin hubs still render for anyone following a link, but they are kept out of
  // the index and out of the sitemap rather than adding near-duplicate pages.
  const indexable = research.length >= MIN_RESEARCH_ARTICLES || impact.length >= MIN_IMPACT_CALLS;

  // Only the title is built here. The description, canonical, Open Graph tags
  // and JSON-LD a crawler reads are written into the prerendered file by
  // generate_company_html() in scripts/generate-og-files.py, which owns the
  // head on this route (AGENTS.md invariant 3.2).
  const title = `${tickerUpper} Stock Analysis & Research — StocksFundamentals`;

  return (
    <>
      <Helmet>
        {/* Only the title is set here, and only so the browser tab updates
            during client-side navigation.

            Emitting description, canonical, og:* and JSON-LD here as well gave
            every indexable company hub TWO canonicals and TWO CollectionPage
            entities at runtime, because the prerendered file already carries
            them (AGENTS.md invariant 3.2).

            The robots tag stays, and since 2026-10-12 it is deliberately a
            duplicate: every hub is now prerendered, a below-threshold one with
            `noindex, follow` already in its head (7.8). So a thin hub carries
            two identical robots tags after hydration.

            That is not the defect 3.2 guards against. 3.2 exists because two
            canonicals and two Article entities with two different author names
            CONFLICT; two identical noindex directives agree, and Google takes
            the most restrictive directive regardless. Keeping it covers the one
            case the prerender cannot: /company/<nonexistent-ticker> has no file
            at all, falls through to /index.html, and would otherwise render as
            the homepage with nothing telling a crawler to skip it. */}
        <title>{title}</title>
        {!indexable && <meta name="robots" content="noindex, follow" />}
      </Helmet>
      <div className="mx-auto max-w-4xl">
      <Link
        to="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          height: '40px', padding: '0 18px', borderRadius: '12px',
          background: 'transparent', color: 'var(--text)',
          fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
          border: '1px solid var(--border)',
          transition: 'border-color 180ms ease, transform 180ms ease',
          whiteSpace: 'nowrap',
          marginBottom: '1rem',
        }}
        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
      >
        <ArrowLeft size={14} /> Dashboard
      </Link>

      <header className="page-panel surface-card animate-in rounded-[2rem]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--accent-glow)' }}>
              <Building2 size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl" style={{ color: 'var(--text)' }}>{tickerUpper}</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              {research.length} deep-dive{research.length !== 1 ? 's' : ''}
              {mentions.length > 0 && ` · ${mentions.length} policy note${mentions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </header>

      {/* Placed above the article list on purpose: the dated causal history is
          what this page offers that a fundamentals site or a newsfeed does not,
          so it should not sit below a stack of article cards. */}
      <ImpactHistory ticker={tickerUpper} calls={impact} />

      {research.length === 0 && mentions.length === 0 ? (
        <div className="surface-plain mt-5 rounded-2xl px-5 py-14 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
          No coverage found for {tickerUpper}
        </div>
      ) : (
        <>
          {research.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
                Deep-dive research
              </h2>
              <div className="flex flex-col gap-4">
                {research.map((a) => <AnalysisCardLink key={a.slug} analysis={a} />)}
              </div>
            </section>
          )}

          {mentions.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
                Mentioned in Policy Pulse
              </h2>
              <div className="flex flex-col gap-4">
                {mentions.map((a) => <AnalysisCardLink key={a.slug} analysis={a} />)}
              </div>
            </section>
          )}
        </>
      )}
      </div>
    </>
  );
}
