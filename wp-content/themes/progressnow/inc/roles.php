<?php
/**
 * Authoring least privilege (openspec security-authoring-least-privilege).
 *
 * WordPress skips every kses save filter for a user who holds
 * `unfiltered_html` — Administrators, and Editors on single-site — so the
 * sanitization that protects the islands' `v-html` / Twig `|raw` sinks
 * from a Contributor does not constrain a high-privilege author. This file
 * makes kses unconditional:
 *
 * 1. `map_meta_cap` resolves `unfiltered_html` to `do_not_allow` for every
 *    user (the same mechanism core uses for `DISALLOW_UNFILTERED_HTML` and
 *    for non-super-admins on multisite), so `current_user_can()` is false
 *    regardless of what any role, plugin, or role editor grants.
 * 2. `user_has_cap` drops the primitive from the resolved capability list —
 *    belt and braces for code that reads `$user->allcaps` directly.
 * 3. On `init`, the primitive is removed from every stored role, so
 *    role inspection (wp-admin role editors, `wp cap list`) agrees with the
 *    runtime and a plugin that re-grants it is undone on the next request.
 *
 * Because `kses_init()` (core, on `init` and `set_current_user`) keys off
 * `current_user_can( 'unfiltered_html' )`, (1) alone is enough to route
 * every post/excerpt/comment save through `wp_kses_post` for every role.
 * Block-comment JSON survives kses: the editor serializes `<`, `>`, `&`,
 * `"` and `--` inside attrs as `\uXXXX` escapes (serialize_block_attributes).
 *
 * Public contract:
 * - progressnow_roles_register(): void — (re)attach the three hooks; called
 *   at load, and by tests after WorDBless restores its hook snapshot.
 * - progressnow_roles_with_unfiltered_html(): string[] — role slugs whose
 *   *stored* capability map still lists the primitive (audit / test seam).
 * - progressnow_audit_users( $users = null ): array — id, login, roles,
 *   whether the user resolves `unfiltered_html` (must always be false).
 * - progressnow_audit_stored_markup( $posts = null ): array — stored content
 *   still carrying executable markup kses would strip (one-time cleanup).
 *
 * @package progressnow
 */

/**
 * Resolve `unfiltered_html` to `do_not_allow` for everyone.
 *
 * @param string[] $caps Primitive caps required for $cap.
 * @param string   $cap  Capability being checked.
 * @return string[]
 */
function progressnow_roles_map_meta_cap( $caps, $cap ) {
	if ( 'unfiltered_html' === $cap ) {
		return array( 'do_not_allow' );
	}

	return $caps;
}

/**
 * Drop the primitive from the resolved capability list as well.
 *
 * @param array $allcaps User's capabilities (cap => bool).
 * @return array
 */
function progressnow_roles_user_has_cap( $allcaps ) {
	unset( $allcaps['unfiltered_html'] );

	return $allcaps;
}

/**
 * Role slugs whose stored capability map grants `unfiltered_html`.
 *
 * Reads the stored roles (not the filtered runtime answer) so it reports
 * what a role editor or plugin has written, which is what the init strip
 * and the regression test care about.
 *
 * @return string[]
 */
function progressnow_roles_with_unfiltered_html() {
	$found = array();
	foreach ( wp_roles()->role_objects as $slug => $role ) {
		if ( ! empty( $role->capabilities['unfiltered_html'] ) ) {
			$found[] = (string) $slug;
		}
	}

	return $found;
}

/**
 * Remove the stored primitive from any role that still carries it. Writes
 * to the roles option only when something actually changes, so steady state
 * is a read-only check per request.
 */
function progressnow_roles_strip_unfiltered_html() {
	foreach ( progressnow_roles_with_unfiltered_html() as $slug ) {
		$role = get_role( $slug );
		if ( $role ) {
			$role->remove_cap( 'unfiltered_html' );
		}
	}
}
/**
 * Attach the capability hooks. Idempotent (add_filter dedupes by callback).
 */
function progressnow_roles_register() {
	add_filter( 'map_meta_cap', 'progressnow_roles_map_meta_cap', 10, 2 );
	add_filter( 'user_has_cap', 'progressnow_roles_user_has_cap', 10, 1 );
	// Priority 0: before core's kses_init() (init, 10) evaluates the capability.
	add_action( 'init', 'progressnow_roles_strip_unfiltered_html', 0 );
}
progressnow_roles_register();

/**
 * Inventory users for the role audit: who holds which role, and confirm
 * nobody resolves `unfiltered_html`. Read-only.
 *
 * @param WP_User[]|null $users Users to inspect; null → every user.
 * @return array<int,array{id:int,login:string,name:string,roles:string,unfilteredHtml:string}>
 */
