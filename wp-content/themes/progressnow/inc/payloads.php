<?php
/**
 * Route payloads — the ONE place a route's data is assembled for both the
 * PHP shell (embedded `__SHELL_DATA__`) and the REST API (`nuxt generate`
 * + client navigation). Because both call these builders, the embedded
 * payload equals the REST response by construction (php-shell-handoff).
 *
 * Key grammar (shared with the Nuxt app's useChapterData()):
 *   site:{lang} | routes | front:{lang} | page:{lang}:{path} |
 *   post:{lang}:{slug} | event:{lang}:{slug}
 *
 * Public contract:
 * - progressnow_payload_key( $kind, $lang, $slug ): string
 * - progressnow_lang_default() / progressnow_lang_list(): string | string[]
 * - progressnow_lang_switch( $lang ) / progressnow_lang_restore( $previous )
 * - progressnow_payload_site( $lang ): array
 * - progressnow_payload_routes(): array
 * - progressnow_payload_front( $lang ): array|null
 * - progressnow_payload_page( $path, $lang ): array|null
 * - progressnow_payload_post( $slug, $lang ): array|null
 * - progressnow_payload_event( $slug, $lang ): array|null
 * - progressnow_page_uses_template( $post_id, $template ): bool
 */

/* -------------------------------------------------------------------------
 * Keys + languages.
 * ---------------------------------------------------------------------- */

/**
 * The payload key for a route kind.
 *
 * @param string $kind site|routes|front|posts|page|post|event.
 * @param string $lang Language slug ('' without Polylang).
 * @param string $slug Page path, post slug, or event slug.
 * @return string
 */
function progressnow_payload_key( $kind, $lang = '', $slug = '' ) {
	switch ( $kind ) {
		case 'routes':
			return 'routes';
		case 'site':
		case 'front':
		case 'posts':
			return $kind . ':' . $lang;
		default:
			return $kind . ':' . $lang . ':' . trim( (string) $slug, '/' );
	}
}

/**
 * Key for a posts-page list: `posts:{lang}` for the first browse page,
 * `posts:{lang}:{page}:{category}` for any other state (mirrors
 * site/app/lib/chapter/keys.ts postsKey()).
 *
 * @param string $lang     Language slug.
 * @param int    $page     1-based page.
 * @param string $category Category slug or ''.
 * @return string
 */
function progressnow_payload_posts_key( $lang, $page = 1, $category = '' ) {
	$page = max( 1, (int) $page );
	if ( 1 === $page && '' === $category ) {
		return progressnow_payload_key( 'posts', $lang );
	}

	return progressnow_payload_key( 'posts', $lang ) . ':' . $page . ':' . $category;
}

/**
 * Site default language slug ('' without Polylang).
 */
function progressnow_lang_default() {
	return function_exists( 'pll_default_language' ) ? (string) pll_default_language() : '';
}

/**
 * All site language slugs ([''] without Polylang, so loops still run once).
 *
 * @return string[]
 */
function progressnow_lang_list() {
	if ( function_exists( 'pll_languages_list' ) ) {
		$list = array_values( array_map( 'strval', (array) pll_languages_list() ) );
		if ( $list ) {
			return $list;
		}
	}

	return array( '' );
}

/**
 * Normalize a requested language slug: a valid slug, else the site default.
 */
function progressnow_lang_normalize( $lang ) {
	$lang = sanitize_key( (string) $lang );
	if ( '' !== $lang && in_array( $lang, progressnow_lang_list(), true ) ) {
		return $lang;
	}

	return progressnow_lang_default();
}

/**
 * Make $lang the current Polylang language for the rest of the request so
 * pll__(), pll_current_language(), the query builders' default language and
 * menu resolution all follow it (a bare REST request has no language).
 * Loads that language's string translations, like the front end does.
 *
 * @param string $lang Language slug.
 * @return mixed Previous language object (pass to progressnow_lang_restore()).
 */
