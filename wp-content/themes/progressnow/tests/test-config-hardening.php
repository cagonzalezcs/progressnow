<?php
/**
 * wp-config hardening include (config/wp-config-hardening.php, repo root):
 * exercised in PHP subprocesses because constants cannot be undefined —
 * each scenario predefines what an environment's wp-config.php would have
 * set, requires the include, and prints the resulting constants (or the
 * failure exit code + stderr).
 *
 * Pure PHP; no WordPress is loaded in the child.
 */

use PHPUnit\Framework\TestCase;

class TestConfigHardening extends TestCase {

	private static $include;
	private static $docroot;
	private static $tmp;

	public static function setUpBeforeClass(): void {
		self::$docroot = realpath( dirname( __DIR__, 4 ) );
		self::$include = self::$docroot . '/config/wp-config-hardening.php';
		self::$tmp     = sys_get_temp_dir() . '/progressnow-config-hardening-' . getmypid();
		if ( ! is_dir( self::$tmp ) ) {
			mkdir( self::$tmp, 0700, true );
		}
	}

	public static function tearDownAfterClass(): void {
		if ( is_dir( self::$tmp ) ) {
			foreach ( glob( self::$tmp . '/*' ) ?: array() as $f ) {
				is_dir( $f ) ? rmdir( $f ) : unlink( $f );
			}
			rmdir( self::$tmp );
		}
	}

	/**
	 * Run the include in a child PHP process.
	 *
	 * @param array $defines Constants the env's wp-config.php defined first.
	 * @param array $env     Extra environment variables for the child.
	 * @param bool  $with_db_name Emulate being included from wp-config.php (DB_NAME set).
	 * @return array{code:int, out:array|string, err:string}
	 */
	private function run_include( array $defines = array(), array $env = array(), $with_db_name = true ) {
		$prelude = '<?php ';
		if ( $with_db_name ) {
			$prelude .= "define( 'DB_NAME', 'wp' ); ";
		}
		foreach ( $defines as $name => $value ) {
			$prelude .= sprintf( 'define( %s, %s ); ', var_export( $name, true ), var_export( $value, true ) );
		}
		$prelude .= 'require ' . var_export( self::$include, true ) . '; ';
		$prelude .= 'echo json_encode( array( ';
		foreach ( array( 'WP_ENVIRONMENT_TYPE', 'WP_DEBUG', 'WP_DEBUG_DISPLAY', 'WP_DEBUG_LOG', 'DISALLOW_FILE_EDIT', 'DISALLOW_FILE_MODS', 'FORCE_SSL_ADMIN', 'WP_AUTO_UPDATE_CORE', 'AUTOMATIC_UPDATER_DISABLED' ) as $c ) {
			$prelude .= sprintf( "'%s' => defined( '%s' ) ? %s : 'undefined', ", $c, $c, $c );
		}
		$prelude .= "'display_errors' => ini_get( 'display_errors' ), 'https' => \$_SERVER['HTTPS'] ?? null ) );";

		$script = self::$tmp . '/scenario-' . md5( $prelude ) . '.php';
		file_put_contents( $script, $prelude );

		$cmd  = 'php -d display_errors=1 -d error_log=/dev/null ' . escapeshellarg( $script );
		$spec = array( 1 => array( 'pipe', 'w' ), 2 => array( 'pipe', 'w' ) );
		$proc = proc_open( $cmd, $spec, $pipes, self::$docroot, array_merge( getenv(), $env ) );
		$out  = stream_get_contents( $pipes[1] );
		$err  = stream_get_contents( $pipes[2] );
		fclose( $pipes[1] );
		fclose( $pipes[2] );
		$code = proc_close( $proc );

		$decoded = json_decode( $out, true );
		return array(
			'code' => $code,
			'out'  => null === $decoded ? $out : $decoded,
			'err'  => $err,
		);
	}

	private function outside( $sub = 'logs' ) {
		return self::$tmp . '/' . $sub;
	}

	// -----------------------------------------------------------------------
	// Environment type
	// -----------------------------------------------------------------------

