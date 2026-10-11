#!/bin/bash
# What landed while this session was not running.
#
# An interactive session is not a process: nothing is listening between
# sessions, so a git hook cannot notify it. The equivalent is to look the moment
# a session starts, which is what this does — it runs from the SessionStart hook
# in .claude/settings.json.
#
# Prints new commits on origin/main and the newest HANDOFF.md entry, then gets
# out of the way. Never fails the session: a missing network or a missing remote
# is a quiet skip, not an error.
#
# Run it by hand any time with:  bash scripts/handoff-check.sh

set -uo pipefail
cd "$(dirname "$0")/.." || exit 0

git rev-parse --git-dir >/dev/null 2>&1 || exit 0

# Short timeout: a session start must not block on a slow or absent network.
timeout 15 git fetch origin --quiet 2>/dev/null || {
  echo "handoff-check: could not reach origin, skipping"
  exit 0
}

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
[ "$BRANCH" = "HEAD" ] && exit 0

UPSTREAM="origin/$BRANCH"
git rev-parse --verify "$UPSTREAM" >/dev/null 2>&1 || exit 0

BEHIND="$(git rev-list --count "HEAD..$UPSTREAM" 2>/dev/null || echo 0)"
AHEAD="$(git rev-list --count "$UPSTREAM..HEAD" 2>/dev/null || echo 0)"

if [ "$BEHIND" = "0" ] && [ "$AHEAD" = "0" ]; then
  echo "handoff-check: in sync with $UPSTREAM"
  exit 0
fi

echo "──────────── handoff-check ────────────"

if [ "$BEHIND" != "0" ]; then
  echo "$BEHIND new commit(s) on $UPSTREAM — you have NOT merged these:"
  git log --oneline --no-decorate "HEAD..$UPSTREAM" | sed 's/^/  /'
  echo ""
  echo "Files they touched:"
  git diff --name-only "HEAD...$UPSTREAM" | sed 's/^/  /' | head -20
  echo ""
  echo "  Merge with:  git merge origin/$BRANCH"
fi

[ "$AHEAD" != "0" ] && echo "$AHEAD local commit(s) not pushed."

# The newest handoff entry as the remote has it, which is the point of the file.
if git cat-file -e "$UPSTREAM:HANDOFF.md" 2>/dev/null; then
  echo ""
  echo "Newest HANDOFF.md entry on $UPSTREAM:"
  git show "$UPSTREAM:HANDOFF.md" 2>/dev/null \
    | awk '/^## 20/{n++} n==1' \
    | head -40 \
    | sed 's/^/  /'
fi

echo ""
echo "Full protocol: AGENTS.md section 9. Claim an item before starting it."
echo "───────────────────────────────────────"
