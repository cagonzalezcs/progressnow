## Why

Editor prose is rendered `|raw` (Twig) / `v-html` (Vue) after `wp_kses_post`, which is the correct pattern — but `wp_kses_post` is only applied to users **without** the `unfiltered_html` capability. Administrators and Editors keep `unfiltered_html`, so a compromised or malicious high-privilege account can store `<script>` that renders on the public site. This is standard WordPress behavior and lower-risk than the block/meta URL sinks (which any Contributor can hit), but for a hardened multi-author site it is worth closing: force kses for everyone and define a least-privilege role model so no account carries more capability than its job needs. CSP (separate change) is the runtime backstop; this change reduces the stored-XSS blast radius at the source.

## What Changes

- Force `wp_kses`-level sanitization for **all** roles by disabling `unfiltered_html` (remove the cap and/or hook `pre_kses`/`map_meta_cap`), so no role can store executable markup.
- Review and right-size roles/capabilities: confirm who has Administrator/Editor, remove unnecessary grants, and document the intended role model.
- Ensure the fields feeding `v-html` (e.g. `BlockProse`, `BlockA11yNote`) rely on a strict, reviewed kses allow-list rather than the broad default where practical.
- Document the authoring trust model so future role/plugin changes don't silently re-grant `unfiltered_html`.

## Capabilities

### New Capabilities
- `authoring-least-privilege`: All stored authoring content is kses-sanitized regardless of role, with a documented least-privilege role model.

### Modified Capabilities
<!-- None. -->

## Impact

- **Code:** small mu-plugin/theme hook to strip `unfiltered_html`; optional tighter kses allow-list for `v-html` fields in `inc/blog.php`/`inc/pages.php`.
- **Roles:** capability audit; documented role model.
- **UX:** Editors/Admins can no longer paste `<script>`/iframes unless explicitly allow-listed — intended.
- **Backstopped by** the CSP change; complements the URL-sink XSS fix.
