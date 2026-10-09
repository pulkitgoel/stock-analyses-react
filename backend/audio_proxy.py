#!/usr/bin/env python3.12
"""Audio summary proxy: streams per-article audio from Azure Blob Storage.

WHY THIS EXISTS
---------------
The storage container is reached with a SAS token, which is a bearer credential:
anyone holding it can read the container. If an <audio> element pointed straight
at the blob URL, that signature would sit in the HTML source of every article for
anyone to copy. So the page references a token-free path, /api/audio/<slug>, and
this module attaches the signature server-side.

The token lives in the SQLite settings store (api.db, keys audio.base/audio.sas),
outside every repository and outside every nginx root, and is never echoed in a
response. Rotate it with manage_settings.py; there is no config file holding it.

UNIVERSAL, NO PER-ARTICLE WORK
------------------------------
Nothing needs to be added to an article's frontmatter. The frontend asks for the
index once, and renders a player only for slugs that have audio:

    GET  /api/audio-index           -> {"slugs": {"<slug>": "<ext>"}, ...}
    GET  /api/audio/<slug>          -> the audio bytes, Range requests relayed
    HEAD /api/audio/<slug>          -> headers only, no body

NAMING CONVENTION
-----------------
Upload a file named exactly after the article slug, e.g.
`yatharth-hospital-trauma-care-services-deep-dive-analysis.mp3`, and it appears.
No code change, no rebuild, no article edit.

The container SAS grants read only (sp=r) and therefore cannot list blobs, so
existence is established by probing the configured extensions. Results are cached
in-process, so the cost is paid once per cache window rather than per request.
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import settings_store

# Settings keys in the SQLite store, not a config file:
#   audio.base  container URL
#   audio.sas   the SAS query string (the credential)
#   audio.exts  extensions to probe, in order
ANALYSES_FILE = "/var/www/stock-analyses-react/public/analyses.json"
LEGACY_ANALYSES_FILE = "/var/www/stock-analyses/analyses.json"

INDEX_TTL_SECONDS = 300
PROBE_WORKERS = 32
# How many recent articles get filename-based auto-detection. Older articles are
# mapped explicitly (see manage_audio.py); with a read-only SAS, probing all 250
# slugs for every refresh is a lot of requests to find nothing.
PROBE_RECENT = 60
# The slug -> blob map is re-read this often, so `manage_audio.py add` takes
# effect within seconds without a restart.
MAP_TTL_SECONDS = 30
CHUNK = 64 * 1024
DEFAULT_CONTENT_TYPE = "audio/mpeg"

_config_lock = threading.Lock()
_config_cache: dict | None = None
_index_lock = threading.Lock()
_index_cache: dict = {"at": 0.0, "slugs": {}}
_map_lock = threading.Lock()
_map_cache: dict = {"at": 0.0, "map": {}, "version": 0}
_log = None


def set_logger(logger) -> None:
    """Let the host server pass its logger in."""
    global _log
    _log = logger


def _log_info(message: str) -> None:
    if _log is not None:
        _log.info(message)


def _config() -> dict:
    """Container base URL, SAS and probed extensions. Cached for the process.

    Precedence: an environment override (used by tests), then the SQLite settings
    store. The database is the source of truth - a plaintext file next to the
    service was only marginally better than hardcoding the credential, so it is
    no longer read.
    """
    global _config_cache
    with _config_lock:
        if _config_cache is not None:
            return _config_cache
        base = os.environ.get("AUDIO_BASE") or (settings_store.get("audio.base") or "")
        sas = os.environ.get("AUDIO_SAS") or (settings_store.get("audio.sas") or "")
        exts = (os.environ.get("AUDIO_EXTS")
                or settings_store.get("audio.exts")
                or "mp3,m4a,wav")
        _config_cache = {
            "base": base.rstrip("/"),
            "sas": sas,
            "exts": [e.strip().lower() for e in exts.split(",") if e.strip()],
        }
        if not _config_cache["base"] or not _config_cache["sas"]:
            _log_info("audio: no credentials configured. Set them with: "
                      "python3.12 manage_settings.py set audio.sas '<sas>' "
                      "(and audio.base, audio.exts)")
        return _config_cache


def reload_config() -> None:
    """Drop the cached config so a rotation is picked up without a restart."""
    global _config_cache
    with _config_lock:
        _config_cache = None


def enabled() -> bool:
    cfg = _config()
    return bool(cfg["base"] and cfg["sas"])


def _blob_url(blob_name: str, sas: str) -> str:
    """Full Azure URL for one blob, signature included.

    Only ever called server-side; never returned to a client. Blob names are
    chosen by the uploader and may be non-ASCII - the first real one is
    Devanagari - so the name is percent-encoded.
    """
    cfg = _config()
    return f"{cfg['base']}/{urllib.parse.quote(blob_name, safe='')}?{sas}"


def _audio_map() -> dict:
    """The slug -> blob mapping, cached briefly so an add takes effect fast."""
    now = time.time()
    with _map_lock:
        if now - _map_cache["at"] > MAP_TTL_SECONDS:
            _map_cache["map"] = settings_store.audio_map()
            _map_cache["at"] = now
            _map_cache["version"] += 1
        return _map_cache["map"]


def _map_version() -> int:
    """Bumped every time the mapping is re-read.

    The audio index is built FROM the mapping, so a cached index becomes invalid
    the moment the mapping changes. Without this the index TTL (5 minutes) would
    hide newly added audio, and restarting the service would look like the only
    way to make it appear.
    """
    return _map_cache["version"]


def _candidates(slug: str) -> list[tuple[str, str]]:
    """(blob_name, sas) pairs to try for a slug, most specific first.

    1. The mapped blob, when the slug has one. Names are arbitrary - the first
       real file is Devanagari prose - so a mapping is the only way to find a
       blob that is not named after its slug.
    2. `<slug>.<ext>` for each configured extension, which needs no mapping at
       all: upload a file named after the slug and it is found automatically.
    """
    cfg = _config()
    out: list[tuple[str, str]] = []
    entry = _audio_map().get(slug)
    if entry:
        out.append((entry["blob_name"], entry.get("sas") or cfg["sas"]))
    for ext in cfg["exts"]:
        out.append((f"{slug}.{ext}", cfg["sas"]))
    return out


def _head(blob_name: str, sas: str) -> tuple[str, str] | None:
    """HEAD one blob. Returns (ext, content_type) when it exists."""
    request = urllib.request.Request(_blob_url(blob_name, sas), method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            ext = blob_name.rsplit(".", 1)[-1].lower() if "." in blob_name else "mp3"
            return ext, response.headers.get("Content-Type", DEFAULT_CONTENT_TYPE)
    except urllib.error.HTTPError:
        return None
    except Exception:  # noqa: BLE001 - a probe failure must not break the page
        return None


def _head_first(candidates: list[tuple[str, str]]) -> tuple[str, str] | None:
    for blob_name, sas in candidates:
        hit = _head(blob_name, sas)
        if hit:
            return hit
    return None


def _probe(slug: str) -> tuple[str, str] | None:
    """Return (ext, content_type) for the first candidate that exists."""
    return _head_first(_candidates(slug))


def _slug_list() -> list[str]:
    """Article slugs, newest first, from the repo copy or the legacy fallback."""
    for path in (ANALYSES_FILE, LEGACY_ANALYSES_FILE):
        try:
            with open(path, encoding="utf-8") as handle:
                data = json.load(handle)
        except (OSError, ValueError):
            continue
        items = data.get("analyses", data) if isinstance(data, dict) else data
        rows = []
        for item in items:
            slug = (item.get("slug")
                    or str(item.get("file", "")).replace(".html", "").replace(".md", ""))
            if slug:
                rows.append((str(item.get("date", "")), slug))
        if rows:
            rows.sort(reverse=True)  # newest publication date first
            return [slug for _, slug in rows]
    return []


def _probe_slugs() -> list[str]:
    """Slugs whose audio is auto-detected by filename (recent articles only)."""
    try:
        window = int(settings_store.get("audio.probe_recent") or PROBE_RECENT)
    except (TypeError, ValueError):
        window = PROBE_RECENT
    return _slug_list()[:window]


def _list_blobs() -> dict | None:
    """Enumerate the container in one request, when the SAS permits it (sp=l).

    Returns {slug: ext}, or None if listing is not allowed - which is the case
    for a read-only SAS. Callers fall back to probing, so adding the `l`
    permission later needs no code change: the index simply becomes one request
    instead of several hundred.
    """
    cfg = _config()
    url = f"{cfg['base']}?restype=container&comp=list&{cfg['sas']}"
    try:
        request = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(request, timeout=25) as response:
            xml = response.read()
    except urllib.error.HTTPError:
        return None  # no list permission (403) - expected for a read-only SAS
    except Exception:  # noqa: BLE001
        return None

    found: dict = {}
    for raw in re.findall(rb"<Name>([^<]+)</Name>", xml):
        name = raw.decode("utf-8", "replace")
        stem, dot, ext = name.rpartition(".")
        if dot and ext.lower() in cfg["exts"] and "/" not in stem:
            found.setdefault(stem, ext.lower())
    return found


def audio_index() -> dict:
    """Map slug -> extension for every article that has audio (TTL cached)."""
    if not enabled():
        return {"slugs": {}, "error": "audio not configured"}

    # Refresh the mapping before consulting the index cache: the index is derived
    # from the mapping, so a changed mapping must invalidate it at once.
    mapping = _audio_map()
    version = _map_version()

    now = time.time()
    with _index_lock:
        if (now - _index_cache["at"] < INDEX_TTL_SECONDS
                and _index_cache["slugs"] is not None
                and _index_cache.get("map_version") == version):
            return {
                "slugs": _index_cache["slugs"],
                "checked": _index_cache.get("checked", 0),
                "method": _index_cache.get("method", "probe"),
                "cached_at": int(_index_cache["at"]),
                "cached": True,
            }

    # 1. Mapped blobs. Names are chosen by whoever uploads them - the first was
    #    Devanagari prose, the second plain ASCII - so only the map can find them.
    #    Each is HEAD-verified, so a deleted blob stops advertising itself.
    cfg = _config()
    found: dict = {}
    method = "probe"
    if mapping:
        entries = [(slug, entry["blob_name"], entry.get("sas") or cfg["sas"])
                   for slug, entry in mapping.items()]
        with ThreadPoolExecutor(max_workers=PROBE_WORKERS) as pool:
            for (slug, _, _), hit in zip(
                    entries, pool.map(lambda e: _head(e[1], e[2]), entries)):
                if hit:
                    found[slug] = hit[0]
        method = "map+probe"

    # 2. A container listing, when the SAS grants the `l` permission, covers
    #    everything in one request. With a read-only SAS this returns None.
    listed = _list_blobs()
    if listed is not None:
        known = set(_slug_list())
        found.update({slug: ext for slug, ext in listed.items() if slug in known})
        method = "list"
        checked = len(listed)
    else:
        # 3. Filename auto-detection, recent articles only: upload a file named
        #    `<slug>.mp3` and it is found without a mapping. Probing all 250 on
        #    every refresh would be a lot of requests to find nothing.
        recent = [s for s in _probe_slugs() if s not in found]
        if recent:
            exts = cfg["exts"]
            with ThreadPoolExecutor(max_workers=PROBE_WORKERS) as pool:
                hits = pool.map(
                    lambda s: _head_first([(f"{s}.{e}", cfg["sas"]) for e in exts]),
                    recent)
                for slug, hit in zip(recent, hits):
                    if hit:
                        found[slug] = hit[0]
        checked = len(mapping) + len(recent)

    with _index_lock:
        _index_cache.update({"at": now, "slugs": found, "checked": checked,
                             "method": method, "map_version": version})
    _log_info(f"audio-index: {method} mode, {checked} checked, {len(found)} have audio")
    return {"slugs": found, "checked": checked, "method": method,
            "cached_at": int(now), "cached": False}


def start_warmer(interval_seconds: int = 900) -> None:
    """Keep the index warm so no visitor pays the probe latency.

    A read-only SAS costs one HEAD per slug per extension, which is roughly nine
    seconds cold. An article view should never wait on that, so the index is
    refreshed in the background instead. With list permission this becomes a
    single request, and the warming is nearly free.
    """
    def loop() -> None:
        time.sleep(5)
        while True:
            try:
                audio_index()
            except Exception as exc:  # noqa: BLE001 - a warmer must never die
                _log_info(f"audio-index warmer failed: {type(exc).__name__}: {exc}")
            time.sleep(interval_seconds)

    threading.Thread(target=loop, daemon=True, name="audio-index-warmer").start()
    _log_info(f"audio-index warmer started (every {interval_seconds}s)")


def _json(handler, status: int, payload: dict) -> None:
    body = json.dumps(payload).encode()
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _stream(handler, slug: str, head_only: bool) -> None:
    """Relay the blob, including Range requests so seeking works."""
    range_header = handler.headers.get("Range")
    last_status = 404

    for blob_name, sas in _candidates(slug):
        request = urllib.request.Request(_blob_url(blob_name, sas), method="GET")
        if range_header:
            request.add_header("Range", range_header)
        try:
            response = urllib.request.urlopen(request, timeout=60)
        except urllib.error.HTTPError as exc:
            last_status = exc.code
            continue  # try the next extension
        except Exception as exc:  # noqa: BLE001
            _json(handler, 502, {"error": "audio backend unreachable", "detail": str(exc)})
            return

        with response:
            status = response.status
            handler.send_response(status)
            handler.send_header("Content-Type",
                                response.headers.get("Content-Type", DEFAULT_CONTENT_TYPE))
            handler.send_header("Accept-Ranges", "bytes")
            handler.send_header("Cache-Control", "private, max-age=3600")
            for header in ("Content-Length", "Content-Range", "ETag", "Last-Modified"):
                value = response.headers.get(header)
                if value:
                    handler.send_header(header, value)
            handler.end_headers()
            if head_only:
                return
            try:
                while True:
                    chunk = response.read(CHUNK)
                    if not chunk:
                        break
                    handler.wfile.write(chunk)
            except (BrokenPipeError, ConnectionResetError):
                # The listener seeked or closed the tab mid-stream. Not an error.
                pass
            return

    if last_status in (403, 401):
        _json(handler, 502, {"error": "audio storage rejected the request "
                                      "(check the SAS permissions or expiry)"})
    else:
        _json(handler, 404, {"error": "no audio for this article"})


def try_handle(handler, path: str, _parts: list[str], head_only: bool = False) -> bool:
    """Dispatch /api/audio-index and /api/audio/<slug>. True if handled."""
    if path == "/api/audio-index":
        _json(handler, 200, audio_index())
        return True

    if path.startswith("/api/audio/"):
        slug = urllib.parse.unquote(path[len("/api/audio/"):]).strip("/")
        if not slug or "/" in slug:
            _json(handler, 400, {"error": "bad slug"})
            return True

        if head_only:
            hit = _probe(slug) if enabled() else None
            if hit:
                handler.send_response(200)
                handler.send_header("Content-Type", hit[1])
                handler.send_header("Accept-Ranges", "bytes")
                handler.end_headers()
            else:
                handler.send_response(404)
                handler.end_headers()
            return True

        if not enabled():
            _json(handler, 503, {"error": "audio is not configured on this server"})
            return True
        _stream(handler, slug, head_only=False)
        return True

    return False
