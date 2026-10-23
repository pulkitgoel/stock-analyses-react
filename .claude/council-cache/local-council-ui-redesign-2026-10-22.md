# Local council — UI redesign research for stocksfundamentals.online

> **Local council** — these perspectives all come from Claude playing different roles, not from different AI vendors. Treat agreement as a shared starting point to pressure-test, not as independent confirmation.

Roles used: Devil's Advocate, Simplicity Champion, Performance Optimizer, Compliance Officer (security/scalability swapped out as poor fits for a UI question). Each member read the repo and used web search; the reports below are condensed from their hand-backs.

## Devil's Advocate
**Position:** Do not commission a redesign yet. 620 impressions / 1 click / 22 mobile impressions is noise or non-human traffic; real UI defects are small and local (card typography, nav, LCP). Fix those, add analytics, treat "mobile Indian retail" and "CTR is a UI problem" as hypotheses.
- Premise not established: 0.16% CTR on 1 click is statistically indistinguishable from 1-2%; desktop/US skew looks like rank trackers and scrapers.
- CTR is decided on the SERP; a redesign before the ~2026-11-07 re-export contaminates the only experiment (AGENTS.md: don't stack changes).
- LCP 3.3s is a perf bug: Tailwind v4 + two body gradient layers + fixed body::before grid + backdrop-filter blur(22px) on sticky header.
- Style mismatch with "Institutional-style research": emoji tag icons, text-[0.45rem]/0.5rem chips, 2rem-radius glow hero, nav = Home/About/Contact/Risk/Privacy. One-afternoon fix, not a redesign.
- References: Screener.in (sticky section-anchor row, key ratios above fold, dense tables) — copy the anchor row for the 74 long articles; ValuePickr (deliberately plain, loyal audience) — low-chrome can build trust.
- Under-exposed asset: ImpactHistory + Watchlist as a falsifiable track record; a first-screen "last N calls vs price at call" module beats any card restyle, but is SEBI-sensitive.

**Risks:** AGENTS.md invariants make every component change high blast radius; no analytics exists; Policy Pulse (199/254 articles) earns almost nothing; plain white/serif might out-trust dark glow (unresearched); wide mobile tables unsolved; did not render live site, did not fetch Tickertape/Trendlyne/Morningstar.
**Confidence:** medium.

## Simplicity Champion
**Position:** Do not redesign. The UI problem is too much decoration. Delete the hero, marketing chrome and emoji clutter; make the homepage a plain dated headline list; then wait for a month of post-title-fix Search Console data.
- HomePage: 2rem-radius hero, radial glow, "Independent research desk" pill, "LIVE LIBRARY" badge, 3-stat grid, 343x361 decorative PNG that is the mobile LCP element. Replace with h1 + one-line positioning + latest 10 headlines.
- Screener.in (fetched): no hero/promo imagery; order = name, price, about, key ratios, chart, tables; anchor-link row as section index. Copy structure, not features; no peer charts/tickers (no data pipeline).
- AnalysisCard: replace with a text row — title, `date · ticker · market`, 2-line summary; drop 0.45rem chips, emoji icons, inline onMouseOver JS.
- Mobile dock is Home/About/Mail/Risk/Privacy; should be Home/India/Global/Watchlist/Search, legal links to footer. Drop theme toggle or follow prefers-color-scheme.
- Steps: delete hero + stats grid, flatten AnalysisCard, new nav, "last updated" + disclaimer link in article head, then stop and measure.

**Risks:** read only Home/Header/AnalysisCard/main.tsx; 28 inline-style blocks in AnalysisPage and 39 in WatchlistPage unreviewed; stripping decoration may look less "premium" on a YMYL site (trust = byline, disclaimer, track record, sourced claims); Watchlist needs a data-freshness rule before polish; 22 mobile impressions shouldn't fund a mobile-first rebuild.
**Confidence:** medium.

## Performance Optimizer
**Position:** The redesign that matters is a subtraction — Screener.in-style: server-rendered text first, flat CSS, almost no effects. A visual redesign will not move CTR.
- LCP "it's the CSS" is probably incomplete (UNVERIFIED): `.animate-in` (fade-up 520ms from opacity 0, 22 usages) on hero/panels/grid; Chromium ignores opacity-0 LCP candidates; `createRoot` discards prerendered nodes so the animation restarts only after the ~971 KB raw / ~334 KB gzip bundle runs. Test: strip `animate-in` above the fold, re-run the 7.9 simulate-throttled Lighthouse; longer term `hydrateRoot`.
- Replace hero with compact masthead: one positioning line, plain "Latest" list (headline, ticker chip, date), India/Global segmented control. LCP element becomes text; hero.png goes away.
- Paint costs: backdrop-filter blur(22px) twice in Header.tsx; fixed body::before grid with mask-image; premium-card sheen pseudo-element; 70px blur shadows; translateZ(0)+isolation; onMouseOver/Out handlers to `:hover`; emoji tag icons to text; heavy inline styles to classes.
- Nav: Home/India/Global/Watchlist/Search; `/watchlist` is currently unlinked.
- Long-form: verdict/thesis/key-numbers strip from `summary`; sticky anchor-row TOC; `content-visibility: auto; contain-intrinsic-size: auto 600px` on article sections and impact `<li>`s (keeps DOM for crawlers, unlike virtualization); company-hub impact history as a compact table (date, direction chip, confidence, one-line reason).
- Less JS: lazy-load WatchlistPage, NotificationModal, AudioSummary; route-split react-markdown/remark-gfm/rehype-raw; self-host subset Inter (400/700) or system-ui, size-adjusted fallback to keep CLS 0.

**Risks:** mostly hypothesis, no Lighthouse run; challenges AGENTS.md's measured "CSS is the only lever"; desktop-vs-mobile skew likely bots/US/ranking; perf-only items are safe pre-11-07, full visual redesign should wait; must preserve one h1, no extra head tags, sync getAnalyses(), hooks above returns, crawl pages render every item; Morningstar fetch 403, only Screener verified; dark-by-default unmeasured.
**Confidence:** medium.

## Compliance Officer
**Position:** Before any visual redesign the compliance surface must change. The site publishes verdicts ("Rating: CAUTION"), support/resistance and a live-priced track record under a generic footer disclaimer, and AI authorship (`model: deepseek-*`) is mostly undisclosed. New UI that makes calls more prominent raises exposure unless disclosure becomes structural.
- Today: one generic "Not investment advice" paragraph below the article; DisclaimerPage never mentions SEBI, AI or the model; About says "clear, actionable notes ... for fast decision-making"; WatchlistPage shows verdict, gauges, priceAtAnalysis and "Since analysis" %; Footer has no disclaimer/registration/AI statement.
- Regulation (from searches, not primary texts): SEBI RA Regulations 2014 require registration for research reports; mandatory disclosures include registration no., financial interest, compensation, disciplinary history; Third Amendment (16 Dec 2024) added AI-use disclosure; no general free-blog exemption found. Treat as directional; needs a SEBI lawyer.
- Peer pattern: SEBI-registered RA sites (Nooresh Tech disclosures page, Macquarie India) — RA number, financial interest, 1% ownership, compensation, relationship, disciplinary history, grievance link, market-risk warning, explicit AI statement.
- Components: (1) byline block above the fold — author, published/updated, "Drafted with AI (model), reviewed by author" chip driven by `model:` front matter, linking to /methodology; (2) collapsible Disclosures panel (positions, compensation, registration status); (3) "Author's view on [date]; not a recommendation" next to ratings, no buy/sell colour semantics; (4) Watchlist banner on methodology/selection/survivorship, include closed calls, label quotes delayed, no "since analysis" return without exit rule; (5) label ImpactHistory "model-extracted, not verified" with source article; (6) persistent two-line footer risk strip; (7) new /methodology page; (8) corrections log.
- Privacy: DPDP Act consent needed for any analytics added; prefer cookieless analytics or build consent first.

**Risks:** CTR-optimisation (ratings on cards/SERP titles) vs SEBI safety pull opposite ways — don't put a rating on cards until a lawyer resolves the RA question; disclaimers don't cure facts; AI labelling may cost CTR but undisclosed AI on YMYL is the bigger risk; disclosures must be in prerendered HTML (`render_shell()` + article template), not client-only; risk strips must not regress LCP/CLS on 375px; unverified: whether a free unregistered individual site is outside the RA definition, the Feb 2026 Master Circular, the exact AI-disclosure wording.
**Confidence:** medium.
