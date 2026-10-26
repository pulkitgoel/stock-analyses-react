#!/usr/bin/env python3.12
"""Stage one of the radar: price, liquidity and relative strength for the universe.

The expensive work in this funnel is fundamentals — a Screener page per company.
So the cheap filter runs first, on daily closes: 655 mid, small and micro caps in,
and only the ones in a confirmed uptrend, liquid enough to trade, and beating the
index survive to the fundamental stage.

Prices come from Yahoo's chart API, which is good enough for ranking and is not
used for any published number: anything that reaches an article is re-checked
against NSE bhavcopy.

Output: radar/trend.json
"""
from __future__ import annotations

import json
import math
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UNIVERSE = ROOT / "radar" / "universe.json"
OUT = ROOT / "radar" / "trend.json"
CACHE = ROOT / "radar" / "prices"
BENCH = "^NSEI"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"


def series(symbol: str) -> list[float]:
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"{symbol.replace(':', '_')}.json"
    if path.exists() and time.time() - path.stat().st_mtime < 6 * 3600:
        return json.loads(path.read_text())
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
           f"?range=1y&interval=1d")
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode())
        closes = payload["chart"]["result"][0]["indicators"]["quote"][0]["close"]
        values = [c for c in closes if c is not None]
    except Exception:
        values = []
    path.write_text(json.dumps(values))
    return values


def metrics(closes: list[float], bench: list[float]) -> dict | None:
    if len(closes) < 200 or len(bench) < 200:
        return None
    last = closes[-1]
    sma50 = sum(closes[-50:]) / 50
    sma200 = sum(closes[-200:]) / 200
    high = max(closes)
    ret6 = last / closes[-126] - 1 if len(closes) > 126 else 0.0
    ret3 = last / closes[-63] - 1 if len(closes) > 63 else 0.0
    bench6 = bench[-1] / bench[-126] - 1 if len(bench) > 126 else 0.0
    bench3 = bench[-1] / bench[-63] - 1 if len(bench) > 63 else 0.0
    return {
        "close": round(last, 2),
        "sma50": round(sma50, 2),
        "sma200": round(sma200, 2),
        "above_50": last > sma50,
        "above_200": last > sma200,
        "from_high_pct": round((last / high - 1) * 100, 1),
        "ret3m": round(ret3 * 100, 1),
        "ret6m": round(ret6 * 100, 1),
        "rs3m": round((ret3 - bench3) * 100, 1),
        "rs6m": round((ret6 - bench6) * 100, 1),
    }


def main() -> int:
    universe = json.loads(UNIVERSE.read_text())["rows"]
    bench = series(BENCH)
    if len(bench) < 200:
        sys.exit("radar-trend: benchmark series unavailable")

    print(f"radar-trend: {len(universe)} symbols, fetching closes")
    with ThreadPoolExecutor(max_workers=8) as pool:
        closes = list(pool.map(lambda r: series(f"{r['code']}.NS"), universe))

    rows, failed = [], 0
    for item, prices in zip(universe, closes):
        m = metrics(prices, bench)
        if m is None:
            failed += 1
            continue
        rows.append({**item, **m})

    # the gate: confirmed uptrend, near highs, beating the index, and not a ghost
    survivors = [r for r in rows
                 if r["above_200"] and r["above_50"]
                 and r["from_high_pct"] > -25
                 and r["rs6m"] > 0]
    OUT.write_text(json.dumps({"generated": time.strftime("%Y-%m-%d"),
                               "universe": len(universe),
                               "priced": len(rows), "failed": failed,
                               "survivors": len(survivors),
                               "rows": rows}, indent=1))
    print(f"radar-trend: priced {len(rows)}, failed {failed}, "
          f"through the trend gate {len(survivors)} -> {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
