#!/usr/bin/env python3.12
"""Prerender the article body into the already-prerendered HTML files.

WHY THIS EXISTS
---------------
`scripts/generate-og-files.py` (build step 5) writes the head metadata —
title, description, canonical, Open Graph, Twitter, JSON-LD — into
`dist/analysis/*.html`, `dist/company/*.html` and the four static pages, but
leaves `<div id="root"></div>` empty. A crawler that does not execute
JavaScript therefore reads about seven words per page, so 88-97% of a
415,000-word corpus is invisible to ChatGPT, Perplexity, Claude and Bing.
Googlebot renders JavaScript and is the exception (AGENTS.md section 7.1).

WHAT IT DOES
------------
Serves `dist/` over a local HTTP server, renders every route in headless
Chrome with Playwright, and injects ONLY the rendered `#root` markup back into
the file that already carries the correct head.

Only the `#root` container is replaced. Everything `generate-og-files.py`
wrote stays byte-for-byte intact, so the invariants in AGENTS.md section 3
hold: one <title> per route (3.1), no duplicate crawler metadata from the
React components (3.2), the generator's json.dumps()-built JSON-LD (3.3), no
site-name suffix (3.4), word-boundary truncation (3.5). Pulling the whole
rendered document instead would reintroduce the duplicate-entity defect that
section 3.2 records.

The app mounts with `createRoot`, not `hydrateRoot`, so the browser replaces
this markup on load. That is fine: the point is what a non-executing crawler
receives, not what a human sees.

USAGE
-----
    python3.12 scripts/prerender-body.py                       # in place
    python3.12 scripts/prerender-body.py --limit 5 --verbose   # smoke test
    python3.12 scripts/prerender-body.py --dry-run             # measure only
    python3.12 scripts/prerender-body.py --out-dir /tmp/x      # scratch copy

Exit code is non-zero if any route fails, so the build stops rather than
shipping a half-prerendered site.
"""

from __future__ import annotations

import argparse
import functools
import http.server
import os
import re
import socketserver
import sys
import threading
import time
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT_DIV_RE = re.compile(r'(<div id="root">)\s*(</div>)')

# Routes that legitimately have no prerendered file of their own and must not
# be injected: the SPA shell serves them and they are either private or gated.
SKIP_PREFIXES = ("/watchlist", "/watchlists")


def find_chrome() -> str | None:
    """Locate a system Chrome, or return None to use Playwright's own browser.

    Returning None is a valid result, not a failure: `chromium.launch()` without
    an `executable_path` uses the Chromium that `playwright install` downloaded.
    The server has a system Chrome and keeps using it; a developer machine
    usually has only the Playwright one, and probing a fixed list of Linux paths
    made the build unrunnable anywhere else.

    Set CHROME_PATH to force a specific binary.
    """
    override = os.environ.get("CHROME_PATH")
    if override:
        if not Path(override).exists():
            sys.exit(f"prerender-body: CHROME_PATH does not exist: {override}")
        return override

    for candidate in (
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ):
        if Path(candidate).exists():
            return candidate
    return None


def routes_from_sitemap(dist: Path) -> list[str]:
    """Every URL the sitemap lists, as a site-relative path."""
    sitemap = dist / "sitemap.xml"
    if not sitemap.exists():
        sys.exit("prerender-body: dist/sitemap.xml not found - run the build first")
    tree = ET.parse(sitemap)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    paths: list[str] = []
    for loc in tree.getroot().findall(".//sm:loc", ns):
        if loc.text:
            path = re.sub(r"^https?://[^/]+", "", loc.text.strip())
            paths.append(path or "/")
    # The homepage is not necessarily in the sitemap; always include it.
    if "/" not in paths:
        paths.insert(0, "/")
    return paths


def target_file(dist: Path, route: str) -> Path | None:
    """Map a site route to the prerendered file that carries its head."""
    if route == "/":
        return dist / "index.html"
    stripped = route.strip("/")
    for candidate in (
        dist / f"{stripped}.html",
        dist / stripped / "index.html",
    ):
        if candidate.exists():
            return candidate
    return None


