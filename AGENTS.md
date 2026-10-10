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

That expands to six steps, in order, and each depends on the previous one:

| Step | Script | Produces |
|---|---|---|
| 1 | `generate-analyses-data.js` | `public/analyses.json`, `src/data/analyses.generated.ts` |
| 2 | `generate-sitemap.js` | `public/sitemap.xml` with `lastmod` |
| 3 | `tsc -b` | typecheck |
| 4 | `vite build` | the bundle |
| 5 | `generate-og-files.py` | `analysis/*.html`, `company/*.html`, `{about,contact,disclaimer,privacy}.html` |
| 6 | `prerender-body.py` | injects the rendered article body into the step-5 files |

Step 5 reads the hashed asset filenames out of `index.html`, so it must run after
step 4 or every prerendered page will point at a stale bundle.

Step 6 renders every route in the sitemap with headless Chrome and injects only
the `#root` markup, so the step-5 head survives byte-for-byte. Without it a
non-executing crawler reads about seven words per page. It needs Playwright plus
a Chrome binary, and takes roughly seven minutes over 409 routes.

It looks for a system Chrome in the usual Linux, macOS and Windows locations,
honours a `CHROME_PATH` override, and otherwise falls back to the Chromium that
`playwright install` downloaded. The server keeps using `/usr/bin/google-chrome`,
which is still matched first.

**Deploy with `./deploy.sh` on the server.** Do not run `npm run build` against
the live root: `vite build` empties its output directory, so an in-place build
404s every article page for the length of step 6. `deploy.sh` builds into
`dist.next`, runs steps 5 and 6 there, then swaps it in with two renames
(`dist` -> `dist.previous`, `dist.next` -> `dist`). The exposed window is
milliseconds and any failure before the swap leaves the live site untouched.
Both scripts take `--dist <dir>` / `--outDir <dir>` for this reason.

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

## 4b. Audio summaries

Articles can carry an audio summary. Nothing is configured per article and no
rebuild is needed to add one:

- Upload the file to the storage container named **exactly after the slug**, e.g.
  `yatharth-hospital-trauma-care-services-deep-dive-analysis.mp3`. Extensions
  probed: `mp3`, `m4a`, `wav` (order set by the `audio.exts` setting).
- `GET /api/audio-index` reports which slugs have audio; the article page renders
  a player for those and nothing otherwise.
- `GET /api/audio/<slug>` streams the bytes, relaying Range requests so seeking
  works. `HEAD` answers existence.

**The storage credential must never reach the browser.** It is a container SAS -
a bearer token. The page only ever references the token-free `/api/audio/<slug>`;
the backend attaches the signature. Pointing an `<audio>` element at a blob URL
would publish the signature in the HTML of every article.

It is held in the SQLite settings store at `/var/www/stock-analyses/api.db`
(mode 600, owned by the service user) - not in a config file, not in this
repository. Rotate it with:

```bash
python3.12 /var/www/stock-analyses/manage_settings.py set audio.sas '<sas query string>'
python3.12 /var/www/stock-analyses/manage_settings.py list      # masked
```

**Operational caveat.** The current SAS grants read only (`sp=r`), so the
container cannot be listed and the index must probe one HEAD per slug per
extension - about nine seconds cold. That is cached for 15 minutes and refreshed
by a background warmer, so no visitor waits. Granting the `l` permission makes it
a single LIST request; `_list_blobs()` already prefers that path and falls back
automatically, so only the SAS needs to change.

The player is deliberately client-side, so it is **not** in the prerendered HTML
(the prerender server serves `dist/` only and does not proxy `/api/`). That is
acceptable: audio is not indexable content, and the player resolves before the
article body paints, so its arrival does not shift the layout.

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

### 7.1 Prerender the article body — DONE 2026-10-09

`scripts/prerender-body.py` (build step 6) serves the build over a local HTTP
server, renders every route in the sitemap in headless Chrome via Playwright, and
injects **only** the rendered `#root` markup back into the file step 5 produced.

Injecting only `#root` is the whole point: dumping the rendered document would
reintroduce the duplicate crawler metadata that section 3.2 exists to prevent
(the React components emit their own Helmet tags). The step-5 head survives
byte-for-byte — one `<title>`, one canonical, one JSON-LD block per page.

Measured: homepage 2,553 → 72,628 bytes; a policy article now exposes about 1,900
visible words to a non-executing crawler, against roughly 7 before. Acceptance was
`curl -s -A Googlebot <url> | wc -c` above 20,000. It runs 409 routes in roughly
five minutes, so it is the bulk of deploy time.

