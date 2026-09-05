<?php
/**
 * REST domain: the first-party read API (`/wp-json/progressnow/v1`).
 *
 * GET-only, public, publish-only. Handlers reuse the domain serializers and
 * the shared query/payload builders so REST shapes cannot drift from the
 * embedded Twig contexts. Payloads are transient-cached (content-version
 * invalidation); anonymous responses get Cache-Control + ETag/304.
 *
 * Routes:
 * - GET /posts            → { posts: BlogPost[], page, perPage, total, totalPages }
 * - GET /posts/{slug}     → SinglePostData + { readNext, languages, seo }
 * - GET /events           → { events: ChapterEvent[], categories: EventCategory[] }
 * - GET /events/{slug}    → { event: SingleEventData, categories, related, showRelated, homeUrl, calendarUrl, languages, seo }
 * - GET /categories       → { categories: EventCategory[] }
 * - GET /site             → chrome payload (identity, chapter, header, footer, strings, languages)
 * - GET /routes           → { routes: [{ path, kind, lang, id, template, payloadKey }], contentVersion }
 * - GET /front-page       → front page payload (hero, who, events, blog teasers, seo)
 * - GET /pages/{path}     → page payload (interior / About / Get Involved / Calendar groups, seo)
 * - POST /build-status    → signed build callback (inc/rebuild.php)
 *
 * Every read endpoint accepts `lang` (a valid Polylang slug; otherwise the
 * site default) and includes it in its cache key.
 *
 * Versioning policy: additive changes stay on /v1; renames/removals go to /v2.
 */

add_action( 'rest_api_init', 'progressnow_rest_register_routes' );

function progressnow_rest_register_routes() {
	$lang_arg = array(
		'type'              => 'string',
		'sanitize_callback' => 'sanitize_key',
	);

	register_rest_route(
		'progressnow/v1',
		'/posts',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'progressnow_rest_posts',
			'permission_callback' => '__return_true',
			'args'                => array(
				'page'     => array(
					'type'    => 'integer',
					'default' => 1,
					'minimum' => 1,
				),
				'per_page' => array(
					'type'    => 'integer',
					'default' => 24,
					'minimum' => 1,
					'maximum' => 50,
				),
				'category' => array(
					'type' => 'string',
					'enum' => array_keys( progressnow_category_registry() ),
				),
				's'        => array(
					'type'              => 'string',
					'maxLength'         => 100,
					'sanitize_callback' => 'sanitize_text_field',
				),
				'lang'     => $lang_arg,
			),
		)
	);

	register_rest_route(
		'progressnow/v1',
		'/posts/(?P<slug>[a-z0-9-]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'progressnow_rest_single_post',
			'permission_callback' => '__return_true',
			'args'                => array(
				'slug' => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_title',
				),
				'lang' => $lang_arg,
			),
		)
	);

	register_rest_route(
		'progressnow/v1',
		'/events',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'progressnow_rest_events',
			'permission_callback' => '__return_true',
			'args'                => array(
				'after'  => array(
					'type'              => 'string',
					'validate_callback' => 'progressnow_rest_validate_date',
				),
				'before' => array(
					'type'              => 'string',
					'validate_callback' => 'progressnow_rest_validate_date',
				),
				'lang'   => $lang_arg,
			),
		)
	);

	register_rest_route(
		'progressnow/v1',
		'/events/(?P<slug>[a-z0-9-]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'progressnow_rest_single_event',
			'permission_callback' => '__return_true',
			'args'                => array(
				'slug' => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_title',
				),
				'lang' => $lang_arg,
			),
		)
	);

	register_rest_route(
		'progressnow/v1',
		'/categories',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'progressnow_rest_categories',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'progressnow/v1',
		'/site',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'progressnow_rest_site',
			'permission_callback' => '__return_true',
			'args'                => array( 'lang' => $lang_arg ),
		)
	);

	register_rest_route(
		'progressnow/v1',
		'/routes',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'progressnow_rest_routes',
			'permission_callback' => '__return_true',
		)
	);

	register_rest_route(
		'progressnow/v1',
		'/front-page',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'progressnow_rest_front_page',
			'permission_callback' => '__return_true',
			'args'                => array( 'lang' => $lang_arg ),
		)
	);

	register_rest_route(
		'progressnow/v1',
		'/pages/(?P<path>[a-z0-9\-/]+)',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'progressnow_rest_page',
			'permission_callback' => '__return_true',
			'args'                => array(
				'path' => array(
					'type'              => 'string',
					'sanitize_callback' => 'progressnow_rest_sanitize_path',
				),
				'lang' => $lang_arg,
			),
		)
	);
}

