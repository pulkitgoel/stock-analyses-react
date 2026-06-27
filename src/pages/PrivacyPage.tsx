import { Link } from 'react-router-dom';
import { FileText, Bell, BarChart2, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

const sections = [
  {
    icon: Bell,
    title: 'Push notifications',
    body: 'If you choose to subscribe to push alerts, your browser\'s push subscription endpoint is stored solely to send you notifications when new analyses are published. This data is never sold or shared. You can unsubscribe at any time from the home page.',
  },
  {
    icon: BarChart2,
    title: 'Analytics & tracking',
    body: 'This site does not use Google Analytics, Facebook Pixel, or any third-party behavioural tracking. No cookies are placed for visitor profiling or advertising purposes.',
  },
  {
    icon: Mail,
    title: 'Contact data',
    body: 'If you email directly, your email address is used only to respond to your message. It is not added to any mailing list without explicit consent.',
  },
];

const promises = [
  'No third-party ad trackers',
  'No cookies for profiling',
  'No email harvesting',
  'Push data stored minimally',
  'Unsubscribe anytime, instantly',
];

export default function PrivacyPage() {
  return (
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
          position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px',
          borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(55px)', pointerEvents: 'none',
        }} />

        <div style={{
          width: '52px', height: '52px', borderRadius: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
          color: 'var(--accent-contrast)',
          boxShadow: '0 8px 24px rgba(99,230,190,0.2)',
          marginBottom: '1.25rem', position: 'relative',
        }}>
          <FileText size={24} />
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900,
          letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1,
          position: 'relative', margin: 0,
        }}>
          Privacy policy
        </h1>
        <p style={{
          marginTop: '1rem', fontSize: '0.95rem', lineHeight: 1.8,
          color: 'var(--text-muted)', maxWidth: '500px', position: 'relative',
        }}>
          Short version: this site collects almost nothing and respects your privacy completely.
        </p>
      </section>

      {/* Promises strip */}
      <div style={{
        marginTop: '1.5rem',
        background: 'var(--accent-glow)', border: '1px solid rgba(99,230,190,0.2)',
        borderRadius: '1.25rem', padding: '1.25rem 1.5rem',
        display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem',
      }}>
        {promises.map((p) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{p}</span>
          </div>
        ))}
      </div>

      {/* Detail sections */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sections.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '1.5rem', padding: '1.5rem',
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '0.875rem', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent-glow)', color: 'var(--accent)',
            }}>
              <Icon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: 'var(--text-muted)', margin: 0 }}>{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact for questions */}
      <div style={{
        marginTop: '1.5rem',
        background: 'var(--surface-soft)', border: '1px solid var(--border)',
        borderRadius: '1.25rem', padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>Privacy questions?</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Reach out directly and I'll respond within 48 hours.</p>
        </div>
        <a href="mailto:pulkitgoel28@gmail.com" className="btn btn-primary">
          Email Pulkit <ArrowRight size={14} />
        </a>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <Link to="/" className="btn btn-secondary">
          ← Back home
        </Link>
      </div>

    </div>
  );
}
