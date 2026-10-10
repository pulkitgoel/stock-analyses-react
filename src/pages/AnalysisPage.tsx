import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, FileText } from 'lucide-react';
import { Analysis } from '../types/analysis';
import { fetchAnalyses, fetchAnalysisContent } from '../services/analysisService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ANALYSES } from '../data/analyses.generated';
import { tickerTokens, companyHubPath } from '../utils/tickers';
import AudioSummary from '../components/Analysis/AudioSummary';

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// How many ticker tokens become links to their company hub. Some articles list
// 40+; linking every one turns the page into a link farm, so the tail is
// collapsed into a counter. The first N are real crawlable links (AGENTS 7.4).
const TICKER_LINK_LIMIT = 12;

/**
 * Related research, scored on shared tickers then shared tags (AGENTS 7.4).
 *
 * A shared ticker is a far stronger signal than a shared tag, so it is weighted
 * 3:1. The daily policy series is excluded from tag matching: every policy
 * article shares the policy-pulse tag, which would relate all 199 of them to
 * each other and say nothing.
 *
 * These render as real anchors, so the prerender in scripts/prerender-body.py
 * captures them and a non-executing crawler can follow them.
 */
function relatedAnalyses(current: Analysis, all: Analysis[], limit = 6): Analysis[] {
  const mine = new Set(tickerTokens(current.ticker));
  const myTags = new Set(
    (current.tags ?? []).map((t) => String(t).toLowerCase()).filter((t) => t !== 'policy-pulse'),
  );
  return all
    .filter((a) => a.slug && a.slug !== current.slug)
    .map((a) => {
      const sharedTickers = tickerTokens(a.ticker).filter((t) => mine.has(t)).length;
      const sharedTags = (a.tags ?? [])
        .map((t) => String(t).toLowerCase())
        .filter((t) => myTags.has(t)).length;
      return { a, score: sharedTickers * 3 + sharedTags };
    })
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score || (y.a.date > x.a.date ? 1 : -1))
    .slice(0, limit)
    .map((s) => s.a);
}

