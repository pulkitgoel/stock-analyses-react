import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, SearchX } from 'lucide-react';

/**
 * Catch-all route for unmatched paths.
 *
 * Before this existed, nginx served index.html for every unknown URL and the
 * router rendered nothing, so any typo returned HTTP 200 with an empty page.
 * Google treats those as soft 404s and will crawl an unlimited number of them.
 *
 * This page emits `noindex` so the URL is kept out of the index. It cannot send
 * a real 404 status, because the status is set by the server: nginx must also be
 * configured to 404 unmatched paths. See docs/nginx-seo.conf.
 */
export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page not found — StocksFundamentals</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="mx-auto max-w-2xl">
        <header className="page-panel surface-card animate-in rounded-[2rem] text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--accent-glow)' }}>
            <SearchX size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: 'var(--text)' }}>
            Page not found
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
            That URL does not match any analysis, company or page on this site. It may have
            been renamed, or the link may be incomplete.
          </p>

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
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            <ArrowLeft size={16} /> Browse research
          </Link>
        </header>
      </div>
    </>
  );
}
