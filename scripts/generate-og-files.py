#!/usr/bin/env python3
"""Generate per-analysis prerendered HTML for crawlers and social link previews.

Reads analyses.json and writes dist/analysis/{slug}.html with a per-article
title, meta description, canonical URL, Open Graph / Twitter tags and a single
Article (or NewsArticle) JSON-LD block.

These files are what Googlebot, social crawlers and AI crawlers receive before
any JavaScript runs, so everything a crawler needs must be present here.

CRITICAL: reads JS/CSS asset hashes from dist/index.html so the generated files
stay in sync with each build's unique filenames.

Two rules worth preserving if you edit this file:
  1. Build JSON-LD with json.dumps(), never with f-string interpolation. JSON is
     not HTML, so HTML entities must never be written into JSON string values.
  2. HTML-escape only the values that land in HTML attributes, via html.escape().
"""
import html
import json
import os
import re
import sys

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPTS_DIR)
# Output root. Defaults to dist/, but a deploy can pass `--dist dir` to generate
# into a staging directory and swap it in, so the live document root is never
# emptied while this runs.
DIST_DIR = os.path.join(REPO_ROOT, "dist")
for _i, _arg in enumerate(sys.argv):
    if _arg == "--dist" and _i + 1 < len(sys.argv):
        DIST_DIR = os.path.abspath(sys.argv[_i + 1])
    elif _arg.startswith("--dist="):
        DIST_DIR = os.path.abspath(_arg.split("=", 1)[1])
PUBLIC_DIR = os.path.join(REPO_ROOT, "public")
# Prefer the repo's OWN generated data so OG files never lag a fresh publish.
# (The legacy static-site copy is only a fallback; it goes stale after each publish.)
ANALYSES_FILE = os.path.join(PUBLIC_DIR, "analyses.json")
LEGACY_ANALYSES_FILE = "/var/www/stock-analyses/analyses.json"

SITE_URL = "https://stocksfundamentals.online"
SITE_NAME = "StocksFundamentals"
AUTHOR_NAME = "Pulkit Goel"
DEFAULT_OG_IMAGE = "/og-default.png"

# Meta descriptions are cut on a word boundary below this length, never mid-word.
DESCRIPTION_LIMIT = 155

# Tags that identify the daily policy-commentary series. Those are news pieces;
# everything else is evergreen analysis.
NEWS_TAGS = {"policy-pulse"}

# Index and exchange tokens that appear inside ticker strings but are not
# companies. Kept in sync with the same list in generate-sitemap.js.
NON_COMPANY = {
    "NSE", "BSE", "NASDAQ", "NYSE", "NIFTY", "NIFTY_IT", "BANKNIFTY", "SENSEX",
    "US", "IT", "SPX", "NDX", "DJI", "FII", "DII", "GEMS",
}


def load_analyses():
    path = ANALYSES_FILE if os.path.exists(ANALYSES_FILE) else LEGACY_ANALYSES_FILE
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return data.get("analyses", [])
    return []


def load_asset_hashes():
    """Read dist/index.html to extract current JS/CSS asset filenames."""
    index_path = os.path.join(DIST_DIR, "index.html")
    if not os.path.exists(index_path):
        return {"js": "/assets/index.js", "css": "/assets/index.css"}
    with open(index_path, encoding="utf-8") as f:
        content = f.read()
    js_match = re.search(r'src="(/assets/index-[^"]+\.js)"', content)
    css_match = re.search(r'href="(/assets/index-[^"]+\.css)"', content)
    return {
        "js": js_match.group(1) if js_match else "/assets/index.js",
        "css": css_match.group(1) if css_match else "/assets/index.css",
    }


def has_og_image():
    """The og:image tag is only emitted when the asset actually exists.

    Declaring summary_large_image with no image makes every share render as a
    blank card, so an absent file must mean an absent tag.
    """
    return os.path.exists(os.path.join(PUBLIC_DIR, DEFAULT_OG_IMAGE.lstrip("/")))


