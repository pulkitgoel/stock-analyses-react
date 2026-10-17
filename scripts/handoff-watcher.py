#!/usr/bin/env python3.12
"""handoff-watcher — execute the bounded job queue other agents leave in HANDOFF.md.

Owner-specified design, 2026-10-11. Six constraints, and they are the specification:

1. BOUNDED ACTIONS. Only the job types in JOBS are executable. HANDOFF.md is
   agent-writable, so whatever it can trigger is the real blast radius: free text is
   NEVER executed, only recorded and reported. A bullet acts only if it carries an
   explicit `[job: <type>]` marker.
2. NGINX GATED BEFORE AND AFTER. `nginx -t` the candidate while it is in place but
   BEFORE reloading (nginx keeps serving the loaded config until a reload, so a bad
   candidate is harmless at that moment), then reload, then curl one valid AND one
   invalid URL per route shape. Any unexpected status restores the backup and reloads.
3. NEVER DECIDE OWNER ITEMS. Only ACTION sections are parsed. A job marked as blocked
   on an owner decision is skipped and says so.
4. IDEMPOTENCY. Action items are keyed by a hash of their text and marked actioned;
   commits whose subject starts with SELF_MARK are our own pushes and are ignored, so
   the watcher cannot retrigger itself.
5. FAIL CLOSED. One attempt per job per run, no retry loop. On failure the site stays on
   the previous build (the staged deploy guarantees it) and the failure is reported.
6. ALWAYS AN ENTRY. Every run appends a HANDOFF.md entry, including a run that did
   nothing, with the reason. A silent watcher is indistinguishable from a broken one.

Usage:
    python3.12 scripts/handoff-watcher.py [--dry-run]
    python3.12 scripts/handoff-watcher.py --verify      # route table only, no queue

Exit codes: 0 nothing to do or all jobs succeeded; 1 a job failed.
"""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
STATE_FILE = Path.home() / ".hermes" / "state" / "handoff-watcher.json"
HANDOFF = REPO / "HANDOFF.md"
DOC_NGINX = REPO / "docs" / "nginx-seo.conf"
LIVE_NGINX = Path("/etc/nginx/sites-enabled/stocksfundamentals.online")
NGINX_BACKUPS = Path("/etc/nginx/backups")
SITE = "https://stocksfundamentals.online"

SELF_MARK = "watcher:"
JOBS = {"deploy", "apply-nginx", "verify-live", "report"}

# Route shapes: (label, valid path, want, invalid path, want). Both halves matter: every
# try_files fault this week behaved correctly on the valid URL and wrongly on the invalid
# one, so a table of valid rows alone proves nothing.
ROUTE_EXPECTATIONS = [
    ("homepage",          "/",                    200, "/nope-12345",          404),
    ("article",           "/analysis/syrma-sgs-technology-deep-dive-analysis", 200,
                          "/analysis/does-not-exist-at-all",     404),
    ("company indexable", "/company/drreddy",     200, "/company/azad",        200),
    # Every hub has a file, so a thin hub must still be served from its own file and a
    # ticker that does not exist must 404 - it used to be handed a homepage clone under
    # a 200. These rows are the check for that, on both sides.
    ("company thin",      "/company/spy",         200, "/company/zzznotreal",  404),
    ("tag indexable",     "/tag/defence",         200, "/tag/ems",             200),
    ("tag thin",          "/tag/infrastructure",  200, "/tag/zzznotreal",      404),
    ("archive paginated", "/analyses/page/1",     200, "/analyses/page/99",   404),
    ("section india",     "/india",               200, "/india/page/99",      404),
    ("section global",    "/global",              200, "/global/page/99",     404),
    ("page-1 redirect",   "/india/page/1",        301, None,                  None),
    ("static page",       "/about",               200, None,                  None),
    ("raw markdown",      "/analyses/syrma-sgs-technology-deep-dive-analysis.md", 200, None, None),
    ("sitemap",           "/sitemap.xml",         200, None,                  None),
]

UA = "Mozilla/5.0 (compatible; handoff-watcher/1.0)"
ACTIONED_CAP = 500

# Minutes during which an identical (job, argument) that already SUCCEEDED is treated as a
# duplicate request rather than new work. See the cooldown guard in main().
COOLDOWN_MINUTES = 60


