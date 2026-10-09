---
name: publish-analysis
description: Publish a new stock analysis to stocksfundamentals.online. Use when asked to publish, add, or post a new analysis/deep-dive/article, given its title, ticker, and body. Creates the markdown file with correct frontmatter, regenerates data, and builds.
---

# Publish a new analysis

The full contract lives in `PUBLISHING.md` at the repo root — read it if anything
here is ambiguous. Markdown frontmatter in `public/analyses/<slug>.md` is the
**single source of truth**; the card list, sitemap, OG tags, and app data are all
generated from it. Never hand-edit `src/data/analyses.generated.ts` or
`public/analyses.json`.

## Steps

1. **Collect** the required metadata: `title`, `ticker`, `tags` (list), `summary`
   (one paragraph), and the full markdown `body`. Optional: `date` (defaults to
   today), `slug` (defaults to slugified title), `model`.

   **Classify the article type via tags** — this decides which home-page tab it
   lands in (segregation is automatic, keyed off tags; see `src/utils/category.ts`):
   - **Policy Pulse** (daily macro/policy tracker): the `tags` **must** include
     `policy-pulse`; title should start with `Policy Pulse — `.
   - **Stock Research** (everything else — deep-dives, market notes, FII/DII):
     use `deep-dive`/`fundamental`/`market-analysis`/`fii-dii` etc. and **never**
     add `policy-pulse` or `policy-tracker`, or it will be miscategorized.

2. **Scaffold the file** — do not hand-write frontmatter. Write the body to a temp
   file, then run:

   ```bash
   node scripts/new-analysis.js \
     --title "<title>" --ticker "<TICKER>" --tags "<t1,t2,t3>" \
     --summary "<one-paragraph summary>" --body-file <draft.md> [--date YYYY-MM-DD]
   ```

   Ticker format: single `"TICKER"` or `"TICKER:EXCHANGE"`; multi-stock posts use
   colon-separated tickers (`"AAPL:MSFT:NVDA"`). Tags are lowercase-kebab-case.

3. **Regenerate + build** and confirm exit code 0 (this validates the frontmatter):

   ```bash
   npm run build
   ```

   If it fails at `generate-analyses-data`, fix the reported frontmatter field and
   re-run.

4. **Deploy** with `./deploy.sh`, and optionally notify subscribers via
   `POST /api/notify` (see PUBLISHING.md for the curl command).

## Optional: add the stock to the private Watchlist

To track a stock's live price against your called levels on `/watchlist` (a
private, unlisted page), add these fields to its analysis frontmatter and rebuild:

```
watchlist: true
priceAtAnalysis: 411      # plain number, price when published
support: 406              # must be < resistance
resistance: 425
verdict: "CAUTION"        # optional badge
```

Live prices are served by the backend `/api/quote` endpoint (yfinance); the Yahoo
symbol is derived from the ticker (NSE → `.NS`), overridable via `yahooSymbol`.
See PUBLISHING.md → "Adding a stock to the Watchlist" for the full field table.

## Guardrails
- `date` must be exactly `YYYY-MM-DD`; `tags` must be a JSON array.
- The slug is the file name — do not put `slug:` in frontmatter.
- The scaffolder won't overwrite an existing file without `--force`.
- Watchlist numbers are plain (no `₹`), and `support` must be below `resistance`.
