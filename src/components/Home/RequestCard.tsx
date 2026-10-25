import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * The homepage entry point to /request-research.
 *
 * It sits at the foot of the library because that is where a reader who has
 * just failed to find their company is standing. Nothing linked to /watchlist
 * for months and AGENTS.md 7.6 still lists that as a defect; this is the same
 * mistake waiting to happen, so the page gets an entry point in the same change
 * that creates it.
 */
export default function RequestCard() {
  return (
    <div
      className="surface-card"
      style={{
        borderRadius: 'var(--radius)',
        border: '1px solid color-mix(in srgb, var(--accent) 34%, transparent)',
        background: 'linear-gradient(140deg, var(--accent-glow), transparent 70%), var(--bg-card)',
        padding: '1.6rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 320px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <Sparkles size={16} style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.09em', color: 'var(--accent)' }}>
            RESEARCH QUEUE
          </span>
        </div>
        <h2 style={{
          margin: '0.6rem 0 0', fontSize: '1.25rem', fontWeight: 700,
          lineHeight: 1.25, letterSpacing: '-0.015em',
        }}>
          Nothing here on the company you hold?
        </h2>
        <p style={{ margin: '0.45rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Put it in the queue, and watch it get written.
        </p>
      </div>

      <Link to="/request-research" className="btn btn-primary" style={{ flexShrink: 0 }}>
        Request research
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
