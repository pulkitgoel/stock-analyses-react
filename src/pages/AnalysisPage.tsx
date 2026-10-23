import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, FileText } from 'lucide-react';
import { Analysis } from '../types/analysis';
import { getAnalyses, fetchAnalysisContent } from '../services/analysisService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { tickerTokens, companyHubPath } from '../utils/tickers';
import { tagPath } from '../utils/tags';
import { MARKET_HEADING, sectionPath } from '../utils/market';
import AudioSummary from '../components/Analysis/AudioSummary';
import TableOfContents from '../components/Analysis/TableOfContents';
import ArticleBand from '../components/Analysis/ArticleBand';
import TakeawayPanel from '../components/Analysis/TakeawayPanel';
import { prepareHeadings } from '../utils/toc';
import { useReadingProgress, useStuckHeader } from '../hooks/useReveal';

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

    // The catalogue is synchronous (services/analysisService.ts), so a missing
    // slug is known without waiting. Only the markdown body is a real fetch,
    // and that is what `loading` covers.
    const found = getAnalyses().find((a) => a.slug === slug);
    if (!found) {
      setError('Analysis not found');
      setLoading(false);
      return;
    }
    setAnalysis(found);

    // A missing body is not an error: the page still has its frontmatter, so it
    // renders with a placeholder rather than failing. `error` is now reserved
    // for an unknown slug, which is decided synchronously above.
    fetchAnalysisContent(slug)
      .catch(() => '')
      .then((mdContent) => {
        setContent(mdContent || `# ${found.title}\n\n*Content not available.*`);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Heading anchors plus the contents list, derived in one pass so their ids
  // cannot drift apart (AGENTS 7.4). Runs on the fetched text, so the raw
  // /analyses/{slug}.md keeps its clean headings.
  //
  // This MUST stay above the early returns below. Placed after them the hook is
  // skipped on the loading render and then called on the loaded one: six hooks
  // then seven, which is React error #310, "rendered more hooks than during the
  // previous render". That is not a warning. The component throws, #root stays
  // empty, and the failure is quiet in every place you would normally look —
  // tsc passes, the build passes, and the prerender reports it only as a
  // 30-second timeout on every article route. Opening the page is what catches
  // it. See invariant 3.12.
  //
  // `content` is '' until the fetch resolves and prepareHeadings('') is a
  // no-op, so running it on every render costs nothing.
  const { markdown: body, toc } = useMemo(() => prepareHeadings(content), [content]);
  // Above the early returns, as 3.12 requires - both are no-ops until their
  // targets exist, which is cheaper than the crash that rule records.
  const progressRef = useReadingProgress();
  useStuckHeader();

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
          data-hov="rise"
        >
          <ArrowLeft size={16} /> Back Home
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(content);
  const tickers = tickerTokens(analysis.ticker);
  const related = relatedAnalyses(analysis, getAnalyses());

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

      <div className="read-progress" aria-hidden>
        <i ref={progressRef as React.RefObject<HTMLElement>} />
      </div>

      <ArticleBand analysis={analysis} readTime={readTime} />

      {analysis.verdict || analysis.priceAtAnalysis ? <TakeawayPanel analysis={analysis} /> : null}

      {/* Ticker links to company hubs (AGENTS 7.4): a live deep dive exposes
          7 internal /analysis/ and /company/ links against 0 before this. The
          band does not carry them, so they sit here with the tags. Chips wrap,
          which is also the fix for the 292-character unbroken ticker string. */}
      <div className="mt-5 flex flex-wrap gap-2">
          {tickers.slice(0, TICKER_LINK_LIMIT).map((t) => (
            <Link
              key={t}
              to={companyHubPath(t)}
              className="rounded px-2 py-0.5 font-mono text-xs font-bold no-underline"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
              data-hov="accent"
            >
              {t}
            </Link>
          ))}
          {tickers.length > TICKER_LINK_LIMIT && (
            <span className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
              +{tickers.length - TICKER_LINK_LIMIT} more
            </span>
          )}
          {/* Which beat this belongs to, linked. Tells a reader (and a
              crawler) that the article sits in a section, not a flat pile. */}
          {analysis.market && (
            <Link
              to={sectionPath(analysis.market)}
              className="rounded-full px-2.5 py-1 text-xs font-bold no-underline"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
            >
              {MARKET_HEADING[analysis.market]}
            </Link>
          )}
          {analysis.tags.map((tag) => (
            <Link
              key={tag}
              to={tagPath(tag)}
              className="rounded-full px-2.5 py-1 text-xs font-semibold no-underline"
              style={{ background: 'var(--surface-soft)', color: 'var(--text-muted)' }}
              data-hov="accent"
            >
              {tag}
            </Link>
          ))}
      </div>

      {/* Audio summary, when this article has one. No per-article setup: the
          backend reports which slugs have audio (src/services/audioService.ts),
          and the file is named after the slug. Placed above the body because both
          resolve asynchronously and this one is a small cached JSON response, so
          it paints first and does not push the article down once loaded. */}
      <AudioSummary slug={analysis.slug} />

      <div className="page-panel surface-card animate-in animate-in-delay-1 overflow-hidden rounded-lg">
        {/* Contents for long articles (AGENTS 7.4). Collapsed by default so it
            costs no vertical space, but rendered unconditionally - the section
            anchors and their links are in the prerendered HTML either way. */}
        <TableOfContents entries={toc} />
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
            {body}
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
        className="page-panel surface-card rounded-lg"
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
        <section className="page-panel surface-card animate-in rounded-lg" style={{ padding: '1.75rem' }}>
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
          data-hov="lift"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
    </article>
  );
}
