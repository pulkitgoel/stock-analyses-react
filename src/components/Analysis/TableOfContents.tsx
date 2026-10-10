import { List } from 'lucide-react';
import { TocEntry } from '../../utils/toc';

/**
 * Below this many sections a contents list is noise rather than navigation.
 *
 * Measured across the library: Policy Pulse notes run a median of 6 headings
 * (about 730 words — one or two screens), deep dives a median of 33. A floor of
 * 4 would put a contents panel on 93% of all articles; 10 shows it on the 74
 * longest (29%) and leaves the short daily notes alone.
 */
const MIN_ENTRIES = 10;

/**
 * Collapsible, so it costs no vertical space above a long article until wanted.
 * It is a plain `<details>` rather than a JS toggle on purpose: the markup, and
 * therefore the internal links to each section, is present in the prerendered
 * HTML whether or not it is open, so a crawler sees every anchor.
 */
export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < MIN_ENTRIES) return null;

  return (
    <details className="toc-panel">
      <summary className="toc-summary">
        <List size={14} aria-hidden />
        <span>On this page</span>
        <span className="toc-count">{entries.length}</span>
      </summary>
      <nav aria-label="Table of contents">
        <ol className="toc-list">
          {entries.map((entry) => (
            <li key={entry.id} data-level={entry.level}>
              <a href={`#${entry.id}`}>{entry.text}</a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
