# 📈 Stock Analyses Dashboard — stocksfundamentals.online

A dark-themed financial analysis dashboard built with **React + Vite + TypeScript + Tailwind CSS v4**. Features real-time market ticker, clean search and filter capabilities, and company deep-dive analysis pages.

---

## 🚀 Tech Stack

- **React 19** + TypeScript
- **Vite** (esbuild, fast HMR)
- **Tailwind CSS v4** (integrated via `@tailwindcss/vite` plugin)
- **React Router v7**
- **react-markdown** + rehype plugins for institutional analysis rendering
- **Python backend** (port 8081) for notifications + API

---

## 📂 Project Structure

```
src/
├── components/
│   ├── Common/        — SubscribeCard, LoadingSpinner
│   ├── Dashboard/     — AnalysisGrid
│   ├── Home/          — SearchBar, StatsBar, AnalysisCard
│   └── Layout/        — Header, Footer, Layout
├── hooks/             — useAnalyses, useSearch, useNotification
├── pages/             — HomePage, AnalysisPage, CompanyPage, AboutPage, ContactPage, etc.
├── services/          — analysisService
└── types/             — TypeScript interfaces
```

---

## 🎨 Layout & UI Enhancements

Recently refactored to resolve overlapping text, layout constraints, and alignment issues:
1. **Removed Tags Section**: Cleaned up clutter by removing the legacy `TagPills` component to focus purely on search and category sorting.
2. **Revamped Search Bar**: Redesigned to guarantee search icon and placeholder text never overlap. The icon resides in its own isolated layout pill.
3. **Card Spacing & Layout**: Fixed grid-gap spacing (`style={{ gap: '2rem' }}`) and resolved stacking context issue (`relative hover:z-10`) so hovered cards float above neighboring cards smoothly without bleeding underneath.
4. **Card Shadow Clipping**: Removed `overflow: clip` from `.premium-card` in `index.css` to allow premium card shadows to render properly while maintaining sheen animation constraints.
5. **Static Pages Overhaul**: Revamped **About**, **Contact**, **Risk Disclaimer**, **Privacy Policy**, and **Footer** pages with premium card grids, custom SVG-based layout components, email CTA interactions, and structured content.
6. **Tailwind CSS v4 Stance**: Critical layouts use direct inline styles to guarantee rendering where dynamic runtime classes may not have been scanned during compilation.

---

## 🏃 Run Locally

```bash
npm install
npm run dev        # Dev server on port 5173
npm run build      # Production build to dist/
```

---

## 🌐 Deployment

- Nginx serves from `/var/www/stock-analyses-react/dist/`
- SPA fallback: `try_files $uri $uri/ /index.html`
- HTTPS via Let's Encrypt
- Deploy via `./deploy.sh`

---

## 📄 Pages

| Route | Page |
|---|---|
| `/` | Home — Dashboard with ticker, featured hero, search/sort tools, and analysis grid |
| `/analysis/:slug` | Full analysis markdown render |
| `/company/:ticker` | All deep-dives for a stock |
| `/about` | About page (overview, creator info) |
| `/contact` | Contact page (mail direct link, FAQ accordion) |
| `/disclaimer` | Disclaimer (risk warning, positions disclosure) |
| `/privacy` | Privacy policy (notifications, telemetry control) |

---

## 📊 Data Sources

- **Analyses**: Markdown files in `public/analyses/`. Each file's **frontmatter is the single source of truth** for its metadata. At build time `scripts/generate-analyses-data.js` scans them and generates `src/data/analyses.generated.ts` (imported by the app) and `public/analyses.json` — plus the sitemap and per-analysis OG tags. Nothing is hand-maintained in sync.
- **Market data**: `src/services/marketService.ts` (currently simulated placeholder values).
- **FII/DII tracking**: Inline data from analysis markdown

## ✍️ Publishing a new analysis

See **[PUBLISHING.md](./PUBLISHING.md)** for the full contract. TL;DR:

```bash
node scripts/new-analysis.js --title "..." --ticker "TICKER" --tags "a,b" \
  --summary "..." --body-file draft.md
npm run build && ./deploy.sh
```

Never hand-edit `src/data/analyses.generated.ts` or `public/analyses.json` — they are regenerated on every build.
