<?php
/**
 * SEO head output: meta description, canonical, robots, Open Graph /
 * Twitter cards, hreflang, and JSON-LD structured data.
 *
 * Owns: everything <head>-facing that search engines and link scrapers
 * read. Hand-rolled (no SEO plugin) — every copy/image source is already
 * serialized first-party by the blog/events/options domains.
 *
 * Every builder takes a SUBJECT — a normalized description of the surface
 * (`progressnow_seo_subject_from_query()` derives it from the main query for
 * the head; the REST payloads build one explicitly for a post/page/front
 * page) — so the PHP shell and the route payloads compute the same values
 * from the same code. Calling a builder without a subject uses the query.
 *
 * Public contract (tests + payloads call these):
 * - progressnow_seo_subject_from_query(): array — the current surface.
 * - progressnow_seo_subject_for_post( $post_id ): array — a singular surface
 *   (front page / posts page / page / post / event, by role).
 * - progressnow_seo_description( $subject = null ): string — description ladder.
 * - progressnow_seo_canonical( $subject = null ): string — canonical URL ('' when none).
 * - progressnow_seo_is_noindex( $subject = null ): bool — thin surfaces get noindex,follow.
 * - progressnow_seo_title( $subject = null ): string — the document title.
 * - progressnow_seo_hreflang( $subject = null ): array — [{ lang, href }].
 * - progressnow_seo_image( $subject = null ): array — share-image ladder
 *   { src, width?, height?, alt?, large } (`large` marks a per-content image).
 * - progressnow_seo_json_ld( $subject = null ): array — @graph with
 *   Organization (+ Article on posts, + Event on event permalinks).
 * - progressnow_seo_payload( $subject = null ): array — the `seo` block
 *   { title, description, canonical, robots, hreflang } carried by every
 *   route payload.
 */

add_action( 'wp_head', 'progressnow_seo_head', 5 );

// Core emits its own singular canonical at wp_head 10 — ours owns the tag.
remove_action( 'wp_head', 'rel_canonical' );

// Robots go through core's wp_robots so the page gets ONE merged meta
// (core already contributes max-image-preview:large and search noindex).
add_filter( 'wp_robots', 'progressnow_seo_robots' );

/**
 * noindex,follow directives for thin surfaces (overrides core's
 * search-results nofollow — we want crawlers to follow through to posts).
 *
 * @param array $robots wp_robots directives.
 * @return array
 */
function progressnow_seo_robots( $robots ) {
	if ( progressnow_seo_is_noindex() ) {
		$robots['noindex'] = true;
		$robots['follow']  = true;
		unset( $robots['nofollow'] );
	}

	return $robots;
}

/* -------------------------------------------------------------------------
 * Subjects.
 * ---------------------------------------------------------------------- */

/**
 * Build a subject from the main query. Types: front | posts_page | page |
 * post | event | search | archive | 404 | other.
 *
 * @return array{type:string,id:int,post:?WP_Post,lang:string,paged:int,filtered:bool,thin:bool,noindex_template:bool}
 */
function progressnow_seo_subject_from_query() {
	$subject = array(
		'type'             => 'other',
		'id'               => 0,
		'post'             => null,
		'lang'             => function_exists( 'pll_current_language' ) ? (string) pll_current_language() : '',
		'paged'            => max( 1, (int) get_query_var( 'paged' ) ),
		'filtered'         => progressnow_seo_has_filter_params(),
		'thin'             => is_date() || is_author(),
		'noindex_template' => is_page_template( 'page-templates/styleguide.php' ),
	);

	if ( is_404() ) {
		$subject['type'] = '404';
	} elseif ( is_search() ) {
		$subject['type'] = 'search';
	} elseif ( is_front_page() ) {
		$subject['type'] = 'front';
		$subject['id']   = is_singular() ? (int) get_queried_object_id() : (int) get_option( 'page_on_front' );
	} elseif ( is_home() ) {
		$subject['type'] = 'posts_page';
		$subject['id']   = (int) get_option( 'page_for_posts' );
	} elseif ( is_singular( 'post' ) ) {
		$subject['type'] = 'post';
		$subject['id']   = (int) get_queried_object_id();
	} elseif ( is_singular( 'event' ) ) {
		$subject['type'] = 'event';
		$subject['id']   = (int) get_queried_object_id();
	} elseif ( is_singular() ) {
		$subject['type'] = 'page';
		$subject['id']   = (int) get_queried_object_id();
	} elseif ( is_archive() ) {
		$subject['type'] = 'archive';
	}

	if ( $subject['id'] ) {
		$subject['post'] = get_post( $subject['id'] );
	}
	if ( '' === $subject['lang'] && $subject['id'] && function_exists( 'pll_get_post_language' ) ) {
		$subject['lang'] = (string) pll_get_post_language( $subject['id'] );
	}

	return $subject;
}

