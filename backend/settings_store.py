#!/usr/bin/env python3.12
"""SQLite-backed settings for the site API.

WHY A DATABASE RATHER THAN A CONFIG FILE
----------------------------------------
The audio container SAS is a bearer credential: whoever holds it can read the
container. A flat file next to the service is only marginally better than a
hardcoded constant - it gets copied into backups, grepped into shell history, and
its permissions drift. It lives here instead:

  - one store for every setting the API needs, not a file per concern;
  - mode 600, owned by the service user;
  - outside every repository and outside every nginx root, so it can never be
    served or committed;
  - rotatable at runtime through manage_settings.py, with no edit-and-restart.

Schema is deliberately one key/value table. Widen it only when a real relational
need appears.
"""

from __future__ import annotations

import os
import sqlite3
import sys

DEFAULT_DB_PATH = "/var/www/stock-analyses/api.db"
DB_PATH = os.environ.get("SITE_API_DB", DEFAULT_DB_PATH)

SCHEMA = """
CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audio_files (
    slug       TEXT PRIMARY KEY,
    blob_name  TEXT NOT NULL,
    sas        TEXT,
    added_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA journal_mode=WAL")
    return connection


def init_db() -> None:
    with connect() as connection:
        connection.executescript(SCHEMA)
    try:
        os.chmod(DB_PATH, 0o600)
    except OSError:
        pass


def get(key: str, default: str | None = None) -> str | None:
    try:
        with connect() as connection:
            row = connection.execute(
                "SELECT value FROM settings WHERE key = ?", (key,)
            ).fetchone()
        return row["value"] if row else default
    except sqlite3.Error as exc:
        # A settings lookup must never take the API down; callers treat a miss
        # as "not configured".
        print(f"settings_store: read failed for {key!r}: {exc}", file=sys.stderr)
        return default


def set_value(key: str, value: str) -> None:  # noqa: A001 - matches dict-ish API
    init_db()
    with connect() as connection:
        connection.execute(
            "INSERT INTO settings (key, value, updated_at) "
            "VALUES (?, ?, datetime('now')) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value, "
            "updated_at = excluded.updated_at",
            (key, value),
        )


def delete(key: str) -> None:
    with connect() as connection:
        connection.execute("DELETE FROM settings WHERE key = ?", (key,))


def all_values() -> dict:
    with connect() as connection:
        rows = connection.execute(
            "SELECT key, value, updated_at FROM settings ORDER BY key"
        ).fetchall()
    return {row["key"]: {"value": row["value"], "updated_at": row["updated_at"]}
            for row in rows}


# --- audio file map -------------------------------------------------------
#
# A blob's name is chosen by whoever uploads it and is often human prose, not the
# article slug (the first one is Devanagari: "यथार्थ_हॉस्पिटल_के_मुनाफे_का_असली_सच.mp3"),
# so slug and blob name cannot be assumed to match. This table is the mapping.
# It is not article metadata: nothing in public/analyses/ changes, and no rebuild
# is needed - the API reads this at request time.

def audio_map() -> dict:
    """slug -> {"blob_name": ..., "sas": ...} for every mapped audio file."""
    try:
        with connect() as connection:
            rows = connection.execute(
                "SELECT slug, blob_name, sas FROM audio_files ORDER BY added_at"
            ).fetchall()
        return {row["slug"]: {"blob_name": row["blob_name"], "sas": row["sas"]}
                for row in rows}
    except sqlite3.Error as exc:
        print(f"settings_store: audio map read failed: {exc}", file=sys.stderr)
        return {}


def audio_map_set(slug: str, blob_name: str, sas: str | None = None) -> None:
    """Attach a blob to a slug. `sas` is an optional per-file signature."""
    init_db()
    with connect() as connection:
        connection.execute(
            "INSERT INTO audio_files (slug, blob_name, sas, added_at) "
            "VALUES (?, ?, ?, datetime('now')) "
            "ON CONFLICT(slug) DO UPDATE SET blob_name = excluded.blob_name, "
            "sas = excluded.sas, added_at = excluded.added_at",
            (slug, blob_name, sas),
        )


def audio_map_delete(slug: str) -> None:
    with connect() as connection:
        connection.execute("DELETE FROM audio_files WHERE slug = ?", (slug,))
