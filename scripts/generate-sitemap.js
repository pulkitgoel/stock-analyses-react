import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SITEMAP_FILE = path.resolve(PUBLIC_DIR, 'sitemap.xml');
const ANALYSES_JSON = path.resolve(PUBLIC_DIR, 'analyses.json');
const BASE_URL = 'https://stocksfundamentals.online';

// `changefreq` and `priority` are deliberately NOT emitted. Google has stated
// publicly for years that it ignores both. `lastmod` is the only scheduling
// signal it reads, and it is read only when it is accurate.

const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/disclaimer',
  '/privacy'
];

// Index / exchange tokens that appear inside ticker strings but are not
// company pages worth listing.
// Kept in sync with the same list in generate-og-files.py.
const NON_COMPANY = new Set([
  'NSE', 'BSE', 'NASDAQ', 'NYSE', 'NIFTY', 'NIFTY_IT', 'BANKNIFTY', 'SENSEX',
  'US', 'IT', 'SPX', 'NDX', 'DJI', 'FII', 'DII', 'GEMS',
]);

// Tag that marks the daily policy-commentary series.
const NEWS_TAG = 'policy-pulse';

// A company hub is listed only when at least this many NON-series articles
// cover the ticker. Gating on total mentions instead would list every ticker a
// daily policy note happens to name: that produced 625 hubs, 233 of them backed
// by a single passing mention, each serving the same generic title. Gating on
// research coverage is what makes the hub about a company the site has actually
// analysed.
const MIN_RESEARCH_ARTICLES = 1;

// A /tag/{tag} page is listed only when at least this many articles carry the
// tag. There are 335 distinct tags across 254 articles; without a floor the
// other ~300 would be near-empty documents competing with the articles for
// crawl budget - the same failure that produced 625 company hubs, 233 of them
// backed by a single passing mention (invariant 3.7).
// Keep in sync with MIN_TAG_ARTICLES in src/utils/tags.ts and
// scripts/generate-og-files.py.
const MIN_TAG_ARTICLES = 12;

// Articles per archive page. Keep in sync with PAGE_SIZE in
// src/pages/ArchivePage.tsx.
const ARCHIVE_PAGE_SIZE = 9;

/**
 * URL-safe form of a tag. Mirrors tagSlug() in src/utils/tags.ts and
 * tag_slug() in scripts/generate-og-files.py; all three must agree or the
 * sitemap, the prerendered file and the route will disagree.
 */
function tagSlug(tag) {
  return String(tag ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Split the colon-delimited ticker field into real company tokens. */
function tickerTokens(raw) {
  const out = [];
  // Legacy entries used '/' as a delimiter as well as ':'.
  for (const token of String(raw ?? '').split(/[:/]/)) {
    const t = token.trim();
    if (t && !NON_COMPANY.has(t.toUpperCase())) out.push(t.toUpperCase());
  }
  return out;
}

function isSeriesArticle(analysis) {
  return (analysis.tags ?? [])
    .map((t) => String(t).toLowerCase())
    .includes(NEWS_TAG);
}

/** ISO date (YYYY-MM-DD) or null. Anything unparseable is dropped rather than guessed. */
function isoDate(value) {
  const s = String(value ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

let analyses;
try {
  ({ analyses } = JSON.parse(fs.readFileSync(ANALYSES_JSON, 'utf8')));
} catch (e) {
  console.error('Failed to read analyses.json for routes (run generate-analyses-data.js first):', e.message);
  process.exit(1);
}

const analysisRoutes = [];
// ticker -> { total, research, latest }
const companyStats = new Map();
// tag slug -> { tag, count, latest }
const tagStats = new Map();
let newestArticleDate = null;

for (const a of analyses) {
  const date = isoDate(a.date);
  if (date && (!newestArticleDate || date > newestArticleDate)) newestArticleDate = date;

  analysisRoutes.push({ loc: `/analysis/${a.slug}`, lastmod: date });

  for (const raw of new Set((a.tags ?? []).map((t) => String(t)))) {
    const slug = tagSlug(raw);
    if (!slug) continue;
    const stat = tagStats.get(slug) ?? { tag: String(raw), count: 0, latest: null };
    stat.count += 1;
    if (date && (!stat.latest || date > stat.latest)) stat.latest = date;
    tagStats.set(slug, stat);
  }

  const series = isSeriesArticle(a);
  for (const ticker of tickerTokens(a.ticker)) {
    const key = ticker.toLowerCase();
    const stat = companyStats.get(key) ?? { total: 0, research: 0, latest: null };
    stat.total += 1;
    if (!series) stat.research += 1;
    if (date && (!stat.latest || date > stat.latest)) stat.latest = date;
    companyStats.set(key, stat);
  }
}

const includedCompanies = [];
const excludedCompanies = [];
for (const [ticker, stat] of companyStats) {
  if (stat.research >= MIN_RESEARCH_ARTICLES) includedCompanies.push({ ticker, stat });
  else excludedCompanies.push(ticker);
}
includedCompanies.sort((a, b) => a.ticker.localeCompare(b.ticker));

const companyRoutes = includedCompanies.map(({ ticker, stat }) => ({
  loc: `/company/${ticker}`,
  lastmod: stat.latest,
}));

const tagRoutes = [...tagStats.entries()]
  .filter(([, stat]) => stat.count >= MIN_TAG_ARTICLES)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([slug, stat]) => ({ loc: `/tag/${slug}`, lastmod: stat.latest }));

// The archive pages are what make the whole library crawlable. The homepage
// links nine articles and hides the other 245 behind a JavaScript "load more",
// so before these routes existed those articles had no internal link pointing
// at them at all. Every page shifts when a new article publishes, so the newest
// article date is the honest lastmod for each of them.
const archivePageCount = Math.ceil(analyses.length / ARCHIVE_PAGE_SIZE);
const archiveRoutes = Array.from({ length: archivePageCount }, (_, i) => ({
  loc: `/analyses/page/${i + 1}`,
  lastmod: newestArticleDate,
}));

// The homepage changes whenever the newest article does.
const staticRouteEntries = staticRoutes.map((loc) => ({
  loc,
  lastmod: loc === '/' ? newestArticleDate : null,
}));

const allRoutes = [
  ...staticRouteEntries,
  ...analysisRoutes,
  ...companyRoutes,
  ...tagRoutes,
  ...archiveRoutes,
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(({ loc, lastmod }) => `  <url>
    <loc>${BASE_URL}${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');

// No company-index.json is written. CompanyPage and generate-og-files.py each
// derive indexability from analyses.json using the same MIN_RESEARCH_ARTICLES
// rule, so a third copy of that list would be one more thing to drift.

const withLastmod = allRoutes.filter((r) => r.lastmod).length;
console.log(`Generated sitemap.xml with ${allRoutes.length} URLs (${withLastmod} with lastmod)`);
console.log(`  static:   ${staticRouteEntries.length}`);
console.log(`  analysis: ${analysisRoutes.length}`);
console.log(`  company:  ${companyRoutes.length} listed, ${excludedCompanies.length} excluded (< ${MIN_RESEARCH_ARTICLES} research article)`);
console.log(`  tag:      ${tagRoutes.length} listed, ${tagStats.size - tagRoutes.length} excluded (< ${MIN_TAG_ARTICLES} articles)`);
console.log(`  archive:  ${archiveRoutes.length} pages of ${ARCHIVE_PAGE_SIZE}`);