function progressnow_lang_switch( $lang ) {
	if ( '' === $lang || ! function_exists( 'PLL' ) || ! PLL() || empty( PLL()->model ) ) {
		return null;
	}
	$previous = PLL()->curlang ?? null;
	$language = PLL()->model->get_language( $lang );
	if ( ! $language ) {
		return $previous;
	}
	PLL()->curlang = $language;

	if ( class_exists( 'PLL_MO' ) ) {
		$mo = new PLL_MO();
		$mo->import_from_db( $language );
		$GLOBALS['l10n']['pll_string'] = &$mo;
	}

	return $previous;
}

/**
 * Undo progressnow_lang_switch().
 */
function progressnow_lang_restore( $previous ) {
	if ( function_exists( 'PLL' ) && PLL() && property_exists( PLL(), 'curlang' ) ) {
		PLL()->curlang = $previous;
	}
}

/**
 * The language of a post ('' without Polylang).
 */
function progressnow_lang_of_post( $post_id ) {
	return function_exists( 'pll_get_post_language' ) ? (string) pll_get_post_language( (int) $post_id ) : '';
}

/**
 * Resolve $post_id to its translation in $lang (itself when already in that
 * language, or when Polylang is inactive). 0 when no translation exists.
 */
function progressnow_lang_translation( $post_id, $lang ) {
	$post_id = (int) $post_id;
	if ( ! $post_id ) {
		return 0;
	}
	if ( '' === $lang || ! function_exists( 'pll_get_post' ) ) {
		return $post_id;
	}
	if ( progressnow_lang_of_post( $post_id ) === $lang ) {
		return $post_id;
	}

	return (int) pll_get_post( $post_id, $lang );
}

/**
 * Home URL for a language.
 */
function progressnow_lang_home_url( $lang ) {
	if ( '' !== $lang && function_exists( 'pll_home_url' ) ) {
		return (string) pll_home_url( $lang );
	}

	return home_url( '/' );
}

/**
 * Route path of a URL: the path component ('/' minimum, trailing-slashed),
 * plus the query string when the site runs without pretty permalinks (so
 * `?page_id=5` routes stay distinct instead of collapsing to `/`).
 */
function progressnow_payload_path( $url ) {
	$path  = (string) wp_parse_url( (string) $url, PHP_URL_PATH );
	$path  = '' === $path ? '/' : trailingslashit( $path );
	$query = (string) wp_parse_url( (string) $url, PHP_URL_QUERY );

	return '' === $query ? $path : $path . '?' . $query;
}

/**
 * Does the page use the given template file? Works outside the main query
 * (the `is_page_template()` conditional reads the queried object).
 *
 * @param int    $post_id  Page ID.
 * @param string $template Template file relative to the theme.
 * @return bool
 */
function progressnow_page_uses_template( $post_id, $template ) {
	return $post_id && get_page_template_slug( (int) $post_id ) === $template;
}

/**
 * Route kind for a page: front | posts_index | about | get_involved |
 * calendar | styleguide | page.
 */
function progressnow_page_kind( $post_id ) {
	$post_id = (int) $post_id;
	$front   = (int) get_option( 'page_on_front' );
	$posts   = (int) get_option( 'page_for_posts' );

	if ( $front && ( $post_id === $front || $post_id === progressnow_lang_translation( $front, progressnow_lang_of_post( $post_id ) ) ) ) {
		return 'front';
	}
	if ( $posts && ( $post_id === $posts || $post_id === progressnow_lang_translation( $posts, progressnow_lang_of_post( $post_id ) ) ) ) {
		return 'posts_index';
	}

	$templates = array(
		'page-templates/about.php'        => 'about',
		'page-templates/get-involved.php' => 'get_involved',
		'page-templates/calendar.php'     => 'calendar',
		'page-templates/styleguide.php'   => 'styleguide',
	);
	$slug      = (string) get_page_template_slug( $post_id );

	return $templates[ $slug ] ?? 'page';
}

/* -------------------------------------------------------------------------
 * Chrome (site payload).
 * ---------------------------------------------------------------------- */

/**
 * Site payload: everything the header/footer/app chrome needs for a language.
 *
 * @param string $lang Language slug.
 * @return array
 */
