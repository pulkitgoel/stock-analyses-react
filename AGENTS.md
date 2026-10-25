# Agent instructions — stocksfundamentals.online

This repository is maintained by an automated agent (Hermes) **and** by interactive
Claude Code sessions. Read this file before changing anything. It records the
invariants that recent SEO work established, how to build and verify, and which tasks
a human still has to do.

> **Start every session by running `git fetch origin && git log --oneline main..origin/main`
> and reading [`HANDOFF.md`](HANDOFF.md).** That is where the other agent leaves what
> you need to know, so the owner does not have to relay it. Add your own entry before
> you finish.
>
> **More than one agent works here. Read [section 9, Coordination](#9-coordination--who-owns-what),
> and claim a backlog item before you start it.** On 2026-10-10 the tag/archive feature
> was built twice in parallel and one full implementation was thrown away, and the same
> React hooks bug was found and fixed twice within an hour. Both were pure waste and
> both were avoidable.

**Writing or retitling an article? Read [`CONTENT-PLAYBOOK.md`](CONTENT-PLAYBOOK.md)
first.** It owns titles, headings, keyword targeting and the impact-table format. This
file owns the build, the routing and the invariants.

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

`/analysis/*`, `/company/*` (**all** of them since 2026-10-12, see 3.7), `/tag/*`,
the archive and section pages and the four static pages are prerendered by
`generate-og-files.py`. Those files carry the title, description, canonical, Open
Graph, Twitter and JSON-LD tags.

The matching React component must **not** emit those tags again. `AnalysisPage.tsx`
sets only `<title>`, and only so the browser tab updates during client-side navigation.
Emitting the rest produced two of every tag, including two conflicting `Article`
entities with two different author names.

**One deliberate exception: the robots tag on a below-threshold hub or tag page.**
`CompanyPage` and `TagPage` emit `noindex, follow` at runtime, and the prerendered file
now carries it too, so a thin page holds two identical robots tags after hydration.
That is not what this invariant guards against — the harm in the original defect was
**conflict** (two canonicals, two author names), and two identical noindex directives
agree with each other. Keeping the runtime copy covers the one case the prerender
cannot: `/company/<nonexistent-ticker>` has no file, falls through to `/index.html`,
and would otherwise render as the homepage with nothing telling a crawler to skip it.

Do not "clean this up" by deleting the runtime tag without first giving every reachable
hub a file, and do not add the prerendered tag to an **indexable** page — the absence of
a robots tag is what marks a page indexable.

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

### 3.7 Company hubs are gated on content, by either of two routes

A `/company/{ticker}` hub is listed in the sitemap and prerendered when **either**:

- at least one **non-series** article covers the ticker (`MIN_RESEARCH_ARTICLES = 1`), or
- it carries at least `MIN_IMPACT_CALLS = 8` dated impact calls.

Gating on total *mentions* instead produced 625 hubs, 233 backed by a single passing
mention in a daily note. That is the failure this guards against, and the floor exists
for that reason.

The second route was added on 2026-10-11, after the impact history shipped. Research
coverage alone was the right gate when a hub was a list of article cards; once the hub
carried a dated causal history it was wrong, because **163 of 258 tickers with a
history were serving crawlers the bare SPA shell** — 1,081 of 2,288 dated calls
invisible, including IOC, BPCL, HINDPETRO and SBIN at 20 calls each. A hub with 20
dated calls is a better page than one with a single deep dive.

8 rather than 3: at 3 this adds 159 hubs and drifts back toward the thin pages this
invariant exists to prevent. At 8 it adds 37, averaging 13 calls each. Current split:
**192 listed, 447 client-only** with `noindex, follow`.

ETFs and indices are excluded from impact extraction entirely (`NOT_A_COMPANY` in
`scripts/lib/impact.js`) — SPY, QQQ, GLD, USO and TLT were each accumulating a history
and would have earned a company hub, and `/company/spy` is not a company page.

The gate is written in three places and they must agree, or the sitemap advertises
pages the prerender does not build: `scripts/generate-sitemap.js`,
`scripts/generate-og-files.py`, `src/pages/CompanyPage.tsx`.

**The gate decides indexability, not whether a file exists.** Every hub in
`company_stats` is prerendered; a below-threshold one carries
`<meta name="robots" content="noindex, follow">` in its head. So
`generate-og-files.py` deliberately builds a **superset** of the sitemap — 639 hub
files against 192 sitemap entries — and that is not the drift this invariant warns
about. The hazard is the sitemap listing a page with no file, never the reverse.

Prerendering only the indexable hubs was measured wrong on 2026-10-12. nginx fell back
to `/index.html`, so a below-threshold hub served HTML **byte-identical to the
homepage**: the homepage's `<title>`, no canonical of its own, and no robots tag at
all, because the `noindex, follow` lives in `CompanyPage` and needs JavaScript to
appear. **253 of those hubs are linked from article pages** (52% of articles link at
least one), so a crawler following internal links found several hundred homepage
duplicates. Thin `/tag/` pages leaked identically — 307 of them.

Deleting the internal links instead would not have fixed it: the 625 hubs listed before
the gate existed are already in Google's index, and nothing reaches them but a
directive served at their own URL.

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

### 3.13 `try_files`: the last argument is a URI, every earlier one is a file

This rule has drawn blood twice, in opposite directions, so read both halves before
changing any `try_files` line.

**The mechanism.** nginx treats the **final** argument of `try_files` as a URI and
performs an internal redirect to it. Every argument before the last is a **file**
existence check. So moving `/index.html` between those two positions changes what it
means entirely.

**Half one — a fallback on a paginated route is a soft 404.**

```nginx
try_files $uri.html /index.html =404;   # on /india/page/
```

Here `=404` is last, so `/index.html` is a *file* check — and that file always exists,
so it is always served and the `=404` can never run. On a paginated route the result
was `/india/page/99` returning **200** with the SPA shell, the router clamping to the
last real page, and a nonexistent URL serving duplicate content under a success status.

**Half two — removing the `=404` is worse, not neutral.**

```nginx
try_files $uri.html /index.html;        # on /company/ or /tag/
```

Now `/index.html` is the last argument, so it is a *URI*: nginx internally redirects,
lands in `location = /index.html`, and hits the `301` to `/`. Measured live, roughly
484 below-threshold company hubs and every thin tag page began bouncing readers to the
homepage, against 3.7.

The `=404` on those routes genuinely never fires. It is not there as a guard — it is
there to keep `/index.html` in file position.

**The rule, which needs both halves:**

| Route kind | Directive |
|---|---|
| Every valid URL has a prerendered file — `/analysis/`, `/analyses/page/`, `/india/page/`, `/global/page/`, `/india`, `/global` | `try_files $uri.html =404;` |
| Legitimate client-only pages — `/company/`, `/tag/` | `try_files $uri.html /index.html =404;` |
| Anything | **never** `try_files $uri.html /index.html;` — it 301s to `/` |

`/analysis/` looks like the broken pattern and is not: `try_files $uri $uri.html
$uri/index.html =404` ends in a **per-slug** path, not the root `index.html`.

**The habit that would have caught both:** after changing a `try_files` line, curl an
**invalid** URL, not just a valid one. Both bugs behaved perfectly on real pages. Only
a nonexistent path showed the fault — once as a 200 that should have been a 404, once
as a 301 that should have been a 200.

### 3.12 Every hook goes above the early returns

The page components here fetch data and bail out early:

```tsx
if (loading) return <LoadingSpinner />;
if (error || !analysis) return <NotFound />;
```

Any `useState`, `useEffect` or `useMemo` placed **below** those lines runs only on the
renders that get past them. React requires the same hooks in the same order every
time, so the component renders six hooks while loading and seven afterwards, and throws
*"Rendered more hooks than during the previous render."*

This shipped once: a `useMemo` added for the table of contents sat below the early
return in `AnalysisPage`, which blanked **every article page** as soon as the content
loaded. It was caught before deploy, but only because the page was opened in a browser.

Two consequences worth keeping:

- Put every hook at the top of the component, before the first `return`. A hook that
  depends on fetched data is fine there: `content` is `''` until the fetch resolves,
  and `prepareHeadings('')` is a no-op.
- `tsc` does not catch this and neither does the build. **Open the page.** A component
  that compiles cleanly can still render nothing.

---

### 3.14 Never gate a render on a promise over a bundled constant

`src/data/analyses.generated.ts` is compiled into the bundle, so reading the catalogue
is synchronous. It is exposed as `getAnalyses(): Analysis[]` and **must stay
synchronous**. Do not reintroduce an `async` wrapper, and do not add a `loading` state
for it.

It was `async fetchAnalyses()`, and every listing page opened with
`if (loading) return <LoadingSpinner />`. Because the app mounts with `createRoot` it
discards the prerendered markup (7.1), so the first client paint replaced a complete
66 KB page with a spinner and the second painted it back — **CLS 0.71 on the mobile
homepage**, the worst number on the site, for a promise that resolved on a microtask and
fetched nothing. Fixed and measured in 7.9 (0.71 -> 0).

The general rule: a page whose body is prerendered must render its first client paint
from data it already has. Anything it genuinely has to fetch — the markdown body on
`/analysis/`, the impact history on `/company/` — either keeps its own state and lets the
page render without it, or is the one thing `loading` covers. A spinner over prerendered
content is always a layout shift.

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


### 7.8 Below-threshold hubs and tags served a homepage clone — DONE 2026-10-12

`generate-og-files.py` now writes a file for **every** company hub and **every** tag,
not only the ones the sitemap lists. The gate decides the robots tag instead of
deciding whether the file exists. Counts: **639 hub files (192 indexable, 447
noindex), 333 tag files (26 indexable, 307 noindex)**; the sitemap is unchanged at
535 / 192 / 26.

Why it mattered, and the measurement, are in invariant 3.7. Short version: nginx fell
back to `/index.html`, so 253 hubs that articles actually link to served byte-identical
copies of the homepage with no canonical and no robots tag, and the `noindex, follow`
that 3.7 relies on only existed after JavaScript ran.

Verified before commit: `/company/spy` and `/tag/ems` carry their own title, their own
canonical and `noindex, follow`; `/company/ioc`, `/tag/defence`, an article page and
`/india` carry **no** robots tag; all 253 linked thin hubs and all 333 tags have a
file; `/company/spy` renders fully in a browser with no console errors, so 3.7's
"must still render for a reader" holds.

**Follow-up for the server, not done here.** Every valid `/company/` and `/tag/` URL
now has a file, so the `/index.html` fallback in those two blocks is dead for every
real page and only ever serves a nonexistent ticker a homepage clone under a 200.
Changing both to `try_files $uri.html =404` would close that soft 404 and move the two
routes into the first row of 3.13's table. Do not apply it blind: confirm the file
count matches `company_stats` first, because a missing file would then 404 a page that
used to render.

### 7.9 Mobile CLS and render-blocking fonts — DONE 2026-10-17

**CLS 0.71 -> 0 on the mobile homepage.** Measured before and after under identical
Lighthouse settings (`--form-factor=mobile --throttling-method=simulate`): live, old
code, **CLS 0.71, Performance 61**; the fixed build, **CLS 0, Performance 84**.

**Confirmed on production after the deploy** (`4dc6fa2`), measured twice independently:
**CLS 0** both times, Performance **85** (this session) and **73** (Hermes). Treat the
Performance number as noisy on a throttled remote run and CLS 0 as the result. The
Google Fonts entry has left the render-blocking list; the only item remaining is the app
CSS, at 394 ms.

**The footer was never the cause.** PSI named `<footer>` with the whole 0.710 because
the footer is the largest box that moved, but `Footer.tsx` is static markup with no data
dependency. The cause was one line in a service:

```ts
export async function fetchAnalyses(): Promise<Analysis[]> { return ANALYSES; }
```

`ANALYSES` is compiled into the bundle, so that promise wrapped a constant. Every listing
page still gated its first render on it — `if (loading) return <LoadingSpinner />` — and
because the app mounts with `createRoot`, React discards the prerendered markup (7.1).
So the first client paint replaced a complete 66 KB page with a spinner and the second
painted it back. The whole document collapsed and re-expanded for one microtask, and the
footer travelled furthest.

It is now `getAnalyses(): Analysis[]`, read at module scope by HomePage, ArchivePage,
TagPage and CompanyPage. **There is deliberately no async accessor left to fall back
into.** `src/hooks/useAnalyses.ts` is deleted (one consumer, now a synchronous read), and
with it HomePage's unreachable error branch, which told readers to check an
`/api/analyses` endpoint the app has never called. `AnalysisPage` keeps its `loading`
gate: the markdown body is a real fetch. `CompanyPage` keeps `impact` async — it is an
enhancement, and the page no longer waits for it.

**Why the local measurement needed a counterfactual.** An unthrottled measurement of the
fixed build reported CLS 0 — but so did the *live, unfixed* page under the same
conditions, because without CPU throttling the spinner frame is too brief to register.
The 0.71 only reproduces with `--throttling-method=simulate`. A single after-number here
would have proved nothing; the before-number on the same harness is what makes it
evidence.

**Fonts: the stylesheet no longer blocks render.** `render_shell` and `index.html` emitted
a plain `<link rel="stylesheet">` for `fonts.googleapis.com/css2`, which Lighthouse
measured at **860 ms** of blocked render on the live homepage. Both now use
`rel="preload" as="style"` plus `media="print" onload="this.media='all'"` with a
`<noscript>` fallback, and the entry is gone from the render-blocking list; only the app
CSS remains. Verified against the live CSP before shipping: `script-src 'self'
'unsafe-inline'` permits the inline handler, and `style-src`/`font-src` already allow the
two Google hosts — under a stricter CSP this pattern would silently leave the stylesheet
at `media="print"` and the font would never load.

Keep the two copies identical: `index.html` owns the homepage head, `render_shell()` in
`scripts/generate-og-files.py` owns every prerendered route's.

**Hero image: dimensions shipped, LCP unproven.** The `<img>` now carries its intrinsic
`width={343} height={361}` plus `fetchPriority="high"`, so the browser reserves 171x180
before the bytes arrive instead of 0. That removes its CLS contribution. It did **not**
move LCP in the local run (3.4 s -> 3.5 s), where FCP and LCP are equal and both are
bound by the app CSS, so PSI's "resource load delay 1,180 ms" is **not** demonstrated
fixed. Re-measure on PSI after deploy before claiming it.

**Still open from the original item:**

- **LCP on mobile — diagnosed on production, and it is the app CSS, not the image.**
  Live after the deploy: **FCP 3.3 s, LCP 3.3 s** (Hermes measured 3.2 / 3.9). FCP and
  LCP are effectively equal, which means nothing is slow to *load* — the page simply
  cannot paint until the one remaining render-blocking stylesheet arrives, and the LCP
  element paints the moment it does. The hero's `width`/`height` and `fetchPriority` were
  still correct (they removed its CLS contribution) but they could not move a metric that
  is not image-bound. **The only lever left is `/assets/index-*.css` in the critical
  path** — inline the above-the-fold rules, or split the stylesheet so the homepage does
  not download all 8.7 KiB of it before first paint. Do not reopen the image angle.
- Accessibility 97, one contrast failure.
- The numbers above are lab, not field. Confirm against CrUX in Search Console
  (Experience -> Core Web Vitals) once enough traffic accumulates.

**Verified before commit:** `/india` 9 cards, `/tag/defence` renders 64 links against the
64 it claims (7.5), `/company/ioc` indexable with its impact history ("What has moved
IOC") and no robots tag, `/company/spy` `noindex, follow` and 2,310 words for a reader
(3.7), the Mazagon Dock article one `h1` with 21 scroll-boxed tables and its contents
panel (3.8). One console error throughout: `/api/audio-index` 502, which has no backend
locally and is expected (section 4b). Prerendered heads still carry exactly one `<title>`
and one canonical (3.1, 3.2).

---

### 7.10 UI redesign, step 1: remove the decoration layer — DONE 2026-10-23 — REVERTED 2026-10-24 (owner decision, see 7.17)

**Result: the LCP hypothesis below was mostly wrong, and 7.9's conclusion stands.**
Measured on the 7.9 harness (`--form-factor=mobile --throttling-method=simulate`),
three runs per build against `vite preview`, with the served CSS asset hash checked each
time to prove which build was being measured:

| | perf | FCP | LCP | CLS | TBT | LCP element |
|---|---|---|---|---|---|---|
| Before | 83 | 3315 ms | 3610 ms | 0.018 | 67 ms | the `h1` |
| After | 84 | 3316 ms | 3471 ms | 0.016 | 30 ms | the hero `img` |

- **FCP did not move at all (+1 ms).** This is the finding. First paint is still gated on
  the one render-blocking stylesheet, exactly as 7.9 concluded. Removing the animation
  did not unlock the page.
- **LCP improved 139 ms (3.8%)**, and the LCP element changed from the `h1` to the hero
  image. That is structural confirmation that the opacity-0 animation was holding the
  `h1` back as an LCP candidate — but the effect is a fraction of what was supposed.
- **TBT more than halved, 67 ms -> 30 ms**, from dropping the animation work and 34
  inline hover handlers.
- **CLS did not regress.** Both builds measure ~0.017 on this harness; the 0 recorded in
  7.9 is a production measurement, so the two numbers are not comparable.
- Bundle: CSS 7.75 -> 7.41 kB gzip, JS 297.97 -> 297.39 kB gzip.

**A caution worth more than the result.** The first run of this comparison reported
LCP 3488 -> 2569 ms, a tidy confirmation of the hypothesis. It was wrong: `dist` had been
rebuilt underneath an already-running preview server, so which build each run measured
was unknown. Three repeat runs gave 3462 ms. Restarting the server per build and
verifying the asset hash produced the table above. **A single flattering run that
confirms what you expected is the one to re-measure**, which is the same lesson 7.9
records about needing a counterfactual.

**The two levers that remain, in order:** inline or split the render-blocking CSS (7.9
already named this), and replace the hero image with the text masthead in `DESIGN.md`
step 3 — it is now the LCP element, so there is nothing else above it to blame.

What shipped (three commits, all subtractions, no head tag or heading touched):

- `.animate-in` / fade-up and its delay classes; the fixed `body::before` grid with
  `mask-image`; the two body gradients; the `premium-card` sheen with `translateZ(0)`
  and `isolation`; `backdrop-filter: blur(22px)` on the header and mobile bottom bar;
  the radial ambient glow on the home and about heroes; three `blur(50px)` decorative
  circles; `box-shadow` on `.surface-card` (`--shadow-soft`/`--shadow-card` are now
  `none`, kept as tokens so ~8 inline call sites stay valid until step 2).
- Emoji tag icons removed from `AnalysisCard`; every font size below 12px raised to 12px
  (6 Tailwind arbitrary sizes, 22 inline `fontSize` values across 9 files). Homepage went
  from 10 elements computing under 12px to **zero**.
- All 34 `onMouseOver`/`onMouseOut` handlers replaced by six `data-hov` CSS rules.
  **Those rules need `!important` and it is load-bearing:** every affected element
  declares its base border/background/colour as an inline style, which outranks any
  stylesheet rule. The first version parsed, typechecked, built, rendered — and did
  nothing on hover. It was caught by reading computed styles in a browser, not by the
  build. Step 2 moves those base styles into classes and the `!important` can go.

Verified at 375px in a browser: home, the Kernex deep dive (4,526 words, 12 scroll-boxed
tables), `/company/ioc` (4,848 words, indexable, no robots tag per 3.7) and
`/analyses/page/1` all render; one `h1` each; no horizontal overflow; zero above-the-fold
elements with `opacity < 1` or a running animation; hover confirmed with a real pointer,
settling on exactly the values the old handlers wrote. Only console error throughout is
the expected `/api/audio-index` 502 (section 4b).

Emoji remain in 10 article titles and summaries in `analyses.generated.ts`. Those are
content, not UI, and retitling would contaminate the 2026-11-07 experiment (7.3).

**Steps 2-6 of `DESIGN.md` Appendix B are not claimed.** Step 5 is gated on the owner's
decisions in section 6 (AI disclosure, SEBI Research Analyst status).

<details>
<summary>The original claim and hypothesis, kept for the record</summary>

Spec is `DESIGN.md` (committed 2026-10-22, nothing implemented). Appendix B of that file
orders the rollout; this claim covers **step 1 only**, which is subtractions.

Chosen first because it touches **no title, description, heading or head tag**, so it does
not contaminate the 2026-11-07 Search Console re-export that 7.3 defines as the experiment.

It also tests a hypothesis 7.9 left open. 7.9 concluded the remaining LCP lever is the app
CSS. A review on 2026-10-22 argued the mobile LCP may be **JS-bound** instead: `.animate-in`
starts at `opacity: 0`, Chromium ignores opacity-0 LCP candidates, and `createRoot` discards
the prerendered nodes so the animation only replays once the ~334 KB gzip bundle has run.
**UNVERIFIED.** Removing the above-the-fold animation and re-running the 7.9 harness is the
cheap test, and the before number on the same harness is what makes it evidence.

</details>

---

### 7.11 UI redesign, step 2: tokens and typography — DONE 2026-10-23 — REVERTED 2026-10-24 (owner decision, see 7.17)

**FCP finally moved, and this is the first change that has moved it.** Three runs per
build on the 7.9 harness, served CSS hash verified each time, and the BEFORE build
confirmed to still carry the Google Fonts links (4 references) against 0 in AFTER:

| | perf | FCP | LCP | CLS | TBT |
|---|---|---|---|---|---|
| Before (7.10 state) | 84 | 3307 ms | 3459 ms | 0.016 | 28 ms |
| After | 91 | **2408 ms** | 3012 ms | **0.000** | 24 ms |
| | +7 | **−899 ms** | −448 ms | −0.016 | −4 ms |

Run-to-run spread was 5 ms on FCP, so unlike the step-1 outlier this is not noise.

7.9 and 7.10 both concluded FCP was gated on the render-blocking chain and that the
remaining lever was the CSS. **Removing the two third-party font origins was worth
899 ms of it** — more than the stylesheet itself. 7.9 had already made that stylesheet
non-blocking with `preload` + `media="print"`, which is why this was recorded as a
tidy-up rather than a lever; it was not. Under simulated mobile throttling the
preconnects and the font fetch still sit in the dependency graph and still delay the
app CSS. The CSS is still the next lever, but it is now worth less than this was.

**CLS 0.016 -> 0.000**, from the size-adjusted fallback.

What shipped:

- **Four text colours failed the 4.5:1 floor and now pass.** 7.9 recorded "one contrast
  failure"; measured against both the page and the card beneath, there were four:
  dark `--text-dim` 4.45, light `--text-dim` 3.54, light `--down` 4.46, light `--warn`
  2.71. Zero failures after, lowest 4.67.
- `--green`/`--red`/`--yellow` are now `--up`/`--down`/`--warn` at all 18 uses. Naming
  them for the meaning is what stops them being used as decoration.
- Dead tokens removed: `--accent-warm` (0 uses), `--shadow-soft` (0), `--shadow-card`
  (7 inline `boxShadow` call sites deleted first), `--radius-sm` (0). `--radius`
  18px -> 10px. Light palette moved to the DESIGN.md values.
- `font-variant-numeric: tabular-nums` on article tables, the watchlist and the impact
  history via a `data-nums` hook. Verified: 24 such elements on `/watchlist`, all
  computing `tabular-nums`.
- **Self-hosted Inter, one file.** Inter v20 is a variable font and Google Fonts returns
  the same latin woff2 for 400, 600 and 700, so `font-weight: 400 700` covers the scale
  in 47 KB. OFL, committed with its licence in `public/fonts/`.

**The fallback metrics are measured, not copied, and the copied ones were wrong.** The
widely-quoted `size-adjust: 107%` for Inter-against-Arial is off for this subset: Inter
renders 1.0594x Arial here, so 105.94%. At 107% the fallback ran ~1% wide; at the
measured value it matches to 0.007% (0.11 px over 1543 px). That is what buys CLS 0.000,
and it is the kind of value that must be re-measured if the face is ever changed.

**Not done, deliberately.** The default theme is still dark with its toggle. `DESIGN.md`
section 1 asks for system-preference light but also says the dark default is unmeasured
and should be A/B'd once analytics exist (7.3: still no analytics tag). Flipping it and
deleting a control readers use is an owner decision.

Verified at 375px: `/watchlist` renders with 1 `h1`, no horizontal overflow, zero
elements under 12px, **zero third-party origins**, Inter loaded. `generate-og-files.py`
exits 0 with JSON-LD parsing on all pages (3.3). `index.html` and `render_shell()` both
carry exactly the same single preload and no Google Fonts reference (7.9 parity).

**A method note that cost real time.** A file check run against the working tree while a
background A/B measurement had the BEFORE commit checked out read the old files and
reported Google Fonts still present. Do not inspect the tree while a comparison script is
swapping refs underneath it.

`DESIGN.md` Appendix B step 2. Scope:

- The section 2 palette as tokens. For the dark theme this is small — raise `--text-dim`
  to `#9aa7b8` (the current `#748296` is dimmer than the 4.5:1 floor), rename
  `--green`/`--red` to `--up`/`--down`, retire `--accent-glow` and the dead
  `--shadow-*` tokens with their ~8 inline call sites.
- The section 3 type scale, and `font-variant-numeric: tabular-nums` on every table,
  figure and ticker. A research site whose numbers do not line up column to column
  looks wrong before anyone reads it.
- **Self-host an Inter subset (400/600/700) with a size-adjusted fallback.** This is the
  one piece aimed at a measured number. 7.10 established that FCP is unmoved at ~3315 ms
  and gated on the render-blocking chain; the Google Fonts stylesheet is two third-party
  origins in that chain. 7.9 already made it non-blocking via `preload` +
  `media="print"`, so the remaining win is removing the origins, not the block.

**Not in scope, deliberately.** The default theme stays dark with its toggle. `DESIGN.md`
section 1 asks for system-preference light, but also says the dark default is unmeasured
and should be A/B'd once analytics exist (7.3 notes there is still no analytics tag).
Flipping the default and deleting a control readers use is an owner decision, not a
token change.

Acceptance is a before/after on the 7.9 harness, three runs each with the served asset
hash verified, as 7.10 records. **CLS must stay at its current value** — a self-hosted
face with the wrong metrics reintroduces exactly the shift 7.9 removed.

Keep in sync: `index.html` owns the homepage head and `render_shell()` in
`scripts/generate-og-files.py` owns every prerendered route's. 7.9 records why they must
stay identical.

---

### 7.12 UI redesign, step 3: nav, masthead, Research / Daily Pulse split — DONE 2026-10-23 — REVERTED 2026-10-24 (owner decision, see 7.17)

**The masthead's premise was wrong, for the second time in this series.** I predicted the
hero image was the LCP element and that deleting it would close the FCP/LCP gap. Measured,
three runs per build with the hero PNG's presence in `dist/assets` verified per build:

| | perf | FCP | LCP | CLS | LCP element |
|---|---|---|---|---|---|
| Before | 91 | 2409 ms | 3014 ms | 0.000 | the `h1` |
| After | 92 | 2411 ms | 2861 ms | 0.000 | the lead `<p>` |

- **The hero image was not the LCP element.** It had been at the 7.10 state, which is
  where the prediction came from, but by 7.11 the LCP candidate had moved back to the
  `h1`. The gap narrowed 605 ms -> 450 ms and LCP improved 153 ms, because the masthead is
  less markup, not because an image went away.
- FCP unchanged (+2 ms), as expected — nothing here touched the render-blocking chain.

**The pattern worth naming.** This is the second LCP prediction in three steps to be wrong
(7.10 was the first), and both failed the same way: attributing LCP to a specific element
without first reading what Lighthouse names as the LCP element. `largest-contentful-paint-element`
is in every report. **Read it before forming the hypothesis, not after.** A gap between FCP
and LCP says the LCP element paints late; it does not say which element that is.

The masthead is still right on its own terms — nothing above the fold is an image, the
`h1` now says what the site is, and the decorative PNG is out of the bundle — but it was
sold as an LCP fix and it is a modest one.

What shipped:

- **a. Nav.** `Home` / `India research` / `Global macro` / `Watchlist`, replacing
  Home / About / Contact / Risk / Privacy. The dock spent every slot on a phone on pages
  nobody revisits while `/watchlist` was linked from nowhere (7.6) and the 7.7 beats were
  absent. Legal links were already in the footer. Dock is four columns.
- **b. Masthead.** The hero card, its 343x361 PNG, the "Independent research desk" pill,
  the LIVE LIBRARY badge and the three stat tiles are gone; the stats are one line of
  text. The `h1` is now "Indian stock research, and the global macro that moves it.",
  which matches the title and description (7.7); the old "Markets move fast. Research
  should stay sharp." never mentioned Indian equities. It is not the title or the
  description, so it does not touch the 2026-11-07 SERP experiment (7.3).
- **c. `/research` and `/pulse`**, paginated, page 1 at the bare URL. 34 pages. Sitemap
  661 URLs. **`kind` is derived once** in `scripts/lib/kind.js` and written onto every
  record by `generate-analyses-data.js`, exactly as 7.7 did for `market`, so the sitemap,
  the prerender and the app read one value. `src/utils/category.ts` re-implemented the
  same tag-and-title rule and now delegates to it — that duplication is what let the
  ticker rule (3.6) and the tag floor (7.5) drift, and this avoids a fourth copy.

**The two axes are never combined.** `/research/india` would be a fourth near-duplicate
listing of the same 294 articles — the surface 7.5 gated tags against and 3.7 gated hubs
against. Each section cross-links the other instead. If that cross-product is ever wanted,
it needs a gate first.

**Server work, and it is not optional.** `/research` and `/pulse` 404 until their nginx
blocks are applied; the catch-all is `try_files $uri =404`, so a green build proves
nothing. Blocks are queued in `docs/nginx-seo.conf` and take the first row of 3.13's table
(`try_files $uri.html =404`, no `/index.html` fallback) because every valid URL has a
prerendered file — a fallback would make `/pulse/page/99` a soft 404.

Verified: 34 sitemap kind URLs against 34 prerendered files, zero missing. Each page
carries one title, one canonical, no robots tag, and JSON-LD that parses (3.1–3.3). At
375px `/pulse` renders 9 cards, a 27-page pager, cross-links to research and both markets,
zero elements under 12px, no horizontal overflow. Homepage: one `h1`, **zero images above
the fold**.

**Not done.** The default theme (owner decision, 7.11). Retitling Policy Pulse articles —
`CONTENT-PLAYBOOK.md` section 2 is right that the current titles waste their first 14
characters, but that is content and would contaminate the 2026-11-07 experiment.

---

### 7.13 UI redesign, step 4: ResearchCard and PulseRow — DONE 2026-10-24 — REVERTED 2026-10-24 (owner decision, see 7.17)

`DESIGN.md` Appendix B step 4. The library renders one card shape for everything, so a
730-word daily note and a 2,600-word deep dive arrive looking identical — the confusion
7.12 split the routes to fix, still present inside every listing.

- **ResearchCard**: eyebrow, title, two-line summary, `TICKER · date · N min read`. No
  tag pills — the card currently carries up to three plus a `+N`, which is the densest
  thing on it and the least useful.
- **PulseRow**: a text row, not a card. Accent-barred eyebrow (`INDIA · MINISTRIES`),
  headline, `date · tickers`. Separated by a hairline rather than boxed.
- `AnalysisGrid` dispatches on `kindOf` (7.12's build-time value) and a PulseRow spans
  all grid columns, so mixed surfaces — the homepage library, `/tag/*`, `/analyses/*`,
  `/india`, `/global` — keep strict date order while the two shapes stay distinguishable.

**Correction to the step name.** `DESIGN.md` says this replaces `AnalysisCard`.
`src/components/Home/AnalysisCard.tsx` is **dead code** — nothing has imported it since
at least 7.9, and the card actually rendered is `AnalysisGridCard` inside
`AnalysisGrid.tsx`. The dead file is deleted here.

**Must not regress:** `initialCount` (7.5). Verified: `/tag/defence` claims 70 and
renders 70, with no "Show more" button.

**A real defect, found only by rendering it.** Stripping the series boilerplate off a
Pulse title leaves **"23 Oct 2026"** — the date and nothing else, because these titles
are boilerplate plus a date and carry no claim at all. The first version therefore
rendered rows whose headline *and anchor text* were a bare date: useless to a reader and
worse than the boilerplate for a crawler, which would see a date as link text.
`pulseHeadline()` now falls through to the summary's first sentence when the stripped
remainder does not read as a claim (three or more real words). Rows lead with "Brent
closed in on USD 116 as the attacks moved from Hormuz into Saudi Arabia's oil
heartland…" instead. Presentation only — the titles are a content problem
(`CONTENT-PLAYBOOK.md` section 2) and retitling them would contaminate the 2026-11-07
experiment (7.3).

**A self-inflicted one worth recording too.** A scripted edit written with a Python
triple-quoted string turned every `` in the edition regex into a literal backspace
byte (0x08), so `edition()` would have matched nothing and every row would have read
"Daily Pulse". `tsc` passed — the file was still valid TypeScript. Caught by scanning the
written files for control characters. **When a script rewrites source containing regex
escapes, use raw strings and scan the result**; the compiler will not tell you.

Dates in listings are now "23 Oct 2026" throughout, not a mix of that and `2026-10-23`.

Verified at 375px: `/analyses/page/1` renders 3 cards and 15 rows in date order with
**zero** bare-date headlines and 9 unique article links on a page claiming 9; `/pulse` is
rows only, `/research` cards only; zero elements under 12px; no horizontal overflow.
CSS 7.60 -> 7.43 kB gzip.

---

### 7.14 UI redesign, step 5: byline and disclosure — DONE 2026-10-24 (both section 6 decisions still OPEN) — REVERTED 2026-10-24 (owner decision, see 7.17)

`DESIGN.md` Appendix B step 5, which that file marks as gated on the two decisions in
section 6. Split so the structure ships and **neither decision is made here**.

**Shipping — no decision required:**

- **An author byline on the article page.** There is currently none. `Pulkit Goel`
  appears in the footer, on `/about`, in the prerendered `<meta name="author">` and as
  the JSON-LD `Person` — everywhere except where a reader looks. On YMYL content that is
  the one place it matters. This publishes no new claim; it surfaces one the prerender
  already makes to crawlers.
- Published and updated dates in the byline row, from `date` and `updated`.
- A persistent disclosure strip above the footer carrying **only positions the site
  already publishes**: "Educational research, not investment advice" (the per-article
  line from 7.4 says exactly this), with links to the existing Disclaimer and Contact.

**Not shipping — owner's call, and section 6 says do not decide these autonomously:**

- The AI-disclosure chip's wording and whether it appears at all.
- Any registration-status line. "Not a SEBI-registered research analyst" is a legal
  statement about the owner, not a UI string, and `DESIGN.md` wrote it only as a
  placeholder.

Both live in `src/config/disclosure.ts`, unset. The components render the slot and omit
it entirely while it is unset — no placeholder text reaches a reader. Setting either
value is a one-line change that turns it on everywhere.

**A `/methodology` page is deliberately not built**, for two reasons. 7.6 already places
methodology inside a 400-900 word `/about`, not a new route, and a new route needs a hand
-applied nginx block (`job_apply_nginx` is replacements-only, as 7.13 records). More
importantly: a page explaining *how these analyses are produced* that omits AI drafting
would be actively misleading, which makes it the one piece of step 5 that cannot be
written before the disclosure decision rather than merely styled around it.

**Shipped and verified** at 375px on two articles and `/watchlist`: one `h1` each, **zero**
elements under 12px, no horizontal overflow, the strip present (a reader landing on
`/watchlist` previously saw no disclosure at all), no AI chip, the string "SEBI" absent,
and no bracketed placeholder anywhere. `generate-og-files.py` exits 0 with JSON-LD
parsing on every page (3.3), and every hook is still above the early returns (3.12).

**Also fixed here:** `.toc-count` was `0.68rem`. The 7.10 sweep raised Tailwind utilities
and inline `fontSize` values but not plain rules in `index.css`, so this one survived.
Two process notes from finding it, both mine: a scripted edit whose anchor did not match
printed a success message anyway because it had no assertion, and the stale result was
then read off a `vite preview` that was still serving the pre-rebuild asset hash. **Assert
the replacement happened, and restart the preview before reading the result** — 7.11
records the same server-staleness trap.

**Worth stating plainly, because it is the argument for deciding soon.** Adding a visible
human byline while the `model:` field stays in frontmatter widens the gap between what a
reader sees and what is true. Section 6 already calls the current partial disclosure "the
weakest of the three available positions"; this makes that weakness more visible, not
less. It is a reason to settle the decision, not a reason to withhold the byline, since
the authorship claim is already published to crawlers either way.

---

### 7.15 UI redesign: make the live site match the approved mockups — BUILT 2026-10-24, awaiting owner sign-off before deploy — REVERTED 2026-10-24 (owner decision, see 7.17)

**Why this item exists: 7.10-7.14 shipped the structure of the approved design and none
of its appearance.** The owner approved light mockups on 2026-10-22 — white page, teal
`#0f766e` accent, a dark teal article band, a key-takeaway panel. The live site is dark
with the old neon `#63e6be`, the old 2rem-radius panels and no band. Side-by-side capture
confirmed it.

**The cause was mine and it is worth writing down.** `DESIGN.md` section 1 records the
dark default as "unmeasured, A/B it once analytics exist". I wrote that hedge, then cited
it in 7.11, 7.12 and 7.14 as a reason to leave the default alone, describing it each time
as an owner decision still open. It was not open: the owner had approved light mockups and
said to build them. **A hedge written into a spec is not a standing veto over the approval
that followed it.** When the owner has approved a design, the spec's own caveats are
superseded, and continuing to cite them is overriding the decision rather than deferring
to it.

Scope:

- Default theme **light**, honouring `prefers-color-scheme` when no choice is saved. The
  toggle stays — `DESIGN.md` says no toggle, but removing a working control the owner did
  not ask to lose would repeat the same error in the other direction.
- Light palette finished to the `DESIGN.md` section 2 values: `--accent-deep` and
  `--link` are missing, and `--radius` is 10px against the spec's 8px.
- **ArticleBand** — the solid `--accent-deep` band carrying breadcrumb, eyebrow, the one
  `h1`, the byline row and the lead. The single most defining element of the article
  mockup, and not built in 7.14 despite being listed in Appendix B step 5.
- **TakeawayPanel** — `--accent-wash` fill, "Key takeaway" label, the front-matter
  summary, and up to four stat blocks on `--accent-deep`.
- Strip the leftover dark chrome: `rounded-[2rem]` / `[1.75rem]` / `[1.4rem]` across 10
  files, the glow on `.btn-primary`, and the `page-panel surface-card` wrappers the band
  replaces.

**Acceptance is visual, not a metric.** Render every changed page at 375px and 1280px and
put it beside the approved mockup. Nothing deploys until the owner has seen that
comparison — 7.10-7.14 each reported a green build while the site looked wrong.

Invariants to hold: one `h1` (3.8), no head tags from components (3.2), hooks above early
returns (3.12), no spinner over prerendered content (3.14), 12px floor, CLS 0 (7.11).

**Built and committed in `3b20c65`. Deliberately not deployed and no deploy job queued** —
the owner sees the side-by-side first. 7.10-7.14 each reported a green build while the
site looked wrong, so a build passing is not the acceptance test here.

What shipped:

- Default theme light, honouring `prefers-color-scheme`. Changed in all three places that
  decide it — `index.html`, `render_shell()`, `Header.tsx` — because if they disagree the
  page paints one theme and swaps after mount.
- `--accent-deep`, `--accent-on-deep`, `--link` added; `--radius` 10px -> 8px.
- `ArticleBand` replaces the `page-panel surface-card` header. `TakeawayPanel` carries the
  summary, the dated verdict and up to four stat blocks, with the figures read from
  watchlist frontmatter now carried on the `Analysis` record so it renders synchronously
  (3.14). No stats rather than placeholders when an article has none.
- Stripped: `rounded-[2rem]`/`[1.75rem]`/`[1.4rem]` across 11 files, the glow on
  `.btn-primary` and `.btn:active`, and five hard-coded `rgba(99,230,190)` shadows and
  borders. Those were the dark accent as a literal, so on a light page they put a green
  halo around a teal button.

**Two defects found by comparing the render to the mockup, not by any check.** Articles
rendered **two breadcrumbs** — the page kept its own above the band while the band carried
another — and the same edit silently dropped the ticker->company-hub links that are 7.4's
internal linking. Both fixed. `tsc`, the build and the JSON-LD check all passed with both
present, which is the 9.5 lesson again: open the page.

Verified at 375px in light: one `h1`, one breadcrumb, takeaway present, no horizontal
overflow across home, archive and two articles. `generate-og-files.py` exits 0 (3.3). All
eight light-theme text/background pairs clear 4.5:1, lowest 5.13.

**Known remaining gaps from the mockup**, surfaced to the owner rather than silently
closed: the logo is still the rounded-square mark against the mockup's text wordmark; the
stat blocks show watchlist figures rather than the mockup's article metrics, because those
are the only numbers the data actually holds; and Pulse rows have no timeline rail yet.

---

### 7.16 UI redesign: the homepage and the motion layer — DONE 2026-10-24 — REVERTED 2026-10-24 (owner decision, see 7.17)

7.15 fixed the palette and the article page. The homepage and the motion were never
built at all, and the owner's verdict on the delivered work was "-100 out of 100".

Measured on the live site before starting:

- **`animatedEls: 0`.** The owner asked for animation explicitly, approved it as two
  recorded GIFs on 2026-10-22, and the shipped site has none. 7.10 *removed* the only
  animation there was and nothing replaced it. The motion layer exists — it was written
  and demoed in the mockup — and was simply never ported into the app.
- **The homepage is not segregated.** It is one "Research library" panel with a search
  box, four category tabs and a mixed list. The approved mockup has two sections:
  *Latest research* as cards with an India/US control, and *Today's Pulse* as a dated
  timeline. Splitting the two families was the owner's original request in this whole
  thread; the routes got it (7.12) and the homepage never did.
- Pulse rows have no timeline rail, and the old rounded library panel survives.

Scope: port the mockup's motion (scroll reveal below the fold, hover lift, the segmented
pill slide, a one-shot ping on today's dots, reading progress on articles), rebuild the
homepage as the two approved sections, add the rail to PulseRow.

Motion rules from DESIGN.md section 6 still hold and are what keep this from costing the
7.9/7.11 work: transform and opacity only, nothing above the fold, nothing on the LCP
element, no loops, and everything off under `prefers-reduced-motion`.

**Acceptance is the mockup, judged visually, and the owner sees it before deploy.**

**Shipped, and the owner signed off on the side-by-side before deploy.**

- Homepage is the two approved sections: *Latest research* (cards + an India/US segmented
  control) and *Today's Pulse* (dated timeline). Search moved to the archive, which is the
  page built to be searched.
- Motion ported from the mockup: scroll reveal armed **only** below the fold, the sliding
  segmented pill, reading progress, hover lift, press feedback, and a one-shot ping on
  today's dots. The reveal class is added by JS, never by the markup, so a crawler or a
  no-JS reader sees everything (7.1, 7.10).
- `PulseRow` gains the rail — a continuous 2px line with a dot per entry.
- **The mobile dock was covering content.** It was a floating pill at `inset-x-3 bottom-3`
  and measurement showed it sitting on top of the first card. A pill with margins reads as
  an object resting on the page; it is now flush with a top rule and a safe-area inset,
  which is what the mockup had.

Verified at 375px: headings read "Latest research" and "Today's Pulse", 4 cards, rail
present, segmented thumb present, no search box, reveals fire and settle. Hooks all above
the early returns (3.12); `generate-og-files.py` exits 0 (3.3).

**Still differing from the mockup, left deliberately and told to the owner:** the masthead
keeps its stats line and two buttons where the mockup goes straight to "Latest research",
and the logo is still the rounded-square mark rather than a text wordmark.

---

### 7.17 UI redesign reverted to the pre-redesign version — DONE 2026-10-24 (owner decision)

**The owner reviewed the redesigned site and chose a full revert.** Verdict, in their
words: they expected a "wow" site and the result was a plain one, and the earlier version
was better. Offered a hybrid (earlier look, fixes kept underneath); chose the full revert.
That is the decision and it stands. Items 7.10-7.16 are marked REVERTED and kept as history.

**What was reverted, and only this:** `src/`, `index.html`, `scripts/` and `public/fonts/`,
restored to `f2ca44c` — the commit immediately before 7.10 changed any code. Every commit to
those paths since was redesign work, including two of Hermes's fixes to the new UI
(`edd7055` dock height, `51428a8` deck de-duplication), which go with it.

**What was deliberately NOT reverted:** every article and content correction (RAJESHEXPO
included), `docs/nginx-seo.conf`, the handoff log and this file. Data was regenerated from
current content with the restored generator, so all 294 articles are present.

**Verified before commit, against a render of the earlier version from git:** 0 pixels
differing on the home and article pages at 375px. The built CSS is `index-mIsKlFve.css` —
byte-identical to the pre-redesign CSS, which is the same hash 7.10 recorded for its BEFORE
build. JS differs only because the bundle carries newer articles.

**Consequences of the revert.** The owner was told about the lost fixes (faster load, readable text) when offered the hybrid, but was NOT told beforehand that `/research` and `/pulse` would start returning 404 - that is being reported to them now, after the fact:

- `/research` and `/pulse` no longer exist in the app or the sitemap (627 URLs, from 661).
  Their nginx blocks remain and use `try_files $uri.html =404`, so they now return a clean
  **404**, not a soft 404. They were live for about a day.
- Lost with the revert: the self-hosted font (7.11 measured it at -899ms FCP locally, ~-270ms
  live), the contrast fixes, the 12px text floor, the article readability fixes, the byline,
  and the segregated homepage.

**The lesson, recorded because it caused this.** The design research behind `DESIGN.md` used
four reviewer lenses — devil's advocate, simplicity, performance, compliance — and every one
of them argues for removing things. None stood for visual design, brand or delight, so the
research could only recommend subtraction, and the spec encoded it as rules ("no gradients,
no glow, no shadows, flat"). Then real defects (tiny text, low contrast, a render-blocking
font, an opacity-0 hero) were removed together with the character that was never a defect.
**If design research is run again, one lens must argue for how the product should feel.**

---

### 7.18 Reader-requested research queue — IN PROGRESS, Claude Code session, 2026-10-25

A public page where a reader nominates a listed company, the request lands in a
bounded queue, and Hermes drains it into a published deep dive.

**Design complete, nothing implemented.** `docs/RESEARCH-REQUESTS.md` owns the
page, the universe file, the queue schema, the API, the guardrails, the prompts
and the Hermes runbook. Claim stays open so nobody starts a second
implementation; it does not become DONE until the feature ships.

The load-bearing decision is in §0 of that file: **the reader never sends text
that reaches a prompt.** The form is a picker over a closed universe and the POST
carries an id the server re-resolves against its own copy, so injection is
structurally absent rather than filtered. Dedup is 30 days against non-series
articles plus open queue rows, with a partial unique index as the race guard
(§3.1). A market-cap floor holds microcap requests for the owner (§3.2) — an
anonymous stranger getting an independent-looking report published on an
illiquid name under the owner's byline is the shape of a pump.

Blocked on the owner: the SEBI question sharpens with this feature, the floor's
number is a proposal, and **the page does not get built until the owner has seen
the mockup beside the live site** — 7.10-7.16 each reported a green build while
the site looked wrong, and 7.17 is what that cost.

---

### 7.6 Remaining items

- **The homepage is the one route with no canonical in its prerendered head.** Found
  while verifying 7.9 on production, 2026-10-17: every other route carries exactly one
  (`/india`, `/global`, `/analyses/page/3`, `/tag/*`, `/company/*`, `/analysis/*`,
  `/about` all check out), but `/` has **zero**, because the homepage head comes from
  `index.html` — which never had one — rather than from `render_shell()`. A
  non-executing crawler therefore gets no canonical on the site's most important URL.

  It is **not** a one-line addition. `HomePage.tsx` already emits a canonical through
  Helmet, so adding one to `index.html` would put two on `/` after hydration, which is
  the duplicate-metadata defect 3.2 exists to prevent. The fix is to add it to
  `index.html` **and** drop it from `HomePage.tsx` in the same change, matching how
  `AnalysisPage` and `CompanyPage` already defer to the prerendered head. Pre-existing,
  not a 7.9 regression.

- Trust layer: a 600-900 word disclaimer, a 400-600 word `/about` with methodology, and
  a disclaimer line in every article (only 70 of 250 have one).
- Link the sources already named in prose: 226 articles name a source, 10 link to one.
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

### 7.7 India / Global split — DONE 2026-10-10

**Owner decision, taken 2026-10-10: option C, split the beats.** The site publishes
two things and will keep publishing both, because the author invests in US equities as
well as Indian ones and so do many readers. They now live in separate sections instead
of one undifferentiated pile.

The problem this solves, measured: 107 of 254 articles were US or global, the seven
most-mentioned tickers were American (XOM 88, CVX 84, DAL 78 — TCS first appeared at
#8), and Search Console showed the site at **position 7.2 in the United States against
25.1 in India**, on a site whose stated purpose was Indian stocks. Google was reading
the aggregate, not the tagline.

**`market`, derived once at build time.** `scripts/lib/market.js` classifies each
article as `india` or `global`; `generate-analyses-data.js` writes it onto every record
in `analyses.json`, so the sitemap, the prerender and the app all read one value rather
than re-deriving it. Current split: **139 India, 115 Global.**

Classification order, each beating the next:

1. Explicit `market:` in frontmatter. Always wins — the classifier is a backfill for
   254 existing articles, not a permanent guess. Set it when publishing anything
   ambiguous.
2. Policy Pulse edition name in the title. Trump or Global to `global`; Modi,
   Ministries or Cabinet to `india`. Global is tested first so a "Modi & Trump" piece
   lands in global. This is the most reliable signal, which matters because the series
   has shipped under 22 different title spellings.
3. An Indian index ticker (NIFTY, SENSEX, BANKNIFTY) to `india`. Deliberately ahead of
   tags: a piece on an Indian selloff is often tagged `global` because the cause was
   global, but "Why Markets Crashed on June 23" with ticker `NIFTY:SENSEX` is India
   coverage.
4. Tags: `us-only`/`global` to `global`, `india`/`modi`/`rbi`/`sebi` to `india`.
5. A US primary ticker to `global`. Catches the few non-Indian deep dives — Palantir
   and AMD are the only three articles currently reaching this rule.
6. Default `india`, because an unclassified piece is overwhelmingly an Indian deep dive.

**Routes.** `/india` and `/global`, each paginated at `/{market}/page/N`, 9 per page
(16 and 13 pages). Page 1 is the bare section URL with no `/page/1` alias.
`/analyses/page/N` stays as the combined archive. `ArchivePage` serves all three: it
takes an optional `market` prop, and one component covers them because the only
differences are scope, base path and copy. Topic hubs on a section page are scoped to
that section, so `/india` never advertises a tag only global articles carry. Each
section cross-links the other, and every article carries a linked section badge.

Sitemap is now **498 URLs**.

**Positioning copy changed to match.** "StocksFundamentals — Indian Stock Research &
Global Macro", described as Indian deep-dive research "plus daily US and global macro
for investors holding both". Kept identical in `index.html` and `HomePage.tsx` per 3.1.
Do not quietly revert this to India-only: the content is 45% global and the claim has
to match what is published.

**Keep in sync** (same hazard as 3.6): `scripts/lib/market.js`, `src/utils/market.ts`
and the `MARKET_HEADING`/`MARKET_BLURB` copy in `scripts/generate-og-files.py`.

**Not done, deliberate:** `/company/{ticker}` hubs still merge markets, so
`/company/hal` serves both Hindustan Aeronautics and Halliburton. The owner chose to
fix only genuinely clashing symbols rather than re-scheme all 155 URLs. HAL is the
known clash; find the rest before changing anything.

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

---

## 9. Coordination — who owns what

More than one agent works in this repository: the automated agent (Hermes) and
interactive Claude Code sessions driven by the owner. They have collided.

**What went wrong on 2026-10-10,** so the cost is concrete rather than theoretical:

- The crawlable tag and archive feature (7.5) was designed and built **twice, in
  parallel**, by two agents who each pushed a complete implementation. One was deleted
  unmerged. Roughly a day of work produced nothing.
- The React hooks bug in the article table of contents was found, diagnosed and fixed
  **twice within the hour**, producing a merge conflict between two correct fixes of
  the same line.

Neither was a disagreement. Both agents were right. They simply could not see each
other working.

### 9.0 Read and write the handoff log

`HANDOFF.md` is the channel between agents. Read it first thing, append to it last
thing. It exists because the owner was relaying messages between two agents by hand,
which is slow, lossy and entirely avoidable: everything one agent needs from the other
is already in the repo or on the live site.

Mark entries **ACTION** (the other agent must do this), **OWNER** (only the owner can
decide) or **UNVERIFIED** (you could not test it, and here is what would).

UNVERIFIED matters most. Every bug caught this week was caught because one agent
doubted the other and measured rather than trusting the claim.

### 9.1 Claim an item before you start

The backlog in section 7 is the claim board. Before writing any code for an item:

1. `git fetch origin && git log --oneline main..origin/main` — see what landed while
   you were away.
2. Edit that item's heading in section 7 to read
   `### 7.x <title> — IN PROGRESS, <who>, <date>`.
3. **Commit and push that one-line change on its own, before doing the work.**

A claim costs one small push and saves a day. If the heading already says IN PROGRESS
and the date is today, pick a different item — do not start a second implementation on
the assumption that yours will be better.

Clear the claim in the same commit that finishes the work, changing the heading to
`— DONE <date>`.

### 9.2 Default split of responsibility

Unless the owner says otherwise:

| | Owns |
|---|---|
| **Hermes (automated)** | Publishing articles, the build and deploy pipeline, server and nginx changes, and implementing backlog items in section 7. |
| **Interactive session** | Auditing, verification against the live site, diagnosing regressions, and the invariants in section 3. Implements a backlog item only when it has claimed it per 9.1. |

The division that worked: one agent builds, the other verifies. The 60-vs-9 tag page
defect and the hooks crash were both caught by review rather than by the build, and
neither would have been caught by the agent that wrote the code.

### 9.3 Push small, push often

Long-running uncommitted work is what makes collisions expensive. A feature that lands
in four pushes conflicts in one file; the same feature landing in one push conflicts in
eleven. Push each coherent step as it passes its own verification.

### 9.4 A build and its routing ship together

7.7 shipped its build without its nginx blocks, so 29 section URLs sat in the sitemap
while every one of them 404'd. The split between "someone writes the config in
`docs/nginx-seo.conf`" and "someone applies it on the server" is where that fell
through, and it has now happened twice — the legacy `.html` redirects sat unapplied for
a day in the same way.

If a change needs a server-side rule, it is not done when the build is green:

- Say so in the commit message, explicitly, under its own line.
- Treat `docs/nginx-seo.conf` as a queue of pending server work, not documentation of
  the live state. It has drifted from the live config in both directions.
- After deploying, `curl` one URL of each new route shape, including one that should
  **fail**. A route that 200s when it should 404 passes every "does it load" check.

### 9.5 Verify against the live site, not just the build

`https://stocksfundamentals.online` is public and can be checked directly at any time.
Do it — a green build says almost nothing about what visitors and crawlers receive.

Checks that earned their place:

```bash
# What a crawler actually receives (should be well over 20000 on an article)
curl -s -A Googlebot https://stocksfundamentals.online/analysis/<slug> | wc -c

# Does a listing page link everything it claims to?
#   /tag/defence advertised "60 articles tagged" and shipped 9 links.
curl -s -A Googlebot https://stocksfundamentals.online/tag/<slug> \
  | grep -o 'href="/analysis/[^"]*"' | sort -u | wc -l

# Is a page that returns 200 actually that page, or the SPA shell?
curl -sI https://stocksfundamentals.online/<path> | grep -i content-type
```

Three things to hold onto:

- **A 200 is not proof a file exists.** Before the nginx fix every path returned 200.
  Verify by body and `Content-Type`, never by status code alone.
- **`tsc` and `vite build` both pass on a component that renders nothing.** That is
  exactly how the hooks crash reached `main`. Open the page (invariant 3.12).
- **Check whether a change is deployed before judging it.** A defect found in the repo
  may not be live, and a fix that is committed may not be. `curl` the live URL and
  compare against what the build produces locally.
