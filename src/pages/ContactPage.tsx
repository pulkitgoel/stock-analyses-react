import { Mail, MessageCircle, Clock, ArrowUpRight } from 'lucide-react';

const channels = [
  {
    icon: Mail,
    label: 'Email',
    value: 'pulkitgoel28@gmail.com',
    href: 'mailto:pulkitgoel28@gmail.com',
    desc: 'Best for stock requests, errors, or collaboration',
    badge: 'Preferred',
  },
];

const faqs = [
  {
    q: 'Can I request a stock analysis?',
    a: 'Yes! Email with the ticker and what angle you want covered — fundamental, technical, or both.',
  },
  {
    q: 'How often do you publish?',
    a: 'Typically a few notes per week, triggered by earnings, macro events, or interesting setups.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. All content is for educational purposes only. See the Risk disclaimer for full details.',
  },
];

export default function ContactPage() {
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
          position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px',
          borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--accent-glow)', color: 'var(--accent)',
          padding: '5px 14px', borderRadius: '999px',
          fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: '1.25rem', position: 'relative',
        }}>
          <MessageCircle size={13} /> Get in touch
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 900,
          letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1,
          position: 'relative', margin: 0,
        }}>
          Let's talk stocks.
        </h1>
        <p style={{
          marginTop: '1rem', fontSize: '0.95rem', lineHeight: 1.8,
          color: 'var(--text-muted)', maxWidth: '480px', position: 'relative',
        }}>
          Have a stock request, found an error, or want to collaborate? Reach out — I read everything.
        </p>
      </section>

      {/* Contact channels */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {channels.map(({ icon: Icon, label, value, href, desc, badge }) => (
          <a
            key={label}
            href={href}
            style={{
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '1.5rem', padding: '1.5rem', textDecoration: 'none',
              transition: 'border-color 180ms ease, transform 180ms ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: '1rem', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
              color: 'var(--accent-contrast)',
              boxShadow: '0 6px 20px rgba(99,230,190,0.2)',
            }}>
              <Icon size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                {badge && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '999px',
                  }}>{badge}</span>
                )}
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: 0, wordBreak: 'break-all' }}>{value}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{desc}</p>
            </div>
            <ArrowUpRight size={18} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
          </a>
        ))}
      </div>

      {/* Response time note */}
      <div style={{
        marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'var(--surface-soft)', border: '1px solid var(--border)',
        borderRadius: '1rem', padding: '1rem 1.25rem',
      }}>
        <Clock size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Typical response time: <strong style={{ color: 'var(--text)' }}>24–48 hours</strong>. I try to respond to every message.
        </p>
      </div>

      {/* FAQs */}
      <div style={{ marginTop: '2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>
          Common questions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map(({ q, a }) => (
            <div
              key={q}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '1.25rem', padding: '1.25rem 1.5rem',
              }}
            >
              <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', margin: '0 0 6px' }}>{q}</p>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: 'var(--text-muted)', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
