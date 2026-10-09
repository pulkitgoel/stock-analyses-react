# Backend API Server

Notification and API server for stocksfundamentals.online. Serves the push
subscriptions, live quotes, and article audio summaries.

**This directory is the versioned copy.** The running service is
`/var/www/stock-analyses/` (`vault-notify.service`), which is not a git
repository. Copy the files here after changing them on the server, or the two
drift — they already had once before this file was rewritten.

## Run

```bash
python3.12 notification_server.py 8081     # systemd: vault-notify.service
```

Dependencies: `pywebpush` (push encryption), `yfinance` (`/api/quote`). The HTTP
server is the standard library's `http.server` — not Flask.

nginx proxies `/api/` to `127.0.0.1:8081`.

## Layout

| File | Purpose |
|---|---|
| `notification_server.py` | HTTP routing and the push endpoints |
| `audio_proxy.py` | Streams article audio from Azure Blob Storage |
| `settings_store.py` | SQLite store for settings and the audio file map |
| `manage_settings.py` | CLI to read/write settings (masks secrets) |
| `manage_audio.py` | CLI to attach an audio file to an article |

## Endpoints

```
GET  /api/analyses            list analyses
GET  /api/analyses/:slug      one analysis
GET  /api/quote?symbols=      live prices
GET  /api/subscribers         subscriber count
GET  /api/audio-index         which article slugs have audio
GET  /api/audio/:slug         stream that audio (Range supported)
POST /api/subscribe           save a push subscription
POST /api/verify              verify a subscription exists
POST /api/unsubscribe         remove a subscription
POST /api/notify              send a push (X-Auth-Token required)
```

## Audio summaries

An article shows an audio player when the API reports audio for its slug. Nothing
is stored in the article's frontmatter and no rebuild is needed — the frontend
asks `/api/audio-index` at runtime.

Two ways audio is found:

1. **Named after the slug.** Upload `my-article-slug.mp3` and it is detected with
   no configuration. Only recent articles are probed for this (see the
   `audio.probe_recent` setting), because a read-only SAS cannot list the
   container.
2. **Mapped explicitly.** Most files are named by hand — the first one is
   Devanagari prose, `यथार्थ_हॉस्पिटल_के_मुनाफे_का_असली_सच.mp3` — so they are
   attached to a slug:

```bash
python3.12 manage_audio.py add <slug> "<blob name or full signed URL>"
python3.12 manage_audio.py list
python3.12 manage_audio.py check <slug>
python3.12 manage_audio.py remove <slug>
```

**No restart and no rebuild are needed.** The mapping is re-read every 30 seconds, and
a change to it invalidates the cached index immediately (the index is derived from the
mapping, so the cache records which mapping version produced it). New audio therefore
appears on the article within about half a minute, and the frontend picks it up on the
next page view because it asks `/api/audio-index` at runtime rather than being built
with the audio baked in.

If you pass a full signed URL, its signature is stored as a per-file override. Prefer a
bare blob name when the container credential can already read the file — one credential
to rotate instead of one per file.

### Credentials

The storage SAS is a bearer token. **It must never reach the browser, a
repository, or an HTML page.** The page references only the token-free
`/api/audio/<slug>`; `audio_proxy.py` attaches the signature server-side.

It lives in the SQLite store, not a config file:

```bash
python3.12 manage_settings.py set audio.base 'https://<account>.blob.core.windows.net/<container>'
python3.12 manage_settings.py set audio.sas  '<sas query string>'
python3.12 manage_settings.py set audio.exts 'mp3,m4a,wav'
python3.12 manage_settings.py list            # secrets shown masked
```

The database is `/var/www/stock-analyses/api.db`, mode 600, owned by the service
user, and outside every nginx root. If the SAS grants the `l` (list) permission,
`audio_proxy.py` enumerates the container in one request instead of probing; no
code change is needed to benefit.
