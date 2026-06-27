import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Analysis } from '../types/analysis';
import { fetchAnalyses } from '../services/analysisService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function CompanyPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    fetchAnalyses()
      .then((all) => {
        const matching = all.filter(
          (a) => a.ticker.toLowerCase().includes(ticker!.toLowerCase()) ||
          a.tags.some(t => t.toLowerCase() === ticker!.toLowerCase())
        );
        setAnalyses(matching);
      })
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return <LoadingSpinner />;

  const tickerUpper = ticker?.toUpperCase() || '';

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium no-underline mb-5 sm:mb-8 transition-colors"
        style={{ color: 'var(--text-dim)' }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      {/* Company header */}
      <div className="p-4 sm:p-6 rounded-xl mb-5 sm:mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={18} style={{ color: 'var(--accent)' }} />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: 'var(--text)' }}>{tickerUpper}</h1>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
              {analyses.length} deep-dive{analyses.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </div>

      {/* Analysis list */}
      {analyses.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--text-dim)' }}>
          No deep-dives found for {tickerUpper}
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-3">
          {analyses.sort((a, b) => b.date.localeCompare(a.date)).map((a) => (
            <a
              key={a.slug}
              href={`/analysis/${a.slug}`}
              className="group block no-underline rounded-xl transition-all duration-200"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            >
              <div className="p-3.5 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h2 className="text-sm sm:text-base font-semibold leading-snug flex-1" style={{ color: 'var(--text)' }}>
                    {a.title}
                  </h2>
                  <span className="text-[0.5rem] sm:text-xs shrink-0" style={{ color: 'var(--text-dim)' }}>{a.date}</span>
                </div>
                <p className="text-[0.7rem] sm:text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {a.summary}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {a.tags.map((tag) => (
                    <span key={tag} className="text-[0.4rem] sm:text-[0.55rem] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
