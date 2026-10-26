#!/usr/bin/env python3.12
"""Stage three of the radar: score the survivors and write the shortlist.

The score is deliberately dumb and auditable. Every point comes from a number in
the company's own Screener page or its own price series, and every point prints
the number that earned it. Nothing here forecasts; it ranks, and the report says
what each name would have to do to stay on the list.

Layers and weights:
  hygiene        pass/fail  profit, leverage, returns, promoter
  momentum       40         growth acceleration, margin direction, cash conversion
  rotation       20         relative strength of the company's industry
  trend          25         price structure and relative strength vs Nifty
  catalyst       15         (v1: not scored, stated as a gap)
"""
from __future__ import annotations

import json
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TREND = ROOT / "radar" / "trend.json"
FUND = ROOT / "radar" / "fundamentals"
OUT = ROOT / "radar" / "shortlist.json"
REPORT = ROOT / "radar" / "report.md"


def num(value) -> float | None:
    if value is None:
        return None
    text = str(value).replace(",", "").replace("%", "").replace("₹", "").strip()
    text = text.replace("Cr", "").strip()
    try:
        return float(text)
    except ValueError:
        return None


def row(block: dict | None, name: str) -> list[float]:
    """A table row as numbers, aligned with its column labels."""
    if not block:
        return []
    for key, values in block.items():
        if key and key.strip().lower().startswith(name.lower()):
            return [v for v in (num(x) for x in values) if v is not None]
    return []


def columns(block: dict | None) -> list[str]:
    return (block or {}).get("", []) or []


def latest(series: list[float], back: int = 0) -> float | None:
    if len(series) <= back:
        return None
    return series[-1 - back]


def pct_change(series: list[float], back: int) -> float | None:
    """Change from `back` periods ago to the latest value."""
    if len(series) <= back or series[-1 - back] in (0, None):
        return None
    return (series[-1] / series[-1 - back] - 1) * 100


def assess(company: dict, trend: dict) -> tuple[dict | None, list[str]]:
    pl, bs, cf = company.get("profit-loss"), company.get("balance-sheet"), company.get("cash-flow")
    ratios, share = company.get("ratios"), company.get("shareholding")
    notes: list[str] = []

    sales = row(pl, "Sales")
    pat = row(pl, "Net Profit")
    opm = row(pl, "OPM")
    if not sales or not pat:
        return None, []

    fy_pat = latest(pat)
    equity = (latest(row(bs, "Equity Capital")) or 0) + (latest(row(bs, "Reserves")) or 0)
    debt = latest(row(bs, "Borrowings")) or 0
    de = debt / equity if equity else None
    roce = latest(row(ratios, "ROCE"))
    promoter = latest(row(share, "Promoters"))
    cfo = latest(row(cf, "Cash from Operating Activity"))

    # --- hygiene: the gate that keeps the traps out -----------------------
    if fy_pat is None or fy_pat <= 0:
        return None, ["latest annual profit is negative"]
    if de is not None and de > 1.0:
        return None, [f"debt/equity {de:.2f} above 1.0"]
    if roce is not None and roce < 10:
        return None, [f"ROCE {roce:.1f}% below 10%"]
    if promoter is not None and promoter < 30:
        return None, [f"promoter {promoter:.1f}% below 30%"]

    score, detail = 0.0, []

    # --- momentum, 40 ----------------------------------------------------
    sales_yoy = pct_change(sales, 1)
    pat_yoy = pct_change(pat, 1)
    if sales_yoy is not None:
        points = 10 if sales_yoy >= 20 else 7 if sales_yoy >= 12 else 3 if sales_yoy > 0 else 0
        score += points
        detail.append(f"sales {sales_yoy:+.1f}% YoY ({points}/10)")
    if pat_yoy is not None:
        points = 10 if pat_yoy >= 25 else 7 if pat_yoy >= 15 else 3 if pat_yoy > 0 else 0
        score += points
        detail.append(f"profit {pat_yoy:+.1f}% YoY ({points}/10)")
    if len(opm) >= 5:
        margin_move = opm[-1] - opm[-5]
        points = 10 if margin_move >= 2 else 6 if margin_move > 0 else 0
        score += points
        detail.append(f"margin {margin_move:+.1f}pp over four periods ({points}/10)")
    if cfo and fy_pat:
        conversion = cfo / fy_pat
        points = 10 if conversion >= 0.9 else 6 if conversion >= 0.6 else 2 if conversion > 0 else 0
        score += points
        detail.append(f"CFO/PAT {conversion:.2f}x ({points}/10)")

    return {
        "score": round(score, 1),
        "detail": detail,
        "metrics": {"sales_yoy": sales_yoy, "pat_yoy": pat_yoy,
                    "de": de, "roce": roce, "promoter": promoter,
                    "cfo_pat": (cfo / fy_pat) if cfo and fy_pat else None},
        "notes": notes,
    }, []


