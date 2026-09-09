<?php
/**
 * URL-sink sanitization (inc/sanitize.php + the serializers that call it).
 *
 * Block-comment JSON attrs and post meta bypass wp_kses, so every URL that
 * lands in an island `:href` / `:src` binding must be scheme-checked at
 * serialize time. Covers the shared helper and each confirmed sink: video
 * url/transcriptUrl, core/image regex-fallback src, archive pagination, and
 * event rsvpUrl (both serializers).
 */

use WorDBless\BaseTestCase;

class TestUrlSinks extends BaseTestCase {

	private $request_uri;

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		// Plain require: WorDBless restores hooks to a pre-theme snapshot
		// after every test, so hooks must re-register per test.
		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );
		do_action( 'init' );
		$this->request_uri = $_SERVER['REQUEST_URI'] ?? null;

		// Fixtures are inserted unslashed, and the kses save filters
		// (stripslashes → kses → addslashes) would leave the block comment
		// JSON backslashed under WorDBless, breaking parse_blocks. Drop them
		// here; the real save path (every role through kses, inc/roles.php)
		// is exercised by tests/test-roles.php.
		kses_remove_filters();

		parent::set_up();
	}

	public function tear_down() {
		if ( null === $this->request_uri ) {
			unset( $_SERVER['REQUEST_URI'] );
		} else {
			$_SERVER['REQUEST_URI'] = $this->request_uri;
		}
		parent::tear_down();
	}

	/** Hostile schemes the helper must drop, in the spellings attackers use. */
	private function hostile_urls() {
		return array(
			'javascript:alert(document.cookie)',
			'JaVaScRiPt:alert(1)',
			" javascript:alert(1)",
			'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
			'vbscript:msgbox(1)',
			'file:///etc/passwd',
		);
	}

	private function make_post( $content, $args = array() ) {
		return wp_insert_post(
			wp_parse_args(
				$args,
				array(
					'post_type'    => 'post',
					'post_status'  => 'publish',
					'post_title'   => 'URL sink post',
					'post_content' => $content,
				)
			)
		);
	}

	private function blocks_for( $content ) {
		return progressnow_blog_blocks_from_content( get_post( $this->make_post( $content ) ) );
	}

	private function video_block( $data ) {
		$attrs = wp_json_encode(
			array(
				'name' => 'progressnow/video',
				'data' => $data,
				'mode' => 'preview',
			)
		);
		return "<!-- wp:progressnow/video {$attrs} /-->";
	}

	private function make_event( $rsvp_url ) {
		$id = $this->make_post( '<p>Meeting.</p>', array( 'post_type' => 'event', 'post_title' => 'Event' ) );
		update_post_meta( $id, 'rsvp_url', $rsvp_url );
		return $id;
	}

	/* ---------------------------------------------------------------------
	 * 1. Shared helper
	 * ------------------------------------------------------------------ */

	public function test_safe_url_keeps_allowlisted_schemes() {
		$this->assertSame( 'https://example.org/path?a=1&b=2', progressnow_safe_url( 'https://example.org/path?a=1&b=2' ) );
		$this->assertSame( 'http://example.org/', progressnow_safe_url( 'http://example.org/' ) );
		$this->assertSame( 'mailto:hi@example.org', progressnow_safe_url( 'mailto:hi@example.org' ) );
		$this->assertSame( 'tel:+15555550100', progressnow_safe_url( 'tel:+15555550100' ) );
		// Relative + scheme-relative link targets survive (resolved as http).
		$this->assertSame( '/calendar/', progressnow_safe_url( '/calendar/' ) );
		$this->assertSame( '//cdn.example.org/x.png', progressnow_safe_url( '//cdn.example.org/x.png' ) );
	}

	public function test_safe_url_drops_dangerous_schemes() {
		foreach ( $this->hostile_urls() as $url ) {
			$this->assertSame( '', progressnow_safe_url( $url ), "should drop: {$url}" );
		}
		$this->assertSame( '', progressnow_safe_url( 'ftp://example.org/file' ) );
	}

	public function test_safe_url_empty_and_non_string_in_gives_empty_out() {
		$this->assertSame( '', progressnow_safe_url( '' ) );
		$this->assertSame( '', progressnow_safe_url( '   ' ) );
		$this->assertSame( '', progressnow_safe_url( null ) );
		$this->assertSame( '', progressnow_safe_url( false ) );
		$this->assertSame( '', progressnow_safe_url( array( 'https://example.org' ) ) );
	}

	public function test_safe_url_escapes_html_metacharacters() {
		$url = progressnow_safe_url( 'https://example.org/?q="><script>alert(1)</script>' );
		$this->assertStringStartsWith( 'https://example.org/', $url );
		$this->assertStringNotContainsString( '<', $url );
		$this->assertStringNotContainsString( '>', $url );
		$this->assertStringNotContainsString( '"', $url );
	}

	/* ---------------------------------------------------------------------
	 * 2. Video block: url + transcriptUrl
	 * ------------------------------------------------------------------ */

	public function test_video_hostile_transcript_url_is_omitted() {
		foreach ( $this->hostile_urls() as $url ) {
			$blocks = $this->blocks_for(
				$this->video_block( array( 'url' => 'https://youtu.be/abc', 'transcript_url' => $url ) )
			);
			$this->assertCount( 1, $blocks );
			$this->assertSame( 'https://youtu.be/abc', $blocks[0]['url'] );
			$this->assertArrayNotHasKey( 'transcriptUrl', $blocks[0], "should omit: {$url}" );
		}
	}

	public function test_video_hostile_url_is_dropped() {
		foreach ( $this->hostile_urls() as $url ) {
			$blocks = $this->blocks_for( $this->video_block( array( 'url' => $url ) ) );
			$this->assertSame( '', $blocks[0]['url'], "should drop: {$url}" );
		}
	}

	public function test_video_safe_urls_pass_through() {
		$blocks = $this->blocks_for(
			$this->video_block( array( 'url' => 'https://youtu.be/abc', 'transcript_url' => 'https://example.org/t.pdf' ) )
		);
		$this->assertSame( 'https://youtu.be/abc', $blocks[0]['url'] );
		$this->assertSame( 'https://example.org/t.pdf', $blocks[0]['transcriptUrl'] );
	}

	/* ---------------------------------------------------------------------
	 * 3. core/image regex-fallback src
	 * ------------------------------------------------------------------ */

	public function test_image_hostile_fallback_src_is_dropped() {
		foreach ( $this->hostile_urls() as $url ) {
			$src    = esc_attr( $url );
			$blocks = $this->blocks_for(
				"<!-- wp:image -->\n<figure class=\"wp-block-image\"><img src=\"{$src}\" alt=\"Alt\"/></figure>\n<!-- /wp:image -->"
			);
			$this->assertCount( 1, $blocks );
			$this->assertNull( $blocks[0]['image']['src'], "should drop: {$url}" );
		}
	}

	public function test_image_safe_fallback_src_survives() {
		$blocks = $this->blocks_for(
			"<!-- wp:image -->\n<figure class=\"wp-block-image\"><img src=\"https://example.org/a.jpg?w=1&amp;h=2\" alt=\"Alt\"/></figure>\n<!-- /wp:image -->"
		);
		$this->assertSame( 'https://example.org/a.jpg?w=1&h=2', $blocks[0]['image']['src'] );
	}

	/* ---------------------------------------------------------------------
	 * 4. Archive pagination (REQUEST_URI-derived)
	 * ------------------------------------------------------------------ */

	public function test_pagination_urls_are_escaped_against_request_uri_injection() {
		$post = get_post( $this->make_post( '<p>x</p>' ) );
		add_filter(
			'posts_pre_query',
			function ( $pre, $query ) use ( $post ) {
				return 'post' === $query->get( 'post_type' ) ? array( $post ) : $pre;
			},
			10,
			2
		);

		$_SERVER['REQUEST_URI'] = '/blog/page/2/?x="><script>alert(1)</script>';
		set_query_var( 'paged', 2 );

		$context = progressnow_blog_archive_context( array() );

		$this->assertNotEmpty( $context['archive_pagination']['newerUrl'] );
		foreach ( $context['archive_pagination'] as $key => $url ) {
			$this->assertStringNotContainsString( '<', $url, $key );
			$this->assertStringNotContainsString( '>', $url, $key );
			$this->assertStringNotContainsString( '"', $url, $key );
			$this->assertMatchesRegularExpression( '#^https?://#', $url, $key );
		}
	}

	/* ---------------------------------------------------------------------
	 * 5. Event rsvpUrl — chapter-event + single-event serializers
	 * ------------------------------------------------------------------ */

	public function test_event_hostile_rsvp_url_is_dropped_in_both_serializers() {
		foreach ( $this->hostile_urls() as $url ) {
			$id = $this->make_event( $url );

			$chapter = progressnow_event_to_chapter_event( $id );
			$this->assertArrayNotHasKey( 'rsvpUrl', $chapter, "chapter should omit: {$url}" );

			$single = progressnow_event_to_single( $id );
			$this->assertSame( '', $single['rsvpUrl'], "single should drop: {$url}" );
		}
	}

	public function test_event_safe_rsvp_url_survives() {
		$id = $this->make_event( 'https://actionnetwork.org/events/x?a=1&b=2' );

		$this->assertSame( 'https://actionnetwork.org/events/x?a=1&b=2', progressnow_event_to_chapter_event( $id )['rsvpUrl'] );
		$this->assertSame( 'https://actionnetwork.org/events/x?a=1&b=2', progressnow_event_to_single( $id )['rsvpUrl'] );
	}

	/* ---------------------------------------------------------------------
	 * 6. Sweep: action-callout buttons, page link rows, option URLs
	 * ------------------------------------------------------------------ */

	public function test_action_callout_hostile_button_url_is_dropped() {
		$attrs  = wp_json_encode(
			array(
				'name' => 'progressnow/action-callout',
				'data' => array(
					'heading' => 'Act',
					'body'    => 'Now',
					'buttons' => array(
						array( 'label' => 'Bad', 'url' => 'javascript:alert(1)', 'style' => 'primary' ),
						array( 'label' => 'Good', 'url' => 'https://example.org/act', 'style' => 'primary' ),
					),
				),
				'mode' => 'preview',
			)
		);
		$blocks = $this->blocks_for( "<!-- wp:progressnow/action-callout {$attrs} /-->" );
		$urls   = array_column( $blocks[0]['buttons'], 'url' );

		$this->assertContains( 'https://example.org/act', $urls );
		$this->assertNotContains( 'javascript:alert(1)', $urls );
		foreach ( $urls as $url ) {
			$this->assertStringNotContainsString( 'javascript:', $url );
		}
	}

	public function test_page_link_row_hostile_url_is_dropped() {
		$this->assertNull( progressnow_pages_link_row( array( 'label' => 'x', 'url' => 'javascript:alert(1)' ) ) );
		$row = progressnow_pages_link_row( array( 'label' => 'x', 'url' => 'https://example.org/' ) );
		$this->assertSame( 'https://example.org/', $row['url'] );
		// Anchors + relative paths (the shipped defaults) survive.
		$this->assertSame( '#join', progressnow_pages_link_row( array( 'label' => 'x', 'url' => '#join' ) )['url'] );
	}

	public function test_option_join_url_hostile_value_falls_back_to_empty() {
		update_option( 'options_join_url', 'javascript:alert(1)' );
		$this->assertSame( '', progressnow_chapter_join_url() );

		update_option( 'options_join_url', 'https://actionnetwork.org/forms/join' );
		$this->assertSame( 'https://actionnetwork.org/forms/join', progressnow_chapter_join_url() );
	}

	/* ---------------------------------------------------------------------
	 * 7. Content audit scanner
	 * ------------------------------------------------------------------ */

	public function test_audit_reports_stored_unsafe_urls_only() {
		$ids       = array();
		$ids[]     = $video_bad = $this->make_post(
			$this->video_block( array( 'url' => 'https://youtu.be/ok', 'transcript_url' => 'javascript:alert(1)' ) )
		);
		$ids[]     = $this->make_post( $this->video_block( array( 'url' => 'https://youtu.be/ok', 'transcript_url' => 'https://example.org/t.pdf' ) ) );
		$ids[]     = $image_bad = $this->make_post(
			"<!-- wp:image -->\n<figure class=\"wp-block-image\"><img src=\"data:text/html,x\" alt=\"Alt\"/></figure>\n<!-- /wp:image -->"
		);
		$ids[]     = $event_bad = $this->make_event( 'vbscript:msgbox(1)' );
		$ids[]     = $this->make_event( 'https://example.org/rsvp' );
		update_option( 'options_instagram_url', 'javascript:alert(2)' );
		update_option( 'options_facebook_url', 'https://facebook.com/chapter' );

		// WP_Query SQL returns nothing under WorDBless; hand the scanner the posts.
		$findings = progressnow_audit_unsafe_urls( array_map( 'get_post', $ids ) );
		$keys     = array_map(
			function ( $f ) {
				return $f['where'] . '|' . $f['id'] . '|' . $f['field'];
			},
			$findings
		);

		$this->assertContains( "block:progressnow/video|{$video_bad}|attrs.data.transcript_url", $keys );
		$this->assertContains( "block:core/image|{$image_bad}|innerHTML.img.src", $keys );
		$this->assertContains( "meta|{$event_bad}|rsvp_url", $keys );
		$this->assertContains( 'option|0|instagram_url', $keys );
		$this->assertCount( 4, $findings );
	}
}
