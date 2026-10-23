import { Link } from 'react-router-dom';
import { Analysis } from '../../types/analysis';
import { MARKET_LABEL } from '../../utils/market';
import { displayDate, leadTickers } from '../../utils/articleDisplay';

/**
 * A deep dive in a listing. DESIGN.md section 4.
 *
 * What it drops from the card this replaces, and why: the 44px icon tile (the
 * same glyph on every card carries no information), the three tag pills plus a
 * `+N` overflow (the densest element on the card and the least useful — the
 * eyebrow already says what kind of thing this is), and the "Read note" affordance
 * on something that is entirely a link already.
 *
 * What it keeps is what a reader scans for: which company, when, and whether the
 * piece is long enough to be worth sitting down with.
 */

/**
 * Reading time from the summary is not possible — it is 155 characters by
 * construction. The median deep dive is ~2,600 words and the median pulse note
 * ~730 (AGENTS.md section 1), so this estimates from the only length signal a
 * listing has: how many tickers and tags the piece carries, floored so it never
 * claims less than a minute. It is deliberately coarse and rounded to 5.
 */
function readingMinutes(a: Analysis): number {
  const tickers = a.ticker ? a.ticker.split(/[:/]/).filter(Boolean).length : 0;
  const est = 8 + tickers * 0.6 + a.tags.length * 0.8;
  return Math.max(5, Math.round(est / 5) * 5);
}

export default function ResearchCard({ analysis: a }: { analysis: Analysis }) {
  const market = a.market ? MARKET_LABEL[a.market] : null;
  // At most three, and only the ones the piece leads with. The full list is on
  // the article; a listing that prints 17 tickers is unreadable (section 4).
  const tickers = leadTickers(a);

  return (
    <Link
      to={`/analysis/${a.slug}`}
      data-hov="card"
      className="flex flex-col no-underline"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1rem',
      }}
    >
      <span
        className="text-xs font-bold uppercase"
        style={{ color: 'var(--text-dim)', letterSpacing: '0.06em' }}
      >
        Deep dive{market ? ` · ${market}` : ''}
      </span>

      <h3
        className="mt-2 text-lg font-bold leading-snug"
        style={{ color: 'var(--text)' }}
      >
        {a.title}
      </h3>

      <p
        className="mt-2 line-clamp-2 text-sm leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        {a.summary}
      </p>

      <span
        data-nums
        className="mt-3 text-xs font-medium"
        style={{ color: 'var(--text-dim)' }}
      >
        {tickers.join(' · ')}
        {tickers.length ? ' · ' : ''}
        {displayDate(a.date)} · {readingMinutes(a)} min read
      </span>
    </Link>
  );
}
