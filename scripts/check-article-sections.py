#!/usr/bin/env python3.12
"""Check that a deep dive has the sections a deep dive is supposed to have.

The regression this exists for, measured on 2026-10-25:

  Apollo (June)  16 sections: business overview, annual P&L, 13-quarter trend,
                 balance sheet, cash flow, shareholding, order book, management
                 commentary, technical, delivery, bulk/block, forward PE with EPS
                 history, risks, Screener pros/cons, bull vs bear, verdict.
  Tega (Oct)     11 sections, 6,854 words - the words are there, the reference
                 tables are not: no business overview, no annual history, no cash
                 flow, no shareholding, no order book, no valuation table.
  NALCO (Oct)    14 sections with a thinner oscillator panel than the template.

Word count alone cannot see this, which is why check-article-shrink let both pass.
A section is "present" when a heading OR a body phrase covers it, so an article
can satisfy it without copying a heading verbatim.

Usage:
  check-article-sections.py           # only articles changed against HEAD
  check-article-sections.py --all     # audit the whole corpus (advisory)
  check-article-sections.py --file X  # one file
Exit 1 when a changed deep dive is missing sections; ALLOW_THIN=1 overrides.
"""
from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

ARTICLE_DIR = Path("public/analyses")

# (label, regex). The regex runs against the body with headings included.
REQUIRED = [
    ("business overview", r"business (overview|model)|what the company does|how it makes money"),
    ("annual financial history", r"annual (p&l|financials?|performance)|five[- ]year|FY2\d.{0,40}FY2\d"),
    ("balance sheet", r"balance sheet"),
    ("cash flow", r"cash flow|operating cash"),
    ("shareholding", r"shareholding|promoter holding"),
    ("order book", r"order book|revenue visibility|backlog"),
    ("management commentary", r"management commentary|earnings call|con ?call|transcript"),
    ("technical analysis", r"technical (analysis|picture)|moving average|oscillator"),
    ("delivery data", r"delivery"),
    ("valuation", r"valuation|forward p/?e|price to earnings|P/E"),
    ("key risks", r"key risks|## risks|the risks"),
    ("screener pros and cons", r"screener\.in pros|pros and cons|pros & cons"),
    ("bull and bear case", r"bull case|bear case|bull vs bear|bull and bear"),
    ("25-point checklist", r"25-point|swing trading checklist"),
    ("verdict", r"## verdict|final verdict"),
    ("sources", r"## sources|sources:|data notes"),
]

# A deep dive's technical panel should carry the oscillator set the older
# articles had. NALCO shipped four (RSI, MACD, ATR, ADR) against Apollo's seven.
OSCILLATORS = ["rsi", "stochastic", "cci", "adx", "macd", "momentum"]

# Files that are deliberately not full deep dives.
NOT_A_DEEP_DIVE = re.compile(r"policy-pulse|market-mood|weekly|ipo-|block-deal", re.I)


def is_deep_dive(path: Path, text: str) -> bool:
    if NOT_A_DEEP_DIVE.search(path.name):
        return False
    head = text[:600].lower()
    return "ticker:" in head and "deep-dive" in head


def changed_files() -> list[Path]:
    try:
        out = subprocess.run(
            ["git", "diff", "--name-only", "HEAD", "--", str(ARTICLE_DIR)],
            capture_output=True, text=True, check=True).stdout.split()
        untracked = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard", "--", str(ARTICLE_DIR)],
            capture_output=True, text=True, check=True).stdout.split()
    except (subprocess.CalledProcessError, FileNotFoundError, OSError):
        return []
    names = set(out) | set(untracked)
    return [Path(n) for n in sorted(names) if n.endswith(".md") and Path(n).exists()]


def audit(path: Path) -> tuple[list[str], list[str]]:
    text = path.read_text()
    # Numbered headings ("## 14. Verdict") must match the same patterns as
    # unnumbered ones ("## Verdict"); the older articles use both.
    body = re.sub(r"(?m)^#+\s*\d+(?:\.\d+)*\.?\s*", "## ", text).lower()
    missing = [label for label, pattern in REQUIRED if not re.search(pattern, body, re.I)]
    absent_osc = [name.upper() for name in OSCILLATORS
                  if not re.search(rf"\b{name}\b", body)]
    return missing, absent_osc


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--file")
    args = ap.parse_args()

    if args.file:
        targets = [Path(args.file)]
    elif args.all:
        targets = sorted(ARTICLE_DIR.glob("*.md"))
    else:
        targets = changed_files()

    failures = []
    for path in targets:
        text = path.read_text()
        if not is_deep_dive(path, text):
            continue
        missing, absent_osc = audit(path)
        if missing or (absent_osc and "technical analysis" not in missing):
            failures.append((path, missing, absent_osc))

    if not failures:
        print(f"check-article-sections: {len(targets)} file(s) checked, "
              "no deep dive is missing sections")
        return 0

    print("check-article-sections: these deep dives are missing sections", file=sys.stderr)
    for path, missing, absent_osc in failures:
        print(f"  - {path.name}", file=sys.stderr)
        if missing:
            print(f"      missing: {', '.join(missing)}", file=sys.stderr)
        if absent_osc:
            print(f"      technical panel lacks: {', '.join(absent_osc)}", file=sys.stderr)

    if os.environ.get("ALLOW_THIN") == "1":
        print("check-article-sections: ALLOW_THIN=1 set, continuing", file=sys.stderr)
        return 0

    print("check-article-sections: a deep dive carries the reference sections, not just "
          "the narrative. Restore them, or set ALLOW_THIN=1 and say why.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
