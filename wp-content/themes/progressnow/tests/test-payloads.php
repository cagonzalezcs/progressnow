<?php
/**
 * Route payloads (inc/payloads.php) + the additive REST endpoints (inc/rest.php):
 * /site, /routes, /front-page, /pages/{path}, /events/{slug}, and the `seo`
 * block on every route payload. Content is served through the WorDBless
 * `posts_pre_query` seam (WP_Query SQL returns nothing there).
 */

use WorDBless\BaseTestCase;

class TestPayloads extends BaseTestCase {

	/** IDs registered with the query seam, in insert order. */
	private $seam_ids = array();

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		// parent::set_up() restores the pre-theme hook snapshot: re-attach what
		// the payload builders and REST routes need.
		add_action( 'rest_api_init', 'progressnow_rest_register_routes' );
		add_filter( 'rest_post_dispatch', 'progressnow_rest_cache_headers', 10, 3 );
		add_filter( 'progressnow/context/front_page', 'progressnow_options_front_page_context', 5, 2 );
		add_filter( 'progressnow/context/front_page', 'progressnow_events_front_page_context' );
		add_filter( 'progressnow/context/front_page', 'progressnow_blog_front_page_context' );
		add_filter( 'progressnow/context/page', 'progressnow_interior_page_context', 10, 2 );
		add_filter( 'progressnow/context/page', 'progressnow_pages_page_context', 10, 2 );
		add_filter( 'progressnow/context/page', 'progressnow_events_calendar_context', 10, 2 );
		add_filter( 'progressnow/context/single', 'progressnow_events_single_context', 10, 2 );
		add_filter( 'progressnow/context/single', 'progressnow_blog_single_context', 10, 2 );
		$GLOBALS['wp_rest_server'] = null;

		progressnow_events_register_post_type();

		$this->seam_ids = array();
		$this->supply_query_seam();

