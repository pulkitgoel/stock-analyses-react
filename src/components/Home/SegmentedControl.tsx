import { useEffect, useRef, useState } from 'react';

/**
 * The India / US control from the approved mockup. The filled pill slides
 * between options rather than snapping — one `transform`, no layout, and it is
 * the piece of motion a reader actually touches.
 *
 * The thumb is positioned from the real button geometry rather than from a
 * percentage, so options of different widths ("India · 161", "US & Global · 133")
 * stay correct. It is re-measured on resize, and the first placement is made
 * without a transition so it does not animate in from the left on mount.
 */
export interface Segment {
  key: string;
  label: string;
  count?: number;
}

export default function SegmentedControl({
  segments,
  value,
  onChange,
}: {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const thumb = useRef<HTMLSpanElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const place = (animate: boolean) => {
      const el = wrap.current?.querySelector<HTMLButtonElement>(`[data-seg="${value}"]`);
      const t = thumb.current;
      if (!el || !t) return;
      if (!animate) t.style.transition = 'none';
      t.style.width = `${el.offsetWidth}px`;
      t.style.transform = `translateX(${el.offsetLeft}px)`;
      if (!animate) requestAnimationFrame(() => { t.style.transition = ''; });
    };
    place(ready);
    if (!ready) setReady(true);
    const onResize = () => place(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [value, ready, segments.length]);

  return (
    <div
      ref={wrap}
      className="seg"
      style={{
        display: 'inline-flex',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '3px',
        gap: '2px',
      }}
      role="tablist"
    >
      <span ref={thumb} className="seg-thumb" aria-hidden />
      {segments.map((s) => {
        const on = s.key === value;
        return (
          <button
            key={s.key}
            data-seg={s.key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(s.key)}
            className="press"
            style={{
              all: 'unset',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0 1rem',
              minHeight: '38px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: 'calc(var(--radius) - 2px)',
              color: on ? 'var(--accent-contrast)' : 'var(--text-dim)',
              transition: 'color 140ms var(--ease)',
            }}
          >
            {s.label}
            {typeof s.count === 'number' && (
              <span data-nums style={{ opacity: 0.75, fontWeight: 500 }}>{s.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