function progressnow_payload_site( $lang ) {
	$lang     = progressnow_lang_normalize( $lang );
	$previous = progressnow_lang_switch( $lang );

	$site     = StarterSite::instance();
	$identity = progressnow_identity();
	$chapter  = $site->chapter_context();
	$menus    = function_exists( 'progressnow_i18n_header_menus' ) ? progressnow_i18n_header_menus() : array( 'nav' => null, 'about' => null );
	$t        = function_exists( 'pll__' ) ? 'pll__' : 'strval';
	$home     = progressnow_lang_home_url( $lang );

	$languages = array();
	foreach ( progressnow_lang_list() as $slug ) {
		if ( '' === $slug ) {
			continue;
		}
		$names       = function_exists( 'pll_languages_list' ) ? (array) pll_languages_list( array( 'fields' => 'name' ) ) : array();
		$index       = array_search( $slug, progressnow_lang_list(), true );
		$languages[] = array(
			'code'   => $slug,
			'label'  => strtoupper( $slug ),
			'name'   => isset( $names[ $index ] ) ? (string) $names[ $index ] : strtoupper( $slug ),
			'active' => $slug === $lang,
			'url'    => progressnow_lang_home_url( $slug ),
		);
	}

	$strings = array();
	foreach ( progressnow_i18n_strings() as $slug => $string ) {
		$strings[ $slug ] = (string) $t( $string );
	}

	$payload = array(
		'lang'      => $lang,
		'homeUrl'   => $home,
		'apiBase'   => rest_url( 'progressnow/v1' ),
		'languages' => $languages,
		'chapter'   => $chapter,
		'identity'  => $identity,
		'header'    => array(
			'navItems'   => $menus['nav'],
			'aboutItems' => $menus['about'],
			'joinLabel'  => (string) $t( 'Join us' ),
			'joinShortLabel' => (string) $t( 'Join' ),
			'aboutLabel' => (string) $t( 'About' ),
			'joinUrl'    => $chapter['join_url'],
			'logoUrl'    => $identity['logo_header']['src'],
			// True while no logo is uploaded → the chrome draws the wordmark lockup (D5).
			'logoIsDefault' => ! empty( $identity['logo_header']['is_default'] ),
			'orgName'    => $identity['name'],
			// Root-relative on purpose: the logo link must not hard-code the
			// origin (static shell may be served from another host/CDN).
			'homeUrl'    => progressnow_payload_path( $home ),
		),
		'footer'    => array(
			'logoUrl'       => $identity['logo_footer']['src'],
			'logoIsDefault' => ! empty( $identity['logo_footer']['is_default'] ),
			'orgName'       => $identity['name'],
			'columns'       => $site->footer_columns(),
			'socials'       => $chapter['socials'],
			'contactEmail'  => $chapter['contact_email'],
			'tagline'       => $chapter['footer_tagline'],
			'a11yLead'      => (string) $t( 'Built to be accessible —' ),
			'a11yLinkLabel' => (string) $t( 'tell us how we can do better.' ),
		),
		'strings'    => $strings,
		// Same rows as GET /categories — the app seeds its palette from the site
		// envelope instead of a second request.
		'categories' => array_values( progressnow_post_categories() ),
	);

	progressnow_lang_restore( $previous );

	return $payload;
}

/* -------------------------------------------------------------------------
 * Route manifest.
 * ---------------------------------------------------------------------- */

/**
 * Every public route in every language.
 *
 * @return array{routes:array,contentVersion:int,generatedAt:string}
 */
