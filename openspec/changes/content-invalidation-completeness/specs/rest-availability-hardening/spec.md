## REMOVED Requirements

### Requirement: Cache invalidation covers terms and ignores noise
**Reason**: Absorbed by `content-performance` — "Version-invalidated transients" now names the complete write-path set (terms included) and the new "Invalidation ignores noise" requirement carries the revision / auto-draft / nav-menu-item exclusions, extended to autosaves and every non-public post type. One capability owns invalidation.
**Migration**: None. The behavior is unchanged and now specified (and tested) under `content-performance`; `security-rest-cache-dos-hardening` (archived 2026-09-09) keeps pagination bounds, negative-cache suppression, date-window clamps, and ICS caching.
