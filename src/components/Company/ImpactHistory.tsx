import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { ImpactCall } from '../../types/analysis';

/**
 * Dated record of what has moved this stock, and how strongly it was believed.
 *
 * This is the page's reason to exist. A fundamentals database publishes the
 * numbers and a newsfeed publishes the events; neither publishes "here is every
 * policy and geopolitical development that touched this company, which way it
 * cut, the reasoning, and a confidence score". That mapping already existed in
 * the Policy Pulse impact tables, buried two-thirds down articles titled only
 * with a date, and is surfaced here.
 *
 * Rows marked `inferred` were deductions rather than reported fact. Showing
 * that distinction rather than hiding it is the point: it is what makes the
 * confident rows worth anything.
 */

const STYLES = {
  positive: { Icon: TrendingUp, color: 'var(--up, #22c55e)', label: 'Positive' },
  negative: { Icon: TrendingDown, color: 'var(--down, #ef4444)', label: 'Negative' },
  watch: { Icon: Eye, color: 'var(--text-muted)', label: 'Watch' },
} as const;

function ConfidenceDots({ score }: { score: number | null }) {
  if (!score) return null;
  return (
    <span className="inline-flex items-center gap-0.5" title={`Confidence ${score} of 5`} aria-label={`Confidence ${score} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: n <= score ? 'var(--accent)' : 'var(--border)',
          }}
        />
      ))}
    </span>
  );
}

export default function ImpactHistory({ ticker, calls }: { ticker: string; calls: ImpactCall[] }) {
  if (!calls.length) return null;

  const tally = calls.reduce(
    (acc, c) => ({ ...acc, [c.direction]: (acc[c.direction] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <section data-nums className="mt-8">
      <h2 className="mb-1 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
        What has moved {ticker}
      </h2>
      <p className="mb-4 text-xs" style={{ color: 'var(--text-dim)' }}>
        {calls.length} dated call{calls.length !== 1 ? 's' : ''} from the policy coverage
        {' · '}
        <span style={{ color: STYLES.positive.color }}>{tally.positive ?? 0} positive</span>
        {' · '}
        <span style={{ color: STYLES.negative.color }}>{tally.negative ?? 0} negative</span>
        {' · '}
        <span>{tally.watch ?? 0} watch</span>
      </p>

      <ol className="flex flex-col gap-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {calls.map((c, i) => {
          const { Icon, color, label } = STYLES[c.direction];
          return (
            <li
              key={`${c.slug}-${i}`}
              className="rounded-2xl px-4 py-3"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Icon size={15} style={{ color }} aria-hidden="true" />
                <span className="text-xs font-bold" style={{ color }}>{label}</span>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{c.date}</span>
                <ConfidenceDots score={c.confidence} />
                {c.inferred && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
                    style={{ background: 'var(--surface-soft)', color: 'var(--text-dim)' }}
                    title="A deduction by the author, not something the source reported"
                  >
                    inferred
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                {c.reason}
              </p>
              <Link
                to={`/analysis/${c.slug}`}
                className="mt-1 inline-block text-xs font-semibold no-underline"
                style={{ color: 'var(--accent)' }}
              >
                {c.title}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
