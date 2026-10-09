#!/usr/bin/env python3.12
"""Attach audio summaries to articles.

A blob's name is chosen by whoever uploads it, and it is usually human prose
rather than the article slug - the first real one is
`यथार्थ_हॉस्पिटल_के_मुनाफे_का_असली_सच.mp3` for the Yatharth deep dive. This
records which blob belongs to which slug. Nothing in `public/analyses/` changes
and no rebuild is needed: the API reads the mapping at request time.

    python3.12 manage_audio.py list
    python3.12 manage_audio.py check <slug>
    python3.12 manage_audio.py add <slug> "<blob name or full blob URL>"
    python3.12 manage_audio.py remove <slug>

`add` accepts either a bare blob name or a full signed URL; the signature is
stripped out and, if you pass one, stored as a per-file override rather than the
container-wide credential.
"""

from __future__ import annotations

import argparse
import sys
import urllib.error
import urllib.parse
import urllib.request

import audio_proxy
import settings_store


def split_blob(value: str) -> tuple[str, str | None]:
    """Accept a bare blob name or a full signed URL. Returns (name, sas|None)."""
    if value.startswith("http://") or value.startswith("https://"):
        parsed = urllib.parse.urlsplit(value)
        name = urllib.parse.unquote(parsed.path.rsplit("/", 1)[-1])
        return name, (parsed.query or None)
    return value, None


def status_for(slug: str) -> str:
    """Probe the resolved blob and describe what the API will do."""
    cfg = audio_proxy._config()  # noqa: SLF001 - a maintenance CLI, not app code
    if not cfg["base"] or not cfg["sas"]:
        return "audio is not configured (set audio.base and audio.sas)"
    candidates = audio_proxy._candidates(slug)  # noqa: SLF001
    for blob_name, sas in candidates:
        url = f"{cfg['base']}/{urllib.parse.quote(blob_name, safe='')}?{sas}"
        try:
            request = urllib.request.Request(url, method="HEAD")
            with urllib.request.urlopen(request, timeout=25) as response:
                size = response.headers.get("Content-Length")
                megabytes = f"{int(size) / 1_048_576:.1f} MB" if size else "unknown size"
                return f"OK  {blob_name}  ({megabytes}, {response.headers.get('Content-Type')})"
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                continue
            return f"HTTP {exc.code} for {blob_name} - check the SAS permissions"
        except Exception as exc:  # noqa: BLE001
            return f"{type(exc).__name__}: {exc}"
    return "no audio found for this slug"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="show mapped articles and whether each blob resolves")
    checker = sub.add_parser("check", help="probe one slug without changing anything")
    checker.add_argument("slug")
    adder = sub.add_parser("add", help="map a blob to a slug")
    adder.add_argument("slug")
    adder.add_argument("blob", help="blob name, or a full signed blob URL")
    adder.add_argument("--no-verify", action="store_true",
                       help="store without checking the blob is reachable")
    remover = sub.add_parser("remove", help="drop the mapping for a slug")
    remover.add_argument("slug")

    args = parser.parse_args()

    if args.command == "list":
        mapping = settings_store.audio_map()
        slugs = audio_proxy._slug_list()  # noqa: SLF001
        if not mapping:
            print("(no audio mapped)")
            print(f"auto-detected (file named after the slug): {len(slugs)} slugs probed")
            return 0
        for slug, entry in mapping.items():
            print(f"{slug}\n    {status_for(slug)}")
        return 0

    if args.command == "check":
        for slug in ([args.slug] if args.command == "check" else audio_proxy._slug_list()):  # noqa: SLF001
            print(f"{slug}\n    {status_for(slug)}")
        return 0

    if args.command == "add":
        blob_name, sas = split_blob(args.blob)
        settings_store.audio_map_set(args.slug, blob_name, sas)
        audio_proxy.reload_config()
        detail = " (with a per-file signature)" if sas else ""
        print(f"mapped {args.slug} -> {blob_name}{detail}")
        if not args.no_verify:
            print(f"    {status_for(args.slug)}")
        return 0

    if args.command == "remove":
        settings_store.audio_map_delete(args.slug)
        print(f"removed the mapping for {args.slug}")
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