/**
 * `Y-m-d` arg validator (core handles the 400 envelope).
 */
function progressnow_rest_validate_date( $value ) {
	if ( ! is_string( $value ) || ! preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', $value, $m ) ) {
		return false;
	}

	return checkdate( (int) $m[2], (int) $m[3], (int) $m[1] );
}

/**
 * Page path sanitizer: slug segments only, no dots, no leading slash.
 */
function progressnow_rest_sanitize_path( $value ) {
	$segments = array_map( 'sanitize_title', explode( '/', (string) $value ) );

	return implode( '/', array_filter( $segments, 'strlen' ) );
}

/**
 * Resolve the request language for the first-party API.
 *
 * The clients send the page language as `?lang=` (Polylang does not resolve the
 * language of a bare `/wp-json/progressnow/v1` request on its own). A valid slug is
 * honored; anything else falls back to the site default language so a param-less
 * hit behaves as the English site. Returns '' only when Polylang is inactive
 * (queries then run unfiltered across all languages). The value is threaded into
 * the shared query builders and the transient cache keys, so each language keeps
 * its own cached payload.
 *
 * @param WP_REST_Request $request Current request.
 * @return string Language slug, or '' when Polylang is unavailable.
 */
function progressnow_rest_resolve_lang( WP_REST_Request $request ) {
	if ( ! function_exists( 'pll_languages_list' ) ) {
		return '';
	}

	return progressnow_lang_normalize( (string) ( $request['lang'] ?? '' ) );
}

/**
 * Standard 404 envelope.
 */
function progressnow_rest_not_found( $code, $message ) {
	return new WP_Error( $code, $message, array( 'status' => 404 ) );
}

/* -------------------------------------------------------------------------
 * Handlers.
 * ---------------------------------------------------------------------- */

/**
 * GET /posts — paginated envelope over the shared blog query (same code
 * path as the Twig archive context, so shapes cannot drift).
 */
function progressnow_rest_posts( WP_REST_Request $request ) {
	$page     = (int) $request['page'];
	$per_page = (int) $request['per_page'];
	$category = (string) ( $request['category'] ?? '' );
	$search   = trim( (string) ( $request['s'] ?? '' ) );
	$lang     = progressnow_rest_resolve_lang( $request );

	$payload = progressnow_cache_remember(
		'rest_posts_' . md5( wp_json_encode( array( $lang, $page, $per_page, $category, $search ) ) ),
		static function () use ( $lang, $page, $per_page, $category, $search ) {
			return progressnow_payload_posts( $lang, $page, $per_page, $category, $search );
		}
	);

	return rest_ensure_response( $payload );
}

/**
 * GET /posts/{slug} — SinglePostData plus the Read Next pool, languages, seo.
 */
function progressnow_rest_single_post( WP_REST_Request $request ) {
	$slug = (string) $request['slug'];
	$lang = progressnow_rest_resolve_lang( $request );

	$payload = progressnow_cache_remember(
		'rest_single_' . md5( $lang . '|' . $slug ),
		static function () use ( $lang, $slug ) {
			return progressnow_payload_post( $slug, $lang ) ?: array();
		}
	);

	if ( ! $payload ) {
		return progressnow_rest_not_found( 'progressnow_post_not_found', 'No published post matches that slug.' );
	}

	return rest_ensure_response( $payload );
}

/**
 * GET /events — the calendar window (defaults −1 month → +12 months).
 */
function progressnow_rest_events( WP_REST_Request $request ) {
	$lang   = progressnow_rest_resolve_lang( $request );
	$now    = new DateTimeImmutable( 'now', progressnow_events_timezone() );
	$after  = (string) ( $request['after'] ?? $now->modify( '-1 month' )->format( 'Y-m-d' ) );
	$before = (string) ( $request['before'] ?? $now->modify( '+12 months' )->format( 'Y-m-d' ) );

	$payload = progressnow_cache_remember(
		'rest_events_' . md5( $lang . '|' . $after . '|' . $before ),
		static function () use ( $lang, $after, $before ) {
			$posts = progressnow_events_query(
				array(
					'lang'       => $lang,
					'meta_query' => array(
						array(
							'key'     => 'start_datetime',
							'value'   => array( $after . ' 00:00:00', $before . ' 23:59:59' ),
							'compare' => 'BETWEEN',
							'type'    => 'DATETIME',
						),
					),
				)
			);

			return array(
				'events'     => array_values( array_filter( array_map( 'progressnow_event_to_chapter_event', $posts ) ) ),
				'categories' => progressnow_event_categories(),
			);
		}
	);

	return rest_ensure_response( $payload );
}

