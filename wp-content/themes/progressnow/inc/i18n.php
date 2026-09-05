<?php
/**
 * Internationalization layer (Polylang Pro).
 *
 * Replaces the former GTranslate gate (inc/translation.php). Polylang serves
 * real translated content at distinct URLs (English at `/`, Spanish at `/es/`),
 * so there is no client-side machine-translation bridge and no home-only gate:
 * every page can have a translation.
 *
 * Owns:
 * - Registering the custom `event` post type as translatable (page/post are
 *   translatable by default).
 * - The `languages` switcher context the header toggle renders as <a> links
 *   (per language: code, label, name, active, translation url).
 * - A `pll__` / `pll_e` Twig function so views can translate static strings.
 * - Registration of the theme's static UI strings (chrome + home headings +
 *   empty states) so their Spanish values live in Polylang → Strings.
 * - Translated header nav / about menu labels passed to the SiteHeader island.
 *
 * Front-page BODY copy (hero subhead/CTAs, who-we-are) is NOT translated here:
 * it comes from the Spanish page's own ACF fields (see bin/seed.php).
 */

/**
 * Make the custom `event` CPT translatable. `post` and `page` already are.
 *
 * @param string[] $types    Translatable post types keyed by name.
 * @param bool     $settings Whether called from the Polylang settings screen.
 * @return string[]
 */
function progressnow_i18n_translatable_post_types( $types, $settings ) {
	$types['event'] = 'event';
	return $types;
}
add_filter( 'pll_get_post_types', 'progressnow_i18n_translatable_post_types', 10, 2 );

/**
 * Static UI strings the theme renders outside ACF, registered for translation.
 *
 * Keyed slug => English source string. `pll__( <source> )` translates by the
 * source string, so views call e.g. `{{ pll__('Upcoming events') }}`.
 *
 * @return array<string,string>
 */
