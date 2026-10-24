import { Analysis } from '../../types/analysis';

interface StatsBarProps {
  analyses: Analysis[];
}

export default function StatsBar({ analyses }: StatsBarProps) {
  const count = analyses.length;
  const latestDate = count > 0 ? [...analyses].sort((a, b) => b.date.localeCompare(a.date))[0].date : '—';

  return (
    <div className="flex gap-5 sm:gap-10 py-3 sm:py-4 mb-5 sm:mb-6" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div className="text-lg sm:text-2xl font-bold leading-none mb-0.5" style={{ color: 'var(--accent)' }}>{count}</div>
        <div className="text-[0.6rem] sm:text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Analyses</div>
      </div>
      <div>
        <div className="text-lg sm:text-2xl font-bold leading-none mb-0.5 truncate max-w-[110px] sm:max-w-none" style={{ color: 'var(--accent)' }}>{latestDate}</div>
        <div className="text-[0.6rem] sm:text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>Latest</div>
      </div>
    </div>
  );
}
