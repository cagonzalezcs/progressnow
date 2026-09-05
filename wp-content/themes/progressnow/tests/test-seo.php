<?php
/**
 * SEO head output (inc/seo.php): description ladder, canonical, robots,
 * OG completeness, JSON-LD per surface.
 *
 * Conditional contexts are faked by swapping $GLOBALS['wp_query'] for a
 * WP_Query with the right flags + queried object (no go_to() in WorDBless).
 * ACF reads go through the bootstrap get_field() polyfill (post meta /
 * options_{name}).
 */

use WorDBless\BaseTestCase;

class TestSeo extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		update_option( 'blog_public', 1 );
		update_option( 'blogname', 'Progress Now' );
		update_option( 'blogdescription', 'Organizing our community.' );
	}

	public function tear_down() {
		$_GET = array();
		parent::tear_down();
	}

	/**
	 * Swap in a WP_Query with the given flags/queried object.
	 *
	 * @param array        $flags   is_* flags to set true.
	 * @param WP_Post|null $queried Queried object.
	 */
	private function fake_query( array $flags = array(), $queried = null ) {
		$query = new WP_Query();
		foreach ( $flags as $flag ) {
			$query->$flag = true;
		}
		if ( $queried ) {
			$query->queried_object    = $queried;
			$query->queried_object_id = (int) $queried->ID;
		}
		$GLOBALS['wp_query']     = $query;
		$GLOBALS['wp_the_query'] = $query;

		return $query;
	}

	private function make_post( array $args = array() ) {
		$id = wp_insert_post(
			wp_parse_args(
				$args,
				array(
					'post_title'   => 'Test post',
					'post_status'  => 'publish',
					'post_type'    => 'post',
					'post_content' => 'Body copy for the post.',
				)
			)
		);

		return get_post( $id );
	}

	private function view_post( array $post_args = array(), array $flags = array( 'is_singular', 'is_single' ) ) {
		$post = $this->make_post( $post_args );
		$this->fake_query( $flags, $post );

		return $post;
	}

	private function view_page( array $post_args = array() ) {
		update_option( 'show_on_front', 'page' );

		return $this->view_post(
			wp_parse_args( $post_args, array( 'post_type' => 'page', 'post_title' => 'Test page' ) ),
			array( 'is_singular', 'is_page' )
		);
	}

	/** Posts page context: is_home with a page_for_posts page. */
	private function view_posts_page( array $post_args = array() ) {
		update_option( 'show_on_front', 'page' );
		$page = $this->make_post( wp_parse_args( $post_args, array( 'post_type' => 'page', 'post_title' => 'Blog' ) ) );
		update_option( 'page_for_posts', $page->ID );
		$this->fake_query( array( 'is_home' ) );

		return $page;
	}

	private function head_output() {
		ob_start();
		progressnow_seo_head();

		return ob_get_clean();
	}

	private function meta_content( $html, $attr, $name ) {
		if ( preg_match( '#<meta ' . $attr . '="' . preg_quote( $name, '#' ) . '" content="([^"]*)">#', $html, $m ) ) {
			return $m[1];
		}

		return null;
	}

	private function json_ld( $html ) {
		$this->assertSame( 1, preg_match_all( '#<script type="application/ld\+json">(.*?)</script>#s', $html, $m ), 'exactly one JSON-LD script' );
		$data = json_decode( $m[1][0], true );
		$this->assertIsArray( $data, 'JSON-LD decodes' );

		return $data;
	}

	/* ---------------------------------------------------------------------
	 * Description ladder.
	 * ------------------------------------------------------------------ */

	public function test_post_description_uses_dek() {
		$post = $this->view_post();
		update_post_meta( $post->ID, 'dek', 'The dek line for this post.' );

		$this->assertSame( 'The dek line for this post.', progressnow_seo_description() );
	}

	public function test_post_description_falls_back_to_excerpt() {
		$this->view_post( array( 'post_excerpt' => 'The excerpt copy.' ) );

		$this->assertSame( 'The excerpt copy.', progressnow_seo_description() );
	}

	public function test_page_ladder_seo_description_then_lede_then_tagline() {
		$page = $this->view_page();
		$this->assertSame( 'Organizing our community.', progressnow_seo_description() );

		update_post_meta( $page->ID, 'lede', 'The page lede.' );
		$this->assertSame( 'The page lede.', progressnow_seo_description() );

		update_post_meta( $page->ID, 'seo_description', 'Hand-written search description.' );
		$this->assertSame( 'Hand-written search description.', progressnow_seo_description() );
	}

	public function test_posts_page_description_uses_its_lede() {
		$page = $this->view_posts_page();
		update_post_meta( $page->ID, 'lede', 'News and analysis from the chapter.' );

		$this->assertSame( 'News and analysis from the chapter.', progressnow_seo_description() );
	}

	public function test_front_page_description_uses_hero_lede_fallback() {
		update_option( 'show_on_front', 'posts' );
		$this->fake_query( array( 'is_home' ) );

		// No seeded hero → progressnow_front_hero() design-copy lede, trimmed.
		$description = progressnow_seo_description();
		$this->assertStringContainsString( 'member-run organization', $description );
		$this->assertLessThanOrEqual( 156, mb_strlen( $description ) );
	}

	public function test_empty_tagline_falls_back_to_hero_design_copy() {
		update_option( 'blogdescription', '' );
		$this->view_page();

		$description = progressnow_seo_description();
		$this->assertNotSame( '', $description );
		$this->assertStringContainsString( 'member-run organization', $description );
	}

	public function test_event_description_from_content() {
		$this->view_post(
			array(
				'post_type'    => 'event',
				'post_content' => '<p>Monthly <strong>general</strong> meeting.</p>',
			)
		);

		$this->assertSame( 'Monthly general meeting.', progressnow_seo_description() );
	}

	public function test_description_trims_on_word_boundary() {
		$post = $this->view_post();
		update_post_meta( $post->ID, 'dek', str_repeat( 'wordhere ', 40 ) );

		$description = progressnow_seo_description();
		$this->assertLessThanOrEqual( 156, mb_strlen( $description ) );
		$this->assertStringEndsWith( 'wordhere…', $description );
	}

	/* ---------------------------------------------------------------------
	 * Canonical + robots.
	 * ------------------------------------------------------------------ */

	public function test_post_canonical_is_permalink() {
		$post = $this->view_post();

		$this->assertSame( get_permalink( $post ), progressnow_seo_canonical() );
		$this->assertFalse( progressnow_seo_is_noindex() );
	}

	public function test_posts_page_canonical_is_clean_permalink() {
		$page = $this->view_posts_page();

		$this->assertSame( get_permalink( $page ), progressnow_seo_canonical() );
		$this->assertFalse( progressnow_seo_is_noindex() );
	}

	public function test_filtered_archive_canonicalizes_to_clean_url_and_noindexes() {
		$page             = $this->view_posts_page();
		$_GET['category'] = 'labor';
		$_GET['s']        = 'strike';

		$this->assertSame( get_permalink( $page ), progressnow_seo_canonical() );
		$this->assertTrue( progressnow_seo_is_noindex() );
	}

	public function test_paged_query_param_canonicalizes_to_clean_url_but_indexes() {
		$page          = $this->view_posts_page();
		$_GET['paged'] = '2';

		$this->assertSame( get_permalink( $page ), progressnow_seo_canonical() );
		$this->assertFalse( progressnow_seo_is_noindex() );
	}

	public function test_search_noindexes_and_canonicalizes_to_posts_page() {
		update_option( 'show_on_front', 'page' );
		$page = $this->make_post( array( 'post_type' => 'page', 'post_title' => 'Blog' ) );
		update_option( 'page_for_posts', $page->ID );
		$this->fake_query( array( 'is_search' ) );

		$this->assertTrue( progressnow_seo_is_noindex() );
		$this->assertSame( get_permalink( $page ), progressnow_seo_canonical() );
	}

	public function test_thin_surfaces_noindex() {
		update_option( 'show_on_front', 'page' );

		$this->fake_query( array( 'is_404' ) );
		$this->assertTrue( progressnow_seo_is_noindex() );
		$this->assertSame( '', progressnow_seo_canonical() );

		$this->fake_query( array( 'is_archive', 'is_date' ) );
		$this->assertTrue( progressnow_seo_is_noindex() );

		$this->fake_query( array( 'is_archive', 'is_author' ) );
		$this->assertTrue( progressnow_seo_is_noindex() );
	}

	public function test_robots_directives_merge_into_wp_robots() {
		$this->view_post();
		$directives = apply_filters( 'wp_robots', array() );
		$this->assertArrayNotHasKey( 'noindex', $directives );

		$this->fake_query( array( 'is_search' ) );
		$directives = apply_filters( 'wp_robots', array() );
		$this->assertTrue( $directives['noindex'] );
		$this->assertTrue( $directives['follow'] );
		$this->assertArrayNotHasKey( 'nofollow', $directives );
	}

	/* ---------------------------------------------------------------------
	 * OG / Twitter completeness.
	 * ------------------------------------------------------------------ */

	public function test_post_og_set_is_complete() {
		$post = $this->view_post( array( 'post_excerpt' => 'Share copy.' ) );
		$html = $this->head_output();

		$this->assertSame( progressnow_identity()['name'], $this->meta_content( $html, 'property', 'og:site_name' ) );
		$this->assertSame( 'article', $this->meta_content( $html, 'property', 'og:type' ) );
		$this->assertSame( 'Test post', $this->meta_content( $html, 'property', 'og:title' ) );
		$this->assertSame( 'Share copy.', $this->meta_content( $html, 'property', 'og:description' ) );
		$this->assertSame( get_permalink( $post ), $this->meta_content( $html, 'property', 'og:url' ) );
		$this->assertNotEmpty( $this->meta_content( $html, 'property', 'og:image' ) );
		$this->assertSame( 'Share copy.', $this->meta_content( $html, 'name', 'description' ) );
	}

	public function test_non_post_og_type_is_website() {
		$this->view_page();
		$html = $this->head_output();

		$this->assertSame( 'website', $this->meta_content( $html, 'property', 'og:type' ) );
	}

	public function test_imageless_post_falls_back_to_logo_and_summary_card() {
		$this->view_post();
		$html = $this->head_output();

		$this->assertStringContainsString( 'share-default.jpg', $this->meta_content( $html, 'property', 'og:image' ) );
		$this->assertSame( '1200', $this->meta_content( $html, 'property', 'og:image:width' ) );
		$this->assertSame( 'summary', $this->meta_content( $html, 'name', 'twitter:card' ) );
	}

	public function test_default_share_image_option_used_with_summary_card() {
		$att_id = wp_insert_post(
			array(
				'post_title'     => 'Share image',
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'post_mime_type' => 'image/png',
			)
		);
		update_post_meta( $att_id, '_wp_attached_file', '2026/07/share.png' );
		update_post_meta(
			$att_id,
			'_wp_attachment_metadata',
			array(
				'file'   => '2026/07/share.png',
				'width'  => 1200,
				'height' => 630,
				'sizes'  => array(),
			)
		);
		update_post_meta( $att_id, '_wp_attachment_image_alt', 'Chapter logo' );
		update_option( 'options_default_share_image', $att_id );

		$this->view_post();
		$html = $this->head_output();

		$this->assertStringContainsString( 'share.png', $this->meta_content( $html, 'property', 'og:image' ) );
		$this->assertSame( '1200', $this->meta_content( $html, 'property', 'og:image:width' ) );
		$this->assertSame( '630', $this->meta_content( $html, 'property', 'og:image:height' ) );
		$this->assertSame( 'Chapter logo', $this->meta_content( $html, 'property', 'og:image:alt' ) );
		$this->assertSame( 'summary', $this->meta_content( $html, 'name', 'twitter:card' ) );
	}

	public function test_featured_image_gets_large_card() {
		$att_id = wp_insert_post(
			array(
				'post_title'     => 'Featured',
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'post_mime_type' => 'image/png',
			)
		);
		update_post_meta( $att_id, '_wp_attached_file', '2026/07/featured.png' );
		update_post_meta(
			$att_id,
			'_wp_attachment_metadata',
			array(
				'file'   => '2026/07/featured.png',
				'width'  => 1600,
				'height' => 900,
				'sizes'  => array(),
			)
		);

		$post = $this->view_post();
		set_post_thumbnail( $post, $att_id );
		$html = $this->head_output();

		$this->assertStringContainsString( 'featured.png', $this->meta_content( $html, 'property', 'og:image' ) );
		$this->assertSame( 'summary_large_image', $this->meta_content( $html, 'name', 'twitter:card' ) );
	}

	/* ---------------------------------------------------------------------
	 * JSON-LD.
	 * ------------------------------------------------------------------ */

	public function test_organization_schema_on_every_surface() {
		$this->view_page();
		$data = $this->json_ld( $this->head_output() );

		$this->assertSame( 'https://schema.org', $data['@context'] );
		$types = array_column( $data['@graph'], '@type' );
		$this->assertSame( array( 'Organization' ), $types );

		$org = $data['@graph'][0];
		$this->assertSame( progressnow_identity()['name'], $org['name'] );
		$this->assertSame( home_url( '/' ), $org['url'] );
		$this->assertStringContainsString( 'logo-square.png', $org['logo'] );
		// No social profiles configured → no sameAs (no placeholder accounts).
		$this->assertArrayNotHasKey( 'sameAs', $org );
	}

	public function test_organization_same_as_lists_only_configured_profiles() {
		update_option( 'options_instagram_url', 'https://instagram.com/example-chapter' );
		update_option( 'options_chapter_name', 'Springfield Forward' );

		$this->view_page();
		$org = $this->json_ld( $this->head_output() )['@graph'][0];

		$this->assertSame( 'Springfield Forward', $org['name'] );
		$this->assertSame( array( 'https://instagram.com/example-chapter' ), $org['sameAs'] );
	}

	public function test_article_schema_named_byline_is_person() {
		$post = $this->view_post( array( 'post_excerpt' => 'Excerpt.' ) );
		$data = $this->json_ld( $this->head_output() );

		$this->assertCount( 2, $data['@graph'] );
		$article = $data['@graph'][1];
		$this->assertSame( 'Article', $article['@type'] );
		$this->assertSame( 'Test post', $article['headline'] );
		$this->assertSame( 'Person', $article['author']['@type'] );
		$this->assertNotEmpty( $article['datePublished'] );
		$this->assertNotEmpty( $article['dateModified'] );
		$this->assertSame( get_permalink( $post ), $article['mainEntityOfPage'] );
	}

	public function test_article_schema_committee_byline_is_organization() {
		$post = $this->view_post();
		update_post_meta( $post->ID, 'byline_mode', 'committee' );
		update_post_meta( $post->ID, 'committee', 'Labor' );

		$data    = $this->json_ld( $this->head_output() );
		$article = $data['@graph'][1];

		$this->assertSame( 'Organization', $article['author']['@type'] );
		$this->assertSame( 'Labor', $article['author']['name'] );
	}

	public function test_event_schema_carries_dates_place_and_offer() {
		$post = $this->view_post(
			array(
				'post_type'    => 'event',
				'post_title'   => 'Brake Light Clinic',
				'post_content' => 'Free brake light replacement.',
			)
		);
		update_post_meta( $post->ID, 'start_datetime', '2026-08-01 18:00:00' );
		update_post_meta( $post->ID, 'end_datetime', '2026-08-01 20:00:00' );
		update_post_meta( $post->ID, 'venue', 'Archer Park' );
		update_post_meta( $post->ID, 'city', 'Springfield' );
		update_post_meta( $post->ID, 'rsvp_url', 'https://example.org/rsvp' );

		$data  = $this->json_ld( $this->head_output() );
		$event = $data['@graph'][1];

		$this->assertSame( 'Event', $event['@type'] );
		$this->assertSame( 'Brake Light Clinic', $event['name'] );
		// Chapter-tz ISO-8601 (America/Chicago is -05:00 in August).
		$this->assertSame( '2026-08-01T18:00:00-05:00', $event['startDate'] );
		$this->assertSame( '2026-08-01T20:00:00-05:00', $event['endDate'] );
		$this->assertSame( 'Place', $event['location']['@type'] );
		$this->assertSame( 'Archer Park', $event['location']['name'] );
		$this->assertSame( 'Springfield', $event['location']['address']['addressLocality'] );
		$this->assertSame( 'https://example.org/rsvp', $event['offers']['url'] );
	}

	public function test_event_without_start_emits_organization_only() {
		$this->view_post( array( 'post_type' => 'event' ) );

		$data = $this->json_ld( $this->head_output() );
		$this->assertSame( array( 'Organization' ), array_column( $data['@graph'], '@type' ) );
	}
}
