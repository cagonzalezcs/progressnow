---
title: "North Star: Accessible by default"
lang: en-US
updated: 2026-11-01
---

# North Star: Accessible by default

A fully accessible (a11y) implementation that is super easy to use from a frontend developer perspective, where the developer keeps the freedom to implement the site as they see fit, because creativity is important.

## Next action

Push `claude/openspec-cleanup` and open the PR from `PR_BODY.md`. Gets me: the OpenSpec backlog honest and the README current before the a11y work starts. Status: Waiting on the user.

## Lens: Screen-reader usable across all three surfaces

The web application must be usable by people with screen readers, at WCAG 2.2 AA, across all three surfaces (next-js, the WordPress theme with its Vue blocks, and nuxt-js), with the implementation under the hood always improving. Open Source patterns, methodologies and spirit are upheld: vibe coded, vibe checked, human owned.

### Goal

A thorough set of OpenSpec changes documenting screen-reader and WCAG 2.2 AA improvement suggestions across all three surfaces exists under `openspec/changes/`, each with proposal, design, specs and tasks (generated with `opsx:ff` where needed). Documentation is the deliverable; implementation is out of scope for this goal. Checkable on the day: the changes exist and pass `openspec validate`. Horizon: six weeks. Target date: Sunday, December 13, 2026.

### Milestones

1. **Existing OpenSpec changes cleaned up and README updated, delivered as a planned PR:** Done, awaiting push
2. **Screen-reader audit baseline or shared a11y contract as the first a11y change:** Not started (user to pick)

### Milestone 1: Clean up existing OpenSpec changes

The user asked Claude to proceed autonomously on this milestone, so bottlenecks were not interviewed. Steps below are Claude's suggestions, recorded as they are done.

#### Bottleneck 1: Backlog of open changes with unknown status

1. **First Step:** Run `openspec list` and `openspec validate --all`, read every `openspec/changes/*/tasks.md`, and write a table of change, status, validation result. Gets me: a classification of every change as archive, fix or keep. Status: Done.
2. **Second Step:** Archive implemented changes with `opsx:archive`, syncing their delta specs. Gets me: a shorter, honest changes list. Status: Done (four changes archived, `deploy-pipeline` stub deleted, `next-js/openspec/` folded into the root).
3. **Third Step:** Fix invalid or stale changes, or fold duplicates together. Gets me: every remaining change passes validation. Status: Done (verified tasks ticked with evidence, `site/` paths corrected, stale facts annotated).
4. **Fourth Step:** Regenerate the README's generated sections and run the docs lint. Gets me: README matches the repo. Status: Done.
5. **Fifth Step:** Commit signed on a branch and draft the PR body; the user pushes. Gets me: a PR ready to open. Status: Done; the user pushes.

### Handoff

Deferred by the user on Sunday, November 1, 2026: Milestone 1 is a cleanup PR, not an opsx exploration. Input: none. Change: none yet. Milestone 2 returns to `/opsx:explore` or `/opsx:ff` for the a11y changes.

## Session log

- November 1, 2026: North Star, Lens, Goal, Milestone 1 recorded. User asked for autonomous cleanup of existing OpenSpec changes plus README update, ending in a planned PR.
- November 1, 2026: Milestone 1 steps done on branch `claude/openspec-cleanup`; PR body in `PR_BODY.md`. Next: user pushes and opens the PR, then Milestone 2 (pick audit baseline or shared a11y contract) via `/opsx:explore`.
