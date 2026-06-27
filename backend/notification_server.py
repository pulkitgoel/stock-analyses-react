#!/usr/bin/env python3.12
"""
Web Push Notification + API Server for Stock Analysis Vault
- GET  /api/analyses           - List all analyses
- GET  /api/analyses/:slug     - Get single analysis metadata
- POST /api/subscribe           - Save push subscription
- POST /api/verify              - Verify subscription exists
- POST /api/unsubscribe         - Remove push subscription
- GET  /api/subscribers         - Count subscribers
- POST /api/notify              - Send push notification (X-Auth-Token required)

Runs alongside Nginx on port 8081.
Uses pywebpush for proper Web Push Protocol encryption.
"""

import json
import os
import sys
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
log = logging.getLogger('api')

BASE_DIR = '/var/www/stock-analyses'
SUBS_FILE = os.path.join(BASE_DIR, 'subscriptions.json')
ANALYSES_FILE = os.path.join(BASE_DIR, 'analyses.json')

# VAPID keys
VAPID_PRIVATE_KEY = "lEjGPLOeT6Wnd5F3hzI1X1TX7KD1GnboDwc-qTufkzc"
VAPID_PUBLIC_KEY = "BIdOd22mLpV5HMsHtmS4uIEl79-zYoJ5b7zpFAGZh000rX_Vx_4MpR9SbnuGUIW4K6YNS17081YMeYayJ1MdUH4"
VAPID_CLAIMS = {"sub": "mailto:pulkitgoel28@gmail.com"}


def load_subs():
    if os.path.exists(SUBS_FILE):
        with open(SUBS_FILE) as f:
            return json.load(f)
    return []


def save_subs(subs):
    with open(SUBS_FILE, 'w') as f:
        json.dump(subs, f, indent=2)


def load_analyses():
    if os.path.exists(ANALYSES_FILE):
        with open(ANALYSES_FILE) as f:
            return json.load(f)
    return {"analyses": []}


def send_push(subscription, title, body, url):
    """Send a push notification using proper Web Push Protocol encryption."""
    try:
        from pywebpush import webpush

        payload = json.dumps({
            'title': title,
            'body': body,
            'url': url,
            'icon': '/favicon.ico',
            'badge': '/favicon.ico',
            'vibrate': [200, 100, 200],
            'requireInteraction': True,
            'tag': 'vault-notification'
        })

        response = webpush(
            subscription_info=subscription,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS,
            ttl=86400  # 24 hours
        )
        return True, response.status_code
    except ImportError:
        log.error("pywebpush not available. Install: pip3.12 install pywebpush --break-system-packages")
        return False, None
    except Exception as e:
        error_str = str(e)
        if '410' in error_str or '404' in error_str:
            log.warning(f"Subscription expired/gone: {error_str}")
            return False, 'expired'
        log.error(f"Push failed: {error_str}")
        return False, error_str


class Handler(BaseHTTPRequestHandler):

    def _read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        if length:
            return self.rfile.read(length).decode()
        return '{}'

    def _json_response(self, status, data):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _parse_path(self, path):
        """Parse /api/analyses or /api/analyses/slug from path."""
        parsed = urlparse(path).path.rstrip('/')
        parts = parsed.split('/')
        # Remove empty strings from split
        parts = [p for p in parts if p]
        return parts

    def do_GET(self):
        path = urlparse(self.path).path.rstrip('/')
        parts = self._parse_path(path)

        log.info(f"GET {path}")

        # GET /api/analyses
        if path == '/api/analyses':
            data = load_analyses()
            # Add slug field to each analysis
            for a in data.get('analyses', []):
                a['slug'] = a['file'].replace('.html', '')
            self._json_response(200, data)
            return

        # GET /api/analyses/:slug
        if len(parts) == 3 and parts[0] == 'api' and parts[1] == 'analyses':
            slug = parts[2]
            data = load_analyses()
            for a in data.get('analyses', []):
                if a['file'].replace('.html', '') == slug:
                    a['slug'] = slug
                    self._json_response(200, a)
                    return
            self._json_response(404, {'error': 'Not found'})
            return

        # GET /api/subscribers
        if path == '/api/subscribers':
            subs = load_subs()
            self._json_response(200, {'count': len(subs)})
            return

        self._json_response(404, {'error': 'Not found'})

    def do_POST(self):
        path = urlparse(self.path).path.rstrip('/')
        body = self._read_body()

        log.info(f"POST {path}")

        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self._json_response(400, {'error': 'Invalid JSON'})
            return

        # POST /api/subscribe
        if path == '/api/subscribe':
            subs = load_subs()
            subscription = data.get('subscription', {})
            endpoint = subscription.get('endpoint', '')

            existing = [s for s in subs if s.get('endpoint') == endpoint]
            if not existing:
                subs.append(subscription)
                save_subs(subs)
                log.info(f"New subscriber added. Total: {len(subs)}")
            else:
                log.info(f"Subscriber already exists. Total: {len(subs)}")

            self._json_response(200, {'status': 'ok', 'count': len(subs)})
            return

        # POST /api/verify
        if path == '/api/verify':
            subs = load_subs()
            endpoint = data.get('endpoint', '')
            valid = any(s.get('endpoint') == endpoint for s in subs)
            self._json_response(200, {'valid': valid})
            return

        # POST /api/unsubscribe
        if path == '/api/unsubscribe':
            subs = load_subs()
            endpoint = data.get('endpoint', '')
            subs = [s for s in subs if s.get('endpoint') != endpoint]
            save_subs(subs)
            log.info(f"Subscriber removed. Total: {len(subs)}")
            self._json_response(200, {'status': 'ok', 'count': len(subs)})
            return

        # POST /api/notify
        if path == '/api/notify':
            auth = self.headers.get('X-Auth-Token', '')
            if auth != 'PULKIT_VAULT_ADMIN':
                self._json_response(403, {'error': 'Unauthorized'})
                return

            title = data.get('title', '📈 New Analysis Published')
            body = data.get('body', 'Check out the latest analysis on the vault.')
            url = data.get('url', '/')

            subs = load_subs()
            sent = 0
            failed = 0
            expired = []

            for i, sub in enumerate(subs):
                success, result = send_push(sub, title, body, url)
                if success:
                    sent += 1
                    log.info(f"Sent to subscriber {i+1}/{len(subs)}: {result}")
                elif result == 'expired':
                    failed += 1
                    expired.append(i)
                else:
                    failed += 1

            if expired:
                subs = [s for i, s in enumerate(subs) if i not in expired]
                save_subs(subs)
                log.info(f"Removed {len(expired)} expired subscriptions")

            self._json_response(200, {
                'status': 'ok',
                'sent': sent,
                'failed': failed,
                'expired_removed': len(expired),
                'total_remaining': len(subs)
            })
            return

        self._json_response(404, {'error': 'Not found'})

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token')
        self.end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
    server = HTTPServer(('0.0.0.0', port), Handler)
    log.info(f"📡 API + Notification server running on port {port}")
    log.info(f"   {len(load_subs())} subscriber(s) loaded")
    log.info(f"   GET  /api/analyses          - List all analyses")
    log.info(f"   GET  /api/analyses/:slug     - Get single analysis")
    log.info(f"   POST /api/subscribe          - Save subscription")
    log.info(f"   POST /api/verify             - Verify subscription")
    log.info(f"   POST /api/unsubscribe        - Remove subscription")
    log.info(f"   POST /api/notify             - Send notification")
    log.info(f"   GET  /api/subscribers        - Count subscribers")
    server.serve_forever()
