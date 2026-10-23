import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useNotification } from '../hooks/useNotification';
import { getAnalyses } from '../services/analysisService';

import ResearchCard from '../components/Dashboard/ResearchCard';
import PulseRow from '../components/Dashboard/PulseRow';
import SegmentedControl from '../components/Home/SegmentedControl';
import { kindOf } from '../utils/kind';
import { useReveal } from '../hooks/useReveal';
import SubscribeCard from '../components/Common/SubscribeCard';

// The catalogue is a bundled constant, so it is read at module scope: there is
// no loading state to render and no spinner frame between the prerendered page
// and the client's first paint. See the note in services/analysisService.ts.
const analyses = getAnalyses();

export default function HomePage() {
  const { counts } = useSearch(analyses);
  const { subscribed, supported, loading: notifLoading, subscribe, unsubscribe } = useNotification();
  const allTags = useMemo(() => analyses.flatMap(a => a.tags), [analyses]);
  const latest = useMemo(() => [...analyses].sort((a, b) => b.date.localeCompare(a.date))[0], [analyses]);

  const stats = [
    { label: 'Stock research', value: counts.stocks },
    { label: 'Policy Pulse', value: counts.policy },
    { label: 'Themes tracked', value: new Set(allTags).size },
  ];

  // The homepage shows the two families separately, so it slices the catalogue
  // by kind rather than running it through the search filter.
  const [researchMarket, setResearchMarket] = useState<'india' | 'global'>('india');
  const researchReveal = useReveal<HTMLElement>();
  const pulseReveal = useReveal<HTMLElement>();

  const byDate = useMemo(
    () => [...analyses].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    [],
  );
  const researchByMarket = useMemo(() => ({
    india: byDate.filter((a) => kindOf(a) === 'research' && a.market !== 'global'),
    global: byDate.filter((a) => kindOf(a) === 'research' && a.market === 'global'),
  }), [byDate]);
  const researchShown = researchByMarket[researchMarket].slice(0, 4);
  const pulseAll = useMemo(() => byDate.filter((a) => kindOf(a) === 'pulse'), [byDate]);
  const pulseShown = pulseAll.slice(0, 6);
  const newestPulseDate = pulseAll[0]?.date;

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

        {/* The two families, segregated. This is what the owner asked for at the
            start of this thread and what the approved mockup shows: deep dives as
            cards, daily notes as a dated timeline, each with its own heading and
            its own "all of these" link. It replaces a single "Research library"
            panel that put a search box and four category tabs in front of one
            undifferentiated list — the pile the whole redesign exists to split.

            Search still exists, on the archive, which is the page built to be
            searched. The homepage's job is to show what is new. */}
        <section ref={researchReveal} style={{ marginTop: '2.5rem' }}>
          <div
            className="flex flex-wrap items-baseline justify-between gap-3"
            style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}
          >
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Latest research</h2>
            <Link to="/research" className="text-sm font-semibold no-underline" data-hov="accent" style={{ color: 'var(--accent)' }}>
              All research &rarr;
            </Link>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <SegmentedControl
              segments={[
                { key: 'india', label: 'India', count: researchByMarket.india.length },
                { key: 'global', label: 'US & Global', count: researchByMarket.global.length },
              ]}
              value={researchMarket}
              onChange={(k) => setResearchMarket(k as 'india' | 'global')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem', marginTop: '1rem' }}>
            {researchShown.map((a) => (
              <div key={a.slug} className="lift"><ResearchCard analysis={a} /></div>
            ))}
          </div>
        </section>

        <section ref={pulseReveal} style={{ marginTop: '2.5rem' }}>
          <div
            className="flex flex-wrap items-baseline justify-between gap-3"
            style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}
          >
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Today&rsquo;s Pulse</h2>
            <Link to="/pulse" className="text-sm font-semibold no-underline" data-hov="accent" style={{ color: 'var(--accent)' }}>
              All Pulse notes &rarr;
            </Link>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            {pulseShown.map((a) => (
              <PulseRow key={a.slug} analysis={a} isToday={a.date === newestPulseDate} />
            ))}
          </div>
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
