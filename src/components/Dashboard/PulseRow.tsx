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

export default function PulseRow({ analysis: a }: { analysis: Analysis }) {
  const ed = edition(a.title);
  const tickers = leadTickers(a);

  return (
    <Link
      to={`/analysis/${a.slug}`}
      data-hov="accent"
      className="block no-underline"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '0.875rem 0',
      }}
    >
      <span
        className="flex items-center gap-2 text-xs font-bold uppercase"
        style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-block', width: '6px', height: '6px',
            background: 'var(--accent)', flex: '0 0 auto',
          }}
        />
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
