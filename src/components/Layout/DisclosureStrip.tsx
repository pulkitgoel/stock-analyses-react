import { Link } from 'react-router-dom';
import { NOT_ADVICE, REGISTRATION_STATUS } from '../../config/disclosure';

/**
 * A persistent disclosure line above the footer. DESIGN.md section 4, AGENTS 7.14.
 *
 * This is YMYL content: the site publishes verdicts with support and resistance
 * levels, and until now the only statement of what that is and is not lived at
 * the bottom of an article (7.4) or behind a footer link. A reader landing on a
 * company hub or the watchlist saw neither.
 *
 * It carries ONLY what the site already publishes. `NOT_ADVICE` is the same
 * position as the per-article line and as /disclaimer itself, so it is a
 * placement change, not a new claim.
 *
 * `REGISTRATION_STATUS` is the owner's call (section 6) and is null, so the
 * clause is omitted rather than rendered empty or bracketed. DESIGN.md wrote
 * "Not a SEBI-registered research analyst" into this strip as a layout
 * placeholder; that is one of the two possible answers, not a default, and
 * asserting it would be making a legal claim on the owner's behalf.
 *
 * Static markup with no data dependency and no web font of its own, so it cannot
 * reintroduce the layout shift 7.9 removed.
 */
export default function DisclosureStrip() {
  return (
    <aside
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-soft)',
        padding: '0.875rem 0',
      }}
    >
      <div className="app-container">
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)', margin: 0 }}>
          {NOT_ADVICE}
          {REGISTRATION_STATUS ? ` ${REGISTRATION_STATUS}.` : ''}{' '}
          <Link to="/disclaimer" data-hov="accent" style={{ color: 'var(--text-muted)' }}>
            Disclaimer
          </Link>
          {' · '}
          <Link to="/about" data-hov="accent" style={{ color: 'var(--text-muted)' }}>
            About
          </Link>
          {' · '}
          <Link to="/contact" data-hov="accent" style={{ color: 'var(--text-muted)' }}>
            Contact
          </Link>
        </p>
      </div>
    </aside>
  );
}
