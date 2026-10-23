import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Analysis } from '../../types/analysis';
import { kindOf } from '../../utils/kind';
import ResearchCard from './ResearchCard';
import PulseRow from './PulseRow';

const ITEMS_PER_PAGE = 9;

interface AnalysisGridProps {
  analyses: Analysis[];
  /**
   * How many cards to render before the "Show more" button. Defaults to
   * ITEMS_PER_PAGE.
   *
   * Pages that exist to be crawled must pass the full count. A crawler never
   * clicks "Show more", so whatever is hidden behind it has no link. That is
   * what made /tag/defence advertise "60 articles tagged" while exposing nine
   * crawlable links. The homepage keeps the default on purpose: the archive is
   * the crawl path, so the homepage does not need to list everything.
   */
  initialCount?: number;
}

export default function AnalysisGrid({ analyses, initialCount = ITEMS_PER_PAGE }: AnalysisGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  
  const visibleAnalyses = analyses.slice(0, visibleCount);
  const hasMore = visibleCount < analyses.length;
  
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, analyses.length));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1rem, not the old 2rem: pulse rows carry their own hairline rule, and a
          32px gap between them reads as separate blocks rather than a list. */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        style={{ gap: '1rem' }}
      >
        {/* One list, two shapes. A PulseRow spans every column, so a mixed
            surface - the homepage library, /tag, /analyses, /india, /global -
            keeps strict date order while the two kinds stay distinguishable.
            Grouping them instead would have meant reordering by kind, which
            costs the reader the one thing a dated list is for. */}
        {visibleAnalyses.map((a) => (
          kindOf(a) === 'pulse'
            ? <div key={a.slug} style={{ gridColumn: '1 / -1' }}><PulseRow analysis={a} /></div>
            : <ResearchCard key={a.slug} analysis={a} />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            className="btn btn-secondary"
          >
            <Plus size={16} />
            Show more
          </button>
        </div>
      )}
    </div>
  );
}

