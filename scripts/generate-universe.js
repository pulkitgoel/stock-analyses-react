#!/usr/bin/env node
/**
 * Build public/universe.json — the closed set of companies a reader may request.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * docs/RESEARCH-REQUESTS.md section 0: the reader never sends text that reaches a
 * prompt. The request form is a picker over this file, and the API re-resolves the
 * submitted id against the server's own copy of it. The set of strings that can ever
 * reach an agent is therefore exactly the set of symbols in here.
 *
 * That makes this file a security boundary, not a convenience. Two consequences:
 *
 *   1. It is generated from NSE's own published lists, never hand-edited. A symbol
 *      nobody can verify is a symbol nobody should be able to request.
 *   2. It FAILS CLOSED. A fetch error, or a row count that collapses, keeps the
 *      committed file rather than writing a short or empty one. An empty universe
 *      would not open a hole (nothing would resolve), but a PARTIAL one silently
 *      deletes companies from the picker, and that reads as "the feature is broken"
 *      rather than "the data is stale".
 *
 * TIERS, AND WHY THEY ARE NOT ALL THE SAME
 * ----------------------------------------
 * RESEARCH-REQUESTS section 3.2: a stranger queueing an illiquid microcap and
 * getting an independent-looking report published under the owner's byline is the
 * shape of a pump, so only companies that are already widely held and widely
 * covered take the automatic path. Everything else is held for the owner.
 *
 * The first design gated that on market capitalisation. It was wrong in practice:
 * the quote backend serves the Yahoo v8 chart endpoint, which returns a price and
 * no market cap, so the floor would have been enforced against a number that had
 * to be guessed or scraped from somewhere less reliable than the exchange.
 *
 * NSE publishes the answer directly. The tier here is read from two of its own
 * files, so the gate is an exchange-published fact rather than a magic number:
 *
 *   broad   in the NIFTY Total Market index (755 names, ~94% of listed market
 *           cap) -> eligible for the automatic path
 *   main    EQ series but outside that index -> held for the owner
 *   watch   BE/BZ, trade-to-trade and surveillance: the exchange itself saying
 *           it has concerns about the scrip -> held
 *   sme     the EMERGE platform -> held
 *
 * Membership is auditable, stable, needs no live lookup, and moves when NSE
 * rebalances rather than when an API changes shape.
 *
 * SHAPE
 * -----
 * Column-oriented, because the browser downloads this. Per-row objects cost about
 * 190 KB for the same data; this is ~150 KB raw and ~50 KB over the wire, and it is
 * fetched lazily on first focus of the input, never on page load.
 *
 * Usage:
 *   node scripts/generate-universe.js            # fetch, validate, write
 *   node scripts/generate-universe.js --check    # report, write nothing
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'universe.json');

const SOURCES = [
  {
    url: 'https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv',
    label: 'NSE main board',
    // SERIES -> tier. A series not listed here is skipped: debt, government
    // securities and the rest are not companies anyone should request research on.
    series: { EQ: 'main', BE: 'watch', BZ: 'watch' },
    cols: { sym: 'SYMBOL', name: 'NAME OF COMPANY', series: 'SERIES' },
    min: 2000,
  },
  {
    url: 'https://nsearchives.nseindia.com/emerge/corporates/content/SME_EQUITY_L.csv',
    label: 'NSE EMERGE (SME)',
    series: { SM: 'sme', ST: 'sme', EQ: 'sme' },
    cols: { sym: 'SYMBOL', name: 'NAME_OF_COMPANY', series: 'SERIES' },
    min: 200,
  },
];

// The breadth gate. Membership here promotes a row to "broad"; the file also
// carries the sector, which is the only human-readable context the picker can
// show under a company name without a live lookup.
const INDEX = {
  url: 'https://nsearchives.nseindia.com/content/indices/ind_niftytotalmarket_list.csv',
  label: 'NIFTY Total Market',
  cols: { sym: 'SYMBOL', industry: 'INDUSTRY' },
  min: 500,
};

// A browser UA is required: nsearchives serves a block page to default agents.
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/csv,text/plain,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Symbols that are not operating companies. tickerTokens() in src/utils/tickers.ts
// excludes the index names from article ticker strings for the same reason; these
// additionally cover the ETF and fund symbols that sit in the equity list.
const NOT_A_COMPANY = /^(NIFTY|BANKNIFTY|SENSEX|.*(ETF|BEES|IETF|GOLD|SILVER)$)/;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(',').map((h) => h.trim().toUpperCase());
  return lines.slice(1).map((line) => {
    // NSE's files are plain comma-separated with no quoted fields; company names
    // that contain a comma would break this, so the row count is checked below and
    // a malformed row is dropped rather than half-parsed.
    const cells = line.split(',');
    const row = {};
    header.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
    return row;
  });
}

/** Trim the exchange's legal-form boilerplate; "Limited" on 2,300 rows is noise. */
function tidyName(raw) {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\s+(Limited|Ltd\.?|Limted)\.?$/i, '')
    .trim();
}

