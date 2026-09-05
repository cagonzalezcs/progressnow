#!/usr/bin/env bash
#
# Link the untracked WordPress runtime (core, config, uploads, languages) from a
# full checkout into a git worktree so a local server (MAMP, `wp server`, …)
# can serve the worktree as a docroot.
#
#   wp-content/themes/progressnow/bin/worktree-bootstrap.sh /path/to/full-checkout
#
# Everything is a symlink, so the worktree shares the full checkout's
# wp-config.php and therefore its DATABASE. Snapshot first:
#   wp db export ~/backups/site-$(date +%F).sql
#
set -euo pipefail

SOURCE="${1:-}"
if [ -z "$SOURCE" ] || [ ! -f "$SOURCE/wp-config.php" ]; then
	echo "usage: $0 /path/to/full-checkout   (must contain wp-config.php)" >&2
	exit 1
fi
SOURCE="$(cd "$SOURCE" && pwd)"
WORKTREE="$(cd "$(dirname "$0")/../../../.." && pwd)"

if [ "$SOURCE" = "$WORKTREE" ]; then
	echo "refusing: source and worktree are the same directory ($WORKTREE)" >&2
	exit 1
fi

link() {
	local rel="$1"
	if [ -e "$WORKTREE/$rel" ] || [ -L "$WORKTREE/$rel" ]; then
		echo "skip  $rel (already present)"
	elif [ ! -e "$SOURCE/$rel" ]; then
		echo "miss  $rel (not in source)"
	else
		ln -s "$SOURCE/$rel" "$WORKTREE/$rel"
		echo "link  $rel"
	fi
}

# WordPress core + config (gitignored in this repo).
for rel in wp-admin wp-includes index.php wp-config.php license.txt readme.html xmlrpc.php; do
	link "$rel"
done
for file in "$SOURCE"/wp-*.php; do
	link "$(basename "$file")"
done

# Runtime content that is never versioned.
mkdir -p "$WORKTREE/wp-content"
for rel in wp-content/index.php wp-content/uploads wp-content/languages wp-content/plugins; do
	link "$rel"
done

cat <<EOF

Worktree docroot ready: $WORKTREE
  - Point MAMP (or a second host) at that path.
  - It shares $SOURCE/wp-config.php → the SAME database as the full checkout.
  - Static build for the shell (CHAPTER_STATIC_DIR) lives at site/.output/public.
EOF
