#!/usr/bin/env python3.12
"""Stage two of the radar: fundamentals for the names that survived the trend gate.

One Screener page per company, all six tables read from that single page (the
sections are anchors, not separate documents — the first version navigated six
times per company and wasted two thirds of the run). Results are cached for a
week, so a re-run costs nothing and a weekly schedule stays cheap.

Credentials live in the settings database, not in this file.

Usage:
  radar-fundamentals.py                 # everything in radar/trend.json that passed
  radar-fundamentals.py --limit 10      # smoke test
  radar-fundamentals.py --force         # ignore the cache
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TREND = ROOT / "radar" / "trend.json"
CACHE = ROOT / "radar" / "fundamentals"
CACHE_DAYS = 7

sys.path.insert(0, "/var/www/stock-analyses")
import settings_store  # noqa: E402

TABLES = ("quarters", "profit-loss", "balance-sheet", "cash-flow", "ratios", "shareholding")


def survivors() -> list[dict]:
    payload = json.loads(TREND.read_text())
    return [r for r in payload["rows"]
            if r["above_200"] and r["above_50"]
            and r["from_high_pct"] > -25 and r["rs6m"] > 0]


def extraction(page) -> dict:
    out = {}
    out["sidebar"] = page.evaluate("""() => {
        const o = {};
        document.querySelectorAll('.company-info li').forEach(li => {
            const p = li.innerText.split('\\n').map(s => s.trim()).filter(Boolean);
            if (p.length >= 2) o[p[0]] = p.slice(1).join(' ');
        });
        return o;
    }""")
    out["about"] = page.evaluate("() => (document.querySelector('.company-profile, .about')||{}).innerText || ''")
    for tid in TABLES:
        out[tid] = page.evaluate("""(tid) => {
            const sec = document.querySelector('#' + tid);
            if (!sec) return null;
            const o = {};
            sec.querySelectorAll('table.data-table tr').forEach(row => {
                const c = row.querySelectorAll('td, th');
                if (c.length < 2) return;
                o[c[0].innerText.trim()] = Array.from(c).slice(1).map(x => x.innerText.trim());
            });
            return o;
        }""", tid)
    out["pros"] = page.evaluate("() => Array.from(document.querySelectorAll('.pros li')).map(x => x.innerText.trim())")
    out["cons"] = page.evaluate("() => Array.from(document.querySelectorAll('.cons li')).map(x => x.innerText.trim())")
    out["peers"] = page.evaluate("""() => {
        const sec = document.querySelector('#peers');
        if (!sec) return null;
        const rows = [];
        sec.querySelectorAll('table.data-table tr').forEach(row => {
            const c = row.querySelectorAll('td, th');
            if (c.length >= 2) rows.push(Array.from(c).map(x => x.innerText.trim()));
        });
        return rows;
    }""")
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    targets = survivors()
    if args.limit:
        targets = targets[: args.limit]

    CACHE.mkdir(parents=True, exist_ok=True)
    pending = []
    for row in targets:
        path = CACHE / f"{row['code']}.json"
        if not args.force and path.exists() and \
                time.time() - path.stat().st_mtime < CACHE_DAYS * 86400:
            continue
        pending.append(row)

    print(f"radar-fundamentals: {len(targets)} survivors, {len(pending)} to fetch")
    if not pending:
        return 0

    from playwright.sync_api import sync_playwright

    user = settings_store.get("screener.user")
    password = settings_store.get("screener.pass")
    if not (user and password):
        sys.exit("radar-fundamentals: screener.user / screener.pass are not set")

    done = failed = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/google-chrome",
                                    headless=True,
                                    args=["--no-sandbox", "--disable-dev-shm-usage"])
        context = browser.new_context(
            user_agent=("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"),
            viewport={"width": 1440, "height": 1000})
        page = context.new_page()
        page.set_default_timeout(60000)

        page.goto("https://www.screener.in/login/?next=/", wait_until="domcontentloaded")
        if page.locator("input[name='username']").count():
            page.fill("input[name='username']", user)
            page.fill("input[name='password']", password)
            page.click("button[type='submit']")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2)

        for index, row in enumerate(pending, 1):
            code = row["code"]
            try:
                page.goto(f"https://www.screener.in/company/{code}/consolidated/",
                          wait_until="domcontentloaded")
                time.sleep(1.5)
                if "login" in page.url:
                    print("radar-fundamentals: session lost, stopping", file=sys.stderr)
                    break
                data = extraction(page)
                data["_meta"] = {"code": code, "name": row["name"],
                                 "band": row["band"], "industry": row["industry"],
                                 "fetched": time.strftime("%Y-%m-%d")}
                (CACHE / f"{code}.json").write_text(json.dumps(data, ensure_ascii=False))
                done += 1
            except Exception as exc:
                failed += 1
                print(f"  {code}: {type(exc).__name__}: {exc}", file=sys.stderr)
            if index % 10 == 0:
                print(f"  ... {index}/{len(pending)} done={done} failed={failed}")

        browser.close()

    print(f"radar-fundamentals: fetched {done}, failed {failed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
