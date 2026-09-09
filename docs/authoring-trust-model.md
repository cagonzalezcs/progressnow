# Authoring trust model

Who can put what into the site, and why no account — including
Administrators — can store executable markup. Companion to the theme's
[Output escaping](../wp-content/themes/progressnow/README.md#output-escaping)
section (render side) and the URL-sink allow-list (`inc/sanitize.php`).

## 1. Every save goes through kses

WordPress skips its `wp_kses_post` save filters for any user holding the
`unfiltered_html` capability. Stock single-site grants it to Administrators
and Editors, so a compromised or careless high-privilege account could
persist `<script>` / `<iframe>` / inline handlers that the islands' `v-html`
and Twig `|raw` sinks would then render.

`wp-content/themes/progressnow/inc/roles.php` closes that for every role:

| Layer | Mechanism | Effect |
|---|---|---|
| Runtime deny | `map_meta_cap` → `unfiltered_html` resolves to `do_not_allow` (the same mechanism core uses for `DISALLOW_UNFILTERED_HTML` and for non-super-admins on multisite) | `current_user_can( 'unfiltered_html' )` is false for everyone, whatever a role, plugin or role editor grants |
| Belt and braces | `user_has_cap` drops the primitive from the resolved capability list | Code reading `$user->allcaps` agrees |
| Stored roles | `init` (priority 0) removes the primitive from any role that still lists it | `wp cap list <role>`, role-editor plugins and the regression test all see it absent; a re-grant is undone on the next request |

Consequences, all intended:

- Post content, excerpts, titles and comments from **every** role pass
  through `wp_kses_post` / `wp_kses`. Links, headings, lists, images,
  blockquotes, tables and the block-comment JSON survive (the editor
  serializes `<`, `>`, `&`, `"`, `--` inside attrs as `\uXXXX` escapes).
- `<script>`, `<iframe>`, `<embed>`, `<svg>`, `<style>`, inline `on*=`
  handlers and `javascript:` URLs are stripped on save.
- ACF (≥ 5.10) also applies `wp_kses_post` on save for users without
  `unfiltered_html`, so Chapter Settings / page field values are covered by
  the same rule.
- Embedding video stays possible through the vetted `progressnow/video`
  block; there is **no** raw-HTML/iframe allow-list, because no genuine need
  for one has been identified. If one appears, extend a *named* kses list
  (e.g. `progressnow_blog_kses_prose`) deliberately — never re-grant the
  capability.
- kses normalizes `&` → `&amp;` (and stray `<` → `&lt;`) inside stored text
  and block attrs. Twig renders it as typed (the `esc_html` autoescape
  strategy never double-encodes an existing entity), and the serializers that
  feed plain-text island props decode again (`progressnow_plain_text`,
  `progressnow_blog_kses_plain`, `progressnow_safe_url`, the
  `html_entity_decode( get_the_title() )` calls), so `Arts & Culture` renders
  as typed everywhere.

Belt-and-braces for hosts: add `define( 'DISALLOW_UNFILTERED_HTML', true );`
to `wp-config.php` (see `wp-config-sample.php`). Core then denies the
capability even while another theme is active.

## 2. Least-privilege role model

Assign each person the **lowest** role that covers their job. Roles are
capability bundles, not status.

| Role | Who | Can | Cannot |
|---|---|---|---|
| **Administrator** | Site maintainers only (the one or two people who install plugins, run updates, manage users, edit Chapter Settings and page-template fields). Prefer a dedicated maintainer account over a personal one. | Everything | Store executable markup (see §1) |
| **Editor** | Publishing leads: review and publish other people's posts and events, manage categories and menus | Publish/edit any post, page or event; moderate comments; manage terms | Install/activate plugins or themes, edit users, change settings |
| **Author** | Regular writers | Write, upload media for, and publish their **own** posts and events | Edit others' content; manage terms or menus |
| **Contributor** | Occasional / guest writers | Draft their own posts for an Editor to publish | Upload media; publish |
| **Subscriber** | Nobody in practice (comments are open without an account) | Read | — |

Rules:

- Shared logins are forbidden; one person, one account, and MFA where the
  host offers it.
- New accounts default to **Author**. Promotion to Editor is a maintainer
  decision recorded in the chapter's ops notes.
- Committee leads who only need to update *their* page section get the page
  edited by an Editor or maintainer — that is cheaper than a broader role.
- Do not install role-editor plugins to hand out one-off capabilities. If a
  plugin re-grants `unfiltered_html`, `inc/roles.php` undoes it on the next
  request and `composer test` (`tests/test-roles.php`) fails the moment the
  hook is removed.

## 3. Audit & reassignment runbook

Run on the WordPress host (WP-CLI, theme active). Both commands are
read-only.

```bash
wp chapter audit-roles
```

Lists every user with their role(s) and whether they resolve
`unfiltered_html` (must be `no` for all). Exits non-zero if any user or
stored role still holds the capability. Then, for each account above the
lowest sufficient role:

```bash
wp user set-role <login> author      # or editor
```

Remove accounts that no longer belong to an active member
(`wp user delete <login> --reassign=<maintainer-id>` keeps their posts).

```bash
wp chapter audit-markup
```

Reports stored content that still carries executable markup — anything an
Administrator saved *before* kses became unconditional (`post_content`,
excerpts, block attrs, post meta, Chapter Settings). Open each hit in
wp-admin and re-save it; the save now runs through kses. `wp chapter
audit-urls` (from the URL-sink change) covers `javascript:`/`data:` URLs in
the same places.

Repeat both audits after onboarding/offboarding and after any plugin
install.
