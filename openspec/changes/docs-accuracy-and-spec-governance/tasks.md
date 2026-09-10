## 1. Correct known errors

- [x] 1.1 `docs/deployment.md` §9: replace `NODE_TLS_REJECT_UNAUTHORIZED=0` with the `NODE_EXTRA_CA_CERTS` guidance used by `next-js`; §10.8 cross-link
- [x] 1.2 `nuxt-js/nuxt.config.ts`: comment `secure: false` as dev-proxy only; `nuxt-js/README.md` mirrors §9
- [x] 1.3 README "OpenSpec workflow": remove the `.claude/commands/opsx/` claim; describe the `openspec` CLI and skills; note the single spec root
- [x] 1.4 README: add the canonical-ownership table (root README / app READMEs / `docs/` / `openspec/`); session handoffs are untracked

## 2. Generated sections

- [x] 2.1 `scripts/docs/render-readme-sections.mjs`: Roadmap (open changes: name, tasks done/total, one-line scope from the proposal's first "What Changes" bullet or `.openspec.yaml` `description` if present) and Capabilities (from `openspec list --specs --json`) between markers; `--check` exits non-zero on drift
- [x] 2.2 Insert markers in `README.md`; run the renderer; commit
- [x] 2.3 CI `docs` job runs `--check`

## 3. Path and link lint

- [x] 3.1 `scripts/docs/check-paths.mjs` over `README.md`, `docs/*.md`, `*/README.md`, `openspec/changes/*/proposal.md`; `(planned)` marker; allowlist file; report `file:line path`
- [x] 3.2 Markdown link check (relative links + anchors) in the same job
- [x] 3.3 Run in warn mode for one merge, then fail; fix every finding (expect several in the theme README and archived proposals — archive is out of scope) — every finding fixed locally (stale archive links in the deployment guide and three READMEs, a not-yet-existing `docs/` path, 55 `(planned)` markers across eight proposals, 60 allowlist entries); the full-tree run is clean, so the job ships failing (`--warn` remains on both scripts for a rollback)

## 4. OpenSpec configuration

- [ ] 4.1 Fill `openspec/config.yaml` `context`: stack, layout, three frontends, shared-source rule, security invariants (hostile-input test per sink, `|raw` marker, no shared-source copies, no secrets in output, env-first settings)
- [ ] 4.2 Fill `rules` for `proposal` (overlap statement, non-modification statement, "Impact" names tests), `design` (rejected alternative per decision), `tasks` (each requirement maps to a task naming its test), `specs` (WHEN/THEN scenarios only)
- [ ] 4.3 Draft one small artifact with the CLI to confirm the context and rules are applied

## 5. De-duplication

- [ ] 5.1 Reduce duplicated "Testing", "Local development", "Configuration" sections in the theme and app READMEs to what is unique plus a link to the owner
- [ ] 5.2 Add a duplicated-heading check to the docs job (same H2 text with >80 % identical body across files fails)
