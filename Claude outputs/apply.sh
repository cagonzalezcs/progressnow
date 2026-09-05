#!/usr/bin/env bash
# progressnow — finish the branch cleanup (v5, 2026-09-05 evening).
# Run on your Mac:   bash ~/Sites/progressnow/.claude/cowork-cleanup/apply.sh            # steps 1-4, 6
#                    bash ~/Sites/progressnow/.claude/cowork-cleanup/apply.sh --merge    # + step 5 (merge main into the Next.js worktree)
# Safe to re-run. Nothing is pushed; the push commands are printed at the end.
#
# v5 vs v4 — the repo moved after v4 was written:
#   * the main checkout is on `main` (feature was merged into it at 14:20 and pushed),
#     so the history rewrite happens on `main`, is verified tree-for-tree against the
#     pre-rewrite `main` (only site/ may differ), and `feature` then follows `main`;
#   * 62db270 is replaced rather than dropped: it also added the "# Frontend" block to
#     .gitignore that the commits after it extend (dropping it outright conflicts);
#   * `main` (not feature) is merged into the Next.js worktree;
#   * the README status row is refreshed along with the roadmap counts, and the
#     next-js-site-implementation count is read from the worktree's tasks.md (the live copy);
#   * claude/stoic-austin-080665 (A11yWidget aria-dialog-name) had NOT actually been merged —
#     it is replayed onto main (site/ → nuxt-js/) before the branch is deleted.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WT="$ROOT/.claude/worktrees/next-js-site-implementation-f8da2b"
HERE="$ROOT/.claude/cowork-cleanup"
MAIN="main"
FEATURE="feature/cg/next-js-migration-from-nuxt"
NEXTJS="claude/next-js-site-implementation-f8da2b"
GOOD="aaa949d"   # Merge claude/next-js-site-implementation-f8da2b: nuxt-js rename + next-js app  (= parent of BAD)
BAD="62db270"    # "Removing node_modles…" — actually ADDED site/.output + site/.nuxt (925 files, 214k lines)
A11Y_FIX="8a78285"   # claude/stoic-austin-080665: Name A11yWidget popover dialog (aria-dialog-name)
TRAILER="Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01MiUA3Gn1vQ4mMwnJZPaUkL"

MERGE=0; if [ "${1:-}" = "--merge" ]; then MERGE=1; fi   # step 5 (merge main into the Next.js worktree) only runs with --merge

say() { printf '%s\n' "$*"; }
die() { printf 'apply.sh: %s\n' "$*" >&2; exit 1; }
STARTED=0
trap 'st=$?; if [ $st -ne 0 ] && [ $STARTED = 1 ]; then printf "\napply.sh: stopped (exit %s). Nothing was pushed.\n  rebase in progress in %s?  git rebase --abort\n  merge in progress in the worktree?  git -C %s merge --abort\nRe-run the script once the tree is clean again; finished steps are skipped.\n" "$st" "$ROOT" "$WT" >&2; fi' EXIT

cd "$ROOT"
rm -rf "$ROOT/.claude/_to_delete" "$HERE/cleanup.bundle"

# --- guards -------------------------------------------------------------
for c in "$GOOD" "$BAD" "$A11Y_FIX"; do git rev-parse -q --verify "$c^{commit}" >/dev/null || die "commit $c not found"; done
[ "$(git rev-parse "$BAD^")" = "$(git rev-parse "$GOOD")" ] || die "$GOOD is not the parent of $BAD — re-check before rewriting"
cur="$(git rev-parse --abbrev-ref HEAD)"
[ "$cur" = "$MAIN" ] || die "expected $MAIN checked out at $ROOT (found $cur)"
if [ -n "$(git status --porcelain)" ]; then
  say "main checkout is not clean — commit, stash, or move these aside first (untracked counts too):"
  git status --short | head; exit 1
fi
if [ -e .git/rebase-merge ] || [ -e .git/rebase-apply ] || [ -e .git/MERGE_HEAD ]; then die "a rebase/merge is in progress in $ROOT"; fi
[ -d "$WT" ] || die "worktree missing: $WT"
[ "$(git -C "$WT" rev-parse --abbrev-ref HEAD)" = "$NEXTJS" ] || die "worktree is not on $NEXTJS"
if [ -n "$(git -C "$WT" status --porcelain)" ]; then
  say "Next.js worktree is not clean — the session working there (SEO, task 7.x) must commit first:"
  git -C "$WT" status --short | head; exit 1
