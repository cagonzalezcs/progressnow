# front-page

## MODIFIED Requirements

### Requirement: Blog teasers driven by published posts
The home "From the blog" section SHALL render the latest published posts (sticky-aware featured card + two rows) from context supplied by `rgvdsa_blog_front_page_context()`; the context keys SHALL always be set (nullable/empty allowed), category pill classes SHALL be built in Twig from the raw `cat` slug, and an empty state SHALL render when no posts exist.

#### Scenario: Real posts on home
- **WHEN** published posts exist
- **THEN** the featured card and rows show real titles/dates/categories, not fixtures

#### Scenario: Pre-seed empty state
- **WHEN** no posts are published
- **THEN** the section shows a "Posts coming soon" state — never lorem ipsum
