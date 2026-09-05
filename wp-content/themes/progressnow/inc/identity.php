<?php
/**
 * Chapter identity: the name, short name, region label, and brand media that
 * every surface reads instead of hard-coded copy. The theme ships with neutral
 * placeholders (static/images/brand/) and a chapter configures itself under
 * Chapter Settings → Identity & brand.
 *
 * Public contract (other domains call these):
 * - progressnow_identity(): array — {
 *     name, short_name, region_label, hero_headline,
 *     logo_header, logo_footer, logo_square, share_image, hero_photo,
 *     who_image, cta_panel
 *   }
 *   The v4 headline is text only (progress-now-v4-home): the former
 *   headline-artwork override and its alt field are gone.
 *   Every image is { src, alt, width, height, is_default }. The header/footer
 *   logos have no shipped file: while `is_default` their `src` is '' and the
 *   chrome renders the v4 wordmark lockup (yellow diamond + chapter name)
 *   instead — see SiteHeader.vue / SiteFooter.vue.
 */

/**
 * Neutral defaults — nothing regional, nothing chapter-specific.
 *
 * @return array{name:string,short_name:string,region_label:string}
 */
function progressnow_identity_defaults() {
	return array(
		'name'         => 'Progress Now',
		'short_name'   => 'Progress Now',
		'region_label' => 'our community',
	);
}

/**
 * Read a Chapter Settings option (ACF options page), null when unset or when
 * ACF is inactive.
 *
 * @param string $name Field name.
 * @return mixed
 */
function progressnow_identity_option( $name ) {
	if ( ! function_exists( 'get_field' ) ) {
		return null;
	}

	return get_field( $name, 'option' );
}

/**
 * The resolved identity for the current request (options over defaults).
 *
 * @return array
 */
function progressnow_identity() {
	$identity = progressnow_identity_defaults();

	foreach ( array(
		'name'         => 'chapter_name',
		'short_name'   => 'chapter_short_name',
		'region_label' => 'region_label',
	) as $key => $field ) {
		$value = progressnow_identity_option( $field );
		if ( is_string( $value ) && '' !== trim( $value ) ) {
			$identity[ $key ] = trim( $value );
		}
	}

	$t = function_exists( 'pll__' ) ? 'pll__' : 'strval';

	$headline = progressnow_identity_option( 'hero_headline_text' );
	$identity['hero_headline'] = ( is_string( $headline ) && '' !== trim( $headline ) )
		? trim( $headline )
		: $t( 'A better world is possible!' );

	// No shipped logo files (v4): the default is the wordmark lockup drawn by the
	// chrome components, so `src` stays '' until a chapter uploads an image.
	$identity['logo_header'] = progressnow_identity_lockup( 'logo_header', $identity['name'] );
	$identity['logo_footer'] = progressnow_identity_lockup( 'logo_footer', $identity['name'] );
	$identity['logo_square'] = progressnow_identity_image( 'logo_square', 'static/images/brand/logo-square.png', $identity['name'], 512, 512 );
	$identity['share_image'] = progressnow_identity_image( 'default_share_image', 'static/images/brand/share-default.jpg', $identity['name'], 1200, 630 );

	// Photo placeholders are neutral color frames; the duotone is CSS (partials/duotone.twig).
	$identity['hero_photo'] = progressnow_identity_image( 'hero_photo', 'static/images/brand/hero-photo.jpg', $t( 'Chapter members gathered at a community action' ), 951, 716 );

	$who_alt = progressnow_identity_option( 'who_we_are_alt' );
	$identity['who_image'] = progressnow_identity_image(
		'who_we_are_image',
		'static/images/brand/who-photo.jpg',
		( is_string( $who_alt ) && '' !== trim( $who_alt ) ) ? trim( $who_alt ) : $t( 'Volunteers working together at a community event' ),
		920,
		700
	);

	// Decorative by default (empty alt); a chapter can give its own panel art an alt.
	$identity['cta_panel'] = progressnow_identity_image( 'cta_panel_image', 'static/images/brand/cta-panel.svg', '', 1281, 563 );

	return $identity;
}

/**
 * Resolve a Chapter Settings image field to { src, alt, width, height,
 * is_default }, falling back to a shipped placeholder — or null when no
 * placeholder is given (optional artwork).
 *
 * @param string $field        Options field name.
 * @param string $default_path Theme-relative placeholder path ('' = optional).
 * @param string $default_alt  Alt used when the attachment has none / for the placeholder.
 * @param int    $width        Placeholder width.
 * @param int    $height       Placeholder height.
 * @return array|null
 */
function progressnow_identity_image( $field, $default_path, $default_alt, $width, $height ) {
	$image = progressnow_identity_attachment_image( progressnow_identity_option( $field ) );
	if ( $image ) {
		if ( '' === $image['alt'] ) {
			$image['alt'] = $default_alt;
		}
		$image['is_default'] = false;

		return $image;
	}

	if ( '' === $default_path ) {
		return null;
	}

	return array(
		'src'        => get_theme_file_uri( $default_path ),
		'alt'        => $default_alt,
		'width'      => $width,
		'height'     => $height,
		'is_default' => true,
	);
}

