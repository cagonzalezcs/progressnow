## 1. Stale trees

- [ ] 1.1 `grep -rn "site/"` across workflows, Vercel config, docs, package scripts; confirm no live reference
- [ ] 1.2 `git rm -r --cached site` in one commit; add `/site/` to `.gitignore`; delete the directory
- [ ] 1.3 Remove `Claude outputs/` from the tree; record the handoff policy (untracked `.claude/` by default) in `CONTRIBUTING.md` when it exists, else in the root README "Contributing"
- [ ] 1.4 `.gitignore`: replace `.env*` with `.env`, `.env.*`, `!.env.example`; remove the duplicate `/nuxt-js/dist`

## 2. One OpenSpec root

- [ ] 2.1 Move `next-js/openspec/specs/calendar-route` → `openspec/specs/next-calendar-route` (adjust the delta path in the moved change)
- [ ] 2.2 Move `next-js/openspec/changes/route-loading-footer-hold` → `openspec/changes/`; move the archived change to `openspec/changes/archive/`
- [ ] 2.3 Delete `next-js/openspec/`; `openspec validate --all` passes; `openspec list` shows the moved change
- [ ] 2.4 Decide `deploy-pipeline`: delete the stub and reword the two references, or give it proposal/design/tasks

## 3. Theme identity and leftovers

- [ ] 3.1 `composer.json`: `name` `progressnow/theme`, `authors` = maintainer, Timber starter credited in `description`; `composer validate`
- [ ] 3.2 For each of `views/comment-form.twig`, `comment.twig`, `page-plugin.twig`, `single-password.twig`, `tease.twig`, `tests/test-timber-starter-theme.php`: grep for references; delete if unreferenced; note kept files and why
- [ ] 3.3 Move root `wp-config-sample.php` out of the docroot listing (delete, or `docs/wp-config-sample.php` until the hardened template lands)

## 4. Asset provenance

- [ ] 4.1 Add licence files beside Bowlby One and Special Season Brush; confirm Special Season Brush's licence permits redistribution — if not, replace with a download note and fallback face
- [ ] 4.2 Record the source/licence of every file in `static/images/brand/` in its README
- [ ] 4.3 Add a "fonts and images carry licence files" line to the release checklist (`docs/open-source-release.md`, owned by `open-source-release-readiness`; pointer only)

## 5. Docs

- [ ] 5.1 README "Repository layout": remove `site/`, mention the single OpenSpec root; "OpenSpec workflow": drop the `.claude/commands/opsx/` claim (ignored path) and describe the `openspec` CLI / skills instead
