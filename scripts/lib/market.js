/**
 * Which beat an article belongs to: `india` or `global`.
 *
 * The site publishes two things. Indian equity research is the core — the deep
 * dives, and the Modi / Ministries policy editions. Alongside it runs a global
 * macro beat: the Trump/US and Global Spillover editions, read for what they
 * mean to an investor who also holds US names.
 *
 * Until now those shared one undifferentiated pile, and the aggregate signal
 * went the wrong way: 107 of 254 articles are US or global, the seven
 * most-mentioned tickers are American, and Search Console showed the site
 * ranking at position 7.2 in the United States against 25.1 in India — on a
 * site whose stated purpose is Indian stocks. Splitting the two sections lets
 * each accumulate its own topical authority instead of diluting the other.
 *
 * `market` is written into analyses.json by generate-analyses-data.js, so every
 * downstream consumer (sitemap, prerender, the app) reads one derived value
 * rather than re-deriving it. Frontmatter always wins: the classifier is a
 * backfill for 254 existing articles, not a permanent guess.
 */

export const MARKETS = ['india', 'global'];
export const DEFAULT_MARKET = 'india';

/**
 * Policy Pulse edition names, which are the most reliable signal available.
 * The series has been published under 22 different title spellings, so match
 * loosely on the distinguishing word rather than the full pattern.
 */
const EDITION_GLOBAL = /\b(trump|global)\b/i;
const EDITION_INDIA = /\b(modi|ministr|cabinet|india\s*govt)\b/i;

/** Tags that state the answer outright. */
const TAG_GLOBAL = new Set(['us-only', 'global', 'us']);
const TAG_INDIA = new Set(['india', 'modi', 'rbi', 'sebi', 'nifty', 'india-govt']);

/** Indian index symbols. Their presence makes a piece India coverage. */
const INDIA_INDEX = new Set(['NIFTY', 'SENSEX', 'BANKNIFTY', 'NIFTY_IT']);

/**
 * US-listed symbols that appear as the PRIMARY ticker of a deep dive.
 * Only needed to catch the handful of non-Indian single-company pieces (AMD,
 * Palantir and similar); the policy editions are already caught by title.
 */
const US_PRIMARY = new Set([
  'AMD', 'NVDA', 'PLTR', 'AVGO', 'MU', 'INTC', 'TSLA', 'AAPL', 'MSFT', 'GOOGL',
  'AMZN', 'META', 'XOM', 'CVX', 'OXY', 'SLB', 'BKR', 'VLO', 'PSX', 'MPC',
  'DAL', 'UAL', 'AAL', 'LUV', 'CCL', 'RCL', 'NCLH', 'JPM', 'GS', 'CAT', 'DE',
  'COIN', 'MSTR', 'SPY', 'QQQ', 'USO', 'GM', 'F', 'FSLR', 'ENPH', 'DJT', 'RTX',
  'BA', 'LMT', 'NOC', 'GE', 'HON', 'MMM', 'KO', 'PEP', 'WMT', 'TGT',
]);

/**
 * Classify one article. `data` is the parsed frontmatter.
 *
 * Order matters: an explicit value beats an edition name, which beats a tag,
 * which beats the primary ticker. The final fallback is India, because an
 * unclassified piece is overwhelmingly a deep dive on an Indian company.
 */
export function classifyMarket(data) {
  const explicit = String(data.market ?? '').trim().toLowerCase();
  if (MARKETS.includes(explicit)) return explicit;

  const title = String(data.title ?? '');
  if (/policy\s*pulse/i.test(title)) {
    // Checked before the India edition names so "Modi & Trump" lands in global,
    // which is where a piece spanning both belongs.
    if (EDITION_GLOBAL.test(title)) return 'global';
    if (EDITION_INDIA.test(title)) return 'india';
  }

  const tickers = String(data.ticker ?? '')
    .split(/[:/]/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  // An Indian index as the subject outranks a topical tag. A piece on an Indian
  // market selloff is often tagged `global` because the cause was global, but
  // "Why Markets Crashed on June 23" with ticker NIFTY:SENSEX is India coverage.
  if (tickers.some((t) => INDIA_INDEX.has(t))) return 'india';

  const tags = (data.tags ?? []).map((t) => String(t).toLowerCase().trim());
  if (tags.some((t) => TAG_GLOBAL.has(t))) return 'global';
  if (tags.some((t) => TAG_INDIA.has(t))) return 'india';

  if (US_PRIMARY.has(tickers[0])) return 'global';

  return DEFAULT_MARKET;
}

/** Reader-facing names. */
export const MARKET_LABEL = {
  india: 'India',
  global: 'Global',
};

export const MARKET_BLURB = {
  india: 'Deep-dive research on Indian companies, plus the policy and regulatory '
    + 'decisions that move them.',
  global: 'US and global macro read for what it means to an investor holding '
    + 'Indian and American names side by side.',
};
