<?php
/**
 * Chapter timezone (inc/events.php): event display, gcal links, the ICS feed,
 * and event datetimes follow Settings → General → Timezone. An IANA name
 * yields gcal `ctz` + ICS `X-WR-TIMEZONE`; a UTC offset yields UTC instants
 * and no zone name. No built-in zone survives in theme code.
 */

use WorDBless\BaseTestCase;

class TestEventsTimezone extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		progressnow_events_register_post_type();
	}

	private function make_event( $start, $end ) {
		$id = wp_insert_post(
			array(
				'post_type'    => 'event',
				'post_status'  => 'publish',
				'post_title'   => 'Brake Light Clinic',
				'post_content' => 'Free brake light replacement.',
			)
		);
		update_post_meta( $id, 'start_datetime', $start );
		update_post_meta( $id, 'end_datetime', $end );

		return $id;
	}

	/** WorDBless WP_Query returns nothing — serve the events through the seam so the ICS builder sees them. */
	private function supply_events( array $ids ) {
		$posts = array_map( 'get_post', $ids );
		add_filter(
			'posts_pre_query',
			static function ( $pre, $query ) use ( $posts ) {
				return 'event' === $query->get( 'post_type' ) ? $posts : $pre;
			},
			10,
			2
		);
	}

	private function gcal_query( array $event ) {
		parse_str( (string) wp_parse_url( $event['gcalUrl'], PHP_URL_QUERY ), $query );

		return $query;
	}

	public function test_city_zone_gives_local_times_ctz_and_ics_header() {
		update_option( 'timezone_string', 'America/Los_Angeles' );
		$id = $this->make_event( '2026-07-10 18:00:00', '2026-07-10 20:00:00' ); // PDT = UTC−7.
		$this->supply_events( array( $id ) );

		$this->assertSame( 'America/Los_Angeles', progressnow_events_timezone()->getName() );
		$this->assertSame( 'America/Los_Angeles', progressnow_events_timezone_name() );

		$event = progressnow_event_to_chapter_event( $id );
		$this->assertSame( '2026-07-10', $event['date'] );
		$this->assertSame( '6:00–8:00 PM', $event['time'] );
		$query = $this->gcal_query( $event );
		$this->assertSame( 'America/Los_Angeles', $query['ctz'] );
		$this->assertSame( '20260710T180000/20260710T200000', $query['dates'], 'local wall times with a named zone' );

		$ics = progressnow_events_build_ics();
		$this->assertStringContainsString( "X-WR-TIMEZONE:America/Los_Angeles\r\n", $ics );
		$this->assertStringContainsString( "DTSTART:20260711T010000Z\r\n", $ics );
		$this->assertStringContainsString( "DTEND:20260711T030000Z\r\n", $ics );
	}

	public function test_utc_offset_site_omits_zone_names_and_sends_utc_instants() {
		update_option( 'timezone_string', '' );
		update_option( 'gmt_offset', -6 );
		$id = $this->make_event( '2026-07-10 18:00:00', '2026-07-10 20:00:00' );
		$this->supply_events( array( $id ) );

		$this->assertSame( '-06:00', progressnow_events_timezone()->getName() );
		$this->assertSame( '', progressnow_events_timezone_name() );

		$event = progressnow_event_to_chapter_event( $id );
		$this->assertSame( '6:00–8:00 PM', $event['time'], 'display stays local' );
		$query = $this->gcal_query( $event );
		$this->assertArrayNotHasKey( 'ctz', $query );
		$this->assertSame( '20260711T000000Z/20260711T020000Z', $query['dates'], 'UTC instants when no zone name exists' );

		$ics = progressnow_events_build_ics();
		$this->assertStringNotContainsString( 'X-WR-TIMEZONE', $ics );
		$this->assertStringContainsString( "DTSTART:20260711T000000Z\r\n", $ics );
		$this->assertStringContainsString( "DTEND:20260711T020000Z\r\n", $ics );
	}

	public function test_utc_site_keeps_the_utc_name() {
		update_option( 'timezone_string', 'UTC' );

		$this->assertSame( 'UTC', progressnow_events_timezone_name() );
		$this->assertSame( 'UTC', progressnow_events_timezone()->getName() );
	}

	/** Standard vs daylight time: the same wall time maps to different UTC instants and offsets. */
	public function test_dst_boundary_conversion() {
		update_option( 'timezone_string', 'America/New_York' );

		$winter = progressnow_events_parse_datetime( '2026-01-15 18:00:00' );
		$summer = progressnow_events_parse_datetime( '2026-07-15 18:00:00' );
		$utc    = new DateTimeZone( 'UTC' );

		$this->assertSame( '2026-01-15T18:00:00-05:00', $winter->format( 'c' ) );
		$this->assertSame( '2026-07-15T18:00:00-04:00', $summer->format( 'c' ) );
		$this->assertSame( '20260115T230000Z', $winter->setTimezone( $utc )->format( 'Ymd\THis\Z' ) );
		$this->assertSame( '20260715T220000Z', $summer->setTimezone( $utc )->format( 'Ymd\THis\Z' ) );
	}

	/** No built-in zone: the theme's shipped sources carry no IANA identifier (tests and docs excluded). */
	public function test_no_iana_identifier_in_theme_sources() {
		$root    = dirname( __DIR__ );
		$pattern = '#\b(?:Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)/[A-Z][A-Za-z_]+#';
		$files   = glob( $root . '/*.php' );
		foreach ( array( 'inc', 'views', 'src', 'bin', 'page-templates' ) as $dir ) {
			if ( ! is_dir( $root . '/' . $dir ) ) {
				continue;
			}
			$iterator = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $root . '/' . $dir, FilesystemIterator::SKIP_DOTS ) );
			foreach ( $iterator as $file ) {
				if ( preg_match( '/\.(php|twig|ts|vue|js|json)$/', $file->getFilename() ) ) {
					$files[] = $file->getPathname();
				}
			}
		}

		$hits = array();
		foreach ( $files as $path ) {
			foreach ( explode( "\n", (string) file_get_contents( $path ) ) as $i => $line ) {
				if ( preg_match( $pattern, $line ) ) {
					$hits[] = str_replace( $root . '/', '', $path ) . ':' . ( $i + 1 ) . '  ' . trim( $line );
				}
			}
		}

		$this->assertSame( array(), $hits, "Built-in timezone identifiers found:\n" . implode( "\n", $hits ) );
	}
}
