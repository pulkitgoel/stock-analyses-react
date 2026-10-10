import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Library } from 'lucide-react';
import { Analysis } from '../types/analysis';
import { fetchAnalyses } from '../services/analysisService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import AnalysisGrid from '../components/Dashboard/AnalysisGrid';
import { indexableTags, tagPath } from '../utils/tags';

/**
 * Articles per archive page.
 *
 * This exists to make the whole library crawlable. The homepage renders nine
 * cards and hides the other 245 behind a JavaScript "load more", so before this
 * page those articles were reachable only through the sitemap - no internal
 * link pointed at them at all (AGENTS.md section 7.5).
 *
 * Keep in sync with ITEMS_PER_PAGE in src/components/Dashboard/AnalysisGrid.tsx
 * and ARCHIVE_PAGE_SIZE in scripts/generate-sitemap.js.
 */
const PAGE_SIZE = 9;

function displayTag(raw: string): string {
  if (raw !== raw.toLowerCase()) return raw;
  return raw
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

export default function ArchivePage() {
  const { page } = useParams<{ page: string }>();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses()
      .then(setAnalyses)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const sorted = [...analyses].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, parseInt(page ?? '1', 10) || 1), totalPages);
  const pageArticles = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const topics = indexableTags(analyses);

  const title =
    current === 1
      ? 'All Analysis, Research & Policy Notes'
      : `All Analysis — Page ${current} of ${totalPages}`;

  const pagerStyle = (active: boolean) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '38px', height: '38px', padding: '0 10px', borderRadius: '10px',
    fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
    background: active ? 'var(--accent)' : 'var(--surface-soft)',
    color: active ? '#fff' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
  });

  return (
    <>
      <Helmet>
        {/* Title only - the prerendered file owns the rest (invariant 3.2). */}
        <title>{title}</title>
      </Helmet>

      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            height: '40px', padding: '0 18px', borderRadius: '12px',
            background: 'transparent', color: 'var(--text)',
            fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
            border: '1px solid var(--border)',
            transition: 'border-color 180ms ease, transform 180ms ease',
            whiteSpace: 'nowrap', marginBottom: '1rem',
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
        >
          <ArrowLeft size={14} /> Dashboard
        </Link>

        <header className="page-panel surface-card animate-in rounded-[2rem]">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--accent-glow)' }}>
            <Library size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl" style={{ color: 'var(--text)' }}>
            All analysis
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {sorted.length} articles, newest first
            {totalPages > 1 && ` · page ${current} of ${totalPages}`}
          </p>
        </header>

        <section className="mt-6">
          <AnalysisGrid analyses={pageArticles} />
        </section>

        {totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Archive pages">
            {current > 1 && (
              <Link to={`/analyses/page/${current - 1}`} style={pagerStyle(false)} aria-label="Previous page">
                <ArrowLeft size={15} />
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                to={`/analyses/page/${n}`}
                style={pagerStyle(n === current)}
                aria-current={n === current ? 'page' : undefined}
              >
                {n}
              </Link>
            ))}
            {current < totalPages && (
              <Link to={`/analyses/page/${current + 1}`} style={pagerStyle(false)} aria-label="Next page">
                <ArrowRight size={15} />
              </Link>
            )}
          </nav>
        )}

        {/* The topic index lives here rather than in the footer so every tag
            page is one crawlable hop from the archive, and the archive is
            linked site-wide from the footer. */}
        {current === 1 && topics.length > 0 && (
          <section className="animate-in" style={{ marginTop: '3rem' }}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
              Browse by topic
            </h2>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <Link
                  key={t.slug}
                  to={tagPath(t.tag)}
                  className="rounded-full px-3 py-1.5 text-xs font-bold no-underline"
                  style={{ background: 'var(--surface-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  onMouseOver={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {displayTag(t.tag)} <span style={{ color: 'var(--text-dim)' }}>{t.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
