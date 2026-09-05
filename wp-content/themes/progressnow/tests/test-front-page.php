<?php
/**
 * Home page (v3 brand): the ACF-backed copy providers in inc/options.php must
 * expose the shape views/front-page.twig consumes, the template must declare
 * only the five v3 sections, and no `v3-` token namespace may survive — the
 * brand values live on the theme's semantic tokens (src/css/tailwind.css).
 */

use WorDBless\BaseTestCase;

class TestFrontPage extends BaseTestCase {

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();
	}

	public function tear_down() {
		parent::tear_down();
	}

	/** Hero: subhead + dashed-box CTA defaults; the SEO lede is untouched; no
	 * heading/badge — the <h1> is the identity headline (inc/identity.php). */
	public function test_hero_defaults_carry_subhead_and_dashed_cta() {
		$hero = progressnow_front_hero( 0 );

		$this->assertArrayNotHasKey( 'heading', $hero );
		$this->assertArrayNotHasKey( 'badge', $hero );
		$this->assertSame( 'We’re fighting for the future our community deserves.', $hero['subhead'] );
		$this->assertSame( 'New member? Start with Progress Now 101. Sign up here', $hero['cta_secondary_label'] );
		$this->assertSame( '/get-involved/', $hero['cta_secondary_url'] );
		$this->assertStringContainsString( 'member-run organization', $hero['lede'] );
	}

	/** Identity fields flow into the hero copy (short name + region label). */
	public function test_hero_defaults_follow_chapter_identity() {
		update_option( 'options_chapter_short_name', 'Springfield Forward' );
		update_option( 'options_region_label', 'Springfield' );

		$hero = progressnow_front_hero( 0 );
		$who  = progressnow_front_who( 0 );

		$this->assertSame( 'We’re fighting for the future Springfield deserves.', $hero['subhead'] );
		$this->assertSame( 'New member? Start with Springfield Forward 101. Sign up here', $hero['cta_secondary_label'] );
		$this->assertStringContainsString( 'Springfield Forward', $who['heading'] );
		$this->assertStringContainsString( 'In Springfield,', $who['p1'] );
	}

	/** Who we are: three paragraphs, v3 copy, arrow-free link label. */
	public function test_who_defaults_have_three_paragraphs_and_no_arrow() {
		$who = progressnow_front_who( 0 );

		$this->assertArrayHasKey( 'p3', $who );
		$this->assertStringContainsString( 'Lorem ipsum dolor sit amet', $who['p1'] );
		$this->assertStringContainsString( 'Lorem ipsum dolor sit amet.', $who['p3'] );
		$this->assertSame( 'More about our chapter', $who['link_label'] );
		$this->assertStringContainsString( '>Progress Now<', $who['heading'] );
	}

	/** Editors may still type a trailing arrow — the shared SVG draws it now. */
	public function test_who_link_label_strips_trailing_arrow() {
		$page_id = wp_insert_post(
			array(
				'post_title'  => 'Home',
				'post_status' => 'publish',
				'post_type'   => 'page',
			)
		);
		update_post_meta( $page_id, 'who_link_label', 'Más sobre nuestro capítulo →' );

		$this->assertSame( 'Más sobre nuestro capítulo', progressnow_front_who( $page_id )['link_label'] );
	}

	/** The dead v2 providers are gone and the front-page filter no longer
	 * injects their keys. (Asserted on source + function table: WorDBless
	 * restores $wp_filter between tests, so theme filters can't be applied.) */
	public function test_front_page_context_has_no_dead_v2_providers() {
		foreach ( array( 'progressnow_front_involved', 'progressnow_front_about_image', 'progressnow_chapter_counties' ) as $fn ) {
			$this->assertFalse( function_exists( $fn ), "$fn still defined" );
		}

		$options = (string) file_get_contents( dirname( __DIR__ ) . '/inc/options.php' );
		foreach ( array( 'counties', 'show_counties_strip', 'about_image', 'home_involved' ) as $dead ) {
			$this->assertStringNotContainsString( "\$context['" . $dead . "']", $options, "$dead still injected" );
		}
		$this->assertStringContainsString( "function progressnow_options_front_page_context( \$context, \$timber_post = null )", $options );
	}

	/** Brand tokens are the semantic set — no `v3-` namespaced utilities/vars remain. */
	public function test_no_v3_token_namespace_left() {
		$root  = dirname( __DIR__ );
		$files = array_merge(
			glob( $root . '/views/*.twig' ),
			glob( $root . '/views/partials/*.twig' ),
			glob( $root . '/src/css/*.css' ),
			glob( $root . '/src/components/site/*.vue' ),
			glob( $root . '/src/composables/*.ts' )
		);
		foreach ( $files as $file ) {
			$this->assertDoesNotMatchRegularExpression( '/(?:--color-|--font-|bg-|text-|border-|fill-|font-)v3-/', (string) file_get_contents( $file ), basename( $file ) . ' still uses a v3- token' );
		}
	}

	/** Template source: five v4 sections, no removed band, toned bands.
	 * (Asserted on the Twig source — a full Timber render needs the WP/Timber
	 * runtime hooks WorDBless strips between tests.) */
	public function test_template_declares_v3_sections_only() {
		$twig = (string) file_get_contents( dirname( __DIR__ ) . '/views/front-page.twig' );

		foreach ( array( 'home-hero', 'who-we-are', 'upcoming-events', 'from-the-blog', 'closing-cta' ) as $section ) {
			$this->assertStringContainsString( 'class="' . $section, $twig, "missing $section" );
		}
		$this->assertStringNotContainsString( 'counties-strip', $twig );
		$this->assertStringNotContainsString( 'get-involved-steps', $twig );
		$this->assertStringNotContainsString( 'home_involved', preg_replace( '/\{#.*?#\}/s', '', $twig ) );

		$this->assertStringNotContainsString( 'ponte-trucha', $twig );

		// The <h1> is the identity headline as real text (`.hero-headline`); the
		// v3 artwork override is gone (progress-now-v4-home D3). The closing CTA
		// line is the editor's `cta.line`, uppercased by CSS only.
		$this->assertStringNotContainsString( 'hero_headline_image', $twig );
		$this->assertMatchesRegularExpression( '#<h1 class="hero-headline">\{\{ identity\.hero_headline \}\}</h1>#', $twig );
		$this->assertStringNotContainsString( 'hero-headline.svg', $twig );
		$this->assertStringNotContainsString( 'county-map', $twig );
		$this->assertStringNotContainsString( 'Ponte trucha', $twig );
		$this->assertSame( 2, substr_count( $twig, '{{ cta.line }}' ), 'cta.line renders in both CTA compositions' );
		$this->assertMatchesRegularExpression( '#font-brush[^"]*uppercase#', $twig );

		// Every band declares a tone for high-contrast mode.
		$this->assertSame( 0, preg_match_all( '#<section(?![^>]*data-tone=)[^>]*>#', $twig ), 'section without data-tone' );

		// Page CSS lives in src/css/tailwind.css, never inline in the view.
		$this->assertStringNotContainsString( '<style', $twig );
	}
}