function progressnow_payload_routes() {
	$routes = array();
	$seen   = array();

	$add = static function ( $path, $kind, $lang, $id, $template, $slug ) use ( &$routes, &$seen ) {
		if ( isset( $seen[ $path ] ) ) {
			return;
		}
		$seen[ $path ] = true;
		$key_kind      = in_array( $kind, array( 'front', 'post', 'event' ), true ) ? $kind : 'page';
		$routes[]      = array(
			'path'       => $path,
			'kind'       => $kind,
			'lang'       => $lang,
			'id'         => (int) $id,
			'template'   => $template,
			'payloadKey' => progressnow_payload_key( $key_kind, $lang, 'front' === $kind ? '' : $slug ),
		);
	};

	$front = (int) get_option( 'page_on_front' );
	$posts = (int) get_option( 'page_for_posts' );

	foreach ( progressnow_lang_list() as $lang ) {
		// Front page (static front page, or the home URL when posts are on front).
		$front_id = $front ? progressnow_lang_translation( $front, $lang ) : 0;
		$add( progressnow_payload_path( $front_id ? get_permalink( $front_id ) : progressnow_lang_home_url( $lang ) ), 'front', $lang, $front_id, 'front-page', '' );

		// Pages (WP_Query so Polylang's `lang` filter applies).
		$pages = ( new WP_Query(
			array(
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'no_found_rows'  => true,
				'lang'           => $lang,
				'orderby'        => 'menu_order title',
				'order'          => 'ASC',
			)
		) )->posts;
		foreach ( $pages as $page ) {
			if ( (int) $page->ID === $front_id ) {
				continue;
			}
			if ( '' !== $lang && progressnow_lang_of_post( $page->ID ) !== $lang ) {
				continue;
			}
			$kind = progressnow_page_kind( $page->ID );
			$path = progressnow_payload_path( get_permalink( $page ) );
			// The payload key carries the page URI (slug hierarchy) — what
			// /pages/{path} resolves — independent of the permalink structure.
			$slug = trim( (string) get_page_uri( $page ), '/' ) ?: $page->post_name;
			$add( $path, $kind, $lang, $page->ID, (string) get_page_template_slug( $page->ID ) ?: 'page.php', $slug );
		}

		// Posts.
		$query = progressnow_blog_posts_query( array( 'posts_per_page' => -1, 'no_found_rows' => true, 'lang' => $lang ) );
		foreach ( $query->posts as $post ) {
			$add( progressnow_payload_path( get_permalink( $post ) ), 'post', $lang, $post->ID, 'single.php', $post->post_name );
		}

		// Events.
		foreach ( progressnow_events_query( array( 'lang' => $lang ) ) as $event ) {
			$add( progressnow_payload_path( get_permalink( $event ) ), 'event', $lang, $event->ID, 'single-event.php', $event->post_name );
		}
	}

	return array(
		'routes'         => $routes,
		'contentVersion' => function_exists( 'progressnow_content_version' ) ? progressnow_content_version() : 1,
		'generatedAt'    => gmdate( 'c' ),
	);
}

/* -------------------------------------------------------------------------
 * Route payloads.
 * ---------------------------------------------------------------------- */

/**
 * The language links for a post (translations, else language homes).
 */
function progressnow_payload_languages( $post_id ) {
	return function_exists( 'progressnow_i18n_languages_for_post' ) ? progressnow_i18n_languages_for_post( (int) $post_id ) : array();
}

/**
 * Front page payload for a language.
 *
 * @param string $lang Language slug.
 * @return array
 */
function progressnow_payload_front( $lang ) {
	$lang     = progressnow_lang_normalize( $lang );
	$previous = progressnow_lang_switch( $lang );

	$front_id = progressnow_lang_translation( (int) get_option( 'page_on_front' ), $lang );
	$post     = $front_id ? get_post( $front_id ) : null;

	// The same filter chain front-page.php runs (options → events → blog).
	$context = apply_filters( 'progressnow/context/front_page', array(), $post );

	$payload = array(
		'lang'        => $lang,
		'id'          => $front_id,
		'path'        => progressnow_payload_path( $front_id ? get_permalink( $front_id ) : progressnow_lang_home_url( $lang ) ),
		'hero'        => $context['hero'] ?? array(),
		'who'         => $context['who'] ?? array(),
		'cta'         => $context['cta'] ?? array( 'line' => '' ),
		'eventCount'  => (int) ( $context['event_count'] ?? 5 ),
		'events'      => array_values( (array) ( $context['home_events'] ?? array() ) ),
		'calendarUrl' => (string) ( $context['calendar_url'] ?? '' ),
		'blog'        => array(
			'featured' => $context['blog_featured'] ?? null,
			'rows'     => array_values( (array) ( $context['blog_rows'] ?? array() ) ),
		),
		'languages'   => $front_id ? progressnow_payload_languages( $front_id ) : array(),
		'seo'         => progressnow_seo_payload( $front_id ? progressnow_seo_subject_for_post( $front_id ) : progressnow_seo_subject_from_query() ),
	);

	progressnow_lang_restore( $previous );

	return $payload;
}