class _SiteHandler(http.server.SimpleHTTPRequestHandler):
    """Serve dist/ the way nginx does.

    A bare SimpleHTTPRequestHandler 404s on /about and /contact, because the
    prerendered file is about.html and the URL carries no extension. nginx
    resolves that with `try_files $uri $uri.html $uri/index.html /index.html`;
    the local server used for rendering has to match, or those routes never
    boot React and the root container stays empty.
    """

    def log_message(self, *_args):  # noqa: D102 - silence per-request logging
        pass

    def translate_path(self, path):  # noqa: D102 - nginx-equivalent resolution
        clean = path.split("?", 1)[0].split("#", 1)[0]
        rel = urllib.parse.unquote(clean).strip("/")
        base = Path(self.directory)
        if not rel:
            return str(base / "index.html")
        for candidate in (base / rel, base / f"{rel}.html", base / rel / "index.html"):
            if candidate.is_file():
                return str(candidate)
        return str(base / "index.html")


def serve(directory: Path) -> tuple[socketserver.TCPServer, int]:
    handler = functools.partial(_SiteHandler, directory=str(directory))
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, port


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dist", default="dist", type=Path)
    parser.add_argument("--out-dir", type=Path, default=None,
                        help="write into this copy instead of editing dist/")
    parser.add_argument("--limit", type=int, default=0,
                        help="process only the first N routes (smoke test)")
    parser.add_argument("--dry-run", action="store_true",
                        help="measure rendered size, write nothing")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    dist = args.dist.resolve()
    if not dist.is_dir():
        sys.exit(f"prerender-body: {dist} is not a directory")

    chrome = find_chrome()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("prerender-body: playwright is not installed "
                 "(pip install playwright, then playwright install chromium)")

    routes = routes_from_sitemap(dist)
    routes = [r for r in routes if not r.startswith(SKIP_PREFIXES)]

    # Only routes that actually have a prerendered file get a body injected.
    planned: list[tuple[str, Path]] = []
    for route in routes:
        dest = target_file(dist, route)
        if dest is None:
            if args.verbose:
                print(f"  skip {route} (no prerendered file)")
            continue
        if args.out_dir:
            dest = args.out_dir / dest.relative_to(dist)
        planned.append((route, dest))
    if args.limit:
        planned = planned[: args.limit]

    if not planned:
        sys.exit("prerender-body: nothing to do")

    httpd, port = serve(dist)
    base = f"http://127.0.0.1:{port}"
    print(f"prerender-body: serving {dist} on {base}, "
          f"{len(planned)} routes, chrome={chrome}")

    failures: list[str] = []
    before_total = after_total = 0
    started = time.time()

    with sync_playwright() as pw:
        # executable_path=None makes Playwright use its own bundled Chromium.
        browser = pw.chromium.launch(
            executable_path=chrome,
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        context = browser.new_context()
        page = context.new_page()

        for index, (route, dest) in enumerate(planned, start=1):
            try:
                page.goto(f"{base}{route}", wait_until="networkidle", timeout=45_000)
                # Wait for the markdown pipeline to actually produce content.
                # The threshold is deliberately low: the static pages are short.
                page.wait_for_function(
                    "() => { const r = document.getElementById('root');"
                    " return r && r.innerText.trim().length > 50; }",
                    timeout=30_000,
                )
                body = page.evaluate(
                    "() => document.getElementById('root').innerHTML"
                )
            except Exception as exc:  # noqa: BLE001 - report and continue
                failures.append(f"{route}: {type(exc).__name__}: {exc}")
                print(f"  [{index}/{len(planned)}] FAIL {route} - {exc}")
                continue

            if args.dry_run:
                print(f"  [{index}/{len(planned)}] {route} "
                      f"rendered {len(body):,} bytes (dry run)")
                continue

            source = dist / dest.relative_to(args.out_dir or dist)
            original = source.read_text(encoding="utf-8")
            if not ROOT_DIV_RE.search(original):
                failures.append(f"{route}: no empty #root container in "
                                f"{source.name} (already injected?)")
                continue
            before_total += len(original)
            updated = ROOT_DIV_RE.sub(
                lambda m: m.group(1) + body + m.group(2), original, count=1
            )
            after_total += len(updated)
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(updated, encoding="utf-8")
            if args.verbose or index <= 3 or index % 25 == 0:
                print(f"  [{index}/{len(planned)}] {route} "
                      f"{len(original):,} -> {len(updated):,} bytes")

        browser.close()

    httpd.shutdown()

    elapsed = time.time() - started
    print(f"\nprerender-body: {len(planned) - len(failures)}/{len(planned)} "
          f"routes in {elapsed:.0f}s")
    if not args.dry_run:
        print(f"  corpus {before_total:,} -> {after_total:,} bytes "
              f"(+{after_total - before_total:,})")

    if failures:
        print(f"\n{len(failures)} failure(s):")
        for failure in failures[:20]:
            print(f"  - {failure}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