def clean_text(value):
    """Collapse whitespace and drop stray backslash escapes.

    Non-ASCII is preserved: these files are served UTF-8.

    A backslash before an apostrophe or quote is never intentional in prose. One
    publishing batch leaked `SEBI\\'s` into four articles, which rendered
    literally in search results and share previews. Normalising here keeps the
    artifact out of meta tags even if it reappears in source data.
    """
    text = re.sub(r"\\+([\"'])", r"\1", (value or ""))
    return re.sub(r"\s+", " ", text).strip()


def smart_truncate(text, limit=DESCRIPTION_LIMIT):
    """Truncate on the last word boundary before `limit`, appending an ellipsis.

    A hard slice leaves descriptions ending mid-word ("...operations in Iran and"),
    which is what search results and share previews then display.
    """
    text = clean_text(text)
    if len(text) <= limit:
        return text
    cut = text[:limit]
    space = cut.rfind(" ")
    if space > limit * 0.6:
        cut = cut[:space]
    return cut.rstrip(" ,;:-—") + "…"


def ticker_tokens(raw):
    """Split the colon-delimited ticker field into real company tokens."""
    tokens = []
    for token in re.split(r"[:/]", str(raw or "")):
        token = token.strip()
        if token and token.upper() not in NON_COMPANY:
            tokens.append(token.upper())
    return tokens


def article_section(tags):
    if NEWS_TAGS & {t.lower() for t in tags}:
        return "Policy Pulse"
    if any("deep-dive" in t.lower() or "deepdive" in t.lower() for t in tags):
        return "Deep Dive"
    return "Market Notes"


def build_jsonld(slug, title, description, analysis, image_url):
    """Return the JSON-LD block as a string, serialised with json.dumps().

    Only one Article block is emitted per page. The client-side Helmet block in
    AnalysisPage.tsx was removed so the two can no longer disagree.
    """
    tags = analysis.get("tags") or []
    url = "%s/analysis/%s" % (SITE_URL, slug)
    is_news = bool(NEWS_TAGS & {str(t).lower() for t in tags})

    data = {
        "@context": "https://schema.org",
        "@type": "NewsArticle" if is_news else "Article",
        "headline": title[:110],
        "description": description,
        "url": url,
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "inLanguage": "en-IN",
        "articleSection": article_section(tags),
        "author": {
            "@type": "Person",
            "name": AUTHOR_NAME,
            "url": "%s/about" % SITE_URL,
        },
        "publisher": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": SITE_URL,
        },
    }

    date = clean_text(analysis.get("date"))
    if date:
        data["datePublished"] = date
    # Optional `updated:` frontmatter. Never defaulted to datePublished, because
    # claiming an article was modified when it was not is a false signal.
    updated = clean_text(analysis.get("updated"))
    if updated:
        data["dateModified"] = updated

    if tags:
        data["keywords"] = ", ".join(str(t) for t in tags)

    if image_url:
        data["image"] = [SITE_URL + image_url]
        data["publisher"]["logo"] = {
            "@type": "ImageObject",
            "url": SITE_URL + image_url,
        }

    # A single-company piece gets an `about` entity. Multi-ticker policy notes do
    # not, because naming 50 companies as the subject of one article is noise.
    tokens = ticker_tokens(analysis.get("ticker"))
    if len(tokens) == 1:
        data["about"] = {"@type": "Corporation", "tickerSymbol": tokens[0]}

    return json.dumps(data, indent=2, ensure_ascii=False)


