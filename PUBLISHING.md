# 📤 Publishing a New Analysis — Agent Guide

This is the **canonical procedure** for the Hermes agent (or any human) to publish
a new analysis to stocksfundamentals.online. Follow it exactly.

## The one rule: markdown is the single source of truth

Every analysis is **one file**: `public/analyses/<slug>.md`. Its YAML-style
frontmatter is the *only* place metadata lives. The card list, the sitemap, the
link-preview (OG) tags, and the in-app fallback data are all **generated from it
at build time**. There is no `analyses.json` to hand-edit and no hardcoded array
to keep in sync anymore — if the frontmatter is right, everything downstream is
right.

- The **slug is the file name** (`ather-energy-deep-dive.md` → `/analysis/ather-energy-deep-dive`). Never store `slug` in the frontmatter.
- If required frontmatter is missing or malformed, **the build fails loudly** — a broken publish can't ship silently.

---

## Frontmatter contract

The file must begin with a `---` fenced block. **Every value is valid JSON**
(quote strings, use `[...]` for arrays). This is what makes parsing bulletproof
for summaries containing colons, commas, ₹ symbols, and apostrophes.

```markdown
---
title: "Ather Energy — Deep Dive Analysis"
ticker: "ATHERENERG"
date: "2026-07-04"
tags: ["ev", "auto", "e2w"]
summary: "One-paragraph hook shown on cards and in link previews. Keep it under ~200 chars; the first 160 chars become the meta description."
model: "deepseek-chat"
---

# Ather Energy — Deep Dive Analysis

...the full markdown analysis body...
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `title` | ✅ | string | Shown as the page `<h1>` and in `<title>`. |
| `ticker` | ✅ | string | See ticker conventions below. |
| `date` | ✅ | string | **`YYYY-MM-DD`** exactly. Drives newest-first ordering. |
| `tags` | ✅ | string[] | lowercase-kebab-case, e.g. `["deep-dive","semiconductor"]`. |
| `summary` | ✅ | string | Card blurb + meta description (first 160 chars). |
| `model` | optional | string | Provenance, e.g. `"deepseek-chat"` or `"deepseek-chat via Hermes Agent"`. Defaults to `deepseek-chat`. |

### Ticker conventions
- Single stock: `"ATHERENERG"` or with exchange `"PLTR:NASDAQ"`.
- Multi-stock / thematic post: colon-separated, e.g. `"AAPL:MSFT:NVDA:AMZN"`.
- Each token becomes a `/company/<token>` page in the sitemap. Pure index/exchange
  tokens (`NSE`, `NASDAQ`, `NIFTY`, `SENSEX`, `FII`, `DII`, …) are auto-skipped.

---

## Article types & home-page segregation

The home page splits every note into **two tabs**: **Stock Research** and
**Policy Pulse**. Which tab a note lands in is decided *automatically from its
frontmatter* — there is no separate "category" field to set. Get the tags right
and the note files itself.

> The exact rule lives in `src/utils/category.ts`. It is: a note is **Policy
> Pulse** if its `tags` include `policy-pulse` **or** `policy-tracker`, **or** its
> `title` starts with "Policy Pulse". Otherwise it is **Stock Research**.

| Article type | Tab it lands in | How to guarantee it | Example |
|---|---|---|---|
| Daily macro / policy tracker | **Policy Pulse** | Add tag **`policy-pulse`** (and title `Policy Pulse — <Desk> — <DD Mon YYYY>`) | `"Policy Pulse — Modi — 03 Jul 2026"`, tags `["policy-pulse","modi","defence"]` |
| Company deep-dive | Stock Research | Use `deep-dive` (+ `fundamental`, sector tags). **Do not** add `policy-pulse`. | tags `["deep-dive","fundamental","semiconductor"]` |
| Market / index note | Stock Research | Use `market-analysis` / `us-markets` (no policy tag) | tags `["market-analysis","crash","global"]` |
| Institutional flows (FII/DII, gems) | Stock Research | Use `fii-dii` / `institutional-gems` (no policy tag) | tags `["fii-dii","institutional-flows"]` |

### The two rules that matter
1. **Every Policy Pulse post MUST carry the `policy-pulse` tag.** That single tag
   is what moves it out of Stock Research. Prefixing the title with
   `Policy Pulse — ` is the convention and also works as a fallback, but the tag
   is the reliable signal — always include it.
2. **Never put `policy-pulse` / `policy-tracker` on a stock deep-dive or market
   note.** Doing so wrongly moves it into the Policy Pulse tab.

Tags are otherwise free-form (lowercase-kebab-case): add sector/theme tags freely
for search — they don't affect the tab, only the two policy tags above do.

---

## Steps to publish

### 1. Create the file (use the scaffolder — don't hand-write frontmatter)

Pipe the finished article body on stdin, or point at a draft file:

```bash
# body from a draft file
node scripts/new-analysis.js \
  --title "Ather Energy — Deep Dive Analysis" \
  --ticker "ATHERENERG" \
  --tags "ev,auto,e2w" \
  --summary "Revenue accelerating 70% YoY; caution on valuation for swing entry." \
  --date 2026-07-04 \
  --body-file /path/to/draft.md