/**
 * GET /events/{slug} — the single-event payload.
 */
function progressnow_rest_single_event( WP_REST_Request $request ) {
	$slug = (string) $request['slug'];
	$lang = progressnow_rest_resolve_lang( $request );

	$payload = progressnow_cache_remember(
		'rest_event_' . md5( $lang . '|' . $slug ),
		static function () use ( $lang, $slug ) {
			return progressnow_payload_event( $slug, $lang ) ?: array();
		}
	);

	if ( ! $payload ) {
		return progressnow_rest_not_found( 'progressnow_event_not_found', 'No published event matches that slug.' );
	}

	return rest_ensure_response( $payload );
}

/**
 * GET /categories — the six canonical blog categories.
 */
function progressnow_rest_categories() {
	return rest_ensure_response(
		array( 'categories' => progressnow_cache_remember( 'rest_categories', 'progressnow_post_categories' ) )
	);
}

/**
 * GET /site — chrome payload for a language.
 */
function progressnow_rest_site( WP_REST_Request $request ) {
	$lang = progressnow_rest_resolve_lang( $request );

	return rest_ensure_response(
		progressnow_cache_remember(
			'rest_site_' . md5( $lang ),
			static function () use ( $lang ) {
				return progressnow_payload_site( $lang );
			}
		)
	);
}

/**
 * GET /routes — every public route in every language (prerender manifest).
 */
function progressnow_rest_routes() {
	return rest_ensure_response( progressnow_cache_remember( 'rest_routes', 'progressnow_payload_routes' ) );
}

/**
 * GET /front-page — the front page payload for a language.
 */
function progressnow_rest_front_page( WP_REST_Request $request ) {
	$lang = progressnow_rest_resolve_lang( $request );

	return rest_ensure_response(
		progressnow_cache_remember(
			'rest_front_' . md5( $lang ),
			static function () use ( $lang ) {
				return progressnow_payload_front( $lang );
			}
		)
	);
}

/**
 * GET /pages/{path} — a page payload for a language.
 */
function progressnow_rest_page( WP_REST_Request $request ) {
	$path = (string) $request['path'];
	$lang = progressnow_rest_resolve_lang( $request );

	$payload = progressnow_cache_remember(
		'rest_page_' . md5( $lang . '|' . $path ),
		static function () use ( $lang, $path ) {
			return progressnow_payload_page( $path, $lang ) ?: array();
		}
	);

	if ( ! $payload ) {
		return progressnow_rest_not_found( 'progressnow_page_not_found', 'No published page matches that path.' );
	}

	return rest_ensure_response( $payload );
}

/* -------------------------------------------------------------------------
 * HTTP caching — namespace-scoped headers on the dispatched response.
 * ---------------------------------------------------------------------- */

add_filter( 'rest_post_dispatch', 'progressnow_rest_cache_headers', 10, 3 );

function progressnow_rest_cache_headers( $result, $server, $request ) {
	if ( 0 !== strpos( $request->get_route(), '/progressnow/v1' ) ) {
		return $result;
	}
	if ( ! ( $result instanceof WP_REST_Response ) || $result->get_status() >= 400 ) {
		return $result;
	}
	if ( 'GET' !== $request->get_method() ) {
		$result->header( 'Cache-Control', 'no-store' );

		return $result;
	}

	// Editors always see fresh data.
	if ( is_user_logged_in() ) {
		$result->header( 'Cache-Control', 'no-store' );

		return $result;
	}

	$etag = '"' . md5( (string) wp_json_encode( $result->get_data() ) ) . '"';
	$result->header( 'Cache-Control', 'public, max-age=300, stale-while-revalidate=3600' );
	$result->header( 'ETag', $etag );

	if ( trim( (string) $request->get_header( 'if_none_match' ) ) === $etag ) {
		$result->set_status( 304 );
		$result->set_data( null );
	}

	return $result;
}
