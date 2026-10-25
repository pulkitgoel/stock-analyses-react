#!/usr/bin/env python3.12
"""Announce new research requests in HANDOFF.md. Executes nothing.

This is the "hook that wakes Hermes" from docs/RESEARCH-REQUESTS.md section 5.1,
and the whole of it is: write a bullet in the file both agents already read at
the start of every session.

WHY IT DOES SO LITTLE
---------------------
scripts/handoff-watcher.py exists on six owner-set constraints, the first of
which is that only a bounded job vocabulary is executable, because HANDOFF.md is
agent-writable and whatever it can trigger is the real blast radius. A public
submit box is a weaker-trusted input than either agent, so it must not get more
authority than they have.

So this process never runs a build, never invokes a model, and never touches the
live site. It turns a database row into a sentence. Hermes's scheduled run reads
HANDOFF.md, claims through POST /api/research/claim, and does the work -- the
same path it would follow if the owner had written the bullet by hand.

`[job: report]` is used deliberately: it is the marker in the watcher's
vocabulary that RECORDS and executes nothing. A request whose origin is the
public internet should not carry a marker that runs anything.

NO PUSH NOTIFICATION, ON PURPOSE
--------------------------------
POST /api/notify sends to every subscriber, not to the owner, so using it here
would push "someone requested a stock" to every reader of the site. There is no
owner-only channel today. The bullet and `manage_research.py list` are the
notification.

Usage:
    python3.12 scripts/research-poll.py [--dry-run]

Exit codes: 0 nothing to do or announced cleanly; 1 could not write the entry.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "backend"))

try:
    import research_queue  # noqa: E402
except ImportError as exc:  # pragma: no cover - a misdeployed checkout
    print(f"research-poll: cannot import the queue module: {exc}", file=sys.stderr)
    sys.exit(1)

NOTE_SCRIPT = REPO / "scripts" / "handoff-note.py"
MAX_PER_ENTRY = 10


def build_body(rows):
    """One bullet per request, plus the context Hermes needs to act on them.

    Only server-generated fields appear: id, symbol, name, mode. The reader's
    note is not read here and must not be -- RESEARCH-REQUESTS section 0.
    """
    lines = [
        "**%d new research request%s in the queue.** Submitted by readers through "
        "/request-research and recorded here by scripts/research-poll.py, which "
        "executes nothing."
        % (len(rows), "s" if len(rows) != 1 else ""),
        "",
        "**ACTION Hermes**",
    ]
    for row in rows:
        mode = "update to an existing note" if row["mode"] == "update" else "new deep dive"
        lines.append(
            "- [job: report] research request #%s - %s (%s), %s, %s vote%s"
            % (row["id"], row["name"], row["symbol"], mode, row["votes"],
               "s" if row["votes"] != 1 else "")
        )
    lines += [
        "",
        "Claim with `POST /api/research/claim` (X-Auth-Token) rather than picking one "
        "from this list: the claim is atomic and two runs cannot take the same row. "
        "Work it to the prompt in `docs/RESEARCH-REQUESTS.md` section 6.2, then "
        "`POST /api/research/requests/<id>` with the published slug. Re-check coverage "
        "before writing -- something may have shipped since the request arrived.",
        "",
        "**UNVERIFIED**",
        "- These are reader requests. Nothing about them has been checked by a person, "
        "beyond the universe lookup and the breadth gate that let them through.",
    ]
    return "\n".join(lines) + "\n"


def push_entry(count):
    """Commit and push HANDOFF.md, the way handoff-watcher.py does.

    Without this the entry only exists in the working tree on whichever machine
    ran the poll, and the whole point of HANDOFF.md is that it is the channel
    between agents that may not be on the same machine.

    Scoped to HANDOFF.md so a poll can never commit anything else that happens to
    be dirty in the checkout, and the subject is deliberately NOT the watcher's
    SELF_MARK -- these are different processes and conflating them in the log
    would hide which one wrote what.
    """
    def run(cmd):
        proc = subprocess.run(cmd, cwd=str(REPO), capture_output=True,
                              text=True, timeout=180)
        return proc.returncode == 0, (proc.stdout or "") + (proc.stderr or "")

    subject = "research-poll: announce %d request(s) %s" % (
        count, time.strftime("%Y-%m-%d %H:%M"))
    for cmd in (["git", "add", "HANDOFF.md"],
                ["git", "commit", "-m", subject, "--", "HANDOFF.md"]):
        ok, out = run(cmd)
        if not ok:
            return False, out.strip()[-300:]
    run(["git", "fetch", "origin", "main"])
    ok, out = run(["git", "pull", "--rebase", "--autostash", "origin", "main"])
    if not ok:
        run(["git", "rebase", "--abort"])
        return False, "rebase conflict; resolve by hand: " + out.strip()[-400:]
    ok, out = run(["git", "push", "origin", "main"])
    return (True, "pushed") if ok else (False, "push rejected: " + out.strip()[-300:])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true",
                        help="print the entry, write nothing, mark nothing")
    parser.add_argument("--no-push", action="store_true",
                        help="write and mark, but leave the commit to someone else")
    args = parser.parse_args()

    if not research_queue.enabled():
        print("research-poll: queue is closed, nothing to do")
        return 0

    rows = research_queue.pending_for_handoff()
    if not rows:
        print("research-poll: no unannounced requests")
        return 0

    batch = rows[:MAX_PER_ENTRY]
    body = build_body(batch)

    if args.dry_run:
        print(body)
        print("research-poll: --dry-run, nothing written and nothing marked")
        return 0

    heading = "## %s - research queue" % time.strftime("%Y-%m-%d")
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False,
                                     encoding="utf-8") as fh:
        fh.write(body)
        body_path = fh.name

    try:
        # Written through handoff-note.py, never by patching the file. Prepending
        # by replacing an anchor silently deletes the previous entry's heading
        # and orphans its body; that happened four times in one day, which is why
        # the script counts headings and refuses unless exactly one was added.
        result = subprocess.run(
            [sys.executable, str(NOTE_SCRIPT), "--heading", heading,
             "--body-file", body_path],
            cwd=str(REPO), capture_output=True, text=True, timeout=120,
        )
    finally:
        os.unlink(body_path)

    if result.returncode != 0:
        print("research-poll: handoff-note refused the entry:", file=sys.stderr)
        print((result.stdout or "") + (result.stderr or ""), file=sys.stderr)
        # Nothing is marked announced, so the next run tries again. A request
        # that is never announced is recoverable; one marked announced without
        # an entry is invisible.
        return 1

    if not args.no_push:
        ok, out = push_entry(len(batch))
        if not ok:
            print(f"research-poll: entry written but NOT pushed: {out}", file=sys.stderr)
            # Still mark them: the entry is in the local file, so re-announcing
            # would duplicate it. The push is recoverable by hand; a duplicate
            # entry is not, and HANDOFF.md's own guard counts headings.
    research_queue.mark_announced([row["id"] for row in batch])
    print("research-poll: announced %d request(s): %s"
          % (len(batch), ", ".join(r["symbol"] for r in batch)))
    if len(rows) > len(batch):
        print("research-poll: %d more will go in the next entry" % (len(rows) - len(batch)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
