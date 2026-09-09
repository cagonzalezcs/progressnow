<?php
/**
 * Committed wp-config hardening baseline (openspec: security-runtime-hardening).
 *
 * Each environment's (gitignored) wp-config.php requires this file from its
 * "custom values" section, AFTER the environment type and BEFORE
 * wp-settings.php:
 *
 *     define( 'WP_ENVIRONMENT_TYPE', 'production' ); // local | development | staging | production
 *     require_once __DIR__ . '/config/wp-config-hardening.php';
 *
 * Policy, by environment type (unset = production, matching WordPress):
 *
 *   production   WP_DEBUG=false, WP_DEBUG_DISPLAY=false, no debug log unless
 *                PROGRESSNOW_DEBUG_LOG_DIR opts one in (always off-docroot);
 *                display_errors off at the PHP level as well;
 *                FORCE_SSL_ADMIN; WP_AUTO_UPDATE_CORE='minor'.
 *   staging      same as production except WP_DEBUG may be on (log only, never display).
 *   development  / local: debug free, but a log still lands off-docroot.
 *   all          DISALLOW_FILE_EDIT; DISALLOW_FILE_MODS only when
 *                PROGRESSNOW_DISALLOW_FILE_MODS is true (it also disables
 *                automatic updates — sequence with security-dependency-lifecycle).
 *
 * Startup assertion: under production, a wp-config.php that already set
 * WP_DEBUG / WP_DEBUG_DISPLAY to true, or pointed WP_DEBUG_LOG inside the
 * docroot, fails the request (HTTP 500, generic body, detail only in the PHP
 * error log; exit 1 on the CLI). Constants cannot be redefined, so the only
 * safe response to a contradicting definition is to stop.
 *
 * Contains no secrets. Salts/keys stay per environment in wp-config.php
 * (docs/runtime-hardening.md has the rotation runbook).
 */

// Direct web request guard: wp-config.php defines DB_NAME before including us.
if ( ! defined( 'DB_NAME' ) && 'cli' !== PHP_SAPI ) {
	http_response_code( 404 );
	exit;
}