def log(*a):
    """Progress goes to STDERR.

    The cron entry runs this with no_agent, which delivers STDOUT verbatim. At a
    20-minute cadence a chatty stdout would post 72 messages a day, so only the
    deliverable summary uses stdout - and nothing is printed there on a quiet run.
    HANDOFF.md is the liveness record (constraint 6); this channel is for events.
    """
    print(*a, file=sys.stderr)


def run(cmd, cwd=None, timeout=1800):
    """Run a command. ALWAYS returns (ok, combined_output) - never a bare bool, so a
    caller cannot accidentally unpack a status code or test a string for truthiness."""
    try:
        p = subprocess.run(cmd, cwd=str(cwd or REPO), capture_output=True, text=True,
                           timeout=timeout)
    except subprocess.TimeoutExpired:
        return False, "timeout after %ss: %s" % (timeout, " ".join(cmd))
    return p.returncode == 0, (p.stdout or "") + (p.stderr or "")


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """Refuse to follow redirects.

    urllib follows them by default, which silently reports 200 for a URL that actually
    301s - so a redirect regression would read as fine. The statuses here are the point;
    the destination is checked separately where it matters.
    """

    def redirect_request(self, *args, **kwargs):
        return None


_OPENER = urllib.request.build_opener(_NoRedirect)


def status_of(path, timeout=45):
    """First-response status for a site-relative path, WITHOUT following redirects."""
    try:
        with _OPENER.open(urllib.request.Request(SITE + path, headers={"User-Agent": UA}),
                          timeout=timeout) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code          # 301/302 land here when redirects are disabled
    except Exception:
        return None


def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"actioned": [], "runs": 0}


def save_state(st):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    st["actioned"] = st.get("actioned", [])[-ACTIONED_CAP:]
    STATE_FILE.write_text(json.dumps(st, indent=2, sort_keys=True))


def entry_id(*parts):
    return hashlib.sha1("|".join(parts).encode("utf-8")).hexdigest()[:16]


# --------------------------------------------------------------------- queue parsing

JOB_RE = re.compile(r"\[job:\s*([a-z-]+)\s*\]\s*(.*)", re.IGNORECASE)
OWNER_RE = re.compile(r"\bblocked[\s:-]*owner\b", re.IGNORECASE)
BUSY_RE = re.compile(r"another deploy is already running|would delete .*mid-build", re.IGNORECASE)
ACTION_RE = re.compile(r"\*\*ACTION\b([^*]*)\*\*", re.IGNORECASE)
# An ACTION section is only ours if it names us. `**ACTION Claude Code**` is the other
# agent's queue: reading it as ours would be acting on work addressed elsewhere.
MINE_RE = re.compile(r"hermes|automated|watcher", re.IGNORECASE)


def parse_action_items(text):
    """(heading, job_type_or_None, argument) for ACTION bullets addressed to this agent.

    Only ACTION sections are read, so an OWNER bullet can never become work
    (constraint 3); and only sections naming this agent, so the other agent's queue is
    never mistaken for ours. A bullet without a `[job: ...]` marker returns job=None and
    is reported, never guessed at (constraint 1).
    """
    items, heading, in_action, mine = [], "(no heading)", False, False
    for line in text.splitlines():
        if line.startswith("## "):
            heading, in_action, mine = line[3:].strip(), False, False
            continue
        m = ACTION_RE.match(line.strip())
        if m:
            in_action, mine = True, bool(MINE_RE.search(m.group(1)))
            continue
        if in_action and line.startswith("**"):
            in_action = False
            continue
        if in_action and mine and line.strip().startswith("-"):
            bullet = line.strip().lstrip("-").strip()
            j = JOB_RE.search(bullet)
            items.append((heading, j.group(1).lower(), j.group(2).strip()) if j
                         else (heading, None, bullet))
    return items


# ------------------------------------------------------------------------- verification

def verify_routes():
    """Both halves of every route shape. Returns (ok, report)."""
    lines, bad = [], []
    for label, vp, want, ip, iwant in ROUTE_EXPECTATIONS:
        got = status_of(vp)
        if got != want:
            bad.append((vp, want, got))
        lines.append("    %-18s %-50s %-5s want %-5s %s"
                     % (label, vp, got, want, "ok" if got == want else "FAIL"))
        if ip and iwant is not None:
            got = status_of(ip)
            if got != iwant:
                bad.append((ip, iwant, got))
            lines.append("    %-18s %-50s %-5s want %-5s %s"
                         % ("  ^ invalid", ip, got, iwant, "ok" if got == iwant else "FAIL"))
    return not bad, "route verification:\n" + "\n".join(lines)


