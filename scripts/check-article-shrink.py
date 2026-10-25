#!/usr/bin/env python3.12
"""Refuse to publish an article that has shrunk.

A re-analysis is a merge, not a rewrite: the reader who bookmarked the June deep
dive should still find the business overview, the annual financials and the
balance sheet when they come back. On 2026-10-25 an unattended runner replaced a
713-line article with a 275-line one and every gate passed, because nothing
compared the two.

This compares every changed article in public/analyses/ against the version at
HEAD and fails when one loses more than SHRINK_LIMIT of its words. Deleting a
section on purpose is still possible: ALLOW_SHRINK=1 with a reason in the commit
message. The point is that it has to be a decision, not an accident.

Exit 0 when nothing shrank, 1 when something did, 2 on a git error.
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

SHRINK_LIMIT = 0.10  # a tenth is a housekeeping edit; more is a rewrite
ARTICLE_DIR = Path("public/analyses")


def git(*args: str) -> str:
    result = subprocess.run(["git", *args], capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"git {' '.join(args)} failed")
    return result.stdout


def words(text: str) -> int:
    return len(text.split())


def main() -> int:
    try:
        changed = git("diff", "--name-only", "HEAD", "--", str(ARTICLE_DIR)).split()
        untracked = git("ls-files", "--others", "--exclude-standard", "--",
                        str(ARTICLE_DIR)).split()
    except (RuntimeError, FileNotFoundError) as exc:
        print(f"check-article-shrink: {exc}", file=sys.stderr)
        return 2

    shrunk = []
    for name in changed:
        if name in untracked or not name.endswith(".md"):
            continue
        path = Path(name)
        if not path.exists():          # deleted article: not this check's business
            continue
        try:
            before = git("show", f"HEAD:{name}")
        except RuntimeError:
            continue                   # new file: nothing to compare
        old, new = words(before), words(path.read_text())
        if old < 200:                  # a stub or a scratch file, not a deep dive
            continue
        if new < old * (1 - SHRINK_LIMIT):
            shrunk.append((name, old, new))

    if not shrunk:
        print("check-article-shrink: no article lost more than "
              f"{int(SHRINK_LIMIT * 100)}% of its words")
        return 0

    print("check-article-shrink: these articles shrank", file=sys.stderr)
    for name, old, new in shrunk:
        print(f"  - {name}: {old} -> {new} words "
              f"({(new - old) / old:+.0%})", file=sys.stderr)

    if os.environ.get("ALLOW_SHRINK") == "1":
        print("check-article-shrink: ALLOW_SHRINK=1 set, continuing — record the "
              "reason in the commit message", file=sys.stderr)
        return 0

    print("check-article-shrink: a re-analysis merges into the existing article "
          "instead of replacing it. Restore the sections that were dropped, or "
          "set ALLOW_SHRINK=1 and say why in the commit message.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
