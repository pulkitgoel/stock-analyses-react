import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import CompanyPage from './pages/CompanyPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DisclaimerPage from './pages/DisclaimerPage';
import PrivacyPage from './pages/PrivacyPage';
import WatchlistPage from './pages/WatchlistPage';
import RequestResearchPage from './pages/RequestResearchPage';
import TagPage from './pages/TagPage';
import ArchivePage from './pages/ArchivePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/analysis/:slug" element={<AnalysisPage />} />
            <Route path="/company/:ticker" element={<CompanyPage />} />
            {/* Crawlable archive and topic routes (AGENTS.md 7.5). The homepage
                renders nine cards and hides the rest behind a "load more", so
                without these 245 articles had no internal link pointing at them. */}
            <Route path="/tag/:tag" element={<TagPage />} />
            <Route path="/analyses/page/:page" element={<ArchivePage />} />
            {/* The two beats, kept apart so each accumulates its own topical
                authority instead of diluting the other (src/utils/market.ts).
                Page 1 is the bare section URL; no /page/1 duplicate. */}
            <Route path="/india" element={<ArchivePage market="india" />} />
            <Route path="/india/page/:page" element={<ArchivePage market="india" />} />
            <Route path="/global" element={<ArchivePage market="global" />} />
            <Route path="/global/page/:page" element={<ArchivePage market="global" />} />
            <Route path="/analyses" element={<Navigate to="/analyses/page/1" replace />} />
            {/* Readers nominate a company for the research queue; Hermes drains
                it. docs/RESEARCH-REQUESTS.md. One URL, prerendered like the
                static pages, so nginx needs `try_files $uri.html =404` on it
                and NOT the /index.html fallback (invariant 3.13). */}
            <Route path="/request-research" element={<RequestResearchPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            {/* Unlisted: reachable only by direct URL, not linked in any nav or sitemap. */}
            <Route path="/watchlist" element={<WatchlistPage />} />
            {/* Alias: also accept the plural spelling /watchlists -> /watchlist */}
            <Route path="/watchlists" element={<Navigate to="/watchlist" replace />} />
            {/* Catch-all. Renders a noindex page so unmatched URLs are not
                indexed. nginx must also return a real 404 status for these:
                see docs/nginx-seo.conf. */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
