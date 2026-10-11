# Handoff log

Append-only channel between the agents working on this repo: the automated agent
(Hermes) and interactive Claude Code sessions.

**It exists so the owner does not have to relay messages between us.** Everything either
agent needs from the other goes here, and both read it at the start of every session.

## How to use it

**At the start of every session, before touching anything:**

```bash
git fetch origin && git log --oneline main..origin/main   # what landed while you were away
```

then read the entries below from the top.

**Before you finish**, add an entry at the top (newest first) using the template. Keep
it short — the detail belongs in the commit message, and this is the index.

Mark anything the other agent must act on as **ACTION**, anything needing the owner as
**OWNER**, and anything you are unsure about as **UNVERIFIED**. An honest UNVERIFIED is
worth more than a confident claim that turns out wrong: three bugs this week were
caught because one of us doubted the other and measured.

Related: `AGENTS.md` section 9 (claiming work, who owns what, verifying against the
live site) and `CONTENT-PLAYBOOK.md` (titles, headings, keyword targeting).

### Template

```markdown
## YYYY-MM-DD — <who>

**Shipped:** one line each, with the commit sha.
**ACTION <other agent>:** what they need to do, and why.
**OWNER:** anything only the owner can decide.
**UNVERIFIED:** what you could not test, and what would test it.
```

---

## 2026-10-11 — Claude Code session

**Shipped**
- `df6c666` Impact history on company hubs. `scripts/lib/impact.js` parses the Policy
  Pulse impact tables into `public/impact.json` (2,288 dated calls, 258 tickers);
  `/company/{ticker}` opens with "What has moved {TICKER}".
- `df6c666` `CONTENT-PLAYBOOK.md` — titles, headings, keyword targeting, and the
  impact-table format, now that the format is load-bearing.
- `7aea356` Corrected `AGENTS.md` invariant 3.13 after getting it wrong, plus
  `/india/page/1` and `/global/page/1` redirects.

**ACTION Hermes**
- Apply the two new `location = /india/page/1` and `/global/page/1` redirect blocks
  from `docs/nginx-seo.conf`. Everything else in that file is already live.
- `df6c666` needs a deploy for the impact history to appear.

**UNVERIFIED**
- The impact parse is filtered but not audited end to end. 3,009 rows parsed, 2,288
  kept. Worth spot-checking a few tickers against their source articles before this is
  treated as reliable public data.
- `scripts/prerender-body.py` `find_chrome()` — I changed it and could not run step 7
  locally (no Playwright on this machine). It has since run on the server, so it is
  fine, but I never exercised it myself.

**OWNER**
- Still open and unchanged: analytics (no tag installed anywhere), SEBI Research
  Analyst status, and the ~7 Nov Search Console re-export against the 1-click baseline.

**Note on 3.13.** I removed a trailing `=404` from `/company/` and `/tag/` believing it
was dead code. It is not: it keeps `/index.html` in file position, and without it nginx
treats it as a URI, redirects internally and 301s ~484 hubs to the homepage. Hermes
caught it live and restored it. The rule now in 3.13 needs both halves — stripping the
terminator is as wrong as leaving the fallback on a paginated route. After changing any
`try_files` line, curl an **invalid** URL; both faults looked perfect on valid ones.
