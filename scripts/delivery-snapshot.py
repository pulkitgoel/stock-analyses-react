#!/usr/bin/env python3.12
"""Delivery percentage for the last N sessions, from NSE bhavcopy.

Delivery data is the difference between a price move someone paid for and one
that was intraday noise. The article quotes the last few sessions and the
average, so the script prints both rather than a single day's number.

Usage: delivery-snapshot.py SKYGOLD [--days 15]
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import sys
import urllib.request
from datetime import datetime, timedelta

HEADERS = {"User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36")}


def fetch(url: str) -> bytes | None:
    try:
        request = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(request, timeout=20) as response:
            return response.read()
    except Exception:
        return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("symbol")
    ap.add_argument("--days", type=int, default=15)
    args = ap.parse_args()

    today = datetime.utcnow()
    rows = []
    for offset in range(args.days * 2):
        day = (today - timedelta(days=offset)).strftime("%Y-%m-%d")
        stamp = datetime.strptime(day, "%Y-%m-%d").strftime("%d%m%Y")
        body = fetch("https://archives.nseindia.com/products/content/"
                     f"sec_bhavdata_full_{stamp}.csv")
        if not body:
            continue
        for raw in csv.DictReader(io.StringIO(body.decode("utf-8", "replace"))):
            row = {(k or "").strip(): (v or "").strip() for k, v in raw.items()}
            if row.get("SYMBOL") == args.symbol and row.get("SERIES") == "EQ":
                try:
                    rows.append({
                        "date": day,
                        "close": float(row["CLOSE_PRICE"]),
                        "qty": float(row["TTL_TRD_QNTY"].replace(",", "")),
                        "deliv_qty": float(row["DELIV_QTY"].replace(",", "")),
                        "deliv_pct": float(row["DELIV_PER"].replace(",", "")),
                    })
                except (KeyError, ValueError):
                    pass
                break
        if len(rows) >= args.days:
            break

    rows.sort(key=lambda r: r["date"])
    if not rows:
        sys.exit("delivery: no sessions found")
    average = sum(r["deliv_pct"] for r in rows) / len(rows)
    print(json.dumps({"symbol": args.symbol, "sessions": len(rows),
                      "avg_deliv_pct": round(average, 1),
                      "latest": rows[-1], "series": rows[-8:]}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
