#!/bin/bash
# ====================================================
# Deploy React SPA to stocksfundamentals.online
# ====================================================
set -euo pipefail

cd /var/www/stock-analyses-react

# --- Why this stages the build instead of building in place -----------------
# `vite build` empties its output directory at the start. When that directory is
# the live document root, every prerendered /analysis/* and /company/* URL
# returns 404 for as long as the rest of the pipeline runs, and step 7 takes
# roughly five minutes over 410 routes. Crawlers arriving in that window record
# 404s on article URLs, which is the exact outcome the SEO work exists to
# prevent.
#
# So: build into dist.next, generate every prerendered artifact there, then swap
# it into place with two renames. The exposed window is milliseconds, and a
# failure anywhere before the swap leaves the live site untouched.
# ---------------------------------------------------------------------------

STAGE="dist.next"

# --- One deploy at a time ---------------------------------------------------
# The staging design assumes this script owns dist.next for its whole run. It
# does not, without a lock: a second deploy starting mid-run hits the `rm -rf`
# below and deletes the staging directory out from under the first, which then
# dies partway through the prerender on a missing file.
#
# That happened on 2026-10-11 — a build died at route 250 on a missing
# company/aal.html. Production was untouched, because the failure landed before
# the swap, which is the staging design doing its job. The lock stops the build
# being lost in the first place.
#
# Non-blocking on purpose: a deploy that starts while another is running is
# almost always redundant (same commit), so failing fast and saying so beats
# queueing a second full prerender. Exiting non-zero also means an automated
# caller — scripts/handoff-watcher.py — records a skip rather than reporting a
# success it did not perform.
#
# flock releases the lock when the file descriptor closes, including on crash
# or kill, so a dead deploy cannot leave the lock held.
LOCKFILE="/tmp/stocksfundamentals-deploy.lock"
exec 9>"$LOCKFILE"
if ! flock -n 9; then
  echo "deploy.sh: another deploy is already running (lock: $LOCKFILE)." >&2
  echo "           Refusing to start — it would delete $STAGE mid-build." >&2
  exit 1
fi

rm -rf "$STAGE"

# --- An update merges; it does not replace ----------------------------------
# A re-analysis is supposed to layer new numbers onto the existing article. On
# 2026-10-25 an unattended runner rewrote the Sanghvi deep dive instead: 713
# lines became 275, the business overview, annual financials, balance sheet,
# cash flow, shareholding, order book, valuation table and bull/bear case all
# vanished, and every gate passed because nothing compared the two.
#
# This runs before anything is built so a shrinking article costs seconds, not
# ten minutes. ALLOW_SHRINK=1 overrides it; the commit message must then say why.
python3.12 scripts/check-article-shrink.py

# --- An article is not finished because it is long -------------------------
# Tega and NALCO both cleared the word-count floor and both shipped without the
# reference sections the June deep dives carried: business overview, annual
# financials, cash flow, order book, Screener pros/cons. Word count cannot see
# that, so this checks the structure itself. ALLOW_THIN=1 overrides it.
python3.12 scripts/check-article-sections.py

echo "Step 1-2/7  data + sitemap"
node scripts/generate-analyses-data.js
node scripts/generate-sitemap.js

echo "Step 3/7    discovery files (llms.txt, llms-full.txt, rss.xml)"
python3.12 scripts/generate-discovery-files.py

echo "Step 4/7    typecheck"
tsc -b

echo "Step 5/7    bundle -> $STAGE"
npx vite build --outDir "$STAGE" --emptyOutDir

echo "Step 6/7    per-page head (title, description, canonical, OG, JSON-LD)"
python3.12 scripts/generate-og-files.py --dist "$STAGE"

echo "Step 7/7    article body prerender (incremental, headless Chrome)"
# Reuse: an /analysis page whose markdown and related-set are unchanged since the
# live build is copied instead of re-rendered. Everything else re-renders, because
# its body is built from data the shell cannot see.
#
# Deliberately SEQUENTIAL. Four workers were tried on 2026-10-25 and each rendered
# its 157-route shard in 455-466s - the same wall clock as one worker doing all 628,
# because the box is CPU-bound and four Chromiums simply share it. It also produced
# two route timeouts (company/hal, company/gold) that the sequential run does not.
# The win is the reuse, not the parallelism.
python3.12 scripts/prerender-body.py --dist "$STAGE" --reuse-from dist --workers 1

echo "Swapping $STAGE into place..."
if [ -d dist ]; then mv dist dist.previous; fi
mv "$STAGE" dist
rm -rf dist.previous

echo ""
echo "Deployed. Nginx serves from $(pwd)/dist"
echo ""
echo "Verify the prerender actually shipped - this must print well over 20000:"
echo "  curl -s -A Googlebot https://stocksfundamentals.online/ | wc -c"
echo ""
echo "If you changed nginx config (see docs/nginx-seo.conf):"
echo "  sudo nginx -t && sudo nginx -s reload"
