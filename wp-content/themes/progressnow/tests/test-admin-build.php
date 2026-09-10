<?php
/**
 * Site build panel (inc/admin-build.php): the rows it renders from the build
 * state + manifest, in every configuration.
 */

use WorDBless\BaseTestCase;

class TestAdminBuild extends BaseTestCase {

	private $settings = array();

	public function set_up() {
		switch_theme( basename( dirname( __DIR__ ) ) );

		require dirname( __DIR__ ) . '/functions.php';

		do_action( 'after_setup_theme' );

		parent::set_up();

		$this->settings = array();
		$override       = function ( $value, $name ) {
			return array_key_exists( $name, $this->settings ) ? $this->settings[ $name ] : $value;
		};
		add_filter( 'progressnow/shell/setting', $override, 10, 2 );
		add_filter( 'progressnow/rebuild/setting', $override, 10, 2 );
		delete_option( 'chapter_build_state' );
	}

	private function labels( array $rows ) {
		return array_combine( array_column( $rows, 'label' ), array_column( $rows, 'value' ) );
	}

	public function test_rows_describe_an_unconfigured_islands_site() {
		// Other test files may have defined the github constants in this process.
		$this->settings['CHAPTER_REBUILD_TRANSPORT'] = 'none';
		$rows = $this->labels( progressnow_admin_build_rows( progressnow_rebuild_state(), null ) );

		$this->assertStringStartsWith( 'Idle', $rows['Status'] );
		$this->assertStringContainsString( 'degraded mode', $rows['Live build'] );
		$this->assertStringStartsWith( 'islands', $rows['Frontend'] );
		$this->assertStringStartsWith( 'none', $rows['Rebuild transport'] );
		$this->assertStringStartsWith( 'origin', $rows['Static files'] );
		$this->assertSame( '—', $rows['Last error'] );
	}

	public function test_rows_follow_state_manifest_and_configuration() {
		$this->settings['CHAPTER_FRONTEND']         = 'nuxt';
		$this->settings['CHAPTER_REBUILD_TRANSPORT'] = 'github';
		$this->settings['CHAPTER_GITHUB_REPO']       = 'owner/repo';
		$this->settings['CHAPTER_GITHUB_TOKEN']      = 'token';
		$this->settings['CHAPTER_STATIC_DIR']        = sys_get_temp_dir();

		progressnow_rebuild_update_state(
			array(
				'status'           => 'needs_attention',
				'lastError'        => 'GitHub returned 401',
				'requestId'        => 'abc123',
				'requestedVersion' => 9,
				'attempts'         => 3,
				'liveVersion'      => 7,
			)
		);
		$manifest = array(
			'buildId'           => 'build-7',
			'builtAt'           => '2026-01-01T00:00:00Z',
			'entry'             => '/_nuxt/e.js',
			'prerenderedRoutes' => 15,
		);

		$rows  = progressnow_admin_build_rows( progressnow_rebuild_state(), $manifest );
		$byKey = $this->labels( $rows );

		$this->assertStringStartsWith( 'Needs attention', $byKey['Status'] );
		$this->assertSame( 'error', $rows[0]['tone'] );
		$this->assertStringContainsString( 'live build 7', $byKey['Content version'] );
		$this->assertStringContainsString( 'build-7 (2026-01-01T00:00:00Z, 15 routes, entry /_nuxt/e.js)', $byKey['Live build'] );
		$this->assertStringContainsString( 'abc123 · v9', $byKey['Last request'] );
		$this->assertSame( 'GitHub returned 401', $byKey['Last error'] );
		$this->assertStringStartsWith( 'nuxt', $byKey['Frontend'] );
		$this->assertStringContainsString( 'github → owner/repo', $byKey['Rebuild transport'] );
		$this->assertStringStartsWith( 'same-host', $byKey['Static files'] );
	}

