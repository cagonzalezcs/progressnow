## 1. PR 1 — failure project isolation (design D1, D9)

- [x] 1.1 Test first: `next-js/test/unit/playwright-harness.spec.ts` — `package.json` `test:failure` contains `--project=failure`, `--workers=1`, `--no-deps`; the imported `playwright.config.ts` keeps `dependencies: ["e2e", "a11y"]` on the `failure` project
- [x] 1.2 `next-js/package.json`: `test:failure` gains `--no-deps`; comment in `playwright.config.ts` says why `dependencies` stays
- [x] 1.3 Local check: `PW_SKIP_BUILD=1 npm run test:failure` reports 4 tests on 1 worker; `npx playwright test --list` still lists e2e/a11y before failure
- [ ] 1.4 Open PR 1; confirm the CI step logs "Running 4 tests using 1 worker" and finishes under 60 s

## 2. Worker count (design D4)

- [x] 2.1 Test first: extend `playwright-harness.spec.ts` — with `CI=1` the config's `workers` is 4; `PW_WORKERS=2` gives 2; with `CI` unset it is undefined
- [x] 2.2 `next-js/playwright.config.ts`: `workers: PW_WORKERS ?? (CI ? 4 : undefined)`; header comment lists the override

## 3. Path-scope script (design D5)

- [x] 3.1 Test first: `.github/scripts/next-paths.test.mjs` (`node --test`) — theme `inc/` only → `false`; `tests/fixtures/*.json` → `true`; `src/lib/schemas.ts`, `src/css/tailwind.css`, `categories.json` → `true`; `.github/workflows/ci.yml` and `.github/scripts/**` → `true`; `next-js/**` → `true`; empty input → `true`
- [x] 3.2 `.github/scripts/next-paths.mjs`: reads changed paths on stdin, prints `true`/`false`; the pattern list is the single place the dependency set lives, with a comment pointing at the drift test and the mock's fixture path
- [x] 3.3 `next-js-check` runs `node --test ../.github/scripts/` so the script stays covered

## 4. Workflow restructure (design D2, D3, D6, D7, D8)

- [x] 4.1 `changes` job: `fetch-depth: 0`; base = PR base SHA or `github.event.before`; all-zero base → `next=true`; else `git diff --name-only <base>...HEAD | node .github/scripts/next-paths.mjs` → `outputs.next`
- [x] 4.2 `next-js-check`: setup-node (npm cache), `npm ci`, `lint`, `format:check`, `typecheck`, `test:unit`, 3.3
- [x] 4.3 `next-js-build`: `npm ci`, `npm run build:mock`, `tar -cf next-build.tar .next/standalone .next/static`, `upload-artifact` name `next-build`, `retention-days: 1`
- [x] 4.4 `next-js-playwright` matrix over `project: [e2e, a11y, failure]` (`name: next-js-${{ matrix.project }}`), `needs: [build]`: `npm ci`; restore `~/.cache/ms-playwright` keyed on `runner.os` + the `@playwright/test` version read from `package-lock.json`; `npx playwright install --with-deps --only-shell chromium`; `download-artifact` + `tar -xf`; `PW_SKIP_BUILD=1 npm run test:${{ matrix.project }}`
- [x] 4.5 Per-project uploads (`if: always()` for e2e/a11y, `if: failure()` for failure): a11y → `test-results/axe/**` + `playwright-report/**`; e2e → `test-results/styleguide/**` + `playwright-report/**`; failure → `playwright-report/**`; names `next-js-<project>-report`
- [x] 4.6 `next-js-container`: `docker/setup-buildx-action`, `docker/build-push-action` (`push: false`, `load: true`, `cache-from: type=gha`, `cache-to: type=gha,mode=max`, same `build-args`, tag `progressnow-next:ci`), then the existing mock + `docker run --network host` + `scripts/smoke.mjs` block unchanged
- [x] 4.7 `if: github.ref == 'refs/heads/main' || needs.changes.outputs.next == 'true'` on every next-js job; `timeout-minutes: 15`; delete the old `next-js` job; header comment updated
- [ ] 4.8 Sanity: `actionlint .github/workflows/ci.yml` locally (brew) — zero findings

## 5. Docs and spec sync

- [x] 5.1 `docs/security-gates.md`: replace "The rest of CI (lint, typecheck, unit, e2e, a11y) stays as before" with the job list; gates unchanged and still the only required checks
- [x] 5.2 `next-js/README.md`: pipeline shape, `PW_WORKERS`, `--no-deps` note, artifact reuse via `PW_SKIP_BUILD`
- [ ] 5.3 Sync the `next-test-harness` delta into `openspec/specs/next-test-harness/spec.md` (`/opsx:sync` or at archive)

## 6. Verification (PR 2)

- [ ] 6.1 `gh run view <run> --json jobs` on the PR run: per-job table in the PR description next to the proposal's baseline; critical path (`build` + longest Playwright job) ≤ 6 min
- [ ] 6.2 Scratch commits on the PR branch: theme `inc/` only → next-js jobs skipped, gates run; a fixture edit → full pipeline runs; revert both
- [ ] 6.3 Re-run with an unchanged lockfile: Docker `deps` stage `CACHED`, browser cache hit, all green
- [ ] 6.4 Over the first ten runs after merge, check Playwright reports for retries; if any recur, set workers to 3 and record the decision in the design's open questions
