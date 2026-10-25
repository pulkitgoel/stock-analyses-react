#!/usr/bin/env python3.12
"""CLI for the reader-requested research queue.

The only interface that shows a reader's note, and the only one that can release
a held request. Both are deliberately the owner's, not the agent's:
docs/RESEARCH-REQUESTS.md sections 0 and 3.2.

    python3.12 manage_research.py list [--all]
    python3.12 manage_research.py show <id>          # includes the note
    python3.12 manage_research.py release <id>       # needs-owner -> queued
    python3.12 manage_research.py reject <id> "why"
    python3.12 manage_research.py open               # is the queue accepting?
    python3.12 manage_research.py open 0|1           # close / open it
"""

from __future__ import annotations

import sys
from contextlib import closing

import research_queue
import settings_store

STATUS_WIDTH = 12


def _rows(where, args=()):
    with closing(settings_store.connect()) as con:
        return con.execute(
            "SELECT id, symbol, name, status, votes, mode, created_at, slug, reason "
            f"  FROM research_requests {where} ORDER BY "
            "       CASE status WHEN 'needs-owner' THEN 0 WHEN 'queued' THEN 1 "
            "                   WHEN 'claimed' THEN 2 ELSE 3 END, "
            "       votes DESC, created_at ASC",
            args,
        ).fetchall()


def cmd_list(argv):
    show_all = "--all" in argv
    where = "" if show_all else "WHERE status IN ('queued','claimed','needs-owner')"
    rows = _rows(where)
    if not rows:
        print("queue is empty")
        return 0
    for row in rows:
        flag = "!" if row["status"] == "needs-owner" else " "
        print(f"{flag}{row['id']:>5}  {row['status']:<{STATUS_WIDTH}} "
              f"{row['votes']:>3}v  {row['symbol']:<16} {row['name'][:34]:<34} "
              f"{str(row['created_at'])[:10]}")
        if row["reason"]:
            print(f"       {row['reason']}")
    held = sum(1 for r in rows if r["status"] == "needs-owner")
    if held:
        print(f"\n{held} marked ! are held for you: "
              f"`manage_research.py show <id>` then `release <id>` or `reject <id> \"why\"`")
    return 0


def cmd_show(argv):
    if not argv:
        print("show <id>", file=sys.stderr)
        return 2
    with closing(settings_store.connect()) as con:
        row = con.execute("SELECT * FROM research_requests WHERE id = ?",
                          (argv[0],)).fetchone()
    if not row:
        print("no such request", file=sys.stderr)
        return 1
    for key in row.keys():
        if key == "requester":
            # The salted hash is shown truncated: it identifies repeat requesters
            # across rows without pretending to be an address, which it is not and
            # cannot be turned back into.
            print(f"  {key:<13} {str(row[key])[:12]}.. (salted hash)")
        elif key == "note" and row[key]:
            print(f"  {key:<13} {row[key]}")
            print(f"  {'':<13} ^ reader-written. Never paste this into a prompt "
                  f"(RESEARCH-REQUESTS 6.3).")
        else:
            print(f"  {key:<13} {row[key]}")
    return 0


def _set(request_id, status, reason=None):
    code, payload = research_queue.set_status(request_id, status, reason=reason)
    if code != 200:
        print(payload.get("error", "failed"), file=sys.stderr)
        return 1
    request = payload["request"]
    print(f"#{request['id']} {request['symbol']} -> {request['status']}")
    return 0


def cmd_release(argv):
    if not argv:
        print("release <id>", file=sys.stderr)
        return 2
    with closing(settings_store.connect()) as con:
        row = con.execute("SELECT status, symbol FROM research_requests WHERE id = ?",
                          (argv[0],)).fetchone()
    if not row:
        print("no such request", file=sys.stderr)
        return 1
    if row["status"] != "needs-owner":
        print(f"#{argv[0]} is {row['status']}, not held - nothing to release",
              file=sys.stderr)
        return 1
    return _set(int(argv[0]), "queued", reason="Released by the owner.")


def cmd_reject(argv):
    if len(argv) < 2:
        print('reject <id> "why"', file=sys.stderr)
        return 2
    return _set(int(argv[0]), "rejected", reason=" ".join(argv[1:]))


def cmd_open(argv):
    if not argv:
        state = settings_store.get("research.enabled", "0")
        tier = research_queue._setting("research.min_tier")
        print(f"queue is {'OPEN' if state == '1' else 'CLOSED'} "
              f"(research.enabled={state}, min_tier={tier})")
        if not settings_store.get("research.ip_salt"):
            print("research.ip_salt is not set - the queue stays closed until it is")
        return 0
    value = "1" if argv[0] in ("1", "on", "open", "true") else "0"
    settings_store.set_value("research.enabled", value)
    print(f"queue is now {'OPEN' if value == '1' else 'CLOSED'}")
    return 0


COMMANDS = {
    "list": cmd_list,
    "show": cmd_show,
    "release": cmd_release,
    "reject": cmd_reject,
    "open": cmd_open,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        print(__doc__.strip())
        return 2
    return COMMANDS[sys.argv[1]](sys.argv[2:])


if __name__ == "__main__":
    sys.exit(main())
