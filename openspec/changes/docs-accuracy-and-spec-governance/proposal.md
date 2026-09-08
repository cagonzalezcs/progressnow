## Why

The documentation is the interface through which every future AI session and every adopter understands this project, and it is already wrong in verifiable ways:

- The root README's Roadmap lists `nuxt4-static-platform` (51/59) and `next-js-site-implementation` (54/57) as open; both were archived on 2026-09-07. Its "Capabilities on file" names 23 specs; `openspec/specs/` holds 36. It says slash commands live in `.claude/commands/opsx/` — a gitignored path no adopter receives.
- `docs/deployment.md` §9 tells Nuxt developers to set `NODE_TLS_REJECT_UNAUTHORIZED=0`; `next-js/.env.example` and `lib/env.ts` say never do that (correctly). `nuxt.config.ts` proxies with `secure: false` without saying it is dev-only.
- The same material lives in the root README, the theme README, `next-js/README.md`, `nuxt-js/README.md`, `docs/deployment.md`, `.claude/HANDOFF.md`, and the tracked `Claude outputs/progressnow-HANDOFF.md`, with no statement of which is canonical.
- `openspec/config.yaml` — the one file the OpenSpec tooling feeds to the AI when it drafts artifacts — has no project context and no per-artifact rules, although every artifact here is AI-generated from it.
- `next-js/openspec/` is a second spec root (cleanup owned by `repo-structure-consolidation`).

The README's own warning — "the docs are aspirational … where the docs and the code disagree, trust neither" — should become a CI failure instead of a caveat.

## What Changes

- **Generated sections.** `scripts/docs/render-readme-sections.mjs` writes the Roadmap and Capabilities tables into `README.md` between markers from `openspec list --json` / `openspec list --specs --json`; `--check` mode fails CI when the committed README is stale.
- **Docs path lint.** `scripts/docs/check-paths.mjs` extracts backticked repository paths (`inc/rest.php`, `docs/…`, `scripts/…`) from `README.md`, `docs/**`, app READMEs, and open change proposals, and fails when a path does not exist — planned paths in *proposals* are allowed with a `(planned)` marker; a markdown link checker runs alongside.
- **Canonical ownership.** A short table in the root README: root README = map + quick start; app READMEs = commands, env, layout; `docs/` = operator guides; `openspec/` = intent and history. Duplicated paragraphs are replaced by links. Session handoffs are untracked (`.claude/`) by policy.
- **Fix the wrong guidance now.** `docs/deployment.md` §9 → `NODE_EXTRA_CA_CERTS` (mirroring `next-js`); `nuxt.config.ts` comment marks `secure: false` dev-only; the `.claude/commands` claim replaced by the `openspec` CLI/skills.
- **`openspec/config.yaml` filled in:** project context (stack, three frontends, the shared-source rule, the security invariants: "every new sink gets a hostile-input test", "no `|raw` without a kses marker", "no copy of shared source", "no secret in any output"), and artifact rules ("a proposal lists the existing changes it overlaps and states it does not modify them", "tasks name the test that proves each requirement", "designs name the alternative rejected").

## Capabilities

### New Capabilities
- `documentation-accuracy`: generated status sections, path and link linting, canonical ownership, and an OpenSpec configuration that encodes the project's rules.

### Modified Capabilities
- none.

## Impact

- **Root:** `README.md` (markers, ownership table, corrected claims), `scripts/docs/*.mjs`, `openspec/config.yaml`.
- **Docs:** `docs/deployment.md` §9, §10.8; `nuxt-js/README.md`, `nuxt-js/nuxt.config.ts` comment; theme README de-duplicated toward links.
- **CI:** `docs` job (render check + path lint + link check), a few seconds.
- **Behavior:** none at runtime.
- **Coordinates with:** `repo-structure-consolidation` (single spec root, handoff policy), `open-source-release-readiness` (CONTRIBUTING owns contributor process; this change owns accuracy tooling), `workspace-toolchain-baseline` (root scripts). Does not modify those changes.