/**
 * Build a subject for a singular post by its role: the front page (or a
 * translation of it), the posts page (or a translation), a page, a post, or
 * an event. Used by the route payloads, which run outside the main query.
 *
 * @param int $post_id Post ID.
 * @return array
 */
function progressnow_seo_subject_for_post( $post_id ) {
	$post = get_post( $post_id );
	$type = 'page';

	if ( $post ) {
		$front = (int) get_option( 'page_on_front' );
		$posts = (int) get_option( 'page_for_posts' );
		if ( 'post' === $post->post_type ) {
			$type = 'post';
		} elseif ( 'event' === $post->post_type ) {
			$type = 'event';
		} elseif ( $front && progressnow_seo_same_or_translation( (int) $post->ID, $front ) ) {
			$type = 'front';
		} elseif ( $posts && progressnow_seo_same_or_translation( (int) $post->ID, $posts ) ) {
			$type = 'posts_page';
		}
	}

	return array(
		'type'             => $post ? $type : '404',
		'id'               => $post ? (int) $post->ID : 0,
		'post'             => $post,
		'lang'             => ( $post && function_exists( 'pll_get_post_language' ) ) ? (string) pll_get_post_language( $post->ID ) : '',
		'paged'            => 1,
		'filtered'         => false,
		'thin'             => false,
		'noindex_template' => $post ? 'page-templates/styleguide.php' === get_page_template_slug( $post->ID ) : false,
	);
}

/**
 * Is $post_id the same as $other_id or one of its Polylang translations?
 */
function progressnow_seo_same_or_translation( $post_id, $other_id ) {
	if ( $post_id === $other_id ) {
		return true;
	}
	if ( function_exists( 'pll_get_post_translations' ) ) {
		return in_array( $post_id, array_map( 'intval', (array) pll_get_post_translations( $other_id ) ), true );
	}

	return false;
}

/**
 * Resolve the subject argument (null → main query).
 */
function progressnow_seo_subject( $subject = null ) {
	return is_array( $subject ) ? $subject : progressnow_seo_subject_from_query();
}

/**
 * The front page ID for the subject's language (page_on_front translation).
 */
function progressnow_seo_front_id( array $subject ) {
	if ( 'front' === $subject['type'] && $subject['id'] ) {
		return (int) $subject['id'];
	}
	$front = (int) get_option( 'page_on_front' );
	if ( $front && '' !== $subject['lang'] && function_exists( 'pll_get_post' ) ) {
		$translated = pll_get_post( $front, $subject['lang'] );
		if ( $translated ) {
			return (int) $translated;
		}
	}

	return $front;
}

/* -------------------------------------------------------------------------
 * Head output.
 * ---------------------------------------------------------------------- */

/**
 * Emit the full SEO head block. Hooked once at wp_head 5, reads only from
 * the main query so output is deterministic per URL.
 */
