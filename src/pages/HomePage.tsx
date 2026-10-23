import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BookOpen } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useNotification } from '../hooks/useNotification';
import { getAnalyses } from '../services/analysisService';

import AnalysisGrid from '../components/Dashboard/AnalysisGrid';
import SubscribeCard from '../components/Common/SubscribeCard';
import SearchBar from '../components/Home/SearchBar';
import CategoryTabs from '../components/Home/CategoryTabs';

// The catalogue is a bundled constant, so it is read at module scope: there is
// no loading state to render and no spinner frame between the prerendered page
// and the client's first paint. See the note in services/analysisService.ts.
const analyses = getAnalyses();

export default function HomePage() {
  const { query, setQuery, sortMode, setSortMode, category, setCategory, counts, filtered } = useSearch(analyses);
  const { subscribed, supported, loading: notifLoading, subscribe, unsubscribe } = useNotification();
  const allTags = useMemo(() => analyses.flatMap(a => a.tags), [analyses]);
  const latest = useMemo(() => [...analyses].sort((a, b) => b.date.localeCompare(a.date))[0], [analyses]);

  const stats = [
    { label: 'Stock research', value: counts.stocks },
    { label: 'Policy Pulse', value: counts.policy },
    { label: 'Themes tracked', value: new Set(allTags).size },
  ];

  const categoryTotal = category === 'all' ? counts.all : category === 'stocks' ? counts.stocks : counts.policy;
  const categoryLabel = category === 'policy' ? 'Policy Pulse notes' : category === 'stocks' ? 'research notes' : 'notes';

  return (
    <>
      {/* Title and description are kept identical to the fallback tags in
          index.html. They previously disagreed ("Deep-Dive Stock Research by
          Pulkit" vs "Premium Stock Research"), which put two different
          positioning statements on the same page. */}
      <Helmet>
        <title>StocksFundamentals — Indian Stock Research & Global Macro</title>
        <meta name="description" content="Independent deep-dive research on Indian stocks - NSE delivery data, promoter trends, quarterly results - plus daily US and global macro for investors holding both." />
        <link rel="canonical" href="https://stocksfundamentals.online/" />
        <meta property="og:title" content="StocksFundamentals — Indian Stock Research & Global Macro" />
        <meta property="og:description" content="Independent deep-dive research on Indian stocks - NSE delivery data, promoter trends, quarterly results - plus daily US and global macro for investors holding both." />
        <meta property="og:url" content="https://stocksfundamentals.online/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://stocksfundamentals.online/og-default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="StocksFundamentals — Indian Stock Research & Global Macro" />
        <meta name="twitter:description" content="Independent deep-dive research on Indian stocks - NSE delivery data, promoter trends, quarterly results - plus daily US and global macro for investors holding both." />
        <meta name="twitter:image" content="https://stocksfundamentals.online/og-default.png" />
        {/* One graph giving Google and AI systems a single consistent publisher
            and author entity. Add profile URLs to `sameAs` as they exist: an
            author an AI cannot resolve is the main limit on being cited. */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                '@id': 'https://stocksfundamentals.online/#website',
                name: 'StocksFundamentals',
                url: 'https://stocksfundamentals.online/',
                description: 'Independent deep-dive research on Indian stocks - NSE delivery data, promoter trends, quarterly results - plus daily US and global macro for investors holding both.',
                inLanguage: 'en-IN',
                publisher: { '@id': 'https://stocksfundamentals.online/#organization' },
              },
              {
                '@type': 'Organization',
                '@id': 'https://stocksfundamentals.online/#organization',
                name: 'StocksFundamentals',
                url: 'https://stocksfundamentals.online/',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://stocksfundamentals.online/og-default.png',
                },
                founder: { '@id': 'https://stocksfundamentals.online/#author' },
              },
              {
                '@type': 'Person',
                '@id': 'https://stocksfundamentals.online/#author',
                name: 'Pulkit Goel',
                url: 'https://stocksfundamentals.online/about',
                jobTitle: 'Independent investor and researcher',
                knowsAbout: ['Indian equities', 'Fundamental analysis', 'NSE delivery data', 'Promoter holdings'],
              },
            ],
          })}
        </script>
      </Helmet>

      <div className="mx-auto max-w-7xl">
        {/* Masthead, not a hero. DESIGN.md step 3.

            The card this replaces held a 343x361 decorative PNG that was the mobile LCP
            element. After 7.11 the live site measured FCP 2.93s against LCP 3.38s - the
            450ms gap was this image loading after first paint, where 7.9 had measured the
            two as equal. Nothing above the fold is an image now, so the LCP candidate is
            text and paints with the first CSS.

            The h1 also says what the site is. "Markets move fast. Research should stay
            sharp." never mentioned Indian equities, while the title and description both
            lead with them (7.7). */}
        <section style={{ paddingTop: '0.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800, lineHeight: 1.15,
            letterSpacing: '-0.02em', color: 'var(--text)',
            margin: 0, maxWidth: '20ch',
          }}>
            Indian stock research, and the global macro that moves it.
          </h1>

          <p style={{
            marginTop: '0.85rem', fontSize: '1.05rem', lineHeight: 1.6,
            color: 'var(--text-muted)', maxWidth: '58ch',
          }}>
            Deep dives on NSE delivery data, promoter trends and quarterly results, plus a
            daily policy note on what Delhi and Washington did and which tickers it moves.
            Written by Pulkit Goel.
          </p>

          <p data-nums style={{
            marginTop: '0.85rem', fontSize: '0.8125rem', fontWeight: 600,
            color: 'var(--text-dim)',
          }}>
            {stats.map((stat, i) => (
              <span key={stat.label}>
                {i > 0 && <span style={{ margin: '0 0.5rem' }}>&middot;</span>}
                {stat.value} {stat.label.toLowerCase()}
              </span>
            ))}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <a href="#library" className="btn btn-primary">
              Browse research <ArrowRight size={16} />
            </a>
            {latest && (
              <Link to={`/analysis/${latest.slug}`} className="btn btn-secondary">
                Latest note <BookOpen size={16} />
              </Link>
            )}
          </div>
        </section>

        <section id="library" className="animate-in animate-in-delay-1" style={{ marginTop: '3rem' }}>
          <div className="library-panel surface-card rounded-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} style={{ color: 'var(--accent)' }} />
                  <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Research library</h2>
                </div>
                <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text-dim)' }}>
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''} of {categoryTotal} {categoryLabel}
                </p>
              </div>
              <SearchBar query={query} onQueryChange={setQuery} sortMode={sortMode} onSortChange={setSortMode} />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <CategoryTabs category={category} onCategoryChange={setCategory} counts={counts} />
            </div>
          </div>
        </section>

        <section className="animate-in animate-in-delay-2" style={{ marginTop: '3rem' }}>
          {filtered.length === 0 ? (
            <div className="surface-card rounded-lg px-6 py-16 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
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