def render_shell(title, description, canonical, jsonld, assets, image_url,
                 og_type="article", extra_head=""):
    """Render the prerendered HTML shell shared by every page type.

    The body stays an empty #root: this prerender supplies head metadata only.
    Prerendering the article body as well is the remaining high-value change,
    and it is what would make the content visible to AI crawlers.
    """
    t_attr = html.escape(title, quote=True)
    d_attr = html.escape(description, quote=True)

    image_tags = ""
    if image_url:
        image_tags = (
            '\n    <meta property="og:image" content="%s%s" />'
            '\n    <meta property="og:image:width" content="1200" />'
            '\n    <meta property="og:image:height" content="630" />'
            '\n    <meta name="twitter:image" content="%s%s" />'
            % (SITE_URL, image_url, SITE_URL, image_url)
        )

    return '''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" sizes="48x48" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>%(title)s</title>
    <meta name="description" content="%(desc)s" />
    <link rel="canonical" href="%(url)s" />%(extra)s
    <meta property="og:title" content="%(title)s" />
    <meta property="og:description" content="%(desc)s" />
    <meta property="og:type" content="%(ogtype)s" />
    <meta property="og:url" content="%(url)s" />
    <meta property="og:site_name" content="%(site)s" />
    <meta property="og:locale" content="en_IN" />%(image)s
    <meta name="twitter:card" content="%(card)s" />
    <meta name="twitter:title" content="%(title)s" />
    <meta name="twitter:description" content="%(desc)s" />
    <meta name="author" content="%(author)s" />
    <script>
      try {
        const saved = localStorage.getItem('sf-theme-v2');
        document.documentElement.dataset.theme = saved || 'dark';
      } catch {
        document.documentElement.dataset.theme = 'dark';
      }
    </script>
    <script type="application/ld+json">
%(jsonld)s
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="%(js)s"></script>
    <link rel="stylesheet" crossorigin href="%(css)s">
  </body>
</html>
''' % {
        "title": t_attr,
        "desc": d_attr,
        "url": canonical,
        "ogtype": og_type,
        "extra": extra_head,
        "site": SITE_NAME,
        "image": image_tags,
        # summary_large_image promises an image. Without one, fall back to the
        # small card so the preview is not a blank rectangle.
        "card": "summary_large_image" if image_url else "summary",
        "author": html.escape(AUTHOR_NAME, quote=True),
        "jsonld": jsonld,
        "js": assets["js"],
        "css": assets["css"],
    }


def generate_og_html(analysis, assets, image_url):
    """Build the prerendered HTML for one analysis."""
    slug = analysis.get("slug", "") or analysis.get("file", "").replace(".html", "")
    title = clean_text(analysis.get("title")) or "Stock Analysis"
    description = smart_truncate(analysis.get("summary"))
    date = clean_text(analysis.get("date"))

    # The markdown source is the only machine-readable copy of the article, and
    # its path (/analyses/{slug}.md) is not guessable from the page URL
    # (/analysis/{slug}). This link is how an agent discovers it.
    extra = '\n    <link rel="alternate" type="text/markdown" href="/analyses/%s.md" title="%s (Markdown)" />' % (
        slug, html.escape(title, quote=True))
    if date:
        extra += '\n    <meta property="article:published_time" content="%s" />' % html.escape(date, quote=True)

    return render_shell(
        title=title,
        description=description,
        canonical="%s/analysis/%s" % (SITE_URL, slug),
        jsonld=build_jsonld(slug, title, description, analysis, image_url),
        assets=assets,
        image_url=image_url,
        og_type="article",
        extra_head=extra,
    )


# Static routes prerendered so a non-JS crawler does not receive the generic
# site title on them.
#
# KEEP THESE IN SYNC with the <title> and description in the matching component
# under src/pages/. They are duplicated here only because those components are
# client-rendered and a crawler never executes them.
STATIC_PAGES = {
    "about": (
        "About Pulkit & StocksFundamentals",
        "Independent equity research on Indian stocks by Pulkit Goel: methodology, "
        "coverage and how these analyses are produced.",
    ),
    "contact": (
        "Contact & Stock Requests — StocksFundamentals",
        "Request a deep dive on a specific stock, or get in touch about the research "
        "published on StocksFundamentals.",
    ),
    "disclaimer": (
        "Risk Disclaimer — StocksFundamentals",
        "Research published here is for information only and is not investment advice. "
        "Read the full risk disclaimer before acting on any analysis.",
    ),
    "privacy": (
        "Privacy Policy — StocksFundamentals",
        "What StocksFundamentals collects, how it is used, and your choices.",
    ),
}