function progressnow_audit_users( $users = null ) {
	if ( null === $users ) {
		$users = get_users( array( 'number' => -1, 'orderby' => 'ID' ) );
	}

	$rows = array();
	foreach ( $users as $user ) {
		$user = $user instanceof WP_User ? $user : get_userdata( (int) $user );
		if ( ! $user ) {
			continue;
		}
		$rows[] = array(
			'id'             => (int) $user->ID,
			'login'          => (string) $user->user_login,
			'name'           => (string) $user->display_name,
			'roles'          => implode( ',', array_map( 'strval', (array) $user->roles ) ),
			'unfilteredHtml' => user_can( $user, 'unfiltered_html' ) ? 'YES' : 'no',
		);
	}

	return $rows;
}

/**
 * Executable-markup detector shared by the audit: anything wp_kses_post()
 * would strip that can run script or load a foreign document, plus inline
 * event handlers and `javascript:` URLs. Returns the offending token or ''.
 * (`<object>` is not listed: kses keeps it, restricted to PDF data.)
 *
 * @param mixed $value Stored value.
 * @return string
 */
function progressnow_audit_markup_token( $value ) {
	if ( ! is_string( $value ) ) {
		return '';
	}
	if ( false === strpos( $value, '<' ) && false === stripos( $value, 'javascript:' ) ) {
		return '';
	}
	if ( preg_match( '#<\s*(script|iframe|embed|svg|math|style|link|meta|base|form)\b#i', $value, $m ) ) {
		return '<' . strtolower( $m[1] ) . '>';
	}
	if ( preg_match( '#\son[a-z]+\s*=#i', $value, $m ) ) {
		return trim( $m[0] );
	}
	if ( preg_match( '#(?:href|src|action)\s*=\s*["\']?\s*javascript:#i', $value ) ) {
		return 'javascript:';
	}

	return '';
}

/**
 * One-time content audit: stored content that still carries executable
 * markup (persisted before kses became unconditional). Scans post_content
 * (raw, plus every string attr inside block comments), post_excerpt, all
 * non-private post meta, and the Chapter Settings options. Report only —
 * cleaning is an editorial decision made in wp-admin.
 *
 * @param WP_Post[]|null $posts Posts to scan; null → every non-trashed post of any type.
 * @return array<int,array{where:string,id:int,field:string,token:string}>
 */
function progressnow_audit_stored_markup( $posts = null ) {
	$findings = array();

	$walk = function ( $node, $path, &$out ) use ( &$walk ) {
		if ( is_array( $node ) ) {
			foreach ( $node as $key => $value ) {
				$walk( $value, '' === $path ? (string) $key : $path . '.' . $key, $out );
			}
			return;
		}
		$token = progressnow_audit_markup_token( $node );
		if ( '' !== $token ) {
			$out[] = array( 'field' => $path, 'token' => $token );
		}
	};

	if ( null === $posts ) {
		$posts = get_posts(
			array(
				'post_type'        => 'any',
				'post_status'      => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'   => -1,
				'suppress_filters' => true,
			)
		);
	}

	foreach ( $posts as $post ) {
		$id = (int) $post->ID;

		foreach ( array( 'post_content', 'post_excerpt' ) as $column ) {
			$token = progressnow_audit_markup_token( (string) $post->$column );
			if ( '' !== $token ) {
				$findings[] = array( 'where' => 'post', 'id' => $id, 'field' => $column, 'token' => $token );
			}
		}

		if ( has_blocks( $post->post_content ) ) {
			foreach ( parse_blocks( $post->post_content ) as $block ) {
				$hits = array();
				$walk( $block['attrs'] ?? array(), 'attrs', $hits );
				foreach ( $hits as $hit ) {
					$findings[] = array(
						'where' => 'block:' . (string) ( $block['blockName'] ?? '' ),
						'id'    => $id,
						'field' => $hit['field'],
						'token' => $hit['token'],
					);
				}
			}
		}

		foreach ( (array) get_post_meta( $id ) as $key => $values ) {
			if ( '_' === substr( (string) $key, 0, 1 ) ) {
				continue;
			}
			foreach ( (array) $values as $value ) {
				$value = maybe_unserialize( $value );
				$hits  = array();
				$walk( $value, (string) $key, $hits );
				foreach ( $hits as $hit ) {
					$findings[] = array( 'where' => 'meta', 'id' => $id, 'field' => $hit['field'], 'token' => $hit['token'] );
				}
			}
		}
	}

	// ACF options page fields are stored as options_{name} (not autoloaded,
	// so wp_load_alloptions() misses them).
	global $wpdb;
	$rows = $wpdb->get_results( "SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE 'options\\_%'", ARRAY_A );
	foreach ( (array) $rows as $row ) {
		$hits = array();
		$walk( maybe_unserialize( $row['option_value'] ), substr( (string) $row['option_name'], 8 ), $hits );
		foreach ( $hits as $hit ) {
			$findings[] = array( 'where' => 'option', 'id' => 0, 'field' => $hit['field'], 'token' => $hit['token'] );
		}
	}

	return $findings;
}
