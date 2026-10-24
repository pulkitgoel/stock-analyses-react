# Design system — stocksfundamentals.online

> **STATUS 2026-10-24: NOT IN USE. The owner reverted the site to its pre-redesign UI**
> (AGENTS.md 7.17). This spec produced a site the owner found plain, and the reason is in
> the spec itself: it was written from research whose every lens argued for removing things,
> and it encodes that as rules (no gradients, no glow, no shadows, flat). **Do not build from
> this file as written.** It is kept as a record of what was tried. Sections 2 (contrast
> figures) and 3 (the measured font fallback) remain useful as facts; the visual direction
> does not.


> **Status: specification only. Nothing here is implemented.** No component, stylesheet or
> token has been changed. This file is the target a redesign is built against, and the
> brief an agent reads before touching UI.
>
> **Before building anything from this file:** read `AGENTS.md` section 3 (invariants) and
> section 9 (claim an item first). Read `CONTENT-PLAYBOOK.md` for titles. Do not stack
> visual changes on the title/description experiment before the 2026-11-07 Search Console
> re-export (AGENTS 7.3); see "Rollout order" at the end.

Sources of the ideas, so a later reader can check them: NerdWallet (editorial hero band over
a light canvas, flat comparison tables, stat callouts), Binance (tabular numbers, price
direction as text colour only, no atmospheric gradients), Al Jazeera (flat paper, section
eyebrows, timeline rail), Mintlify (reading layout, sticky contents), PostHog and Wise
(tinted callouts, semantic colours kept separate from the brand colour), and LottieFiles'
motion-design skill (timing, easing, performance and reduced-motion tables). All from
`voltagent/awesome-design-md` and `lottiefiles/motion-design-skill`. They are unofficial
extractions: borrow the patterns, not fonts, marks or illustrations.

---

## 1. Visual theme and atmosphere

**A research desk, not a trading app.** Calm, flat, text first. A reader on a phone should
see a headline, a date and a ticker within the first screen, and nothing that looks like a
brokerage promotion.

What changes from today:

| Today | Target |
|---|---|
| Dark by default, glow hero, fixed grid, gradient body, sheen on cards | Flat surfaces, hairline borders, no decorative layers |
| 2rem-radius hero card with a 343x361 image (the mobile LCP element) | Plain masthead: one h1, one positioning line, then the latest list |
| Emoji tag icons, 0.45rem and 0.5rem chips | Text labels, 12px minimum |
| Same card for a deep dive and a daily note | Two different shapes: research card and Pulse row |
| Nav: Home / About / Contact / Risk / Privacy | Research / Daily Pulse / Watchlist / Search (section 5) |

Principles, in priority order. When two conflict, the higher one wins:

1. **Legible on a 375px phone in sunlight.** Contrast and size before atmosphere.
2. **Text is the LCP element.** No decorative image or animation above the fold (invariant 3.14, AGENTS 7.9).
3. **Two content types look different on purpose.** Deep dives are read; Pulse notes are scanned. Section 5 gives each its own shape so a reader never wonders which one they are on.
4. **Trust is structural.** Author, dates, AI disclosure and "not a recommendation" are components, not a footer paragraph.
5. **One accent colour, spent on actions and active states only.**

Reading surfaces follow the system theme (`prefers-color-scheme`), light when the browser
states no preference. There is no manual toggle. The current hard-coded dark default is
unmeasured against daylight mobile readers; treat the default as a hypothesis to A/B once
analytics exist, not a decision.

---

## 2. Colour palette and roles

All colours are CSS custom properties. Existing names are kept where they exist so the
migration is a value change, not a rename (see the mapping in the appendix).

### Light (default)

