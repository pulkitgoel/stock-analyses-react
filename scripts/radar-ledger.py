#!/usr/bin/env python3.12
"""The radar ledger: every name we decided to look at, and what happened to it.

The ledger exists because a screen can be backtested but a process cannot. Each
entry records the thesis at the moment of entry, the price, what would prove it
wrong, and when to check again. Without the kill criteria written down first,
every review becomes an argument with hindsight.

Usage:
  radar-ledger.py add                 # queue this week's plan
  radar-ledger.py list                # open positions
  radar-ledger.py close CODE --reason "..." --return -34
  radar-ledger.py due                 # reviews falling due this month
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEDGER = ROOT / "radar" / "ledger.json"
PLAN = ROOT / "radar" / "week.json"


def load() -> dict:
    if LEDGER.exists():
        return json.loads(LEDGER.read_text())
    return {"entries": []}


def save(payload: dict) -> None:
    LEDGER.write_text(json.dumps(payload, indent=1))


def main() -> int:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="command", required=True)

    sub.add_parser("add")
    sub.add_parser("list")
    sub.add_parser("due")

    close = sub.add_parser("close")
    close.add_argument("code")
    close.add_argument("--reason", required=True)
    close.add_argument("--return", dest="ret", type=float, default=None)

    done = sub.add_parser("done")
    done.add_argument("code")
    done.add_argument("--slug", required=True)
    done.add_argument("--verdict", default="")

    args = ap.parse_args()
    ledger = load()

    if args.command == "add":
        plan = json.loads(PLAN.read_text())
        existing = {e["code"] for e in ledger["entries"]}
        added = 0
        for pick in plan["picks"]:
            if pick["code"] in existing:
                continue
            ledger["entries"].append({
                "code": pick["code"], "name": pick["name"], "band": pick["band"],
                "industry": pick["industry"], "gates": pick["gates"],
                "added": time.strftime("%Y-%m-%d"), "price_at_add": pick["price"],
                "status": "queued", "thesis": "", "kill_criteria": "",
                "review_on": (date.today() + timedelta(days=365)).isoformat(),
                "slug": None, "outcome": None,
            })
            added += 1
        save(ledger)
        print(f"ledger: {added} added, {len(ledger['entries'])} total")
        return 0

    if args.command == "done":
        for entry in ledger["entries"]:
            if entry["code"].upper() == args.code.upper():
                entry.update({"status": "analysed", "slug": args.slug,
                              "verdict": args.verdict,
                              "analysed_on": time.strftime("%Y-%m-%d")})
                save(ledger)
                print(f"ledger: {entry['code']} marked analysed -> {args.slug}")
                return 0
        sys.exit(f"ledger: {args.code} not found")

    if args.command == "close":
        for entry in ledger["entries"]:
            if entry["code"].upper() == args.code.upper():
                entry.update({"status": "closed", "close_reason": args.reason,
                              "outcome": args.ret,
                              "closed_on": time.strftime("%Y-%m-%d")})
                save(ledger)
                print(f"ledger: {entry['code']} closed")
                return 0
        sys.exit(f"ledger: {args.code} not found")

    entries = ledger["entries"]
    if args.command == "due":
        month = time.strftime("%Y-%m")
        entries = [e for e in entries if e.get("status") != "closed"
                   and str(e.get("review_on", "")).startswith(month)]
        print(f"reviews due in {month}: {len(entries)}")

    if args.command == "list":
        print(f"ledger: {len(entries)} entries")

    for entry in entries:
        print(f"  {entry['code']:12} {entry['status']:9} gates {entry.get('gates', '?')}/7  "
              f"added {entry['added']}  review {entry['review_on']}  "
              f"{(entry.get('slug') or '')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
