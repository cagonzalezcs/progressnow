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
- **Path lint scope is explicit.** Files: `README.md`, `docs/*.md`, `*/README.md`, `openspec/changes/*/proposal.md`. Pattern: backticked tokens containing `/` or a known extension, excluding URLs, globs, and placeholders (`<…>`, `{…}`). Proposals may mark `(planned)`. Rationale: narrow enough to have zero false positives on day one; can widen later.
- **Ownership table is the rule; links are the mechanism.** Where two documents explain the same thing, the non-owner keeps one sentence and a link. Rationale: the AI sessions copy paragraphs between READMEs; a rule plus a lint on duplicated headings ("## Testing" appears in four files) keeps it from recurring.
- **Config context is short and prescriptive.** ~30 lines: stack, layout, invariants, rules. Rationale: it is prepended to every artifact prompt; length is cost.
- **Wrong security guidance is fixed in this change**, not deferred to a security change, because it is a documentation defect with a known correct answer already in the repo.

## Risks / Trade-offs

- [Generated tables diverge in formatting from the hand-written style] → the renderer emits the same table shape the README uses today.
- [Path lint false positives on prose like `foo/bar` examples] → allowlist file; `(planned)` marker; start with warnings for one PR, then fail.
- [`openspec --json` output shape changes] → pin the CLI version in `package.json` devDependencies (root, via `workspace-toolchain-baseline`).

## Migration Plan

1. Fix the wrong guidance and the `.claude/commands` claim; add the ownership table.
2. Markers + renderer + `--check`; regenerate; CI job.
3. Path lint + link check (warn) → fail after one green run.
4. `openspec/config.yaml` context and rules; validate by drafting one artifact with the CLI.
5. De-duplicate the four "Testing"/"Local development" sections toward links.

## Open Questions

- Keep the roadmap table in the README at all, or link to `openspec list` output only? (Recommend keep, generated: adopters read GitHub, not a CLI.)
- Should `docs/` get a generated index? (Recommend yes, same renderer, same markers.)
