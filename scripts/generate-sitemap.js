import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SITEMAP_FILE = path.resolve(PUBLIC_DIR, 'sitemap.xml');
const BASE_URL = 'https://stocksfundamentals.online';

const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/disclaimer',
  '/privacy'
];

let dynamicRoutes = [];
let companyRoutes = new Set();

try {
  const tsContent = fs.readFileSync(path.resolve(__dirname, '../src/services/analysisService.ts'), 'utf8');
  const slugRegex = /slug:\s*'([^']+)'/g;
  const tickerRegex = /ticker:\s*'([^']+)'/g;
  
  let match;
  while ((match = slugRegex.exec(tsContent)) !== null) {
    dynamicRoutes.push(`/analysis/${match[1]}`);
  }
  
  while ((match = tickerRegex.exec(tsContent)) !== null) {
    const tickers = match[1].split('/');
    for (const t of tickers) {
      if (t && !['NSE', 'NIFTY', 'US', 'IT'].includes(t)) {
        companyRoutes.add(`/company/${t.toLowerCase()}`);
      }
    }
  }
} catch (e) {
  console.error('Failed to parse analysisService.ts for routes:', e);
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
