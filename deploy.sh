#!/bin/bash
# ====================================================
# Deploy React SPA to stocksfundamentals.online
# ====================================================
set -e

echo "🔨 Building React app..."
cd /var/www/stock-analyses-react
npx vite build

echo "📦 Deployment ready in dist/"
echo "✅ Nginx serves from /var/www/stock-analyses-react/dist"
echo ""
echo "Run: sudo nginx -s reload  (if you change nginx config)"
echo ""
echo "📝 To update: edit src/ files, then run this script again"
