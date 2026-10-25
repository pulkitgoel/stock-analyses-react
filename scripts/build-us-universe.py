#!/usr/bin/env python3.12
"""Build public/universe-us.json from NASDAQ Trader's official symbol directory.

Source is the exchange's own published files, not a scrape: nasdaqlisted.txt covers
NASDAQ, otherlisted.txt covers NYSE and NYSE American. Both are pipe-delimited and
regenerated daily by Nasdaq Trader.

Kept as a SEPARATE file from universe.json on purpose: generate-universe.js rebuilds
the Indian universe from NSE's lists and would delete anything merged into that file.

Excludes, deliberately:
  * ETFs, test issues, NextShares
  * warrants, rights, units, preferreds, notes, bonds, depositary receipts - all
    tradeable, none a company a research request should create
  * symbols containing $ or . (preferred and class variants)
  * NYSE Arca / Cboe / IEX listings (mostly ETF cross-listings)
"""
import csv
import json
import re
import sys
import time
from pathlib import Path

OUT = Path("/var/www/stock-analyses-react/public/universe-us.json")
NASDAQ = Path("/tmp/nasdaqlisted.txt")
OTHER = Path("/tmp/otherlisted.txt")

BAD = re.compile(
    r"\b(warrant|warrants|right|rights|unit|units|preferred|preference|depositary|"
    r"notes?|bonds?|debenture|subordinated|%)\b",
    re.I,
)
TAIL = re.compile(r"\s+(Common Stock|Ordinary Shares|Class [A-Z] (Common Stock|Ordinary Shares)|"
                  r"American Depositary Shares|Registered Shares|Common Shares)\.?$", re.I)


def clean(name: str) -> str:
    name = TAIL.sub("", name.strip())
    name = re.sub(r"\s*[-–]\s*$", "", name)          # the directory suffixes names with " - "
    name = re.sub(r"\s{2,}", " ", name)
    return name.strip(" ,-")


def ok_symbol(sym: str) -> bool:
    """Class shares like BRK.B are common stock and stay; other dotted forms do not."""
    if not sym or not sym.isupper() or len(sym) > 7:
        return False
    if "$" in sym:
        return False
    if "." in sym:
        return bool(re.fullmatch(r"[A-Z]{1,5}\.[A-Z]", sym))
    return True


rows = []

with NASDAQ.open(newline="", encoding="utf-8") as fh:
    for r in csv.DictReader(fh, delimiter="|"):
        if r.get("Symbol", "").startswith("File Creation"):
            continue
        if r.get("Test Issue") != "N" or r.get("ETF") != "N" or r.get("NextShares") != "N":
            continue
        sym = (r.get("Symbol") or "").strip()
        name = (r.get("Security Name") or "").strip()
        if not ok_symbol(sym) or BAD.search(name):
            continue
        rows.append([sym, clean(name), "main", "", "NASDAQ"])

with OTHER.open(newline="", encoding="utf-8") as fh:
    for r in csv.DictReader(fh, delimiter="|"):
        if (r.get("ACT Symbol") or "").startswith("File Creation"):
            continue
        if r.get("Test Issue") != "N" or r.get("ETF") != "N":
            continue
        if r.get("Exchange") not in ("N", "A"):
            continue
        sym = (r.get("ACT Symbol") or "").strip()
        name = (r.get("Security Name") or "").strip()
        if not ok_symbol(sym) or BAD.search(name):
            continue
        market = "NYSE" if r.get("Exchange") == "N" else "AMEX"
        rows.append([sym, clean(name), "main", "", market])

# One row per (market, symbol); a symbol can appear on both venues only as a mistake.
seen, unique = set(), []
for row in rows:
    key = (row[4], row[0])
    if key in seen:
        continue
    seen.add(key)
    unique.append(row)
unique.sort(key=lambda r: (r[4], r[0]))

payload = {
    "v": 1,
    "generated": time.strftime("%Y-%m-%d"),
    "source": "NASDAQ Trader Symbol Directory (nasdaqlisted.txt + otherlisted.txt), "
              "common stock only, NYSE and NYSE American plus NASDAQ",
    "cols": ["sym", "name", "tier", "industry", "market"],
    "rows": unique,
}
OUT.write_text(json.dumps(payload, separators=(",", ":")))
by_market = {}
for r in unique:
    by_market[r[4]] = by_market.get(r[4], 0) + 1
print(f"wrote {OUT} — {len(unique)} rows, {OUT.stat().st_size} bytes")
print("by market:", by_market)
print("samples:", unique[:3], unique[-2:])