	/** openspec rebuild-credential-boundary § Settings may be supplied by environment: sources, never values. */
	public function test_rows_report_where_each_setting_comes_from_and_never_a_secret() {
		$this->settings['CHAPTER_REBUILD_TRANSPORT']   = 'webhook';
		$this->settings['CHAPTER_REBUILD_WEBHOOK_URL'] = 'https://www.example.org/api/rebuild';
		$this->settings['CHAPTER_FRONTEND']            = 'nuxt';
		$secret                                        = 'panel-secret-' . str_repeat( 'p', 24 );
		putenv( 'CHAPTER_REBUILD_SECRET=' . $secret );
		try {
			$rows  = progressnow_admin_build_rows( progressnow_rebuild_state(), null );
			$byKey = $this->labels( $rows );

			$this->assertSame( 'webhook → https://www.example.org/api/rebuild', $byKey['Rebuild transport'] );
			$this->assertStringContainsString( 'CHAPTER_REBUILD_TRANSPORT: filter', $byKey['Rebuild settings'] );
			$this->assertStringContainsString( 'CHAPTER_REBUILD_WEBHOOK_URL: filter', $byKey['Rebuild settings'] );
			$this->assertStringContainsString( 'CHAPTER_REBUILD_SECRET: env', $byKey['Rebuild settings'] );
			$this->assertStringContainsString( 'CHAPTER_REBUILD_SECRET_OUT: unset', $byKey['Rebuild settings'] );
			$this->assertStringContainsString( 'CHAPTER_REBUILD_SECRET_IN: unset', $byKey['Rebuild settings'] );
			$this->assertStringContainsString( 'CHAPTER_FRONTEND: filter', $byKey['Frontend settings'] );
			$this->assertStringContainsString( 'CHAPTER_STATIC_DIR: unset', $byKey['Frontend settings'] );
			$this->assertStringNotContainsString( $secret, wp_json_encode( $rows ) );
			$this->assertStringNotContainsString( $secret, wp_json_encode( progressnow_admin_build_export( progressnow_rebuild_state(), null ) ) );
		} finally {
			putenv( 'CHAPTER_REBUILD_SECRET' );
		}
	}

	public function test_transport_row_names_the_setting_that_disables_it() {
		$this->settings['CHAPTER_REBUILD_TRANSPORT'] = 'github';
		$this->settings['CHAPTER_GITHUB_REPO']       = 'owner/repo-dispatch';
		$this->settings['CHAPTER_GITHUB_TOKEN']      = '';

		$rows = $this->labels( progressnow_admin_build_rows( progressnow_rebuild_state(), null ) );
		$this->assertSame( 'none — CHAPTER_GITHUB_TOKEN is unset', $rows['Rebuild transport'] );

		$this->settings['CHAPTER_REBUILD_TRANSPORT']   = 'webhook';
		$this->settings['CHAPTER_REBUILD_WEBHOOK_URL'] = 'https://www.example.org/api/rebuild';
		$this->settings['CHAPTER_REBUILD_SECRET']      = 'too-short';
		$rows                                          = progressnow_admin_build_rows( progressnow_rebuild_state(), null );
		$byKey                                         = $this->labels( $rows );
		$this->assertSame( 'none — CHAPTER_REBUILD_SECRET is shorter than 32 characters', $byKey['Rebuild transport'] );
		$this->assertSame( 'error', $rows[ array_search( 'Rebuild settings', array_column( $rows, 'label' ), true ) ]['tone'] );
		$this->assertStringNotContainsString( 'too-short', wp_json_encode( $rows ) );
	}

	public function test_panel_url_and_handlers_exist() {
		$this->assertStringContainsString( 'page=progressnow-site-build', progressnow_admin_build_url() );
		// Hooks are reset per test under WorDBless; the callbacks themselves must exist.
		$this->assertTrue( function_exists( 'progressnow_admin_build_menu' ) );
		$this->assertTrue( function_exists( 'progressnow_admin_build_rebuild_now' ) );
		$this->assertTrue( function_exists( 'progressnow_admin_build_page' ) );
	}
}
