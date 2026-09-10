<?php
/**
 * WP-CLI: `wp chapter rebuild [--wait] [--timeout=<seconds>]` and
 * `wp chapter build-status [--format=<table|json>]` (openspec design D7),
 * plus the read-only security audits `audit-urls`, `audit-roles`,
 * `audit-markup` and `csp-reports [--clear]` (inc/security.php). Same code
 * paths as the admin panel; nothing here runs a process.
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
			// Setting SOURCES only (env / constant / filter / unset); never a value.
			WP_CLI::line( wp_json_encode( progressnow_admin_build_export( $state, $manifest ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );

			return;
		}

		$rows = array();
		foreach ( progressnow_admin_build_rows( $state, $manifest ) as $row ) {
			$rows[] = array( 'field' => $row['label'], 'value' => $row['value'] );
		}
		\WP_CLI\Utils\format_items( 'table', $rows, array( 'field', 'value' ) );
	}

	/**
	 * Report stored URLs (block attrs, event rsvp_url, page + option URL
	 * fields) whose scheme progressnow_safe_url() rejects. Read-only: the
	 * serializers already drop these at render; clean them up in wp-admin.
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
	 * ## EXAMPLES
	 *
	 *     wp chapter audit-urls
	 *     wp chapter audit-urls --format=json
	 *
	 * @subcommand audit-urls
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Flags.
	 */
	public function audit_urls( $args, $assoc_args ) {
		$findings = progressnow_audit_unsafe_urls();
		$format   = \WP_CLI\Utils\get_flag_value( $assoc_args, 'format', 'table' );

		if ( 'json' === $format ) {
			WP_CLI::line( wp_json_encode( $findings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
			return;
		}

		if ( ! $findings ) {
			WP_CLI::success( 'No unsafe stored URLs found.' );
			return;
		}

		\WP_CLI\Utils\format_items( 'table', $findings, array( 'where', 'id', 'field', 'value' ) );
		WP_CLI::warning( count( $findings ) . ' unsafe URL value(s); fix them in wp-admin.' );
	}

	/**
	 * Inventory users and roles for the least-privilege audit
	 * (docs/authoring-trust-model.md): every user with their role(s), plus
	 * whether they resolve `unfiltered_html` (always "no" with the theme
	 * active) and any stored role that still lists the capability.
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
	 * ## EXAMPLES
	 *
	 *     wp chapter audit-roles
	 *     wp chapter audit-roles --format=json
	 *
	 * @subcommand audit-roles
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Flags.
	 */
	public function audit_roles( $args, $assoc_args ) {
		$users  = progressnow_audit_users();
		$roles  = progressnow_roles_with_unfiltered_html();
		$format = \WP_CLI\Utils\get_flag_value( $assoc_args, 'format', 'table' );

		if ( 'json' === $format ) {
			WP_CLI::line( wp_json_encode( array( 'users' => $users, 'rolesWithUnfilteredHtml' => $roles ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
			return;
		}

		\WP_CLI\Utils\format_items( 'table', $users, array( 'id', 'login', 'name', 'roles', 'unfilteredHtml' ) );

		$admins = array_filter( $users, fn( $u ) => in_array( 'administrator', explode( ',', $u['roles'] ), true ) );
		WP_CLI::log( sprintf( '%d user(s), %d Administrator(s). Administrator is for maintainers only; authors belong in Author/Editor (wp user set-role <login> <role>).', count( $users ), count( $admins ) ) );

		$leak = array_filter( $users, fn( $u ) => 'YES' === $u['unfilteredHtml'] );
		if ( $leak || $roles ) {
			WP_CLI::error( sprintf( 'unfiltered_html is live: users [%s], stored roles [%s]. inc/roles.php must be active.', implode( ',', array_column( $leak, 'login' ) ), implode( ',', $roles ) ) );
		}
		WP_CLI::success( 'No user or role holds unfiltered_html.' );
	}

	/**
	 * Report stored content that still carries executable markup (script,
	 * iframe, object/embed, inline event handlers, javascript: URLs) that
	 * wp_kses_post() strips on save — content persisted by an Administrator
	 * before kses became unconditional. Read-only: clean the hits in wp-admin
	 * (re-saving the post runs kses now).
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
	 * ## EXAMPLES
	 *
	 *     wp chapter audit-markup
	 *     wp chapter audit-markup --format=json
	 *
	 * @subcommand audit-markup
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Flags.
	 */
	public function audit_markup( $args, $assoc_args ) {
		$findings = progressnow_audit_stored_markup();
		$format   = \WP_CLI\Utils\get_flag_value( $assoc_args, 'format', 'table' );

		if ( 'json' === $format ) {
			WP_CLI::line( wp_json_encode( $findings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
			return;
		}

		if ( ! $findings ) {
			WP_CLI::success( 'No stored executable markup found.' );
			return;
		}

		\WP_CLI\Utils\format_items( 'table', $findings, array( 'where', 'id', 'field', 'token' ) );
		WP_CLI::warning( count( $findings ) . ' stored value(s) carry executable markup; clean them in wp-admin.' );
	}
	/**
	 * List the CSP violations the report sink has aggregated (inc/security.php).
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
	 * [--clear]
	 * : Forget every recorded violation (after tuning the allow-list).
	 *
	 * ## EXAMPLES
	 *
	 *     wp chapter csp-reports
	 *     wp chapter csp-reports --format=json
	 *     wp chapter csp-reports --clear
	 *
	 * @subcommand csp-reports
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Flags.
	 */
	public function csp_reports( $args, $assoc_args ) {
		if ( \WP_CLI\Utils\get_flag_value( $assoc_args, 'clear', false ) ) {
			progressnow_csp_clear_reports();
			WP_CLI::success( 'CSP reports cleared.' );
			return;
		}

		$store  = progressnow_csp_reports();
		$format = \WP_CLI\Utils\get_flag_value( $assoc_args, 'format', 'table' );
		$rows   = array();
		foreach ( $store['rows'] as $row ) {
			$rows[] = array(
				'directive' => $row['directive'],
				'blocked'   => $row['blocked'] ?: '(inline)',
				'document'  => $row['document'],
				'source'    => $row['source'],
				'count'     => (int) $row['count'],
				'last'      => gmdate( 'Y-m-d H:i', (int) $row['last'] ),
			);
		}
		usort( $rows, static fn ( $a, $b ) => $b['count'] <=> $a['count'] );

		if ( 'json' === $format ) {
			WP_CLI::line( wp_json_encode( array( 'mode' => progressnow_csp_mode(), 'rows' => $rows, 'dropped' => $store['dropped'] ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );
			return;
		}

		WP_CLI::line( 'CSP mode: ' . progressnow_csp_mode() );
		if ( ! $rows ) {
			WP_CLI::success( 'No CSP violations recorded.' );
			return;
		}
		\WP_CLI\Utils\format_items( 'table', $rows, array( 'directive', 'blocked', 'document', 'source', 'count', 'last' ) );
		if ( $store['dropped'] > 0 ) {
			WP_CLI::warning( $store['dropped'] . ' further distinct signature(s) dropped (store full); clear after tuning.' );
		}
	}
}

WP_CLI::add_command( 'chapter', 'Progressnow_CLI_Chapter' );
