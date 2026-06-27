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
        <Link to="/" className="btn btn-primary mt-6">
          <ArrowLeft size={16} /> Back Home
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(content);

  return (
    <article className="article-shell">
      <Helmet>
        <title>{analysis.title} — stocksfundamentals.online</title>
        <meta name="description" content={analysis.summary} />
        <link rel="canonical" href={`https://stocksfundamentals.online/analysis/${analysis.slug}`} />
        <meta property="og:title" content={analysis.title} />
        <meta property="og:description" content={analysis.summary} />
        <meta property="og:url" content={`https://stocksfundamentals.online/analysis/${analysis.slug}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={analysis.title} />
        <meta name="twitter:description" content={analysis.summary} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": analysis.title,
            "description": analysis.summary,
            "datePublished": analysis.date,
            "author": [{
                "@type": "Person",
                "name": "Pulkit Goel",
                "url": "https://stocksfundamentals.online/about"
            }]
          })}
        </script>
      </Helmet>

      <Link to="/" className="btn btn-secondary mb-4 sm:mb-6">
        <ArrowLeft size={16} /> All analyses
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

      <div className="page-panel surface-card animate-in animate-in-delay-1 mt-6 overflow-hidden rounded-[2rem] sm:mt-8">
        <div className="article-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/" className="btn btn-soft">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
    </article>
  );
}
