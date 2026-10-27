#!/usr/bin/env python3.12
"""Daily closes from NSE bhavcopy and the indicators the article needs.

Yahoo throttles this box, so the exchange file is the source. It carries every
symbol per day, but we only keep the one we asked for - the article needs a
single company's series, not a universe.

Usage: technical-snapshot.py SKYGOLD [--days 260]
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from pathlib import Path

HEADERS = {"User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36")}
INDEX = Path("/var/www/stock-analyses-react/radar/index/NIFTY.json")


def fetch(url: str) -> bytes | None:
    try:
        request = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(request, timeout=25) as response:
            return response.read()
    except Exception:
        return None


def close_for(date: str, symbol: str) -> tuple[str, float, float] | None:
    stamp = datetime.strptime(date, "%Y-%m-%d").strftime("%d%m%Y")
    body = fetch("https://archives.nseindia.com/products/content/"
                 f"sec_bhavdata_full_{stamp}.csv")
    if not body:
        return None
    for raw in csv.DictReader(io.StringIO(body.decode("utf-8", "replace"))):
        row = {(k or "").strip(): (v or "").strip() for k, v in raw.items()}
        if row.get("SYMBOL") == symbol and row.get("SERIES") == "EQ":
            try:
                close = float(row.get("CLOSE_PRICE", ""))
                volume = float((row.get("TTL_TRD_QNTY") or "0").replace(",", ""))
                return date, close, volume
            except ValueError:
                return None
    return None


def ema(values: list[float], span: int) -> list[float]:
    k = 2 / (span + 1)
    out = [values[0]]
    for price in values[1:]:
        out.append(price * k + out[-1] * (1 - k))
    return out


def rsi(values: list[float], period: int = 14) -> float:
    gains, losses = [], []
    for i in range(1, len(values)):
        change = values[i] - values[i - 1]
        gains.append(max(change, 0))
        losses.append(max(-change, 0))
    avg_gain = sum(gains[-period:]) / period
    avg_loss = sum(losses[-period:]) / period
    if avg_loss == 0:
        return 100.0
    return 100 - (100 / (1 + avg_gain / avg_loss))


def stochastic(closes: list[float], period: int = 14) -> tuple[float, float]:
    window = closes[-period:]
    low, high = min(window), max(window)
    k = 100 * (closes[-1] - low) / (high - low) if high > low else 50.0
    ks = []
    for i in range(len(closes) - 3, len(closes)):
        w = closes[max(0, i - period + 1): i + 1]
        lo, hi = min(w), max(w)
        ks.append(100 * (closes[i] - lo) / (hi - lo) if hi > lo else 50.0)
    return k, sum(ks) / len(ks)


def cci(closes: list[float], period: int = 20) -> float:
    window = closes[-period:]
    mean = sum(window) / period
    deviation = sum(abs(c - mean) for c in window) / period
    if deviation == 0:
        return 0.0
    return (closes[-1] - mean) / (0.015 * deviation)


def adx(closes: list[float], period: int = 14) -> float:
    plus = minus = 0.0
    for i in range(-period, 0):
        up = closes[i] - closes[i - 1]
        down = closes[i - 1] - closes[i]
        if up > down and up > 0:
            plus += up
        if down > up and down > 0:
            minus += down
    total = plus + minus
    return 100 * abs(plus - minus) / total if total else 0.0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("symbol")
    ap.add_argument("--days", type=int, default=260)
    args = ap.parse_args()

    today = datetime.utcnow()
    dates = [(today - timedelta(days=d)).strftime("%Y-%m-%d") for d in range(args.days + 40)]
    with ThreadPoolExecutor(max_workers=6) as pool:
        hits = [r for r in pool.map(lambda d: close_for(d, args.symbol), dates) if r]
    hits.sort()
    if len(hits) < 60:
        sys.exit(f"technical: only {len(hits)} sessions found")

    closes = [c for _, c, _ in hits]
    volumes = [v for _, _, v in hits]
    dates_only = [d for d, _, _ in hits]
    e20, e50, e200 = ema(closes, 20), ema(closes, 50), ema(closes, 200)
    macd_line = [a - b for a, b in zip(ema(closes, 12), ema(closes, 26))]
    signal = ema(macd_line, 9)

    nifty = json.loads(INDEX.read_text()) if INDEX.exists() else []
    ret = lambda n: (closes[-1] / closes[-1 - n] - 1) * 100 if len(closes) > n else None

    out = {
        "symbol": args.symbol,
        "as_of": dates_only[-1],
        "sessions": len(closes),
        "close": closes[-1],
        "prev_close": closes[-2],
        "change_pct": round((closes[-1] / closes[-2] - 1) * 100, 2),
        "ema20": round(e20[-1], 1), "ema50": round(e50[-1], 1), "ema200": round(e200[-1], 1),
        "rsi14": round(rsi(closes), 1),
        "macd": round(macd_line[-1], 2), "macd_signal": round(signal[-1], 2),
        "macd_hist": round(macd_line[-1] - signal[-1], 2),
        "high_52w": max(closes[-250:]), "low_52w": min(closes[-250:]),
        "ret_1m": round(ret(21) or 0, 1), "ret_3m": round(ret(63) or 0, 1),
        "ret_6m": round(ret(126) or 0, 1), "ret_1y": round(ret(250) or 0, 1),
        "stoch_k": round(stochastic(closes)[0], 1), "stoch_d": round(stochastic(closes)[1], 1),
        "cci20": round(cci(closes), 1), "adx14": round(adx(closes), 1),
        "momentum10_pct": round((closes[-1] / closes[-11] - 1) * 100, 1) if len(closes) > 11 else None,
        "vol_avg_20d": round(sum(volumes[-20:]) / 20, 0),
        "from_high_pct": round((closes[-1] / max(closes[-250:]) - 1) * 100, 1),
    }
    Path("/tmp/technical-last.json").write_text(json.dumps(out, indent=1))
    print(json.dumps(out, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
