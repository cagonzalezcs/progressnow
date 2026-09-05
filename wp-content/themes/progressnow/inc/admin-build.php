<?php
/**
 * wp-admin "Site build" panel (openspec design D7): build state, the live
 * static manifest, transport/static-mode configuration, and a "Rebuild now"
 * button. Lives under Chapter Settings (ACF options page) or Tools when ACF
 * is absent. Admin notices (inc/rebuild.php) link here.
 *
 * @package progressnow
 */

const PROGRESSNOW_ADMIN_BUILD_SLUG = 'progressnow-site-build';

// Priority 100: ACF registers the Chapter Settings parent at 99; registering the
// submenu earlier stores the wrong page hookname and admin.php answers "Sorry, you
// are not allowed to access this page."
add_action( 'admin_menu', 'progressnow_admin_build_menu', 100 );
function progressnow_admin_build_menu() {
	$parent = function_exists( 'acf_add_options_page' ) ? 'progressnow-chapter-settings' : 'tools.php';
	add_submenu_page(
		$parent,
		__( 'Site build', 'progressnow' ),
		__( 'Site build', 'progressnow' ),
		'manage_options',
		PROGRESSNOW_ADMIN_BUILD_SLUG,
		'progressnow_admin_build_page'
	);
}

/**
 * URL of the panel (works under either parent).
 */
function progressnow_admin_build_url() {
	$url = menu_page_url( PROGRESSNOW_ADMIN_BUILD_SLUG, false );

	return $url ? $url : admin_url( 'admin.php?page=' . PROGRESSNOW_ADMIN_BUILD_SLUG );
}

/**
 * Human labels for the state machine.
 *
 * @return array<string,string>
 */
function progressnow_admin_build_status_labels() {
	return array(
		'idle'            => __( 'Idle — nothing pending', 'progressnow' ),
		'scheduled'       => __( 'Scheduled — dispatching after the debounce window', 'progressnow' ),
		'requested'       => __( 'Requested — waiting for the build to start', 'progressnow' ),
		'building'        => __( 'Building', 'progressnow' ),
		'live'            => __( 'Live — the static build matches the content', 'progressnow' ),
		'failed'          => __( 'Failed — the last build reported an error', 'progressnow' ),
		'needs_attention' => __( 'Needs attention — dispatch failed after retries', 'progressnow' ),
		'not_configured'  => __( 'Not configured — no rebuild transport (the freshness guard keeps the site correct)', 'progressnow' ),
	);
}

/**
 * The rows the panel shows (pure, testable).
 *
 * @param array      $state    Build state (inc/rebuild.php).
 * @param array|null $manifest Live manifest (inc/shell.php) or null.
 * @return array<int,array{label:string,value:string,tone?:string}>
 */
function progressnow_admin_build_rows( array $state, $manifest ) {
	$labels          = progressnow_admin_build_status_labels();
	$content_version = function_exists( 'progressnow_content_version' ) ? progressnow_content_version() : 0;
	$live_version    = (int) $state['liveVersion'];
	$transport       = function_exists( 'progressnow_rebuild_transport' ) ? progressnow_rebuild_transport() : 'none';
	$frontend        = function_exists( 'progressnow_shell_mode' ) ? progressnow_shell_mode() : 'islands';
	$static_dir      = function_exists( 'progressnow_shell_static_dir' ) ? progressnow_shell_static_dir() : '';

	$rows = array(
		array(
			'label' => __( 'Status', 'progressnow' ),
			'value' => $labels[ $state['status'] ] ?? $state['status'],
			'tone'  => in_array( $state['status'], array( 'failed', 'needs_attention' ), true ) ? 'error' : ( 'live' === $state['status'] ? 'success' : 'info' ),
		),
		array(
			'label' => __( 'Content version', 'progressnow' ),
			'value' => sprintf(
				/* translators: 1: current content version, 2: version the live build was made from */
				__( 'current %1$d · live build %2$d', 'progressnow' ),
				$content_version,
				$live_version
			),
			'tone'  => $live_version >= $content_version ? 'success' : 'warning',
		),
		array(
			'label' => __( 'Live build', 'progressnow' ),
			'value' => $manifest
				? sprintf( '%s (%s, %d routes, entry %s)', $manifest['buildId'], $manifest['builtAt'] ?: '—', (int) ( $manifest['prerenderedRoutes'] ?? 0 ), $manifest['entry'] )
				: __( 'no shell-manifest.json reachable — PHP renders without the app (degraded mode)', 'progressnow' ),
			'tone'  => $manifest ? 'success' : 'warning',
		),
		array(
			'label' => __( 'Last request', 'progressnow' ),
			'value' => $state['requestId']
				? sprintf( '%s · v%d · %s · %d attempt(s)', $state['requestId'], (int) $state['requestedVersion'], $state['requestedAt'] ?: '—', (int) $state['attempts'] )
				: '—',
		),
		array(
			'label' => __( 'Last error', 'progressnow' ),
			'value' => $state['lastError'] ?: '—',
			'tone'  => $state['lastError'] ? 'error' : 'info',
		),
		array(
			'label' => __( 'Frontend', 'progressnow' ),
			'value' => 'nuxt' === $frontend ? __( 'nuxt — PHP shell + static app (CHAPTER_FRONTEND)', 'progressnow' ) : __( 'islands — Vite islands on Timber (set CHAPTER_FRONTEND to "nuxt" to switch)', 'progressnow' ),
		),
		array(
			'label' => __( 'Rebuild transport', 'progressnow' ),
			'value' => 'github' === $transport
				? sprintf( 'github → %s (repository_dispatch: rebuild-site)', function_exists( 'progressnow_rebuild_setting' ) ? progressnow_rebuild_setting( 'CHAPTER_GITHUB_REPO' ) : '' )
				: ( 'webhook' === $transport ? sprintf( 'webhook → %s', progressnow_rebuild_setting( 'CHAPTER_REBUILD_WEBHOOK_URL' ) ) : __( 'none (CHAPTER_REBUILD_TRANSPORT unset or incomplete)', 'progressnow' ) ),
			'tone'  => 'none' === $transport ? 'warning' : 'info',
		),
		array(
			'label' => __( 'Static files', 'progressnow' ),
			'value' => '' !== $static_dir
				? sprintf( __( 'same-host — served from %s (PHP passthrough + web server rules)', 'progressnow' ), $static_dir )
				: sprintf( __( 'origin %s (CDN or web server serves /_nuxt, _payload.json, shell-manifest.json)', 'progressnow' ), function_exists( 'progressnow_shell_static_origin' ) ? progressnow_shell_static_origin() : home_url() ),
		),
	);

	return $rows;
}