| Token | Value | Role | Contrast on its surface |
|---|---|---|---|
| `--bg` | `#ffffff` | Page canvas, cards | |
| `--bg-soft` | `#f6f7f5` | Tint behind long comparison pages, table zebra-free fills | |
| `--text` | `#0b0f14` | Headings, ticker names, figures | 19.2:1 on `--bg` |
| `--text-body` | `#3d4552` | Running prose | 9.7:1 |
| `--text-dim` | `#5b6674` | Captions, disclosures, metadata, eyebrows | 5.8:1 (5.4 on `--bg-soft`) |
| `--hairline` | `#e5e7e6` | Rules between rows, card dividers | |
| `--border` | `#d3d7d5` | Card and control outline | |
| `--accent` | `#0f766e` | Buttons, active tab, in-body navigation links | 5.5:1 on `--bg` |
| `--accent-deep` | `#0b4f4a` | Article/hub band, dark stat block | white text 9.4:1 |
| `--accent-wash` | `#effaf7` | Takeaway panel, section tint, icon tiles | accent on wash 5.1:1 |
| `--accent-wash-2` | `#d9f2ec` | Small emphasis fills, active chips | |
| `--up` | `#15803d` | Price or estimate moving up | 5.0:1 |
| `--down` | `#c62828` | Price or estimate moving down | 5.6:1 |
| `--warn` | `#b45309` | Risk callouts, stale-data flag | 5.0:1 |
| `--warn-wash` | `#fff7ed` | Fill behind a Risk callout | |
| `--link` | `#0b5cad` | Inline references, always underlined | 6.7:1 |

### Dark

