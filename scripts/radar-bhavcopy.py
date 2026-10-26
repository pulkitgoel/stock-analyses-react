#!/usr/bin/env python3.12
"""Build the backtest price history from NSE bhavcopy instead of Yahoo.

Yahoo throttled this server's address after a 655-symbol pull, and it is the
wrong source for a backtest anyway: the exchange file is the settlement record.
One bhavcopy file per trading day carries every listed symbol, so a weekly
sample of files gives the whole universe at once.

Weekly closes are an approximation, stated plainly: the 200-day average becomes
a 40-week average, the 52-week high is the last 52 weekly closes, and the
six-month return is 26 weeks. For ranking names against each other that is
adequate; it is not a tick-level reconstruction.

Usage: radar-bhavcopy.py [--from 2018-06-01] [--to 2025-08-01]
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UNIVERSE = ROOT / "radar" / "universe.json"
CACHE = ROOT / "radar" / "history"
INDEX_CACHE = ROOT / "radar" / "index"
PROXY = "https://nse-proxy.pulkitgoel28.workers.dev"

HEADERS = {"User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"),
           "Accept": "text/csv,*/*"}


def fetch(url: str, timeout: int = 30) -> bytes | None:
    for attempt in range(3):
        candidate = url if attempt == 0 else PROXY + "/?url=" + urllib.parse.quote(url, safe="")
        try:
            request = urllib.request.Request(candidate, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.read()
        except Exception:
            continue
    return None


def fridays(start: str, end: str) -> list[str]:
    day = datetime.strptime(start, "%Y-%m-%d")
    last = datetime.strptime(end, "%Y-%m-%d")
    # move to the first Friday
    day += timedelta(days=(4 - day.weekday()) % 7)
    out = []
    while day <= last:
        out.append(day.strftime("%Y-%m-%d"))
        day += timedelta(days=7)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="start", default="2018-06-01")
    ap.add_argument("--to", dest="end", default=datetime.utcnow().strftime("%Y-%m-%d"))
    args = ap.parse_args()

    CACHE.mkdir(parents=True, exist_ok=True)
    INDEX_CACHE.mkdir(parents=True, exist_ok=True)
    wanted = {r["code"] for r in json.loads(UNIVERSE.read_text())["rows"]}
    dates = fridays(args.start, args.end)
    print(f"bhavcopy: {len(dates)} weekly samples, {len(wanted)} symbols")

    series: dict[str, list[list]] = {s: [] for s in wanted}
    index_series: list[list] = []
    got = missing = 0

    def grab(date: str):
        stamp = datetime.strptime(date, "%Y-%m-%d").strftime("%d%m%Y")
        body = fetch("https://archives.nseindia.com/products/content/"
                     f"sec_bhavdata_full_{stamp}.csv")
        text = body.decode("utf-8", "replace") if body else ""
        if "SYMBOL" not in text[:300]:
            # Before August 2019 the full bhavcopy was published as a dated zip
            # under the historical path; the modern file simply does not exist.
            import zipfile
            month = datetime.strptime(date, "%Y-%m-%d").strftime("%b").upper()
            year = date[0:4]
            day = date[8:10]
            old_url = ("https://archives.nseindia.com/content/historical/EQUITIES/"
                       f"{year}/{month}/cm{day}{month}{year}bhav.csv.zip")
            blob = fetch(old_url)
            if not blob:
                return date, None
            try:
                archive = zipfile.ZipFile(io.BytesIO(blob))
                text = archive.read(archive.namelist()[0]).decode("utf-8", "replace")
            except Exception:
                return date, None
        rows = {}
        for raw in csv.DictReader(io.StringIO(text)):
            row = {(k or "").strip(): (v or "").strip() for k, v in raw.items()}
            symbol = row.get("SYMBOL", "")
            if symbol in wanted and row.get("SERIES") == "EQ":
                try:
                    rows[symbol] = float(row.get("CLOSE_PRICE") or row.get("CLOSE") or "")
                except ValueError:
                    pass
        return date, rows

    with ThreadPoolExecutor(max_workers=4) as pool:
        for date, rows in pool.map(grab, dates):
            if rows is None:
                missing += 1
                continue
            got += 1
            for symbol, close in rows.items():
                series[symbol].append([date, close])

    # Nifty closes, same weekly grid
    def grab_index(date: str):
        stamp = datetime.strptime(date, "%Y-%m-%d").strftime("%d%m%Y")
        body = fetch("https://archives.nseindia.com/content/indices/"
                     f"ind_close_all_{stamp}.csv")
        if not body:
            return None
        try:
            for row in csv.DictReader(io.StringIO(body.decode("utf-8", "replace"))):
                if (row.get("Index Name") or "").strip() == "Nifty 50":
                    return [date, float(row["Closing Index Value"])]
        except Exception:
            return None
        return None

    with ThreadPoolExecutor(max_workers=4) as pool:
        for row in pool.map(grab_index, dates):
            if row:
                index_series.append(row)

    for symbol, rows in series.items():
        if rows:
            (CACHE / f"{symbol}.json").write_text(json.dumps(rows))
    (INDEX_CACHE / "NIFTY.json").write_text(json.dumps(index_series))

    covered = sum(1 for rows in series.values() if rows)
    print(f"bhavcopy: {got} files, {missing} unavailable; "
          f"{covered} symbols with history; {len(index_series)} index points")
    return 0


if __name__ == "__main__":
    sys.exit(main())