	public function test_unset_environment_defaults_to_production_and_hardens() {
		$r = $this->run_include();

		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertSame( 'production', $r['out']['WP_ENVIRONMENT_TYPE'] );
		$this->assertFalse( $r['out']['WP_DEBUG'] );
		$this->assertFalse( $r['out']['WP_DEBUG_DISPLAY'] );
		$this->assertFalse( $r['out']['WP_DEBUG_LOG'] );
		$this->assertTrue( $r['out']['DISALLOW_FILE_EDIT'] );
		$this->assertSame( 'undefined', $r['out']['DISALLOW_FILE_MODS'] );
		$this->assertTrue( $r['out']['FORCE_SSL_ADMIN'] );
		$this->assertSame( 'minor', $r['out']['WP_AUTO_UPDATE_CORE'] );
		$this->assertFalse( $r['out']['AUTOMATIC_UPDATER_DISABLED'] );
		$this->assertSame( '0', (string) $r['out']['display_errors'] );
	}

	public function test_environment_type_from_env_var() {
		$r = $this->run_include( array(), array( 'WP_ENVIRONMENT_TYPE' => 'staging' ) );

		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertSame( 'staging', $r['out']['WP_ENVIRONMENT_TYPE'] );
	}

	public function test_invalid_environment_type_fails() {
		$r = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'prod' ) );

		$this->assertSame( 1, $r['code'] );
		$this->assertStringContainsString( 'WP_ENVIRONMENT_TYPE must be', $r['err'] );
	}

	// -----------------------------------------------------------------------
	// Startup assertion (task 2.5)
	// -----------------------------------------------------------------------

	public function test_debug_true_under_production_fails_startup() {
		$r = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'production', 'WP_DEBUG' => true ) );

		$this->assertSame( 1, $r['code'] );
		$this->assertStringContainsString( 'WP_DEBUG is true under production', $r['err'] );
		$this->assertIsString( $r['out'], 'no constants dump: the boot stopped' );
	}

	public function test_debug_display_true_under_production_or_staging_fails_startup() {
		foreach ( array( 'production', 'staging' ) as $env ) {
			$r = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => $env, 'WP_DEBUG_DISPLAY' => true ) );
			$this->assertSame( 1, $r['code'], $env );
			$this->assertStringContainsString( 'WP_DEBUG_DISPLAY is true under ' . $env, $r['err'] );
		}
	}

	public function test_debug_log_inside_docroot_under_production_fails_startup() {
		$r = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'production', 'WP_DEBUG_LOG' => true ) );
		$this->assertSame( 1, $r['code'] );
		$this->assertStringContainsString( 'WP_DEBUG_LOG points inside the docroot', $r['err'] );

		$r = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'production', 'WP_DEBUG_LOG' => self::$docroot . '/wp-content/debug.log' ) );
		$this->assertSame( 1, $r['code'] );

		$r = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'production', 'PROGRESSNOW_DEBUG_LOG_DIR' => self::$docroot . '/logs' ) );
		$this->assertSame( 1, $r['code'] );
		$this->assertStringContainsString( 'PROGRESSNOW_DEBUG_LOG_DIR is inside the docroot', $r['err'] );
	}

	public function test_production_web_failure_is_a_generic_500() {
		// Fake a web SAPI by asking the include's fail path for its web branch:
		// PHP_SAPI cannot be changed, so cover the guard instead — a direct
		// request (no DB_NAME) under a non-cli SAPI 404s. Under cli the guard is
		// bypassed and the include just runs.
		$r = $this->run_include( array(), array(), false );
		$this->assertSame( 0, $r['code'], $r['err'] );

		$source = file_get_contents( self::$include );
		$this->assertStringContainsString( "http_response_code( 404 );", $source );
		$this->assertStringContainsString( "http_response_code( 500 );", $source );
		$this->assertStringContainsString( "echo 'Configuration error.';", $source );
		$this->assertStringNotContainsString( '$reason;', substr( $source, strpos( $source, "http_response_code( 500 )" ) ), 'web branch must not echo the reason' );
	}

	// -----------------------------------------------------------------------
	// Debug log placement (task 2.3)
	// -----------------------------------------------------------------------

	public function test_development_debug_log_lands_outside_docroot() {
		$dir = $this->outside( 'dev-logs' );
		$r   = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'development', 'WP_DEBUG' => true, 'PROGRESSNOW_DEBUG_LOG_DIR' => $dir ) );

		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertTrue( $r['out']['WP_DEBUG'] );
		$this->assertSame( $dir . '/wp-debug.log', $r['out']['WP_DEBUG_LOG'] );
		$this->assertDirectoryExists( $dir );
		$this->assertStringStartsNotWith( self::$docroot, $r['out']['WP_DEBUG_LOG'] );
	}

	public function test_development_default_log_dir_is_sibling_of_docroot() {
		$r = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'local', 'WP_DEBUG' => true ) );

		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertSame( dirname( self::$docroot ) . '/logs/wp-debug.log', $r['out']['WP_DEBUG_LOG'] );
	}

	public function test_production_opt_in_log_outside_docroot() {
		$dir = $this->outside( 'prod-logs' );
		$r   = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'production', 'PROGRESSNOW_DEBUG_LOG_DIR' => $dir ) );

		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertFalse( $r['out']['WP_DEBUG'] );
		$this->assertSame( $dir . '/wp-debug.log', $r['out']['WP_DEBUG_LOG'] );
	}

	public function test_local_debug_log_inside_docroot_is_tolerated_with_a_warning() {
		$r = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'local', 'WP_DEBUG' => true, 'WP_DEBUG_LOG' => true ) );

		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertTrue( $r['out']['WP_DEBUG_LOG'] );
	}

	// -----------------------------------------------------------------------
	// Guards + policy (task 2.4)
	// -----------------------------------------------------------------------

	public function test_staging_keeps_debug_logging_but_never_display() {
		$dir = $this->outside( 'staging-logs' );
		$r   = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'staging', 'WP_DEBUG' => true, 'PROGRESSNOW_DEBUG_LOG_DIR' => $dir ) );

		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertTrue( $r['out']['WP_DEBUG'] );
		$this->assertFalse( $r['out']['WP_DEBUG_DISPLAY'] );
		$this->assertSame( $dir . '/wp-debug.log', $r['out']['WP_DEBUG_LOG'] );
		$this->assertTrue( $r['out']['FORCE_SSL_ADMIN'] );
	}

	public function test_local_does_not_force_ssl_admin_but_still_blocks_file_edit() {
		$r = $this->run_include( array( 'WP_ENVIRONMENT_TYPE' => 'local' ) );

		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertSame( 'undefined', $r['out']['FORCE_SSL_ADMIN'] );
		$this->assertTrue( $r['out']['DISALLOW_FILE_EDIT'] );
		$this->assertSame( 'undefined', $r['out']['WP_DEBUG'], 'local decides its own debug flag' );
	}

	public function test_disallow_file_mods_is_opt_in() {
		$r = $this->run_include( array( 'PROGRESSNOW_DISALLOW_FILE_MODS' => true ) );
		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertTrue( $r['out']['DISALLOW_FILE_MODS'] );

		$r = $this->run_include( array( 'PROGRESSNOW_DISALLOW_FILE_MODS' => false ) );
		$this->assertSame( 'undefined', $r['out']['DISALLOW_FILE_MODS'] );
	}

	public function test_environment_defined_policy_constants_win() {
		$r = $this->run_include( array( 'WP_AUTO_UPDATE_CORE' => true, 'FORCE_SSL_ADMIN' => false, 'DISALLOW_FILE_EDIT' => false ) );

		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertTrue( $r['out']['WP_AUTO_UPDATE_CORE'] );
		$this->assertFalse( $r['out']['FORCE_SSL_ADMIN'] );
		$this->assertFalse( $r['out']['DISALLOW_FILE_EDIT'] );
	}

	public function test_proxy_proto_is_only_trusted_when_opted_in() {
		$r = $this->run_include( array(), array( 'HTTP_X_FORWARDED_PROTO' => 'https' ) );
		$this->assertSame( 0, $r['code'], $r['err'] );
		$this->assertNull( $r['out']['https'] );

		$r = $this->run_include( array( 'PROGRESSNOW_TRUST_PROXY_PROTO' => true ), array( 'HTTP_X_FORWARDED_PROTO' => 'https' ) );
		$this->assertSame( 'on', $r['out']['https'] );
	}

	// -----------------------------------------------------------------------
	// No secrets
	// -----------------------------------------------------------------------

	public function test_include_contains_no_secret_shaped_constants() {
		$source = file_get_contents( self::$include );

		foreach ( array( 'AUTH_KEY', 'SECURE_AUTH_KEY', 'LOGGED_IN_KEY', 'NONCE_KEY', 'AUTH_SALT', 'SECURE_AUTH_SALT', 'LOGGED_IN_SALT', 'NONCE_SALT', 'DB_PASSWORD', 'DB_USER', 'CHAPTER_REBUILD_SECRET', 'CHAPTER_GITHUB_TOKEN' ) as $name ) {
			$this->assertDoesNotMatchRegularExpression( "/define\\(\\s*'{$name}'/", $source, "{$name} must stay per-env" );
		}
	}
}
