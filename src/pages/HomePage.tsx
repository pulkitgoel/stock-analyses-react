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
        <section className="hero-card surface-card premium-card animate-in rounded-[2rem]">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-center">
            <div className="hero-copy">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-black uppercase tracking-wide"
                style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
              >
                <Sparkles size={14} />
                Independent research desk
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--text)' }}>
                Markets move fast. Research should stay sharp.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 sm:text-lg" style={{ color: 'var(--text-muted)' }}>
                Deep-dives, valuation calls, institutional activity, and market notes presented like a clean research terminal.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#library"
                  className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black no-underline transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
                >
                  Explore research <ArrowRight size={17} />
                </a>
                {latest && (
                  <Link
                    to={`/analysis/${latest.slug}`}
                    className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black no-underline transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ background: 'var(--surface-soft)', color: 'var(--text)' }}
                  >
                    Latest note <BookOpen size={17} />
                  </Link>
                )}
              </div>
            </div>

            <div className="hero-visual relative min-h-[320px] overflow-hidden rounded-[1.75rem]" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="absolute left-5 top-5 z-10 rounded-2xl px-3 py-2 text-xs font-black" style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}>
                LIVE LIBRARY
              </div>
              <img
                src={heroImage}
                alt="Layered research stack"
                className="mx-auto mt-10 h-48 w-auto object-contain drop-shadow-2xl sm:h-56"
              />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="mini-panel rounded-2xl text-center" style={{ background: 'var(--surface-soft)' }}>
                    <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{stat.value}</div>
                    <div className="mt-1 text-[0.63rem] font-black uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>{stat.label}</div>
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
