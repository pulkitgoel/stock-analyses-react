#!/usr/bin/env python3.12
"""Build the multibagger radar universe: Indian mid, small and micro caps only.

The three NSE index constituent files are the definition. Using them instead of a
market-cap cut has two advantages: the bands are the exchange's own, and a company
that graduates or drops out is visible as an index change rather than silently
drifting across a threshold we invented.

Output: radar/universe.json — symbol, name, industry, band, and the ISIN.
"""
from __future__ import annotations

import csv
import io
import json
import sys
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "radar" / "universe.json"

BANDS = {
    "midcap": ("ind_niftymidcap150list", "mid"),
    "smallcap": ("ind_niftysmallcap250list", "small"),
    "microcap": ("ind_niftymicrocap250_list", "micro"),
}
BASE = "https://archives.nseindia.com/content/indices/{}.csv"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def fetch(name: str) -> list[dict]:
    request = urllib.request.Request(BASE.format(name), headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=30) as response:
        text = response.read().decode("utf-8", errors="replace")
    return list(csv.DictReader(io.StringIO(text)))


def main() -> int:
    rows, seen = [], set()
    for band, (name, label) in BANDS.items():
        try:
            members = fetch(name)
        except Exception as exc:
            print(f"radar-universe: {band} failed: {exc}", file=sys.stderr)
            continue
        for member in members:
            symbol = (member.get("Symbol") or "").strip().upper()
            if not symbol or symbol in seen:
                continue
            seen.add(symbol)
            rows.append({
                "symbol": f"NSE:{symbol}",
                "code": symbol,
                "name": (member.get("Company Name") or "").strip(),
                "industry": (member.get("Industry") or "").strip(),
                "isin": (member.get("ISIN Code") or "").strip(),
                "band": label,
            })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"generated": __import__("datetime").date.today().isoformat(),
                               "count": len(rows), "rows": rows}, indent=1))
    counts = {}
    for row in rows:
        counts[row["band"]] = counts.get(row["band"], 0) + 1
    print(f"radar-universe: {len(rows)} companies {counts} -> {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
