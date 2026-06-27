import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-[650px]">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 sm:mb-8" style={{ color: 'var(--text)' }}>About</h1>
      <div className="space-y-4 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        <p>
          <strong style={{ color: 'var(--text)' }}>stocksfundamentals.online</strong> is a deep-dive stock research platform built by Pulkit — a software engineer and self-taught investor based in Noida, India.
        </p>
        <p>
          Every analysis is backed by real NSE/BSE data, delivery volumes, promoter trends, quarterly results, and concall transcripts. No fluff — just data-driven research.
        </p>
        <p>
          Covering both <strong style={{ color: 'var(--text)' }}>Indian stocks</strong> (NSE/BSE) and <strong style={{ color: 'var(--text)' }}>US stocks</strong> (NASDAQ/NYSE):
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>📊 Fundamental analysis (P/E, PEG, RoCE, debt, FCF)</li>
          <li>📈 Technical analysis (RSI, MAs, delivery %)</li>
          <li>🎙️ Earnings call transcript analysis</li>
          <li>🏛️ Promoter & FII/DII activity tracking</li>
          <li>🔍 Block/bulk deal scanning</li>
        </ul>
        <p className="pt-2">
          Built with React, Python, Nginx, and late-night coffee.
        </p>
      </div>
      <div className="mt-8 sm:mt-10">
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold no-underline transition-all"
          style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <ArrowLeft size={16} /> Browse Analyses
        </Link>
      </div>
    </div>
  );
}
