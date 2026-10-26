#!/usr/bin/env python3.12
"""The intake gate: turn the radar's ranking into five names worth a week of work.

The momentum score answers "what is working". This answers a different question:
"could this still be five times the size in ten years". Seven gates are
mechanical; the eighth - whether a second engine exists - needs a human read and
is left to the deep dive, recorded as unknown rather than passed.

Every name that fails is kept with the gate it failed, because knowing which
filter rejected a future multibagger is the only way the filter improves.

Usage:
  radar-scorecard.py                # write this week's plan
  radar-scorecard.py --show         # print the current plan
"""
from __future__ import annotations

import argparse
import json
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHORTLIST = ROOT / "radar" / "shortlist.json"
FUND = ROOT / "radar" / "fundamentals"
PLAN = ROOT / "radar" / "week.json"
LEDGER = ROOT / "radar" / "ledger.json"
PICKS = 5


def num(value) -> float | None:
    if value is None:
        return None
    text = str(value).replace(",", "").replace("₹", "").replace("%", "").replace("Cr.", "").strip()
    try:
        return float(text)
    except ValueError:
        return None


def series(block: dict | None, label: str) -> list[float]:
    if not block:
        return []
    for key, values in block.items():
        if key and key.strip().lower().startswith(label.lower()):
            return [v for v in (num(x) for x in values) if v is not None]
    return []


def cagr(values: list[float], years: int) -> float | None:
    if len(values) <= years or values[-1 - years] <= 0 or values[-1] <= 0:
        return None
    return ((values[-1] / values[-1 - years]) ** (1 / years) - 1) * 100


def gates(company: dict) -> tuple[int, dict, list[str]]:
    side = company.get("sidebar") or {}
    pl = company.get("profit-loss")
    cf = company.get("cash-flow")

    mcap = num(side.get("Market Cap"))
    roce = num(side.get("ROCE"))
    de = num(side.get("Debt to equity"))
    pe = num(side.get("Stock P/E"))
    industry_pe = num(side.get("Industry PE"))
    debtor_days = num(side.get("Debtor days"))
    promoter = num((series(company.get("shareholding"), "Promoters") or [None])[-1])

    sales = series(pl, "Sales")
    opm = series(pl, "OPM")
    pat = series(pl, "Net Profit")
    cfo = series(cf, "Cash from Operating Activity")

    checks: dict[str, bool] = {}
    detail: dict[str, str] = {}

    checks["headroom"] = mcap is not None and mcap < 25000
    detail["headroom"] = f"market cap ₹{mcap:,.0f} Cr" if mcap else "market cap unknown"

    checks["reinvestment"] = roce is not None and roce >= 18
    detail["reinvestment"] = f"ROCE {roce:.1f}%" if roce is not None else "ROCE unknown"

    growth = cagr(sales, 5)
    margin_ok = len(opm) >= 5 and opm[-1] >= opm[-5] - 1
    checks["durability"] = bool(growth and growth >= 15 and margin_ok)
    detail["durability"] = (f"5y sales CAGR {growth:.1f}%, margin "
                            f"{'stable' if margin_ok else 'compressing'}") if growth else "growth unknown"

    conversion = (cfo[-1] / pat[-1]) if cfo and pat and pat[-1] else None
    checks["quality"] = bool(conversion and conversion >= 0.8 and (debtor_days or 999) <= 90)
    detail["quality"] = (f"CFO/PAT {conversion:.2f}x, debtors {debtor_days or float('nan'):.0f}d"
                         if conversion else "cash conversion unknown")

    checks["balance"] = de is not None and de <= 0.5
    detail["balance"] = f"debt/equity {de:.2f}" if de is not None else "debt/equity unknown"

    promoter_series = series(company.get("shareholding"), "Promoters")
    stable = len(promoter_series) >= 5 and promoter_series[-1] >= promoter_series[-5] - 1
    checks["management"] = bool(promoter and promoter >= 35 and stable)
    detail["management"] = (f"promoter {promoter:.1f}% "
                            f"({'stable' if stable else 'falling'})") if promoter else "promoter unknown"

    checks["valuation"] = bool(pe and pe > 0 and ((industry_pe and pe <= industry_pe * 1.5) or pe <= 35))
    detail["valuation"] = (f"P/E {pe:.0f} vs industry {industry_pe:.0f}"
                           if pe and industry_pe else f"P/E {pe:.0f}" if pe else "P/E unknown")

    passed = sum(1 for v in checks.values() if v)
    return passed, detail, [k for k, v in checks.items() if not v]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--show", action="store_true")
    args = ap.parse_args()

    if args.show and PLAN.exists():
        plan = json.loads(PLAN.read_text())
        print(f"week of {plan['week']}: {len(plan['picks'])} names")
        for p in plan["picks"]:
            print(f"  {p['code']:12} {p['name'][:34]:36} gates {p['gates']}/7  {p['band']}")
        return 0

    shortlist = json.loads(SHORTLIST.read_text())
    rows, rejected = [], []

    for item in shortlist["rows"]:
        path = FUND / f"{item['code']}.json"
        if not path.exists():
            continue
        company = json.loads(path.read_text())
        passed, detail, failed = gates(company)
        entry = {
            "code": item["code"], "name": item["name"], "band": item["band"],
            "industry": item["industry"], "score": item["score"], "gates": passed,
            "failed": failed, "detail": detail,
            "price": item["price"]["close"], "rs6m": item["price"]["rs6m"],
        }
        # A name must clear five of seven to be worth a day of work.
        (rows if passed >= 5 else rejected).append(entry)

    rows.sort(key=lambda r: (-r["gates"], -r["score"]))
    picks = rows[:PICKS]

    # Names already in the ledger are not re-picked.
    ledger = json.loads(LEDGER.read_text()) if LEDGER.exists() else {"entries": []}
    seen = {e["code"] for e in ledger["entries"] if e.get("status") != "closed"}
    picks = [p for p in picks if p["code"] not in seen][:PICKS]

    plan = {
        "week": time.strftime("%Y-W%V"),
        "generated": time.strftime("%Y-%m-%d"),
        "picks": picks,
        "rejected": rejected[:40],
        "considered": len(shortlist["rows"]),
    }
    PLAN.write_text(json.dumps(plan, indent=1))

    print(f"scorecard: {len(shortlist['rows'])} scored, {len(rows)} cleared five gates, "
          f"{len(picks)} picked for the week, {len(rejected)} rejected")
    for p in picks:
        print(f"  {p['code']:12} {p['gates']}/7 gates  {p['name'][:36]:38} {p['band']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
