# Agent instructions — stocksfundamentals.online

This repository is maintained by an automated agent (Hermes). Read this file before
changing anything. It records the invariants that recent SEO work established, how to
build and verify, and which tasks a human still has to do.

Full findings and the prioritised backlog live in `stocksfundamentals.online-audit/`
(`FULL-AUDIT-REPORT.md` and `ACTION-PLAN.md`). That audit scored the site 43/100 on
2026-10-09, before the fixes described below.

---

## 1. What this site is

An independent equity-research site covering Indian stocks, written under the byline
"Pulkit Goel". Two content families:

- **Deep dives** — long single-company analyses, roughly 2,600 words median. These are
  the differentiated content.
- **Policy Pulse** — a daily series in four editions (Trump/US, Modi, Ministries,
  Global), roughly 730 words median.

250 articles as of October 2026. Content lives in `public/analyses/*.md` with YAML
front matter. `scripts/generate-analyses-data.js` turns those into
`public/analyses.json` and `src/data/analyses.generated.ts`.

This is YMYL (your money or your life) financial content. Accuracy, disclaimers and
author transparency carry more weight here than on an ordinary blog.

---

## 2. Build and deploy

One command runs the whole pipeline. Never run `vite build` on its own.

```bash
npm run build
```

That expands to five steps, in order, and each depends on the previous one:

| Step | Script | Produces |
|---|---|---|
| 1 | `generate-analyses-data.js` | `public/analyses.json`, `src/data/analyses.generated.ts` |
| 2 | `generate-sitemap.js` | `public/sitemap.xml` with `lastmod` |
| 3 | `tsc -b` | typecheck |
| 4 | `vite build` | `dist/` bundle |
| 5 | `generate-og-files.py` | `dist/analysis/*.html`, `dist/company/*.html`, `dist/{about,contact,disclaimer,privacy}.html` |

Step 5 reads the hashed asset filenames out of `dist/index.html`, so it must run after
step 4 or every prerendered page will point at a stale bundle.

Deploy with `./deploy.sh` on the server. It calls `npm run build`.

The server runs `python3.12`; a local machine may only have `python`. If step 5 fails
on the Python command, that is why.

Brand assets (`og-default.png`, `favicon.ico`, `apple-touch-icon.png`) are committed,
not built. Regenerate them only when branding changes:

```bash
python scripts/generate-og-image.py
```

---

## 3. Invariants — do not regress these

Each of these was a measured defect that is now fixed. Re-introducing one undoes real
work, so check against this list before changing head tags, the build scripts, or any
page component.

### 3.1 One `<title>` owner per route, and never an array

`react-helmet-async` renders an **empty** `<title>` when it receives more than one
child. This was shipping a blank title ahead of the real one on all 250 analysis pages:

```tsx
<title>{analysis.title} — suffix</title>   // WRONG: two children, renders empty
<title>{analysis.title}</title>            // correct: one expression
```

Build the string first if you need to combine values.

### 3.2 Prerendered routes own their crawler metadata

`/analysis/*`, `/company/*` (indexable ones) and the four static pages are prerendered
by `generate-og-files.py`. Those files carry the title, description, canonical, Open
Graph, Twitter and JSON-LD tags.

The matching React component must **not** emit those tags again. `AnalysisPage.tsx`
sets only `<title>`, and only so the browser tab updates during client-side navigation.
Emitting the rest produced two of every tag, including two conflicting `Article`
entities with two different author names.

### 3.3 JSON-LD is built with `json.dumps()`, never string interpolation

JSON is not HTML. Writing HTML entities into a JSON string value means a crawler reads
the literal characters `&#39;`. Interpolating unescaped text can also produce invalid
JSON — three pages shipped unparsable JSON-LD because a stray `\'` became `\&#39;`.

`generate-og-files.py` builds every block with `json.dumps()` and **exits non-zero if
any page's JSON-LD fails to parse**. Keep that check.

### 3.4 No site-name suffix in titles

Titles average 44 characters. A 28-character ` — stocksfundamentals.online` suffix put
246 of 250 past the length Google renders, truncating every result. Do not add it back.

### 3.5 Descriptions truncate on a word boundary

`smart_truncate()` cuts at the last word before 155 characters and appends an ellipsis.
A hard slice left 190 of 250 descriptions ending mid-word, which is what appeared in
search results and WhatsApp previews.

### 3.6 Tickers match as exact tokens, never substrings

The `ticker` field is a colon-delimited string. Matching with `includes()` made
`/company/ge` list 74 articles when 8 mentioned GE, and `/company/mu` list Muthoot
Finance under Micron. Split on `[:/]` and compare whole tokens.

