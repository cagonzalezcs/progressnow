## 1. Role audit

- [ ] 1.1 Inventory current users and their roles/capabilities
- [ ] 1.2 Document the target least-privilege role model (Administrator reserved for maintainers)
- [ ] 1.3 Reassign over-privileged accounts to the lowest sufficient role

## 2. Force kses for all roles

- [ ] 2.1 Add hook stripping `unfiltered_html` from every role (`user_has_cap`/`map_meta_cap` or role edit on init)
- [ ] 2.2 Verify rich content (links/images/headings/lists) still saves correctly
- [ ] 2.3 Confirm `<script>`/`<iframe>` from an Administrator is stripped

## 3. Field allow-lists

- [ ] 3.1 Review `progressnow_blog_kses_prose` and other `v-html`-feeding kses lists; keep minimal
- [ ] 3.2 Define a narrow explicit allow-list only if a genuine raw-embed need exists

## 4. Guardrails & cleanup

- [ ] 4.1 Add regression test asserting no role has `unfiltered_html`
- [ ] 4.2 One-time scan for previously-stored `<script>` in rendered content; clean hits (shares content audit with url-sink change)
- [ ] 4.3 Document that plugins/role editors must not re-grant `unfiltered_html`