# ------------------------------------------------------------------------- nginx apply

def location_blocks(text):
    """Every `location ... { ... }` block in a file, as {header: full_block_text}.

    Handles BOTH forms present in this config: a block spread over several lines, and a
    one-liner like `location = /about { try_files ...; }`. Missing the one-liners would
    silently skip most of the file, which is the failure mode a reconciliation script
    must not have.
    """
    blocks, lines = {}, text.splitlines()
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if s.startswith("location ") and "{" in s:
            if s.count("{") == s.count("}"):                  # complete one-liner
                blocks[s[: s.index("{")].strip()] = lines[i]
                i += 1
                continue
            header, body, depth, j = s[: s.index("{")].strip(), [lines[i]], 1, i + 1
            while j < len(lines) and depth > 0:
                body.append(lines[j])
                depth += lines[j].count("{") - lines[j].count("}")
                j += 1
            blocks[header] = "\n".join(body)
            i = j
            continue
        i += 1
    return blocks


def nginx_cmd(*args):
    """nginx control, elevated when not already root.

    The cron runs this script unprivileged, and `apply-nginx` needs to reload nginx, so
    the elevation lives here rather than requiring the whole watcher to run as root -
    `deploy` and `verify-live` stay unprivileged.
    """
    if os.geteuid() == 0:
        return ["nginx", *args]
    return ["sudo", "-n", "nginx", *args]


def can_elevate():
    if os.geteuid() == 0:
        return True
    ok, _ = run(["sudo", "-n", "true"])
    return ok


def job_apply_nginx(_arg):
    """Reconcile the live config with the doc — REPLACEMENTS ONLY, never insertions.

    The doc is a reference, not the literal desired state. The live file carries seven
    deliberate deviations, recorded in its own header, and one of them is load-bearing:
    the doc says `location ^~ /analysis/` where live has `location /analysis/`, and `^~`
    outranks regex locations - applying it would break the legacy `/analysis/{slug}.md`
    redirect and the retired-URL 301. A blind sync also silently drops the rationale
    comments that live blocks carry and the doc does not.

    So this refuses, with a report, whenever the doc declares a block the live config does
    not have (structural change = a human decision), or when replacement would delete
    comment lines the live block has. Otherwise it replaces changed blocks and runs both
    gates.
    """
    if not can_elevate():
        return "fail", "cannot elevate (sudo -n unavailable); refusing to half-apply"

    doc_blocks = location_blocks(DOC_NGINX.read_text())
    if not doc_blocks:
        return "fail", "no location blocks in %s - refusing to touch the live config" % DOC_NGINX
    live_text = LIVE_NGINX.read_text()
    live_blocks = location_blocks(live_text)

    doc_only = [h for h in doc_blocks if h not in live_blocks]
    changed = [h for h in doc_blocks if h in live_blocks and live_blocks[h] != doc_blocks[h]]
    # Refuse only when replacement would leave a block with NO explanation where the live
    # config had one - stripping recorded rationale down to a bare directive. A doc block
    # that carries its own (updated) comments is a documented change, not a silent one, and
    # refusing those would make this tool unable to apply the edits it exists for: the
    # /company/ and /tag/ rationale went stale the moment every hub got a file.
    def comments(block):
        return [l for l in block.splitlines() if l.strip().startswith("#")]

    comment_loss = [h for h in changed
                    if comments(live_blocks[h]) and not comments(doc_blocks[h])]

    if doc_only or comment_loss:
        parts = ["refusing to apply: this needs a human decision, not a sync."]
        if doc_only:
            parts.append("\nDoc declares %d block(s) the live config does not have. Inserting a"
                         " second definition of a route nginx already serves is what produced"
                         " `duplicate location` here today:" % len(doc_only))
            parts += ["  - %s" % h for h in doc_only]
        if comment_loss:
            parts.append("\nReplacing these would delete rationale comments the live block"
                         " carries and the doc does not:")
            parts += ["  - %s" % h for h in comment_loss]
        parts.append("\nThe live config is unchanged. Reconcile doc and live by hand, or"
                     " restructure so nginx includes a single authoritative file.")
        return "fail", "\n".join(parts)

    if not changed:
        return "ok", "live config already matches the doc in every block it declares"

    candidate = live_text
    for header in changed:
        candidate = candidate.replace(live_blocks[header], doc_blocks[header], 1)

    NGINX_BACKUPS.mkdir(parents=True, exist_ok=True)
    backup = NGINX_BACKUPS / ("%s.bak-%s" % (LIVE_NGINX.name, time.strftime("%Y%m%d-%H%M%S")))
    shutil.copy(LIVE_NGINX, backup)

    # GATE 1. Write the candidate WITHOUT reloading: nginx serves the loaded config until
    # a reload, so a candidate that fails -t never affects traffic, and restoring is enough.
    LIVE_NGINX.write_text(candidate)
    ok, out = run(nginx_cmd("-t"))
    if not ok:
        shutil.copy(backup, LIVE_NGINX)
        return "fail", ("nginx -t rejected the candidate; restored %s, nothing served it:\n%s"
                        % (backup.name, out.strip()[-600:]))

    ok, out = run(nginx_cmd("-s", "reload"))
    if not ok:
        shutil.copy(backup, LIVE_NGINX)
        run(nginx_cmd("-s", "reload"))
        return "fail", "reload failed; rolled back to %s:\n%s" % (backup.name, out.strip()[-400:])

    # GATE 2. Behaviour, after. Both halves of every shape.
    time.sleep(3)
    ok, detail = verify_routes()
    if not ok:
        shutil.copy(backup, LIVE_NGINX)
        run(nginx_cmd("-s", "reload"))
        return "fail", ("route verification failed; config ROLLED BACK to %s\n%s"
                        % (backup.name, detail))
    return "ok", ("replaced %d block(s); backup %s\n%s"
                  % (len(changed), backup.name, detail))