/**
 * Render the panel.
 */
function progressnow_admin_build_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to view this page.', 'progressnow' ) );
	}

	$state    = progressnow_rebuild_state();
	$manifest = function_exists( 'progressnow_shell_manifest' ) ? progressnow_shell_manifest( isset( $_GET['recheck'] ) ) : null; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$rows     = progressnow_admin_build_rows( $state, $manifest );
	$notice   = isset( $_GET['progressnow_notice'] ) ? sanitize_key( (string) wp_unslash( $_GET['progressnow_notice'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	echo '<div class="wrap"><h1>' . esc_html__( 'Site build', 'progressnow' ) . '</h1>';

	if ( 'requested' === $notice ) {
		echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Rebuild requested. The state below updates as the workflow reports back or the new manifest is seen.', 'progressnow' ) . '</p></div>';
	} elseif ( 'not_configured' === $notice ) {
		echo '<div class="notice notice-warning is-dismissible"><p>' . esc_html__( 'No rebuild transport is configured — see docs/deployment.md for CHAPTER_REBUILD_TRANSPORT.', 'progressnow' ) . '</p></div>';
	} elseif ( 'failed' === $notice ) {
		echo '<div class="notice notice-error is-dismissible"><p>' . esc_html__( 'The dispatch failed — see "Last error" below.', 'progressnow' ) . '</p></div>';
	}

	echo '<table class="widefat striped" style="max-width:960px"><tbody>';
	foreach ( $rows as $row ) {
		$tone  = $row['tone'] ?? 'info';
		$color = array( 'error' => '#b32d2e', 'warning' => '#996800', 'success' => '#007017', 'info' => 'inherit' )[ $tone ] ?? 'inherit';
		printf(
			'<tr><th scope="row" style="width:200px">%s</th><td style="color:%s">%s</td></tr>',
			esc_html( $row['label'] ),
			esc_attr( $color ),
			esc_html( $row['value'] )
		);
	}
	echo '</tbody></table>';

	echo '<p style="margin-top:1em">';
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" style="display:inline-block;margin-right:8px">';
	wp_nonce_field( 'progressnow_rebuild_now' );
	echo '<input type="hidden" name="action" value="progressnow_rebuild_now">';
	submit_button( __( 'Rebuild now', 'progressnow' ), 'primary', 'submit', false );
	echo '</form>';
	printf(
		'<a class="button" href="%s">%s</a>',
		esc_url( add_query_arg( 'recheck', '1', progressnow_admin_build_url() ) ),
		esc_html__( 'Re-check manifest', 'progressnow' )
	);
	echo '</p>';

	echo '<p class="description">' . esc_html__( 'Content changes request a rebuild automatically (debounced). "Rebuild now" dispatches immediately. WP-CLI: wp chapter rebuild [--wait], wp chapter build-status.', 'progressnow' ) . '</p>';
	echo '</div>';
}

/**
 * admin-post.php?action=progressnow_rebuild_now
 */
add_action( 'admin_post_progressnow_rebuild_now', 'progressnow_admin_build_rebuild_now' );
function progressnow_admin_build_rebuild_now() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to do that.', 'progressnow' ), '', array( 'response' => 403 ) );
	}
	check_admin_referer( 'progressnow_rebuild_now' );

	$state  = progressnow_rebuild_request( 'admin', true );
	$notice = 'requested';
	if ( 'not_configured' === $state['status'] ) {
		$notice = 'not_configured';
	} elseif ( in_array( $state['status'], array( 'needs_attention', 'failed' ), true ) ) {
		$notice = 'failed';
	}

	wp_safe_redirect( add_query_arg( 'progressnow_notice', $notice, progressnow_admin_build_url() ) );
	exit;
}
