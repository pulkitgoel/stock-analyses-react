#!/usr/bin/env python3
"""Nginx OG tag injector - serves per-analysis Open Graph meta tags for social media crawlers."""
import sys, os, json, re

OG_MAP = {}

def load_map():
    global OG_MAP
    try:
        with open("/var/www/stock-analyses/analyses.json") as f:
            data = json.load(f)
        for a in data.get("analyses", []):
            slug = a.get("slug", "") or a.get("file", "").replace(".html", "")
            title = a.get("title", "Stock Analysis")
            clean_title = re.sub(r'[^\x00-\x7F]+', ' ', title).strip()
            clean_title = re.sub(r'\s+', ' ', clean_title)
            summary = a.get("summary", "Deep-dive fundamental analysis of Indian stocks.")
            OG_MAP[slug] = {
                "title": clean_title,
                "description": summary[:160],
            }
    except Exception as e:
        pass

def generate_og_html(slug):
    if slug in OG_MAP:
        d = OG_MAP[slug]
        t = d["title"]
        desc = d["description"]
        lines = []
        lines.append('<meta property="og:title" content="%s" />' % t)
        lines.append('<meta property="og:description" content="%s" />' % desc)
        lines.append('<meta property="og:type" content="article" />')
        lines.append('<meta property="og:url" content="https://stocksfundamentals.online/analysis/%s" />' % slug)
        lines.append('<meta property="og:site_name" content="stocksfundamentals.online" />')
        lines.append('<meta name="twitter:card" content="summary_large_image" />')
        lines.append('<meta name="twitter:title" content="%s" />' % t)
        lines.append('<meta name="twitter:description" content="%s" />' % desc)
        lines.append('<meta name="description" content="%s" />' % desc)
        dash = "\u2014"
        lines.append('<title>%s %s stocksfundamentals.online</title>' % (t, dash))
        return "\n  ".join(lines)
    return None

def main():
    load_map()
    request_uri = os.environ.get("REQUEST_URI", "/")
    m = re.match(r'^/analysis/([^/]+)/?$', request_uri)
    if m:
        slug = m.group(1)
        og_html = generate_og_html(slug)
        if og_html:
            print(og_html)
            return
    print("")

if __name__ == "__main__":
    main()