It also improves LCP, because the markdown fetch and client-side parse leave the
critical path.

Caveat: the app still mounts with `createRoot`, not `hydrateRoot`, so a browser
discards this markup on load. That is acceptable — the goal is what a
non-executing crawler receives — but switching to `hydrateRoot` would also remove
the client-side re-render. Do not switch until the client render is verified to
match the prerender, or React will log hydration mismatches.

### 7.2 Apply the nginx configuration — DONE 2026-10-09

Applied to `/etc/nginx/sites-enabled/stocksfundamentals.online`. All five checks in
section 5 now pass: nonexistent paths return 404, www 301s to the apex, raw markdown
is `text/markdown`, hashed assets carry exactly one `Cache-Control`, and the five
security headers are present. The previous config is at
`/etc/nginx/sites-available/stocksfundamentals.online.bak-20261009`.

Two things that file got wrong and this application corrected:

- **`docs/nginx-seo.conf` declared `location = /index.html` twice** — once as the 301
  to `/` and once as the internal 404 page. nginx rejects that pair with
  "duplicate location" at `nginx -t` time, so the file could not be applied as
  written. The 404 body is now served through `/_spa404.html`. Fixed in the doc too.
- **`add_header Content-Type` on `/analyses/` is not needed and is harmful.**
  `mime.types` has no `.md` mapping, so `default_type text/markdown` already
  governs. Adding the header as well emits a second conflicting Content-Type.

The live config is a real file, not a symlink. The catch-all `location /` is
`try_files $uri =404`, which means **every new route needs its own location block**
before it will be reachable — this applies directly to section 7.5.

### 7.3 Search Console — verified; read the baseline before optimising

**Correction to an earlier version of this file: the domain was never unverified.**
A DNS TXT record (`google-site-verification=vNe2G5shsI5EKqYlfucAdnfBR0jVv67UKJgG_lcW2os`)
has been in place throughout, on a Domain property. The `YOUR_VERIFICATION_CODE` meta
tag was cosmetic and removing it changed nothing. The gap was that nobody had read the
data, not that it was missing.

**Baseline exported 2026-10-10, covering the 92 days to 2026-10-06.** This is a clean
pre-change picture: everything in 7.1, 7.2 and 7.4 went live on 2026-10-09.

| Metric | Value |
|---|---|
| Impressions | 620 |
| Clicks | **1** |
| CTR | 0.16% |
| Manual actions | none |
| Sitemap | 414 URLs discovered, Success |

What the baseline says, and it should steer the next round of work:

- **Ranking is not the bottleneck; click-through is.** Weekly average position moved
  50.0 (w/c Aug 26) to 6.2 (w/c Sep 30). `cg-power-deep-dive-jun18` holds position 7.5
  on 141 impressions with **zero** clicks; `leap-india` 6.8 with zero; `esds-software`
  4.6 with zero. Pages reach the first page and convert nothing.
- The likely cause was fixed on 2026-10-09 and is **not yet measured**: 246 of 250
  titles were truncated in the SERP, descriptions were cut mid-word, and no `og:image`
  existed. Re-export Performance around 2026-11-07 and compare CTR at unchanged
  positions. That comparison is the experiment; do not stack more changes on top of it
  without recording what shipped when.
- **The India/US drift is now evidenced, not theoretical.** United States 270
  impressions against India 126. Desktop 597 against mobile 22, while the stated
  audience is Indian retail investors, who are overwhelmingly mobile.
- **Policy Pulse is not earning its volume.** 199 of 254 articles, and exactly one
  appears in the top 15 pages (24 impressions). Deep dives take essentially all of it.
- **Deindexing the thin company hubs cost nothing.** All company pages together drew 19
  impressions across 92 days.

Still missing: **no analytics tag of any kind.** Search Console covers search only, so
nothing is known about behaviour after the click.

### 7.3b Legacy static .html URLs 301 into a 404 — DONE 2026-10-10

The old static site's rule rewrites `/<name>.html` to `/analysis/<name>`. That is right
for articles and wrong for the five static pages, which have no `/analysis/` twin:

```
/about.html      -> 301 -> /analysis/about      -> 404
/contact.html    -> 301 -> /analysis/contact    -> 404
/disclaimer.html -> 301 -> /analysis/disclaimer -> 404
/privacy.html    -> 301 -> /analysis/privacy    -> 404
```