		update_option( 'blogname', 'Progress Now' );
		update_option( 'blogdescription', 'Organizing our community.' );
		kses_remove_filters();
	}

	/* ---- helpers ---- */

	private function make( array $args ) {
		$id = wp_insert_post(
			wp_parse_args(
				$args,
				array(
					'post_status'  => 'publish',
					'post_content' => 'Body copy.',
				)
			)
		);
		$this->seam_ids[] = (int) $id;

		return (int) $id;
	}

	private function make_page( $slug, $title, $template = '' ) {
		$id = $this->make( array( 'post_type' => 'page', 'post_title' => $title, 'post_name' => $slug ) );
		if ( $template ) {
			update_post_meta( $id, '_wp_page_template', $template );
		}

		return $id;
	}

	private function make_event( $slug, $title, $start ) {
		$id = $this->make( array( 'post_type' => 'event', 'post_title' => $title, 'post_name' => $slug, 'post_content' => 'Event body.' ) );
		update_post_meta( $id, 'start_datetime', $start );
		update_post_meta( $id, 'end_datetime', substr( $start, 0, 11 ) . '20:00:00' );
		update_post_meta( $id, 'venue', 'Union Hall' );
		update_post_meta( $id, 'city', 'Downtown' );

		return $id;
	}

	/**
	 * Serve every seeded post through posts_pre_query, honoring post_type,
	 * status, name, post__not_in, meta_key/value, posts_per_page.
	 */
	private function supply_query_seam() {
		remove_all_filters( 'posts_pre_query' );
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) {
				$types = (array) ( $query->get( 'post_type' ) ?: 'post' );
				$posts = array_values( array_filter( array_map( 'get_post', $this->seam_ids ) ) );
				$posts = array_filter(
					$posts,
					static function ( $p ) use ( $types ) {
						return in_array( $p->post_type, $types, true ) || in_array( 'any', $types, true );
					}
				);

				$status = $query->get( 'post_status' ) ?: 'publish';
				$posts  = array_filter(
					$posts,
					static function ( $p ) use ( $status ) {
						return 'any' === $status || $p->post_status === $status;
					}
				);

				$name = (string) $query->get( 'name' );
				if ( '' !== $name ) {
					$posts = array_filter(
						$posts,
						static function ( $p ) use ( $name ) {
							return $p->post_name === $name;
						}
					);
				}

				$not_in = array_map( 'intval', (array) $query->get( 'post__not_in' ) );
				if ( $not_in ) {
					$posts = array_filter(
						$posts,
						static function ( $p ) use ( $not_in ) {
							return ! in_array( (int) $p->ID, $not_in, true );
						}
					);
				}

				$meta_key = (string) $query->get( 'meta_key' );
				if ( '' !== $meta_key && '' !== (string) $query->get( 'meta_value' ) ) {
					$meta_value = (string) $query->get( 'meta_value' );
					$posts      = array_filter(
						$posts,
						static function ( $p ) use ( $meta_key, $meta_value ) {
							return (string) get_post_meta( $p->ID, $meta_key, true ) === $meta_value;
						}
					);
				}

				$posts = array_values( $posts );
				$query->found_posts   = count( $posts );
				$query->max_num_pages = $posts ? 1 : 0;

				$limit = (int) $query->get( 'posts_per_page' );
				if ( $limit > 0 ) {
					$posts = array_slice( $posts, 0, $limit );
				}

				// Honor `fields => ids` (get_posts() callers such as the calendar URL lookup).
				if ( 'ids' === $query->get( 'fields' ) ) {
					return array_map( static function ( $p ) { return (int) $p->ID; }, $posts );
				}

				return $posts;
			},
			10,
			2
		);
	}

	private function get( $route ) {
		return rest_do_request( new WP_REST_Request( 'GET', $route ) );
	}

	/* ---- key grammar + language helpers ---- */

	public function test_payload_key_grammar() {
		$this->assertSame( 'site:en', progressnow_payload_key( 'site', 'en' ) );
		$this->assertSame( 'routes', progressnow_payload_key( 'routes', 'en' ) );
		$this->assertSame( 'front:es', progressnow_payload_key( 'front', 'es' ) );
		$this->assertSame( 'page:en:about', progressnow_payload_key( 'page', 'en', '/about/' ) );
		$this->assertSame( 'post:en:hello', progressnow_payload_key( 'post', 'en', 'hello' ) );
		$this->assertSame( 'event:es:reunion', progressnow_payload_key( 'event', 'es', 'reunion' ) );
	}

	public function test_language_helpers_without_polylang() {
		$this->assertSame( '', progressnow_lang_default() );
		$this->assertSame( array( '' ), progressnow_lang_list() );
		$this->assertSame( '', progressnow_lang_normalize( 'es' ) );
		$this->assertNull( progressnow_lang_switch( 'es' ) );
	}

	/* ---- /site ---- */

	public function test_site_payload_carries_chrome_identity_and_strings() {
		$data = $this->get( '/progressnow/v1/site' )->get_data();

		$this->assertSame( '', $data['lang'] );
		$this->assertStringContainsString( 'progressnow/v1', $data['apiBase'] );
		$this->assertSame( 'Progress Now', $data['identity']['name'] );
		$this->assertSame( 'Progress Now', $data['header']['orgName'] );
		$this->assertSame( '', $data['header']['logoUrl'] );
		$this->assertTrue( $data['header']['logoIsDefault'] );
		$this->assertSame( '/', $data['header']['homeUrl'] );
		$this->assertTrue( $data['footer']['logoIsDefault'] );
		$this->assertSame( 'Join us', $data['header']['joinLabel'] );
		$this->assertSame( 'Where We Organize', $data['header']['aboutItems'][2]['label'] );
		$this->assertSame( '/get-involved/#join', $data['chapter']['join_url'] );
		$this->assertSame( '', $data['chapter']['newsletter_url'] );
		$this->assertNull( $data['footer']['columns'] );
		$this->assertSame( 'Upcoming events', $data['strings']['home_events_head'] );
		$this->assertSame( array(), $data['languages'] );
	}

	/* ---- /routes ---- */

	public function test_routes_manifest_lists_every_public_route() {
		$front = $this->make_page( 'home', 'Home' );
		$blog  = $this->make_page( 'blog', 'Blog' );
		$about = $this->make_page( 'about', 'About the Chapter', 'page-templates/about.php' );
		$cal   = $this->make_page( 'calendar', 'Event Calendar', 'page-templates/calendar.php' );
		$post  = $this->make( array( 'post_type' => 'post', 'post_title' => 'Hello', 'post_name' => 'hello' ) );
		$event = $this->make_event( 'meeting', 'Meeting', '2030-01-01 18:00:00' );
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $front );
		update_option( 'page_for_posts', $blog );

		$data   = $this->get( '/progressnow/v1/routes' )->get_data();
		$byKind = array();
		foreach ( $data['routes'] as $route ) {
			$byKind[ $route['kind'] ][] = $route;
		}

		$this->assertSame( 1, $data['contentVersion'] );
		$this->assertSame( $front, $byKind['front'][0]['id'] );
		$this->assertSame( 'front:', $byKind['front'][0]['payloadKey'] );
		$this->assertSame( $blog, $byKind['posts_index'][0]['id'] );
		$this->assertSame( $about, $byKind['about'][0]['id'] );
		$this->assertSame( 'page-templates/about.php', $byKind['about'][0]['template'] );
		$this->assertSame( $cal, $byKind['calendar'][0]['id'] );
		$this->assertSame( 'post::hello', $byKind['post'][0]['payloadKey'] );
		$this->assertSame( 'event::meeting', $byKind['event'][0]['payloadKey'] );
		$this->assertSame( $post, $byKind['post'][0]['id'] );
		$this->assertSame( $event, $byKind['event'][0]['id'] );
		$this->assertSame( count( $data['routes'] ), count( array_unique( array_column( $data['routes'], 'path' ) ) ), 'paths are unique' );
	}

	/* ---- /front-page ---- */

	public function test_front_page_payload_matches_the_shell_context() {
		$front = $this->make_page( 'home', 'Home' );
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $front );
		$this->make_event( 'meeting', 'General Meeting', '2030-01-01 18:00:00' );

		$data = $this->get( '/progressnow/v1/front-page' )->get_data();

		$this->assertSame( $front, $data['id'] );
		$this->assertSame( progressnow_front_hero( $front ), $data['hero'] );
		$this->assertSame( progressnow_front_who( $front ), $data['who'] );
		$this->assertSame( 5, $data['eventCount'] );
		$this->assertCount( 1, $data['events'] );
		$this->assertSame( 'General Meeting', $data['events'][0]['title'] );
		$this->assertNull( $data['blog']['featured'] );
		$this->assertSame( array(), $data['blog']['rows'] );
		// Core texturizes the " - " separator to an en dash in <title>.
		$this->assertSame( 'Progress Now – Organizing our community.', $data['seo']['title'] );
		$this->assertSame( 'index,follow', $data['seo']['robots'] );
		$this->assertStringContainsString( 'member-run organization', $data['seo']['description'] );
	}

	/* ---- /pages/{path} ---- */

	public function test_about_page_payload_carries_the_about_group() {
		$about = $this->make_page( 'about', 'About the Chapter', 'page-templates/about.php' );

		$data = $this->get( '/progressnow/v1/pages/about' )->get_data();

		$this->assertSame( $about, $data['id'] );
		$this->assertSame( 'about', $data['kind'] );
		$this->assertSame( 'page-templates/about.php', $data['template'] );
		$this->assertSame( 'About the Chapter', $data['title'] );
		$this->assertSame( 'About the Chapter', $data['about']['chapter']['heading'] );
		$this->assertSame( 'Where We Organize', $data['about']['counties']['heading'] );
		$this->assertNull( $data['gi'] );
		$this->assertNull( $data['calendar'] );
		$this->assertSame( 'Get involved', $data['newhere']['heading'] );
		$this->assertSame( '/get-involved/#join', $data['newhere']['url'] );
		$this->assertFalse( $data['newhere']['external'] );
		$this->assertSame( get_permalink( $about ), $data['seo']['canonical'] );
		$this->assertSame( 'About the Chapter – Progress Now', $data['seo']['title'] );
	}

	public function test_get_involved_and_calendar_payloads_carry_their_groups() {
		$gi  = $this->make_page( 'get-involved', 'Get involved', 'page-templates/get-involved.php' );
		$cal = $this->make_page( 'calendar', 'Event Calendar', 'page-templates/calendar.php' );

		$gi_data = $this->get( '/progressnow/v1/pages/get-involved' )->get_data();
		$this->assertSame( 'get_involved', $gi_data['kind'] );
		$this->assertSame( 'How to join', $gi_data['gi']['join']['heading'] );
		$this->assertSame( '/get-involved/#join', $gi_data['gi']['card']['url'] );

		$cal_data = $this->get( '/progressnow/v1/pages/calendar' )->get_data();
		$this->assertSame( 'calendar', $cal_data['kind'] );
		$this->assertStringContainsString( 'chapter-events', $cal_data['calendar']['icsUrl'] );
		$this->assertStringContainsString( 'progressnow/v1', $cal_data['calendar']['apiBase'] );
		$this->assertStringStartsWith( 'https://calendar.google.com/', $cal_data['calendar']['googleCalUrl'] );
		$this->assertSame( $cal, $cal_data['id'] );
	}

	public function test_interior_page_payload_defaults() {
		$id = $this->make_page( 'bylaws-code-of-conduct', 'Bylaws & Code of Conduct' );
		update_post_meta( $id, 'lede', 'How we govern ourselves.' );

		$data = $this->get( '/progressnow/v1/pages/bylaws-code-of-conduct' )->get_data();

		$this->assertSame( 'page', $data['kind'] );
		$this->assertSame( 'page.php', $data['template'] );
		$this->assertSame( 'How we govern ourselves.', $data['lede'] );
		$this->assertStringContainsString( 'Body copy.', $data['content'] );
		$this->assertSame( array(), $data['documents'] );
		$this->assertTrue( $data['grievance']['show'] );
		$this->assertSame( 'How we govern ourselves.', $data['seo']['description'] );
	}

	public function test_unknown_page_is_404() {
		$response = $this->get( '/progressnow/v1/pages/nope' );

		$this->assertSame( 404, $response->get_status() );
		$this->assertSame( 'progressnow_page_not_found', $response->get_data()['code'] );
	}

	public function test_page_path_sanitizer_drops_traversal_and_case() {
		$this->assertSame( 'about/team', progressnow_rest_sanitize_path( '/About/../team/' ) );
		$this->assertSame( 'get-involved', progressnow_rest_sanitize_path( 'Get Involved' ) );
	}

	/* ---- /events/{slug} + /posts/{slug} seo ---- */

	public function test_single_event_payload() {
		$id = $this->make_event( 'general-meeting', 'General Meeting', '2030-01-01 18:00:00' );
		$this->make_event( 'later', 'Later Event', '2030-02-01 18:00:00' );

		$data = $this->get( '/progressnow/v1/events/general-meeting' )->get_data();

		$this->assertSame( $id, $data['id'] );
		$this->assertSame( 'General Meeting', $data['event']['title'] );
		$this->assertSame( 'Union Hall', $data['event']['venue'] );
		$this->assertTrue( $data['showRelated'] );
		$this->assertSame( 'Later Event', $data['related'][0]['title'] );
		$this->assertSame( get_permalink( $id ), $data['seo']['canonical'] );
		$this->assertSame( 'General Meeting – Progress Now', $data['seo']['title'] );
		$this->assertSame( 'Event body.', $data['seo']['description'] );

		$missing = $this->get( '/progressnow/v1/events/nope' );
		$this->assertSame( 404, $missing->get_status() );
		$this->assertSame( 'progressnow_event_not_found', $missing->get_data()['code'] );
	}

	public function test_single_post_payload_carries_seo() {
		$id = $this->make( array( 'post_type' => 'post', 'post_title' => 'Hello World', 'post_name' => 'hello-world', 'post_excerpt' => 'Share copy.' ) );

		$data = $this->get( '/progressnow/v1/posts/hello-world' )->get_data();

		$this->assertSame( 'Hello World', $data['title'] );
		$this->assertSame( 'Hello World – Progress Now', $data['seo']['title'] );
		$this->assertSame( 'Share copy.', $data['seo']['description'] );
		$this->assertSame( get_permalink( $id ), $data['seo']['canonical'] );
		$this->assertSame( 'index,follow', $data['seo']['robots'] );
		$this->assertSame( array(), $data['seo']['hreflang'] );
	}

	/* ---- subjects ---- */

	public function test_page_kind_detection() {
		$front = $this->make_page( 'home', 'Home' );
		$blog  = $this->make_page( 'blog', 'Blog' );
		$about = $this->make_page( 'about', 'About', 'page-templates/about.php' );
		$plain = $this->make_page( 'privacy', 'Privacy' );
		update_option( 'page_on_front', $front );
		update_option( 'page_for_posts', $blog );

		$this->assertSame( 'front', progressnow_page_kind( $front ) );
		$this->assertSame( 'posts_index', progressnow_page_kind( $blog ) );
		$this->assertSame( 'about', progressnow_page_kind( $about ) );
		$this->assertSame( 'page', progressnow_page_kind( $plain ) );

		$this->assertSame( 'front', progressnow_seo_subject_for_post( $front )['type'] );
		$this->assertSame( 'posts_page', progressnow_seo_subject_for_post( $blog )['type'] );
		$this->assertSame( 'page', progressnow_seo_subject_for_post( $about )['type'] );
		$this->assertSame( '404', progressnow_seo_subject_for_post( 999999 )['type'] );
	}
}
