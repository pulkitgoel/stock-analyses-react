import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Tag as TagIcon } from 'lucide-react';
import { getAnalyses } from '../services/analysisService';
import AnalysisGrid from '../components/Dashboard/AnalysisGrid';
import { articlesForTag, indexableTags, MIN_TAG_ARTICLES, tagPath, tagSlug } from '../utils/tags';

/** `policy-pulse` reads as `Policy Pulse`; already-capitalised tags pass through. */
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

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();

  const slug = tagSlug(tag ?? '');
  const matching = articlesForTag(analyses, slug);
  const label = matching.length
    ? matching[0].tags.find((t) => tagSlug(t) === slug) ?? slug
    : slug;
  const niceLabel = displayTag(label);

  // A thin tag page still renders for anyone following a link, but it is kept
  // out of the index rather than competing with the articles. Same rule as a
  // company hub below the research-coverage floor (invariant 3.7).
  const indexable = matching.length >= MIN_TAG_ARTICLES;

  const title = `${niceLabel} — Analysis & Research`;
  const related = indexableTags(analyses).filter((t) => t.slug !== slug);

  return (
    <>
      <Helmet>
        {/* Only the title is set here, and only so the browser tab updates
            during client-side navigation. Everything else a crawler needs
            (description, canonical, OG, JSON-LD) is in the prerendered file
            scripts/generate-og-files.py writes for this route. Emitting them
            here as well produced two of every tag - AGENTS.md invariant 3.2.

            The robots tag stays, and since 2026-10-12 a thin tag page carries
            it twice: every tag is now prerendered, a below-floor one with
            `noindex, follow` already in its head (7.8). Two identical noindex
            directives agree with each other, so this is not the conflicting
            duplication 3.2 guards against. See the longer note in
            CompanyPage.tsx. */}
        <title>{title}</title>
        {!indexable && <meta name="robots" content="noindex, follow" />}
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
            <TagIcon size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl" style={{ color: 'var(--text)' }}>
            {niceLabel}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {matching.length} article{matching.length !== 1 ? 's' : ''} tagged {label}
          </p>
        </header>

        {matching.length === 0 ? (
          <div className="surface-plain mt-5 rounded-2xl px-5 py-14 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
            Nothing tagged {niceLabel} yet.
          </div>
        ) : (
          <section className="mt-6">
            {/* Every match, not the default nine: this page exists to be
                crawled, and a crawler never clicks "Show more". */}
            <AnalysisGrid analyses={matching} initialCount={matching.length} />
          </section>
        )}

        {related.length > 0 && (
          <section className="animate-in mt-12" style={{ marginTop: '3rem' }}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
              Browse other topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {related.map((t) => (
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
