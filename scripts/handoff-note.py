#!/usr/bin/env python3.12
"""Insert a HANDOFF.md entry without the mistake that keeps happening.

`patch` REPLACES its anchor. So prepending an entry and leaving the anchor line out of
`new_string` does not insert above the previous entry - it deletes that entry's heading and
orphans its body under the new one. It happened four times in one day, the fourth
immediately after the skill documenting it was updated. The knowledge was never the
problem, so this removes the opportunity instead.

The splice verifies itself: it counts headings before and after and refuses to write unless
the count grew by exactly one and no section lost its content.

Usage:
    handoff-note.py --heading "## 2026-10-12 (3) — Hermes (automated agent)" --body-file /tmp/note.md
    handoff-note.py --check        # audit for orphaned entries, write nothing
"""
import argparse
import re
import sys
from pathlib import Path

HANDOFF = Path(__file__).resolve().parent.parent / "HANDOFF.md"

# Sections that are part of the template rather than entries.
NON_ENTRY = ("How to use it",)
TEMPLATE_RE = re.compile(r"^##\s+YYYY-MM-DD")


def has_body(chunk):
    """True when the first non-blank line after a heading is bold.

    Deliberately loose. Entries open with a bold sentence and the wording is not knowable
    up front - an earlier version listed specific markers and flagged a perfectly good
    entry whose first line was "**Your two jobs ran.**". The reliable guard against
    heading-consumption is the before/after count in insert mode; this audit only catches
    the cruder failure of a heading left with no entry content beneath it.
    """
    for line in chunk.splitlines()[1:]:
        if line.strip():
            return line.strip().startswith("**")
    return False


def sections(text):
    """[(heading, body)] for every `## ` section."""
    starts = [m.start() for m in re.finditer(r"^## ", text, re.M)]
    out = []
    for i, s in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else len(text)
        chunk = text[s:end]
        heading = chunk.splitlines()[0][3:].strip()
        out.append((heading, chunk))
    return out


def orphans(text):
    """Entry headings that lead a section with no bold entry content."""
    bad = []
    for heading, chunk in sections(text):
        if heading in NON_ENTRY or TEMPLATE_RE.match("## " + heading):
            continue
        if not has_body(chunk):
            bad.append(heading)
    return bad


def insertion_index(text):
    """Character offset to insert before: the first real entry, after the template."""
    starts = [m.start() for m in re.finditer(r"^## ", text, re.M)]
    for s in starts:
        heading = text[s:].splitlines()[0][3:].strip()
        if heading in NON_ENTRY or TEMPLATE_RE.match("## " + heading):
            continue
        return s
    return len(text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--heading")
    ap.add_argument("--body-file")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    text = HANDOFF.read_text(encoding="utf-8")

    if args.check:
        bad = orphans(text)
        for h in bad:
            print("ORPHANED: %s" % h)
        now = len(sections(text))
        # The failure this file keeps suffering deletes a heading while leaving the body,
        # so the orphan audit above cannot see it - the body still looks like content. The
        # reliable signal is the count: a splice adds headings, and nothing legitimate
        # removes one. Compare against the committed baseline, which is always available
        # in this repo.
        baseline = None
        try:
            import subprocess
            out = subprocess.run(["git", "show", "HEAD:HANDOFF.md"],
                                 capture_output=True, text=True, cwd=HANDOFF.parent)
            if out.returncode == 0:
                baseline = len(sections(out.stdout))
        except Exception:
            baseline = None
        print("headings: %d, orphaned: %d%s"
              % (now, len(bad), "" if baseline is None else ", committed: %d" % baseline))
        if baseline is not None and now < baseline:
            print("LOST %d heading(s) against HEAD - an entry heading was consumed. "
                  "Diff against HEAD to find it." % (baseline - now))
            return 1
        return 1 if bad else 0

    if not (args.heading and args.body_file):
        ap.error("--heading and --body-file are required unless --check is used")

    before = len(sections(text))
    body = Path(args.body_file).read_text(encoding="utf-8").rstrip() + "\n"
    entry = "%s\n\n%s\n" % (args.heading.rstrip(), body)

    at = insertion_index(text)
    new_text = text[:at] + entry + text[at:]

    # The guard: the splice must add exactly one heading, and may not orphan any.
    after = len(sections(new_text))
    if after != before + 1:
        sys.exit("refusing to write: headings went %d -> %d, expected +1" % (before, after))
    bad = orphans(new_text)
    if bad:
        sys.exit("refusing to write: would orphan %s" % ", ".join(bad))

    HANDOFF.write_text(new_text, encoding="utf-8")
    print("inserted after %d headings; now %d; no orphans" % (before, after))
    return 0


if __name__ == "__main__":
    sys.exit(main())
