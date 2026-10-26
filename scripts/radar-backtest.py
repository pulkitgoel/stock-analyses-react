#!/usr/bin/env python3.12
"""Backtest the radar's price layer on NSE bhavcopy weekly closes.

Weekly sampling is an approximation and it is stated in the output: the 200-day
average becomes a 40-week average, the 52-week high is 52 weekly closes, the
six-month return is 26 weeks, one and three years are 52 and 156 weeks.

The gate is the live one: above the 12 and 40 week averages, within 25% of the
52-week high, beating Nifty over six months. Ranking is six-month relative
strength. Top twenty are the picks.

Bias, stated plainly: the universe is today's Nifty Midcap 150, Smallcap 250 and
Microcap 250 membership. Companies that dropped out are absent, so returns are
optimistic. The comparison against the same surviving universe is the honest
part; the raw return is not.
"""
from __future__ import annotations

import json
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UNIVERSE = ROOT / "radar" / "universe.json"
HISTORY = ROOT / "radar" / "history"
INDEX = ROOT / "radar" / "index" / "NIFTY.json"
OUT = ROOT / "radar" / "backtest.json"

DATES = ["2019-07-01", "2020-07-01", "2021-07-01", "2022-07-01"]
TOP_N = 20


def load(path: Path) -> list[list]:
    if not path.exists():
        return []
    return json.loads(path.read_text())


def index_at(series: list[list], date: str) -> int | None:
    found = None
    for i, row in enumerate(series):
        if row[0] <= date:
            found = i
        else:
            break
    return found


def shift_weeks(date: str, weeks: int) -> str:
    from datetime import datetime, timedelta
    parsed = datetime.strptime(date, "%Y-%m-%d")
    return (parsed + timedelta(weeks=weeks)).strftime("%Y-%m-%d")


def metrics(series: list[list], date: str, nifty: list[list]) -> dict | None:
    i = index_at(series, date)
    if i is None or i < 40:
        return None
    closes = [r[1] for r in series[: i + 1]]
    close = closes[-1]
    sma12 = statistics.mean(closes[-12:])
    sma40 = statistics.mean(closes[-40:])
    high = max(closes[-52:])
    j6 = index_at(series, shift_weeks(date, -26))
    n = index_at(nifty, date)
    n6 = index_at(nifty, shift_weeks(date, -26))
    if j6 is None or n is None or n6 is None:
        return None
    if series[j6][1] <= 0 or nifty[n6][1] <= 0:
        return None
    ret6 = (close / series[j6][1] - 1) * 100
    nifty6 = (nifty[n][1] / nifty[n6][1] - 1) * 100
    return {"close": close, "above_50": close > sma12, "above_200": close > sma40,
            "from_high": (close / high - 1) * 100, "ret6m": ret6,
            "rs6m": ret6 - nifty6, "index": i}


def forward(series: list[list], i: int, date: str, weeks: int) -> float | None:
    j = index_at(series, shift_weeks(date, weeks))
    if j is None or j <= i or series[i][1] <= 0:
        return None
    return (series[j][1] / series[i][1] - 1) * 100


def stat(values: list[float | None]) -> dict | None:
    values = [v for v in values if v is not None]
    if not values:
        return None
    return {"n": len(values),
            "median": round(statistics.median(values), 1),
            "double": round(100 * sum(1 for v in values if v >= 100) / len(values), 1),
            "triple": round(100 * sum(1 for v in values if v >= 200) / len(values), 1),
            "negative": round(100 * sum(1 for v in values if v < 0) / len(values), 1)}


def main() -> int:
    universe = json.loads(UNIVERSE.read_text())["rows"]
    nifty = load(INDEX)
    if not nifty:
        sys.exit("backtest: no Nifty series - run radar-bhavcopy.py first")

    histories = {r["code"]: load(HISTORY / f"{r['code']}.json") for r in universe}
    covered = sum(1 for h in histories.values() if h)
    print(f"backtest: {covered} of {len(universe)} symbols have history, "
          f"{len(nifty)} weekly index points")

    results = []
    for date in DATES:
        rows = []
        for company in universe:
            series = histories.get(company["code"]) or []
            if not series:
                continue
            m = metrics(series, date, nifty)
            if not m:
                continue
            m.update({"code": company["code"], "name": company["name"],
                      "band": company["band"], "industry": company["industry"]})
            m["fwd1"] = forward(series, m["index"], date, 52)
            m["fwd3"] = forward(series, m["index"], date, 156)
            rows.append(m)

        passing = [r for r in rows if r["above_200"] and r["above_50"]
                   and r["from_high"] > -25 and r["rs6m"] > 0]
        passing.sort(key=lambda r: -r["rs6m"])
        picks = passing[:TOP_N]
        baseline = [r["fwd3"] for r in rows]

        n = index_at(nifty, date)
        n3 = index_at(nifty, shift_weeks(date, 156))
        nifty3 = None
        if n is not None and n3 is not None and nifty[n][1] > 0:
            nifty3 = round((nifty[n3][1] / nifty[n][1] - 1) * 100, 1)

        results.append({
            "date": date, "eligible": len(rows), "passing": len(passing),
            "picks": [{"name": p["name"], "code": p["code"], "band": p["band"],
                       "rs6m": round(p["rs6m"], 1), "from_high": round(p["from_high"], 1),
                       "fwd1": None if p["fwd1"] is None else round(p["fwd1"], 1),
                       "fwd3": None if p["fwd3"] is None else round(p["fwd3"], 1)}
                      for p in picks],
            "picks_3y": stat([p["fwd3"] for p in picks]),
            "picks_1y": stat([p["fwd1"] for p in picks]),
            "universe_3y": stat(baseline),
            "nifty_3y": nifty3,
        })
        print(f"  {date}: {len(passing)} passed, {len(picks)} picked")

    OUT.write_text(json.dumps({"generated": time.strftime("%Y-%m-%d"),
                               "source": "NSE bhavcopy, weekly sampling",
                               "results": results}, indent=1))

    print(f"\n{'date':12}{'pass':>5}{'med3y':>7}{'2x':>6}{'3x':>6}{'neg':>6} | "
          f"{'univmed':>8}{'univ2x':>8} | {'nifty':>7}")
    for r in results:
        p, u = r["picks_3y"], r["universe_3y"]
        if not p or not u:
            continue
        print(f"{r['date']:12}{r['passing']:5}{p['median']:7.0f}{p['double']:5.0f}%"
              f"{p['triple']:5.0f}%{p['negative']:5.0f}% | "
              f"{u['median']:8.0f}{u['double']:7.0f}% | "
              f"{(r['nifty_3y'] if r['nifty_3y'] is not None else float('nan')):7.0f}")
    print(f"\nwritten -> {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
