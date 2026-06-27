import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5 sm:gap-6 flex-wrap justify-center">
            <Link to="/" className="no-underline text-xs sm:text-sm transition-colors" style={{ color: 'var(--text-dim)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
              Home
            </Link>
            <Link to="/about" className="no-underline text-xs sm:text-sm transition-colors" style={{ color: 'var(--text-dim)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
              About
            </Link>
            <Link to="/contact" className="no-underline text-xs sm:text-sm transition-colors" style={{ color: 'var(--text-dim)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
              Contact
            </Link>
            <Link to="/disclaimer" className="no-underline text-xs sm:text-sm transition-colors" style={{ color: 'var(--text-dim)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
              Disclaimer
            </Link>
            <Link to="/privacy" className="no-underline text-xs sm:text-sm transition-colors" style={{ color: 'var(--text-dim)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dim)'}>
              Privacy
            </Link>
          </div>
          <div className="text-xs sm:text-sm" style={{ color: 'var(--text-dim)' }}>
            Built by Pulkit
          </div>
        </div>
      </div>
    </footer>
  );
}
