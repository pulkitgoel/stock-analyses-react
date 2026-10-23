import { Analysis } from '../../types/analysis';

/**
 * The key-takeaway panel under the band. DESIGN.md section 4.
 *
 * A pale `--accent-wash` block holding the article's own summary, optionally with
 * stat blocks on `--accent-deep` carrying the figures a reader would otherwise
 * have to hunt for in a 2,600-word piece.
 *
 * The figures are not invented and nothing is estimated: they are pulled out of
 * the watchlist frontmatter the article already declares (`priceAtAnalysis`,
 * `support`, `resistance`, `verdict`). An article without those renders the panel
 * with no stats rather than with placeholders — the same rule as the disclosure
 * slots in 7.14, and for the same reason: a plausible-looking number that nobody
 * computed is worse than no number on a page like this.
 */

type Stat = { value: string; label: string };

function money(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

function statsFor(a: Analysis): Stat[] {
  const out: Stat[] = [];
  if (typeof a.priceAtAnalysis === 'number') {
    out.push({ value: money(a.priceAtAnalysis), label: 'At analysis' });
  }
  if (typeof a.support === 'number') out.push({ value: money(a.support), label: 'Support' });
  if (typeof a.resistance === 'number') out.push({ value: money(a.resistance), label: 'Resistance' });
  return out.slice(0, 4);
}

export default function TakeawayPanel({ analysis: a }: { analysis: Analysis }) {
  const stats = statsFor(a);

  return (
    <aside
      style={{
        background: 'var(--accent-wash, var(--accent-glow))',
        borderRadius: 'var(--radius)',
        padding: '1rem',
        marginTop: '1.25rem',
      }}
    >
      <span
        className="text-xs font-bold uppercase"
        style={{ color: 'var(--accent)', letterSpacing: '0.06em' }}
      >
        Key takeaway
      </span>

      <p
        style={{
          margin: '0.5rem 0 0',
          fontSize: '1rem',
          lineHeight: 1.55,
          color: 'var(--text)',
        }}
      >
        {a.summary}
      </p>

      {a.verdict && (
        <p
          style={{
            margin: '0.75rem 0 0',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: 'var(--text)',
          }}
        >
          {a.verdict}
          {/* The call is dated and labelled wherever it appears (DESIGN.md
              section 4). Without the date a verdict reads as current advice. */}
          <span
            className="block text-xs font-medium"
            style={{ color: 'var(--text-dim)', marginTop: '0.25rem' }}
          >
            Author's view on {a.date}. Not a recommendation.
          </span>
        </p>
      )}

      {stats.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: '0.5rem', marginTop: '0.875rem' }}>
          {stats.map((s) => (
            <div
              key={s.label}
              data-nums
              style={{
                background: 'var(--accent-deep)',
                color: '#ffffff',
                borderRadius: 'var(--radius)',
                padding: '0.65rem 0.8rem',
                minWidth: '7rem',
              }}
            >
              <div style={{ fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.2 }}>
                {s.value}
              </div>
              <div
                style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent-on-deep)', marginTop: '2px' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
