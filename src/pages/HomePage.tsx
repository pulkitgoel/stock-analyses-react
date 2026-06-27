import { useState, useMemo } from 'react';
import { useAnalyses } from '../hooks/useAnalyses';
import { useSearch } from '../hooks/useSearch';
import { useNotification } from '../hooks/useNotification';
import { Helmet } from 'react-helmet-async';
import MarketTicker from '../components/Dashboard/MarketTicker';
import HeroFeatured from '../components/Dashboard/HeroFeatured';
import TagPills from '../components/Dashboard/TagPills';
import AnalysisGrid from '../components/Dashboard/AnalysisGrid';
import SubscribeCard from '../components/Common/SubscribeCard';
import SearchBar from '../components/Home/SearchBar';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Analysis } from '../types/analysis';

export default function HomePage() {
  const { analyses, loading, error } = useAnalyses();
  const { query, setQuery, sortMode, setSortMode, filtered } = useSearch(analyses);
  const { subscribed, supported, loading: notifLoading, subscribe, unsubscribe } = useNotification();
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Get the latest macro analysis for featured hero
  const featured = useMemo(() => {
    if (!analyses.length) return null;
    // Prefer market crash or macro analyses
    const macro = analyses.find(a =>
      a.tags.some(t => ['market-analysis', 'crash', 'us-markets', 'fii-dii'].includes(t))
    );
    return macro || analyses.sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [analyses]);

  // All unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    analyses.forEach(a => a.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [analyses]);

  // Filtered by tags
  const tagFiltered = useMemo(() => {
    if (!activeTags.length) return filtered;
    return filtered.filter(a => a.tags.some(t => activeTags.includes(t)));
  }, [filtered, activeTags]);

  // Non-featured analyses for grid
  const gridAnalyses = useMemo(() => {
    if (!featured) return tagFiltered;
    return tagFiltered.filter(a => a.slug !== featured.slug);
  }, [tagFiltered, featured]);

  const handleTagToggle = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <div className="text-3xl mb-3">❌</div>
        <p className="text-sm">Failed to load analyses.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>stocksfundamentals.online — Deep-Dive Stock Research by Pulkit</title>
        <meta name="description" content="Deep-dive fundamental analysis of Indian stocks with NSE delivery data, promoter trends, quarterly results, and actionable insights." />
      </Helmet>

      {/* Market Ticker */}
      <MarketTicker />

      <div className="pt-5 sm:pt-8">
        {/* Featured Hero */}
        {featured && <div className="mb-5 sm:mb-8"><HeroFeatured analysis={featured} /></div>}

        {/* Tag Pills */}
        <div className="mb-4 sm:mb-5">
          <TagPills allTags={allTags} activeTags={activeTags} onToggle={handleTagToggle} />
        </div>

        {/* Search */}
        <SearchBar query={query} onQueryChange={setQuery} sortMode={sortMode} onSortChange={setSortMode} />

        {/* Grid */}
        {gridAnalyses.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: 'var(--text-dim)' }}>
            🔍 No analyses match your filters.
          </div>
        ) : (
          <AnalysisGrid analyses={gridAnalyses} />
        )}

        {/* Subscribe */}
        <SubscribeCard
          subscribed={subscribed}
          supported={supported}
          loading={notifLoading}
          onSubscribe={subscribe}
          onUnsubscribe={unsubscribe}
        />
      </div>
    </>
  );
}