def company_stats(analyses):
    """Aggregate per-ticker coverage, matching the rules in generate-sitemap.js."""
    stats = {}
    for a in analyses:
        tags = {str(t).lower() for t in (a.get("tags") or [])}
        series = bool(NEWS_TAGS & tags)
        date = clean_text(a.get("date"))
        for token in ticker_tokens(a.get("ticker")):
            key = token.lower()
            stat = stats.setdefault(key, {"research": 0, "mentions": 0, "latest": None})
            if series:
                stat["mentions"] += 1
            else:
                stat["research"] += 1
            if date and (not stat["latest"] or date > stat["latest"]):
                stat["latest"] = date
    return stats


def generate_company_html(ticker, stat, assets, image_url):
    """Prerender one company hub.

    Without this, all 625 company URLs served the generic homepage title to any
    crawler that does not run JavaScript.
    """
    upper = ticker.upper()
    url = "%s/company/%s" % (SITE_URL, ticker)
    research, mentions = stat["research"], stat["mentions"]

    title = "%s Stock Analysis & Research — %s" % (upper, SITE_NAME)
    if research:
        description = (
            "%d deep-dive%s on %s, plus %d policy note%s that reference it."
            % (research, "" if research == 1 else "s", upper,
               mentions, "" if mentions == 1 else "s")
        )
    else:
        description = "Policy and market notes referencing %s." % upper

    data = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": url,
        "inLanguage": "en-IN",
        "about": {"@type": "Corporation", "tickerSymbol": upper},
        "isPartOf": {"@type": "WebSite", "@id": "%s/#website" % SITE_URL},
    }
    if stat["latest"]:
        data["dateModified"] = stat["latest"]

    return render_shell(
        title=title,
        description=description,
        canonical=url,
        jsonld=json.dumps(data, indent=2, ensure_ascii=False),
        assets=assets,
        image_url=image_url,
        og_type="website",
        extra_head="",
    )


def generate_static_html(route, title, description, assets, image_url):
    data = {
        "@context": "https://schema.org",
        "@type": "ProfilePage" if route == "about" else "WebPage",
        "name": title,
        "description": description,
        "url": "%s/%s" % (SITE_URL, route),
        "inLanguage": "en-IN",
        "isPartOf": {"@type": "WebSite", "@id": "%s/#website" % SITE_URL},
    }
    if route == "about":
        data["mainEntity"] = {
            "@type": "Person",
            "@id": "%s/#author" % SITE_URL,
            "name": AUTHOR_NAME,
            "url": "%s/about" % SITE_URL,
            "jobTitle": "Independent investor and researcher",
        }

    return render_shell(
        title=title,
        description=description,
        canonical="%s/%s" % (SITE_URL, route),
        jsonld=json.dumps(data, indent=2, ensure_ascii=False),
        assets=assets,
        image_url=image_url,
        og_type="website",
        extra_head="",
    )


# --- Tag and archive routes (AGENTS.md section 7.5) -------------------------
#
# The homepage renders nine cards and hides the other 245 articles behind a
# JavaScript "load more", so nothing linked to them and they were reachable
# through the sitemap alone. /analyses/page/N lists them nine at a time in plain
# crawlable HTML, and /tag/{tag} gathers a topic in one place.
#
# Keep both constants in sync with MIN_TAG_ARTICLES / ARCHIVE_PAGE_SIZE in
# scripts/generate-sitemap.js and src/utils/tags.ts.
MIN_TAG_ARTICLES = 12
ARCHIVE_PAGE_SIZE = 9


