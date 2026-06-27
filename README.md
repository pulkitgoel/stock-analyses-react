# 📈 Stock Analyses Dashboard — stocksfundamentals.online

A dark-themed financial analysis dashboard built with **React + Vite + TypeScript + Tailwind CSS v4**. Features real-time market ticker, tag-based filtering, and company deep-dive analysis pages.

## 🚀 Tech Stack

- **React 19** + TypeScript
- **Vite** (esbuild, fast HMR)
- **Tailwind CSS v4**
- **React Router v7**
- **Recharts** (FII/DII flow charts)
- **react-markdown** + rehype plugins for analysis rendering
- **Python backend** (port 8081) for notifications + API

## 📂 Project Structure

```
src/
├── components/
│   ├── Common/        — NotificationModal, SubscribeCard, LoadingSpinner
│   ├── Dashboard/     — MarketTicker, HeroFeatured, TagPills, AnalysisGrid
│   ├── Home/          — AnalysisCard, HeroSection, SearchBar, StatsBar
│   └── Layout/        — Header, Footer, Layout
├── hooks/             — useAnalyses, useSearch, useNotification
├── pages/             — HomePage, AnalysisPage, CompanyPage, AboutPage, etc.
├── services/          — analysisService, marketService, notificationService
└── types/             — TypeScript interfaces
```

## 🏃 Run Locally

```bash
npm install
npm run dev        # Dev server on port 5173
npm run build      # Production build to dist/
```

## 🌐 Deployment

- Nginx serves from `/var/www/stock-analyses-react/dist/`
- SPA fallback: `try_files $uri $uri/ /index.html`
- HTTPS via Let's Encrypt
- Deploy via `./deploy.sh`

## 📄 Pages

| Route | Page |
|---|---|
| `/` | Home — Dashboard with ticker, featured hero, tag filters, analysis grid |
| `/analysis/:slug` | Full analysis markdown render |
| `/company/:ticker` | All deep-dives for a stock |
| `/about` | About page |
| `/contact` | Contact page |
| `/disclaimer` | Disclaimer |
| `/privacy` | Privacy policy |

## 🔔 Notifications

- Web push via Service Worker
- Email & Telegram subscription modal
- Backend: Python server on port 8081
- Endpoints: `/api/subscribe`, `/api/notify`, `/api/analyses`

## 📊 Data Sources

- **Analyses**: Markdown files in `public/analyses/`
- **Market data**: API endpoints from Python backend
- **FII/DII tracking**: Inline data from analysis markdown