`/about.html` is still indexed and took **the only organic click in the 92-day
baseline**. That click landed on a 404.

The four exact-match redirects are now live in the site config, ahead of the generic
regex rule. Verified: each `/name.html` 301s to its `/name` and that page returns 200;
article `.html` URLs still resolve (`/nalco-down-root-cause-jun16.html` → 200); and
`/index.html` still 301s to `/`.

**Related cleanup — do not put nginx backups in `sites-enabled/`.** `nginx.conf`
includes `sites-enabled/*`, so a backup written there is loaded as a second server
block for the same names and reported as `conflicting server name` on every test and
reload. It is also a silent-failure trap: the glob is alphabetical, so a backup named
`stocksfundamentals.online-old` sorts *before* the real file and nginx keeps serving
the stale config while you edit the live one. Backups now live in
`/etc/nginx/backups/`.

**Related fix — the SPA fallback no longer bounces a reader to the homepage.** The
`/company/` block used `try_files $uri.html /index.html;`, and because the final
argument is a URI, nginx internally redirected it into `location = /index.html`, which
301s to `/`. Every one of the ~484 below-threshold hubs therefore redirected instead of
rendering — the opposite of what 3.7 requires. Ending the directive with `=404` makes
`/index.html` a *file* candidate, so the shell is served with a 200. Measured after:
thin hub 200, thin tag page 200, generic 404 still 404.

### 7.4 Internal linking — DONE 2026-10-10

Ticker links to company hubs (capped at `TICKER_LINK_LIMIT`), breadcrumbs, a
related-analyses block keyed on shared tickers then shared tags, and a per-article
disclaimer all shipped. A live deep dive now exposes 7 internal `/analysis/` and
`/company/` links, against 0 before.

**Table of contents added 2026-10-10**, shown on the 74 longest articles (at least 10
`##`/`###` headings). That floor is measured, not guessed: Policy Pulse notes run a
median of 6 headings against 33 for deep dives, so a floor of 4 would have put a
contents panel on 93% of the library. It is a collapsed `<details>`, so it costs no
vertical space while the section anchors stay in the prerendered HTML.

`rehype-slug` is not installed, so `src/utils/toc.ts` assigns ids in ONE pass over the
markdown, injects an `<a id>` inside each heading, and returns the contents list from
that same pass — the hrefs and the ids cannot drift apart. Each alternative was
measured and rejected:

- Rewriting a heading to raw `<h2 id>` renders `**bold**` literally in the 20 articles
  that use inline formatting in a heading.
- A rehype plugin assigning ids needs render-order state, and StrictMode's double
  render would desynchronise ids from the list.
- 23 articles (9%) repeat a heading, so the document-order counter adds `-2` suffixes
  rather than emitting colliding ids.

Verified against the real pipeline before shipping (react-markdown + remark-gfm +
rehype-raw): the inline anchor survives inside a heading and bold/code still render.

### 7.5 Crawlable archive, category and tag URLs — DONE 2026-10-10

Measured 2026-10-10: the homepage exposed **9 of 254** articles, the rest sitting
behind a JavaScript "load more", and the sitemap contained **0** tag or archive
routes. 245 articles were reachable only through the sitemap.

Now built, and the reason it was worth doing after 7.1 is that these pages carry
real prerendered content rather than being empty shells:

- **`/analyses/page/N`** — 29 pages of 9 articles, newest first, with a full
  numbered pager. Every article is now one crawlable hop from the footer link, and
  each page links every other page. `/analyses` 301s to page 1.
- **`/tag/{tag}`** — 26 pages. Gated at **`MIN_TAG_ARTICLES = 12`**: there are 335
  distinct tags and 307 of them fall below the floor, so they render for a reader
  with `noindex, follow` but never enter the sitemap. Same reasoning as 3.7, and the
  same medicine — a page per tag would have been the 625-hub mistake again.
- Sitemap is now **469 URLs** (was 414): 254 analysis + 155 company + 26 tag +
  29 archive + 5 static.

**Follow-up fixed 2026-10-10: a page built to be crawled must render every item.**
`AnalysisGrid` caps at `ITEMS_PER_PAGE` (9) behind a "Show more" button, and the tag
pages were passing it the full match list. The result shipped: `/tag/defence`
advertised "60 articles tagged" while exposing **9** crawlable links — the other 51
sat behind a button no crawler clicks, which is the exact problem 7.5 exists to solve.