def tag_slug(tag):
    """URL-safe form of a tag. Mirrors tagSlug() in src/utils/tags.ts."""
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", str(tag or "").strip().lower()))


def display_tag(raw):
    """`policy-pulse` reads as `Policy Pulse`. Mirrors displayTag() in the pages."""
    if raw != raw.lower():
        return raw
    words = [w for w in re.split(r"[-_]", raw) if w]
    return " ".join(w if w.isdigit() else w[:1].upper() + w[1:] for w in words)


def tag_stats(analyses):
    """Aggregate tag coverage, matching the rules in generate-sitemap.js."""
    stats = {}
    for a in analyses:
        date = clean_text(a.get("date"))
        seen = set()
        for raw in a.get("tags") or []:
            slug = tag_slug(raw)
            if not slug or slug in seen:
                continue
            seen.add(slug)
            stat = stats.setdefault(slug, {"tag": str(raw), "count": 0, "latest": None})
            stat["count"] += 1
            if date and (not stat["latest"] or date > stat["latest"]):
                stat["latest"] = date
    return stats


def newest_article_date(analyses):
    dates = [clean_text(a.get("date")) for a in analyses]
    dates = [d for d in dates if re.match(r"^\d{4}-\d{2}-\d{2}$", d)]
    return max(dates) if dates else None


def generate_tag_html(slug, stat, assets, image_url):
    """Prerender one tag page.

    Same reason as the company hubs: a route with no prerendered file serves the
    generic homepage title to any crawler that does not execute JavaScript.
    """
    url = "%s/tag/%s" % (SITE_URL, slug)
    label = display_tag(stat["tag"])
    count = stat["count"]

    title = "%s — Analysis & Research" % label
    description = smart_truncate(
        "%d article%s tagged %s: company deep dives, delivery data and policy "
        "notes on StocksFundamentals." % (count, "" if count == 1 else "s", label)
    )

    data = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": url,
        "inLanguage": "en-IN",
        "isPartOf": {"@type": "WebSite", "@id": "%s/#website" % SITE_URL},
        "mainEntity": {"@type": "ItemList", "numberOfItems": count},
    }
    if stat["latest"]:
        data["dateModified"] = stat["latest"]

    return render_shell(
        title=title,
        description=description,
        canonical=url,
        jsonld=json.dumps(data, indent=2, ensure_ascii=False),
        assets=assets,
        image_url=image_url,
        og_type="website",
        extra_head="",
    )


def generate_archive_html(page, total_pages, total_articles, newest_date, assets, image_url):
    """Prerender one page of the crawlable archive."""
    url = "%s/analyses/page/%d" % (SITE_URL, page)
    if page == 1:
        title = "All Analysis, Research & Policy Notes"
        description = smart_truncate(
            "Every analysis published on StocksFundamentals, newest first: %d "
            "company deep dives and policy notes." % total_articles
        )
    else:
        title = "All Analysis — Page %d of %d" % (page, total_pages)
        description = smart_truncate(
            "Page %d of %d of the StocksFundamentals research library."
            % (page, total_pages)
        )

    data = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": url,
        "inLanguage": "en-IN",
        "isPartOf": {"@type": "WebSite", "@id": "%s/#website" % SITE_URL},
        "mainEntity": {"@type": "ItemList", "numberOfItems": total_articles},
    }
    if newest_date:
        data["dateModified"] = newest_date

    return render_shell(
        title=title,
        description=description,
        canonical=url,
        jsonld=json.dumps(data, indent=2, ensure_ascii=False),
        assets=assets,
        image_url=image_url,
        og_type="website",
        extra_head="",
    )


