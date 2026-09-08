## Context

`git ls-files | awk -F/ '{print $1}' | sort | uniq -c` shows `site` (924) ahead of `wp-content` (538), `nuxt-js` (443), and `next-js` (353). Everything under `site/` is `.output/` or `.nuxt/`. `next-js/openspec/` was created when the Next work ran in its own worktree; the root project never absorbed it. `Claude outputs/` was committed by a session that intended `.claude/`.

## Goals / Non-Goals

**Goals:**
- Every tracked path is either source, docs, specs, config, or a deliberately shipped asset with provenance.
- One place to list specs and changes.
- The theme's package metadata names this project.

**Non-Goals:**
- Rewriting git history (the release checklist already plans a fresh history at fork time).
- Re-organizing app internals or renaming `wp-content/themes/progressnow`.
- Defining the hygiene gate (owned by `open-source-release-readiness`).

## Decisions

- **Untrack, then delete.** `git rm --cached` in one commit so the diff is reviewable, `rm -rf site` in the working tree afterwards; `.gitignore` gets `/site/` so a stray regenerate never returns.
- **Session handoffs are not repo content.** `.claude/HANDOFF.md` already exists (ignored). If shared handoffs are wanted, `docs/handoffs/YYYY-MM-DD-*.md` with a one-line index — recorded in CONTRIBUTING; default is "not tracked".
- **Merge, don't nest, OpenSpec.** The `calendar-route` spec becomes `openspec/specs/next-calendar-route/spec.md` (capability names are flat); `route-loading-footer-hold` moves with its `.openspec.yaml` and its delta spec path adjusted; the archived change keeps its date prefix. `openspec validate --all` is the acceptance test.
- **Delete the empty change** unless the owner wants it: an artifact-less change is noise, and the references to it are historical.
- **`.env` ignore rules by intent:** `.env`, `.env.*`, `!.env.example`, `!*.env.example` — explicit allow for examples.
- **Starter leftovers by evidence:** each candidate file is deleted only after `grep -r` across `*.php`/`*.twig`/tests shows no reference; `tease.twig` and `single-password.twig` may be live (password-protected posts, generic teasers) — keep if referenced.
- **Fonts:** Bowlby One and Public Sans are OFL (Google Fonts); Special Season Brush must be confirmed against its foundry licence — if it does not permit redistribution, replace the file with a download note and keep the `@font-face` fallback. This is a release blocker, so it is a task with a decision point, not an assumption.

## Risks / Trade-offs

- [Something imported from `site/`] → `grep -r "site/"` across configs, workflows, Vercel, docs before untracking; `.vercelignore` already excludes it.
- [Moving the Next change breaks its task references] → relative paths inside the change are updated; a follow-up `openspec validate` confirms.
- [Deleting a starter template used by a rarely-hit branch (password-protected post)] → keep `single-password.twig` unless proven unused.

## Migration Plan

1. `site/` untrack + ignore; `Claude outputs/` removal; `.gitignore` repair (one PR).
2. OpenSpec merge + `deploy-pipeline` decision (one PR).
3. Theme identity, leftovers, asset provenance (one PR).
4. README layout/spec-count updates (or defer to the generated README in `docs-accuracy-and-spec-governance`).

## Open Questions

- Keep `deploy-pipeline` as a real change (deploy bundle composition, artifact guard wiring) or delete it? (Recommend delete; its intent is covered by `open-source-release-readiness` + `security-cicd-supply-chain-hardening`.)
- Is Special Season Brush licensed for redistribution in a public repo? (Blocking for the open-source release; needs the owner's purchase record.)