def main() -> int:
    trend = json.loads(TREND.read_text())
    survivors = [r for r in trend["rows"]
                 if r["above_200"] and r["above_50"]
                 and r["from_high_pct"] > -25 and r["rs6m"] > 0]

    # industry rotation: median relative strength of each industry, among survivors
    by_industry: dict[str, list[float]] = {}
    for r in survivors:
        by_industry.setdefault(r["industry"] or "Unknown", []).append(r["rs6m"])
    rotation = {k: statistics.median(v) for k, v in by_industry.items()}
    ranked_industries = sorted(rotation.values())

    def rotation_points(industry: str) -> tuple[float, float]:
        value = rotation.get(industry or "Unknown")
        if value is None or len(ranked_industries) < 4:
            return 0.0, 0.0
        # quartile position of the industry's median relative strength
        position = sum(1 for v in ranked_industries if v <= value) / len(ranked_industries)
        return round(position * 20, 1), value

    results, rejected = [], []
    for r in survivors:
        path = FUND / f"{r['code']}.json"
        if not path.exists():
            rejected.append({**r, "reason": "fundamentals not fetched"})
            continue
        company = json.loads(path.read_text())
        assessment, why_not = assess(company, r)
        if assessment is None:
            rejected.append({**r, "reason": ", ".join(why_not)})
            continue

        rot_pts, rot_val = rotation_points(r["industry"])
        # trend, 25
        trend_pts = 0.0
        trend_pts += 10 if r["rs6m"] >= 50 else 7 if r["rs6m"] >= 25 else 4 if r["rs6m"] > 0 else 0
        trend_pts += 5 if r["from_high_pct"] > -10 else 3 if r["from_high_pct"] > -20 else 1
        trend_pts += 5 if r["above_50"] and r["above_200"] else 0
        trend_pts += 5 if r["rs3m"] > 0 else 0

        total = assessment["score"] + rot_pts + trend_pts
        results.append({
            "symbol": r["symbol"], "code": r["code"], "name": r["name"],
            "band": r["band"], "industry": r["industry"],
            "score": round(total, 1),
            "momentum": assessment["score"], "rotation": rot_pts, "trend": trend_pts,
            "catalyst": 0,
            "industry_rs6m": rot_val,
            "detail": assessment["detail"],
            "metrics": assessment["metrics"],
            "price": {"close": r["close"], "from_high": r["from_high_pct"],
                      "ret3m": r["ret3m"], "ret6m": r["ret6m"],
                      "rs3m": r["rs3m"], "rs6m": r["rs6m"]},
        })

    results.sort(key=lambda x: -x["score"])
    OUT.write_text(json.dumps({
        "generated": time.strftime("%Y-%m-%d"),
        "universe": trend["universe"], "priced": trend["priced"],
        "trend_survivors": len(survivors), "scored": len(results),
        "rejected": len(rejected), "rows": results, "excluded": rejected,
    }, indent=1))

    lines = ["# Multibagger radar — mid, small and micro caps", "",
             f"Generated {time.strftime('%d %B %Y')}. Universe {trend['universe']} companies "
             f"(Nifty Midcap 150, Smallcap 250, Microcap 250), {trend['priced']} priced, "
             f"{len(survivors)} in a confirmed uptrend, {len(results)} scored after hygiene.", "",
             "Scores are 0-100: momentum 40, sector rotation 20, trend 25, catalyst 15 "
             "(catalyst not yet scored in v1).", ""]
    for rank, item in enumerate(results[:20], 1):
        lines.append(f"## {rank}. {item['name']} ({item['code']}) — {item['score']}/100")
        lines.append(f"{item['band']} cap · {item['industry']} · industry RS6M "
                     f"{item['industry_rs6m']:+.1f}pp")
        lines.append("")
        for d in item["detail"]:
            lines.append(f"- {d}")
        lines.append(f"- price: ₹{item['price']['close']}, {item['price']['from_high']:+.1f}% "
                     f"from 52w high, {item['price']['ret6m']:+.1f}% six months, "
                     f"RS {item['price']['rs6m']:+.1f}pp vs Nifty")
        lines.append("")
    REPORT.write_text("\n".join(lines))

    print(f"radar: {len(survivors)} survivors, {len(results)} scored, {len(rejected)} excluded")
    for item in results[:10]:
        print(f"  {item['score']:5.1f}  {item['code']:12} {item['band']:6} "
              f"{item['industry'][:24]:26} RS6M {item['price']['rs6m']:+.0f}pp")
    print(f"  report -> {REPORT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
