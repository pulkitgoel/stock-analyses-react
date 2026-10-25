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
 * BOARDS, AND WHY THEY ARE NOT ALL THE SAME
 * -----------------------------------------
 * NSE's SERIES column separates ordinary trading from restricted trading:
 *
 *   EQ      normal rolling settlement          -> "main"
 *   BE/BZ   trade-to-trade and surveillance    -> "watch"
 *   SME     the EMERGE platform, separate list -> "sme"
 *
 * Only "main" is eligible for the automatic path. "watch" is the exchange itself
 * saying it has concerns about a scrip, and "sme" names are small and thin — both
 * are held for the owner (RESEARCH-REQUESTS section 3.2). Carrying the board here
 * means the gate is reading the exchange's own classification instead of guessing
 * from a market cap alone.
 *
 * SHAPE
 * -----
 * Column-oriented, because the browser downloads this. Per-row objects cost about
 * 190 KB for the same data; this is ~140 KB raw and ~45 KB over the wire, and it is
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
    // SERIES -> board. A series not listed here is skipped: debt, government
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
  if (!/^SYMBOL/i.test(body.trim())) {
    throw new Error(`${source.label}: response is not the CSV (blocked or moved)`);
  }
  const rows = parseCsv(body);
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
      const board = source.series[(row[source.cols.series] || '').trim().toUpperCase()];
      if (!sym || !name || !board) continue;
      if (NOT_A_COMPANY.test(sym)) continue;
      // The main board wins a collision: a symbol listed on both is tradeable
      // normally, and the stricter board would needlessly hold it.
      if (seen.has(sym) && seen.get(sym)[2] === 'main') continue;
      seen.set(sym, [sym, name, board]);
    }
    counts[source.label] = rows.length;
  }

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

const byBoard = built.rows.reduce((acc, r) => {
  acc[r[2]] = (acc[r[2]] || 0) + 1;
  return acc;
}, {});

const summary =
  `universe: ${built.rows.length} companies ` +
  `(${Object.entries(byBoard).map(([k, v]) => `${v} ${k}`).join(', ')})`;

if (check) {
  console.log(summary);
  console.log('universe: --check, nothing written');
  process.exit(0);
}

const payload = {
  v: 1,
  generated: new Date().toISOString().slice(0, 10),
  source: 'NSE EQUITY_L.csv + EMERGE SME_EQUITY_L.csv',
  cols: ['sym', 'name', 'board'],
  rows: built.rows,
};

fs.writeFileSync(OUT, JSON.stringify(payload) + '\n');
console.log(summary);
console.log(`universe: wrote ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
