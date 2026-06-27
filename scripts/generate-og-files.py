#!/usr/bin/env python3
"""Generate per-analysis OG HTML files for social media link previews.

Reads analyses.json, generates per-analysis HTML files at dist/analysis/{slug}.html
with proper og:title, og:description, twitter:card, and schema.org markup.

These files let WhatsApp, Telegram, Twitter/X show rich link previews
instead of generic site info when sharing analysis links.

CRITICAL: Reads JS/CSS asset hashes from dist/index.html so OG files
stay in sync with each build's unique filenames.
"""
import json, os, re, sys

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPTS_DIR)
DIST_DIR = os.path.join(REPO_ROOT, "dist")
ANALYSES_FILE = "/var/www/stock-analyses/analyses.json"

def load_analyses():
    if os.path.exists(ANALYSES_FILE):
        with open(ANALYSES_FILE) as f:
            data = json.load(f)
        return data.get("analyses", [])
    return []

def load_asset_hashes():
    """Read dist/index.html to extract current JS/CSS asset filenames."""
    index_path = os.path.join(DIST_DIR, "index.html")
    if not os.path.exists(index_path):
        return {"js": "/assets/index.js", "css": "/assets/index.css"}
    with open(index_path) as f:
        content = f.read()
    js_match = re.search(r'src="(/assets/index-[^"]+\.js)"', content)
    css_match = re.search(r'href="(/assets/index-[^"]+\.css)"', content)
    return {
        "js": js_match.group(1) if js_match else "/assets/index.js",
        "css": css_match.group(1) if css_match else "/assets/index.css",
    }

def generate_og_html(slug, title, summary, assets):
    """Generate full HTML with per-analysis OG tags that still loads the SPA JS bundle."""
    clean_title = re.sub(r'[^\x00-\x7F]+', ' ', title).strip()
    clean_title = re.sub(r'\s+', ' ', clean_title)
    summary_escaped = summary[:160].replace('"', '&quot;').replace("'", '&#39;')

    return f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{clean_title} &mdash; stocksfundamentals.online</title>
    <meta name="description" content="{summary_escaped}" />
    <meta property="og:title" content="{clean_title}" />
    <meta property="og:description" content="{summary_escaped}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://stocksfundamentals.online/analysis/{slug}" />
    <meta property="og:site_name" content="stocksfundamentals.online" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{clean_title}" />
    <meta name="twitter:description" content="{summary_escaped}" />
    <script>
      try {{
        const saved = localStorage.getItem('sf-theme-v2');
        document.documentElement.dataset.theme = saved || 'dark';
      }} catch {{
        document.documentElement.dataset.theme = 'dark';
      }}
    </script>
    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "AnalysisNewsArticle",
        "headline": "{clean_title}",
        "description": "{summary_escaped}",
        "url": "https://stocksfundamentals.online/analysis/{slug}",
        "author": {{ "@type": "Person", "name": "Pulkit" }}
    }}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="{assets['js']}"></script>
    <link rel="stylesheet" crossorigin href="{assets['css']}">
  </body>
</html>'''

def main():
    analyses = load_analyses()
    if not analyses:
        print("No analyses found in %s" % ANALYSES_FILE)
        sys.exit(1)

    assets = load_asset_hashes()
    print("Asset hashes: JS=%s CSS=%s" % (assets["js"], assets["css"]))

    output_dir = os.path.join(DIST_DIR, "analysis")
    os.makedirs(output_dir, exist_ok=True)

    count = 0
    for a in analyses:
        slug = a.get("slug", "") or a.get("file", "").replace(".html", "")
        if not slug:
            continue
        title = a.get("title", "Stock Analysis")
        summary = a.get("summary", "Deep-dive fundamental analysis of Indian stocks.")
        
        html = generate_og_html(slug, title, summary, assets)
        filepath = os.path.join(output_dir, f"{slug}.html")
        
        with open(filepath, "w") as f:
            f.write(html)
        count += 1

    print("Generated %d per-analysis OG HTML files in %s" % (count, output_dir))

if __name__ == "__main__":
    main()
