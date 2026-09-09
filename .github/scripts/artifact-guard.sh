#!/usr/bin/env bash
# Artifact guard (openspec security-headers-and-cicd-gates § CI security gates;
# shared with security-remove-duplicator-and-purge-artifacts § CI guard).
#
# Fails when a backup, installer, archive or database dump is tracked in git —
# or, given a directory, present in a deploy bundle. .gitignore alone does not
# catch force-adds or bundle contents; this does.
#
#   .github/scripts/artifact-guard.sh            # tracked files (git ls-files)
#   .github/scripts/artifact-guard.sh <dir>      # every file under <dir> (deploy bundle)
#
# Exceptions: one regex per line in .github/artifact-guard-allow, each with a
# comment saying why the match is not an artifact.
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
allow_file="$here/../artifact-guard-allow"

# Deny patterns (POSIX ERE, matched against the repo-relative path).
deny=(
  '\.zip$'
  '\.(tar|tgz|tar\.gz|tar\.bz2|tar\.xz|7z|rar)$'
  '\.(sql|sql\.gz|sql\.zip|sql\.bz2|dump)$'
  '\.wpress$'
  '(^|/)installer(-backup)?\.php$'
  '(^|/)dup-installer(/|$)'
  '(^|/)backups-dup-(lite|pro)(/|$)'
  '(^|/)wp-content/(backups?|ai1wm-backups|updraft|backwpup-[^/]+)(/|$)'
  '_archive\.(zip|daf)$'
  '(^|/)wp-config\.php$'
  '(^|/)\.env$'
  '(^|/)\.env\.(local|development|dev|staging|production|prod|test)$'
)

allow=()
if [[ -f "$allow_file" ]]; then
  while IFS= read -r line; do
    line="${line%%#*}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -n "$line" ]] && allow+=("$line")
  done < "$allow_file"
fi

if [[ $# -gt 0 ]]; then
  root=${1%/}
  [[ -d "$root" ]] || { echo "artifact-guard: not a directory: $root" >&2; exit 2; }
  files=$(cd "$root" && find . -type f | sed 's#^\./##')
  label="under $root"
else
  files=$(git ls-files)
  label="tracked"
fi

hits=()
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  for pattern in "${deny[@]}"; do
    if [[ "$file" =~ $pattern ]]; then
      allowed=0
      for ok in "${allow[@]+"${allow[@]}"}"; do
        [[ "$file" =~ $ok ]] && { allowed=1; break; }
      done
      (( allowed )) || hits+=("$file  (matched: $pattern)")
      break
    fi
  done
done <<< "$files"

if (( ${#hits[@]} )); then
  echo "artifact-guard: ${#hits[@]} backup/installer/archive/dump artifact(s) $label:" >&2
  printf '  %s\n' "${hits[@]}" >&2
  echo "Remove the file (and purge it from history if it was ever real). A false positive goes in .github/artifact-guard-allow with a reason." >&2
  exit 1
fi

echo "artifact-guard: ok (no backup/installer/archive/dump artifacts $label)"