fi
if [ -e "$(git -C "$WT" rev-parse --git-dir)/MERGE_HEAD" ]; then die "a merge is in progress in the worktree"; fi
git merge-base --is-ancestor "$FEATURE" "$MAIN" || die "$FEATURE has commits that are not on $MAIN — merge it into $MAIN first, then re-run"
STARTED=1

# --- 1. drop the accidental build-output commit -------------------------
say "== 1. drop the site/ build output that $BAD added (925 files; it removed nothing)"
if git merge-base --is-ancestor "$BAD" "$MAIN"; then
  OLD_MAIN="$(git rev-parse "$MAIN")"
  n="$(git rev-list --count --no-merges "$BAD..$MAIN")"
  m="$(git rev-list --count --merges "$BAD..$MAIN")"
  # BAD also appended a legitimate "# Frontend / node_modules" block to .gitignore that later commits build on,
  # so it is replaced by a twin commit that keeps everything but site/ (same author, date and message).
  tmpidx="$(mktemp)"; rm -f "$tmpidx"
  GIT_INDEX_FILE="$tmpidx" git read-tree "$BAD"
  GIT_INDEX_FILE="$tmpidx" git ls-files -z -- site | GIT_INDEX_FILE="$tmpidx" git update-index -z --force-remove --stdin
  newtree="$(GIT_INDEX_FILE="$tmpidx" git write-tree)"; rm -f "$tmpidx"
  [ "$(git diff --name-only "$GOOD" "$newtree")" = ".gitignore" ] || die "$BAD changed more than site/ and .gitignore — re-check before rewriting"
  BAD2="$(printf '%s\n\n(Rewritten %s: this commit originally also added 925 files of site/.output + site/.nuxt build output; only its .gitignore change is kept.)\n' "$(git log -1 --format=%B "$BAD")" "$(date +%F)" \
    | GIT_AUTHOR_NAME="$(git log -1 --format=%an "$BAD")" GIT_AUTHOR_EMAIL="$(git log -1 --format=%ae "$BAD")" GIT_AUTHOR_DATE="$(git log -1 --format=%aD "$BAD")" \
      git commit-tree "$newtree" -p "$GOOD" -F -)"
  say "   rewriting $MAIN: $BAD -> ${BAD2:0:7} (.gitignore change only), then replaying $n commits on top ($m merge commits are dropped — they carry no content of their own; verified below)"
  git rebase -q --onto "$BAD2" "$BAD" "$MAIN"
  # The rewrite must change nothing except removing site/: same tree as the old main everywhere else.
  if ! git diff --quiet "$OLD_MAIN" "$MAIN" -- . ':(exclude)site'; then
    say "   REWRITE MISMATCH — restoring $MAIN to $OLD_MAIN. Differences outside site/:"
    git diff --stat "$OLD_MAIN" "$MAIN" -- . ':(exclude)site' | tail -20
    git reset -q --hard "$OLD_MAIN"; exit 1
  fi
  say "   ok: ${OLD_MAIN:0:7} -> $(git rev-parse --short "$MAIN"); tree identical outside site/"
else
  say "   already gone — skipping"
fi

say "== 1b. stale site/ leftovers (build output from before the nuxt-js rename)"
if [ -f site/.env ] && [ ! -f nuxt-js/.env ]; then mv site/.env nuxt-js/.env; say "   moved site/.env -> nuxt-js/.env"; fi
if [ -n "$(git ls-files site)" ]; then
  git rm -r -q --cached site
  git commit -q -m "Untrack stale site/ build output (site/ is now nuxt-js/)

$TRAILER"
  say "   untracked what was still under site/"
fi
rm -rf site
say "   site/ gone"

say "== 1c. .gitignore: the plugin symlinks bin/worktree-bootstrap.sh creates"
if ! grep -qx '/wp-content/plugins' .gitignore; then
  printf '%s\n' '/wp-content/plugins' '/wp-content/mu-plugins' >> .gitignore
  git add .gitignore
  git commit -q -m "gitignore: cover the worktree plugin symlinks (bin/worktree-bootstrap.sh)

$TRAILER"
  say "   added /wp-content/plugins + /wp-content/mu-plugins (the trailing-slash patterns don't match symlinks)"
else
  say "   already present"
fi