function progressnow_seo_head() {
	$subject     = progressnow_seo_subject_from_query();
	$description = progressnow_seo_description( $subject );
	$canonical   = progressnow_seo_canonical( $subject );
	$image       = progressnow_seo_image( $subject );

	if ( '' !== $description ) {
		printf( '<meta name="description" content="%s">' . "\n", esc_attr( $description ) );
	}

	if ( '' !== $canonical ) {
		printf( '<link rel="canonical" href="%s">' . "\n", esc_url( $canonical ) );
	}

	foreach ( progressnow_seo_hreflang( $subject ) as $alternate ) {
		printf( '<link rel="alternate" hreflang="%s" href="%s">' . "\n", esc_attr( $alternate['lang'] ), esc_url( $alternate['href'] ) );
	}

	$title = in_array( $subject['type'], array( 'post', 'event', 'page', 'posts_page' ), true ) && $subject['post']
		? html_entity_decode( get_the_title( $subject['post'] ), ENT_QUOTES, 'UTF-8' )
		: get_bloginfo( 'name' );

	$og = array(
		'og:site_name'   => progressnow_identity()['name'],
		'og:type'        => 'post' === $subject['type'] ? 'article' : 'website',
		'og:title'       => $title,
		'og:description' => $description,
		'og:url'         => $canonical ?: home_url( '/' ),
		'og:image'       => $image['src'],
	);
	if ( ! empty( $image['width'] ) ) {
		$og['og:image:width'] = (string) $image['width'];
	}
	if ( ! empty( $image['height'] ) ) {
		$og['og:image:height'] = (string) $image['height'];
	}
	if ( ! empty( $image['alt'] ) ) {
		$og['og:image:alt'] = $image['alt'];
	}

	foreach ( $og as $property => $content ) {
		if ( '' === (string) $content ) {
			continue;
		}
		$escaped = in_array( $property, array( 'og:url', 'og:image' ), true ) ? esc_url( $content ) : esc_attr( $content );
		printf( '<meta property="%s" content="%s">' . "\n", esc_attr( $property ), $escaped );
	}

	// Per-content image → big card; chapter default / logo fallback → summary.
	$card = ! empty( $image['large'] ) ? 'summary_large_image' : 'summary';
	printf( '<meta name="twitter:card" content="%s">' . "\n", esc_attr( $card ) );

	$json = wp_json_encode( progressnow_seo_json_ld( $subject ), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
	if ( $json ) {
		echo '<script type="application/ld+json">' . $json . '</script>' . "\n";
	}
}

/**
 * Plain-text + ~155-char word-boundary trim for meta/OG copy.
 *
 * @param mixed $text  Raw copy (may contain markup).
 * @param int   $limit Character budget.
 * @return string
 */
function progressnow_seo_plain_trim( $text, $limit = 155 ) {
	$text = function_exists( 'progressnow_blog_kses_plain' )
		? progressnow_blog_kses_plain( $text )
		: trim( wp_strip_all_tags( (string) $text ) );
	$text = trim( (string) preg_replace( '/\s+/u', ' ', $text ) );

	if ( mb_strlen( $text ) <= $limit ) {
		return $text;
	}

	$cut   = mb_substr( $text, 0, $limit );
	$space = mb_strrpos( $cut, ' ' );
	if ( false !== $space && $space > 0 ) {
		$cut = mb_substr( $cut, 0, $space );
	}

	return rtrim( $cut, " \t.,;:—–-" ) . '…';
}

/* -------------------------------------------------------------------------
 * Builders.
 * ---------------------------------------------------------------------- */

/**
 * Per-surface description ladder (design D2):
 * post dek → excerpt; page seo_description → lede → tagline; event
 * content; front hero lede → tagline; posts page uses the page ladder on
 * the page_for_posts page.
 *
 * @param array|null $subject Subject (null → main query).
 * @return string
 */
function progressnow_seo_description( $subject = null ) {
	$subject = progressnow_seo_subject( $subject );
	$tagline = trim( (string) get_bloginfo( 'description', 'display' ) );
	// Tagline unset → hero-lede default copy, so the ladder never bottoms
	// out empty (same placeholder-fallback philosophy as the templates).
	if ( '' === $tagline && function_exists( 'progressnow_front_hero' ) ) {
		$hero    = progressnow_front_hero( progressnow_seo_front_id( $subject ) );
		$tagline = (string) ( $hero['lede'] ?? '' );
	}

	if ( 'front' === $subject['type'] ) {
		$hero = function_exists( 'progressnow_front_hero' )
			? progressnow_front_hero( progressnow_seo_front_id( $subject ) )
			: array();
		$lede = trim( (string) ( $hero['lede'] ?? '' ) );

		return progressnow_seo_plain_trim( '' !== $lede ? $lede : $tagline );
	}

	if ( 'post' === $subject['type'] ) {
		$post_id = (int) $subject['id'];
		$dek     = trim( (string) progressnow_blog_field( 'dek', $post_id ) );
		if ( '' !== $dek ) {
			return progressnow_seo_plain_trim( $dek );
		}

		return progressnow_seo_plain_trim( get_the_excerpt( $post_id ) );
	}

	if ( 'event' === $subject['type'] ) {
		$post = $subject['post'];
		$desc = progressnow_seo_plain_trim( $post ? $post->post_content : '' );

		return '' !== $desc ? $desc : progressnow_seo_plain_trim( $tagline );
	}

	// Posts page and interior pages share the page ladder.
	$page_id = in_array( $subject['type'], array( 'posts_page', 'page' ), true ) ? (int) $subject['id'] : 0;

	if ( $page_id && function_exists( 'get_field' ) ) {
		foreach ( array( 'seo_description', 'lede' ) as $field ) {
			$value = get_field( $field, $page_id );
			if ( is_string( $value ) && '' !== trim( $value ) ) {
				return progressnow_seo_plain_trim( $value );
			}
		}
	}

	return progressnow_seo_plain_trim( $tagline );
}

/**
 * Island filter params present on the request? (?s= / ?category= / ?paged=
 * are client filter state on the posts page — inc/blog.php reads the same
 * params. Server-paged /page/N/ does NOT hit this.)
 *
 * @return bool
 */
function progressnow_seo_has_filter_params() {
	foreach ( array( 's', 'category', 'paged' ) as $param ) {
		if ( isset( $_GET[ $param ] ) && '' !== $_GET[ $param ] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return true;
		}
	}

	return false;
}

/**
 * noindex,follow surfaces (design D3): search results, ?s=/?category=
 * filtered archive states, date/author archives, 404, the styleguide.
 *
 * @param array|null $subject Subject (null → main query).
 * @return bool
 */
function progressnow_seo_is_noindex( $subject = null ) {
	$subject = progressnow_seo_subject( $subject );

	if ( in_array( $subject['type'], array( 'search', '404' ), true ) || $subject['thin'] ) {
		return true;
	}

	// Styleguide is a component demo surface, not content.
	if ( $subject['noindex_template'] ) {
		return true;
	}

	if ( in_array( $subject['type'], array( 'posts_page', 'archive' ), true ) && ( isset( $_GET['s'] ) || isset( $_GET['category'] ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return true;
	}

	return false;
}

/**
 * The posts page URL for the subject's language.
 */
function progressnow_seo_blog_url( array $subject ) {
	$posts_page = (int) get_option( 'page_for_posts' );
	if ( $posts_page && '' !== $subject['lang'] && function_exists( 'pll_get_post' ) ) {
		$translated = pll_get_post( $posts_page, $subject['lang'] );
		if ( $translated ) {
			$posts_page = (int) $translated;
		}
	}

	return $posts_page ? (string) get_permalink( $posts_page ) : progressnow_seo_home_url( $subject );
}

/**
 * The home URL for the subject's language.
 */
function progressnow_seo_home_url( array $subject ) {
	if ( '' !== $subject['lang'] && function_exists( 'pll_home_url' ) ) {
		return (string) pll_home_url( $subject['lang'] );
	}

	return home_url( '/' );
}

/**
 * Canonical URL (design D3). Filtered states (?s=/?category=/?paged=)
 * canonicalize to the clean posts-page URL; server-paged archives keep
 * their own /page/N/ canonical. '' when there is no meaningful canonical
 * (404).
 *
 * @param array|null $subject Subject (null → main query).
 * @return string
 */
function progressnow_seo_canonical( $subject = null ) {
	$subject = progressnow_seo_subject( $subject );

	if ( '404' === $subject['type'] ) {
		return '';
	}

	$blog_url = progressnow_seo_blog_url( $subject );

	if ( 'search' === $subject['type'] ) {
		return $blog_url;
	}

	if ( in_array( $subject['type'], array( 'posts_page', 'archive' ), true ) && $subject['filtered'] ) {
		return $blog_url;
	}

	if ( 'front' === $subject['type'] ) {
		return $subject['paged'] > 1 ? (string) get_pagenum_link( $subject['paged'], false ) : progressnow_seo_home_url( $subject );
	}

	if ( in_array( $subject['type'], array( 'post', 'event', 'page' ), true ) ) {
		return (string) get_permalink( $subject['id'] );
	}

	if ( in_array( $subject['type'], array( 'posts_page', 'archive' ), true ) ) {
		if ( $subject['paged'] > 1 ) {
			return (string) get_pagenum_link( $subject['paged'], false );
		}

		return 'posts_page' === $subject['type'] ? $blog_url : (string) get_pagenum_link( 1, false );
	}

	return home_url( '/' );
}

/**
 * The document title, computed the way core's wp_get_document_title() does
 * so the payload matches the <title> the shell emits: "Title - Site" for
 * singular surfaces, "Site - Tagline" on the front page.
 *
 * @param array|null $subject Subject (null → main query).
 * @return string
 */
function progressnow_seo_title( $subject = null ) {
	$subject = progressnow_seo_subject( $subject );
	$site    = get_bloginfo( 'name', 'display' );
	$parts   = array();

	switch ( $subject['type'] ) {
		case 'front':
			$parts = array( $site, get_bloginfo( 'description', 'display' ) );
			break;
		case '404':
			$parts = array( __( 'Page not found' ), $site );
			break;
		case 'search':
			/* translators: %s: search query */
			$parts = array( sprintf( __( 'Search Results for &#8220;%s&#8221;' ), get_search_query() ), $site );
			break;
		case 'post':
		case 'event':
		case 'page':
		case 'posts_page':
			$parts = array( $subject['post'] ? get_the_title( $subject['post'] ) : '', $site );
			break;
		case 'archive':
			$parts = array( wp_strip_all_tags( get_the_archive_title() ), $site );
			break;
		default:
			$parts = array( $site );
	}

	if ( $subject['paged'] > 1 ) {
		/* translators: %s: page number */
		array_splice( $parts, 1, 0, sprintf( __( 'Page %s' ), number_format_i18n( $subject['paged'] ) ) );
	}

	$sep   = apply_filters( 'document_title_separator', '-' );
	$title = implode( " $sep ", array_filter( array_map( 'trim', array_map( 'strval', $parts ) ) ) );

	return html_entity_decode( wptexturize( $title ), ENT_QUOTES, 'UTF-8' );
}

/**
 * hreflang alternates: every site language's URL for this surface — the
 * translation when one exists, that language's home otherwise (same rule as
 * the header switcher). Empty when Polylang is inactive.
 *
 * @param array|null $subject Subject (null → main query).
 * @return array<int,array{lang:string,href:string}>
 */
function progressnow_seo_hreflang( $subject = null ) {
	$subject = progressnow_seo_subject( $subject );
	if ( ! function_exists( 'pll_languages_list' ) ) {
		return array();
	}

	$alternates = array();
	if ( in_array( $subject['type'], array( 'post', 'event', 'page', 'posts_page', 'front' ), true ) && $subject['id'] && function_exists( 'progressnow_i18n_languages_for_post' ) ) {
		foreach ( progressnow_i18n_languages_for_post( (int) $subject['id'] ) as $language ) {
			$alternates[] = array(
				'lang' => $language['code'],
				'href' => $language['url'],
			);
		}
	} elseif ( in_array( $subject['type'], array( 'front', 'posts_page' ), true ) && function_exists( 'pll_home_url' ) ) {
		foreach ( (array) pll_languages_list() as $slug ) {
			$alternates[] = array(
				'lang' => (string) $slug,
				'href' => (string) pll_home_url( (string) $slug ),
			);
		}
	}

	return $alternates;
}

/**
 * The `seo` block carried by every route payload (and the source of the
 * shell's head): title, description, canonical, robots, hreflang.
 *
 * @param array|null $subject Subject (null → main query).
 * @return array{title:string,description:string,canonical:string,robots:string,hreflang:array}
 */
function progressnow_seo_payload( $subject = null ) {
	$subject = progressnow_seo_subject( $subject );

	return array(
		'title'       => progressnow_seo_title( $subject ),
		'description' => progressnow_seo_description( $subject ),
		'canonical'   => progressnow_seo_canonical( $subject ),
		'robots'      => progressnow_seo_is_noindex( $subject ) ? 'noindex,follow' : 'index,follow',
		'hreflang'    => progressnow_seo_hreflang( $subject ),
	);
}

/**
 * Share-image ladder (design D4): featured image (large) → Chapter
 * Settings default_share_image → shipped placeholder. `large` is true only
 * for a per-content image (spec: fallback images card as `summary`).
 *
 * @param array|null $subject Subject (null → main query).
 * @return array{src:string,width?:int,height?:int,alt?:string,large:bool}
 */
function progressnow_seo_image( $subject = null ) {
	$subject = progressnow_seo_subject( $subject );

	if ( in_array( $subject['type'], array( 'post', 'event', 'page', 'front', 'posts_page' ), true ) && $subject['id'] ) {
		$thumb_id = (int) get_post_thumbnail_id( (int) $subject['id'] );
		if ( $thumb_id ) {
			$image = progressnow_seo_attachment_image( $thumb_id );
			if ( $image ) {
				$image['large'] = true;

				return $image;
			}
		}
	}

	if ( function_exists( 'get_field' ) ) {
		$default    = get_field( 'default_share_image', 'option' );
		$default_id = is_array( $default ) ? (int) ( $default['ID'] ?? 0 ) : (int) $default;
		if ( $default_id ) {
			$image = progressnow_seo_attachment_image( $default_id );
			if ( $image ) {
				$image['large'] = false;

				return $image;
			}
		}
	}

	// Shipped placeholder share image (inc/identity.php) — never empty.
	$fallback = progressnow_identity()['share_image'];

	return array(
		'src'    => $fallback['src'],
		'width'  => $fallback['width'],
		'height' => $fallback['height'],
		'alt'    => $fallback['alt'],
		'large'  => false,
	);
}

/**
 * Attachment → { src, width?, height?, alt? } at the `large` size.
 *
 * @param int $attachment_id Attachment ID.
 * @return array|null Null when the attachment has no image source.
 */
function progressnow_seo_attachment_image( $attachment_id ) {
	$src = wp_get_attachment_image_src( $attachment_id, 'large' );
	if ( ! $src || empty( $src[0] ) ) {
		return null;
	}

	$image = array( 'src' => (string) $src[0] );
	if ( ! empty( $src[1] ) ) {
		$image['width'] = (int) $src[1];
	}
	if ( ! empty( $src[2] ) ) {
		$image['height'] = (int) $src[2];
	}

	$alt = (string) get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
	if ( '' !== $alt ) {
		$image['alt'] = $alt;
	}

	return $image;
}

/**
 * JSON-LD @graph (design D5): Organization site-wide, Article on posts,
 * Event on event permalinks. One script per page.
 *
 * @param array|null $subject Subject (null → main query).
 * @return array
 */
function progressnow_seo_json_ld( $subject = null ) {
	$subject  = progressnow_seo_subject( $subject );
	$org_id   = home_url( '/#organization' );
	$identity = progressnow_identity();

	$organization = array(
		'@type' => 'Organization',
		'@id'   => $org_id,
		'name'  => $identity['name'],
		'url'   => home_url( '/' ),
		'logo'  => $identity['logo_square']['src'],
	);
	$same_as      = progressnow_seo_same_as();
	if ( $same_as ) {
		$organization['sameAs'] = $same_as;
	}

	$graph = array( $organization );

	if ( 'post' === $subject['type'] ) {
		$article = progressnow_seo_article_schema( $subject['post'], $org_id, $subject );
		if ( $article ) {
			$graph[] = $article;
		}
	} elseif ( 'event' === $subject['type'] ) {
		$event = progressnow_seo_event_schema( $subject['post'], $org_id );
		if ( $event ) {
			$graph[] = $event;
		}
	}

	return array(
		'@context' => 'https://schema.org',
		'@graph'   => $graph,
	);
}

/**
 * Organization sameAs profiles — the same option fields as the StarterSite
 * `chapter.socials` context. No defaults: only configured profiles are listed.
 *
 * @return string[]
 */
function progressnow_seo_same_as() {
	$urls = array();
	foreach ( array( 'facebook_url', 'instagram_url', 'twitter_url' ) as $field ) {
		$value = function_exists( 'get_field' ) ? get_field( $field, 'option' ) : null;
		if ( is_string( $value ) && '' !== trim( $value ) ) {
			$urls[] = trim( $value );
		}
	}

	return array_values( array_unique( $urls ) );
}

/**
 * Article schema for a post (byline mode → Person vs committee
 * Organization, mirroring progressnow_post_to_single()).
 *
 * @param WP_Post|null $post    Post.
 * @param string       $org_id  Organization @id reference.
 * @param array|null   $subject Subject (for the description ladder).
 * @return array|null
 */
function progressnow_seo_article_schema( $post, $org_id, $subject = null ) {
	$post = get_post( $post );
	if ( ! $post ) {
		return null;
	}

	$committee = trim( (string) progressnow_blog_field( 'committee', $post->ID ) );
	if ( 'committee' === progressnow_blog_field( 'byline_mode', $post->ID ) && '' !== $committee ) {
		$author = array(
			'@type' => 'Organization',
			'name'  => $committee,
		);
	} else {
		$author = array(
			'@type' => 'Person',
			'name'  => get_the_author_meta( 'display_name', (int) $post->post_author ),
		);
	}

	$article = array(
		'@type'            => 'Article',
		'headline'         => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		'description'      => progressnow_seo_description( $subject ),
		'datePublished'    => get_the_date( 'c', $post ),
		'dateModified'     => get_the_modified_date( 'c', $post ),
		'mainEntityOfPage' => get_permalink( $post ),
		'author'           => $author,
		'publisher'        => array( '@id' => $org_id ),
	);

	$thumb = get_the_post_thumbnail_url( $post, 'large' );
	if ( $thumb ) {
		$article['image'] = $thumb;
	}

	return $article;
}

/**
 * Event schema for an event permalink — same ACF fields as the ICS feed
 * (start/end in chapter tz, venue/city Place, rsvp_url offer).
 *
 * @param WP_Post|null $post   Event.
 * @param string       $org_id Organization @id reference.
 * @return array|null Null when the event has no parseable start.
 */
function progressnow_seo_event_schema( $post, $org_id ) {
	$post = get_post( $post );
	if ( ! $post ) {
		return null;
	}

	$start = progressnow_events_parse_datetime( progressnow_events_get_field( $post->ID, 'start_datetime' ) );
	if ( ! $start ) {
		return null;
	}
	$end = progressnow_events_parse_datetime( progressnow_events_get_field( $post->ID, 'end_datetime' ) );

	$event = array(
		'@type'     => 'Event',
		'name'      => html_entity_decode( get_the_title( $post ), ENT_QUOTES, 'UTF-8' ),
		'startDate' => $start->format( 'c' ),
		'url'       => get_permalink( $post ),
		'organizer' => array( '@id' => $org_id ),
	);
	if ( $end ) {
		$event['endDate'] = $end->format( 'c' );
	}

	$desc = trim( wp_strip_all_tags( $post->post_content ) );
	if ( '' !== $desc ) {
		$event['description'] = $desc;
	}

	$venue = trim( (string) progressnow_events_get_field( $post->ID, 'venue' ) );
	$city  = trim( (string) progressnow_events_get_field( $post->ID, 'city' ) );
	if ( $venue || $city ) {
		$place = array(
			'@type' => 'Place',
			'name'  => $venue ?: $city,
		);
		if ( $city ) {
			$place['address'] = array(
				'@type'           => 'PostalAddress',
				'addressLocality' => $city,
			);
		}
		$event['location'] = $place;
	}

	$rsvp = trim( (string) progressnow_events_get_field( $post->ID, 'rsvp_url' ) );
	if ( $rsvp ) {
		$event['offers'] = array(
			'@type' => 'Offer',
			'url'   => $rsvp,
		);
	}

	$thumb = get_the_post_thumbnail_url( $post, 'large' );
	if ( $thumb ) {
		$event['image'] = $thumb;
	}

	return $event;
}
