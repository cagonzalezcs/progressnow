## Context

The theme applies `wp_kses_post`/`wp_kses` to all markup-bearing fields before `|raw`/`v-html` — verified across `inc/blog.php`, `inc/pages.php`, `inc/options.php`, `inc/interior.php`, `inc/events.php`. WordPress, however, skips kses for users with `unfiltered_html` (Administrators, and Editors on single-site). So the sanitization that protects against low-privilege stored XSS does not constrain high-privilege authors. On a chapter site with multiple authors and shared logins, that is a real (if lower-likelihood) stored-XSS/persistence surface.

## Goals / Non-Goals

**Goals:**
- No role can persist executable markup into rendered content.
- Roles carry only the capabilities their function requires; the model is written down.

**Non-Goals:**
- Rebuilding the editorial workflow or removing the block editor.
- Blocking legitimate rich content (links, images, formatting stay allowed via kses).

## Decisions

- **Strip `unfiltered_html` globally** via `map_meta_cap`/`user_has_cap` (or remove from roles on init) so `content_save_pre`/`pre_kses` always runs kses. Rationale: smallest, most robust change; survives new admin accounts. Alternative (trusting admins) rejected for a shared multi-author org site.
- **Right-size roles:** most authors should be Author/Editor, not Administrator; Administrator reserved for maintainers. Audit current users and document the target model.
- **Tighten `v-html` field allow-lists where practical:** the blog prose kses list (`progressnow_blog_kses_prose`) is already custom; keep it reviewed and minimal. `wp_kses_post` elsewhere is acceptable given no role can inject script once `unfiltered_html` is gone.
- **Guardrail doc:** note that installing certain plugins or role editors can re-grant `unfiltered_html`; the trust-model doc + a test asserts the cap stays off.

## Risks / Trade-offs

- [Admins lose the ability to embed arbitrary HTML/iframes] → Intended; provide vetted blocks (video, event-embed) for the real use cases, and an explicit allow-list extension if a genuine need appears.
- [A plugin re-adds `unfiltered_html`] → Add a test/monitor asserting the cap is absent for all roles.
- [Existing stored script from a prior admin] → One-time content scan (shared with the URL-sink change's content audit).

## Migration Plan

1. Audit users/roles; document the target least-privilege model.
2. Add the `unfiltered_html`-stripping hook; verify normal rich content still saves.
3. Add a regression test asserting no role has `unfiltered_html`.
4. One-time scan for previously-stored `<script>` in rendered content; clean any hits.

## Open Questions

- Any legitimate need for raw HTML/iframe embedding by an admin that isn't already served by a block? If so, define the narrow allow-list before stripping the cap.
