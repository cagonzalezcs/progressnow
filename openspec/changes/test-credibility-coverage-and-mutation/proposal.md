## Why

The repository has more than 500 AI-written test cases (theme PHPUnit 174, theme vitest 11+, `nuxt-js` 41, `next-js` 279 plus Playwright) and no measurement of what they cover. The README says it plainly: "a green CI run means the AI agreed with itself." Three specific credibility gaps:

1. **No coverage anywhere.** No vitest `--coverage`, no PHPUnit coverage driver, no thresholds; a module can be entirely untested and CI is green.
2. **Fixtures are regenerated from the code they test.** `PROGRESSNOW_WRITE_FIXTURES=1` rewrites `tests/fixtures/*.json` from the serializers; the vitest side then parses those same files. A wrong serializer change plus a regen passes both sides. Nothing marks a fixture change as deliberate.
3. **Security-critical code has no mutation-level evidence.** HMAC sign/verify in PHP and TS, the replay cache, `resolveHref`, the kses helpers, the passthrough resolver, the CSP builder, `env.ts` — a test that never fails when the guard is removed proves nothing.

`next-test-harness` and the proposed `theme-test-harness` define *what* is tested; this change makes the existing and future suites *trustworthy*: measured, deliberately changed, and checked against mutants.

## What Changes

- **Coverage in CI:** vitest `coverage.provider: v8` with per-app thresholds (statements/branches) that start at today's measured value and ratchet up; PHPUnit with `pcov` producing Clover, a threshold script; reports uploaded as artifacts and summarized on the PR.
- **Mutation testing on critical modules**, scheduled weekly (not per PR): Stryker for `next-js/lib/{signing,rebuild-receiver,replay-cache,links,security-headers,env,request-path}.ts`; Infection for `inc/rebuild.php` (sign/verify), `inc/shell.php` (resolver), `inc/blog.php` kses helpers, `inc/escaping.php` and `progressnow_safe_url()` when they land; minimum mutation score per file; results as artifacts and a PR-blocking check only when the score drops below the floor.
- **Fixture governance:** a CI check fails when `tests/fixtures/*.json` changed without the `fixtures` PR label and a completed reviewer checklist item ("diff reviewed field by field; change intended by spec `<name>`"); fixture regeneration documented as a deliberate act.
- **Tautology audit:** a one-time pass listing tests that assert code against itself (snapshot-only, fixture-only, or `expect(fn()).toEqual(fn())` patterns) and converting each to a behavior assertion or an explicit contract fixture; findings recorded in `docs/testing.md`. (planned)
- **Test taxonomy doc** (`docs/testing.md`): unit / contract / integration / e2e / a11y / mutation, what each proves, where it runs, how to add one. (planned)

## Capabilities

### New Capabilities
- `test-credibility`: coverage measurement and thresholds, mutation testing on security-critical modules, deliberate fixture changes, and a documented test taxonomy.

### Modified Capabilities
- `contract-governance`: fixture changes are gated (added requirement; existing requirements unchanged).

## Impact

- **JS apps:** vitest configs (coverage), `stryker.config.mjs` in `next-js`, `package.json` scripts; CI steps. (planned)
- **Theme:** `phpunit.xml` coverage filter, `infection.json5`, `composer.json` require-dev (`infection/infection`), CI PHP job with `pcov`.
- **CI:** coverage artifacts + PR summary; `mutation.yml` weekly workflow; `fixtures-guard` step. (planned)
- **Docs:** `docs/testing.md`; README "Testing" points at it; CONTRIBUTING (when it exists) references the fixture rule. (planned)
- **Behavior:** none at runtime.
- **Coordinates with:** `theme-integration-and-a11y-gate` (new suites get thresholds), `security-*` changes that add helpers (mutation targets named here), `workspace-toolchain-baseline` (shared vitest config carries the coverage provider). Does not modify those changes.
