import { Link } from 'react-router-dom';
import { Analysis } from '../../types/analysis';
import { displayDate, leadTickers, pulseHeadline } from '../../utils/articleDisplay';

/**
 * A daily Policy Pulse note in a listing. DESIGN.md section 4.
 *
 * A row, not a card. Pulse notes are scanned, not browsed: the reader wants the
 * date, the claim and which tickers moved, and there are 239 of them against 55
 * deep dives. Boxing each one in the same 270px card as a 2,600-word analysis
 * made the library read as one undifferentiated pile, which is the confusion
 * 7.12 split the routes to fix and this finishes inside the listings.
 */

/** The edition, from the title. The series has shipped under 22 spellings
 *  (scripts/lib/market.js records this), so match the distinguishing word only. */
function edition(title: string): string | null {
  if (/\btrump\b/i.test(title)) return 'US · Trump';
  if (/\bglobal\b/i.test(title)) return 'US · Global';
  if (/\bministr|\bregulator/i.test(title)) return 'India · Ministries';
  if (/\bmodi\b|\bindia govt\b/i.test(title)) return 'India · Modi';
  return null;
}

export default function PulseRow({ analysis: a, isToday = false }: { analysis: Analysis; isToday?: boolean }) {
  const ed = edition(a.title);
  const tickers = leadTickers(a);

  return (
    <Link
      to={`/analysis/${a.slug}`}
      data-hov="accent"
      className="block no-underline"
      style={{
        // The rail: one continuous 2px line down the left of the list, with a
        // dot per entry. It is what makes a run of daily notes read as a dated
        // sequence rather than a stack of separate rows (DESIGN.md section 4).
        position: 'relative',
        borderTop: '1px solid var(--border)',
        padding: '0.875rem 0 0.875rem 1.5rem',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute', left: '3px', top: 0, bottom: 0,
          width: '2px', background: 'var(--border)',
        }}
      />
      <span
        aria-hidden
        className={isToday ? 'rail-dot-today' : undefined}
        style={{
          position: 'absolute', left: 0, top: '1.25rem',
          width: '8px', height: '8px', borderRadius: '50%',
          background: isToday ? 'var(--accent)' : 'var(--border-light)',
        }}
      />
      <span
        className="flex items-center gap-2 text-xs font-bold uppercase"
        style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}
      >
        {ed ?? 'Daily Pulse'}
      </span>

      <span
        className="mt-1.5 block text-base font-semibold leading-snug"
        style={{ color: 'var(--text)' }}
      >
        {pulseHeadline(a)}
      </span>

      <span
        data-nums
        className="mt-1.5 block text-xs font-medium"
        style={{ color: 'var(--text-dim)' }}
      >
        {displayDate(a.date)}
        {tickers.length ? ` · ${tickers.join(' · ')}` : ''}
      </span>
    </Link>
  );
}
