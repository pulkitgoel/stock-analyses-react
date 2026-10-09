import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowUpRight, Building2 } from 'lucide-react';
import { Analysis } from '../types/analysis';
import { fetchAnalyses } from '../services/analysisService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

// Index / exchange tokens that appear inside ticker strings but are not
// companies. Kept in sync with the same list in scripts/generate-sitemap.js.
const NON_COMPANY = new Set([
  'NSE', 'BSE', 'NASDAQ', 'NYSE', 'NIFTY', 'NIFTY_IT', 'BANKNIFTY', 'SENSEX',
  'US', 'IT', 'SPX', 'NDX', 'DJI', 'FII', 'DII', 'GEMS',
]);

// Tag that marks the daily policy-commentary series.
const NEWS_TAG = 'policy-pulse';

// A hub needs at least this many non-series articles to be worth indexing.
// Kept in sync with MIN_RESEARCH_ARTICLES in scripts/generate-sitemap.js.
const MIN_RESEARCH_ARTICLES = 1;

/**
 * Split the colon-delimited ticker field into exact company tokens.
 *
 * This replaces a substring match (`a.ticker.includes(ticker)`) that matched
 * unrelated companies: /company/ge listed 74 articles when 8 mentioned GE, and
 * /company/mu listed Muthoot Finance under Micron. Tickers must match whole
 * tokens, never substrings.
 */
function tickerTokens(raw: string | undefined): string[] {
  const out: string[] = [];
  // Legacy entries used '/' as a delimiter as well as ':'.
  for (const token of String(raw ?? '').split(/[:/]/)) {
    const t = token.trim().toUpperCase();
    if (t && !NON_COMPANY.has(t)) out.push(t);
  }
  return out;
}

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

export default function CompanyPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    const wanted = ticker.toUpperCase();
    fetchAnalyses()
      .then((all) => {
        const matching = all.filter(
          (a) => tickerTokens(a.ticker).includes(wanted) ||
          a.tags.some((t) => t.toUpperCase() === wanted)
        );
        setAnalyses(matching);
      })
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return <LoadingSpinner />;

  const tickerUpper = ticker?.toUpperCase() || '';
  const byDateDesc = (a: Analysis, b: Analysis) => b.date.localeCompare(a.date);

  // Research pieces are what the hub is actually for. Series editions that merely
  // name the ticker go below, so the real analysis is not buried under daily news.
  const research = analyses.filter((a) => !isSeriesArticle(a)).sort(byDateDesc);
  const mentions = analyses.filter(isSeriesArticle).sort(byDateDesc);

  // Thin hubs still render for anyone following a link, but they are kept out of
  // the index and out of the sitemap rather than adding near-duplicate pages.
  const indexable = research.length >= MIN_RESEARCH_ARTICLES;

  const title = `${tickerUpper} Stock Analysis & Research — StocksFundamentals`;
  const description = research.length
    ? `${research.length} deep-dive${research.length !== 1 ? 's' : ''} on ${tickerUpper}, plus ${mentions.length} policy note${mentions.length !== 1 ? 's' : ''} that reference it.`
    : `Policy and market notes referencing ${tickerUpper}.`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://stocksfundamentals.online/company/${tickerUpper.toLowerCase()}`} />
        {!indexable && <meta name="robots" content="noindex, follow" />}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://stocksfundamentals.online/company/${tickerUpper.toLowerCase()}`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: title,
            description,
            url: `https://stocksfundamentals.online/company/${tickerUpper.toLowerCase()}`,
            inLanguage: 'en-IN',
            about: { '@type': 'Corporation', tickerSymbol: tickerUpper },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: research.length + mentions.length,
              itemListElement: [...research, ...mentions].slice(0, 20).map((a, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `https://stocksfundamentals.online/analysis/${a.slug}`,
                name: a.title,
              })),
            },
          })}
        </script>
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
