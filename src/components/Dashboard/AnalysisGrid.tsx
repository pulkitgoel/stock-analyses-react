import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, FileText } from 'lucide-react';
import { Analysis } from '../../types/analysis';

interface AnalysisGridCardProps {
  analysis: Analysis;
}

function AnalysisGridCard({ analysis }: AnalysisGridCardProps) {
  return (
    <Link
      to={`/analysis/${analysis.slug}`}
      className="analysis-card premium-card group relative flex min-h-[270px] flex-col rounded-[1.75rem] no-underline transition-all duration-300 hover:-translate-y-1 hover:z-10"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.background = 'var(--bg-card-hover)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'var(--bg-card)';
      }}
    >
      <div className="card-content-offset mb-6 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
            <FileText size={18} />
          </div>
          <div>
            <span className="block font-mono text-xs font-black uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
              {analysis.ticker}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--text-dim)' }}>
              <CalendarDays size={12} /> {analysis.date}
            </span>
          </div>
        </div>
        <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" style={{ color: 'var(--text-dim)' }} />
      </div>

      <div className="card-content-offset">
        <h3 className="text-xl font-black leading-tight tracking-tight" style={{ color: 'var(--text)' }}>
          {analysis.title}
        </h3>
        <p className="mt-4 line-clamp-3 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
          {analysis.summary}
        </p>
      </div>

      <div className="card-content-offset mt-auto pt-7">
        <div className="mb-5 flex flex-wrap gap-2">
          {analysis.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-1 text-[0.68rem] font-black"
              style={{ background: 'var(--surface-soft)', color: 'var(--text-muted)' }}
            >
              {tag}
            </span>
          ))}
          {analysis.tags.length > 3 && (
            <span className="px-1 py-1 text-xs font-black" style={{ color: 'var(--text-dim)' }}>
              +{analysis.tags.length - 3}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-black" style={{ color: 'var(--accent)' }}>
          Read note
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}

interface AnalysisGridProps {
  analyses: Analysis[];
}

export default function AnalysisGrid({ analyses }: AnalysisGridProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      style={{ gap: '2rem' }}
    >
      {analyses.map((a) => (
        <AnalysisGridCard key={a.slug} analysis={a} />
      ))}
    </div>
  );
}

