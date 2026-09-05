<?php
/**
 * About / Get Involved page contexts (inc/pages.php): design-copy fallbacks,
 * kses'd rich prose, external-URL detection, repeater row dropping, section
 * visibility tri-state, and the PHP-computed on-this-page nav arrays.
 *
 * ACF reads go through the bootstrap get_field() polyfill (post meta), so
 * scenarios drive fields with update_post_meta().
 */

use WorDBless\BaseTestCase;

class TestPages extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();
	}

	private function make_page( $slug ) {
		return (int) wp_insert_post(
			array(
				'post_type'   => 'page',
				'post_status' => 'publish',
				'post_title'  => ucwords( str_replace( '-', ' ', $slug ) ),
				'post_name'   => $slug,
			)
		);
	}

	/* ---- Design-copy fallbacks ---- */

	public function test_about_context_falls_back_to_design_copy() {
		$about = progressnow_about_context( $this->make_page( 'about' ) );

		$this->assertSame( 'About the Chapter', $about['chapter']['heading'] );
		$this->assertSame( 'Mission & History', $about['history']['heading'] );
		$this->assertNull( $about['chapter']['photo'] );
		$this->assertCount( 3, $about['chapter']['ctas'] );
		$this->assertCount( 3, $about['history']['timeline'] );
		$this->assertCount( 4, $about['counties']['cards'] );
		$this->assertCount( 4, $about['governance']['docs'] );
		$this->assertCount( 6, $about['faq']['rows'] );
		$this->assertSame( 'Join a committee', $about['committees']['link']['label'] );
		$this->assertSame( '/get-involved/#committees', $about['committees']['link']['url'] );
		$this->assertFalse( $about['committees']['link']['external'] );

		foreach ( array( 'mission', 'chapter', 'history', 'counties', 'committees', 'governance', 'faq', 'dues' ) as $section ) {
			$this->assertTrue( $about[ $section ]['visible'], "{$section} defaults to visible" );
		}

		$this->assertSame(
			array( '#chapter', '#mission', '#counties', '#committees', '#bylaws', '#faq' ),
			array_column( $about['nav'], 'href' )
		);
	}

	public function test_get_involved_context_falls_back_to_design_copy() {
		$join = '/get-involved/#join';
		$gi   = progressnow_get_involved_context( $this->make_page( 'get-involved' ), $join );

		$this->assertSame( 'How to join', $gi['join']['heading'] );
		$this->assertCount( 3, $gi['join']['steps'] );
		$this->assertSame( 'Committees', $gi['committees']['heading'] );
		$this->assertSame( 'Communication channels', $gi['channels']['heading'] );
		// No social profile configured → WhatsApp + Email only (no placeholder handle).
		$this->assertCount( 2, $gi['channels']['items'] );
		$this->assertSame( array( 'WhatsApp', 'Email' ), array_column( $gi['channels']['items'], 'label' ) );
		$this->assertSame( 'Common questions', $gi['faq']['heading'] );
		$this->assertCount( 5, $gi['faq']['items'] );
		$this->assertSame( $join, $gi['card']['url'] );
		$this->assertFalse( $gi['card']['external'] );
		$this->assertSame(
			array( 'Event Calendar', 'Bylaws & Code of Conduct', 'Mission & History' ),
			array_column( $gi['related'], 'label' )
		);
		$this->assertSame(
			array( '#join', '#committees', '#channels', '#faq' ),
			array_column( $gi['nav'], 'href' )
		);
	}

	/** The Instagram channel card appears only once the chapter configures its URL. */
	public function test_instagram_channel_renders_only_when_configured() {
		update_option( 'options_instagram_url', 'https://instagram.com/example-chapter' );

		$items = progressnow_get_involved_context( $this->make_page( 'get-involved' ), 'https://join.test' )['channels']['items'];

		$this->assertCount( 3, $items );
		$this->assertSame( 'Instagram', $items[1]['label'] );
		$this->assertSame( 'https://instagram.com/example-chapter', $items[1]['url'] );
		$this->assertTrue( $items[1]['external'] );
	}

	/* ---- Kses on rich prose ---- */

	public function test_rich_fields_keep_links_and_strip_disallowed_markup() {
		$id = $this->make_page( 'about' );
		update_post_meta( $id, 'about_history_body', '<p>Read <a href="/bylaws/" onclick="steal()">the bylaws</a>.</p><script>alert(1)</script>' );

		$body = progressnow_about_context( $id )['history']['body'];

		$this->assertStringContainsString( '<a href="/bylaws/">', $body );
		$this->assertStringContainsString( '<p>', $body );
		$this->assertStringNotContainsString( '<script', $body );
		$this->assertStringNotContainsString( 'onclick', $body );
	}

	public function test_plain_text_legacy_values_pass_through_unchanged() {
		$id = $this->make_page( 'about' );
		update_post_meta( $id, 'about_intro_p1', 'Plain paragraph saved before the WYSIWYG swap.' );

		$this->assertSame(
			'Plain paragraph saved before the WYSIWYG swap.',
			progressnow_about_context( $id )['chapter']['p1']
		);
	}

	/* ---- External-URL detection ---- */

	public function test_external_url_detection() {
		$this->assertFalse( progressnow_pages_external( '/calendar/' ) );
		$this->assertFalse( progressnow_pages_external( '#committees' ) );
		$this->assertFalse( progressnow_pages_external( 'mailto:hello@example.org' ) );
		$this->assertFalse( progressnow_pages_external( home_url( '/about/' ) ) );
		$this->assertTrue( progressnow_pages_external( 'https://join.example.com/' ) );
	}

	/* ---- Repeater row dropping + empty fallback ---- */

	public function test_related_links_rows_missing_label_or_url_are_dropped() {
		$id = $this->make_page( 'get-involved' );
		update_post_meta( $id, 'gi_related_links', array(
			array( 'label' => 'Kept', 'url' => '/kept/' ),
			array( 'label' => '', 'url' => '/no-label/' ),
			array( 'label' => 'No URL', 'url' => '' ),
		) );

		$related = progressnow_get_involved_context( $id, 'https://join.test' )['related'];

		$this->assertCount( 1, $related );
		$this->assertSame( 'Kept', $related[0]['label'] );
		$this->assertFalse( $related[0]['external'] );
	}

	public function test_related_links_all_invalid_falls_back_to_defaults() {
		$id = $this->make_page( 'get-involved' );
		update_post_meta( $id, 'gi_related_links', array(
			array( 'label' => '', 'url' => '' ),
		) );

		$related = progressnow_get_involved_context( $id, 'https://join.test' )['related'];

		$this->assertCount( 3, $related );
		$this->assertSame( 'Event Calendar', $related[0]['label'] );
	}

	/* ---- Visibility tri-state + nav filtering ---- */

	public function test_visibility_tri_state() {
		$id = $this->make_page( 'about' );

		$this->assertTrue( progressnow_pages_visible( $id, 'about_show_history' ), 'unset meta reads visible' );

		update_post_meta( $id, 'about_show_history', '' );
		$this->assertTrue( progressnow_pages_visible( $id, 'about_show_history' ), 'empty meta reads visible' );

		update_post_meta( $id, 'about_show_history', '0' );
		$this->assertFalse( progressnow_pages_visible( $id, 'about_show_history' ) );

		update_post_meta( $id, 'about_show_history', '1' );
		$this->assertTrue( progressnow_pages_visible( $id, 'about_show_history' ) );
	}

	public function test_hidden_section_drops_out_of_nav() {
		$id = $this->make_page( 'about' );
		update_post_meta( $id, 'about_show_history', '0' );

		$about = progressnow_about_context( $id );

		$this->assertFalse( $about['history']['visible'] );
		$hrefs = array_column( $about['nav'], 'href' );
		$this->assertNotContains( '#mission', $hrefs );
		$this->assertContains( '#chapter', $hrefs );
		$this->assertCount( 5, $about['nav'] );
	}

	public function test_nav_labels_track_edited_headings() {
		$id = $this->make_page( 'get-involved' );
		update_post_meta( $id, 'gi_faq_heading', 'Questions?' );

		$gi = progressnow_get_involved_context( $id, 'https://join.test' );

		$this->assertSame( 'Questions?', $gi['faq']['heading'] );
		$this->assertContains( 'Questions?', array_column( $gi['nav'], 'label' ) );
	}

	public function test_nav_empty_when_all_sections_hidden() {
		$id = $this->make_page( 'get-involved' );
		foreach ( array( 'gi_show_join', 'gi_show_committees', 'gi_show_channels', 'gi_show_faq' ) as $field ) {
			update_post_meta( $id, $field, '0' );
		}

		$this->assertSame( array(), progressnow_get_involved_context( $id, 'https://join.test' )['nav'] );
	}

	/* ---- ACF location: template OR slug (editor parity with the slug-gated render) ---- */

	public function test_pages_location_matches_template_or_slug() {
		$location = progressnow_pages_location( 'page-templates/about.php', 'about' );

		// Two OR'd rule groups: the page template, and the page slug.
		$this->assertCount( 2, $location );
		$this->assertSame( 'page_template', $location[0][0]['param'] );
		$this->assertSame( 'page-templates/about.php', $location[0][0]['value'] );
		$this->assertSame( 'page_slug', $location[1][0]['param'] );
		$this->assertSame( 'about', $location[1][0]['value'] );
	}

	public function test_page_slug_location_rule_matches_post_name() {
		$id   = $this->make_page( 'about' );
		$rule = array(
			'param'    => 'page_slug',
			'operator' => '==',
			'value'    => 'about',
		);

		$this->assertTrue(
			progressnow_pages_slug_match( false, $rule, array( 'post_id' => $id ) )
		);

		$rule['value'] = 'get-involved';
		$this->assertFalse(
			progressnow_pages_slug_match( false, $rule, array( 'post_id' => $id ) )
		);
	}

	public function test_page_slug_location_rule_honors_not_equal_and_missing_post() {
		$id   = $this->make_page( 'about' );
		$rule = array(
			'param'    => 'page_slug',
			'operator' => '!=',
			'value'    => 'about',
		);

		// "!= about" on the About page → no match.
		$this->assertFalse(
			progressnow_pages_slug_match( false, $rule, array( 'post_id' => $id ) )
		);

		// No post_id in the screen args → never matches.
		$rule['operator'] = '==';
		$this->assertFalse(
			progressnow_pages_slug_match( false, $rule, array() )
		);
	}
}