function progressnow_i18n_strings() {
	return array(
		// Chrome — header.
		'nav_about'          => 'About',
		'nav_calendar'       => 'Calendar',
		'nav_blog'           => 'Blog',
		'nav_get_involved'   => 'Get Involved',
		'cta_join'           => 'Join us',
		'cta_join_short'     => 'Join', /* mobile header pill */
		'about_chapter'      => 'About the Chapter',
		'about_mission'      => 'Mission & History',
		'about_counties'     => 'Where We Organize',
		'about_committees'   => 'Committees',
		'about_bylaws'       => 'Bylaws & Code of Conduct',
		'about_faq'          => 'FAQ',
		// Chrome — footer + skip link.
		'skip_link'          => 'Skip to main content',
		'footer_a11y_lead'   => 'Built to be accessible —',
		'footer_a11y_link'   => 'tell us how we can do better.',
		// Home (v3) — headline + art alt text (inc/identity.php reads these),
		// section headings + arrow links, empty states.
		// Arrow links carry no "→": the v3 arrow is a shared SVG (partials/arrow.twig).
		'home_hero_headline' => 'A better world is possible!',
		'home_hero_photo_alt' => 'Chapter members gathered at a community action',
		'home_who_photo_alt' => 'Volunteers working together at a community event',
		'home_cta_line'      => 'Progress now, not someday!',
		'cta_join_now'       => 'Join Now',
		'home_events_head'   => 'Upcoming events',
		'home_events_all'    => 'Full calendar',
		'home_events_empty_h' => 'No events on the books yet',
		'home_events_empty_p' => 'New meetings and actions land on the %s first — subscribe there and never miss one.',
		'home_events_empty_link' => 'calendar',
		'home_view_event'    => 'View event',
		'home_blog_head'     => 'From the blog',
		'home_blog_all'      => 'All posts',
		'home_blog_read'     => 'Read the post',
		'home_blog_empty_h'  => 'Posts coming soon',
		'home_blog_empty_p'  => 'The chapter is writing its first dispatches — check back shortly.',
		// Blog archive + single post (openspec progress-now-v4-blog).
		'blog_crumb_home'     => 'Home',
		'blog_crumb_blog'     => 'Blog',
		'blog_featured'       => 'Featured',
		'blog_search'         => 'Search posts…',
		'blog_empty_h'        => 'No posts yet',
		'blog_empty_p'        => 'The chapter blog is warming up. Check back soon.',
		'blog_subscribe_h'    => 'Never miss a post',
		'blog_subscribe_p'    => 'One email when we publish. No spam, no lists sold — ever.',
		'blog_subscribe_cta'  => 'Subscribe',
		'blog_share'          => 'Share',
		'blog_copy_link'      => 'Copy link',
		'blog_email_it'       => 'Email it',
		'blog_read_next'      => 'Read next',
		'blog_get_involved_h' => 'Get involved',
		'blog_get_involved_p' => 'Meetings, actions and committees are open to everyone. Come find your place in the work.',
		// Calendar + single event (openspec progress-now-v4-events).
		'cal_title'           => 'Event calendar',
		'cal_crumb_calendar'  => 'Calendar',
		'cal_month'           => 'Month',
		'cal_list'            => 'List',
		'cal_filter'          => 'Filter:',
		'cal_all_events'      => 'All events',
		'cal_empty_h'         => 'Nothing scheduled this month',
		'cal_empty_p'         => 'Check the next month or subscribe below and never miss one.',
		'cal_subscribe_h'     => 'Subscribe to the calendar',
		'cal_subscribe_p'     => 'Add every meeting and action to your own calendar automatically.',
		'cal_google'          => 'Google Calendar',
		'cal_ics'             => 'iCal / .ics',
		'event_rsvp'          => 'RSVP',
		'event_add_calendar'  => 'Add to calendar',
		'event_about'         => 'About this event',
		'event_details'       => 'Details',
		'event_date'          => 'Date',
		'event_time'          => 'Time',
		'event_location'      => 'Location',
		'event_save_h'        => 'Save your spot',
		'event_save_p'        => 'RSVP and we’ll send the details straight to you.',
		'event_save_cta'      => 'RSVP Now',
		'event_contact'       => 'Questions? Contact',
		'event_more'          => 'More upcoming events',
		// Interior page chrome (page.twig / page-about / page-get-involved).
		'chrome_on_this_page' => 'On this page',
		'chrome_related'      => 'Related',
		'chrome_document'     => 'Document',
		'chrome_what_covers'  => 'What it covers',
		'chrome_action'       => 'Action',
		// Interior sidebar + strips + 404 (openspec progress-now-v4-interior-404).
		'interior_documents'   => 'Documents',
		'interior_contact'     => 'Contact',
		'interior_contact_p'   => 'Questions, ideas, or press —',
		'interior_subscribe_h' => 'Never miss an update',
		'interior_subscribe_p' => 'One email when something new lands — meetings, actions, and posts. No spam, ever.',
		'interior_subscribe_cta' => 'Subscribe',
		'about_dues_cta'       => 'Update my dues',
		'page_grievance_h'     => 'Need to report something?',
		'nf_doc_title'         => 'Page not found',
		'nf_title'             => 'This page got organized out of existence',
		'nf_lede'              => 'The page you’re looking for isn’t here — it may have moved, or the link may be broken.',
		'nf_home'              => 'Back home',
		'nf_calendar'          => 'See the calendar',
	);
}

/**
 * Register the static strings with Polylang so editors can translate them.
 */
function progressnow_i18n_register_strings() {
	if ( ! function_exists( 'pll_register_string' ) ) {
		return;
	}
	foreach ( progressnow_i18n_strings() as $slug => $string ) {
		pll_register_string( 'progressnow_' . $slug, $string, 'Chapter', false );
	}
}
add_action( 'init', 'progressnow_i18n_register_strings' );

/**
 * The language switcher model for the current request.
 *
 * Uses Polylang's own per-request translation resolution: each entry's `url`
 * is the translation of the current page in that language, falling back to the
 * language home when the current page has no translation.
 *
 * @return array<int,array{code:string,label:string,name:string,active:bool,url:string}>
 */
