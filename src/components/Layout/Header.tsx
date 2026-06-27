import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, FileText, Home, Info, Mail, Moon, ShieldCheck, Sun } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Home', mobileLabel: 'Home', icon: Home },
  { path: '/about', label: 'About', mobileLabel: 'About', icon: Info },
  { path: '/contact', label: 'Contact', mobileLabel: 'Mail', icon: Mail },
  { path: '/disclaimer', label: 'Risk', mobileLabel: 'Risk', icon: ShieldCheck },
  { path: '/privacy', label: 'Privacy', mobileLabel: 'Privacy', icon: FileText },
];

export default function Header() {
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const saved = localStorage.getItem('sf-theme-v2');
    const nextTheme = saved === 'light' || saved === 'dark' ? saved : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('sf-theme-v2', nextTheme);
  };

  return (
    <>
      <header
        className="sticky top-0 z-[100]"
        style={{
          background: 'var(--header-bg)',
          backdropFilter: 'blur(22px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="app-container">
          <div className="flex h-18 items-center justify-between gap-4">
            <Link to="/" className="focus-ring flex min-w-0 items-center gap-3 rounded-2xl no-underline">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 transition-transform duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                  color: 'var(--accent-contrast)',
                  boxShadow: '0 14px 28px rgba(34,197,94,0.18)',
                }}
              >
                <BarChart3 size={20} />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-black tracking-tight sm:text-base" style={{ color: 'var(--text)' }}>
                  StockFundamentals
                </span>
                <span className="hidden truncate text-xs font-semibold sm:block" style={{ color: 'var(--text-dim)' }}>
                  Institutional-style research
                </span>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <nav
                aria-label="Primary navigation"
                className="nav-shell hidden items-center gap-1 rounded-2xl md:flex"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="nav-link focus-ring flex items-center gap-2 rounded-xl text-sm font-black no-underline transition-all duration-200"
                      style={{
                        color: active ? 'var(--accent-contrast)' : 'var(--text-muted)',
                        background: active ? 'var(--accent)' : 'transparent',
                      }}
                    >
                      <Icon size={15} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={toggleTheme}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 hover:-translate-y-0.5 sm:h-11 sm:w-11"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  boxShadow: 'var(--shadow-card)',
                }}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-3 z-[100] grid grid-cols-5 gap-1 rounded-[1.4rem] p-1.5 md:hidden"
        style={{
          background: 'var(--header-bg)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(22px)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        {navLinks.map((link) => {
          const active = isActive(link.path);
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="focus-ring flex h-13 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-[0.64rem] font-black no-underline transition-all"
              style={{
                color: active ? 'var(--accent-contrast)' : 'var(--text-dim)',
                background: active ? 'var(--accent)' : 'transparent',
              }}
            >
              <Icon size={17} />
              <span className="max-w-full truncate">{link.mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
