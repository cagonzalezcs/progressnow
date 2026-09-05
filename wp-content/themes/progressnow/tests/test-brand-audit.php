<?php
/**
 * Brand audit (chapter-neutral-branding): nothing the theme ships — source,
 * shipped assets, seed content (EN + ES), rendered contexts, the ICS feed, the
 * SEO head — may reference the previous chapter's region.
 *
 * The seed's Spanish copy is asserted to still be Spanish: the scrub rewrites
 * regional mentions, it does not drop translations.
 */

use WorDBless\BaseTestCase;

class TestBrandAudit extends BaseTestCase {

	/** Regional tokens that must not appear anywhere visible. */
	const PATTERN = '/rio\s+grande|r[ií]o\s+grande|\brgv\b|rgv-dsa|rgvdsa|dsargv|dsa_rgv|dsa-rgv|\bhidalgo\b|\bwillacy\b|mcallen|brownsville|harlingen|edinburg|weslaco|\bpharr\b|utrgv|\(956\)|\b956 mask\b|\bdsa\b|democratic socialis|socialis[mt]|dsausa|ydsa/iu';

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();
	}

	/** Every file the theme ships (minus dependencies + this audit). */
	private function shipped_files() {
		$root  = dirname( __DIR__ );
		$files = array();

		$dirs = array( 'inc', 'views', 'bin', 'blocks', 'page-templates', 'src', 'tests', 'static/images' );
		foreach ( $dirs as $dir ) {
			$iterator = new RecursiveIteratorIterator(
				new RecursiveCallbackFilterIterator(
					new RecursiveDirectoryIterator( $root . '/' . $dir, FilesystemIterator::SKIP_DOTS ),
					static function ( $current ) {
						return ! in_array( $current->getFilename(), array( 'node_modules', 'vendor', 'wordpress', 'dist', '.idea' ), true );
					}
				)
			);
			foreach ( $iterator as $file ) {
				if ( $file->isFile() && preg_match( '/\.(php|twig|vue|ts|css|json|md|svg|txt)$/', $file->getFilename() ) ) {
					$files[] = $file->getPathname();
				}
			}
		}

		foreach ( array( 'style.css', 'humans.txt', 'README.md', 'functions.php' ) as $top ) {
			$files[] = $root . '/' . $top;
		}

		return array_filter( $files, static function ( $path ) {
			return false === strpos( $path, 'test-brand-audit.php' );
		} );
	}

	public function test_shipped_files_are_free_of_regional_tokens() {
		$hits = array();
		foreach ( $this->shipped_files() as $path ) {
			$contents = (string) file_get_contents( $path );
			foreach ( explode( "\n", $contents ) as $i => $line ) {
				if ( preg_match( self::PATTERN, $line ) ) {
					$hits[] = str_replace( dirname( __DIR__ ) . '/', '', $path ) . ':' . ( $i + 1 ) . '  ' . trim( mb_substr( $line, 0, 120 ) );
				}
			}
		}

		$this->assertSame( array(), $hits, "Regional tokens shipped:\n" . implode( "\n", $hits ) );
	}

	public function test_no_regional_artwork_ships() {
		$brand = dirname( __DIR__ ) . '/static/images/brand';
		foreach ( array( 'county-map.svg', 'hero-headline.svg' ) as $gone ) {
			$this->assertFileDoesNotExist( $brand . '/' . $gone );
		}
		foreach ( array( 'logo-square.png', 'share-default.jpg', 'hero-photo.jpg', 'who-photo.jpg', 'cta-panel.svg', 'flames-tile-light.png', 'star.svg', 'star-notch.svg', 'sparkle.svg' ) as $placeholder ) {
			$this->assertFileExists( $brand . '/' . $placeholder );
		}
		// v3-only artwork removed by progress-now-v4-foundation-chrome (the logo is the wordmark lockup).
		foreach ( array( 'logo-header.svg', 'logo-footer.svg', 'feature-art.svg', 'flames-tile.svg', 'flames-full.svg', 'hero-photo@2x.jpg' ) as $gone ) {
			$this->assertFileDoesNotExist( $brand . '/' . $gone );
		}
		$this->assertDirectoryDoesNotExist( dirname( __DIR__ ) . '/static/images/logos' );
	}

	public function test_default_contexts_are_neutral() {
		$about_id = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'About', 'post_name' => 'about' ) );
		$gi_id    = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Get involved', 'post_name' => 'get-involved' ) );

		$samples = array(
			'identity'   => progressnow_identity(),
			'hero'       => progressnow_front_hero( 0 ),
			'who'        => progressnow_front_who( 0 ),
			'newhere'    => progressnow_newhere_card(),
			'committees' => progressnow_chapter_committees(),
			'about'      => progressnow_about_context( $about_id ),
			'gi'         => progressnow_get_involved_context( $gi_id, '/get-involved/#join' ),
			'strings'    => progressnow_i18n_strings(),
			'menus'      => progressnow_i18n_header_menus(),
		);

		foreach ( $samples as $name => $value ) {
			$json = wp_json_encode( $value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
			$this->assertDoesNotMatchRegularExpression( self::PATTERN, $json, "{$name} context carries a regional token" );
		}

		$this->assertSame( 'Progress Now', $samples['identity']['name'] );
		$this->assertSame( 'A better world is possible!', $samples['identity']['hero_headline'] );
		$this->assertStringContainsString( 'who-photo.jpg', $samples['identity']['who_image']['src'] );
		$this->assertSame( '', $samples['identity']['logo_header']['src'] );
		$this->assertTrue( $samples['identity']['logo_header']['is_default'] );
	}

	public function test_ics_feed_is_neutral_and_named_after_the_chapter() {
		$ics = progressnow_events_build_ics();

		$this->assertStringContainsString( 'X-WR-CALNAME:Progress Now Events', $ics );
		$this->assertStringContainsString( 'PRODID:-//Progress Now//Events//EN', $ics );
		$this->assertDoesNotMatchRegularExpression( self::PATTERN, $ics );
	}

	public function test_ics_feed_follows_chapter_name() {
		update_option( 'options_chapter_name', 'Springfield Forward' );

		$ics = progressnow_events_build_ics();

		$this->assertStringContainsString( 'X-WR-CALNAME:Springfield Forward Events', $ics );
	}

	public function test_legacy_feed_slugs_redirect_to_canonical() {
		$this->assertSame( array( 'progressnow-events' ), progressnow_events_legacy_feed_slugs() );
		$this->assertTrue( function_exists( 'progressnow_events_redirect_legacy_feed' ) );
		// WorDBless has no pretty permalinks (?feed=…); the slug is what matters.
		$this->assertStringContainsString( 'chapter-events', get_feed_link( 'chapter-events' ) );
	}

	public function test_seed_spanish_copy_is_still_spanish() {
		$seed = (string) file_get_contents( dirname( __DIR__ ) . '/bin/seed.php' );

		foreach ( array( 'Únete', 'Dónde estamos', '¡Un mundo mejor es posible!', 'Sobre el capítulo', 'Calendario de eventos' ) as $spanish ) {
			$this->assertStringContainsString( $spanish, $seed );
		}
		$this->assertDoesNotMatchRegularExpression( self::PATTERN, $seed );
	}
}
