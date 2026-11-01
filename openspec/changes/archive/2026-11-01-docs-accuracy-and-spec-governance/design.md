## Context

`openspec list --json` and `openspec list --specs` exist (CLI 1.2.0) and are the source of truth for change status and capabilities. The README has hand-maintained tables that were correct on the day they were written. Paths in docs are formatted consistently in backticks, which makes them lintable. The OpenSpec config is a template with comments.

## Goals / Non-Goals

**Goals:**
- Status tables and capability lists cannot go stale without CI noticing.
- Every path a document names exists (or is explicitly planned).
- One canonical place per topic; other places link.
- The AI that drafts artifacts is told the project's invariants.

**Non-Goals:**
- Prose quality review or a style guide beyond the existing user preference for concision.
- Generating the whole README.
- Replacing OpenSpec with another workflow.

## Decisions

- **Markers, not templates.** `<!-- openspec:roadmap:start -->` … `:end` and `<!-- openspec:capabilities:start -->` … `:end` in the README; the script replaces only the region. Rationale: the rest of the README stays hand-written and reviewable.
- **The renderer reads the OpenSpec trees, not the CLI.** Change directories, `- [ ]`/`- [x]` task lines and `### Requirement:` headings are read directly, with the CLI's own rules (`utils/task-progress.js`: top-level checkbox lines, case-insensitive `x`; every directory but `archive/`). Rejected: shelling out to `openspec list --json` / `--specs --json` — in CLI 1.2.0 `list --specs --json` prints a table, and there is no root `package.json` to pin the CLI in until `workspace-toolchain-baseline` lands, so CI would have installed an unpinned tool. The rule is four lines and `openspec list` still agrees with the README (the CLI is the reference the tests are written against).
- **Curated one-liners live in `.openspec.yaml` `description`.** The renderer prefers it to a proposal's first "What Changes" bullet. Rationale: first bullets are paragraphs; the README's Scope column was hand-curated and worth keeping. The CLI's metadata schema ignores unknown keys.
- **Existence means tracked.** `check-paths.mjs` resolves against `git ls-files`, not the disk: case-exact on macOS and Linux alike, and independent of what is built locally (`dist/`, `.env`); runtime and removed paths are allowlisted with a reason. Rejected: `fs.existsSync` — passes `Readme.md` on a Mac and fails it in CI, and passes `nuxt-js/dist` only on a machine that has built.
- **Path lint scope is explicit.** Files: `README.md`, `docs/*.md`, `*/README.md`, `openspec/changes/*/proposal.md`. Pattern: backticked tokens containing `/` or a known extension, excluding URLs, globs, and placeholders (`<…>`, `{…}`). Proposals may mark `(planned)`. Rationale: narrow enough to have zero false positives on day one; can widen later.
- **Ownership table is the rule; links are the mechanism.** Where two documents explain the same thing, the non-owner keeps one sentence and a link. Rationale: the AI sessions copy paragraphs between READMEs; a rule plus a lint on duplicated headings ("## Testing" appears in four files) keeps it from recurring.
- **Config context is short and prescriptive.** ~30 lines: stack, layout, invariants, rules. Rationale: it is prepended to every artifact prompt; length is cost.
- **Wrong security guidance is fixed in this change**, not deferred to a security change, because it is a documentation defect with a known correct answer already in the repo.

## Risks / Trade-offs

- [Generated tables diverge in formatting from the hand-written style] → the renderer emits the same table shape the README uses today.
- [Path lint false positives on prose like `foo/bar` examples] → allowlist file (exact tokens and `prefix/*`, grouped by reason); `(planned)` marker in proposals; generated README regions skipped (their sources are checked). The first full-tree run was fixed to zero locally, so the job shipped in fail mode; `--warn` stays on every script for a rollback.
- [`openspec --json` output shape changes] → moot: the renderer does not call the CLI; `render-readme-sections.test.mjs` asserts the counting rule the CLI documents.


## Migration Plan

1. Fix the wrong guidance and the `.claude/commands` claim; add the ownership table.
2. Markers + renderer + `--check`; regenerate; CI job.
3. Path lint + link check (warn) → fail after one green run.
4. `openspec/config.yaml` context and rules; validate by drafting one artifact with the CLI.
5. De-duplicate the four "Testing"/"Local development" sections toward links.

## Open Questions

- Keep the roadmap table in the README at all, or link to `openspec list` output only? (Recommend keep, generated: adopters read GitHub, not a CLI.)
- Should `docs/` get a generated index? (Recommend yes, same renderer, same markers.)
