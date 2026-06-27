import { Analysis } from '../../types/analysis';
import { ArrowUpRight } from 'lucide-react';

interface AnalysisCardProps {
  analysis: Analysis;
}

const tagIcons: Record<string, string> = {
  fundamental: '📊', technical: '📈', earnings: '💰',
  concall: '🎙️', 'deep-dive': '🔍', deepdive: '🔍',
};

function getTagIcon(tag: string): string {
  return tagIcons[tag.toLowerCase()] || '📌';
}

export default function AnalysisCard({ analysis }: AnalysisCardProps) {
  return (
    <a
      href={`/analysis/${analysis.slug}`}
      className="group block no-underline rounded-xl transition-all duration-200"
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
      <div className="p-3.5 sm:p-5">
        <div className="flex items-start justify-between gap-2.5 mb-1.5">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold leading-snug flex-1" style={{ color: 'var(--text)' }}>
            {analysis.title}
            <ArrowUpRight size={13} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5" style={{ color: 'var(--accent)' }} />
          </h2>
          <span className="text-[0.5rem] sm:text-[0.65rem] font-semibold px-1.5 sm:px-2 py-0.5 rounded shrink-0 font-mono"
            style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa' }}>
            {analysis.ticker}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
          <span className="text-[0.65rem] sm:text-xs" style={{ color: 'var(--text-dim)' }}>{analysis.date}</span>
          <span className="text-[0.35rem] sm:text-[0.4rem]" style={{ color: 'var(--border)' }}>●</span>
          <div className="flex flex-wrap gap-1">
            {analysis.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[0.45rem] sm:text-[0.6rem] font-medium px-1.5 sm:px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                {getTagIcon(tag)} {tag}
              </span>
            ))}
            {analysis.tags.length > 3 && (
              <span className="text-[0.45rem] sm:text-[0.6rem]" style={{ color: 'var(--text-dim)' }}>+{analysis.tags.length - 3}</span>
            )}
          </div>
        </div>

        <p className="text-[0.7rem] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none" style={{ color: 'var(--text-muted)' }}>
          {analysis.summary}
        </p>
      </div>
    </a>
  );
}
