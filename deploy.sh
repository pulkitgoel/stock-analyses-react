#!/bin/bash
# ====================================================
# Deploy React SPA to stocksfundamentals.online
# ====================================================
set -e

cd /var/www/stock-analyses-react

# Must be `npm run build`, not `npx vite build`.
#
# `npm run build` runs the full pipeline:
#   generate-analyses-data.js  rebuilds src/data/analyses.generated.ts
#   generate-sitemap.js        rebuilds public/sitemap.xml with lastmod
#   tsc -b                     typechecks
#   vite build                 bundles into dist/
#   generate-og-files.py       writes dist/analysis/*.html (the prerendered
#                              title, description, canonical and JSON-LD that
#                              every crawler reads)
#
# Running `vite build` alone skips the first two and the last, so a deploy would
# ship a stale sitemap and stale prerendered pages.
echo "Building (full pipeline: data, sitemap, typecheck, bundle, prerender)..."
npm run build

echo ""
echo "Build complete. Nginx serves from /var/www/stock-analyses-react/dist"
echo ""
echo "Verify the prerender actually shipped — this must print well over 20000:"
echo "  curl -s -A Googlebot https://stocksfundamentals.online/ | wc -c"
echo ""
echo "If you changed nginx config (see docs/nginx-seo.conf):"
echo "  sudo nginx -t && sudo nginx -s reload"