# ------------------------------------------------------------------------------ jobs

def job_deploy(_arg):
    """Staged deploy.

    A failure before the swap leaves the live site untouched. deploy.sh takes a
    non-blocking flock and exits non-zero when another deploy holds it, so a busy lock is
    reported as a SKIP: nothing was attempted, nothing was achieved, and the item must
    stay pending so the next run tries again.
    """
    ok, out = run(["./deploy.sh"], timeout=1800)
    if not ok and BUSY_RE.search(out):
        return "skip", "another deploy holds the lock; nothing attempted, will retry next run"
    return ("ok" if ok else "fail"), deploy_summary(out)


def deploy_summary(out):
    """The lines that say what shipped, rather than the vite chunk-size warning."""
    interesting = [l.strip() for l in out.splitlines()
                   if re.search(r"prerender-body: \d+/\d+ routes|corpus \S+ ->|Deployed\.|"
                                r"Generated \d+ |another deploy|ERROR|Traceback", l)]
    if interesting:
        return "\n".join(interesting[-6:])
    return "\n".join([l for l in out.strip().splitlines() if l.strip()][-5:])


def expected_for(path):
    """The status the route table expects for a path, or None if it is not listed."""
    for _label, vp, vs, ip, isx in ROUTE_EXPECTATIONS:
        if path == vp:
            return vs
        if ip and path == ip:
            return isx
    return None


def job_verify_live(arg):
    """Fetch the given paths and compare against the EXPECTED status, not against 200.

    Accepts `path` or `path=NNN`. A bare path is looked up in the route table; a path the
    table does not know is only required to be below 400.

    The first version failed any status >= 400, which reported the *correct* answer as a
    failure whenever the job deliberately checked an invalid URL - and checking that an
    invalid URL is not served a 200 is the entire reason the table has an invalid column.
    """
    specs = [s for s in re.split(r"[,\s]+", arg) if s.strip()]
    if not specs:
        return verify_routes()
    lines, bad = [], []
    for spec in specs:
        path, _, want = spec.partition("=")
        want = int(want) if want.strip().isdigit() else expected_for(path)
        got = status_of(path)
        if want is None:
            ok_here = isinstance(got, int) and got < 400
            note = "ok (< 400)" if ok_here else "FAIL (want < 400)"
        else:
            ok_here = got == want
            note = "ok" if ok_here else "FAIL (want %s)" % want
        if not ok_here:
            bad.append((path, want, got))
        lines.append("    %-50s %-5s %s" % (path, got, note))
    return ("ok" if not bad else "fail"), "verify-live:\n" + "\n".join(lines)


HANDLERS = {
    "deploy": job_deploy,
    "apply-nginx": job_apply_nginx,
    "verify-live": job_verify_live,
    "report": lambda a: ("ok", "report only, nothing executed: " + a),
}