def main():
    analyses = load_analyses()
    if not analyses:
        print("No analyses found in %s" % ANALYSES_FILE)
        sys.exit(1)

    assets = load_asset_hashes()
    print("Asset hashes: JS=%s CSS=%s" % (assets["js"], assets["css"]))

    image_url = DEFAULT_OG_IMAGE if has_og_image() else None
    if image_url:
        print("OG image: %s" % image_url)
    else:
        print("WARNING: public%s missing. Emitting no og:image and falling back "
              "to twitter:card=summary." % DEFAULT_OG_IMAGE)

    invalid = []

    def write(page, out_path, label):
        """Write a page, but only after its JSON-LD parses."""
        block = re.search(
            r'<script type="application/ld\+json">\s*(.*?)\s*</script>',
            page,
            re.DOTALL,
        )
        try:
            json.loads(block.group(1))
        except (AttributeError, ValueError) as exc:
            invalid.append((label, str(exc)))
            return False
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(page)
        return True

    # --- Analysis pages ---
    analysis_dir = os.path.join(DIST_DIR, "analysis")
    n_analysis = 0
    for a in analyses:
        slug = a.get("slug", "") or a.get("file", "").replace(".html", "")
        if not slug:
            continue
        if write(generate_og_html(a, assets, image_url),
                 os.path.join(analysis_dir, "%s.html" % slug), slug):
            n_analysis += 1
    print("Generated %d analysis pages in %s" % (n_analysis, analysis_dir))

    # --- Company hubs ---
    #
    # Only the hubs the sitemap lists are prerendered. The rest render
    # client-side with `noindex, follow`, so giving them crawler metadata would
    # defeat the point.
    stats = company_stats(analyses)
    indexable = sorted(t for t, s in stats.items() if s["research"] >= 1)
    company_dir = os.path.join(DIST_DIR, "company")
    n_company = 0
    for ticker in indexable:
        if write(generate_company_html(ticker, stats[ticker], assets, image_url),
                 os.path.join(company_dir, "%s.html" % ticker), "company/%s" % ticker):
            n_company += 1
    print("Generated %d company hubs in %s (%d left client-only, noindex)"
          % (n_company, company_dir, len(stats) - len(indexable)))

    # --- Static pages ---
    n_static = 0
    for route, (title, description) in STATIC_PAGES.items():
        if write(generate_static_html(route, title, description, assets, image_url),
                 os.path.join(DIST_DIR, "%s.html" % route), route):
            n_static += 1
    print("Generated %d static pages in %s" % (n_static, DIST_DIR))

    # --- Tag pages ---
    # Only tags that clear the coverage floor are prerendered. A thinner tag
    # still renders client-side with `noindex, follow`, so linking to one is
    # harmless but it never becomes an indexable page.
    tstats = tag_stats(analyses)
    tag_dir = os.path.join(DIST_DIR, "tag")
    n_tag = 0
    for slug in sorted(tstats):
        stat = tstats[slug]
        if stat["count"] < MIN_TAG_ARTICLES:
            continue
        if write(generate_tag_html(slug, stat, assets, image_url),
                 os.path.join(tag_dir, "%s.html" % slug), "tag/%s" % slug):
            n_tag += 1
    print("Generated %d tag pages in %s (%d left client-only, noindex)"
          % (n_tag, tag_dir, sum(1 for s in tstats.values() if s["count"] < MIN_TAG_ARTICLES)))

    # --- Archive pages ---
    total_pages = max(1, -(-len(analyses) // ARCHIVE_PAGE_SIZE))
    newest = newest_article_date(analyses)
    archive_dir = os.path.join(DIST_DIR, "analyses", "page")
    n_archive = 0
    for page in range(1, total_pages + 1):
        if write(generate_archive_html(page, total_pages, len(analyses), newest,
                                       assets, image_url),
                 os.path.join(archive_dir, "%d.html" % page), "analyses/page/%d" % page):
            n_archive += 1
    print("Generated %d archive pages in %s" % (n_archive, archive_dir))

    if invalid:
        print("\nERROR: %d page(s) produced invalid JSON-LD and were not written:" % len(invalid))
        for label, err in invalid:
            print("  %s: %s" % (label, err))
        sys.exit(1)


if __name__ == "__main__":
    main()
