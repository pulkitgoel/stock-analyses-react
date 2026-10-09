import { useEffect, useState } from 'react';
import { Headphones } from 'lucide-react';
import { hasAudio, audioSrc } from '../../services/audioService';

/**
 * The audio summary player, shown at the top of an article when one exists.
 *
 * Universal by design: the component asks the backend which slugs have audio and
 * renders nothing otherwise, so no article needs editing and no flag needs to be
 * set in frontmatter. Upload a file named after the slug and it appears here on
 * the next page view - no rebuild, no deploy.
 *
 * The src is /api/audio/<slug>, which is token free. Pointing this at the blob
 * URL directly would put the container SAS in the HTML source of every article.
 *
 * Placement note: this sits above the article body, and both resolve
 * asynchronously. The +index+ is a small cached JSON response while the body
 * waits on the markdown and render pipeline, so the player almost always paints
 * first - which is what keeps its arrival from pushing the article down (CLS).
 */
export default function AudioSummary({ slug }: { slug: string | undefined }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    if (!slug) return undefined;
    hasAudio(slug).then((yes) => {
      if (active) setAvailable(yes);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!available || !slug) return null;

  return (
    <section
      className="page-panel surface-card animate-in rounded-[2rem]"
      style={{ padding: '1.15rem 1.5rem' }}
      aria-label="Audio summary"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.7rem' }}>
        <Headphones size={15} style={{ color: 'var(--accent)' }} />
        <span
          style={{
            fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-dim)',
          }}
        >
          Listen to this summary
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          AI-narrated
        </span>
      </div>
      <audio
        controls
        preload="metadata"
        src={audioSrc(slug)}
        style={{ width: '100%', height: '38px', display: 'block' }}
      />
    </section>
  );
}
