import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock } from 'lucide-react';
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
    Promise.all([
      fetchAnalyses(),
      fetchAnalysisContent(slug).catch(() => ''),
    ])
      .then(([analyses, mdContent]) => {
        const found = analyses.find((a) => a.slug === slug);
        if (!found) { setError('Analysis not found'); return; }
        setAnalysis(found);
        setContent(mdContent || `# ${found.title}\n\n*Content not available.*`);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;

  if (error || !analysis) {
    return (
      <div className="text-center py-16 sm:py-20">
        <div className="text-4xl mb-4">📄</div>
        <h2 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Not Found</h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>{error || "This analysis doesn't exist."}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold no-underline"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          <ArrowLeft size={16} /> Back Home
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(content);

  return (
    <article>
      <Helmet>
        <title>{analysis.title} — stocksfundamentals.online</title>
        <meta name="description" content={analysis.summary} />
        <meta property="og:title" content={analysis.title} />
        <meta property="og:description" content={analysis.summary} />
      </Helmet>

      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium no-underline mb-5 sm:mb-8 transition-colors"
        style={{ color: 'var(--text-dim)' }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
        <ArrowLeft size={14} /> Back to all analyses
      </Link>

      {/* Article header */}
      <header className="mb-6 sm:mb-8 pb-6 sm:pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold leading-snug flex-1" style={{ color: 'var(--text)' }}>
            {analysis.title}
          </h1>
          <span className="text-[0.55rem] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shrink-0 font-mono tracking-wider"
            style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa' }}>
            {analysis.ticker}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm" style={{ color: 'var(--text-dim)' }}>
          <span>{analysis.date}</span>
          <span className="text-[0.4rem]">●</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {readTime} min read</span>
          <span className="text-[0.4rem]">●</span>
          <div className="flex flex-wrap gap-1">
            {analysis.tags.map((tag) => (
              <span key={tag} className="text-[0.5rem] sm:text-[0.65rem] font-medium px-1.5 sm:px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Article body */}
      <div className="article-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>

      {/* Bottom nav */}
      <div className="mt-10 sm:mt-14 pt-6 sm:pt-8" style={{ borderTop: '1px solid var(--border)' }}>
        <Link to="/" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm font-semibold no-underline transition-opacity"
          style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <ArrowLeft size={16} /> All Analyses
        </Link>
      </div>
    </article>
  );
}