| Token | Value | Contrast |
|---|---|---|
| `--bg` | `#090d12` | |
| `--bg-card` | `#121b25` | |
| `--bg-soft` | `#101720` | |
| `--text` | `#e8edf3` | 16.3:1 on `--bg` |
| `--text-body` | `#b8c3d2` | |
| `--text-dim` | `#9aa7b8` | 8.0:1 on `--bg`, 7.1 on `--bg-card` (today's `#748296` is dimmer than this; raise it) |
| `--border` / `--hairline` | `#263545` | |
| `--accent` | `#63e6be` | 11.2:1 on `--bg-card` |
| `--up` / `--down` | `#48d597` / `#ff6b6b` | 9.3:1 / 6.3:1 on `--bg-card` |
| `--accent-deep` | `#0b4f4a` | unchanged, so the band is the same in both themes |

### Rules

- **The accent is for actions and active state.** Buttons, the active tab, the sticky contents highlight, in-body navigation links. Never a large fill, never body text, never a second brand colour. (NerdWallet: green is "spent on controls".)
- **Up/down are text colours, never fills.** A direction is a coloured figure plus an arrow glyph (`▲ 4.2%`, `▼ 1.1%`). Never green or red as a card or row background, and never the only signal (colour-blind and sunlight readers). (Binance.)
- **Up/down never decorate.** If it is not a direction, it is not green or red. Buttons are never green or red because that reads as buy and sell.
- **No live-red.** Al Jazeera reserves red for live coverage. Here red already means "down", so the "Today" badge on Pulse uses `--accent-wash` with `--accent` text instead. One meaning per colour.
- **No gradients, no glow, no tinted shadows.** The only solid saturated plane on a page is the band in section 4.
- Warm accent (`--warn`) appears only on risk and staleness, never on promotion.

---

## 3. Typography rules

**One family: Inter**, 400 / 600 / 700 only, self-hosted as a subset with
`font-display: swap` and a size-adjusted fallback so CLS stays 0 (AGENTS 7.9). Fallback
stack `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`. Dropping the two Google
origins also removes a third-party request from the critical path. Do not add a second
typeface; numbers get a feature, not a font.

**All numerals are tabular:** `font-variant-numeric: tabular-nums` on tables, stat blocks,
tickers, prices and percentages. Prices that do not line up are the fastest way for a
research page to look amateur. (Binance reaches this with a numeric face; the CSS property
gets it with none.)

| Role | Mobile | Desktop | Weight | Line height | Use |
|---|---|---|---|---|---|
| Display (home h1) | 28px | 36px | 700 | 1.15 | Homepage h1 only |
| Page title (article h1) | 28px | 40px | 700 | 1.2 | The one h1 per page |
| h2 | 22px | 26px | 700 | 1.3 | Article sections |
| h3 | 18px | 20px | 600 | 1.35 | Sub-sections |
| Body | 16px | 17px | 400 | 1.6 | Prose. **Never below 16px, never tighter than 1.5** (Mintlify) |
| Lead | 18px | 20px | 400 | 1.5 | Summary under the title |
| Stat value | 24px | 28px | 700 | 1.2 | Key figures in stat blocks |
| Table | 14px | 14px | 400 | 1.45 | 13px floor on a 375px screen |
| UI label | 14px | 14px | 600 | 1.2 | Buttons, tabs, nav |
| Caption | 12px | 12px | 500 | 1.4 | Labels above figures, disclosures |
| Eyebrow | 12px | 12px | 700 | 1.2 | Uppercase, +0.06em tracking, `--text-dim` |

- **Hard floor: 12px anywhere.** No `0.45rem`, `0.5rem`, `0.68rem`. If something does not fit at 12px, remove it instead of shrinking it.
- Body stays at weight 400. NerdWallet pairs 300 body with 700 headings; 300 is thin on low-end Android panels, so keep the heading/body contrast at 700 against 400.
- Headings are `--text`, not softened.
- Uppercase is for eyebrows only. Never for headings or buttons.
- Measure: prose capped at about 68 characters (`max-width: 720px`).
- The article page has one `h1` (invariant 3.8); the renderer already maps body `h1` to `h2`.

---

## 4. Component stylings

Cards and controls are flat: 1px `--border`, no shadow, no hover transform. Hover is CSS
`:hover` only (no `onMouseOver` handlers; touch devices get nothing from them).

Radius scale: `--radius-xs` 4px (chips), `--radius-sm` 6px (buttons, inputs), `--radius` 8px
(cards, panels). Nothing larger than 8px except avatars.

### Buttons
- **Primary:** `--accent` fill, white text, 6px radius, 44px minimum height, 14px/600.
- **Secondary:** `--bg-soft` fill, `--text`, 1px `--border`.
- **Outline:** transparent, `--accent` text and 1px `--accent` border; extend the hit area to 44px on touch.
- Never pill-shaped, never green/red.

### Article band (`hero-band`)
Opens **article pages and company hubs only.** Solid `--accent-deep` (no gradient), white
headline, then immediately drops to the light canvas. It contains, in order: breadcrumb,
eyebrow (`INDIA · DEEP DIVE` or `US · PULSE`), the h1, the byline row, and the lead.
Never carried below the fold and never used on listing pages. (NerdWallet.) The h1 is text,
so it is the LCP element and paints with the first CSS.

### Byline row (inside the band)
`Pulkit Goel` · `Published 22 Oct 2026` · `Updated 22 Oct 2026` · chip:
**`Drafted with AI (deepseek-chat), reviewed by author`**. The chip is driven from the
existing `model:` front-matter field, links to `/methodology`, and is present in the
**prerendered HTML**, not injected client-side. Wording needs the owner's decision on
disclosure (AGENTS section 6) and a professional's review of the SEBI position; the layout
does not depend on the answer.

### Key-takeaway panel
`--accent-wash` fill, 8px radius, bold label `Key takeaway`, 2-4 lines of the front-matter
`summary`. Optionally hosts a **stat block**: `--accent-deep` fill, white `Stat value` figure
over a 12px caption, 2-3 per panel. Renders directly under the band.

### Research card (deep dive listing)
```
DEEP DIVE · INDIA                          <- eyebrow
Title, 2 lines max, --text, 18px/700
Two-line summary, --text-body, 14px
NALCO · 22 Oct 2026 · 14 min read          <- meta, --text-dim, 12px, tabular
```
1px `--border`, 8px radius, 16px padding. **No tag chips, no emoji, no ticker badge soup:**
at most three tickers in the meta line, the rest on the page. Hover: border `--accent`.

### Pulse row (daily note listing)
A text row, not a card. No border box; a `--hairline` rule between rows.
```
INDIA · MODI                                <- eyebrow with a 6px accent bar before it
RBI VRR squeeze: who funds the liquidity gap  <- headline, 16px/600
22 Oct · IOC · BPCL                          <- meta
```
Edition eyebrows: `INDIA · MODI`, `INDIA · MINISTRIES`, `US · TRUMP`, `US · GLOBAL`.
"Today" notes carry a `--accent-wash` badge. Title rules: `CONTENT-PLAYBOOK.md` section 2;
a title must never start with "Policy Pulse".

### Timeline rail
Used for the Pulse feed on its section page and for the company-hub impact history. A 2px
`--hairline` vertical rail on the left, a 8px dot per entry (`--accent` for the newest,
`--border` for the rest). Entry = date, then the row above. (Al Jazeera.)

### Tables (`comparison-row`)
- One `--hairline` rule between rows, **no vertical dividers**, no zebra, no cell borders.
- Header: 12px/700 uppercase `--text-dim`, rule beneath.
- Numerals tabular and right-aligned; labels left-aligned and 24ch max.
- Prose tables inside articles keep today's `.table-scroll` box with the sticky first column. Do not change that mechanism.
- Below 425px, the **impact history** and the **watchlist** reflow each row into a stacked card (label above figure, caption 12px). Do not stack the 23 prose tables per article; that is a page-length cost with no benefit.
- Impact history is a compact table, not tall cards: `Date | Direction | Confidence | One-line reason`. Direction is `▲`/`▼` plus text colour; confidence keeps today's dots; the "inferred" flag stays; add `model-extracted, not verified` as a caption and link the source article per row.

### Direction and verdict labels
- Direction chip: arrow + word (`▲ Positive`), `--up`/`--down` text on `--bg`, 4px radius, 1px `--border`.
- A verdict shown anywhere carries its date and the line `Author's view on 22 Oct 2026. Not a recommendation.` adjacent, in `--text-dim`.
- **No verdict badge on listing cards or in titles** until the SEBI Research Analyst question is resolved by a professional. Use the finding instead ("Q1 PAT +111%, volumes -22%").

### Callouts
Tip / Info / Risk panels inside article bodies only (PostHog): 8px radius, 3px left rule,
`--accent-wash` for tip and info, a `--warn` wash for risk. Never used as marketing fills.

### Contents (long articles, 10+ headings)
Desktop: sticky left column, active heading in `--accent`. Mobile: a single sticky row of
anchor links (Summary, Thesis, Numbers, Risks, ...) replacing the collapsed `<details>`.
Section anchors stay in the prerendered HTML (existing `toc.ts` behaviour).

### Disclosure strip and footer
A persistent two-line strip above the footer on every page type: `Educational research, not
investment advice. AI-assisted drafting. [Registration status]`, linking Disclaimer,
Methodology and Grievance contact. Static markup, no web font, no layout shift on a 375px
viewport. Footer holds About, Contact, Risk, Privacy, Disclaimer.

### Navigation
- Top bar (desktop): wordmark, `Research`, `Daily Pulse`, `Watchlist`, search. Opaque `--bg` with a `--hairline` bottom rule; **no `backdrop-filter`.**
- Mobile bottom bar: `Research`, `Pulse`, `Watchlist`, `Search` with text labels beside icons. Opaque. Legal pages leave the bar for the footer.
- India / US switch: a two-option segmented control at the top of Research and of Daily Pulse. Maps onto the existing `market` field (`india`/`global`) and the four Pulse editions.

---

## 5. Layout principles

### Information architecture

Type is the primary axis, market the secondary one. A reader decides first whether they
want a briefing or a company; India or US is a filter on that.

```
/                 Masthead + "Latest research" (5) + "Today's Pulse" (10)
Research          deep dives only, India/US switch      (new route family)
Daily Pulse       Pulse notes only, India/US switch     (new route family)
Watchlist         track record
/india, /global   unchanged, still live and in the sitemap
```

The homepage drops the shared category tab bar and shows both blocks, each with its own
card shape. New routes need nginx location blocks and prerender entries (AGENTS 9.4); this
spec does not add them.

### Grid, spacing, container
- Base unit 4px. Tokens: 4, 8, 12, 16, 24, 32, 48, 64.
- Container 1120px; article reading column 720px; 16px side gutter on phones, no horizontal page scroll.
- Section rhythm 48px mobile, 64px desktop. Tight inside components (8-16px), generous between them. Separation comes from whitespace and `--accent-wash` bands, not from borders on every block.
- Article layout at 1200px+: 220px contents / 720px prose. Below 1200: single column.

### Page rhythm
- **Article / hub:** band, lead, takeaway panel, prose, disclosure block, related research.
- **Home / Research / Pulse:** flat headline lists straight away; the first screen shows real headlines.

---

## 6. Depth, elevation and motion

**Depth:** none. Cards carry a 1px border, not a shadow. The single permitted shadow is one
faint overlay shadow (`0 8px 24px rgba(11,15,20,0.12)`) on dropdowns and the notification
modal. Removed outright: `--shadow-soft`/`--shadow-card`, the fixed `body::before` grid with
`mask-image`, the card sheen pseudo-element, `translateZ(0)` plus `isolation` on cards,
`backdrop-filter: blur(22px)` on both bars.

**Motion** follows the LottieFiles skill's *Financial* row: Corporate personality, 250-500ms,
low density. In practice, for a text-first research site that means very little.

| Allowed | Spec |
|---|---|
| Disclosure/accordion open, contents drawer | 200ms, `cubic-bezier(0.2, 0, 0, 1)` (entrance), exit 65-75% of that |
| Hover and focus feedback on controls | 120ms, colour/border only |
| Anchor-link scroll | native `scroll-behavior`, off under reduced motion |

| Forbidden | Why |
|---|---|
| Entrance animation (`animate-in`, fade-up from opacity 0) on anything above the fold or on the LCP element | Chromium ignores opacity-0 LCP candidates; React `createRoot` replays the animation after the bundle runs (Performance review, UNVERIFIED but cheap to test). Spinner-over-prerender is the same defect (3.14) |
| Parallax, large zooms, spinning, continuous ambient loops, auto-playing anything | Vestibular triggers and wasted paint; "appropriate on the 100th viewing" fails |
| Animating `box-shadow`, `border-radius`, `filter`, width or height | Layout/paint cost; only `transform` and `opacity` |
| Lottie or any animation runtime | Adds JS to a site that is trying to shrink its 334 KB gzip bundle; no content needs it |
| Colour-only flashes for price change | Not accessible; a figure update is a text change |

Rules: same interaction, same motion, every time; important state changes use a text/icon
change, not motion alone; `@media (prefers-reduced-motion: reduce)` removes all
non-essential transitions and `scroll-behavior`. Keep fewer than 20 animated elements per
viewport (in practice, under 5). If a below-the-fold block ever does enter with a fade, it
is 250ms ease-out, opacity plus 8px `translateY`, never the hero.

---

## 7. Do's and don'ts

### Do
- Put real headlines, a ticker and a date in the first mobile viewport.
- Spend `--accent` on actions and active states only.
- Render every figure with tabular numerals, a 12px caption above it, and a direction glyph beside any change.
- Give each page type its own shape: research card, Pulse row, timeline entry.
- Open article pages with the band, then drop to the light canvas.
- Put author, dates, the AI-disclosure chip and "not a recommendation" where a reader sees them without scrolling to the bottom, in the **prerendered** HTML.
- Keep contrast at 4.5:1 or better for any text, 3:1 for borders that carry meaning.
- Use `content-visibility: auto; contain-intrinsic-size: auto 600px` on long article sections and impact rows (keeps the DOM for crawlers).
- Give every crawl-oriented listing `initialCount` equal to its item count (invariant 7.5).

### Don't
- Don't add a hero image, glow, gradient, grid, blur, sheen or entrance animation. The mobile LCP element must be text.
- Don't use emoji as UI icons.
- Don't set anything under 12px.
- Don't fill a card or row green or red, or use either colour for a button.
- Don't introduce a second accent colour or a second typeface.
- Don't put a rating, verdict or `CAUTION`-style badge on a listing card or in a title until the RA question is settled.
- Don't show "since analysis" returns without a stated exit rule, a delayed-quote label and closed calls (Watchlist).
- Don't use buy/sell colour semantics on support/resistance gauges.
- Don't emit `<title>`, canonical, description, Open Graph or JSON-LD from a component (invariants 3.1-3.3); the prerender owns them. A second `h1`, a hook below an early return, a `loading` spinner over prerendered content, a site-name title suffix: all regressions listed in AGENTS section 3.
- Don't add a Lottie runtime, a charting library or a virtualisation library for this redesign.

---

## 8. Responsive behaviour

Breakpoints: 375 · 425 · 640 · 768 · 1024 · 1280.

| Width | Changes |
|---|---|
| < 425 | One column. Bottom bar nav. Impact history and watchlist rows stack as cards. Band h1 28px. Contents is a sticky anchor row. |
| 425-639 | One column; stat blocks 2-up; India/US switch full width. |
| 640-767 | Two-up research cards; Pulse stays a single list. |
| 768-1023 | Top nav returns; contents moves to a drawer; table columns begin to drop priority (confidence first). |
| 1024-1279 | Full tables; two-column article with contents above prose. |
| >= 1280 | 220 / 720 article layout with sticky contents; 1120 container. |

- Touch targets 44x44 (outline buttons and icon buttons get extended hit areas).
- Tables never force a page-level horizontal scroll: prose tables scroll inside `.table-scroll`; dashboards stack.
- Images (rare in this system) carry intrinsic `width`/`height`; none sit above the fold.
- Mobile reduces motion distance and duration (0.8x) and disables any stagger.
- Verify every page type at 375px **in a browser**; `tsc` and `vite build` pass on components that render nothing (AGENTS 3.12).

---

## 9. Agent prompt guide

### Quick reference
- Surface `#ffffff`, tint `#f6f7f5`, ink `#0b0f14`, body `#3d4552`, dim `#5b6674`
- Accent `#0f766e` (actions only), band `#0b4f4a`, wash `#effaf7`
- Up `#15803d`, down `#c62828` (text only), warn `#b45309`, link `#0b5cad`
- Inter 400/600/700, body 16px/1.6, floor 12px, tabular numerals
- Radius 6 / 8, 1px borders, no shadows, no gradients, no entrance animation above the fold

### Example prompts
- *Research card:* "Build a ResearchCard: eyebrow `DEEP DIVE · INDIA` (12px/700 uppercase, `--text-dim`), 18px/700 title max two lines, 14px two-line summary, meta row `TICKER · date · N min read` at 12px tabular. 1px `--border`, 8px radius, 16px padding, no shadow, no chips, no emoji. Hover changes the border to `--accent` via CSS only."
- *Pulse row:* "Build a PulseRow as a text row: eyebrow with a 6px accent bar (`INDIA · MODI`), 16px/600 headline, meta `22 Oct · IOC · BPCL`. Separate rows with a `--hairline` rule. A `Today` badge uses `--accent-wash`, never red."
- *Article band:* "Build ArticleBand on `--accent-deep`, white text, no gradient: breadcrumb, eyebrow, the single h1, byline row (author, published, updated, AI-disclosure chip linking to /methodology), lead. It must render in the prerendered HTML and add no entrance animation."
- *Impact history:* "Render the impact history as a compact table `Date | Direction | Confidence | Reason` with hairline row rules, `▲/▼` plus text colour, tabular numerals, a `model-extracted, not verified` caption and a source link per row. Below 425px each row becomes a stacked card."
- *Check before finishing:* open the page at 375px, confirm one `h1`, no console errors, text as LCP, no element under 12px, and that no `backdrop-filter`, `animate-in` or `onMouseOver` survived.

---

## Appendix A. Token migration map (current `src/index.css` to target)

| Current | Target |
|---|---|
| `--bg #090d12` (dark default) | `--bg` per theme; light `#ffffff`, dark `#090d12` |
| `--bg-elevated`, `--bg-card`, `--bg-card-hover` | `--bg` / `--bg-soft` / `--bg-card`; drop the hover token |
| `--surface-soft`, `--surface-strong` | `--bg-soft`, `--accent-wash` |
| `--border`, `--border-light` | `--hairline`, `--border` |
| `--text`, `--text-muted`, `--text-dim` | `--text`, `--text-body`, `--text-dim` (dark dim raised to `#9aa7b8`) |
| `--accent #63e6be` / light `#0f766e` | unchanged in meaning; actions only |
| `--accent-strong`, `--accent-warm`, `--yellow` | removed; `--warn` for risk |
| `--accent-glow`, `--shadow-soft`, `--shadow-card`, `--header-bg` | removed |
| `--green` / `--red` | `--up` / `--down` |
| `--radius 18px`, `--radius-sm 12px` | 8px / 6px |

## Appendix B. Rollout order (when the owner approves building)

Ordered by risk, so each step can ship alone and be reverted alone. Claim in `HANDOFF.md`
and `AGENTS.md` 7.x first (9.1), push small (9.3), and verify live (9.5).

1. **Subtractions only, no head or content change:** remove `animate-in` above the fold, `backdrop-filter`, the grid/sheen/translateZ layers, emoji icons, inline hover handlers; raise every sub-12px size to 12px. Re-run the 7.9 Lighthouse harness (`--throttling-method=simulate`) to test the opacity-0/LCP hypothesis. Safe before 2026-11-07; touches no title, description or heading.
2. **Tokens and typography:** values from section 2-3, self-hosted Inter subset, tabular numerals.
3. **Nav and homepage:** Research / Daily Pulse / Watchlist, plain masthead, flat lists. Needs nginx blocks and prerender entries for new routes (9.4).
4. **Cards:** ResearchCard and PulseRow replace `AnalysisCard`.
5. **Article band, byline, disclosure strip, methodology page.** Gated on the owner's decisions about AI disclosure and the SEBI position (AGENTS section 6).
6. **Watchlist and impact-history tables**, with the freshness and survivorship rules from section 4.

Not measured: every expected gain here is a hypothesis. There is no analytics tag yet
(AGENTS 7.3), so install a cookieless one before step 3 or none of this can be judged.
