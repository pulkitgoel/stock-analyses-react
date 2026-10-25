#!/usr/bin/env python3.12
"""Reader-requested research queue.

Full design: docs/RESEARCH-REQUESTS.md in the site repository.

THE RULE THIS MODULE EXISTS TO ENFORCE
--------------------------------------
A reader never sends text that reaches an agent prompt. The request form is a
picker over a generated universe file, and everything that arrives here is
re-resolved against the SERVER's copy of that file before it becomes a row. The
set of strings that can ever be handed to the publishing agent is therefore
exactly the set of symbols NSE lists, and prompt injection is absent by
construction rather than filtered.

Two things follow, and neither is negotiable:

  * `symbol` is validated by lookup, never by pattern alone, and the row stores
    the universe's name, not the client's.
  * `note` is stored for the owner and is NEVER selected by the agent-facing
    queries. `_PUBLIC_COLS` and `_AGENT_COLS` below are the enforcement: there is
    no serialiser that could leak it by omission, because the column is not in
    the SELECT.

EVERYTHING IS OFF UNTIL `research.enabled` IS 1
-----------------------------------------------
The flag is read per request, so turning the feature off is a settings write with
no deploy and no restart. That is the rollback.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import time
from contextlib import closing

import settings_store

# ---------------------------------------------------------------------------
# Wiring from the host server
# ---------------------------------------------------------------------------

_log = None


def set_logger(logger):
    global _log
    _log = logger


_schema_ready = [False]


def _db():
    """Connection with the schema guaranteed.

    settings_store.init_db() is idempotent (every statement is CREATE ... IF NOT
    EXISTS), so this both creates the queue tables on a fresh server and migrates
    an existing api.db by being deployed. It runs once per process, not per query.
    """
    if not _schema_ready[0]:
        settings_store.init_db()
        _schema_ready[0] = True
    return settings_store.connect()


def _say(level, msg):
    if _log:
        getattr(_log, level)(f"research: {msg}")


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

DEFAULTS = {
    "research.enabled": "0",
    "research.min_tier": "broad",
    "research.per_ip_day": "3",
    "research.max_open": "25",
    "research.max_per_day": "2",
    "research.votes_per_day": "10",
    "research.cover_days": "30",
    "research.claim_stale_hours": "6",
    "research.site_root": "/var/www/stock-analyses-react/dist",
}


def _setting(key):
    return settings_store.get(key, DEFAULTS.get(key))


def _int_setting(key):
    try:
        return int(_setting(key))
    except (TypeError, ValueError):
        return int(DEFAULTS[key])


def enabled() -> bool:
    return _setting("research.enabled") == "1" and _salt() is not None


# ---------------------------------------------------------------------------
# Owner decisions: signed links, so a tap approves without an agent session
# ---------------------------------------------------------------------------

DECISION_ACTIONS = ("approve", "reject")
DECISION_DAYS = 7


def _decision_secret() -> bytes:
    """Signing key. Dedicated if set, else the same salt; never empty."""
    return (_setting("research.approve_secret") or _salt() or "").encode()


def decision_token(request_id: int, action: str, expires: int) -> str:
    msg = f"{request_id}:{action}:{expires}".encode()
    return hmac.new(_decision_secret(), msg, hashlib.sha256).hexdigest()[:32]


def decision_url(base: str, request_id: int, action: str, days: int = DECISION_DAYS) -> str:
    expires = int(time.time()) + days * 86400
    token = decision_token(request_id, action, expires)
    return f"{base}/api/research/decision?id={request_id}&a={action}&e={expires}&t={token}"


def decide(request_id: int, action: str, expires: str, token: str):
    """Verify a decision link and apply it. Returns (status_code, html)."""
    if action not in DECISION_ACTIONS:
        return 400, _page("Unknown action", "That link is not an approve or reject link.")
    try:
        exp = int(expires)
    except (TypeError, ValueError):
        return 400, _page("Bad link", "The expiry in that link is not a number.")
    if exp < int(time.time()):
        return 400, _page("Link expired", "Ask for a fresh notification; this link is older than "
                                       f"{DECISION_DAYS} days.")
    expected = decision_token(request_id, action, exp)
    if not hmac.compare_digest(expected, (token or "").lower()):
        return 403, _page("Not a valid link", "The signature does not verify for this request.")

    with closing(_db()) as con:
        with con:
            if action == "approve":
                changed = con.execute(
                    "UPDATE research_requests SET approved_at = datetime('now'), approved_by = 'owner' "
                    " WHERE id = ? AND status = 'queued'",
                    (request_id,),
                ).rowcount
            else:
                changed = con.execute(
                    "UPDATE research_requests SET status = 'rejected', reason = 'owner rejected' "
                    " WHERE id = ? AND status IN ('queued','needs-owner')",
                    (request_id,),
                ).rowcount
        row = con.execute(
            "SELECT id, symbol, name, status, approved_at FROM research_requests WHERE id = ?",
            (request_id,),
        ).fetchone()

    if not row:
        return 404, _page("No such request", f"Request #{request_id} does not exist.")
    if not changed:
        state = row["status"]
        return 409, _page("Already decided",
                          f"Request #{request_id} ({row['symbol']}) is already {state}.")
    if action == "approve":
        return 200, _page("Approved",
                          f"{row['name']} ({row['symbol']}) is approved. Hermes picks it up on its "
                          "next queue check and will publish through the normal pipeline.")
    return 200, _page("Rejected", f"Request #{request_id} ({row['symbol']}) is closed.")


def _page(title: str, message: str) -> str:
    return ("<!doctype html><meta charset=utf-8><title>" + title + "</title>"
            "<body style=\"font-family:system-ui,sans-serif;max-width:34rem;margin:15vh auto;"
            "padding:0 1.2rem;line-height:1.55\"><h1 style=\"font-size:1.35rem\">" + title +
            "</h1><p>" + message + "</p>"
            "<p><a href=\"https://stocksfundamentals.online/request-research\">Back to the queue</a></p>")


def _salt():
    """The hashing salt for requester identity. No salt, no feature.

    Refusing to run without it is deliberate: the alternative is falling back to
    a constant, which would make the hashes reversible by anyone who reads this
    file, and the whole point of hashing is that the table cannot be turned back
    into a list of addresses.
    """
    return settings_store.get("research.ip_salt")


# ---------------------------------------------------------------------------
# The universe — the server's own copy, never the client's
# ---------------------------------------------------------------------------

# Indian and US listings only, by exchange prefix, so a request cannot smuggle in
# a crypto pair, an unlisted name or a market we do not cover. The universe file
# is the second gate: a well-formed US id still has to exist in it.
ALLOWED_MARKETS = {"NSE", "BSE", "NASDAQ", "NYSE", "AMEX"}
SYMBOL_RE = re.compile(r"^(NSE|BSE|NASDAQ|NYSE|AMEX):[A-Z0-9&.\-]{1,12}$")

_universe_cache = {"mtime": None, "index": {}, "count": 0}


def _universe_paths():
    """Every universe file the site ships. India and the US are separate files on
    purpose: generate-universe.js rebuilds universe.json from NSE's own lists and
    would delete anything merged into it, so the US list lives beside it."""
    root = _setting("research.site_root")
    names = ("universe.json", "universe-us.json")
    return [p for p in (os.path.join(root, n) for n in names) if os.path.exists(p)]


def _universe_path():
    return os.path.join(_setting("research.site_root"), "universe.json")


def _universe():
    """"MARKET:SYMBOL" -> (symbol, name, tier, industry, market). Reloaded when a file changes.

    `dist` is swapped by rename during a deploy, so a read can transiently fail.
    The last good index is kept in that case: a stale picker is a usable picker,
    and an empty one would reject every legitimate request for seven minutes.
    """
    paths = _universe_paths()
    if not paths:
        if not _universe_cache["index"]:
            _say("warning", f"universe file missing at {_universe_path()}")
        return _universe_cache["index"]

    try:
        mtime = tuple((p, os.path.getmtime(p)) for p in paths)
    except OSError:
        return _universe_cache["index"]

    if mtime == _universe_cache["mtime"]:
        return _universe_cache["index"]

    index = {}
    try:
        for path in paths:
            with open(path, encoding="utf-8") as fh:
                payload = json.load(fh)
            cols = payload.get("cols") or []
            has_market = len(cols) >= 5 and cols[4] == "market"
            for row in payload.get("rows", []):
                market = row[4] if has_market and len(row) > 4 else "NSE"
                key = f"{market}:{row[0]}"
                index[key] = (row[0], row[1], row[2],
                              row[3] if len(row) > 3 else "", market)
    except (OSError, ValueError, IndexError) as exc:
        _say("error", f"universe unreadable: {exc}")
        return _universe_cache["index"]

    _universe_cache.update({"mtime": mtime, "index": index, "count": len(index)})
    _say("info", f"universe loaded: {len(index)} listings")
    return index


def resolve(symbol: str):
    """Return (id, name, tier, industry) for a submitted id, or None.

    The regex is a cheap reject, not the check. The check is the lookup.
    """
    if not isinstance(symbol, str) or not SYMBOL_RE.match(symbol):
        return None
    market, _, code = symbol.partition(":")
    if market not in ALLOWED_MARKETS:
        return None
    index = _universe()
    row = index.get(symbol)
    if not row and market == "BSE":
        # A BSE code for a company also listed on NSE resolves to the NSE listing:
        # we cover one company, not one exchange line.
        row = index.get("NSE:" + code)
        market = "NSE"
    if not row:
        return None
    return (f"{market}:{row[0]}", row[1], row[2], row[3])


# ---------------------------------------------------------------------------
# Coverage — what the site has already published
# ---------------------------------------------------------------------------

# Mirrors src/utils/tickers.ts. AGENTS.md invariant 3.6: whole-token matching,
# never substring, or /company/ge lists 74 articles for 8 real mentions. Keep
# this set in step with that file and with the two build scripts.
NON_COMPANY = {
    "NSE", "BSE", "NASDAQ", "NYSE", "NIFTY", "NIFTY_IT", "BANKNIFTY", "SENSEX",
    "US", "IT", "SPX", "NDX", "DJI", "FII", "DII", "GEMS",
}

# Mirrors isPolicyPulse() in src/utils/category.ts. A daily note that lists a
# ticker among seventeen others is not coverage of that company, which is the
# same distinction MIN_RESEARCH_ARTICLES makes in AGENTS.md invariant 3.7.
_POLICY_TAGS = {"policy-pulse", "policy-tracker"}

_analyses_cache = {"mtime": None, "rows": []}


def _analyses():
    path = os.path.join(_setting("research.site_root"), "analyses.json")
    try:
        mtime = os.path.getmtime(path)
    except OSError:
        return _analyses_cache["rows"]
    if mtime == _analyses_cache["mtime"]:
        return _analyses_cache["rows"]
    try:
        with open(path, encoding="utf-8") as fh:
            rows = json.load(fh).get("analyses", [])
    except (OSError, ValueError) as exc:
        _say("error", f"analyses.json unreadable: {exc}")
        return _analyses_cache["rows"]
    _analyses_cache.update({"mtime": mtime, "rows": rows})
    return rows


def _is_series(article) -> bool:
    tags = {str(t).lower() for t in article.get("tags") or []}
    if tags & _POLICY_TAGS:
        return True
    return str(article.get("title", "")).lower().startswith("policy pulse")


def _tokens(raw) -> set:
    out = set()
    for part in re.split(r"[:/]", str(raw or "")):
        token = part.strip().upper()
        if token and token not in NON_COMPANY:
            out.add(token)
    return out


def coverage(symbol_id: str):
    """The most recent NON-SERIES article covering this ticker, or None."""
    want = symbol_id.split(":", 1)[1]
    best = None
    for article in _analyses():
        if _is_series(article):
            continue
        if want not in _tokens(article.get("ticker")):
            continue
        if best is None or str(article.get("date", "")) > str(best.get("date", "")):
            best = article
    if not best:
        return None
    return {
        "slug": best.get("slug"),
        "title": best.get("title"),
        "date": best.get("date"),
    }


def _days_since(date_str) -> int:
    try:
        then = time.mktime(time.strptime(str(date_str)[:10], "%Y-%m-%d"))
    except (ValueError, TypeError):
        return 10_000
    return int((time.time() - then) // 86400)


# ---------------------------------------------------------------------------
# The breadth gate
# ---------------------------------------------------------------------------

# Widest first. A request is eligible for the automatic path when its tier is at
# or above `research.min_tier`; everything else is held for the owner.
#
# This replaced a market-cap floor during the build. The quote backend serves the
# Yahoo v8 chart endpoint, which returns a price and no market cap, so the floor
# would have been enforced against a number scraped from somewhere less reliable
# than the exchange. NSE publishes index membership itself, so the gate is now an
# exchange-published fact that moves on rebalancing rather than a magic number.
TIER_ORDER = ["broad", "main", "watch", "sme"]

TIER_REASON = {
    "main": "Held for review: listed, but outside the NIFTY Total Market index.",
    "watch": "Held for review: NSE trades this on a restricted series.",
    "sme": "Held for review: an SME-platform listing.",
}


def _band(tier: str):
    """('queued', None) or ('needs-owner', reason)."""
    floor = _setting("research.min_tier")
    if floor not in TIER_ORDER:
        floor = DEFAULTS["research.min_tier"]
    if tier in TIER_ORDER and TIER_ORDER.index(tier) <= TIER_ORDER.index(floor):
        return "queued", None
    return "needs-owner", TIER_REASON.get(tier, "Held for review.")


# ---------------------------------------------------------------------------
# Requester identity
# ---------------------------------------------------------------------------

_PRIVATE = ("127.", "10.", "192.168.", "172.16.", "172.17.", "172.18.",
            "172.19.", "172.2", "172.30.", "172.31.", "::1", "localhost")
_warned_loopback = [False]


def _client_ip(handler) -> str:
    forwarded = handler.headers.get("X-Forwarded-For", "")
    for candidate in [p.strip() for p in forwarded.split(",") if p.strip()]:
        if not candidate.startswith(_PRIVATE):
            return candidate
    try:
        direct = handler.client_address[0]
    except (AttributeError, IndexError):
        direct = ""
    if direct.startswith(_PRIVATE) and not _warned_loopback[0]:
        # Every requester looking like 127.0.0.1 turns the per-requester limit
        # into one global bucket of three a day, which presents as "the queue is
        # broken" rather than as a misconfiguration. Say so once, loudly.
        _warned_loopback[0] = True
        _say("warning",
             "client address is loopback and no usable X-Forwarded-For header: "
             "nginx needs `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` "
             "on the /api/ block, or per-requester limits are shared by everyone")
    return direct or "unknown"


def _requester(handler) -> str:
    salt = _salt() or ""
    return hashlib.sha256((salt + "|" + _client_ip(handler)).encode()).hexdigest()[:32]


# ---------------------------------------------------------------------------
# Submit nonces — a cheap bot tax, not a security control
# ---------------------------------------------------------------------------

NONCE_MIN_AGE = 3        # seconds; a form filled faster than this was not read
NONCE_MAX_AGE = 3600


def issue_nonce() -> str:
    issued = str(int(time.time()))
    body = f"{issued}.{secrets.token_hex(8)}"
    mac = hmac.new((_salt() or "").encode(), body.encode(), hashlib.sha256).hexdigest()[:16]
    return f"{body}.{mac}"


def _nonce_ok(nonce) -> tuple:
    if not isinstance(nonce, str) or nonce.count(".") != 2:
        return False, "missing or malformed nonce"
    issued, rand, mac = nonce.split(".")
    expected = hmac.new((_salt() or "").encode(), f"{issued}.{rand}".encode(),
                        hashlib.sha256).hexdigest()[:16]
    if not hmac.compare_digest(mac, expected):
        return False, "nonce signature does not verify"
    try:
        age = time.time() - int(issued)
    except ValueError:
        return False, "nonce timestamp is not a number"
    if age < NONCE_MIN_AGE:
        return False, "that was too fast — try again"
    if age > NONCE_MAX_AGE:
        return False, "this form has been open too long; reload the page"

    with closing(_db()) as con:
        with con:
            con.execute("DELETE FROM research_nonces WHERE used_at < datetime('now','-2 hours')")
            try:
                con.execute("INSERT INTO research_nonces (nonce) VALUES (?)", (nonce,))
            except Exception:
                return False, "this form was already submitted"
    return True, None


# ---------------------------------------------------------------------------
# Queries. The column lists are the privacy boundary.
# ---------------------------------------------------------------------------

_PUBLIC_COLS = "id, symbol, name, status, votes, mode, created_at, slug"
_AGENT_COLS = "id, symbol, name, status, votes, mode, prior_slug, created_at"

_OPEN = ("queued", "claimed", "needs-owner")


def _row_public(row):
    out = {k: row[k] for k in row.keys()}
    out["created_at"] = str(out.get("created_at", ""))[:10]
    return out


def _open_count(con) -> int:
    return con.execute(
        f"SELECT COUNT(*) c FROM research_requests WHERE status IN {_OPEN}"
    ).fetchone()["c"]


def public_queue():
    with closing(_db()) as con:
        open_rows = con.execute(
            f"SELECT {_PUBLIC_COLS} FROM research_requests "
            f" WHERE status IN {_OPEN} ORDER BY votes DESC, created_at ASC LIMIT 50"
        ).fetchall()
        done = con.execute(
            f"SELECT {_PUBLIC_COLS}, published_at FROM research_requests "
            "  WHERE status = 'published' ORDER BY published_at DESC LIMIT 8"
        ).fetchall()
        used = _open_count(con)
    return {
        "open": [_row_public(r) for r in open_rows],
        "recent": [_row_public(r) for r in done],
        "limits": {
            "accepted_per_day": _int_setting("research.max_per_day"),
            "per_requester_per_day": _int_setting("research.per_ip_day"),
            "open": used,
            "max_open": _int_setting("research.max_open"),
            "cover_days": _int_setting("research.cover_days"),
        },
    }


def verdict(symbol_id: str, requester: str | None = None):
    """What the page shows the moment a company is picked. Creates nothing."""
    found = resolve(symbol_id)
    if not found:
        return {"state": "unknown",
                "message": "No listed Indian company matches that."}
    sid, name, tier, industry = found
    base = {"symbol": sid, "name": name, "tier": tier, "industry": industry}

    with closing(_db()) as con:
        existing = con.execute(
            f"SELECT {_PUBLIC_COLS} FROM research_requests "
            f" WHERE symbol = ? AND status IN {_OPEN}", (sid,)
        ).fetchone()
        mine = 0
        if requester:
            mine = con.execute(
                "SELECT COUNT(*) c FROM research_requests "
                " WHERE requester = ? AND created_at > datetime('now','-24 hours')",
                (requester,),
            ).fetchone()["c"]
        used = _open_count(con)

    if existing:
        row = _row_public(existing)
        state = "held" if row["status"] == "needs-owner" else "queued"
        return {**base, "state": state, "request": row,
                "message": ("In the queue, under review."
                            if state == "held" else
                            f"Asked {row['created_at']}. {row['votes']} waiting on this one.")}

    covered = coverage(sid)
    window = _int_setting("research.cover_days")
    if covered:
        age = _days_since(covered["date"])
        if age <= window:
            return {**base, "state": "covered", "covered": covered, "age_days": age,
                    "message": f"Covered {age} day{'s' if age != 1 else ''} ago."}
        return {**base, "state": "stale", "covered": covered, "age_days": age,
                "message": f"Last covered {covered['date']}.",
                "requests_left": max(0, _int_setting("research.per_ip_day") - mine),
                "slots_left": max(0, _int_setting("research.max_open") - used)}

    return {**base, "state": "ready",
            "message": "Never covered here.",
            "requests_left": max(0, _int_setting("research.per_ip_day") - mine),
            "slots_left": max(0, _int_setting("research.max_open") - used)}


def submit(symbol_id: str, requester: str, note: str | None):
    """(http_status, payload). Re-checks everything verdict() checked."""
    found = resolve(symbol_id)
    if not found:
        market = symbol_id.split(":", 1)[0] if ":" in symbol_id else ""
        if market and market not in ALLOWED_MARKETS:
            return 400, {
                "error": "Only Indian (NSE/BSE) and US (NASDAQ/NYSE) listed stocks are accepted.",
                "market": market,
            }
        return 400, {"error": "No listed company in the coverage universe matches that."}
    sid, name, tier, _industry = found

    with closing(_db()) as con:
        mine = con.execute(
            "SELECT COUNT(*) c FROM research_requests "
            " WHERE requester = ? AND created_at > datetime('now','-24 hours')",
            (requester,),
        ).fetchone()["c"]
        if mine >= _int_setting("research.per_ip_day"):
            return 429, {"error": "limit",
                         "message": f"That is {mine} requests in 24 hours, which is the limit.",
                         "retry_after_hours": 24}

        if _open_count(con) >= _int_setting("research.max_open"):
            return 429, {"error": "full",
                         "message": "The queue is full. Vote on something already in it."}

        existing = con.execute(
            f"SELECT {_PUBLIC_COLS} FROM research_requests "
            f" WHERE symbol = ? AND status IN {_OPEN}", (sid,)
        ).fetchone()
        if existing:
            return 409, {"error": "queued", "request": _row_public(existing),
                         "message": "Already in the queue — add a vote instead."}

    covered = coverage(sid)
    window = _int_setting("research.cover_days")
    mode, prior = "new", None
    if covered:
        age = _days_since(covered["date"])
        if age <= window:
            return 409, {"error": "covered", "covered": covered,
                         "message": f"Covered {age} day{'s' if age != 1 else ''} ago."}
        mode, prior = "update", covered["slug"]

    status, reason = _band(tier)
    note = (note or "").strip()[:200] or None

    with closing(_db()) as con:
        try:
            with con:
                cur = con.execute(
                    "INSERT INTO research_requests "
                    " (symbol, name, status, mode, prior_slug, note, requester, reason) "
                    " VALUES (?,?,?,?,?,?,?,?)",
                    (sid, name, status, mode, prior, note, requester, reason),
                )
                request_id = cur.lastrowid
                con.execute(
                    "INSERT OR IGNORE INTO research_votes (request_id, requester) VALUES (?,?)",
                    (request_id, requester),
                )
        except Exception:
            # The partial unique index fired: somebody inserted the same symbol
            # between the check above and this write. That is the race the index
            # exists for, and the friendly answer is the same as the check's.
            with closing(_db()) as con2:
                row = con2.execute(
                    f"SELECT {_PUBLIC_COLS} FROM research_requests "
                    f" WHERE symbol = ? AND status IN {_OPEN}", (sid,)
                ).fetchone()
            return 409, {"error": "queued", "request": _row_public(row) if row else None,
                         "message": "Already in the queue — add a vote instead."}

    _say("info", f"queued #{request_id} {sid} ({status}, mode={mode})")
    return (202 if status == "needs-owner" else 201), {
        "status": status,
        "id": request_id,
        "symbol": sid,
        "name": name,
        "mode": mode,
        "message": reason or ("In the queue." if mode == "new"
                              else "In the queue as an update to the existing note."),
    }


def vote(request_id: int, requester: str):
    with closing(_db()) as con:
        today = con.execute(
            "SELECT COUNT(*) c FROM research_votes "
            " WHERE requester = ? AND created_at > datetime('now','-24 hours')",
            (requester,),
        ).fetchone()["c"]
        if today >= _int_setting("research.votes_per_day"):
            return 429, {"error": "limit", "message": "That is enough votes for one day."}

        row = con.execute(
            f"SELECT {_PUBLIC_COLS} FROM research_requests "
            f" WHERE id = ? AND status IN {_OPEN}", (request_id,)
        ).fetchone()
        if not row:
            return 404, {"error": "No open request with that id."}

        with con:
            cur = con.execute(
                "INSERT OR IGNORE INTO research_votes (request_id, requester) VALUES (?,?)",
                (request_id, requester),
            )
            if cur.rowcount == 0:
                return 409, {"error": "voted", "message": "You have already voted for this one.",
                             "request": _row_public(row)}
            con.execute("UPDATE research_requests SET votes = votes + 1 WHERE id = ?",
                        (request_id,))
        updated = con.execute(
            f"SELECT {_PUBLIC_COLS} FROM research_requests WHERE id = ?", (request_id,)
        ).fetchone()
    return 200, {"request": _row_public(updated)}


# ---------------------------------------------------------------------------
# Agent side
# ---------------------------------------------------------------------------

def claim():
    """Atomically take the next workable request, or return None.

    One statement, and the row comes back only if it changed one. Two agent runs
    can overlap and cannot collide -- the same discipline as the flock on
    deploy.sh, which exists because a second deploy once deleted the staging
    directory out from under the first.

    `needs-owner` rows are not selectable here. That is section 3.2's gate, in SQL.
    """
    stale_hours = _int_setting("research.claim_stale_hours")
    with closing(_db()) as con:
        with con:
            # A run that died mid-article must not strand its request forever.
            swept = con.execute(
                "UPDATE research_requests SET status = 'queued', claimed_at = NULL "
                " WHERE status = 'claimed' AND claimed_at < datetime('now', ?)",
                (f"-{stale_hours} hours",),
            ).rowcount
        if swept:
            _say("warning", f"swept {swept} stale claim(s) back to queued")

        published_today = con.execute(
            "SELECT COUNT(*) c FROM research_requests "
            " WHERE published_at > datetime('now','-24 hours')"
        ).fetchone()["c"]
        cap = _int_setting("research.max_per_day")
        if published_today >= cap:
            return None, f"{published_today} published in 24 hours, cap is {cap}"

        candidate = con.execute(
            "SELECT id FROM research_requests WHERE status = 'queued' "
            "   AND approved_at IS NOT NULL "
            " ORDER BY votes DESC, created_at ASC LIMIT 1"
        ).fetchone()
        if not candidate:
            waiting = con.execute(
                "SELECT COUNT(*) c FROM research_requests "
                " WHERE status = 'queued' AND approved_at IS NULL"
            ).fetchone()["c"]
            if waiting:
                return None, f"{waiting} queued but not approved by the owner"
            return None, "nothing queued"

        # The id is carried through rather than re-read afterwards. Reading the
        # most recently claimed row back instead looks equivalent and is not:
        # claimed_at has one-second resolution, so two claims in the same second
        # tie and the ORDER BY picks arbitrarily -- which handed the same request
        # to two runs in testing.
        #
        # `AND status = 'queued'` is what makes this atomic. If another run picked
        # the same candidate, exactly one UPDATE changes a row and the loser is
        # told so.
        with con:
            changed = con.execute(
                "UPDATE research_requests "
                "   SET status = 'claimed', claimed_at = datetime('now') "
                " WHERE id = ? AND status = 'queued' AND approved_at IS NOT NULL",
                (candidate["id"],),
            ).rowcount
        if not changed:
            return None, "another run took it"

        row = con.execute(
            f"SELECT {_AGENT_COLS} FROM research_requests WHERE id = ?",
            (candidate["id"],),
        ).fetchone()
    claimed = {k: row[k] for k in row.keys()}
    _say("info", f"claimed #{claimed['id']} {claimed['symbol']}")
    return claimed, None


VALID_STATUS = {"queued", "claimed", "published", "needs-owner", "rejected", "expired"}


def set_status(request_id: int, status: str, slug=None, reason=None):
    if status not in VALID_STATUS:
        return 400, {"error": f"status must be one of {sorted(VALID_STATUS)}"}
    if status == "published" and not slug:
        return 400, {"error": "a published request needs its slug"}
    if slug is not None and not re.match(r"^[a-z0-9][a-z0-9-]{0,120}$", str(slug)):
        return 400, {"error": "slug is not a slug"}
    with closing(_db()) as con:
        with con:
            changed = con.execute(
                "UPDATE research_requests SET status = ?, slug = COALESCE(?, slug), "
                "   reason = COALESCE(?, reason), "
                "   published_at = CASE WHEN ? = 'published' THEN datetime('now') "
                "                       ELSE published_at END "
                " WHERE id = ?",
                (status, slug, reason, status, request_id),
            ).rowcount
        if not changed:
            return 404, {"error": "no such request"}
        row = con.execute(
            f"SELECT {_PUBLIC_COLS} FROM research_requests WHERE id = ?", (request_id,)
        ).fetchone()
    _say("info", f"#{request_id} -> {status}")
    return 200, {"request": _row_public(row)}


def pending_for_handoff():
    """Queued rows the poller has not announced yet. Owner/agent side only."""
    with closing(_db()) as con:
        rows = con.execute(
            f"SELECT {_AGENT_COLS} FROM research_requests "
            " WHERE status = 'queued' AND announced_at IS NULL "
            " ORDER BY votes DESC, created_at ASC"
        ).fetchall()
    return [{k: r[k] for k in r.keys()} for r in rows]


def mark_announced(ids):
    if not ids:
        return
    with closing(_db()) as con:
        with con:
            con.executemany(
                "UPDATE research_requests SET announced_at = datetime('now') WHERE id = ?",
                [(i,) for i in ids],
            )


# ---------------------------------------------------------------------------
# HTTP dispatch
# ---------------------------------------------------------------------------

def _json(handler, status, payload):
    body = json.dumps(payload).encode()
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    # The queue changes per request and must never be cached by a proxy.
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)


def _authorised(handler) -> bool:
    expected = settings_store.get("api.notify_token") or "PULKIT_VAULT_ADMIN"
    return hmac.compare_digest(handler.headers.get("X-Auth-Token", ""), expected)


def try_handle(handler, path: str, parts: list, method: str, data=None) -> bool:
    """Dispatch /api/research/*. True when handled."""
    if not path.startswith("/api/research"):
        return False

    # parts comes from the server's _parse_path: ['api', 'research', 'requests',
    # '<id>', '<action>'] with empties dropped. Index 1 is 'research'.
    rid = parts[3] if len(parts) >= 4 and parts[2] == "requests" else None
    tail = parts[4] if len(parts) == 5 else None

    # Owner and agent endpoints answer even while the feature is switched off:
    # the flag closes the public door, not the operator's.
    agent_route = (path in ("/api/research/claim", "/api/research/decision")
                   or tail == "full")

    if not enabled() and not agent_route:
        _json(handler, 503, {"error": "closed",
                             "message": "The research queue is closed right now."})
        return True

    if method == "GET":
        if path == "/api/research/requests":
            _json(handler, 200, public_queue())
            return True
        if path == "/api/research/decision":
            from urllib.parse import parse_qs, urlparse
            q = parse_qs(urlparse(handler.path).query)
            try:
                rid = int((q.get("id", ["0"])[0] or "0"))
            except ValueError:
                rid = 0
            code, html = decide(rid, (q.get("a", [""])[0] or "").lower(),
                                q.get("e", ["0"])[0], q.get("t", [""])[0])
            body = html.encode()
            handler.send_response(code)
            handler.send_header("Content-Type", "text/html; charset=utf-8")
            handler.send_header("Content-Length", str(len(body)))
            handler.send_header("Cache-Control", "no-store")
            handler.send_header("X-Robots-Tag", "noindex, nofollow")
            handler.end_headers()
            handler.wfile.write(body)
            return True
        if path == "/api/research/nonce":
            _json(handler, 200, {"nonce": issue_nonce()})
            return True
        if path == "/api/research/resolve":
            from urllib.parse import parse_qs, urlparse
            query = parse_qs(urlparse(handler.path).query)
            symbol = (query.get("symbol", [""])[0] or "").strip().upper()
            _json(handler, 200, verdict(symbol, _requester(handler)))
            return True
        if tail == "full" and rid:
            if not _authorised(handler):
                _json(handler, 403, {"error": "Unauthorized"})
                return True
            with closing(_db()) as con:
                row = con.execute(
                    "SELECT * FROM research_requests WHERE id = ?", (rid,)
                ).fetchone()
            if not row:
                _json(handler, 404, {"error": "no such request"})
            else:
                _json(handler, 200, {"request": {k: row[k] for k in row.keys()}})
            return True

    if method == "POST":
        data = data or {}

        if path == "/api/research/claim":
            if not _authorised(handler):
                _json(handler, 403, {"error": "Unauthorized"})
                return True
            row, why = claim()
            _json(handler, 200, {"request": row, "reason": why})
            return True

        if path == "/api/research/requests":
            if (data.get("hp") or "").strip():
                _say("info", "honeypot filled, dropped")
                _json(handler, 400, {"error": "rejected"})
                return True
            ok, why = _nonce_ok(data.get("nonce"))
            if not ok:
                _json(handler, 400, {"error": "nonce", "message": why})
                return True
            status, payload = submit(
                str(data.get("symbol", "")).strip().upper(),
                _requester(handler),
                data.get("note"),
            )
            _json(handler, status, payload)
            return True

        if tail == "vote" and rid:
            try:
                request_id = int(rid)
            except ValueError:
                _json(handler, 400, {"error": "bad id"})
                return True
            status, payload = vote(request_id, _requester(handler))
            _json(handler, status, payload)
            return True

        # POST /api/research/requests/<id> — the agent's status write.
        if rid and tail is None:
            if not _authorised(handler):
                _json(handler, 403, {"error": "Unauthorized"})
                return True
            try:
                request_id = int(rid)
            except ValueError:
                _json(handler, 400, {"error": "bad id"})
                return True
            status, payload = set_status(
                request_id,
                str(data.get("status", "")),
                data.get("slug"),
                data.get("reason"),
            )
            _json(handler, status, payload)
            return True

    _json(handler, 404, {"error": "Not found"})
    return True