/**
 * Header / footer logo: an uploaded image, else the lockup sentinel — an
 * image record with an empty `src` and `is_default` true. Consumers render the
 * wordmark lockup while `is_default` is set (design D5).
 *
 * @param string $field Options field name.
 * @param string $name  Chapter name (alt text).
 * @return array
 */
function progressnow_identity_lockup( $field, $name ) {
	$image = progressnow_identity_attachment_image( progressnow_identity_option( $field ) );
	if ( $image ) {
		if ( '' === $image['alt'] ) {
			$image['alt'] = $name;
		}
		$image['is_default'] = false;

		return $image;
	}

	return array(
		'src'        => '',
		'alt'        => $name,
		'width'      => 0,
		'height'     => 0,
		'is_default' => true,
	);
}

/**
 * ACF image value (ID or array return format) → { src, alt, width, height } or null.
 *
 * @param mixed $value Field value.
 * @return array|null
 */
function progressnow_identity_attachment_image( $value ) {
	if ( is_array( $value ) ) {
		if ( empty( $value['url'] ) ) {
			return null;
		}

		return array(
			'src'    => (string) $value['url'],
			'alt'    => isset( $value['alt'] ) ? (string) $value['alt'] : '',
			'width'  => isset( $value['width'] ) ? (int) $value['width'] : 0,
			'height' => isset( $value['height'] ) ? (int) $value['height'] : 0,
		);
	}

	$id = (int) $value;
	if ( ! $id ) {
		return null;
	}

	$src = wp_get_attachment_image_src( $id, 'full' );
	if ( ! $src || empty( $src[0] ) ) {
		return null;
	}

	return array(
		'src'    => (string) $src[0],
		'alt'    => (string) get_post_meta( $id, '_wp_attachment_image_alt', true ),
		'width'  => isset( $src[1] ) ? (int) $src[1] : 0,
		'height' => isset( $src[2] ) ? (int) $src[2] : 0,
	);
}

/**
 * ACF field group: Chapter Settings → Identity & brand.
 */
add_action(
	'acf/init',
	function () {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		$image = function ( $key, $label, $name, $instructions ) {
			return array(
				'key'           => $key,
				'label'         => $label,
				'name'          => $name,
				'type'          => 'image',
				'return_format' => 'id',
				'preview_size'  => 'medium',
				'instructions'  => $instructions,
			);
		};

		acf_add_local_field_group(
			array(
				'key'        => 'group_progressnow_identity',
				'title'      => 'Identity & brand',
				'menu_order' => 0,
				'fields'     => array(
					array(
						'key'          => 'field_progressnow_identity_name',
						'label'        => 'Chapter name',
						'name'         => 'chapter_name',
						'type'         => 'text',
						'instructions' => 'Full organization name (footer bar, logo alt text, link previews, structured data). Leave blank for the theme default.',
					),
					array(
						'key'          => 'field_progressnow_identity_short_name',
						'label'        => 'Short name',
						'name'         => 'chapter_short_name',
						'type'         => 'text',
						'instructions' => 'Used inline in copy, e.g. “We are {short name}” and “{short name} 101”. Leave blank for “Progress Now”.',
					),
					array(
						'key'          => 'field_progressnow_identity_region',
						'label'        => 'Region label',
						'name'         => 'region_label',
						'type'         => 'text',
						'instructions' => 'How the chapter refers to where it organizes, used inline in copy, e.g. “across {region}”. Leave blank for “our community”.',
					),
					array(
						'key'          => 'field_progressnow_identity_hero_headline_text',
						'label'        => 'Hero headline',
						'name'         => 'hero_headline_text',
						'type'         => 'text',
						'instructions' => 'The home page <h1>. Leave blank for “A better world is possible!” (translatable in Polylang → Strings).',
					),
					$image( 'field_progressnow_identity_hero_photo', 'Hero photo', 'hero_photo', 'Right half of the home hero. Upload a normal color photo — the site applies the blue duotone. Leave blank for the shipped placeholder.' ),
					$image( 'field_progressnow_identity_who_image', 'Who-we-are photo', 'who_we_are_image', 'Left column of the “Who we are” section. Upload a normal color photo — the site applies the blue duotone. Leave blank for the shipped placeholder.' ),
					array(
						'key'   => 'field_progressnow_identity_who_alt',
						'label' => 'Who-we-are photo alt text',
						'name'  => 'who_we_are_alt',
						'type'  => 'text',
					),
					$image( 'field_progressnow_identity_cta_panel', 'CTA panel artwork', 'cta_panel_image', 'The panel under the flames on the home CTA band. Leave blank for the shipped blue panel.' ),
					$image( 'field_progressnow_identity_logo_header', 'Header logo', 'logo_header', 'Transparent logo rendered on the blue header (fixed height, up to 240px wide). Leave blank for the wordmark lockup (diamond + chapter name).' ),
					$image( 'field_progressnow_identity_logo_footer', 'Footer logo', 'logo_footer', 'Transparent logo rendered on the dark footer (fixed height, up to 240px wide). Leave blank for the wordmark lockup.' ),
					$image( 'field_progressnow_identity_logo_square', 'Square logo', 'logo_square', 'Square mark used in structured data (Organization.logo). Leave blank for the shipped placeholder.' ),
				),
				'location'   => array(
					array(
						array(
							'param'    => 'options_page',
							'operator' => '==',
							'value'    => 'progressnow-chapter-settings',
						),
					),
				),
			)
		);
	}
);
