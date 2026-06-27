import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const navGroups = [
  {
    label: 'Research',
    links: [
      { to: '/', label: 'Home' },
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { to: '/disclaimer', label: 'Risk disclaimer' },
      { to: '/privacy', label: 'Privacy policy' },
    ],
  },
];

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        marginTop: '1rem',
      }}
    >
      <div className="app-container" style={{ padding: '3rem 1rem 2rem' }}>

        {/* Top: brand + nav */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '3rem',
          justifyContent: 'space-between', alignItems: 'flex-start',
        }}>

          {/* Brand */}
          <div style={{ maxWidth: '280px' }}>
            <Link
              to="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '0.75rem', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                color: 'var(--accent-contrast)',
              }}>
                <BarChart3 size={18} />
              </div>
              <span style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                StockFundamentals
              </span>
            </Link>
            <p style={{
              marginTop: '0.85rem', fontSize: '0.82rem', lineHeight: 1.75,
              color: 'var(--text-muted)',
            }}>
              Independent stock research — fundamental analysis, market context, and institutional tracking.
            </p>
            <p style={{
              marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span style={{
                display: 'inline-block', width: '6px', height: '6px',
                borderRadius: '50%', background: 'var(--green)',
                boxShadow: '0 0 6px var(--green)', flexShrink: 0,
              }} />
              Live library · updated regularly
            </p>
          </div>

          {/* Nav groups */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {navGroups.map(({ label, links }) => (
              <div key={label}>
                <p style={{
                  fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'var(--text-dim)', margin: '0 0 0.85rem',
                }}>
                  {label}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {links.map(({ to, label: linkLabel }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 150ms ease' }}
                        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        {linkLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '2.5rem 0 1.5rem' }} />

        {/* Bottom bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'space-between', gap: '0.75rem',
        }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>
            © {year} StockFundamentals · Built by <strong style={{ color: 'var(--text-muted)' }}>Pulkit Goel</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
            Not financial advice · Educational only
          </p>
        </div>

      </div>
    </footer>
  );
}
