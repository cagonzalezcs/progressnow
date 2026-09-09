## Context

`ci.yml` runs five jobs; four finish in under 70 s and `next-js` takes 13.5–14.2 min, serially: `npm ci` → lint → format → typecheck → unit → `build:mock` → Playwright install → `test:e2e` → `test:a11y` → `test:failure` → Docker image + smoke → upload. Everything after the build reuses it through `PW_SKIP_BUILD=1`; each Playwright step starts its own mock (`test/mock/server.mjs`, port 8787) and standalone server (`scripts/start-standalone.mjs`, port 3100) because `reuseExistingServer` is off under `CI`.

Measured on three green runs (2026-09-09): failure step 358–374 s, e2e 138–147 s, a11y 118–123 s, container 69–92 s, the rest ~125 s. The failure step's size is a defect: Playwright runs a project's `dependencies` even under `--project=<name>`, so `--project=failure --workers=1` runs all 76 tests on one worker ("Running 76 tests using 1 worker" in the log). The e2e/a11y steps use 2 workers on a 4-vCPU runner (Playwright's default is 50 % of cores). Chromium and the image's `deps` layer are downloaded fresh every run.

Constraints: no WordPress in CI (`next-test-harness § CI job`); every Playwright project must test the same build (§ Accessibility gate "reuse the same built server"); the three security gates are the only required checks (ruleset "Protect main"); `security-cicd-supply-chain-hardening` will pin every `uses:` to a SHA and route `npm ci --ignore-scripts`, so this change adds actions but does not pin them; the repository is public, so runner minutes are free and only wall-clock matters.

## Goals / Non-Goals

**Goals:**
- Wall-clock for the next-js pipeline from ~14 min to ~5 min without changing what is asserted or the pass bars.
- Every Playwright job runs against one build artifact, by construction rather than by determinism.
- The `failure` project runs its 4 tests and nothing else in CI.
- Skipped work is visible as "skipped", never as a silently green job.

**Non-Goals:**
- Sharding within a project, larger runners, or Playwright's test-server reuse across jobs.
- Action SHA pinning, `permissions:` scoping, `--ignore-scripts` (supply-chain change).
- Reworking specs that mutate shared mock state (receiver, chrome delay) — noted as a risk, not moved.
- Changing the theme or nuxt-js jobs.

## Decisions

**D1. `--no-deps` on the `test:failure` script, keep `dependencies` in the config.**
`test:failure` becomes `playwright test --project=failure --workers=1 --no-deps`. The `dependencies: ["e2e", "a11y"]` declaration stays because it is what orders a bare `npx playwright test` locally (e2e + a11y in parallel, then failure). Alternative — delete `dependencies` and rely on script order — loses that local guarantee for no gain. Verified `--no-deps` exists in the installed `@playwright/test` 1.63.

**D2. Fan-out pipeline with one build artifact, not per-job builds and not one job with sharding.**
Jobs: `next-js-check` (npm ci, lint, format:check, typecheck, test:unit) ∥ `next-js-build` (npm ci, `build:mock`, upload) → `next-js-e2e`, `next-js-a11y`, `next-js-failure` (npm ci, Playwright install, download, `PW_SKIP_BUILD=1 npm run test:<project>`) ∥ `next-js-container` (Docker build + smoke; needs only the checkout). Critical path = build (~1.5 min with setup) + e2e (~3 min with setup, download, run). Alternatives: (a) every Playwright job runs `build:mock` itself — +30 s each, no artifact plumbing, but "same built server" holds only because the build is deterministic; (b) keep one job and `--shard` e2e — still serial across projects, still one runner's 4 cores. (a) is the fallback if artifact handling proves brittle.

**D3. The artifact is a tarball of `.next/standalone` + `.next/static`.**
`tar -cf next-build.tar .next/standalone .next/static` in the build job (55 MB; `.next/cache` at 278 MB is excluded), `upload-artifact` with 1-day retention, `download-artifact` + `tar -xf` in each Playwright job. Tar rather than the two directories directly: `upload-artifact@v4` does not preserve symlinks or modes, and the traced standalone `node_modules` may contain either. `scripts/start-standalone.mjs` copies `public/` and `.next/static` next to `server.js` at start, and `test/e2e/budget.spec.ts` reads `.next/static` — both paths are in the tar, `public/` is in the checkout.

**D4. Playwright `workers: 4` under `CI` in the config; `failure` keeps `--workers=1` on the CLI.**
The runner has 4 vCPUs; the app server and mock are one Node process each and mostly idle while axe runs in the browser. Expected: a11y's eight 23–34 s tests go from 4 rounds on 2 workers to 2 rounds on 4 (~120 s → ~65 s); e2e proportionally. The CLI `--workers=1` overrides the config for `failure`. `PW_WORKERS` env override for triage. Alternative `workers: "100%"` — same number today, hides the assumption; pick the literal.

**D5. Path scoping by a `changes` job running `git diff`, not a third-party filter action.**
A first job (`fetch-depth: 0` only there) diffs the PR base or `github.event.before` against `HEAD`, and emits `next=true` when any path matches: `next-js/**`, `.github/workflows/ci.yml`, `.github/scripts/**`, and what next-js reads outside its directory — `wp-content/themes/progressnow/tests/fixtures/**` (mock + contract tests), `src/lib/schemas.ts`, `src/css/tailwind.css`, `categories.json` (drift test). Unknown base (`0000…` on a new branch's first push) → `true`. Every next-js job carries `if: github.ref == 'refs/heads/main' || needs.changes.outputs.next == 'true'`, so `main` is always fully tested and the filter only skips work on branches and PRs. The security gates get no condition. Alternative `dorny/paths-filter`: one more dependency to pin for a 20-line script.

**D6. Chromium: `--only-shell`, download cached, OS deps still installed.**
`npx playwright install --with-deps --only-shell chromium` after restoring `~/.cache/ms-playwright` keyed on the `@playwright/test` version from `package-lock.json`. `--only-shell` skips the full Chrome build (headless tests use the headless shell since Playwright 1.49). `--with-deps` (apt) stays unconditional: it is ~10 s and skipping it on a cache hit would tie correctness to the runner image. Honest gain: ~10 s per Playwright job.

**D7. No Docker layer cache — plain `docker build`, in its own parallel job.**
Tried first as `docker/setup-buildx-action` + `docker/build-push-action` with `cache-from/to: type=gha,mode=max` (PR #25, run 34403647517): the image built in 65 s (deps `npm ci` 19 s in alpine, `next build` 29 s) and then the GHA cache export took 100.5 s — the job went from ~75 s to 190 s. The most a deps-stage hit can save is those 19 s, on a job that is not on the critical path. Reverted to the previous `docker build` block; the only change to the container smoke is that it runs beside the other jobs instead of after them. Two fewer `uses:` for the supply-chain change to pin.

**D8. Report artifacts move with their producers.**
`next-js-a11y` uploads `test-results/axe/**` + `playwright-report/**`; `next-js-e2e` uploads `test-results/styleguide/**` + `playwright-report/**`; `next-js-failure` uploads `playwright-report/**` on failure only. Artifact names are per job (`upload-artifact@v4` rejects duplicates). `next-js-build` uploads `next-build.tar` (1 day). Job `timeout-minutes` drops from 30 to 15.

**D9. Land in two PRs.**
PR 1: D1 only (one line, cuts ~6 min immediately, no structural risk). PR 2: D2–D8 + docs + spec sync. The second PR's own run is the before/after measurement.

## Risks / Trade-offs

- [4 workers widens the window for shared-mock races: `receiver.spec.ts` posts `/__mock/reset` in `afterAll`, `chrome.spec.ts` sets a scoped delay then resets] → `retries: 1` already absorbs one-off races, but a retried test is still a signal: watch the first ten runs' Playwright reports for retries; if they appear, drop to 3 workers, and consider moving the receiver round-trip into the serial `failure` project (a spec-level move, its own change).
- [Artifact plumbing fails silently — e.g. standalone tar missing `server.js`] → `start-standalone.mjs` already exits 2 with a named error when `server.js` is absent; the Playwright `webServer` then fails the job within its timeout. Fallback is D2(a).
- [Path scoping misses a dependency and a branch merges with untested next-js breakage] → `main` pushes are never scoped, so breakage surfaces on the next `main` run; the list is derived from grep of what next-js reads outside its directory, and `ci.yml` itself is in it. The cost of a miss is one red `main` run, not a silent gap.
- [Five `npm ci` per run instead of one] → parallel, ~20 s each with the npm cache, free on a public repository; adds nothing to the critical path.
- [GHA cache eviction (10 GB per repo, LRU) drops the browser download] → `playwright install` downloads it again; correctness is unaffected, only time.
- [Build ID differs between the artifact and the container image] → `build:mock` derives it from `git rev-parse` and the container from `GITHUB_SHA::7`; both are the same commit. No test compares them.
- [Skipped next-js jobs read as green on a PR that touched only PHP] → they render as "skipped", not "passed"; only the three gates are required, so the ruleset semantics are unchanged.

## Migration Plan

1. PR 1: `--no-deps` in `package.json`; confirm the failure step reports 4 tests.
2. PR 2: new `ci.yml` job set, `playwright.config.ts` workers, tar/artifact steps, cache steps, `changes` job, docs, `next-test-harness` delta synced. Compare that PR's run to the baseline table in the proposal.
3. Rollback: revert the workflow file. No runtime code, build output, or test assertion changes.

## Open Questions

- 4 workers or 3 on the first landing?
- Path-scope branch pushes too, or PRs only (with branch pushes unconditional)?
- `next-js-e2e` is bounded by one test: `styleguide screenshots per section` takes 1.8 min at 2 and at 4 workers (60+ sections, scroll + screenshot each); every other e2e test was done 90 s earlier in run 34403647517. Move it to its own Playwright project / matrix entry (`next-js-screenshots`) so e2e finishes in ~60 s? That is a spec-level move (§ CI job names which job uploads the screenshots) — its own change.
- Shard `next-js-e2e` 2-ways later if it becomes the long pole after that?