This rule is implemented three times and the copies must stay in sync:
`scripts/generate-sitemap.js`, `scripts/generate-og-files.py`, `src/pages/CompanyPage.tsx`.
The `NON_COMPANY` exclusion set is duplicated in the same three places.

### 3.7 Company hubs are gated on research coverage

A `/company/{ticker}` hub is listed in the sitemap and prerendered only when at least
one **non-series** article covers that ticker (`MIN_RESEARCH_ARTICLES = 1`). Gating on
total mentions instead produced 625 hubs, 233 of them backed by a single passing
mention in a daily note. Current split: 155 listed, 470 client-only with
`noindex, follow`.

Below-threshold hubs must still render for a reader following a link. Do not make them
404.

### 3.8 One `h1` per page

`AnalysisPage.tsx` maps markdown `h1` to `h2`, because 106 of 250 articles open with
their own `# Title` that duplicated the page heading. Do not extend that mapping to
`h2`: 144 articles have no body `h1`, and shifting their `h2`s would skip a level.

### 3.9 One brand name and one author name

**StocksFundamentals** (with the s) and **Pulkit Goel**. Four brand spellings and two
author names were in use. Entity consolidation in Google and in AI systems depends on
one consistent name.

### 3.10 `sitemap.xml` carries `lastmod` and nothing decorative

`lastmod` comes from the article `date`. `changefreq` and `priority` are not emitted —
Google has stated publicly that it ignores both.

### 3.11 No stray backslash escapes in content

A backslash before an apostrophe or quote is never intentional in prose. One publishing
batch leaked `SEBI\'s` into four articles. `clean_text()` in `generate-og-files.py`
strips these defensively, but fix the source markdown as well when you see one.

---

## 4. Publishing a new analysis

Use the existing skill at `.claude/skills/publish-analysis/SKILL.md`. Required front
matter:

```yaml
---
title: "..."       # no site suffix; aim under 60 characters
ticker: "A:B:C"    # colon-delimited; cap at ~8 tickers that the piece actually discusses
date: "YYYY-MM-DD"
tags: ["policy-pulse", ...]   # the policy-pulse tag selects NewsArticle schema
summary: "..."     # written to stand alone; first 155 characters become the meta description
model: "..."       # see section 6 before adding or removing this
updated: "YYYY-MM-DD"   # optional; only when genuinely revised. Sets dateModified.
---
```

Two things to watch:

- **Ticker count.** The average article lists 17.3 tickers and one lists 118. Each
  ticker is a candidate company hub, so long lists manufacture low-value pages. List
  only the companies the article genuinely discusses.
- **Title.** Lead with the substance, not the series boilerplate.
  `Brent tops $104 as Pentagon readies Iran options — Policy Pulse, 8 Oct` will rank and
  convert better than `Policy Pulse - Global Spillover - 08 Oct 2026`, which spends its
  first 52 characters saying nothing anyone searches for.

Then run `npm run build` and deploy.

---

## 5. Verifying a change

After any build, confirm the prerendered output is still correct:

```bash
# JSON-LD parses on every page (the generator exits non-zero if not)
python scripts/generate-og-files.py

# Spot-check one page
grep -E '<title>|canonical|og:image|datePublished' dist/analysis/<slug>.html
```

Against production, after deploying:

```bash
# must be 404, not 200
curl -s -o /dev/null -w '%{http_code}\n' https://stocksfundamentals.online/nope-12345

# must be 301 to the apex
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.stocksfundamentals.online/

# must be text/markdown
curl -sI https://stocksfundamentals.online/analyses/<slug>.md | grep -i content-type

# exactly one Cache-Control line
curl -sI https://stocksfundamentals.online/assets/index-*.js | grep -ci cache-control

# body prerender: currently ~2-3k (head only). Over 20000 means section 7.1 is done.
curl -s -A Googlebot https://stocksfundamentals.online/ | wc -c
```

---

## 6. Editorial decisions that need a human, not an agent

Do not decide these autonomously. Surface them and wait.

- **AI-generation disclosure.** Every article carries a `model:` field
  (`deepseek-chat` 204, `deepseek-v4-flash` 37, `kimi-k2.5` 3). It is publicly fetchable
  at `/analyses/{slug}.md`, but only 54 of 250 articles name the model in visible body
  text; 177 keep it in front matter only. Partial disclosure is the weakest of the three
  available positions. Either disclose consistently in the byline, `/about` and
  `/disclaimer`, or stop publishing the field.
