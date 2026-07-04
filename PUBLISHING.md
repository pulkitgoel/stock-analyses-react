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