async function fetchSource(source) {
  const res = await fetch(source.url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${source.label}: HTTP ${res.status}`);
  const body = await res.text();
  const rows = parseCsv(body);
  // nsearchives answers a blocked request with an HTML page and a 200, so the
  // status is not the check. The check is that the column this source is read
  // for is actually present — which also catches a file whose header moved.
  if (!rows.length || !(source.cols.sym in rows[0])) {
    throw new Error(`${source.label}: no ${source.cols.sym} column (blocked, or the file moved)`);
  }
  if (rows.length < source.min) {
    throw new Error(`${source.label}: ${rows.length} rows, expected at least ${source.min}`);
  }
  return rows;
}

async function build() {
  const seen = new Map();
  const counts = {};

  for (const source of SOURCES) {
    const rows = await fetchSource(source);
    for (const row of rows) {
      const sym = (row[source.cols.sym] || '').trim().toUpperCase();
      const name = tidyName(row[source.cols.name] || '');
      const tier = source.series[(row[source.cols.series] || '').trim().toUpperCase()];
      if (!sym || !name || !tier) continue;
      if (NOT_A_COMPANY.test(sym)) continue;
      // The main board wins a collision: a symbol on both lists is tradeable
      // normally, and the stricter tier would needlessly hold it.
      if (seen.has(sym) && seen.get(sym)[2] === 'main') continue;
      seen.set(sym, [sym, name, tier, '']);
    }
    counts[source.label] = rows.length;
  }

  // Promote index members. A symbol in the index that is somehow absent from the
  // equity list is ignored rather than invented: the equity list is the roll of
  // what is listed, and a universe row nobody can trade is a bad picker entry.
  const indexRows = await fetchSource(INDEX);
  let promoted = 0;
  for (const row of indexRows) {
    const sym = (row[INDEX.cols.sym] || '').trim().toUpperCase();
    const entry = seen.get(sym);
    if (!entry) continue;
    entry[3] = (row[INDEX.cols.industry] || '').trim();
    if (entry[2] === 'main') {
      entry[2] = 'broad';
      promoted += 1;
    }
  }
  counts[INDEX.label] = indexRows.length;
  counts['promoted to broad'] = promoted;

  const rows = [...seen.values()].sort((a, b) => a[0].localeCompare(b[0]));
  return { rows, counts };
}

function readExisting() {
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf8'));
  } catch {
    return null;
  }
}

const check = process.argv.includes('--check');

let built;
try {
  built = await build();
} catch (err) {
  const existing = readExisting();
  if (existing) {
    // Fail closed: a stale picker is a usable picker. An empty one is an outage.
    console.error(`universe: ${err.message}`);
    console.error(`universe: keeping the committed file (${existing.rows.length} rows)`);
    process.exit(check ? 1 : 0);
  }
  console.error(`universe: ${err.message} — and no committed file to fall back on`);
  process.exit(1);
}

const existing = readExisting();
if (existing && built.rows.length < existing.rows.length * 0.8) {
  console.error(
    `universe: refusing to shrink ${existing.rows.length} -> ${built.rows.length} rows. ` +
    'Re-run, or delete public/universe.json deliberately if the drop is real.'
  );
  process.exit(1);
}

const byTier = built.rows.reduce((acc, r) => {
  acc[r[2]] = (acc[r[2]] || 0) + 1;
  return acc;
}, {});

const summary =
  `universe: ${built.rows.length} companies ` +
  `(${Object.entries(byTier).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}`).join(', ')})`;

if (check) {
  console.log(summary);
  console.log('universe: --check, nothing written');
  process.exit(0);
}

const payload = {
  v: 1,
  generated: new Date().toISOString().slice(0, 10),
  source: 'NSE EQUITY_L.csv + EMERGE SME_EQUITY_L.csv + ind_niftytotalmarket_list.csv',
  cols: ['sym', 'name', 'tier', 'industry'],
  rows: built.rows,
};

fs.writeFileSync(OUT, JSON.stringify(payload) + '\n');
console.log(summary);
console.log(`universe: wrote ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