function progressnow_i18n_languages() {
	if ( ! function_exists( 'pll_the_languages' ) ) {
		return array();
	}

	$raw = pll_the_languages(
		array(
			'raw'                    => 1,
			'hide_if_no_translation' => 0,
			'hide_current'           => 0,
			'display_names_as'       => 'name',
		)
	);

	if ( empty( $raw ) || ! is_array( $raw ) ) {
		return array();
	}

	$languages = array();
	foreach ( $raw as $lang ) {
		$slug        = isset( $lang['slug'] ) ? (string) $lang['slug'] : '';
		$languages[] = array(
			'code'   => $slug,
			'label'  => strtoupper( $slug ),
			'name'   => isset( $lang['name'] ) ? (string) $lang['name'] : strtoupper( $slug ),
			'active' => ! empty( $lang['current_lang'] ),
			'url'    => isset( $lang['url'] ) ? (string) $lang['url'] : '',
		);
	}

	return $languages;
}

/**
 * The language switcher model for a specific post, independent of the global
 * queried object.
 *
 * The REST single-post handler runs outside the main query, so
 * `pll_the_languages()` (which reads the queried object) can't resolve the
 * switcher there. This builds the same shape as progressnow_i18n_languages() for a
 * given post by resolving each language's translation permalink directly, so
 * the JSON fast-path can refresh the header switcher after a client-side
 * navigation to a single post (otherwise it stays frozen at the archive's URLs).
 *
 * @param int $post_id Post whose translations to resolve.
 * @return array<int,array{code:string,label:string,name:string,active:bool,url:string}>
 */
function progressnow_i18n_languages_for_post( $post_id ) {
	if ( ! function_exists( 'pll_languages_list' ) || ! function_exists( 'pll_get_post' ) ) {
		return array();
	}

	$slugs = (array) pll_languages_list();
	if ( empty( $slugs ) ) {
		return array();
	}
	$names   = (array) pll_languages_list( array( 'fields' => 'name' ) );
	$current = function_exists( 'pll_get_post_language' )
		? (string) pll_get_post_language( (int) $post_id )
		: '';

	$languages = array();
	foreach ( $slugs as $i => $slug ) {
		$slug       = (string) $slug;
		$translated = pll_get_post( (int) $post_id, $slug );
		if ( $translated ) {
			$url = (string) get_permalink( $translated );
		} else {
			$url = function_exists( 'pll_home_url' ) ? (string) pll_home_url( $slug ) : home_url( '/' );
		}
		$languages[] = array(
			'code'   => $slug,
			'label'  => strtoupper( $slug ),
			'name'   => isset( $names[ $i ] ) ? (string) $names[ $i ] : strtoupper( $slug ),
			'active' => $slug === $current,
			'url'    => $url,
		);
	}

	return $languages;
}

/**
 * Localize an internal path to the current language's translation URL.
 *
 * On the default language (or for external / mailto links) the path is returned
 * unchanged. On a secondary language, the page whose slug matches the path is
 * resolved to its translation and that permalink is returned (preserving any
 * `#fragment`); when no translation exists, the language home is used so a link
 * never lands on the wrong-language page.
 *
 * @param string $path Internal path (e.g. '/about/#mission') or absolute URL.
 * @return string
 */
function progressnow_i18n_localize_url( $path ) {
	if ( ! is_string( $path ) || '' === $path
		|| preg_match( '#^(https?:)?//#', $path ) || 0 === strpos( $path, 'mailto:' ) ) {
		return $path;
	}
	if ( ! function_exists( 'pll_current_language' ) ) {
		return $path;
	}

	$current = (string) pll_current_language();
	$default = function_exists( 'pll_default_language' ) ? (string) pll_default_language() : '';
	if ( '' === $current || $current === $default ) {
		return $path;
	}

	$fragment = '';
	$hash     = strpos( $path, '#' );
	if ( false !== $hash ) {
		$fragment = substr( $path, $hash );
		$path     = substr( $path, 0, $hash );
	}

	$slug = trim( (string) wp_parse_url( $path, PHP_URL_PATH ), '/' );
	if ( '' !== $slug && function_exists( 'pll_get_post' ) ) {
		$en_page = get_page_by_path( $slug );
		if ( $en_page ) {
			$translated = pll_get_post( $en_page->ID, $current );
			if ( $translated ) {
				return get_permalink( $translated ) . $fragment;
			}
		}
	}

	return function_exists( 'pll_home_url' ) ? pll_home_url( $current ) : home_url( '/' );
}

