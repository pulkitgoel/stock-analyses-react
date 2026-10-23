import { useEffect, useRef } from 'react';

/**
 * Reveal an element as it scrolls into view — DESIGN.md section 6.
 *
 * Two rules do the real work here, and both exist because of defects this repo
 * already paid for:
 *
 * 1. **Only elements that start below the fold are armed.** 7.10 measured the
 *    previous animation holding the `h1` back as an LCP candidate, because an
 *    element at `opacity: 0` is not a candidate in Chromium and `createRoot`
 *    discards the prerendered markup (7.1) so the fade replayed after the
 *    bundle ran. Anything in the first viewport is left alone and paints with
 *    the first CSS.
 * 2. **The class is added by JS, never by the markup.** With JavaScript off, or
 *    before hydration, the element is simply visible. A prerendered site that
 *    hides its own content behind a class the server also emits is invisible to
 *    a crawler, which is the failure 7.1 exists to prevent.
 *
 * Under `prefers-reduced-motion` nothing is armed at all.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    // Already on screen: leave it alone, it is part of the first paint.
    if (el.getBoundingClientRect().top < window.innerHeight - 40) return;

    el.classList.add('rv');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          (e.target as HTMLElement).classList.add('in');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}

/**
 * Reading progress for the article page: a 2px accent line that tracks how far
 * down the document the reader is. `transform: scaleX()` only, so it never
 * triggers layout.
 */
export function useReadingProgress() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        bar.style.transform = `scaleX(${p})`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return ref;
}

/**
 * Adds `.stuck` to the header once the page has moved, so it gains a shadow
 * only when there is content behind it.
 */
export function useStuckHeader() {
  useEffect(() => {
    const bar = document.querySelector('.topbar-settle');
    if (!bar) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        bar.classList.toggle('stuck', window.scrollY > 24);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
