#!/usr/bin/env python3.12
"""Read and write API settings held in the SQLite store.

    python3.12 manage_settings.py list
    python3.12 manage_settings.py set audio.sas '<sas query string>'
    python3.12 manage_settings.py get audio.sas
    python3.12 manage_settings.py delete audio.exts

Values whose key looks secret (sas, token, secret, key, password) are masked on
display unless --reveal is passed, so rotating a credential does not print it
into a terminal log or a shell history file.
"""

from __future__ import annotations

import argparse
import sys

import settings_store

SECRET_HINTS = ("sas", "token", "secret", "password", "apikey", "api_key", "sig")


def masked(key: str, value: str, reveal: bool) -> str:
    if reveal or not any(hint in key.lower() for hint in SECRET_HINTS):
        return value
    if len(value) <= 12:
        return "*" * len(value)
    return f"{value[:6]}...{value[-4:]} ({len(value)} chars)"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--db", help="override the database path")
    parser.add_argument("--reveal", action="store_true", help="print secret values in full")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="show every setting (secrets masked)")
    getter = sub.add_parser("get", help="print one setting")
    getter.add_argument("key")
    setter = sub.add_parser("set", help="create or update a setting")
    setter.add_argument("key")
    setter.add_argument("value")
    remover = sub.add_parser("delete", help="remove a setting")
    remover.add_argument("key")
    sub.add_parser("init", help="create the database and table if missing")

    args = parser.parse_args()

    if args.db:
        settings_store.DB_PATH = args.db

    if args.command == "init":
        settings_store.init_db()
        print(f"initialised {settings_store.DB_PATH}")
        return 0

    if args.command == "list":
        values = settings_store.all_values()
        if not values:
            print("(no settings stored)")
            return 0
        for key, entry in values.items():
            print(f"{key:24} {masked(key, entry['value'], args.reveal):40} "
                  f"updated {entry['updated_at']}")
        return 0

    if args.command == "get":
        value = settings_store.get(args.key)
        if value is None:
            print(f"{args.key}: not set", file=sys.stderr)
            return 1
        print(masked(args.key, value, args.reveal))
        return 0

    if args.command == "set":
        settings_store.set_value(args.key, args.value)
        print(f"{args.key} stored ({len(args.value)} chars)")
        return 0

    if args.command == "delete":
        settings_store.delete(args.key)
        print(f"{args.key} removed")
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
