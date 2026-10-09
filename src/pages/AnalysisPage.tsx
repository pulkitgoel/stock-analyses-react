import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, FileText } from 'lucide-react';
import { Analysis } from '../types/analysis';
import { fetchAnalyses, fetchAnalysisContent } from '../services/analysisService';
import LoadingSpinner from '../components/Common/LoadingSpinner';

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function AnalysisPage() {
  const { slug } = useParams<{ slug: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAnalyses(),
      fetchAnalysisContent(slug).catch(() => ''),
    ])
      .then(([analyses, mdContent]) => {
        const found = analyses.find((a) => a.slug === slug);
        if (!found) {
          setError('Analysis not found');
          return;
        }
        setAnalysis(found);
        setContent(mdContent || `# ${found.title}\n\n*Content not available.*`);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;

  if (error || !analysis) {
    return (
      <div className="soft-panel mx-auto max-w-xl rounded-2xl px-5 py-14 text-center">
        <FileText size={36} className="mx-auto mb-4" style={{ color: 'var(--text-dim)' }} />
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Not Found</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>{error || "This analysis doesn't exist."}</p>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            height: '44px', padding: '0 20px', borderRadius: '12px',
            background: 'var(--accent)', color: 'var(--accent-contrast)',
            fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none',
            marginTop: '1.5rem',
            transition: 'transform 180ms ease',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
        >
          <ArrowLeft size={16} /> Back Home
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(content);

  return (
    <article className="article-shell flex flex-col gap-6 sm:gap-8">
      <Helmet>
        {/* Only the title is set here, and only so the browser tab updates
            during client-side navigation.

            Everything else a crawler needs (description, canonical, OG,
            Twitter, JSON-LD) is in the prerendered file that
            scripts/generate-og-files.py writes for this route. Emitting those
            here as well produced two of every tag.

            The title must be a SINGLE expression. Writing
            `<title>{analysis.title} — suffix</title>` passes Helmet an array of
            children, which it renders as an EMPTY <title> — that is what put a
            blank title ahead of the real one on every analysis page. The suffix
            is gone regardless: it pushed 246 of 250 titles past the length
            Google renders. This now matches the prerendered title exactly. */}
        <title>{analysis.title}</title>
        {/* No JSON-LD here on purpose. These routes are prerendered by
            scripts/generate-og-files.py, which emits the single Article (or
            NewsArticle) block with datePublished, publisher, image and section.
            A second block here produced two conflicting Article entities per
            page, with two different author names. */}
      </Helmet>

      <Link
        to="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          height: '40px', padding: '0 18px', borderRadius: '12px',
          background: 'transparent', color: 'var(--text)',
          fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
          border: '1px solid var(--border)',
          transition: 'border-color 180ms ease, transform 180ms ease',
          whiteSpace: 'nowrap',
        }}
        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
      >
        <ArrowLeft size={14} /> All analyses
      </Link>

      <header className="page-panel surface-card animate-in rounded-[2rem]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className="rounded-lg px-2.5 py-1 font-mono text-xs font-bold"
            style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
          >
            {analysis.ticker}
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>{analysis.date}</span>
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>
            <Clock size={13} /> {readTime} min read
          </span>
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl" style={{ color: 'var(--text)' }}>
          {analysis.title}
        </h1>
        <p className="mt-4 text-sm leading-7 sm:text-base" style={{ color: 'var(--text-muted)' }}>
          {analysis.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {analysis.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: 'var(--surface-soft)', color: 'var(--text-muted)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="page-panel surface-card animate-in animate-in-delay-1 overflow-hidden rounded-[2rem]">
        <div className="article-body">
          {/* An h1 in the markdown body is rendered as an h2.
              106 of 250 articles open with their own `# Title`, which produced a
              second <h1> duplicating the page heading above. In all 106 that h1
              is the first heading in the body, so demoting it leaves one h1 per
              page with no content lost and no heading levels skipped.
              h2 and below are deliberately left alone: 144 articles have no body
              h1, and shifting their h2s would create a gap under the page h1. */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      <div>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            height: '44px', padding: '0 20px', borderRadius: '12px',
            background: 'var(--surface-soft)', color: 'var(--text)',
            fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none',
            border: '1px solid var(--border)',
            transition: 'border-color 180ms ease, transform 180ms ease',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
    </article>
  );
}
