## ADDED Requirements

### Requirement: Event times follow the WordPress timezone setting
Event display, "Add to Google Calendar" links, the ICS feed, and event structured data SHALL derive their timezone from the WordPress timezone setting (`wp_timezone()` / `wp_timezone_string()`). No built-in timezone identifier SHALL exist in theme code.

#### Scenario: Site set to a city timezone
- **WHEN** Settings → General → Timezone is `America/Los_Angeles` and an event starts at 18:00 local
- **THEN** the event displays 6:00 PM, the gcal link carries `ctz=America/Los_Angeles` with local `dates`, and the ICS feed emits `X-WR-TIMEZONE:America/Los_Angeles` with UTC `DTSTART`/`DTEND` equal to 01:00 (or 02:00 in standard time) the next day

#### Scenario: Site set to a UTC offset
- **WHEN** Settings → General → Timezone is `UTC-6` (no IANA name)
- **THEN** the event displays the correct local time, the gcal link omits `ctz` and sends UTC dates with a `Z` suffix, and the ICS feed omits `X-WR-TIMEZONE`

#### Scenario: No built-in zone in code
- **WHEN** the theme's PHP sources are scanned for IANA timezone identifiers
- **THEN** none is found outside tests and documentation