# --- 2. the a11y fix that never landed ----------------------------------
say "== 2. replay $A11Y_FIX (A11yWidget aria-dialog-name) — the handoff said it was merged; main never took it"
replay_a11y() { # $1 = path inside $A11Y_FIX, $2 = the same file on main today
  if grep -q 'a11y-widget-heading' "$2"; then say "   already in $2"; return 0; fi
  git show --format= "$A11Y_FIX" -- "$1" | sed "s#$1#$2#g" | git apply --index -3
  say "   applied to $2"
}
replay_a11y wp-content/themes/progressnow/src/components/site/A11yWidget.vue wp-content/themes/progressnow/src/components/site/A11yWidget.vue
replay_a11y site/app/components/site/A11yWidget.vue nuxt-js/app/components/site/A11yWidget.vue
if ! git diff --cached --quiet; then
  git commit -q -m "Name A11yWidget popover dialog (aria-dialog-name)

Replayed from claude/stoic-austin-080665 ($A11Y_FIX), which never reached main; its
site/ path is nuxt-js/ now. next-js/components/site/A11yWidget.tsx already has it.

$TRAILER"
fi

# --- 3. README ----------------------------------------------------------
say "== 3. README: roadmap counts + frontend status row from openspec/changes/*/tasks.md"
WT="$WT" python3 - <<'PY'
import os, pathlib, re
root = pathlib.Path("."); wt = pathlib.Path(os.environ["WT"])
def count(p):
    b = p.read_text()
    done = len(re.findall(r"^\s*- \[x\]", b, re.M)); todo = len(re.findall(r"^\s*- \[ \]", b, re.M))
    return done, done + todo
counts = {}
for tasks in sorted((root / "openspec/changes").glob("*/tasks.md")):
    name = tasks.parent.name
    cands = [count(tasks)]
    other = wt / "openspec/changes" / name / "tasks.md"   # the worktree's copy is the live one for its change
    if other.is_file(): cands.append(count(other))
    done, total = max(cands)
    if total: counts[name] = f"{done}/{total}"
readme = root / "README.md"; text = readme.read_text(); changed = []
def roadmap(m):
    name, col = m.group(1), m.group(2).strip()
    # only refresh rows that already carry a count; leave prose ("partial", "Superseded by …") alone
    if not re.fullmatch(r"\d+/\d+", col) or counts.get(name, col) == col: return m.group(0)
    changed.append(f"{name} {col} -> {counts[name]}"); return f"| `{name}` | {counts[name]} |"
text = re.sub(r"^\| `([a-z0-9-]+)` \|([^|]*)\|", roadmap, text, flags=re.M)
def status_row(line):
    def n_tasks(m):
        name, col = m.group(1), m.group(2)
        if counts.get(name, col) == col: return m.group(0)
        changed.append(f"status: {name} {col} -> {counts[name]}"); return f"`{name}` {counts[name]} tasks"
    line = re.sub(r"`([a-z0-9-]+)` (\d+/\d+) tasks", n_tasks, line)
    def in_progress(m):
        name = m.group(1)
        if name not in counts: return m.group(0)
        changed.append(f"status: {name} -> {counts[name]} tasks, in progress"); return f"`{name}` {counts[name]} tasks, in progress"
    return re.sub(r"`([a-z0-9-]+)` in progress \(see Roadmap\)", in_progress, line)
text = "\n".join(status_row(l) if l.startswith("| Status |") else l for l in text.split("\n"))
if changed:
    readme.write_text(text); print("   " + "; ".join(changed))
else:
    print("   already current")
PY
if ! git diff --quiet README.md; then
  git add README.md
  git commit -q -m "README: refresh the roadmap task counts and the frontend status row

$TRAILER"
fi

[ -z "$(git status --porcelain)" ] || { say "unexpected leftovers:"; git status --short | head; exit 1; }
[ -z "$(git ls-files site)" ] || die "site/ still tracked"
if git merge-base --is-ancestor "$BAD" "$MAIN"; then die "$BAD is still in $MAIN's history"; fi

# --- 4. feature follows main; main goes into the Next.js worktree ---------
say "== 4. $FEATURE follows $MAIN"
git branch -f "$FEATURE" "$MAIN"
say "   $FEATURE = $(git rev-parse --short "$MAIN")"

say "== 5. merge $MAIN into the Next.js worktree"
if git -C "$WT" merge-base --is-ancestor "$MAIN" HEAD; then
  say "   already merged — skipping"
elif [ "$MERGE" != 1 ]; then
  say "   skipped — this is not mechanical any more. Rehearsed 2026-09-05: 22 files conflict, mostly add/add in"
  say "   next-js/components/site/blog/* (both lines wrote the blog blocks), RoutePost/RouteCalendar, page.tsx,"
  say "   post.ts/events.ts and their tests, plus ci.yml, README.md and next-js-site-implementation/tasks.md."
  say "   Do it as its own session in the worktree, then:  bash $HERE/apply.sh --merge"
