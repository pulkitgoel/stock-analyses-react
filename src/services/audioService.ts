/**
 * Audio summaries.
 *
 * The article screen asks once, for the whole library, which slugs have an audio
 * summary, then renders a player only for those. Nothing needs to be added to an
 * article's frontmatter: naming the file after the slug is the entire contract.
 *
 * The request goes to /api/audio-index, and the player points at
 * /api/audio/<slug>. Neither URL carries a storage signature - the backend adds
 * the SAS token server-side (see /var/www/stock-analyses/audio_proxy.py), so the
 * credential never reaches the browser or the HTML source.
 */

const INDEX_URL = '/api/audio-index';

/** Resolved once per page session; the backend caches it for 10 minutes. */
let indexPromise: Promise<Set<string>> | null = null;

function loadIndex(): Promise<Set<string>> {
  if (indexPromise) return indexPromise;

  indexPromise = fetch(INDEX_URL, { headers: { Accept: 'application/json' } })
    .then((response) => (response.ok ? response.json() : { slugs: {} }))
    .then((data: { slugs?: Record<string, string> }) =>
      new Set(Object.keys(data?.slugs ?? {})),
    )
    .catch(() => {
      // Audio is an enhancement: a failure here must never break the article.
      // Cache the failure so a broken backend is not retried on every render.
      return new Set<string>();
    });

  return indexPromise;
}

/** True when this article has an audio summary available. */
export async function hasAudio(slug: string | undefined): Promise<boolean> {
  if (!slug) return false;
  const slugs = await loadIndex();
  return slugs.has(slug);
}

/** Token-free streaming URL for a slug's audio. */
export function audioSrc(slug: string): string {
  return `/api/audio/${encodeURIComponent(slug)}`;
}
