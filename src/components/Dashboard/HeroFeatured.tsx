import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, LineChart } from 'lucide-react';
import { Analysis } from '../../types/analysis';

interface HeroFeaturedProps {
  analysis: Analysis;
}

export default function HeroFeatured({ analysis }: HeroFeaturedProps) {
  // Generate a deterministic gradient based on ticker
  const colors = [
    ['#1e40af', '#3b82f6'],
    ['#7c3aed', '#8b5cf6'],
    ['#0891b2', '#06b6d4'],
    ['#059669', '#10b981'],
    ['#d97706', '#f59e0b'],
  ];
  const colorIdx = analysis.ticker.length % colors.length;
  const [c1, c2] = colors[colorIdx];

  return (
    <Link
      to={`/analysis/${analysis.slug}`}
      className="group block no-underline rounded-xl overflow-hidden transition-all duration-200"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="relative p-5 sm:p-7 min-h-[180px] sm:min-h-[220px] flex flex-col justify-end"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 text-6xl sm:text-8xl font-bold leading-none" style={{ color: '#fff' }}>{analysis.ticker.split(':')[0]}</div>
          <LineChart size={80} className="absolute bottom-4 right-4 opacity-20" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[0.55rem] sm:text-xs font-semibold px-2 py-0.5 rounded backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              📌 Featured
            </span>
            <span className="text-[0.55rem] sm:text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{analysis.date}</span>
          </div>

          <h2 className="text-base sm:text-xl md:text-2xl font-bold leading-snug mb-2 text-white">
            {analysis.title}
          </h2>

          <p className="text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {analysis.summary}
          </p>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white group-hover:underline underline-offset-2">
            Read Analysis <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Ticker badge */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
          <span className="text-[0.5rem] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            {analysis.ticker}
          </span>
        </div>
      </div>
    </Link>
  );
}