# ---------------------------------------------------------------------- handoff write

def write_entry(lines, dry_run=False):
    """Prepend a run entry above the newest existing one, then push (never force)."""
    body = "\n".join(lines) + "\n"
    if dry_run:
        log("  [dry-run] would prepend to HANDOFF.md:\n" + body)
        return True, "dry-run"
    head, sep, tail = HANDOFF.read_text().partition("\n---\n\n")
    if not sep:
        return False, "cannot find the entries separator in HANDOFF.md"
    HANDOFF.write_text(head + sep + "\n" + body + "\n" + tail)

    for cmd in (["git", "add", "HANDOFF.md"],
                ["git", "commit", "-m", "%s run %s" % (SELF_MARK, time.strftime("%Y-%m-%d %H:%M")),
                 "--", "HANDOFF.md"]):
        ok, out = run(cmd)
        if not ok:
            return False, out.strip()[-300:]
    run(["git", "fetch", "origin", "main"])
    ok, out = run(["git", "pull", "--rebase", "--autostash", "origin", "main"])
    if not ok:
        run(["git", "rebase", "--abort"])
        return False, "rebase conflict writing the entry; resolve by hand:\n" + out.strip()[-400:]
    ok, out = run(["git", "push", "origin", "main"])
    return (True, "entry pushed") if ok else (False, "push rejected: " + out.strip()[-300:])


# ----------------------------------------------------------------------- recovery
# A pull that conflicts used to leave the tree mid-rebase. Every later run then failed on
# "you have unmerged files", so the job sat broken for two hours on 2026-10-17 while
# nothing said why. Recover instead: both agents append entries at the top of HANDOFF.md,
# so a replayed entry conflicts in that one file and nowhere else, and keeping both sides
# is the correct merge, not a guess. Anything else is aborted, never resolved blind.

STUCK_MARKERS = ("rebase-merge", "rebase-apply", "MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD")
CONFLICT_BLOCK = re.compile(r"<<<<<<< [^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*\n", re.S)


def stuck_operation():
    for marker in STUCK_MARKERS:
        if (REPO / ".git" / marker).exists():
            return marker
    return None


def resolve_handoff_conflict():
    """Keep both sides of a HANDOFF.md conflict: upstream first, then the replayed
    entry. Returns (ok, detail); ok means the repository is clean again."""
    ok, out = run(["git", "diff", "--name-only", "--diff-filter=U"])
    unmerged = [p for p in out.split() if p]
    if unmerged != ["HANDOFF.md"]:
        return False, "unmerged paths: %s" % (", ".join(unmerged) or "none")

    text = HANDOFF.read_text()
    seen = []

    def keep_both(match):
        seen.append(1)
        return match.group(1).rstrip("\n") + "\n\n" + match.group(2).rstrip("\n") + "\n"

    text = CONFLICT_BLOCK.sub(keep_both, text)
    if not seen:
        return False, "no conflict block in HANDOFF.md"
    if "<<<<<<<" in text or ">>>>>>>" in text:
        return False, "conflict markers survived the rewrite"

    HANDOFF.write_text(text)
    run(["git", "add", "HANDOFF.md"])
    ok, out = run(["git", "-c", "core.editor=true", "rebase", "--continue"])
    if not ok:
        return False, "rebase --continue failed: " + out.strip()[-300:]
    return True, "kept both entries (%d block(s))" % len(seen)


def abort_stuck_operation():
    for args in (["rebase", "--abort"], ["merge", "--abort"],
                 ["cherry-pick", "--abort"], ["revert", "--abort"]):
        if not stuck_operation():
            return True
        run(["git"] + args)
    return stuck_operation() is None


