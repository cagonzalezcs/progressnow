## 1. Role audit

- [ ] 1.1 Inventory current users and their roles/capabilities *(tooling: `wp chapter audit-roles`; run on the host)*
- [x] 1.2 Document the target least-privilege role model (Administrator reserved for maintainers) — `docs/authoring-trust-model.md`
- [ ] 1.3 Reassign over-privileged accounts to the lowest sufficient role *(runbook §3; needs host access)*

## 2. Force kses for all roles

- [x] 2.1 Add hook stripping `unfiltered_html` from every role (`user_has_cap`/`map_meta_cap` or role edit on init)
- [x] 2.2 Verify rich content (links/images/headings/lists) still saves correctly
- [x] 2.3 Confirm `<script>`/`<iframe>` from an Administrator is stripped

## 3. Field allow-lists

- [x] 3.1 Review `progressnow_blog_kses_prose` and other `v-html`-feeding kses lists; keep minimal
- [x] 3.2 Define a narrow explicit allow-list only if a genuine raw-embed need exists *(none identified; documented)*

## 4. Guardrails & cleanup

- [x] 4.1 Add regression test asserting no role has `unfiltered_html`
- [ ] 4.2 One-time scan for previously-stored `<script>` in rendered content; clean hits (shares content audit with url-sink change) *(tooling: `wp chapter audit-markup`; run + clean on the host)*
- [x] 4.3 Document that plugins/role editors must not re-grant `unfiltered_html`
