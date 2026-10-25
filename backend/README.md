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
| `research_queue.py` | The reader-requested research queue |
| `manage_research.py` | CLI to review, release or reject a request |
| `test_research_queue.py` | The queue's rules, checkable in one command |

## Endpoints

```
GET  /api/analyses            list analyses
GET  /api/analyses/:slug      one analysis
GET  /api/quote?symbols=      live prices
GET  /api/subscribers         subscriber count
GET  /api/audio-index         which article slugs have audio
GET  /api/audio/:slug         stream that audio (Range supported)
GET  /api/research/requests   the open request queue (no notes, no requesters)
GET  /api/research/resolve    what the page says about one company
GET  /api/research/nonce      a submit nonce
POST /api/research/requests   submit a request
POST /api/research/requests/:id/vote
POST /api/research/claim      X-Auth-Token - the agent takes the next request
POST /api/research/requests/:id       X-Auth-Token - status write
GET  /api/research/requests/:id/full  X-Auth-Token - the row including the note
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


## Reader-requested research

Full design: `docs/RESEARCH-REQUESTS.md`. The short version of why the code looks
the way it does:

**A reader never sends text that reaches an agent prompt.** The form is a picker
over `universe.json`, and whatever arrives is re-resolved against the server's own
copy of that file before it becomes a row. The strings that can reach the
publishing agent are therefore exactly the symbols NSE lists. Prompt injection is
absent by construction, not filtered.

The optional note is the one piece of reader-written text, and it is fenced by the
column lists in `research_queue.py`: `_PUBLIC_COLS` and `_AGENT_COLS` do not select
it, so there is no serialiser that could leak it by omission. Only
`manage_research.py show` and the `/full` endpoint display it, both owner-side.

```bash
python3.12 manage_research.py list            # ! marks the ones held for you
python3.12 manage_research.py show 12         # includes the note
python3.12 manage_research.py release 12      # held -> queued
python3.12 manage_research.py open 0          # close the queue. No deploy.
```

**Settings.** The queue stays shut until both of the first two are set:

```bash
python3.12 manage_settings.py set research.enabled 1
python3.12 manage_settings.py set research.ip_salt '<32 random hex bytes>'
python3.12 manage_settings.py set research.min_tier broad   # broad|main|watch|sme
python3.12 manage_settings.py set research.per_ip_day 3
python3.12 manage_settings.py set research.max_open 25
python3.12 manage_settings.py set research.max_per_day 2
python3.12 manage_settings.py set research.site_root /var/www/stock-analyses-react/dist
```

`research.ip_salt` has no fallback on purpose. Requesters are identified by
`sha256(salt + ip)` and never by address, so a constant default would make every
hash reversible by anyone reading the source. No salt, no feature.

**Rotating the salt resets every rate-limit bucket**, because the buckets are keyed
by the hash. Do it deliberately, not as hygiene.

**`research.min_tier` is the pump guard.** `broad` means the NIFTY Total Market
index - companies already widely held and widely covered. Everything outside it,
plus NSE's restricted series and the SME platform, is held as `needs-owner` and the
agent's claim cannot see it.

**nginx must forward the client address** or every requester hashes to the same
value and the per-requester limit becomes one shared bucket of three a day:

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

The server logs a warning once per process when it sees a loopback address and no
usable header, because the symptom otherwise reads as "the queue is broken".

**Tests**, which need no server and no network:

```bash
python3.12 backend/test_research_queue.py     # from the repository root
```
