/**
 * Extract the stock-impact tables out of article markdown.
 *
 * The Policy Pulse editions carry the site's most distinctive asset: a table
 * mapping an event to specific tickers, each with a direction, a causal reason
 * and a confidence score, with deductions marked `⚠️ inferred`.
 *
 *   | Stock | Impact | Reason | Confidence |
 *   | ASIANPAINT, MRF | 🔴 Negative | Crude derivatives are the primary input... | 3/5 |
 *
 * Roughly 3,000 of those rows exist across 85 articles. Screener publishes
 * fundamentals and Moneycontrol publishes news; neither publishes a dated
 * causal history of what moved a stock and how confident the author was. That
 * is the thing worth surfacing, and until now it was buried two-thirds of the
 * way down articles titled only with a date.
 *
 * Parsed at build time into public/impact.json so the app and the prerender
 * both read one derived file rather than re-parsing markdown at runtime.
 */

/** Index and exchange tokens that are not impacted companies. */
const NOT_A_COMPANY = new Set([
  'NSE', 'BSE', 'NASDAQ', 'NYSE', 'NIFTY', 'SENSEX', 'BANKNIFTY', 'NIFTY_IT',
  'SPX', 'NDX', 'DJI', 'FII', 'DII', 'GEMS', 'US', 'IT', 'UK', 'EU', 'RBI',
  'SEBI', 'GST', 'IPO', 'QIP', 'EV', 'AI', 'OPEC', 'FED', 'ECB', 'IMF', 'WTI',
]);

const DIRECTION = [
  [/positive|🟢/i, 'positive'],
  [/negative|🔴/i, 'negative'],
  [/watch|neutral|🟡/i, 'watch'],
];

/** A reason has to actually say something; some early rows hold only a flag emoji. */
const MIN_REASON_WORDS = 5;

function splitRow(line) {
  if (!line.trim().startsWith('|')) return null;
  const cells = line.split('|').slice(1, -1).map((c) => c.trim());
  return cells.length >= 4 ? cells : null;
}

function parseDirection(cell) {
  for (const [re, value] of DIRECTION) if (re.test(cell)) return value;
  return null;
}

function parseTickers(cell) {
  return cell
    .replace(/\*\*/g, '')
    .split(/[,/]/)
    .map((t) => t.trim().toUpperCase())
    .filter((t) => /^[A-Z][A-Z&.-]{1,13}$/.test(t) && !NOT_A_COMPANY.has(t));
}

/**
 * Parse one article body.
 *
 * Returns [] for the ~170 articles that carry no impact table, which is the
 * normal case for a deep dive.
 */
export function parseImpactRows(body, meta) {
  const rows = [];
  let inFence = false;

  for (const line of body.split('\n')) {
    if (line.trimStart().startsWith('```')) { inFence = !inFence; continue; }
    if (inFence) continue;

    const cells = splitRow(line);
    if (!cells) continue;

    // Skip the header and the |---|---| separator.
    if (/^-{2,}$/.test(cells[0].replace(/:/g, '')) || /^stock$/i.test(cells[0])) continue;

    const direction = parseDirection(cells[1]);
    if (!direction) continue;

    const reasonRaw = cells[2].replace(/\*\*/g, '').trim();
    // Drop rows whose reason is a flag, an emoji or a bare country name. Those
    // are section markers inside the table, not impact calls.
    const reason = reasonRaw.replace(/^[^\p{L}\d]+/u, '').trim();
    if (reason.split(/\s+/).filter(Boolean).length < MIN_REASON_WORDS) continue;

    const confMatch = cells[3].match(/([1-5])\s*\/\s*5/);
    const tickers = parseTickers(cells[0]);
    if (!tickers.length) continue;

    for (const ticker of tickers) {
      rows.push({
        ticker,
        slug: meta.slug,
        title: meta.title,
        date: meta.date,
        direction,
        confidence: confMatch ? Number(confMatch[1]) : null,
        inferred: /inferred/i.test(reasonRaw),
        // The leading emoji is already gone, so strip a bare "inferred." too.
        reason: reason.replace(/^(?:⚠️\s*)?inferred[.:]?\s*/i, '').trim(),
      });
    }
  }
  return rows;
}

/**
 * Group rows by ticker, newest first, for public/impact.json.
 *
 * `minRows` keeps single-mention tickers out: one dated call is not a history,
 * and publishing 500 near-empty pages is the mistake the company hubs already
 * made once (AGENTS.md invariant 3.7). `maxPerTicker` trims the tail, because
 * this file is fetched whole by every company page.
 */
export function groupByTicker(rows, minRows = 3, maxPerTicker = 20) {
  const byTicker = new Map();
  for (const r of rows) {
    if (!byTicker.has(r.ticker)) byTicker.set(r.ticker, []);
    byTicker.get(r.ticker).push(r);
  }

  const out = {};
  for (const [ticker, list] of byTicker) {
    if (list.length < minRows) continue;
    list.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    // Newest 20 only. A reader does not need 42 entries, and the whole file is
    // fetched by every company page, so the tail is pure weight.
    out[ticker.toLowerCase()] = list.slice(0, maxPerTicker);
  }
  return out;
}
