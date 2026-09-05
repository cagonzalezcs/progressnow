# Progress Now — session handoff

Written 2026-09-05 by a Cowork session. Path: `.claude/HANDOFF.md` (inside `/.claude/`, which is
gitignored — this file never ships with the repo).

**Read this first, then verify.** Branch tips and task counts in here are a snapshot and move fast —
several Claude Code sessions run against this repo at once. Every "current state" claim below has a
command next to it. Run the commands before acting on the prose.

---

## 1. What the project is

A chapter-neutral organizing-site kit: **one WordPress theme that owns content, SEO and editing, and
three interchangeable frontends** for the public site.

| Frontend | Path | What it is |
|---|---|---|
| PHP theme | `wp-content/themes/progressnow` | Timber/Twig, server-rendered, no Node. Shipping. |
| Nuxt | `nuxt-js/` | Nuxt 4 static rendition that takes over a PHP-rendered shell. Was `site/` until the rename. |
| Next.js | `next-js/` | Next 16 headless app on its own origin. **This is the active build-out.** |

All three read the same `progressnow/v1` REST API, share the theme's zod contracts
(`src/lib/schemas.ts`), Tailwind v4 tokens and `categories.json` by drift test, and render every
route in EN (`/`) and ES (`/es/…`). Bilingual, WCAG 2.2 AA target, no analytics.

The project is **spec-driven with OpenSpec**: `openspec/specs/<capability>/spec.md` is current
behavior, `openspec/changes/<name>/` holds proposal + design + tasks + delta specs for in-flight
work, and finished changes are archived under `openspec/changes/archive/`. Slash commands live in
`.claude/commands/opsx/` (`/opsx:apply`, `/opsx:continue`, `/opsx:verify`, `/opsx:archive`, …).

---

## 2. Where the work is happening

```bash
git -C ~/Sites/progressnow log --oneline -3
git -C ~/Sites/progressnow worktree list
git -C ~/Sites/progressnow/.claude/worktrees/next-js-site-implementation-f8da2b log --oneline -3
```

Two trees, and **they are not interchangeable** — each has tooling the other lacks:

| | `~/Sites/progressnow` (main checkout) | `.claude/worktrees/next-js-site-implementation-f8da2b` |
|---|---|---|
| Branch | `feature/cg/next-js-migration-from-nuxt` | `claude/next-js-site-implementation-f8da2b` |
| Has | theme `node_modules` **and** Composer `vendor` (PHPUnit) | Playwright browsers, `test-results/`, axe reports |
| Owns | WordPress theme, `nuxt-js/`, integration, MAMP docroot | the `next-js-site-implementation` change |

**The rule: `next-js/` work happens in the worktree. Everything else happens in the main checkout.**
`next-js/` is visible in both trees (it merged into the feature branch early, which is fine — that
branch is the integration line), so this discipline has to come from the operator, not the layout.
Editing `next-js/` in both trees is how you manufacture merge conflicts; it already happened once
with `app/[[...slug]]/page.tsx`.

When the change is done (its task 8.6 says "open the PR"), merge the worktree branch into the
feature branch and delete the worktree.

---

## 3. Pending mechanical cleanup — run this at a pause

```bash
bash ~/Sites/progressnow/.claude/cowork-cleanup/apply.sh
```

Prepared and rehearsed against clones of the live repo; **safe to re-run**, refuses to do anything if
either tree is dirty, and pushes nothing (it prints the push commands at the end). It:

1. Drops commit `62db270` "Removing node_modles from top level git history" — despite the message it
   **added** 925 files of `site/.output` + `site/.nuxt` build output (214k lines). Rebases anything
   that landed on top onto `aaa949d`. Then untracks the stale `site/` directory (the folder was left
   behind by the `site/` → `nuxt-js/` rename) and moves `site/.env` → `nuxt-js/.env`.
2. Adds `/wp-content/plugins` and `/wp-content/mu-plugins` to `.gitignore` — the existing directory
   patterns don't match the symlinks `bin/worktree-bootstrap.sh` creates.
3. Refreshes the README roadmap counts (see §4).
4. Merges the feature branch into the Next.js worktree. Auto-resolves the one expected conflict:
   `wp-config.php` is modify/delete (untracked on the main line, committed-and-modified in the
   worktree) — it accepts the untracking and **keeps the worktree's copy on disk**, because that copy
   carries the pinned `WP_HOME`/`WP_SITEURL`. Then re-runs `worktree-bootstrap.sh` to re-link WP core,
   plugins and languages. Any other conflict stops the script and names the files.
5. Points `main` at the feature branch and retires the two spent worktrees
   (`stoic-austin-080665`, `peaceful-williams-08cc2b` — both one-commit fixes already merged).

