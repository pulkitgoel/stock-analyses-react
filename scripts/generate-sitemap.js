import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SITEMAP_FILE = path.resolve(PUBLIC_DIR, 'sitemap.xml');
const ANALYSES_JSON = path.resolve(PUBLIC_DIR, 'analyses.json');
const BASE_URL = 'https://stocksfundamentals.online';

const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/disclaimer',
  '/privacy'
];

// Index / exchange tokens that appear inside ticker strings but are not
// company pages worth listing (CompanyPage matches ticker substrings).
const NON_COMPANY = new Set([
  'NSE', 'BSE', 'NASDAQ', 'NYSE', 'NIFTY', 'NIFTY_IT', 'BANKNIFTY', 'SENSEX',
  'US', 'IT', 'SPX', 'NDX', 'DJI', 'FII', 'DII', 'GEMS',
]);

const dynamicRoutes = [];
const companyRoutes = new Set();

try {
  const { analyses } = JSON.parse(fs.readFileSync(ANALYSES_JSON, 'utf8'));
  for (const a of analyses) {
    dynamicRoutes.push(`/analysis/${a.slug}`);
    // Tickers are delimited by ':' (e.g. "AAPL:MSFT:NVDA"); some legacy
    // entries also used '/'.
    for (const token of String(a.ticker).split(/[:/]/)) {
      const t = token.trim();
      if (t && !NON_COMPANY.has(t.toUpperCase())) {
        companyRoutes.add(`/company/${t.toLowerCase()}`);
      }
    }
  }
} catch (e) {
  console.error('Failed to read analyses.json for routes (run generate-analyses-data.js first):', e.message);
  process.exit(1);
}

const allRoutes = [...staticRoutes, ...dynamicRoutes, ...Array.from(companyRoutes)];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/analysis') ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');
console.log(`Generated sitemap.xml with ${allRoutes.length} URLs`);
