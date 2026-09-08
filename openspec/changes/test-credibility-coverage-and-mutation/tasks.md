## 1. Coverage

- [ ] 1.1 vitest: `coverage.provider = "v8"`, `reporter = ["text-summary", "lcov", "json-summary"]`, `include` app source, exclude vendored `components/ui`/examples; theme, `nuxt-js`, `next-js`
- [ ] 1.2 PHPUnit: `<source>` filter over `inc/`, `src/`, `blocks/`; CI installs `pcov`; `--coverage-clover`; a `bin/coverage-threshold.php`
- [ ] 1.3 CI: upload coverage artifacts; write per-app summary to `$GITHUB_STEP_SUMMARY`; record baselines in `docs/testing.md`
- [ ] 1.4 Thresholds = baseline − 1; `scripts/coverage-ratchet.mjs` raises floors when measured coverage rises; floors committed in each config

## 2. Mutation testing

- [ ] 2.1 `next-js/stryker.config.mjs` scoped to `lib/{signing,rebuild-receiver,replay-cache,links,security-headers,env,request-path}.ts`; first run; per-file floors
- [ ] 2.2 Theme `infection.json5` scoped to sign/verify (`inc/rebuild.php`), passthrough resolver (`inc/shell.php`), kses helpers (`inc/blog.php`), and `inc/escaping.php` / `progressnow_safe_url()` when present; first run; floors
- [ ] 2.3 `.github/workflows/mutation.yml`: weekly schedule + `workflow_dispatch` + PR label `mutation`; artifacts; fails only below floor
- [ ] 2.4 Add surviving-mutant findings from the first runs as test tasks and close them

## 3. Fixture governance

- [ ] 3.1 CI step `fixtures-guard`: if `wp-content/themes/progressnow/tests/fixtures/*.json` changed vs base, require PR label `fixtures` and the checklist line in the PR body
- [ ] 3.2 PR template checklist item (pointer for `open-source-release-readiness`'s CONTRIBUTING); document regeneration as a deliberate act in `docs/testing.md`

## 4. Tautology audit

- [ ] 4.1 `scripts/test-audit.mjs`: list snapshot-only, self-equality, assertion-less, and trivially-true tests across the four suites with `file:line`
- [ ] 4.2 Review the list; convert or delete each finding; record counts before/after in `docs/testing.md`

## 5. Documentation

- [ ] 5.1 Write `docs/testing.md` (taxonomy table, baselines, ratchet, mutation floors, fixture rule, how to add each kind of test)
- [ ] 5.2 README "Testing" links to it; theme/app READMEs keep only commands
