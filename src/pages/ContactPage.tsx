import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-[600px]">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 sm:mb-8" style={{ color: 'var(--text)' }}>Contact</h1>
      <div className="space-y-4 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        <p>
          Have a stock you'd like analyzed? Found an error? Want to collaborate? Drop a message.
        </p>
        <div className="p-4 sm:p-5 rounded-xl flex items-center gap-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Mail size={18} style={{ color: 'var(--accent)' }} />
          <a href="mailto:pulkitgoel28@gmail.com" className="no-underline text-sm sm:text-base font-medium break-all"
            style={{ color: 'var(--accent)' }}>
            pulkitgoel28@gmail.com
          </a>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Response within 24-48 hours.
        </p>
      </div>
      <div className="mt-8 sm:mt-10">
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold no-underline transition-all"
          style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <ArrowLeft size={16} /> Home
        </Link>
      </div>
    </div>
  );
}