/**
 * Resolve a page path within a language. Returns the page ID or 0.
 *
 * @param string $path Page path (no language prefix).
 * @param string $lang Language slug.
 * @return int
 */
function progressnow_payload_resolve_page( $path, $lang ) {
	$path = trim( (string) $path, '/' );
	if ( '' === $path ) {
		return 0;
	}
	$segments = explode( '/', $path );
	$slug     = end( $segments );

	// WP_Query (not get_page_by_path's raw SQL) so language filtering and the
	// test seam both apply. First the requested language, then any language
	// (an English path on the Spanish site → its translation).
	foreach ( array( $lang, '' ) as $query_lang ) {
		$query = new WP_Query(
			array(
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'name'           => $slug,
				'posts_per_page' => -1,
				'no_found_rows'  => true,
				'lang'           => $query_lang,
			)
		);
		foreach ( $query->posts as $page ) {
			if ( trim( (string) get_page_uri( $page ), '/' ) === $path ) {
				$resolved = progressnow_lang_translation( $page->ID, $lang );
				if ( $resolved ) {
					return $resolved;
				}
			}
		}
		if ( '' === $lang ) {
			break;
		}
	}

	return 0;
}

/**
 * Page payload (interior, About, Get Involved, Calendar, posts page, …).
 *
 * @param string $path Page path.
 * @param string $lang Language slug.
 * @return array|null Null when no published page matches.
 */
function progressnow_payload_page( $path, $lang ) {
	$lang     = progressnow_lang_normalize( $lang );
	$previous = progressnow_lang_switch( $lang );

	$page_id = progressnow_payload_resolve_page( $path, $lang );
	$post    = $page_id ? get_post( $page_id ) : null;
	if ( ! $post ) {
		progressnow_lang_restore( $previous );

		return null;
	}

	$chapter = StarterSite::instance()->chapter_context();
	// The same filter chain page.php runs (interior → events → pages).
	$context = apply_filters( 'progressnow/context/page', array( 'chapter' => $chapter ), $post );
	$kind    = progressnow_page_kind( $page_id );

	$payload = array(
		'lang'      => $lang,
		'id'        => (int) $page_id,
		'path'      => progressnow_payload_path( get_permalink( $page_id ) ),
		'kind'      => $kind,
		'template'  => (string) get_page_template_slug( $page_id ) ?: 'page.php',
		'title'     => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		'lede'      => (string) ( $context['page_lede'] ?? '' ),
		'content'   => wp_kses_post( (string) apply_filters( 'the_content', $post->post_content ) ),
		'documents' => array_values( (array) ( $context['documents'] ?? array() ) ),
		'grievance' => array(
			'show' => (bool) ( $context['show_grievance'] ?? true ),
			'body' => (string) ( $context['grievance_body'] ?? '' ),
		),
		'newhere'   => $context['newhere'] ?? null,
		'about'     => $context['about'] ?? null,
		'gi'        => $context['gi'] ?? null,
		'calendar'  => isset( $context['calendar_api_base'] ) ? array(
			'apiBase'      => (string) $context['calendar_api_base'],
			'icsUrl'       => (string) $context['calendar_ics_url'],
			'googleCalUrl' => (string) $context['calendar_gcal_url'],
		) : null,
		'languages' => progressnow_payload_languages( $page_id ),
		'seo'       => progressnow_seo_payload( progressnow_seo_subject_for_post( $page_id ) ),
	);

	progressnow_lang_restore( $previous );

	return $payload;
}

/**
 * Single post payload (SinglePostData + readNext + languages + seo).
 *
 * @param string $slug Post slug.
 * @param string $lang Language slug.
 * @return array|null
 */
