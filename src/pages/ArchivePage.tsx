import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Library } from 'lucide-react';
import { getAnalyses } from '../services/analysisService';
import AnalysisGrid from '../components/Dashboard/AnalysisGrid';
import { indexableTags, tagPath } from '../utils/tags';
import {
  MarketKey, MARKETS, MARKET_BLURB, MARKET_HEADING,
  articlesForMarket, otherMarket, sectionPath,
} from '../utils/market';
import {
  ArticleKind, KIND_BLURB, KIND_HEADING, articlesForKind, kindPath, otherKind,
} from '../utils/kind';

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

// Bundled constant, read once at module scope. See services/analysisService.ts:
// gating the first render on a promise over this is what caused the CLS fail.
const analyses = getAnalyses();

/**
 * Serves three routes: the combined archive at /analyses/page/N, and one
 * section each at /india and /global.
 *
 * One component rather than three, because the only differences are which
 * articles are in scope, the base path and the copy. The sections exist so the
 * two beats accumulate separate topical authority instead of diluting each
 * other; see src/utils/market.ts.
 */
export default function ArchivePage(
  { market = null, kind = null }: { market?: MarketKey | null; kind?: ArticleKind | null },
) {
  const { page } = useParams<{ page: string }>();

  // One scope, one axis. `market` and `kind` are never combined: /research/india
  // would be a fourth near-duplicate listing of the same 294 articles, which is
  // the surface that 7.5 gated tags at MIN_TAG_ARTICLES to avoid and that 3.7
  // gated company hubs to avoid. Each section cross-links the other instead.
  const inScope = kind
    ? articlesForKind(analyses, kind)
    : market
      ? articlesForMarket(analyses, market)
      : analyses;
  const sorted = [...inScope].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, parseInt(page ?? '1', 10) || 1), totalPages);
  const pageArticles = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  // Topics are scoped to the section, so an India page never advertises a tag
  // that only global articles carry.
  const topics = indexableTags(inScope);

  const heading = kind ? KIND_HEADING[kind] : market ? MARKET_HEADING[market] : 'All analysis';
  const blurb = kind ? KIND_BLURB[kind] : market ? MARKET_BLURB[market] : 'Every analysis, newest first.';
  // Must match the prerendered title in generate-og-files.py, and stay short:
  // the blurb belongs in the meta description, not the title (invariant 3.4).
  const title = kind
    ? (current === 1
        ? `${KIND_HEADING[kind]} — StocksFundamentals`
        : `${KIND_HEADING[kind]} — Page ${current} of ${totalPages}`)
    : market
    ? (current === 1
        ? `${MARKET_HEADING[market]} — StocksFundamentals`
        : `${MARKET_HEADING[market]} — Page ${current} of ${totalPages}`)
    : (current === 1
        ? 'All Analysis, Research & Policy Notes'
        : `All Analysis — Page ${current} of ${totalPages}`);
  const pageHref = (n: number) => (kind ? kindPath(kind, n) : sectionPath(market, n));
  const other = market ? otherMarket(market) : null;
  const otherK = kind ? otherKind(kind) : null;

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
          data-hov="lift"
        >
          <ArrowLeft size={14} /> Dashboard
        </Link>

        <header className="page-panel surface-card animate-in rounded-[2rem]">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--accent-glow)' }}>
            <Library size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl" style={{ color: 'var(--text)' }}>
            {heading}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {blurb}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-dim)' }}>
            {sorted.length} articles, newest first
            {totalPages > 1 && ` · page ${current} of ${totalPages}`}
          </p>
        </header>

        {/* Cross-link to the sibling beat. Keeps both sections one hop apart
            for a reader, and gives each a crawlable link to the other. */}
        {(other || otherK) && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {other && (
              <Link
                to={sectionPath(other)}
                className="text-sm font-bold no-underline"
                style={{ color: 'var(--accent)' }}
              >
                {MARKET_HEADING[other]} &rarr;
              </Link>
            )}
            {otherK && (
              <Link
                to={kindPath(otherK)}
                className="text-sm font-bold no-underline"
                style={{ color: 'var(--accent)' }}
              >
                {KIND_HEADING[otherK]} &rarr;
              </Link>
            )}
            {/* A kind section still offers the market cut, as links rather than
                as its own routes. The two axes stay one hop apart without
                multiplying into /research/india and friends. */}
            {kind && MARKETS.map((m) => (
              <Link
                key={m}
                to={sectionPath(m)}
                className="text-sm font-bold no-underline"
                style={{ color: 'var(--text-dim)' }}
              >
                {MARKET_HEADING[m]} &rarr;
              </Link>
            ))}
          </div>
        )}

        <section className="mt-6">
          <AnalysisGrid analyses={pageArticles} />
        </section>

        {totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Archive pages">
            {current > 1 && (
              <Link to={pageHref(current - 1)} style={pagerStyle(false)} aria-label="Previous page">
                <ArrowLeft size={15} />
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                to={pageHref(n)}
                style={pagerStyle(n === current)}
                aria-current={n === current ? 'page' : undefined}
              >
                {n}
              </Link>
            ))}
            {current < totalPages && (
              <Link to={pageHref(current + 1)} style={pagerStyle(false)} aria-label="Next page">
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
                  data-hov="chip"
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