# or pipe the body in
cat draft.md | node scripts/new-analysis.js --title "..." --ticker "..." --tags "..." --summary "..."
```

- `--slug` and `--date` are optional (slug is derived from the title; date defaults to today).
- The scaffolder **refuses to overwrite** an existing file unless you pass `--force`.
- Required flags: `--title --ticker --tags --summary`. Missing any → it exits non-zero with a clear message.

> Writing the `.md` by hand is allowed, but then **you** are responsible for the exact frontmatter contract above. The scaffolder exists so you don't have to.

### 2. Regenerate + build

```bash
npm run build
```

This runs, in order: `generate-analyses-data.js` → `generate-sitemap.js` → `tsc` → `vite build` → OG-file generation. If any frontmatter is invalid, it stops at step 1 with the offending file and reason.

(During local dev, `npm run dev` regenerates the data automatically via `predev`. To regenerate just the data without a full build: `npm run data`.)

### 3. Deploy

```bash
./deploy.sh          # builds into dist/ that Nginx serves
```

### 4. (Optional) Notify subscribers

```bash
curl -X POST https://stocksfundamentals.online/api/notify \
  -H "X-Auth-Token: $VAULT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"📈 New: Ather Energy Deep Dive","body":"Revenue +70% YoY — read the full breakdown.","url":"/analysis/ather-energy-deep-dive"}'
```

---

## Adding a stock to the Watchlist (`/watchlist`)

The watchlist is a **private page** (reachable only by direct URL — not linked in
any nav and excluded from the sitemap / search engines) that tracks **live prices
against the support & resistance you called** in an analysis.

To put a stock on it, add these fields to that stock's analysis frontmatter:

```markdown
---
title: "Sanghvi Movers Ltd — Deep Dive Analysis"
ticker: "SANGHVIMOV"
date: "2026-06-28"
tags: ["deep-dive","fundamental","crane-rental"]
summary: "..."
model: "deepseek-chat"
watchlist: true
priceAtAnalysis: 411
support: 406
resistance: 425
supports: [375, 393, 406]      # optional extra levels
resistances: [425, 443]        # optional extra levels
verdict: "CAUTION"             # optional badge
---
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `watchlist` | ✅ | boolean | Must be `true` to appear on the page. |
| `priceAtAnalysis` | ✅ | number | Price when you published — the baseline for "since analysis %". Numbers only, no `₹`. |
| `support` | ✅ | number | Primary support. Must be **less than** `resistance`. |
| `resistance` | ✅ | number | Primary resistance. |
| `supports` / `resistances` | optional | number[] | Extra levels (currently used for future ticks). |
| `verdict` | optional | string | Short badge, e.g. `"CAUTION"`, `"ACCUMULATE ON DIPS"`. |
| `yahooSymbol` | optional | string | Override the live-quote symbol. |

**Live price / Yahoo symbol.** The live price comes from the backend `/api/quote`
endpoint (yfinance → Yahoo Finance, ~15 min delayed). The Yahoo symbol is derived
automatically from `ticker`:
- NSE (default) → `SYMBOL.NS` (e.g. `SANGHVIMOV` → `SANGHVIMOV.NS`)
- US (`ticker` contains `NASDAQ`/`NYSE`) → bare symbol (e.g. `PLTR:NASDAQ` → `PLTR`)
- Anything unusual → set `yahooSymbol` explicitly (e.g. `"TATAMOTORS.NS"`, BSE uses `.BO`).

**Rules**
- `priceAtAnalysis`, `support`, `resistance` are **plain numbers** (no `₹`, no `"1,144"` strings). `support < resistance` or the build fails.
- To **remove** a stock from the watchlist, set `watchlist: false` or delete the fields, then rebuild.
- `npm run build` regenerates `public/watchlist.json`. The backend must be running (with `yfinance` installed) for live prices; without it the page shows the analysis price labelled "live feed unavailable".

---

## Checklist (agent should self-verify before deploy)

- [ ] File is `public/analyses/<slug>.md` and `<slug>` is URL-safe (lowercase, hyphens).
- [ ] Frontmatter has all 5 required fields; `date` is `YYYY-MM-DD`; `tags` is a JSON array.
- [ ] Body starts with a single `# Title` heading and contains no leftover `---` frontmatter fence inside it.
- [ ] `npm run build` completed with **exit code 0** (this proves the frontmatter validated and the site compiled).
- [ ] New analysis appears at the top of the list (newest date first).

## Common mistakes that break the build
- `date` written as `4 July 2026` or `2026-7-4` → must be `2026-07-04`.
- `tags` written as a bare string (`"ev, auto"`) → must be a JSON array (`["ev","auto"]`).
- Storing `slug:` in frontmatter → ignored; the file name is the slug.
- Editing `src/data/analyses.generated.ts` or `public/analyses.json` by hand → these are **auto-generated**; changes are overwritten on the next build.