function progressnow_payload_post( $slug, $lang ) {
	$lang     = progressnow_lang_normalize( $lang );
	$previous = progressnow_lang_switch( $lang );

	$found = progressnow_blog_posts_query(
		array(
			'name'           => sanitize_title( $slug ),
			'posts_per_page' => 1,
			'lang'           => $lang,
		)
	)->posts;
	if ( ! $found ) {
		progressnow_lang_restore( $previous );

		return null;
	}

	$post = $found[0];
	$pool = progressnow_blog_posts_query(
		array(
			'posts_per_page' => 12,
			'post__not_in'   => array( (int) $post->ID ),
			'lang'           => $lang,
		)
	);

	$payload                = progressnow_post_to_single( $post );
	$payload['readNext']    = array_map( 'progressnow_post_to_blog_post', $pool->posts );
	$payload['showMetaRail'] = (bool) progressnow_blog_field( 'show_meta_rail', $post->ID );
	$payload['languages']   = progressnow_payload_languages( $post->ID );
	$payload['seo']         = progressnow_seo_payload( progressnow_seo_subject_for_post( $post->ID ) );

	progressnow_lang_restore( $previous );

	return $payload;
}

/**
 * Posts list envelope — the `GET /posts` response and the posts page's
 * embedded first browse page (`posts:{lang}`). Same code path as the Twig
 * archive context, so shapes cannot drift.
 *
 * @param string $lang     Language slug.
 * @param int    $page     1-based page.
 * @param int    $per_page Page size.
 * @param string $category Category slug or ''.
 * @param string $search   Search query or ''.
 * @return array{posts:array,page:int,perPage:int,total:int,totalPages:int}
 */
function progressnow_payload_posts( $lang, $page = 1, $per_page = 24, $category = '', $search = '' ) {
	$lang     = progressnow_lang_normalize( $lang );
	$page     = max( 1, (int) $page );
	$per_page = max( 1, (int) $per_page );
	$args     = array(
		'posts_per_page' => $per_page,
		'paged'          => $page,
		'lang'           => $lang,
	);
	if ( '' !== $category ) {
		$args['category'] = $category;
	}
	if ( '' !== $search ) {
		$args['s'] = $search;
	}

	$query = progressnow_blog_posts_query( $args );

	return array(
		'posts'      => array_map( 'progressnow_post_to_blog_post', $query->posts ),
		'page'       => $page,
		'perPage'    => $per_page,
		'total'      => (int) $query->found_posts,
		'totalPages' => (int) $query->max_num_pages,
	);
}

/**
 * Single event payload (the SingleEvent island props + languages + seo).
 *
 * @param string $slug Event slug.
 * @param string $lang Language slug.
 * @return array|null
 */
function progressnow_payload_event( $slug, $lang ) {
	$lang     = progressnow_lang_normalize( $lang );
	$previous = progressnow_lang_switch( $lang );

	$found = progressnow_events_query(
		array(
			'name'           => sanitize_title( $slug ),
			'posts_per_page' => 1,
			'lang'           => $lang,
		)
	);
	if ( ! $found ) {
		progressnow_lang_restore( $previous );

		return null;
	}

	$post    = $found[0];
	$context = apply_filters( 'progressnow/context/single', array(), $post );

	$payload = array(
		'lang'        => $lang,
		'id'          => (int) $post->ID,
		'path'        => progressnow_payload_path( get_permalink( $post ) ),
		'event'       => $context['single_event'] ?? array(),
		'categories'  => $context['single_event_categories'] ?? array(),
		'related'     => array_values( (array) ( $context['single_event_related'] ?? array() ) ),
		'showRelated' => (bool) ( $context['single_event_show_related'] ?? true ),
		'homeUrl'     => (string) ( $context['single_event_home_url'] ?? home_url( '/' ) ),
		'calendarUrl' => (string) ( $context['single_event_calendar_url'] ?? '' ),
		'languages'   => progressnow_payload_languages( $post->ID ),
		'seo'         => progressnow_seo_payload( progressnow_seo_subject_for_post( $post->ID ) ),
	);

	progressnow_lang_restore( $previous );

	return $payload;
}
