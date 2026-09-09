<?php
/**
 * Shared output sanitizers for values that reach island attribute bindings.
 *
 * Block-comment JSON attrs and post meta never pass through wp_kses, so a
 * URL-valued field bound to `:href` / `:src` in an island can carry a
 * `javascript:` (or `data:` / `vbscript:`) scheme straight to the DOM. Every
 * URL that flows into a REST payload or embedded island context goes through
 * progressnow_safe_url() at serialize time.
 *
 * Public contract (other domains call these):
 * - progressnow_safe_url( $raw ): string — esc_url_raw() restricted to
 *   http/https/mailto/tel; '' when rejected so callers can omit the key.
 * - progressnow_plain_text( $value ): string — trimmed, entity-decoded plain
 *   text for a field that is rendered as text (Twig `{{ }}`, island props).
 */

/**
 * Plain text from kses-normalized storage. Every save runs through kses
 * (inc/roles.php), which stores `&` as `&amp;` and stray `<` as `&lt;`; a
 * value bound as *text* must carry the literal characters and be escaped
 * once at render (Twig autoescape / Vue). Not for HTML-bearing fields —
 * those keep their entities and go through wp_kses_post.
 *
 * @param mixed $value Stored value.
 * @return string
 */
function progressnow_plain_text( $value ) {
	if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
		return '';
	}

	return trim( html_entity_decode( (string) $value, ENT_QUOTES, 'UTF-8' ) );
}

/**
 * Allowed URL schemes for front-end link/src sinks.
 *
 * @return string[]
 */
function progressnow_safe_url_protocols() {
	return array( 'http', 'https', 'mailto', 'tel' );
}

/**
 * Escape a URL for storage in a serialized contract, dropping anything not on
 * the scheme allow-list. Scheme-relative and path-relative URLs are kept
 * (esc_url_raw resolves them against http). Non-string / empty input → ''.
 *
 * @param mixed $raw Candidate URL.
 * @return string Escaped URL, or '' when rejected.
 */
function progressnow_safe_url( $raw ) {
	if ( ! is_string( $raw ) && ! is_numeric( $raw ) ) {
		return '';
	}
	// kses-normalized storage (every role saves through kses, inc/roles.php)
	// holds `?a=1&amp;b=2`; a bound :href/:src needs the literal `&`.
	$raw = trim( html_entity_decode( (string) $raw, ENT_QUOTES, 'UTF-8' ) );
	if ( '' === $raw ) {
		return '';
	}

	return (string) esc_url_raw( $raw, progressnow_safe_url_protocols() );
}

/**
 * One-time content audit: find stored URL values that progressnow_safe_url()
 * would reject (dangerous or non-allow-listed scheme).
 *
 * Scans every published/draft/pending/private post's block attrs for URL-ish
 * keys, the event `rsvp_url` meta, and the URL-valued Chapter Settings
 * options. Report only — nothing is modified.
 *
 * @param WP_Post[]|null $posts Posts to scan; null → every non-trashed post of any type.
 * @return array<int,array{where:string,id:int,field:string,value:string}>
 */
function progressnow_audit_unsafe_urls( $posts = null ) {
	$findings = array();
	$url_keys = array( 'url', 'transcript_url', 'link_url', 'href', 'src' );

	$is_unsafe = function ( $value ) {
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return false;
		}
		return '' === progressnow_safe_url( $value );
	};

	// Walk block attrs recursively; collect unsafe values under URL-ish keys.
	$walk = function ( $node, $path, &$out ) use ( &$walk, $url_keys, $is_unsafe ) {
		if ( ! is_array( $node ) ) {
			return;
		}
		foreach ( $node as $key => $value ) {
			$here = '' === $path ? (string) $key : $path . '.' . $key;
			if ( is_array( $value ) ) {
				$walk( $value, $here, $out );
			} elseif ( in_array( (string) $key, $url_keys, true ) && $is_unsafe( $value ) ) {
				$out[] = array( 'field' => $here, 'value' => (string) $value );
			}
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
		if ( has_blocks( $post->post_content ) ) {
			foreach ( parse_blocks( $post->post_content ) as $block ) {
				$hits = array();
				$walk( $block['attrs'] ?? array(), 'attrs', $hits );
				// core/image with no attachment id falls back to the <img src>.
				if ( 'core/image' === ( $block['blockName'] ?? '' ) && preg_match( '#<img[^>]*\ssrc="([^"]+)"#', (string) ( $block['innerHTML'] ?? '' ), $m ) ) {
					$src = html_entity_decode( $m[1], ENT_QUOTES, 'UTF-8' );
					if ( $is_unsafe( $src ) ) {
						$hits[] = array( 'field' => 'innerHTML.img.src', 'value' => $src );
					}
				}
				foreach ( $hits as $hit ) {
					$findings[] = array(
						'where' => 'block:' . (string) ( $block['blockName'] ?? '' ),
						'id'    => (int) $post->ID,
						'field' => $hit['field'],
						'value' => $hit['value'],
					);
				}
			}
		}

		if ( 'event' === $post->post_type ) {
			$rsvp = get_post_meta( $post->ID, 'rsvp_url', true );
			if ( $is_unsafe( $rsvp ) ) {
				$findings[] = array( 'where' => 'meta', 'id' => (int) $post->ID, 'field' => 'rsvp_url', 'value' => (string) $rsvp );
			}
		}

		// Page/front-page ACF URL fields live in post meta under their field name.
		foreach ( array( 'about_committees_link_url', 'gi_card_link_url', 'hero_cta_primary_url', 'hero_cta_secondary_url', 'who_link_url' ) as $name ) {
			$value = get_post_meta( $post->ID, $name, true );
			if ( $is_unsafe( $value ) ) {
				$findings[] = array( 'where' => 'meta', 'id' => (int) $post->ID, 'field' => $name, 'value' => (string) $value );
			}
		}
	}

	// ACF options page URL fields (stored as options_{name}).
	foreach ( array( 'join_url', 'newsletter_url', 'instagram_url', 'facebook_url', 'twitter_url', 'newhere_link_url' ) as $name ) {
		$value = get_option( 'options_' . $name, '' );
		if ( $is_unsafe( $value ) ) {
			$findings[] = array( 'where' => 'option', 'id' => 0, 'field' => $name, 'value' => (string) $value );
		}
	}

	return $findings;
}
