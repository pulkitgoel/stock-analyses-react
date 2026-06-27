import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BookOpen, Sparkles } from 'lucide-react';
import { useAnalyses } from '../hooks/useAnalyses';
import { useSearch } from '../hooks/useSearch';
import { useNotification } from '../hooks/useNotification';

import AnalysisGrid from '../components/Dashboard/AnalysisGrid';
import SubscribeCard from '../components/Common/SubscribeCard';
import SearchBar from '../components/Home/SearchBar';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import heroImage from '../assets/hero.png';

export default function HomePage() {
  const { analyses, loading, error } = useAnalyses();
  const { query, setQuery, sortMode, setSortMode, filtered } = useSearch(analyses);
  const { subscribed, supported, loading: notifLoading, subscribe, unsubscribe } = useNotification();
  const allTags = useMemo(() => analyses.flatMap(a => a.tags), [analyses]);
  const latest = useMemo(() => [...analyses].sort((a, b) => b.date.localeCompare(a.date))[0], [analyses]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="surface-card mx-auto max-w-xl rounded-3xl px-6 py-16 text-center" style={{ color: 'var(--text-muted)' }}>
        <p className="text-base font-black" style={{ color: 'var(--text)' }}>Failed to load analyses.</p>
        <p className="mt-2 text-sm">Check that the API server is available at /api/analyses.</p>
      </div>
    );
  }

  const stats = [
    { label: 'Deep dives', value: analyses.filter(a => a.tags.includes('deep-dive')).length },
    { label: 'Market notes', value: analyses.filter(a => a.tags.includes('market-analysis')).length },
    { label: 'Themes tracked', value: new Set(allTags).size },
  ];

  return (
    <>
      <Helmet>
        <title>stocksfundamentals.online - Premium Stock Research</title>
        <meta name="description" content="Premium stock research library with deep-dives, market notes, institutional activity, and valuation views." />
      </Helmet>

      <div className="mx-auto max-w-7xl">
        <section
          className="animate-in"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '2rem',
            padding: '3rem 2.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* ambient glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0, borderRadius: '2rem',
              background: 'radial-gradient(ellipse 45% 55% at 85% 15%, rgba(99,230,190,0.12) 0%, transparent 65%)',
              pointerEvents: 'none', zIndex: 0,
            }}
          />

          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', flexWrap: 'wrap', gap: '3rem',
            alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ flex: '1 1 500px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--accent-glow)', color: 'var(--accent)',
                padding: '6px 14px', borderRadius: '999px',
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em',
                textTransform: 'uppercase', marginBottom: '1.5rem',
                border: '1px solid rgba(99,230,190,0.2)'
              }}>
                <Sparkles size={14} />
                Independent research desk
              </div>
              
              <h1 style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
                fontWeight: 900, lineHeight: 1.1,
                letterSpacing: '-0.03em', color: 'var(--text)',
                margin: 0
              }}>
                Markets move fast.<br />
                <span style={{ color: 'var(--accent)' }}>Research should stay sharp.</span>
              </h1>
              
              <p style={{
                marginTop: '1.25rem', fontSize: '1.05rem', lineHeight: 1.8,
                color: 'var(--text-muted)', maxWidth: '600px'
              }}>
                Deep-dives, valuation calls, institutional activity, and market notes presented like a clean research terminal.
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <a
                  href="#library"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    height: '48px', padding: '0 24px', borderRadius: '14px',
                    background: 'var(--accent)', color: 'var(--accent-contrast)',
                    fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none',
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
                  Explore research <ArrowRight size={16} />
                </a>
                {latest && (
                  <Link
                    to={`/analysis/${latest.slug}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      height: '48px', padding: '0 24px', borderRadius: '14px',
                      background: 'transparent', color: 'var(--text)',
                      fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
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
                    Latest note <BookOpen size={16} />
                  </Link>
                )}
              </div>
            </div>

            <div style={{
              flex: '1 1 340px', maxWidth: '440px',
              position: 'relative', overflow: 'hidden', borderRadius: '1.5rem',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{
                position: 'absolute', left: '1.25rem', top: '1.25rem', zIndex: 10,
                background: 'var(--accent)', color: 'var(--accent-contrast)',
                padding: '6px 12px', borderRadius: '12px',
                fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.05em'
              }}>
                LIVE LIBRARY
              </div>
              <div style={{ padding: '3rem 1.5rem 2rem', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={heroImage}
                  alt="Layered research stack"
                  style={{ height: '180px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }}
                />
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem',
                padding: '0 1.25rem 1.25rem'
              }}>
                {stats.map((stat) => (
                  <div key={stat.label} style={{
                    background: 'var(--surface-soft)', borderRadius: '12px',
                    padding: '1rem 0.5rem', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>{stat.value}</div>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="library" className="animate-in animate-in-delay-1" style={{ marginTop: '3rem' }}>
          <div className="library-panel surface-card rounded-[2rem]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} style={{ color: 'var(--accent)' }} />
                  <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Research library</h2>
                </div>
                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text-dim)' }}>
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''} of {analyses.length} notes
                </p>
              </div>
              <SearchBar query={query} onQueryChange={setQuery} sortMode={sortMode} onSortChange={setSortMode} />
            </div>
          </div>
        </section>

        <section className="animate-in animate-in-delay-2" style={{ marginTop: '3rem' }}>
          {filtered.length === 0 ? (
            <div className="surface-card rounded-[2rem] px-6 py-16 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
              No analyses match your filters.
            </div>
          ) : (
            <AnalysisGrid analyses={filtered} />
          )}
        </section>

        <div className="animate-in animate-in-delay-3" style={{ marginTop: '3rem' }}>
          <SubscribeCard
            subscribed={subscribed}
            supported={supported}
            loading={notifLoading}
            onSubscribe={subscribe}
            onUnsubscribe={unsubscribe}
          />
        </div>
      </div>
    </>
  );
}
