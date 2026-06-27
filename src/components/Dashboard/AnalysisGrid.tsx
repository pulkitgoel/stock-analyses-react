import { Analysis } from '../../types/analysis';
import { ArrowUpRight } from 'lucide-react';

interface AnalysisGridCardProps {
  analysis: Analysis;
}

const tagIcons: Record<string, string> = {
  fundamental: '📊', technical: '📈', earnings: '💰',
  concall: '🎙️', 'deep-dive': '🔍', deepdive: '🔍',
};

function getTagIcon(tag: string): string {
  return tagIcons[tag.toLowerCase()] || '📌';
}

function AnalysisGridCard({ analysis }: AnalysisGridCardProps) {
  return (
    <a
      href={`/analysis/${analysis.slug}`}
      className="group block no-underline rounded-xl transition-all duration-200 flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
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
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Ticker badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[0.5rem] sm:text-[0.6rem] font-semibold px-1.5 py-0.5 rounded font-mono"
            style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa' }}>
            {analysis.ticker}
          </span>
          <span className="text-[0.5rem] sm:text-xs" style={{ color: 'var(--text-dim)' }}>{analysis.date}</span>
        </div>

        {/* Title */}
        <h3 className="text-[0.8rem] sm:text-sm font-semibold leading-snug mb-1.5 flex-1" style={{ color: 'var(--text)' }}>
          {analysis.title}
          <ArrowUpRight size={11} className="inline ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
        </h3>

        {/* Summary - 2 lines only */}
        <p className="text-[0.65rem] sm:text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>
          {analysis.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {analysis.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[0.4rem] sm:text-[0.55rem] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
              {getTagIcon(tag)} {tag}
            </span>
          ))}
          {analysis.tags.length > 2 && (
            <span className="text-[0.4rem] sm:text-[0.55rem]" style={{ color: 'var(--text-dim)' }}>+{analysis.tags.length - 2}</span>
          )}
        </div>
      </div>
    </a>
  );
}

interface AnalysisGridProps {
  analyses: Analysis[];
}

export default function AnalysisGrid({ analyses }: AnalysisGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
      {analyses.map((a) => (
        <AnalysisGridCard key={a.slug} analysis={a} />
      ))}
    </div>
  );
}
