<?php
/**
 * WP-CLI: `wp chapter rebuild [--wait] [--timeout=<seconds>]` and
 * `wp chapter build-status [--format=<table|json>]` (openspec design D7).
 * Same code paths as the admin panel; nothing here runs a process.
 *
 * @package progressnow
 */

if ( ! ( defined( 'WP_CLI' ) && WP_CLI ) ) {
	return;
}

/**
 * Static site build commands.
 */
class Progressnow_CLI_Chapter {

	/**
	 * Request a rebuild of the static site through the configured transport.
	 *
	 * ## OPTIONS
	 *
	 * [--wait]
	 * : Poll until the build is live (or fails).
	 *
	 * [--timeout=<seconds>]
	 * : Give up waiting after this many seconds.
	 * ---
	 * default: 900
	 * ---
	 *
	 * ## EXAMPLES
	 *
	 *     wp chapter rebuild
	 *     wp chapter rebuild --wait --timeout=600
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Flags.
	 */
	public function rebuild( $args, $assoc_args ) {
		$state = progressnow_rebuild_request( 'cli', true );

		if ( 'not_configured' === $state['status'] ) {
			WP_CLI::warning( 'No rebuild transport is configured (CHAPTER_REBUILD_TRANSPORT). Nothing dispatched; the freshness guard keeps the site correct.' );

			return;
		}
		if ( in_array( $state['status'], array( 'needs_attention', 'failed' ), true ) ) {
			WP_CLI::error( 'Dispatch failed: ' . ( $state['lastError'] ?: $state['status'] ) );
		}

		WP_CLI::success( sprintf( 'Rebuild requested (request %s, content v%d).', $state['requestId'], (int) $state['requestedVersion'] ) );

		if ( ! \WP_CLI\Utils\get_flag_value( $assoc_args, 'wait', false ) ) {
			return;
		}

		$timeout  = max( 30, (int) \WP_CLI\Utils\get_flag_value( $assoc_args, 'timeout', 900 ) );
		$deadline = time() + $timeout;
		$wanted   = (int) $state['requestedVersion'];

		while ( time() < $deadline ) {
			sleep( 10 );
			// A new manifest counts as "live" even without the status callback.
			if ( function_exists( 'progressnow_shell_manifest' ) ) {
				progressnow_shell_manifest( true );
			}
			$state = progressnow_rebuild_state();
			if ( 'live' === $state['status'] && (int) $state['liveVersion'] >= $wanted ) {
				WP_CLI::success( sprintf( 'Live: build %s (content v%d).', $state['liveBuildId'], (int) $state['liveVersion'] ) );

				return;
			}
			if ( in_array( $state['status'], array( 'failed', 'needs_attention' ), true ) ) {
				WP_CLI::error( 'Build ' . $state['status'] . ': ' . $state['lastError'] );
			}
			WP_CLI::log( sprintf( '… %s (live v%d, want v%d)', $state['status'], (int) $state['liveVersion'], $wanted ) );
		}

		WP_CLI::error( sprintf( 'Timed out after %ds; last status: %s', $timeout, $state['status'] ) );
	}

	/**
	 * Show the build state and the live manifest.
	 *
	 * ## OPTIONS
	 *
	 * [--format=<format>]
	 * : table or json.
	 * ---
	 * default: table
	 * options:
	 *   - table
	 *   - json
	 * ---
	 *
	 * @subcommand build-status
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Flags.
	 */
	public function build_status( $args, $assoc_args ) {
		$state    = progressnow_rebuild_state();
		$manifest = function_exists( 'progressnow_shell_manifest' ) ? progressnow_shell_manifest( true ) : null;
		$format   = \WP_CLI\Utils\get_flag_value( $assoc_args, 'format', 'table' );

		if ( 'json' === $format ) {
			WP_CLI::line(
				wp_json_encode(
					array(
						'state'          => $state,
						'contentVersion' => function_exists( 'progressnow_content_version' ) ? progressnow_content_version() : 0,
						'manifest'       => $manifest,
					),
					JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
				)
			);

			return;
		}

		$rows = array();
		foreach ( progressnow_admin_build_rows( $state, $manifest ) as $row ) {
			$rows[] = array( 'field' => $row['label'], 'value' => $row['value'] );
		}
		\WP_CLI\Utils\format_items( 'table', $rows, array( 'field', 'value' ) );
	}
}

WP_CLI::add_command( 'chapter', 'Progressnow_CLI_Chapter' );
