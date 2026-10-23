import { Link } from 'react-router-dom';
import { Analysis } from '../../types/analysis';
import { AUTHOR_NAME, aiDisclosureFor } from '../../config/disclosure';
import { displayDate } from '../../utils/articleDisplay';
import { MARKET_LABEL, sectionPath } from '../../utils/market';
import { kindOf } from '../../utils/kind';

/**
 * The band that opens an article. DESIGN.md section 4.
 *
 * One solid `--accent-deep` plane carrying breadcrumb, eyebrow, the single `h1`,
 * the byline and the lead, then the page drops straight to the normal canvas.
 * It is the only saturated surface on the page, and it is the element that makes
 * an article look like the approved design rather than like a card on a dark
 * page — 7.15 exists because it was specified in Appendix B step 5 and not built.
 *
 * It replaces the `page-panel surface-card rounded-lg` header, so there is no
 * nested panel: full-bleed, square-cornered, flat.
 *
 * Invariants: this owns the page's one `h1` (3.8), and emits no head tags —
 * `generate-og-files.py` owns title, canonical, OG and JSON-LD (3.2).
 */
export default function ArticleBand({
  analysis: a,
  readTime,
}: {
  analysis: Analysis;
  readTime: number;
}) {
  const aiNotice = aiDisclosureFor(a.model);
  const market = a.market ? MARKET_LABEL[a.market] : null;
  const eyebrow = [kindOf(a) === 'pulse' ? 'Daily Pulse' : 'Deep dive', market]
    .filter(Boolean)
    .join(' · ');

  return (
    <section
      style={{
        background: 'var(--accent-deep)',
        color: '#ffffff',
        // Full-bleed out of the centred container, so the band spans the viewport
        // the way the mockup does rather than sitting inside the page gutter.
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        paddingLeft: 'max(1rem, calc(50vw - 620px))',
        paddingRight: 'max(1rem, calc(50vw - 620px))',
        paddingTop: '1.5rem',
        paddingBottom: '1.75rem',
      }}
    >
      <nav
        className="text-xs"
        style={{ color: 'var(--accent-on-deep)', marginBottom: '0.75rem' }}
        aria-label="Breadcrumb"
      >
        <Link to="/" style={{ color: 'var(--accent-on-deep)' }}>Home</Link>
        {a.market && (
          <>
            <span aria-hidden> › </span>
            <Link to={sectionPath(a.market)} style={{ color: 'var(--accent-on-deep)' }}>
              {MARKET_LABEL[a.market]}
            </Link>
          </>
        )}
      </nav>

      <span
        className="block text-xs font-bold uppercase"
        style={{ color: 'var(--accent-on-deep)', letterSpacing: '0.06em', marginBottom: '0.6rem' }}
      >
        {eyebrow}
      </span>

      <h1
        style={{
          color: '#ffffff',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          margin: 0,
          maxWidth: '26ch',
        }}
      >
        {a.title}
      </h1>

      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-2"
        style={{ marginTop: '0.9rem', color: 'var(--accent-on-deep)' }}
      >
        <span className="text-sm font-bold" style={{ color: '#ffffff' }}>{AUTHOR_NAME}</span>
        <span data-nums className="text-xs font-semibold">
          Published {displayDate(a.date)}
          {a.updated && a.updated !== a.date ? ` · Updated ${displayDate(a.updated)}` : ''}
        </span>
        <span data-nums className="text-xs font-semibold">{readTime} min read</span>
        {/* Owner decision (section 6); renders only once disclosure.ts sets it. */}
        {aiNotice && (
          <span
            className="text-xs font-semibold"
            style={{
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: '4px',
              padding: '2px 8px',
              color: '#ffffff',
            }}
          >
            {aiNotice}
          </span>
        )}
      </div>

      <p
        style={{
          marginTop: '0.9rem',
          marginBottom: 0,
          fontSize: '1.0625rem',
          lineHeight: 1.55,
          color: '#eaf6f3',
          maxWidth: '62ch',
        }}
      >
        {a.summary}
      </p>
    </section>
  );
}
