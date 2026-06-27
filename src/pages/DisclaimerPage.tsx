import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, BookOpen, TrendingDown, ArrowRight } from 'lucide-react';

const points = [
  {
    icon: AlertTriangle,
    title: 'Not financial advice',
    body: 'All content on this site is strictly for educational and informational purposes. Nothing here constitutes a recommendation to buy, sell, or hold any security.',
    accent: 'var(--yellow)',
    accentBg: 'rgba(246,196,83,0.10)',
  },
  {
    icon: BookOpen,
    title: 'Public data only',
    body: 'Analyses are based on publicly available data — company filings, exchange data, news sources, and personal research. Accuracy and timeliness are not guaranteed.',
    accent: 'var(--accent)',
    accentBg: 'var(--accent-glow)',
  },
  {
    icon: TrendingDown,
    title: 'Capital at risk',
    body: 'Investing in equities and markets carries significant risk, including the possible loss of your entire principal. Always do your own due diligence.',
    accent: 'var(--red)',
    accentBg: 'rgba(255,107,107,0.10)',
  },
];

export default function DisclaimerPage() {
  return (
    <>
      <Helmet>
        <title>Risk Disclaimer — StockFundamentals</title>
        <meta name="description" content="Risk disclaimer and terms of use for StockFundamentals research." />
        <link rel="canonical" href="https://stocksfundamentals.online/disclaimer" />
        <meta property="og:title" content="Risk Disclaimer — StockFundamentals" />
        <meta property="og:description" content="Risk disclaimer and terms of use for StockFundamentals research." />
        <meta property="og:url" content="https://stocksfundamentals.online/disclaimer" />
      </Helmet>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* Header */}
      <section
        className="animate-in"
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '2rem', padding: '2.5rem',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px',
          borderRadius: '50%', background: 'rgba(246,196,83,0.08)', filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div style={{
          width: '52px', height: '52px', borderRadius: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(246,196,83,0.12)', marginBottom: '1.25rem', position: 'relative',
        }}>
          <ShieldCheck size={24} style={{ color: 'var(--yellow)' }} />
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900,
          letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1,
          position: 'relative', margin: 0,
        }}>
          Risk disclaimer
        </h1>
        <p style={{
          marginTop: '1rem', fontSize: '0.95rem', lineHeight: 1.8,
          color: 'var(--text-muted)', maxWidth: '520px', position: 'relative',
        }}>
          Before reading any analysis on this site, please understand the nature of the content and your responsibilities as an investor.
        </p>
      </section>

      {/* Risk cards */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {points.map(({ icon: Icon, title, body, accent, accentBg }) => (
          <div
            key={title}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '1.5rem', padding: '1.5rem',
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: '46px', height: '46px', borderRadius: '0.875rem', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: accentBg, color: accent,
            }}>
              <Icon size={21} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: 'var(--text-muted)', margin: 0 }}>{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Positions disclosure */}
      <div style={{
        marginTop: '1.5rem',
        background: 'rgba(246,196,83,0.06)',
        border: '1px solid rgba(246,196,83,0.2)',
        borderRadius: '1.25rem', padding: '1.25rem 1.5rem',
      }}>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: 'var(--text-muted)', margin: 0 }}>
          <strong style={{ color: 'var(--yellow)' }}>Disclosure:</strong> The author may hold positions in securities discussed on this site at the time of publication. This does not constitute a conflict of interest disclosure sufficient for professional advice.
        </p>
      </div>

      {/* CTA */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary">
          Read research <ArrowRight size={16} />
        </Link>
      </div>

      </div>
    </>
  );
}