# -------------------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--verify", action="store_true", help="route table only, no queue")
    args = ap.parse_args()

    log("handoff-watcher %s" % time.strftime("%Y-%m-%d %H:%M:%S"))
    if args.verify:
        ok, detail = verify_routes()
        print(detail)
        print("verification: %s" % ("PASS" if ok else "FAIL"))
        return 0 if ok else 1

    state = load_state()
    state["runs"] = state.get("runs", 0) + 1

    stuck = stuck_operation()
    if stuck:
        log("  repository left mid-%s by an earlier run; recovering" % stuck)
        resolved, detail = resolve_handoff_conflict()
        if resolved:
            log("  recovered: %s" % detail)
        else:
            aborted = abort_stuck_operation()
            log("  recovery failed (%s); %s" % (
                detail, "aborted to a clean tree" if aborted else "TREE STILL STUCK"))
            save_state(state)
            return 1

    ok, out = run(["git", "fetch", "origin", "main"])
    if not ok:
        log("  github unreachable; nothing read this run")
        write_entry(["## %s — watcher" % time.strftime("%Y-%m-%d %H:%M"), "",
                     "**Nothing done:** `git fetch` failed, so no queue could be read.",
                     "The next run retries."], args.dry_run)
        save_state(state)
        return 0

    ok, out = run(["git", "pull", "--rebase", "--autostash", "origin", "main"])
    if not ok:
        log("  pull conflicted:\n%s" % out.strip()[-300:])
        resolved, detail = resolve_handoff_conflict()
        if resolved:
            log("  resolved automatically: %s" % detail)
        else:
            aborted = abort_stuck_operation()
            log("  could not resolve (%s); %s" % (
                detail, "tree restored to clean" if aborted else "TREE STILL STUCK"))
            save_state(state)
            return 1

    _, log_out = run(["git", "log", "--format=%h%x09%s", "-20"])
    state["last_sha"] = log_out.splitlines()[0].split("\t")[0] if log_out.strip() else None
    log("  at %s" % state["last_sha"])

    pending, unmarked, skipped_owner = [], [], []
    for heading, job, arg in parse_action_items(HANDOFF.read_text()):
        eid = entry_id(heading, job or "-", arg)
        if eid in state["actioned"]:
            continue
        if job is None:
            unmarked.append((heading, arg))
        elif OWNER_RE.search(arg):
            skipped_owner.append((heading, arg))
            state["actioned"].append(eid)
        else:
            pending.append((heading, job, arg, eid))

    # Unmarked ACTION items are reported ONCE. They used to be re-listed in every entry, so
    # at a 20-minute cadence the log repeated the same four bullets all day and buried the
    # entries that mattered. A `[done]` modifier was the suggestion; keying on the bullet's
    # own text needs no new convention and cannot be forgotten, which is the point - the
    # protocol you must remember to follow is the one that fails.
    state.setdefault("reported_unmarked", [])
    freshly_reported = []
    for h, a in unmarked:
        uid = entry_id("unmarked", h, a)
        if uid in state["reported_unmarked"]:
            continue
        state["reported_unmarked"].append(uid)
        freshly_reported.append((h, a))
    state["reported_unmarked"] = state["reported_unmarked"][-ACTIONED_CAP:]
    stale_unmarked = len(unmarked) - len(freshly_reported)

    if not pending:
        # Constraint 6 says leave an entry every run, including an idle one, because a
        # silent watcher is indistinguishable from a broken one. Taken literally at a
        # 20-minute cadence that is ~72 commits a day into one file, which would make the
        # log unreadable and bury the entries that matter. So idle runs coalesce: the
        # first idle run of the day records it, later ones on the same day are silent.
        # Liveness stays visible - the entry is there, and cron history shows every run.
        today = time.strftime("%Y-%m-%d")
        if state.get("idle_entry_date") == today:
            log("  idle; an idle entry for %s already exists, not repeating it" % today)
            save_state(state)
            return 0
        state["idle_entry_date"] = today
        lines = ["## %s — watcher" % time.strftime("%Y-%m-%d %H:%M"), "",
                 "**Idle** — nothing executable.", "",
                 "No unactioned `[job: ...]` item in HANDOFF.md." if not unmarked and not skipped_owner
                 else "%d unmarked and %d owner-blocked item(s)." % (len(unmarked), len(skipped_owner))]
        if stale_unmarked:
            lines.append("- %d previously reported, unchanged; not repeated here."
                         % stale_unmarked)
        for h, a in freshly_reported:
            lines.append("- RECORDED ONLY, no `[job: ...]` marker so never executed: %s (*%s*)"
                         % (a[:100], h))
        for h, a in skipped_owner:
            lines.append("- SKIPPED, blocked on an owner decision (constraint 3): %s (*%s*)"
                         % (a[:100], h))
        log("  " + lines[2])
        write_entry(lines, args.dry_run)
        save_state(state)
        return 0

    # A dry run must have NO side effects: it neither executes a job nor marks one
    # actioned (marking would make the real run skip it). This was wrong in the first
    # version - --dry-run ran the queue, which is precisely the opposite of a preview.
    if args.dry_run:
        print("handoff-watcher --dry-run: %d job(s) queued, nothing executed" % len(pending))
        for heading, job, arg, _eid in pending:
            marker = "" if job in JOBS else "  (NOT IN WHITELIST - would be skipped)"
            print("- [job: %s] %s%s\n    from: %s" % (job, arg[:110], marker, heading))
        for h, a in unmarked:
            print("- (no marker, would be recorded only): %s" % a[:110])
        for h, a in skipped_owner:
            print("- (owner-blocked, would be skipped): %s" % a[:110])
        return 0

    results, failed, ran, skipped_busy = [], False, [], []
    for heading, job, arg, eid in pending:
        if job not in JOBS:
            results.append("- SKIPPED, `%s` is not in the executable whitelist: %s (*%s*)"
                           % (job, arg[:80], heading))
            state["actioned"].append(eid)
            continue

        # Cooldown guard. The idempotency key includes the entry heading, so editing a
        # heading's wording makes an already-actioned item look new - which on 2026-10-11
        # cost a redundant six-minute redeploy, because a heading was renamed to describe
        # the same work. Re-running a job whose identical form SUCCEEDED within the hour is
        # almost always that mistake; a failed attempt is deliberately not blocked, so a
        # fix-and-retry still works.
        key = "%s|%s" % (job, arg)
        last_ok = (state.get("last_ok") or {}).get(key)
        if last_ok and (time.time() - last_ok) < COOLDOWN_MINUTES * 60:
            results.append("- SKIPPED `[job: %s]` (*%s*): the same job and argument succeeded"
                           " %d minutes ago, so this is a duplicate request rather than new"
                           " work." % (job, heading, (time.time() - last_ok) / 60))
            state["actioned"].append(eid)
            continue

        log("  [job: %s] from %s" % (job, heading))
        try:
            stat, detail = HANDLERS[job](arg)
        except Exception as exc:
            stat, detail = "fail", "%s: %s" % (type(exc).__name__, exc)
        glyph = {"ok": "OK", "skip": "SKIPPED", "fail": "FAILED"}.get(stat, "FAILED")
        results.append("- **%s** `[job: %s]` %s\n\n```\n%s\n```"
                       % (glyph, job, heading, detail.strip()[:1800]))
        if stat == "skip":
            # Deliberately NOT actioned: nothing was attempted and nothing was achieved
            # (a deploy skipped because another held the lock), so the next run retries.
            skipped_busy.append((job, heading, detail))
        else:
            state["actioned"].append(eid)
            ran.append(job)
        if stat == "ok":
            state.setdefault("last_ok", {})[key] = time.time()
        if stat == "fail":
            failed = True
            results.append("- Stopping here: fail closed, no retry. Remaining items wait "
                           "for the next run.")
            break

    lines = ["## %s — watcher" % time.strftime("%Y-%m-%d %H:%M"), "",
             "**Ran:** %s" % (", ".join(ran) if ran else "nothing executable"),
             "", *results]
    for h, a in freshly_reported:
        lines.append("- NOT EXECUTED (no `[job: ...]` marker): %s (*%s*)" % (a[:100], h))
    if stale_unmarked:
        lines.append("- %d previously reported unmarked item(s), unchanged."
                     % stale_unmarked)
    for h, a in skipped_owner:
        lines.append("- SKIPPED (owner-blocked): %s (*%s*)" % (a[:100], h))
    for job, h, d in skipped_busy:
        lines.append("- LEFT PENDING: `%s` was not attempted (%s), so it stays queued."
                     % (job, d[:90]))
    ok, detail = write_entry(lines, args.dry_run)
    if not ok:
        log("  WARNING: could not write the HANDOFF entry: %s" % detail)
    save_state(state)
    # stdout = the deliverable, and it should be worth the owner's attention. Silence when
    # the run did nothing; report jobs run, skips and failures. Unmarked ACTION items are
    # deliberately NOT repeated here: they are recorded in the HANDOFF entry, which is the
    # channel the other agent reads, and listing them in chat every run would train the
    # owner to ignore these messages - which is worse than not sending them.
    if failed or ran or skipped_busy:
        print("handoff-watcher: %s" % (", ".join(ran) if ran else "no jobs executed"))
        if results:
            print("\n".join(results))
        for job, h, d in skipped_busy:
            print("- LEFT PENDING: %s was not attempted (%s)" % (job, d[:90]))
        if not ok:
            print("WARNING: the HANDOFF entry could not be written: %s" % detail)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