export default function AnalysisPage() {
  const { slug } = useParams<{ slug: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAnalyses(),
      fetchAnalysisContent(slug).catch(() => ''),
    ])
      .then(([analyses, mdContent]) => {
        const found = analyses.find((a) => a.slug === slug);
        if (!found) {
          setError('Analysis not found');
          return;
        }
        setAnalysis(found);
        setContent(mdContent || `# ${found.title}\n\n*Content not available.*`);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;

  if (error || !analysis) {
    return (
      <div className="soft-panel mx-auto max-w-xl rounded-2xl px-5 py-14 text-center">
        <FileText size={36} className="mx-auto mb-4" style={{ color: 'var(--text-dim)' }} />
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Not Found</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{error || "This analysis doesn't exist."}</p>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            height: '44px', padding: '0 20px', borderRadius: '12px',
            background: 'var(--accent)', color: 'var(--accent-contrast)',
            fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none',
            marginTop: '1.5rem',
            transition: 'transform 180ms ease',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
        >
          <ArrowLeft size={16} /> Back Home
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(content);
  const tickers = tickerTokens(analysis.ticker);
  const related = relatedAnalyses(analysis, ANALYSES);
  const primaryHub = tickers.length === 1 ? tickers[0] : null;

  return (
    <article className="article-shell flex flex-col gap-6 sm:gap-8">
      <Helmet>
        {/* Only the title is set here, and only so the browser tab updates
            during client-side navigation.

            Everything else a crawler needs (description, canonical, OG,
            Twitter, JSON-LD) is in the prerendered file that
            scripts/generate-og-files.py writes for this route. Emitting those
            here as well produced two of every tag.

            The title must be a SINGLE expression. Writing
            `<title>{analysis.title} — suffix</title>` passes Helmet an array of
            children, which it renders as an EMPTY <title> — that is what put a
            blank title ahead of the real one on every analysis page. The suffix
            is gone regardless: it pushed 246 of 250 titles past the length
            Google renders. This now matches the prerendered title exactly. */}
        <title>{analysis.title}</title>
        {/* No JSON-LD here on purpose. These routes are prerendered by
            scripts/generate-og-files.py, which emits the single Article (or
            NewsArticle) block with datePublished, publisher, image and section.
            A second block here produced two conflicting Article entities per
            page, with two different author names. */}
      </Helmet>

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
        }}
        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
      >
        <ArrowLeft size={14} /> All analyses
      </Link>

      {/* Breadcrumb (AGENTS 7.4). Prerendered with the rest of the body, so a
          crawler that does not run JavaScript still sees the hierarchy. */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        {primaryHub && (
          <>
            <span>/</span>
            <Link to={companyHubPath(primaryHub)} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              {primaryHub}
            </Link>
          </>
        )}
        <span>/</span>
        <span style={{ color: 'var(--text-dim)' }}>{analysis.title}</span>
      </nav>

      <header className="page-panel surface-card animate-in rounded-[2rem]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Each ticker token links to its company hub (AGENTS 7.4). Chips wrap,
              which is also the fix for the 292-character unbroken ticker string
              that used to widen this page to ~2468px. */}
          {tickers.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5" style={{ maxWidth: '100%' }}>
              {tickers.slice(0, TICKER_LINK_LIMIT).map((t) => (
                <Link
                  key={t}
                  to={companyHubPath(t)}
                  className="rounded-lg px-2 py-0.5 font-mono text-xs font-bold"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent)', textDecoration: 'none' }}
                >
                  {t}
                </Link>
              ))}
              {tickers.length > TICKER_LINK_LIMIT && (
                <span className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
                  +{tickers.length - TICKER_LINK_LIMIT} more
                </span>
              )}
            </div>
          ) : (
            <span
              className="rounded-lg px-2.5 py-1 font-mono text-xs font-bold"
              style={{
                background: 'var(--accent-glow)', color: 'var(--accent)',
                maxWidth: '100%', overflowWrap: 'anywhere', wordBreak: 'break-word',
                whiteSpace: 'normal',
              }}
            >
              {analysis.ticker}
            </span>
          )}
          <span className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>{analysis.date}</span>
          {analysis.updated && analysis.updated !== analysis.date && (
            <span className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>
              updated {analysis.updated}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>
            <Clock size={13} /> {readTime} min read
          </span>
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl" style={{ color: 'var(--text)' }}>
          {analysis.title}
        </h1>
        <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: 'var(--text-muted)' }}>
          {analysis.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {analysis.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: 'var(--surface-soft)', color: 'var(--text-muted)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Audio summary, when this article has one. No per-article setup: the
          backend reports which slugs have audio (src/services/audioService.ts),
          and the file is named after the slug. Placed above the body because both
          resolve asynchronously and this one is a small cached JSON response, so
          it paints first and does not push the article down once loaded. */}
      <AudioSummary slug={analysis.slug} />

      <div className="page-panel surface-card animate-in animate-in-delay-1 overflow-hidden rounded-[2rem]">
        <div className="article-body">
          {/* An h1 in the markdown body is rendered as an h2.
              106 of 250 articles open with their own `# Title`, which produced a
              second <h1> duplicating the page heading above. In all 106 that h1
              is the first heading in the body, so demoting it leaves one h1 per
              page with no content lost and no heading levels skipped.
              h2 and below are deliberately left alone: 144 articles have no body
              h1, and shifting their h2s would create a gap under the page h1. */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
              // Each table owns its own horizontal scroll. Making the whole
              // .article-body scroll instead stops the page overflowing, but it
              // drags the prose sideways with the table and gives no sign that
              // a table is cut off. A deep dive carries ~23 tables that render
              // ~740px wide inside a 278px phone column, so the affordance
              // matters: .table-scroll adds an edge fade and a sticky first
              // column (see index.css).
              table: ({ children, ...props }) => (
                <div className="table-scroll" role="region" tabIndex={0} aria-label="Data table, scrolls horizontally">
                  <table {...props}>{children}</table>
                </div>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* A disclaimer line on every article (AGENTS 7.6). Only 70 of 250 had
          one in the body; doing it in the template covers all of them, and
          every future publish, without editing 250 markdown files. Wording
          stays factually narrow on purpose: it claims nothing about holdings
          and does not assert a regulatory position (AGENTS 6). It matches the
          footer's existing stance rather than inventing a stronger one. */}
      <p
        className="page-panel surface-card rounded-[2rem]"
        style={{
          margin: 0, padding: '1.1rem 1.35rem', fontSize: '0.78rem',
          lineHeight: 1.75, color: 'var(--text-dim)',
        }}
      >
        <strong style={{ color: 'var(--text-muted)' }}>Not investment advice.</strong>{' '}
        This note records the author's view as of {analysis.date} and is published for
        information and education only. Figures are drawn from the sources named in the
        article and should be verified independently before you act on them. Nothing
        here is a recommendation to buy or sell any security.
      </p>

      {related.length > 0 && (
        <section className="page-panel surface-card animate-in rounded-[2rem]" style={{ padding: '1.75rem' }}>
          <h2 className="text-lg font-black" style={{ color: 'var(--text)', margin: '0 0 1rem' }}>
            Related research
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {related.map((a) => (
              <li key={a.slug}>
                <Link
                  to={`/analysis/${a.slug}`}
                  style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}
                >
                  {a.title}
                </Link>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  {a.date}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            height: '44px', padding: '0 20px', borderRadius: '12px',
            background: 'var(--surface-soft)', color: 'var(--text)',
            fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none',
            border: '1px solid var(--border)',
            transition: 'border-color 180ms ease, transform 180ms ease',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
    </article>
  );
}