Afterwards the feature branch and the Next.js branch both need `git push --force-with-lease`
(rewritten history). Then `rm -rf ~/Sites/progressnow/.claude/cowork-cleanup`.

---

## 4. Keeping README.md current — do this every time

The root `README.md` is the project front door and **it goes stale faster than anything else in the
repo**. Treat updating it as part of finishing work, not as a separate chore. Six places drift:

**a. Roadmap table counts** (`## Roadmap`, the `| change | done/total | scope |` rows).
Automated — `apply.sh` step 1c recounts every `openspec/changes/*/tasks.md` and rewrites any row
whose second column looks like `N/M`, leaving prose rows (`partial`, `Superseded by …`) alone. To do
it by hand for one change:

```bash
cd ~/Sites/progressnow          # or the worktree, whichever holds the newest tasks.md
f=openspec/changes/next-js-site-implementation/tasks.md
echo "$(grep -c '^\s*- \[x\]' $f)/$(grep -cE '^\s*- \[[ x]\]' $f)"
```

**b. The `| Status |` row of the "Frontends: pick one" table.** Carries a task count per frontend and
a one-word state. Update whenever a. changes.

**c. The History table** (`## History`) — its last row also carries a task count. When a change is
archived with `/opsx:archive`, **move its row out of Roadmap and into History** with the date and a
one-line summary of what shipped.

**d. The "Known items carried over" paragraph** below the Roadmap. It describes CI and known bugs;
both move. After the merged `ci.yml` landed, CI is four jobs (`theme-js`, `theme-php`, `nuxt-js`,
`next-js`), not the two it used to describe.

**e. Stale `site/` paths.** The rename to `nuxt-js/` is done but references keep reappearing. Check:

```bash
git grep -nE '(^|[^a-z_/-])site/' -- ':!openspec/changes/archive' ':!**/components/site/**'
```

Hits under `components/site/` and in the archive are correct — everything else is a bug.

**f. The architecture diagram and the frontend descriptions.** They still narrate only the Nuxt shell
handoff. Once the Next.js routes are real (they now are), the diagram should show both paths: PHP
renders every URL for the theme, and Next.js serves its own origin with WordPress as CMS + API.

**Definition of done for a README edit:** a. and b. agree with the actual `tasks.md` files, e. returns
nothing outside `components/site/`, and any capability you added or changed appears in the
"Capabilities on file" list under `## OpenSpec workflow`.

---

## 5. Remaining work in `next-js-site-implementation`

Sections 1–6 are done (front page, interior pages, chrome, posts index, single post, calendar, single
event, 404/error, parity pass). Remaining:

- **4.10** Kitchen-sink a11y burn-down — the vendored shadcn registry examples carry upstream a11y
  debt; `test/e2e/a11y/kitchen-sink-baseline.json` ratchets the offending node count toward 0.
- **7.1–7.6** SEO: `lib/metadata.ts`, `app/sitemap.ts` + `robots.ts`, JSON-LD parity, the PHP
  `CHAPTER_CANONICAL_ORIGIN` work in `inc/seo.php`, Nuxt verification, SEO e2e.
- **8.1–8.6** Deployment: CSP with a per-request nonce, image `remotePatterns`, Dockerfile + smoke,
  docs, local end-to-end against MAMP, final CI gate and the PR.

`openspec/changes/next-js-site-implementation/tasks.md` is the source of truth — read it, don't trust
this list. `/opsx:apply` continues the change; `/opsx:verify` checks implementation against the
artifacts before archiving.

---

## 6. Conventions and gotchas

- **Tests before implementation.** Every task in this change lands its tests first — that ordering is
  written into the tasks themselves. Keep it.
- **Three-copy rule.** The theme's `src/` and `nuxt-js/app/` hold twin Vue components, and drift tests
  fail if `schemas.ts`, `tailwind.css` or `categories.json` diverge. Change one, change the others.
- **Commit trailer** for AI-assisted commits:
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>` plus a `Claude-Session:` line.
- **`wp-config.php` carries a real local DB password and salts in the pushed git history** (3 commits,
  on `main` and the Next.js branch). Scope is local MAMP, and `open-source-release-readiness` calls
  for a fresh fork with clean history anyway — but **rotate the salts and that DB password before the
  repo goes public**, and don't let a new `wp-config.php` get committed.
- **`.DS_Store` files** keep sneaking into commits. `.gitignore` covers them; check `git status`
  before staging with `-A`.
- **Two sessions, one repo.** Before starting work, check both trees are clean
  (`git status` in each) — another session may be mid-task.
