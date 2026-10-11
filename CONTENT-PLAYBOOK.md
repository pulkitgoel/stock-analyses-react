# Content playbook — titles, headings and keyword targeting

Rules for the agent when writing or retitling an article. `AGENTS.md` governs the
build, the routing and the invariants; this file governs **what gets written and what
it is called**.

Read this before drafting a title. The title is the one part of an article that has to
do a job before anyone has read a word of it.

---

## 1. What this site is for

Two things, and neither is news or data:

- **Deep dives.** Precise, free, long-form analysis of a company — the kind the owner
  could not find free and precise anywhere as a trader and investor.
- **Geopolitics to portfolio.** Daily policy and macro coverage whose point is the
  mapping: *this event, these tickers, this direction, this confidence.*

Moneycontrol publishes what happened. Screener publishes the numbers. Neither publishes
the causal link between them, dated, with a confidence score attached. That link is the
product.

**Never write to fill a slot.** If an edition has no real second-order read, it is
better unpublished than published thin.

---

## 2. The title rule

A title has to carry the claim, not the container.

**Bad — describes the container:**
```
Policy Pulse - Global Spillover - 08 Oct 2026
```
Says nothing anyone searches for. The first 15 characters are identical across 184
articles, and the differentiator sits exactly where Google truncates.

**Good — carries the claim:**
```
Brent tops $104 as Pentagon readies Iran options — what it does to IOC, BPCL, IndiGo
```

The test: **would someone who has never heard of this site click it from a results
page?** If the title only makes sense to a daily reader, rewrite it.

### Mechanics

| Rule | Why |
|---|---|
| Under **60 characters** where possible, hard ceiling **70** | Google truncates around 60. 246 of 250 titles once exceeded it and every result rendered clipped. |
| **No site-name suffix** | ` — stocksfundamentals.online` is 28 characters of nothing. `AGENTS.md` invariant 3.4. |
| Lead with the **subject or the number** | "Brent tops $104…" beats "Policy Pulse — Global…". Front-load what is searched. |
| Name the **affected tickers** when there are three or fewer | "…what it does to IOC, BPCL, IndiGo" matches how people search. |
| One canonical **series name**, forever | The Trump beat shipped under three names and Ministries under four, so Google could not form a series entity. |

---

## 3. Target the question, not the topic

Write the title as the question a reader types. Their searches look like:

- `how will rising crude affect Indian paint stocks`
- `which Indian stocks benefit from crude above 100`
- `IndiGo fuel cost impact`
- `Iran conflict impact on Indian stock market`
- `GST council decision which stocks benefit`
- `[COMPANY] share price target 2026`
- `[COMPANY] fundamental analysis`
- `[COMPANY] promoter pledge`

Notice the shape: **event + sector/stock + impact.** That is exactly what the impact
tables already contain. The content exists; it is the titles that do not match.

### What not to chase

Queries whose answer is a current number — live price, market cap, P/E, today's FII/DII
figure. A database beats prose on freshness and coverage every time, and these are
Screener's and Trendlyne's home ground. Writing for them wastes the effort.

### Where the wins are

**Event-driven, second-order, 2-4 days after the event.** Not the announcement — the
arithmetic nobody else did.

The proof already exists in the archive: on *"Yatharth Advent 24.87% stake"*, nine of
nine results restated the press release. **Not one did the dilution maths. This site
did.** That is the repeatable formula.

---

## 4. Headings

Headings are a second set of entry points, and on a long deep dive they become the
table of contents.

- **One `h1` per page**, which is the article title. Do not open the body with a
  repeat `# Title` — 106 articles did, and the renderer now demotes it
  (`AGENTS.md` 3.8).
- Start sections at `h2`. Never skip a level.
- **Write headings as the question or the finding**, not as a label:
  - Weak: `Financial Performance`
  - Better: `Revenue up 52%, net profit flat for five quarters`
  - Weak: `Valuation`
  - Better: `What has to be true to justify ₹985`
- Keep them under ~70 characters so the contents list stays readable.
- A long deep dive wants 6-12 `h2` sections. Fewer reads as a wall; more fragments.

---

## 5. The impact table is the asset — keep it rigorous

Roughly 2,300 dated calls across 258 tickers have been extracted from these tables and
now drive the "What has moved {TICKER}" section on every company hub. The format is
load-bearing, so keep it exactly:

```markdown
| Stock | Impact | Reason | Confidence |
|---|---|---|---|
| ASIANPAINT, MRF | 🔴 Negative | ⚠️ inferred. Crude derivatives are the primary input cost for paints and tyres | 3/5 |
```

Non-negotiables:

- **Tickers comma-separated**, exchange symbols only. No index names (NIFTY, SENSEX) in
  the Stock column — they are filtered out as non-companies.
- **Direction** must read Positive, Negative or Watch.
- **Reason** must be a real sentence of at least five words that states the mechanism.
  Rows shorter than that are dropped by the parser.
- **Confidence `n/5`** on every row. Only 704 of 3,009 parsed rows had one, which is
  the single biggest quality gap in the dataset.
- **Mark deductions `⚠️ inferred.`** at the start of the reason. The honesty is the
  differentiator; it is what makes the confident rows mean anything.

Cap the `ticker:` frontmatter at **~8 tickers the article genuinely discusses**. The
average was 17.3 and one article listed 118. Every ticker is a candidate hub, so long
lists manufacture thin pages.

---

## 6. Frontmatter that affects search

```yaml
title: "..."      # under 60 chars, carries the claim, no site suffix
summary: "..."    # see below
date: "YYYY-MM-DD"
updated: "..."    # only on genuine revision; becomes dateModified
market: india|global   # usually auto-derived; set it when ambiguous
tags: [...]       # 5+ articles on a tag earns it a hub at /tag/{slug}
```

**`summary` is the meta description.** Its first ~155 characters are what appears in
search results and in every WhatsApp and X share. So:

- Make the **first sentence stand alone** and carry the finding. It will be cut.
- Lead with the number or the claim, not with context.
- Write it for someone deciding whether to click, not for someone already reading.

---

## 7. YMYL — this is financial content

Higher bar than an ordinary blog, and it is also where the trust gap sits.

- **Link the sources named in prose.** 226 of 254 articles name a source; 10 link to
  one. A named-but-unlinked source is not verifiable.
- Keep the **inference discipline** — the `⚠️ inferred` markers and confidence scores
  are genuinely above market standard. Do not quietly drop them for a cleaner look.
- Price levels **decay**. Any article carrying support/resistance needs an "as of" date
  visible, and `updated:` set when revised.
- **Do not add credentials, ratings or review markup** that cannot be substantiated.

Two things only the owner can decide, flagged in `AGENTS.md` section 6 — AI-generation
disclosure and SEBI Research Analyst status. Do not resolve either in an article.

---

## 8. Before publishing — check

1. Title under 60 characters, carries a claim, no site suffix.
2. Would a stranger click it from a results page?
3. Summary's first sentence stands alone and states the finding.
4. One `h1`; headings are findings, not labels.
5. Impact table complete — confidence on every row, inferred marked, no index tickers.
6. `ticker:` capped at the companies actually discussed.
7. Named sources linked.
8. `npm run build` passes, then open the page (`AGENTS.md` 3.12 — a clean build proves
   nothing about what renders).