/**
 * Header nav / about menu items, labels translated via the registered strings
 * and hrefs resolved to the current language's translation URLs (falling back
 * to the language home when a target is untranslated). Mirrors the Vue fixture
 * defaults in SiteHeader.vue.
 *
 * @return array{nav:array<int,array{label:string,href:string}>,about:array<int,array{label:string,href:string}>}
 */
function progressnow_i18n_header_menus() {
	$t = function_exists( 'pll__' ) ? 'pll__' : 'strval';

	$nav = array(
		array(
			'label' => $t( 'Calendar' ),
			'href'  => '/calendar/',
		),
		array(
			'label' => $t( 'Blog' ),
			'href'  => '/blog/',
		),
		array(
			'label' => $t( 'Get Involved' ),
			'href'  => '/get-involved/',
		),
	);

	$about = array(
		array(
			'label' => $t( 'About the Chapter' ),
			'href'  => '/about/',
		),
		array(
			'label' => $t( 'Mission & History' ),
			'href'  => '/about/#mission',
		),
		array(
			'label' => $t( 'Where We Organize' ),
			'href'  => '/about/#counties',
		),
		array(
			'label' => $t( 'Committees' ),
			'href'  => '/about/#committees',
		),
		array(
			'label' => $t( 'Bylaws & Code of Conduct' ),
			'href'  => '/about/#bylaws',
		),
		array(
			'label' => $t( 'FAQ' ),
			'href'  => '/about/#faq',
		),
	);

	foreach ( $nav as &$nav_item ) {
		$nav_item['href'] = progressnow_i18n_localize_url( $nav_item['href'] );
	}
	unset( $nav_item );
	foreach ( $about as &$about_item ) {
		$about_item['href'] = progressnow_i18n_localize_url( $about_item['href'] );
	}
	unset( $about_item );

	return array(
		'nav'   => $nav,
		'about' => $about,
	);
}

/**
 * Expose i18n data + a translated header menu to every Timber render.
 *
 * @param array $context Timber context.
 * @return array
 */
function progressnow_i18n_context( $context ) {
	$context['languages']        = progressnow_i18n_languages();
	$context['current_language'] = function_exists( 'pll_current_language' ) ? pll_current_language() : 'en';
	$context['home_url']         = function_exists( 'pll_home_url' )
		? pll_home_url( $context['current_language'] )
		: home_url( '/' );
	// Root-relative home for the header logo link (no origin baked in).
	$context['home_path']        = function_exists( 'progressnow_payload_path' )
		? progressnow_payload_path( $context['home_url'] )
		: '/';

	$menus                        = progressnow_i18n_header_menus();
	$context['header_nav_items']  = $menus['nav'];
	$context['header_about_items'] = $menus['about'];
	$context['join_label']        = function_exists( 'pll__' ) ? pll__( 'Join us' ) : 'Join us';
	$context['join_short_label']  = function_exists( 'pll__' ) ? pll__( 'Join' ) : 'Join';
	$context['about_label']       = function_exists( 'pll__' ) ? pll__( 'About' ) : 'About';

	return $context;
}
add_filter( 'timber/context', 'progressnow_i18n_context' );

/**
 * Register `pll__` / `pll_e` (string translation) and `localize_url` (internal
 * path → current-language permalink, see progressnow_i18n_localize_url()) as Twig
 * functions so views can localize strings and links.
 *
 * @param \Twig\Environment $twig Timber's Twig environment.
 * @return \Twig\Environment
 */
function progressnow_i18n_twig( $twig ) {
	if ( function_exists( 'pll__' ) ) {
		$twig->addFunction( new \Twig\TwigFunction( 'pll__', 'pll__' ) );
		$twig->addFunction( new \Twig\TwigFunction( 'pll_e', 'pll_e' ) );
	} else {
		// Graceful fallback if Polylang is deactivated: echo the source string.
		$twig->addFunction( new \Twig\TwigFunction( 'pll__', 'strval' ) );
		$twig->addFunction( new \Twig\TwigFunction( 'pll_e', 'strval' ) );
	}
	$twig->addFunction( new \Twig\TwigFunction( 'localize_url', 'progressnow_i18n_localize_url' ) );
	return $twig;
}
add_filter( 'timber/twig', 'progressnow_i18n_twig' );