- **SEBI Research Analyst status.** The site publishes verdicts with support and
  resistance levels for 21 live watchlist names, and the word "SEBI" appears nowhere on
  `/about` or `/disclaimer`. Whether this engages SEBI Research Analyst Regulations is a
  question for a professional, not an agent.
- **Positioning.** 42% of articles are tagged `us-only` or `global`, and the heaviest
  tickers are US names (XOM 87, CVX 82, DAL 77) against TCS at 54. A site positioned on
  Indian equities has US oil majors as its strongest topical signal. Either rebalance the
  editorial mix or restate the positioning — both are owner decisions.

---

## 7. Open work, in priority order

### 7.1 Prerender the article body (largest remaining item)

The prerendered files currently carry head metadata only; the body is still
`<div id="root"></div>`. A crawler that does not execute JavaScript receives about 7
words where a reader sees 8,338 — 88 to 97% of a 415,000-word corpus is invisible to
ChatGPT, Perplexity, Claude and Bing. Googlebot renders JavaScript and is the exception.

Approach: `vite-react-ssg`, or drive Playwright over the route list that
`generate-sitemap.js` already computes and write the rendered HTML into `dist/`.

Acceptance: `curl -s -A Googlebot <url> | wc -c` exceeds 20,000.

This also fixes LCP, because it removes the markdown fetch and client-side parse from
the critical path. The SEO fix and the performance fix are the same fix.

### 7.2 Apply the nginx configuration — needs server access

`docs/nginx-seo.conf` is written but **not applied**. It carries the soft-404 fix, the
www redirect, security headers, the duplicate `Cache-Control` fix, `text/markdown` for
the raw articles, and routing to the prerendered `/company/*` and static files.

Until it is applied, every nonexistent URL still returns HTTP 200 with the SPA shell.

Read it before applying and run `sudo nginx -t` first. A bad config takes the site down.

### 7.3 Verify Search Console — needs a human

The `YOUR_VERIFICATION_CODE` placeholder has been removed from `index.html`, but the
domain is still unverified. There is also no analytics tag anywhere. Until both exist
there is no index-coverage data, no query data, and no way to measure whether any of
this work helped.

### 7.4 Internal linking

An 8,338-word deep dive exposes five internal links, all of them footer links. Only 1 of
250 markdown files contains an internal link, and no `Related` component exists. Add a
related-analyses block keyed on shared ticker then shared tags, link article tickers to
their hubs, and add breadcrumbs plus a table of contents on long articles.

### 7.5 Crawlable archive, category and tag URLs

The homepage renders nine cards behind a JavaScript "load more", with no paginated
archive and no tag routes, so 241 of 250 articles are reachable only through the
sitemap. A sitemap says a URL exists; internal links say it matters.

### 7.6 Remaining items

- Trust layer: a 600-900 word disclaimer, a 400-600 word `/about` with methodology, and
  a disclaimer line in every article (only 70 of 250 have one).
- Link the sources already named in prose: 226 articles name a source, 10 link to one.
- Fix CLS (0.21-0.33 desktop, ~0.63 mobile; the shifting node is `<footer>`).
- Fix the 292-character unbreakable ticker string that widens analysis pages to 2,468px,
  and make the data tables readable on mobile.
- Ship `llms.txt`, `llms-full.txt` and an RSS feed — **after** 7.2, because until
  unmatched paths 404 a new file is indistinguishable from a missing one.
- Route-level code splitting; the single bundle is 286 KB gzip and includes the full
  markdown pipeline on every route.
- Surface `/watchlist`: 21 entries with `priceAtAnalysis` rendered against live quotes is
  a falsifiable public track record, and nothing links to it.

---

## 8. Files that still need an owner decision

These are tracked in git, so they were committed deliberately, but nothing references
them:

- `og_injector.py` — a second, older nginx-side prerender path. Its route regex is
  `^/analysis/([^/]+)/?$`, it emits no JSON-LD, it reads the legacy path
  `/var/www/stock-analyses/analyses.json`, and it ASCII-strips titles. The live pages
  contain JSON-LD, so `generate-og-files.py` is what is actually serving. Confirm against
  the live nginx config, then delete it.
- `chat.docx` (2.7 MB) — purpose unknown.
- `redesign-plan.md` — may be superseded by the audit.

Already removed as provably dead: `src/components/Home/HeroSection.tsx` (never
imported), `src/assets/react.svg` and `src/assets/vite.svg` (Vite scaffolding),
`public/company-index.json` (generated, read by nothing), and two `__pycache__`
directories.
