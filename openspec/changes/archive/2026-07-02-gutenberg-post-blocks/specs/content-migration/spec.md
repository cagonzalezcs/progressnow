# content-migration

## ADDED Requirements

### Requirement: Idempotent migration script
`bin/migrate-post-blocks.php` (WP-CLI `eval-file`) SHALL convert ACF `post_blocks` rows to serialized block markup, skipping posts that already have blocks, retaining ACF meta for rollback, stamping `_legacy_blocks_migrated`, and supporting a `dry` mode that prints markup without writing.

#### Scenario: Dry run is read-only
- **WHEN** the script runs with `dry`
- **THEN** would-be block markup prints and no post is modified

#### Scenario: Re-run safe
- **WHEN** the script runs twice
- **THEN** already-migrated posts are skipped

#### Scenario: Rollback
- **WHEN** a migrated post's content is reverted
- **THEN** the legacy ACF path serializes it again with no data loss

### Requirement: Search covers body text
After migration, native WP search and any downstream `s` query params SHALL match text authored in post body blocks.

#### Scenario: Body search hit
- **WHEN** a visitor searches a phrase that appears only inside a migrated post's prose
- **THEN** the post appears in results
