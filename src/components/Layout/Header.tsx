import { Link, useLocation } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/disclaimer', label: 'Disclaimer' },
  { path: '/privacy', label: 'Privacy' },
];

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-100" style={{ background: 'var(--header-bg)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-[1000px] mx-auto px-3 sm:px-6 flex items-center justify-between h-12 sm:h-14">
        <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg shrink-0" style={{ background: 'linear-gradient(135deg, var(--accent), #6366f1)' }}>
            <BarChart3 size={15} className="text-white" />
          </div>
          <span className="hidden sm:inline font-bold text-sm" style={{ color: 'var(--text)' }}>
            Stock<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Fundamentals</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar ml-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[0.7rem] sm:text-sm font-medium no-underline whitespace-nowrap transition-colors"
              style={{
                color: isActive(link.path) ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive(link.path) ? 'var(--accent-glow)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