`AnalysisGrid` now takes an optional `initialCount`, and `TagPage` passes
`matching.length`. `/tag/defence` renders all 60 with no button. The homepage keeps
the default 9 on purpose: the archive is the crawl path, so the homepage does not need
to list everything. The archive pages were already correct, because their page size was
deliberately matched to `ITEMS_PER_PAGE`.

**Invariant:** any page whose job is to be crawled must pass `initialCount`. If you add
another listing page, check the rendered link count against the count the page claims.

Three copies of the rules must stay in sync, as with the ticker rule in 3.6:
`src/utils/tags.ts` (`MIN_TAG_ARTICLES`, `tagSlug`), `scripts/generate-sitemap.js`
(same two), and `scripts/generate-og-files.py` (`MIN_TAG_ARTICLES`, `tag_slug`).
`ARCHIVE_PAGE_SIZE`/`PAGE_SIZE` (9) is duplicated in the same three places plus
`ITEMS_PER_PAGE` in `AnalysisGrid.tsx`.

nginx routes both with longest-prefix `^~` blocks. `^~ /analyses/page/` is a longer
prefix than `^~ /analyses/`, so it wins there while `/analyses/{slug}.md` keeps
serving raw markdown with its own content type. **Every new route needs its own
location block** — the catch-all is `try_files $uri =404`.

**Also fixed here: company hubs emitted duplicate crawler tags.** CompanyPage.tsx
re-emitted description, canonical, `og:*` and a second `CollectionPage` JSON-LD on
top of the prerendered ones, so every indexable hub carried **two canonicals and two
CollectionPage entities** at runtime. That is invariant 3.2, and it was measured in
the DOM, not assumed. The component now sets only `<title>` plus the conditional
robots tag, matching AnalysisPage.


### 7.6 Remaining items

- Trust layer: a 600-900 word disclaimer, a 400-600 word `/about` with methodology, and
  a disclaimer line in every article (only 70 of 250 have one).
- Link the sources already named in prose: 226 articles name a source, 10 link to one.
- ~~Fix CLS.~~ **Resolved by 7.1.** Measured on the live article 2026-10-10: CLS
  **0.0443**, against 0.289 before the body prerender. Prerendering removed the
  reflow, so no separate fix is needed. Confirm against CrUX field data in Search
  Console (Experience, Core Web Vitals) rather than trusting this lab figure.
- ~~Fix the 292-character unbreakable ticker string and make the data tables readable
  on mobile.~~ **Done 2026-10-10.** Each table scrolls in its own `.table-scroll` box
  (a react-markdown `table` override in `AnalysisPage.tsx`) with an edge fade and a
  sticky first column; cells cap at 24ch and the label column has an 11ch floor. Do
  not reintroduce `overflow-wrap: anywhere` on table cells — it lets a column collapse
  to one character and renders labels as "Opera ting profit". Do not scroll
  `.article-body` instead: that drags the prose sideways and hides the cut-off.
- ~~Ship `llms.txt`, `llms-full.txt` and an RSS feed.~~ **Done 2026-10-09.** All three
  verified live and served as `text/plain` / `text/xml`, generated by
  `scripts/generate-discovery-files.py`.
- Route-level code splitting; the single bundle is **334 KB gzip** in one chunk and
  includes the full markdown pipeline on every route. Lower priority than it looks:
  with bodies prerendered, content paints before hydration, so this is now an INP and
  hydration-cost item rather than an LCP one. Live LCP measured 3,488 ms.
- Surface `/watchlist`: 21 entries with `priceAtAnalysis` rendered against live quotes is
  a falsifiable public track record, and nothing links to it.

---

## 8. Files that still need an owner decision

These are tracked in git, so they were committed deliberately, but nothing references
them:

- `og_injector.py` — **removed 2026-10-09.** Verified unreferenced by the nginx
  config, every cron job, every systemd unit and every script before deletion, and
  it read the legacy `/var/www/stock-analyses/analyses.json`. The live pages carry
  JSON-LD, so `generate-og-files.py` is what serves.
- `chat.docx` (2.7 MB) — purpose unknown.
- `redesign-plan.md` — may be superseded by the audit.

Already removed as provably dead: `src/components/Home/HeroSection.tsx` (never
imported), `src/assets/react.svg` and `src/assets/vite.svg` (Vite scaffolding),
`public/company-index.json` (generated, read by nothing), and two `__pycache__`
directories.
