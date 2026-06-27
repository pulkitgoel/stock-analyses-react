import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowUpRight, Building2 } from 'lucide-react';
import { Analysis } from '../types/analysis';
import { fetchAnalyses } from '../services/analysisService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function CompanyPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    fetchAnalyses()
      .then((all) => {
        const matching = all.filter(
          (a) => a.ticker.toLowerCase().includes(ticker.toLowerCase()) ||
          a.tags.some(t => t.toLowerCase() === ticker.toLowerCase())
        );
        setAnalyses(matching);
      })
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return <LoadingSpinner />;

  const tickerUpper = ticker?.toUpperCase() || '';
  const sortedAnalyses = [...analyses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Helmet>
        <title>{tickerUpper} Stock Analysis & Research — StockFundamentals</title>
        <meta name="description" content={`Deep-dive fundamental analysis, market notes, and research for ${tickerUpper}.`} />
        <link rel="canonical" href={`https://stocksfundamentals.online/company/${tickerUpper.toLowerCase()}`} />
        <meta property="og:title" content={`${tickerUpper} Stock Analysis & Research — StockFundamentals`} />
        <meta property="og:description" content={`Deep-dive fundamental analysis, market notes, and research for ${tickerUpper}.`} />
        <meta property="og:url" content={`https://stocksfundamentals.online/company/${tickerUpper.toLowerCase()}`} />
        <meta property="og:type" content="website" />
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
              {analyses.length} deep-dive{analyses.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </header>

      {sortedAnalyses.length === 0 ? (
        <div className="surface-plain mt-5 rounded-2xl px-5 py-14 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
          No deep-dives found for {tickerUpper}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          {sortedAnalyses.map((a) => (
            <Link
              key={a.slug}
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
                    <span className="rounded-lg px-2.5 py-1 font-mono text-xs font-bold" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
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
          ))}
        </div>
      )}
    </div>
    </>
  );
}
