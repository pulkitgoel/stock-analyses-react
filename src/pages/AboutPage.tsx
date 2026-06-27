import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, FileSearch, Lightbulb, ArrowRight, Mail, User } from 'lucide-react';

const pillars = [
  {
    icon: FileSearch,
    title: 'Fundamental analysis',
    desc: 'Valuation multiples, cash flow quality, balance sheet strength, and growth trajectory — distilled into clear, actionable notes.',
    color: 'var(--accent)',
    bg: 'var(--accent-glow)',
  },
  {
    icon: TrendingUp,
    title: 'Market context',
    desc: 'Institutional activity, delivery volume, quarterly results, and technical setup — all in one place to build full conviction.',
    color: 'var(--accent)',
    bg: 'var(--accent-glow)',
  },
  {
    icon: Lightbulb,
    title: 'Plain-language clarity',
    desc: 'No jargon, no noise. Research notes written for fast decision-making by investors of any experience level.',
    color: 'var(--accent)',
    bg: 'var(--accent-glow)',
  },
];

const cardBase: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '1.5rem',
  padding: '1.75rem 2rem',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Hero ── */}
      <section
        className="animate-in"
        style={{
          ...cardBase,
          borderRadius: '2rem',
          padding: '3rem 2.5rem',
          position: 'relative',
        }}
      >
        {/* ambient glow — z-index 0, sits behind all content */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, borderRadius: '2rem',
            background: 'radial-gradient(ellipse 55% 45% at 95% 10%, rgba(99,230,190,0.13) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }}
        />

        {/* all content at z-index 1 */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* icon + badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
              color: 'var(--accent-contrast)',
              boxShadow: '0 6px 20px rgba(99,230,190,0.3)',
            }}>
              <BarChart3 size={22} />
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'var(--accent)',
              background: 'var(--accent-glow)',
              padding: '5px 14px', borderRadius: '999px',
              border: '1px solid rgba(99,230,190,0.2)',
            }}>
              Independent research desk
            </span>
          </div>

          {/* headline */}
          <h1 style={{
            fontSize: 'clamp(1.9rem, 4.5vw, 2.9rem)',
            fontWeight: 900, lineHeight: 1.1,
            letterSpacing: '-0.03em', color: 'var(--text)',
            margin: 0,
          }}>
            Stock research, sharp &amp;{' '}
            <span style={{
              color: 'var(--accent)',
              display: 'inline-block',
            }}>
              without the noise.
            </span>
          </h1>

          {/* description */}
          <p style={{
            marginTop: '1.25rem',
            fontSize: '1rem', lineHeight: 1.85,
            color: 'var(--text-muted)',
            maxWidth: '580px',
          }}>
            StockFundamentals is a personal research library built by{' '}
            <strong style={{ color: 'var(--text)', fontWeight: 800 }}>Pulkit Goel</strong>{' '}
            for investors who want data-backed notes — without noisy dashboards or clickbait headlines.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                height: '46px', padding: '0 22px', borderRadius: '14px',
                background: 'var(--accent)', color: 'var(--accent-contrast)',
                fontWeight: 800, fontSize: '0.875rem', textDecoration: 'none',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                boxShadow: '0 4px 14px rgba(99,230,190,0.25)',
                fontFamily: 'inherit',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,230,190,0.35)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,230,190,0.25)';
              }}
            >
              Browse research <ArrowRight size={16} />
            </Link>
            <a
              href="mailto:pulkitgoel28@gmail.com"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                height: '46px', padding: '0 22px', borderRadius: '14px',
                background: 'transparent', color: 'var(--text)',
                fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
                border: '1px solid var(--border)',
                transition: 'border-color 180ms ease, transform 180ms ease',
                fontFamily: 'inherit',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <Mail size={15} /> Say hello
            </a>
          </div>
        </div>
      </section>

      {/* ── Pillars — stacked column on mobile, row on desktop ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{
          fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0,
        }}>
          What this covers
        </p>

        {/* On wider screens show as 3-col row; safe CSS without breakpoint classes */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {pillars.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              style={{
                ...cardBase,
                flex: '1 1 220px',   /* grows to fill, minimum 220px before wrapping */
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bg, color,
                flexShrink: 0,
              }}>
                <Icon size={19} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.855rem', lineHeight: 1.8, color: 'var(--text-muted)', margin: 0 }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Creator card ── */}
      <div style={{
        ...cardBase,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        {/* avatar + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            color: 'var(--accent-contrast)',
            fontSize: '1.25rem', fontWeight: 900,
          }}>
            <User size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', margin: 0 }}>
              Built by
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)', margin: '2px 0 0', lineHeight: 1.2 }}>
              Pulkit Goel
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Independent investor &amp; researcher · India
            </p>
          </div>
        </div>

        {/* email button */}
        <a
          href="mailto:pulkitgoel28@gmail.com"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            height: '40px', padding: '0 18px', borderRadius: '12px',
            background: 'var(--surface-soft)', color: 'var(--text)',
            fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
            border: '1px solid var(--border)',
            transition: 'border-color 180ms ease',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <Mail size={14} /> pulkitgoel28@gmail.com
        </a>
      </div>

    </div>
  );
}