else
  # wp-config.php is untracked on both lines now, but keep a copy of the worktree's (pinned WP_HOME/WP_SITEURL) just in case.
  if [ -f "$WT/wp-config.php" ]; then cp "$WT/wp-config.php" "$HERE/wp-config.worktree.php"; fi
  if ! git -C "$WT" -c merge.renameLimit=20000 merge --no-edit "$MAIN"; then
    # Expected shape of conflict: a file the main line stopped tracking (gitignored) that the
    # worktree still has committed. Accept the untracking and KEEP the worktree's copy on disk.
    for f in $(git -C "$WT" diff --name-only --diff-filter=U); do
      if [ -z "$(git -C "$WT" ls-tree "$MAIN" -- "$f")" ] && git -C "$WT" check-ignore -q --no-index "$f"; then
        git -C "$WT" rm -q --cached "$f"
        say "   untracked (kept on disk): $f"
      fi
    done
    if [ -n "$(git -C "$WT" diff --name-only --diff-filter=U)" ]; then
      say "   merge stopped on conflicts that need you — next-js/ was edited on both lines:"
      git -C "$WT" diff --name-only --diff-filter=U | sed 's/^/     /'
      say "   resolve in $WT (the worktree owns next-js/), 'git commit', then re-run this script"
      exit 1
    fi
    git -C "$WT" commit -q --no-edit
  fi
  say "   merged: $(git -C "$WT" log -1 --format='%h %s')"
fi
# WP core, wp-config, plugins and languages are not tracked there — re-link them from this checkout.
if [ ! -e "$WT/wp-config.php" ] && [ -f "$HERE/wp-config.worktree.php" ]; then
  cp "$HERE/wp-config.worktree.php" "$WT/wp-config.php"
  say "   restored the worktree's own wp-config.php"
fi
if [ -f "$ROOT/wp-config.php" ]; then
  "$WT/wp-content/themes/progressnow/bin/worktree-bootstrap.sh" "$ROOT" | sed 's/^/   /'
  for rel in wp-content/plugins wp-content/languages; do
    if [ -e "$WT/$rel" ] && [ ! -L "$WT/$rel" ]; then
      say "   note: $WT/$rel is a real directory, not a symlink — move it aside and re-run the bootstrap if the worktree site misbehaves"
    fi
  done
else
  say "   (no wp-config.php in $ROOT — worktree bootstrap skipped; rehearsal clone?)"
fi

# --- 6. retire the spent worktrees ---------------------------------------
say "== 6. retire the spent worktrees"
# peaceful-williams-08cc2b (Styleguide captions) was verified to be in main already;
# stoic-austin-080665 was replayed in step 2 — both grep guards must pass before its branch goes.
for f in wp-content/themes/progressnow/src/components/site/A11yWidget.vue nuxt-js/app/components/site/A11yWidget.vue; do
  grep -q 'a11y-widget-heading' "$f" || die "A11yWidget fix missing in $f — not deleting claude/stoic-austin-080665"
done
for w in stoic-austin-080665 peaceful-williams-08cc2b; do
  if [ -d ".claude/worktrees/$w" ]; then git worktree remove --force ".claude/worktrees/$w"; say "   removed worktree $w"; fi
  if git show-ref -q --verify "refs/heads/claude/$w"; then git branch -q -D "claude/$w"; say "   deleted branch claude/$w"; fi
done
git worktree prune

merged="not yet merged into the worktree — run with --merge when the worktree is free"
if git -C "$WT" merge-base --is-ancestor "$MAIN" HEAD; then merged="merged into the worktree"; fi
cat <<EOF

Done — nothing pushed. $MAIN is $merged. Check:
  git log --oneline -8                                   # main: replayed commits + today's cleanup commits
  git diff --stat origin/main main -- . ':(exclude)site' # only the cleanup commits' own changes
  git -C "$WT" log --oneline -3
  git worktree list                                      # 2 entries

Then push (rewritten history on main + feature; the Next.js branch already diverged from its origin):
  git push --force-with-lease origin $MAIN
  git push --force-with-lease origin $FEATURE
  git -C "$WT" push --force-with-lease origin $NEXTJS

When everything above is pushed and the worktree merge is done: rm -rf "$HERE"
EOF