if ( ! function_exists( 'progressnow_config_fail' ) ) {
	/**
	 * Stop the boot with a generic response; the reason goes to the PHP error
	 * log only.
	 *
	 * @param string $reason Log-only detail.
	 * @return never
	 */
	function progressnow_config_fail( $reason ) {
		error_log( 'progressnow wp-config hardening: ' . $reason ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		if ( 'cli' === PHP_SAPI ) {
			fwrite( STDERR, "progressnow wp-config hardening: {$reason}\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
			exit( 1 );
		}
		http_response_code( 500 );
		header( 'Content-Type: text/plain; charset=utf-8' );
		echo 'Configuration error.';
		exit;
	}
}

if ( ! function_exists( 'progressnow_config_path_is_inside' ) ) {
	/**
	 * Whether $path resolves inside $dir (lexically; the file may not exist yet).
	 *
	 * @param string $path Candidate path.
	 * @param string $dir  Directory.
	 * @return bool
	 */
	function progressnow_config_path_is_inside( $path, $dir ) {
		$dir  = rtrim( str_replace( '\\', '/', $dir ), '/' ) . '/';
		$path = str_replace( '\\', '/', $path );
		$real = realpath( dirname( $path ) );
		if ( false !== $real ) {
			$path = rtrim( str_replace( '\\', '/', $real ), '/' ) . '/' . basename( $path );
		}
		$real_dir = realpath( $dir );
		if ( false !== $real_dir ) {
			$dir = rtrim( str_replace( '\\', '/', $real_dir ), '/' ) . '/';
		}
		return 0 === strpos( $path, $dir );
	}
}

// ---------------------------------------------------------------------------
// Environment type (WordPress reads the same constant / env var).
// ---------------------------------------------------------------------------

if ( ! defined( 'WP_ENVIRONMENT_TYPE' ) ) {
	$progressnow_env = getenv( 'WP_ENVIRONMENT_TYPE' );
	define( 'WP_ENVIRONMENT_TYPE', $progressnow_env ? $progressnow_env : 'production' );
	unset( $progressnow_env );
}
if ( ! in_array( WP_ENVIRONMENT_TYPE, array( 'local', 'development', 'staging', 'production' ), true ) ) {
	progressnow_config_fail( 'WP_ENVIRONMENT_TYPE must be local|development|staging|production, got "' . WP_ENVIRONMENT_TYPE . '"' );
}

$progressnow_docroot    = dirname( __DIR__ ); // this file lives in <docroot>/config/
$progressnow_production = 'production' === WP_ENVIRONMENT_TYPE;
$progressnow_hardened   = $progressnow_production || 'staging' === WP_ENVIRONMENT_TYPE;

// ---------------------------------------------------------------------------
// Debug policy
// ---------------------------------------------------------------------------

if ( $progressnow_production ) {
	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		progressnow_config_fail( 'WP_DEBUG is true under production' );
	}
	if ( ! defined( 'WP_DEBUG' ) ) {
		define( 'WP_DEBUG', false );
	}
}

if ( $progressnow_hardened ) {
	if ( defined( 'WP_DEBUG_DISPLAY' ) && WP_DEBUG_DISPLAY ) {
		progressnow_config_fail( 'WP_DEBUG_DISPLAY is true under ' . WP_ENVIRONMENT_TYPE );
	}
	if ( ! defined( 'WP_DEBUG_DISPLAY' ) ) {
		define( 'WP_DEBUG_DISPLAY', false );
	}
	// Belt and braces: WordPress only touches display_errors when WP_DEBUG is on.
	ini_set( 'display_errors', '0' ); // phpcs:ignore WordPress.PHP.IniSet.display_errors_Disallowed
}

// Debug log: never inside the docroot. `true` means wp-content/debug.log.
$progressnow_log_dir = defined( 'PROGRESSNOW_DEBUG_LOG_DIR' )
	? PROGRESSNOW_DEBUG_LOG_DIR
	: ( getenv( 'PROGRESSNOW_DEBUG_LOG_DIR' ) ? getenv( 'PROGRESSNOW_DEBUG_LOG_DIR' ) : dirname( $progressnow_docroot ) . '/logs' );

if ( defined( 'PROGRESSNOW_DEBUG_LOG_DIR' ) && progressnow_config_path_is_inside( PROGRESSNOW_DEBUG_LOG_DIR, $progressnow_docroot ) ) {
	progressnow_config_fail( 'PROGRESSNOW_DEBUG_LOG_DIR is inside the docroot' );
}

if ( defined( 'WP_DEBUG_LOG' ) ) {
	if ( true === WP_DEBUG_LOG || ( is_string( WP_DEBUG_LOG ) && progressnow_config_path_is_inside( WP_DEBUG_LOG, $progressnow_docroot ) ) ) {
		if ( $progressnow_hardened ) {
			progressnow_config_fail( 'WP_DEBUG_LOG points inside the docroot under ' . WP_ENVIRONMENT_TYPE );
		}
		error_log( 'progressnow wp-config hardening: WP_DEBUG_LOG points inside the docroot; move it to ' . $progressnow_log_dir ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	}
} elseif ( $progressnow_production ) {
	// Off unless an operator opted in with an explicit off-docroot directory.
	define( 'WP_DEBUG_LOG', defined( 'PROGRESSNOW_DEBUG_LOG_DIR' ) ? PROGRESSNOW_DEBUG_LOG_DIR . '/wp-debug.log' : false );
} elseif ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
	if ( progressnow_config_path_is_inside( $progressnow_log_dir, $progressnow_docroot ) ) {
		progressnow_config_fail( 'PROGRESSNOW_DEBUG_LOG_DIR is inside the docroot' );
	}
	if ( ! is_dir( $progressnow_log_dir ) ) {
		@mkdir( $progressnow_log_dir, 0750, true ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_operations_mkdir
	}
	define( 'WP_DEBUG_LOG', $progressnow_log_dir . '/wp-debug.log' );
}

// ---------------------------------------------------------------------------
// File-system + transport guards
// ---------------------------------------------------------------------------

if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
	define( 'DISALLOW_FILE_EDIT', true );
}

// Blocks plugin/theme installs AND automatic updates; opt in only once
// updates are owned elsewhere (security-dependency-lifecycle).
if ( ! defined( 'DISALLOW_FILE_MODS' ) && defined( 'PROGRESSNOW_DISALLOW_FILE_MODS' ) && PROGRESSNOW_DISALLOW_FILE_MODS ) {
	define( 'DISALLOW_FILE_MODS', true );
}

if ( $progressnow_hardened ) {
	// Behind a TLS-terminating proxy, opt in so FORCE_SSL_ADMIN does not loop.
	if ( defined( 'PROGRESSNOW_TRUST_PROXY_PROTO' ) && PROGRESSNOW_TRUST_PROXY_PROTO
		&& isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && 'https' === strtolower( (string) $_SERVER['HTTP_X_FORWARDED_PROTO'] ) ) {
		$_SERVER['HTTPS'] = 'on';
	}
	if ( ! defined( 'FORCE_SSL_ADMIN' ) ) {
		define( 'FORCE_SSL_ADMIN', true );
	}
}

// ---------------------------------------------------------------------------
// Update policy: core takes minor + security releases on its own; major
// releases and plugins/themes are deliberate (dependency-lifecycle).
// ---------------------------------------------------------------------------

if ( ! defined( 'WP_AUTO_UPDATE_CORE' ) ) {
	define( 'WP_AUTO_UPDATE_CORE', 'minor' );
}
if ( ! defined( 'AUTOMATIC_UPDATER_DISABLED' ) ) {
	define( 'AUTOMATIC_UPDATER_DISABLED', false );
}

unset( $progressnow_docroot, $progressnow_production, $progressnow_hardened, $progressnow_log_dir );
