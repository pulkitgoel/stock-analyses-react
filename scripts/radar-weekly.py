#!/usr/bin/env python3.12
"""The weekly refresh: bhavcopy in, ranking and week plan out, no scraping.

Runs entirely off the exchange files and the local caches, so the Monday intake
costs no Screener pages at all. Screener is touched only when a name is actually
being analysed, which is what keeps the block from recurring.

Steps: refresh the bhavcopy history, rebuild radar/trend.json from it, re-score,
then pick the week's five names. Prints one line per step.
"""
from __future__ import annotations

import json
import statistics
import subprocess
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

UNIVERSE = ROOT / "radar" / "universe.json"
HISTORY = ROOT / "radar" / "history"
INDEX = ROOT / "radar" / "index" / "NIFTY.json"
TREND = ROOT / "radar" / "trend.json"


def load(path: Path) -> list:
    return json.loads(path.read_text()) if path.exists() else []


def at(series: list, date: str) -> int | None:
    found = None
    for i, row in enumerate(series):
        if row[0] <= date:
            found = i
        else:
            break
    return found


def weeks_ago(date: str, weeks: int) -> str:
    return (datetime.strptime(date, "%Y-%m-%d") - timedelta(weeks=weeks)).strftime("%Y-%m-%d")


def main() -> int:
    start = time.time()
    result = subprocess.run([sys.executable, str(ROOT / "scripts" / "radar-bhavcopy.py")],
                            capture_output=True, text=True, timeout=1800)
    print(result.stdout.strip().splitlines()[-1] if result.stdout.strip() else "bhavcopy: no output")
    if result.returncode != 0:
        print(result.stderr[-400:], file=sys.stderr)

    nifty = load(INDEX)
    if not nifty:
        sys.exit("weekly: no Nifty series")
    date = nifty[-1][0]

    rows = []
    for company in json.loads(UNIVERSE.read_text())["rows"]:
        series = load(HISTORY / f"{company['code']}.json")
        i = at(series, date)
        if i is None or i < 40:
            continue
        closes = [r[1] for r in series[: i + 1]]
        close = closes[-1]
        j26, j13 = at(series, weeks_ago(date, 26)), at(series, weeks_ago(date, 13))
        n0, n26, n13 = at(nifty, date), at(nifty, weeks_ago(date, 26)), at(nifty, weeks_ago(date, 13))
        if None in (j26, j13, n0, n26, n13) or series[j26][1] <= 0 or nifty[n26][1] <= 0:
            continue
        ret6 = (close / series[j26][1] - 1) * 100
        ret3 = (close / series[j13][1] - 1) * 100
        n6 = (nifty[n0][1] / nifty[n26][1] - 1) * 100
        n3 = (nifty[n0][1] / nifty[n13][1] - 1) * 100
        rows.append({
            "symbol": company["symbol"], "code": company["code"], "name": company["name"],
            "band": company["band"], "industry": company["industry"], "close": close,
            "above_50": close > statistics.mean(closes[-12:]),
            "above_200": close > statistics.mean(closes[-40:]),
            "from_high_pct": (close / max(closes[-52:]) - 1) * 100,
            "ret3m": round(ret3, 1), "ret6m": round(ret6, 1),
            "rs3m": round(ret3 - n3, 1), "rs6m": round(ret6 - n6, 1),
        })

    rows.sort(key=lambda r: -(r["rs6m"] if r["above_200"] and r["above_50"]
                                 and r["from_high_pct"] > -25 else -10_000))
    TREND.write_text(json.dumps({"as_of": date, "universe": len(rows), "priced": len(rows),
                                 "rows": rows}, indent=1))
    survivors = [r for r in rows if r["above_200"] and r["above_50"]
                 and r["from_high_pct"] > -25 and r["rs6m"] > 0]
    print(f"trend: {len(rows)} priced as of {date}, {len(survivors)} above the gate")

    # Fundamentals only for the strongest sixty, paced. Touching Screener
    # for the whole survivor list is what caused the block in the first place.
    fetch = subprocess.run([sys.executable, str(ROOT / "scripts" / "radar-fundamentals.py"),
                            "--limit", "60"],
                           capture_output=True, text=True, timeout=3600,
                           env={**__import__("os").environ, "RADAR_DELAY": "9"})
    print((fetch.stdout.strip() or fetch.stderr.strip())[:400])

    for script in ("radar-score.py", "radar-scorecard.py", "radar-ledger.py"):
        extra = ["add"] if script == "radar-ledger.py" else []
        out = subprocess.run([sys.executable, str(ROOT / "scripts" / script), *extra],
                             capture_output=True, text=True, timeout=600)
        print((out.stdout.strip() or out.stderr.strip())[:600])

    print(f"weekly: done in {time.time() - start:.0f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
