#!/usr/bin/env python3.12
"""Generate the plain-text discovery files: llms.txt, llms-full.txt, rss.xml.

WHY
---
AGENTS.md section 7.6: the site had no machine-readable index beyond
sitemap.xml, so an LLM or feed reader had no cheap way to see what the corpus
contains. These three files are written into `public/` so Vite copies them into
the build output, and nginx already serves that directory with
`try_files $uri =404` (a clean 404, never the SPA shell).

  llms.txt       - the llms.txt convention: what the site is, plus a linked
                   index of the most recent research and the static pages.
  llms-full.txt  - the entire corpus in markdown, front matter included. Large
                   by design: it is the one artefact that lets a model read
                   everything without crawling 250 pages.
  rss.xml        - RSS 2.0, newest 50 articles, for feed readers and the
                   autodiscovery <link> in index.html.

Usage:
    python3.12 scripts/generate-discovery-files.py [--public public] [--limit N]
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import sys
from pathlib import Path

SITE_URL = "https://stocksfundamentals.online"
SITE_NAME = "StocksFundamentals"
SITE_TAGLINE = ("Independent equity research: fundamental deep dives, quarterly "
                "results analysis and market context for Indian and global stocks.")
AUTHOR = "Pulkit Goel"
RSS_ITEM_LIMIT = 50
LLMS_INDEX_LIMIT = 60

STATIC_PAGES = [
    ("/about", "About this desk and its methodology"),
    ("/disclaimer", "Risk disclaimer"),
    ("/contact", "Contact"),
]


def load_analyses(public: Path) -> list[dict]:
    path = public / "analyses.json"
    if not path.exists():
        sys.exit("generate-discovery-files: public/analyses.json missing - run "
                 "generate-analyses-data.js first")
    data = json.loads(path.read_text(encoding="utf-8"))
    items = data.get("analyses", data) if isinstance(data, dict) else data
    # Newest first; the feed and the index both lead with the latest work.
    return sorted(items, key=lambda a: a.get("date", ""), reverse=True)


def analysis_url(slug: str) -> str:
    return f"{SITE_URL}/analysis/{slug}"


def one_line(text: str | None, limit: int = 200) -> str:
    """Collapse a summary to a single trimmed line."""
    if not text:
        return ""
    flat = " ".join(str(text).split())
    if len(flat) <= limit:
        return flat
    return flat[: limit - 1].rstrip(" ,.;:") + "\u2026"


def write_llms_txt(public: Path, items: list[dict]) -> int:
    out = [
        f"# {SITE_NAME}",
        "",
        f"> {SITE_TAGLINE}",
        "",
        f"Maintained by {AUTHOR}. {len(items)} articles as of "
        f"{dt.date.today().isoformat()}. Every article is also available as raw "
        f"markdown at {SITE_URL}/analyses/{{slug}}.md",
        "",
        "## Latest research",
        "",
    ]
    for item in items[:LLMS_INDEX_LIMIT]:
        slug = item.get("slug", "")
        out.append(f"- [{item.get('title', slug)}]({analysis_url(slug)}): "
                   f"{one_line(item.get('summary'))}")
    out += ["", "## Pages", ""]
    for route, label in STATIC_PAGES:
        out.append(f"- [{label}]({SITE_URL}{route})")
    out += ["", "## Archive", "",
            f"- [Sitemap]({SITE_URL}/sitemap.xml): every indexed URL",
            f"- [Full corpus markdown]({SITE_URL}/llms-full.txt)",
            ""]
    body = "\n".join(out)
    (public / "llms.txt").write_text(body, encoding="utf-8")
    return len(body)


def write_llms_full_txt(public: Path, items: list[dict]) -> int:
    parts = [
        f"# {SITE_NAME} - full corpus",
        "",
        f"> {SITE_TAGLINE}",
        "",
        f"Generated {dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')}. "
        f"{len(items)} articles. Source: {SITE_URL}",
        "",
        "---",
        "",
    ]
    for item in items:
        slug = item.get("slug", "")
        md_path = public / "analyses" / f"{slug}.md"
        parts += [
            f"# {item.get('title', slug)}",
            "",
            f"- URL: {analysis_url(slug)}",
            f"- Date: {item.get('date', '')}",
            f"- Tickers: {item.get('ticker', '')}",
            f"- Tags: {item.get('tags', '')}",
            "",
        ]
        if md_path.exists():
            text = md_path.read_text(encoding="utf-8")
            # Drop the YAML front matter; its useful fields are listed above.
            if text.startswith("---"):
                end = text.find("\n---", 3)
                if end != -1:
                    text = text[end + 4 :]
            parts += [text.strip(), "", "---", ""]
        else:
            parts += [one_line(item.get("summary")), "", "---", ""]
    body = "\n".join(parts)
    (public / "llms-full.txt").write_text(body, encoding="utf-8")
    return len(body)


def write_rss(public: Path, items: list[dict]) -> int:
    now = dt.datetime.now(dt.timezone.utc).strftime("%a, %d %b %Y %H:%M:%S +0000")
    out = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        "  <channel>",
        f"    <title>{html.escape(SITE_NAME)}</title>",
        f"    <link>{SITE_URL}/</link>",
        f"    <description>{html.escape(SITE_TAGLINE)}</description>",
        "    <language>en-in</language>",
        f"    <lastBuildDate>{now}</lastBuildDate>",
        f'    <atom:link href="{SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />',
    ]
    for item in items[:RSS_ITEM_LIMIT]:
        slug = item.get("slug", "")
        url = analysis_url(slug)
        published = item.get("date", "")
        try:
            stamp = dt.datetime.strptime(published, "%Y-%m-%d").replace(
                tzinfo=dt.timezone.utc).strftime("%a, %d %b %Y 06:30:00 +0000")
        except ValueError:
            stamp = now
        out += [
            "    <item>",
            f"      <title>{html.escape(str(item.get('title', slug)))}</title>",
            f"      <link>{url}</link>",
            f'      <guid isPermaLink="true">{url}</guid>',
            f"      <pubDate>{stamp}</pubDate>",
            f"      <description>{html.escape(one_line(item.get('summary'), 400))}</description>",
            "    </item>",
        ]
    out += ["  </channel>", "</rss>", ""]
    body = "\n".join(out)
    (public / "rss.xml").write_text(body, encoding="utf-8")
    return len(body)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--public", default="public", type=Path)
    parser.add_argument("--limit", type=int, default=0,
                        help="use only the newest N articles (smoke test)")
    args = parser.parse_args()

    public = args.public.resolve()
    items = load_analyses(public)
    if args.limit:
        items = items[: args.limit]

    sizes = {
        "llms.txt": write_llms_txt(public, items),
        "llms-full.txt": write_llms_full_txt(public, items),
        "rss.xml": write_rss(public, items),
    }
    print(f"discovery files: {len(items)} articles")
    for name, size in sizes.items():
        print(f"  {public / name}  ({size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
