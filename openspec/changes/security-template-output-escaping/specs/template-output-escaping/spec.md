## ADDED Requirements

### Requirement: Twig output is escaped by default
The theme's Twig environment SHALL run with autoescape enabled (`html` strategy). Any template expression that intentionally emits HTML SHALL use `|raw` and carry a same-line marker comment naming the sanitizer that produced the value (`{# raw: kses #}` or `{# raw: encoder #}`).

#### Scenario: Plain interpolation is escaped
- **WHEN** a post title containing `<img src=x onerror=alert(1)>` is rendered by any template
- **THEN** the HTML contains the title as escaped text and no `<img` element

#### Scenario: Unmarked raw fails the build
- **WHEN** a template gains a `|raw` filter without a marker comment
- **THEN** the Twig audit and the PHPUnit gate both fail naming the file and line

### Requirement: Inline JSON is script-safe
Every value serialized into an inline `<script>` element (JSON-LD, `__SHELL_DATA__`, `__NUXT__.config`, importmap, and any future block) SHALL be produced by the shared script-context encoder, which escapes `<`, `>`, `&`, `'`, `"`, and U+2028/U+2029 as JSON unicode escapes and never emits an unescaped `/`.

#### Scenario: Script terminator cannot break out
- **WHEN** a Chapter Settings name or a post dek contains `</script><script>alert(1)</script>`
- **THEN** the emitted inline JSON contains `</script>` and the document has no additional script element

#### Scenario: Next.js parity
- **WHEN** the same hostile string is serialized by `next-js/lib/json-ld.ts`
- **THEN** the output contains no literal `<`, `>`, `&`, U+2028, or U+2029

### Requirement: Values are escaped exactly once
Context builders SHALL hand Twig unescaped values (or kses'd HTML marked raw); pre-escaping for display SHALL NOT be applied in PHP, so autoescape produces a single level of escaping.

#### Scenario: Ampersand renders once
- **WHEN** the chapter name is `Tom & Jerry's "Chapter"`
- **THEN** the header, footer, title tag, and JSON-LD each render it once-escaped for their context (`&amp;` in HTML, `&` in inline JSON), never `&amp;amp;`

### Requirement: Hostile-content regression suite
The theme test suite SHALL seed hostile strings into every editor-controlled field family and render every public template family (front, posts index, single post, single event, calendar, about, get-involved, generic page, 404, search, author, ICS), asserting that no executable fragment survives.

#### Scenario: Suite covers new templates
- **WHEN** a new public template is added without a hostile-content case
- **THEN** the suite's template inventory assertion fails listing the uncovered template
