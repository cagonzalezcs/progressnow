## Why

The repository carries leftovers from its AI-driven rename and re-platforming that make it harder to navigate and cheaper to get wrong:

- `site/` still tracks **924 files / 13 MB** of Nuxt build output (`site/.output/server/node_modules/**`, `site/.output/public/_nuxt/**`, `site/.nuxt/dev/**`) although the app moved to `nuxt-js/` (commit `dc6a868c Rename site/ to nuxt-js/`). It is the largest thing in the tree, it is stale, and it contains vendored `node_modules` the hygiene gate will reject.
- `Claude outputs/` at the root tracks an AI session handoff (`progressnow-HANDOFF.md`) and an `apply.sh`; its own text says it belongs in the gitignored `.claude/`.
- `next-js/openspec/` is a **second OpenSpec root** — its own `specs/calendar-route`, an open change (`route-loading-footer-hold`, 23/24 tasks) and an archived one — invisible to `openspec list` at the repository root and to the README's roadmap.
- `openspec/changes/deploy-pipeline/` is an empty stub (only `.openspec.yaml`) still referenced by two other proposals.
- `.gitignore` ends with `.env*` (hides any new `.env.example`), lists `/nuxt-js/dist` twice, and never mentions `/site/`.
- The theme `composer.json` still identifies as `upstatement/timber-starter-theme` by `jarednova`; Timber-starter leftovers remain (`views/comment-form.twig`, `comment.twig`, `page-plugin.twig`, `single-password.twig`, `tease.twig`, `tests/test-timber-starter-theme.php`); WordPress core's `wp-config-sample.php` sits at the root.
- Two of the three self-hosted fonts (Bowlby One, Special Season Brush) ship without a licence file in an MIT repository; the brand README documents overrides but not provenance.

`open-source-release-readiness` adds a hygiene gate that will *keep* the tree clean; it does not do this one-time cleanup, and it predates the `site/` → `nuxt-js/` rename (its tasks still say `site/`). This change is the cleanup that makes that gate pass on day one.

## What Changes

- **Untrack and ignore `site/`** (`git rm -r --cached site`, `/site/` in `.gitignore`); delete the directory on disk after confirming nothing references it.
- **Remove `Claude outputs/`** from the tree; keep session handoffs under `.claude/` (ignored) or in `docs/handoffs/` if they are meant to be shared — decision recorded in CONTRIBUTING. (planned)
- **One OpenSpec root:** move `next-js/openspec/specs/calendar-route` → `openspec/specs/next-calendar-route` (or merge into `next-headless-site`), `next-js/openspec/changes/route-loading-footer-hold` → `openspec/changes/`, and its archive entry → `openspec/changes/archive/`; delete `next-js/openspec/`; `openspec validate --all` passes. (planned)
- **Resolve the `deploy-pipeline` stub:** delete it and reword the two references (`security-remove-duplicator-and-purge-artifacts`, `security-dependency-lifecycle`) — or give it artifacts if the owner still wants it.
- **`.gitignore` repair:** replace `.env*` with `.env` + `.env.*` and `!.env.example`; dedupe; add `/site/`.
- **Theme identity and leftovers:** `composer.json` name `progressnow/theme`, authors = maintainer with Timber attribution kept in `description`; remove unreferenced starter templates and the starter test after a grep; move root `wp-config-sample.php` to `docs/` or delete once `security-runtime-hardening` ships its hardened template.
- **Asset provenance:** add `OFL.txt`/licence files beside each font, record the source of every brand placeholder photo/SVG in `static/images/brand/README.md`; fail the release checklist if a font lacks a licence.

## Capabilities

### New Capabilities
- `repository-layout`: what the tracked tree contains, that there is exactly one OpenSpec root, and that shipped third-party assets carry provenance.

### Modified Capabilities
- none (`repository-hygiene` from `open-source-release-readiness` stays the enforcing gate; this change satisfies it).

## Impact

- **Repo:** −924 tracked files (≈13 MB); `.gitignore`; `openspec/` gains one spec and two changes; `next-js/openspec/` removed; `Claude outputs/` removed.
- **Theme:** `composer.json`, `views/` (≤5 files), `tests/` (1 file), `static/fonts/*/` (+2 licence files), `static/images/brand/README.md`.
- **Docs:** `README.md` "Repository layout" and "OpenSpec workflow" (spec count, no `.claude/commands` claim), `CONTRIBUTING.md` (handoff policy) when it exists. (planned)
- **CI:** none; Vercel `.vercelignore` unchanged (never included `site/`).
- **Coordinates with:** `open-source-release-readiness` (its `site/` paths should read `nuxt-js/`; hygiene gate), `security-runtime-hardening` (config template), `docs-accuracy-and-spec-governance` (README generation). Does not modify those changes.
