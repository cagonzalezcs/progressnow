# content-migration Specification

## Purpose
TBD - created by syncing change gutenberg-post-blocks. Update Purpose after archive.
## Requirements
### Requirement: Idempotent migration script
`bin/migrate-post-blocks.php` (WP-CLI `eval-file`) SHALL convert ACF `post_blocks` rows to serialized block markup, skipping posts that already have blocks, retaining ACF meta for rollback, stamping `_progressnow_blocks_migrated`, and supporting a `dry` mode that prints markup without writing.

#### Scenario: Dry run is read-only
- **WHEN** the script runs with `dry`
- **THEN** would-be block markup prints and no post is modified

#### Scenario: Re-run safe
- **WHEN** the script runs twice
- **THEN** already-migrated posts are skipped

#### Scenario: Rollback
- **WHEN** a migration needs to be undone
- **THEN** the retained ACF meta and `_progressnow_blocks_migrated` stamps allow reconstructing pre-migration state (git revert restores the ACF serializer) with no data loss

### Requirement: Search covers body text
After migration, native WP search and any downstream `s` query params SHALL match text authored in post body blocks.

#### Scenario: Body search hit
- **WHEN** a visitor searches a phrase that appears only inside a migrated post's prose
- **THEN** the post appears in results
