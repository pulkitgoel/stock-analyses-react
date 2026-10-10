/**
 * Heading anchors and the table of contents (AGENTS.md 7.4).
 *
 * `rehype-slug` is not installed, so heading ids are produced here in a single
 * pre-pass over the markdown and injected as an `<a id>` inside each heading.
 * That choice is deliberate, and each alternative was rejected for a measured
 * reason:
 *
 * - It is deterministic. Ids are assigned in document order with a per-slug
 *   counter, so the TOC hrefs and the heading ids cannot disagree, and the 23
 *   articles (9% of the library) that repeat a heading get `-2` suffixes instead
 *   of colliding ids.
 * - It keeps inline markdown working. Rewriting a heading line to a raw `<h2>`
 *   would render `**bold**` literally in the 20 articles that use inline
 *   formatting in a heading. An inline anchor leaves the heading text as markdown.
 *   Verified against the real pipeline (react-markdown + remark-gfm + rehype-raw):
 *   the anchor survives and bold/code still render.
 * - It needs no render-order state, so React StrictMode's double render (and any
 *   memoised re-render) cannot desynchronise the ids from the TOC.
 *
 * The raw `.md` files are never modified — this runs on the fetched text at
 * render time, so the machine-readable copy served at /analyses/{slug}.md keeps
 * its clean headings.
 */

export interface TocEntry {
  level: 2 | 3;
  /** Plain text for the label, with inline markdown stripped. */
  text: string;
  id: string;
}

const HEADING_RE = /^(#{2,3})\s+(.*\S)\s*$/;

/**
 * GitHub-style slug: lowercase, keep a-z0-9 and hyphens only, so the id is safe
 * unencoded in an href. `₹`, em dashes and punctuation are dropped rather than
 * percent-encoded, which keeps the anchor readable.
 */
export function slugifyHeading(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Strip inline markdown so a TOC label reads as prose, not as markup. */
export function plainHeadingText(raw: string): string {
  return String(raw)
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Inject heading anchors and return the contents list.
 *
 * Only `##` and `###` are included. A body `#` heading is the article's own title
 * (demoted to `h2` for display, see AnalysisPage) and would just repeat the page
 * heading in the list.
 */
export function prepareHeadings(markdown: string): { markdown: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const used = new Map<string, number>();
  const out: string[] = [];
  let inFence = false;

  for (const line of markdown.split('\n')) {
    // A fenced code block can contain lines that look like headings.
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }

    const match = HEADING_RE.exec(line);
    if (!match) {
      out.push(line);
      continue;
    }

    const [, hashes, raw] = match;
    const text = plainHeadingText(raw);
    const base = slugifyHeading(text) || 'section';
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    const id = seen === 0 ? base : `${base}-${seen + 1}`;

    toc.push({ level: hashes.length === 2 ? 2 : 3, text, id });
    out.push(`${hashes} <a id="${id}"></a>${raw}`);
  }

  return { markdown: out.join('\n'), toc };
}
