<?php
/**
 * About + Get Involved page content.
 *
 * Owns: the ACF groups located on the About / Get Involved page templates
 * (page-templates/about.php, page-templates/get-involved.php — template-keyed
 * per design D9) and their Twig contexts. Every field falls back to the
 * design copy in PHP, so an unseeded page renders exactly the prototype.
 *
 * Sections carry a `visible` toggle (unset = shown), rich prose fields are
 * kses'd WYSIWYG, and each context exposes a `nav` array ({ href, label })
 * of visible sections — both on-this-page navs in the Twig render from it.
 */

/**
 * Does a URL point off-site? (target=_blank + rel=noopener in the Twig.)
 *
 * @param string $url Href (absolute, relative, anchor, or mailto).
 * @return bool
 */
function progressnow_pages_external( $url ) {
	$host = parse_url( $url, PHP_URL_HOST );
	$site = parse_url( home_url(), PHP_URL_HOST );

	return $host && $site && 0 !== strcasecmp( $host, $site );
}

/**
 * Read a scalar ACF field off a post, falling back when ACF is inactive or
 * the value is empty. Markup-bearing fields pass through wp_kses_post.
 *
 * @param int    $post_id Post ID.
 * @param string $name    Field name.
 * @param string $default Design copy fallback.
 * @param bool   $kses    Run wp_kses_post (fields rendered unescaped w/ markup).
 * @return string
 */
function progressnow_pages_text( $post_id, $name, $default, $kses = false ) {
	if ( ! function_exists( 'get_field' ) || ! $post_id ) {
		return $default;
	}

	$value = get_field( $name, $post_id );
	if ( ! is_string( $value ) || '' === trim( $value ) ) {
		return $default;
	}

	$value = trim( $value );

	return $kses ? wp_kses_post( $value ) : $value;
}

/**
 * Read a section-visibility toggle. Tri-state: a page saved before the field
 * existed (null/'' meta) reads as visible, so deploys never hide content.
 *
 * @param int    $post_id Post ID.
 * @param string $name    true_false field name.
 * @return bool
 */
function progressnow_pages_visible( $post_id, $name ) {
	if ( ! function_exists( 'get_field' ) || ! $post_id ) {
		return true;
	}

	$value = get_field( $name, $post_id );

	return ( null === $value || '' === $value ) ? true : (bool) $value;
}

/**
 * Read an ACF repeater, mapping rows through $map and falling back to the
 * design rows when empty.
 *
 * @param int      $post_id  Post ID.
 * @param string   $name     Repeater field name.
 * @param callable $map      Row mapper; return null to drop a row.
 * @param array    $defaults Design copy fallback rows.
 * @return array
 */
function progressnow_pages_rows( $post_id, $name, $map, $defaults ) {
	if ( ! function_exists( 'get_field' ) || ! $post_id ) {
		return $defaults;
	}

	$rows = get_field( $name, $post_id );
	if ( empty( $rows ) || ! is_array( $rows ) ) {
		return $defaults;
	}

	$mapped = array_values( array_filter( array_map( $map, $rows ) ) );

	return $mapped ?: $defaults;
}

/**
 * FAQ repeater sub-fields — one shape shared by About and Get Involved so the
 * two never drift.
 *
 * @param string $prefix Unique field-key prefix (e.g. progressnow_about_faq).
 * @return array
 */
function progressnow_pages_faq_sub_fields( $prefix ) {
	return array(
		array(
			'key'      => "field_{$prefix}_question",
			'label'    => 'Question',
			'name'     => 'question',
			'type'     => 'text',
			'required' => 1,
		),
		array(
			'key'   => "field_{$prefix}_answer",
			'label' => 'Answer',
			'name'  => 'answer',
			'type'  => 'textarea',
			'rows'  => 3,
		),
	);
}

/**
 * Map an ACF FAQ row to { question, answer }.
 *
 * @param array $row Repeater row.
 * @return array|null
 */
function progressnow_pages_faq_row( $row ) {
	$question = trim( (string) ( $row['question'] ?? '' ) );
	if ( '' === $question ) {
		return null;
	}

	return array(
		'question' => $question,
		'answer'   => trim( (string) ( $row['answer'] ?? '' ) ),
	);
}

/**
 * Map a label+url repeater row to { label, url, external }.
 *
 * @param array $row Repeater row with label + url keys.
 * @return array|null
 */
function progressnow_pages_link_row( $row ) {
	$label = trim( (string) ( $row['label'] ?? '' ) );
	$url   = trim( (string) ( $row['url'] ?? '' ) );
	if ( '' === $label || '' === $url ) {
		return null;
	}

	return array(
		'label'    => $label,
		'url'      => $url,
		'external' => progressnow_pages_external( $url ),
	);
}

/**
 * Custom ACF location rule "Page slug" — matches the edited post's post_name.
 *
 * Gives the template-keyed page groups editor parity with the front-end render,
 * which gates on the slug (page.php falls back to page-{slug}.twig and the
 * context filter keys on `'about' === $slug`). Matching post_name works per-post
 * across languages, unlike a single resolved page ID, so every translation of
 * the About / Get Involved page shows its fields even before a template is set.
 */
add_filter(
	'acf/location/rule_types',
	function ( $choices ) {
		$choices['Page']['page_slug'] = 'Page Slug';

		return $choices;
	}
);

add_filter(
	'acf/location/rule_values/type=page_slug',
	function ( $choices ) {
		return array(
			'about'        => 'about',
			'get-involved' => 'get-involved',
		);
	}
);

/**
 * Match the `page_slug` location rule against the edited post's post_name.
 *
 * @param bool  $result Result carried from earlier rules (unused).
 * @param array $rule   Location rule: { param, operator, value }.
 * @param array $screen ACF screen args; 'post_id' identifies the edited post.
 * @return bool
 */
function progressnow_pages_slug_match( $result, $rule, $screen ) {
	$post_id = isset( $screen['post_id'] ) ? (int) $screen['post_id'] : 0;
	$post    = $post_id ? get_post( $post_id ) : null;
	$match   = $post ? ( $post->post_name === $rule['value'] ) : false;

	return ( '!=' === $rule['operator'] ) ? ! $match : $match;
}
add_filter( 'acf/location/rule_match/page_slug', 'progressnow_pages_slug_match', 10, 3 );

/**
 * Location rules for a template-keyed page group: match the page template OR
 * the page slug (see the custom `page_slug` rule above). The slug arm gives the
 * editor parity with the front-end render, so the fields show on the canonical
 * page even before its template is assigned.
 *
 * @param string $template Template path, e.g. page-templates/about.php.
 * @param string $slug     Canonical page slug, e.g. about.
 * @return array ACF location rule groups (outer array OR'd).
 */
function progressnow_pages_location( $template, $slug ) {
	return array(
		array(
			array(
				'param'    => 'page_template',
				'operator' => '==',
				'value'    => $template,
			),
		),
		array(
			array(
				'param'    => 'page_slug',
				'operator' => '==',
				'value'    => $slug,
			),
		),
	);
}

/* -------------------------------------------------------------------------
 * ACF field groups
 * ---------------------------------------------------------------------- */

add_action(
	'acf/init',
	function () {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		acf_add_local_field_group(
			array(
				'key'      => 'group_progressnow_about_page',
				'title'    => 'About page',
				'location' => progressnow_pages_location( 'page-templates/about.php', 'about' ),
				'fields'   => array(
					array(
						'key'   => 'field_progressnow_about_tab_mission_band',
						'label' => 'Mission band',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_about_show_mission',
						'label'         => 'Show section',
						'name'          => 'about_show_mission',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_about_mission_eyebrow',
						'label' => 'Eyebrow',
						'name'  => 'about_mission_eyebrow',
						'type'  => 'text',
					),
					array(
						'key'   => 'field_progressnow_about_mission_body',
						'label' => 'Statement',
						'name'  => 'about_mission_body',
						'type'  => 'textarea',
						'rows'  => 3,
					),
					array(
						'key'   => 'field_progressnow_about_tab_chapter',
						'label' => 'About the Chapter',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_about_show_chapter',
						'label'         => 'Show section',
						'name'          => 'about_show_chapter',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_about_chapter_heading',
						'label' => 'Heading',
						'name'  => 'about_chapter_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_about_intro_p1',
						'label'        => 'First paragraph',
						'name'         => 'about_intro_p1',
						'type'         => 'wysiwyg',
						'media_upload' => 0,
						'toolbar'      => 'basic',
					),
					array(
						'key'          => 'field_progressnow_about_intro_p2',
						'label'        => 'Second paragraph',
						'name'         => 'about_intro_p2',
						'type'         => 'wysiwyg',
						'media_upload' => 0,
						'toolbar'      => 'basic',
					),
					array(
						'key'           => 'field_progressnow_about_photo',
						'label'         => 'Chapter photo',
						'name'          => 'about_photo',
						'type'          => 'image',
						'return_format' => 'array',
						'preview_size'  => 'medium',
						'instructions'  => 'Optional. A decorative placeholder panel renders when empty.',
					),
					array(
						'key'          => 'field_progressnow_about_ctas',
						'label'        => 'CTA buttons',
						'name'         => 'about_ctas',
						'type'         => 'repeater',
						'layout'       => 'table',
						'button_label' => 'Add button',
						'instructions' => 'First button renders solid, the rest outlined. Leave empty for the theme defaults.',
						'sub_fields'   => array(
							array(
								'key'      => 'field_progressnow_about_ctas_label',
								'label'    => 'Label',
								'name'     => 'label',
								'type'     => 'text',
								'required' => 1,
							),
							array(
								'key'          => 'field_progressnow_about_ctas_url',
								'label'        => 'URL',
								'name'         => 'url',
								'type'         => 'text',
								'instructions' => 'Full URL, relative path, or #anchor.',
							),
						),
					),
					array(
						'key'   => 'field_progressnow_about_tab_history',
						'label' => 'Mission & History',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_about_show_history',
						'label'         => 'Show section',
						'name'          => 'about_show_history',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_about_history_heading',
						'label' => 'Heading',
						'name'  => 'about_history_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_about_history_body',
						'label'        => 'Intro paragraph',
						'name'         => 'about_history_body',
						'type'         => 'wysiwyg',
						'media_upload' => 0,
						'toolbar'      => 'basic',
					),
					array(
						'key'          => 'field_progressnow_about_timeline',
						'label'        => 'Timeline',
						'name'         => 'about_timeline',
						'type'         => 'repeater',
						'layout'       => 'block',
						'button_label' => 'Add milestone',
						'sub_fields'   => array(
							array(
								'key'      => 'field_progressnow_about_timeline_year',
								'label'    => 'Year',
								'name'     => 'year',
								'type'     => 'text',
								'required' => 1,
							),
							array(
								'key'   => 'field_progressnow_about_timeline_text',
								'label' => 'Milestone',
								'name'  => 'text',
								'type'  => 'textarea',
								'rows'  => 2,
							),
						),
					),
					array(
						'key'   => 'field_progressnow_about_tab_counties',
						'label' => 'Counties',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_about_show_counties',
						'label'         => 'Show section',
						'name'          => 'about_show_counties',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_about_counties_heading',
						'label' => 'Heading',
						'name'  => 'about_counties_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_about_counties_intro',
						'label'        => 'Intro paragraph',
						'name'         => 'about_counties_intro',
						'type'         => 'wysiwyg',
						'media_upload' => 0,
						'toolbar'      => 'basic',
					),
					array(
						'key'          => 'field_progressnow_about_county_cards',
						'label'        => 'County cards',
						'name'         => 'about_county_cards',
						'type'         => 'repeater',
						'layout'       => 'block',
						'button_label' => 'Add county',
						'sub_fields'   => array(
							array(
								'key'      => 'field_progressnow_about_county_cards_name',
								'label'    => 'County',
								'name'     => 'name',
								'type'     => 'text',
								'required' => 1,
							),
							array(
								'key'          => 'field_progressnow_about_county_cards_cities',
								'label'        => 'Cities',
								'name'         => 'cities',
								'type'         => 'text',
								'instructions' => 'e.g. Downtown · Midtown',
							),
							array(
								'key'          => 'field_progressnow_about_county_cards_note',
								'label'        => 'Note',
								'name'         => 'note',
								'type'         => 'text',
								'instructions' => 'Optional red note line, e.g. "Home base — most meetings held here".',
							),
						),
					),
					array(
						'key'   => 'field_progressnow_about_tab_committees',
						'label' => 'Committees',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_about_show_committees',
						'label'         => 'Show section',
						'name'          => 'about_show_committees',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_about_committees_heading',
						'label' => 'Heading',
						'name'  => 'about_committees_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_about_committees_intro',
						'label'        => 'Intro paragraph',
						'name'         => 'about_committees_intro',
						'type'         => 'wysiwyg',
						'media_upload' => 0,
						'toolbar'      => 'basic',
						'instructions' => 'The committee rows themselves are edited under Chapter Settings.',
					),
					array(
						'key'   => 'field_progressnow_about_committees_link_label',
						'label' => 'Cross-link label',
						'name'  => 'about_committees_link_label',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_about_committees_link_url',
						'label'        => 'Cross-link URL',
						'name'         => 'about_committees_link_url',
						'type'         => 'text',
						'instructions' => 'Link below the committee rows. Full URL, relative path, or #anchor.',
					),
					array(
						'key'   => 'field_progressnow_about_tab_governance',
						'label' => 'Bylaws & Code of Conduct',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_about_show_governance',
						'label'         => 'Show section',
						'name'          => 'about_show_governance',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_about_governance_heading',
						'label' => 'Heading',
						'name'  => 'about_governance_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_about_governance_intro',
						'label'        => 'Intro paragraph',
						'name'         => 'about_governance_intro',
						'type'         => 'wysiwyg',
						'media_upload' => 0,
						'toolbar'      => 'basic',
					),
					array(
						'key'          => 'field_progressnow_about_governance_docs',
						'label'        => 'Documents',
						'name'         => 'about_governance_docs',
						'type'         => 'repeater',
						'layout'       => 'block',
						'button_label' => 'Add document',
						'sub_fields'   => array(
							array(
								'key'      => 'field_progressnow_about_governance_docs_title',
								'label'    => 'Title',
								'name'     => 'title',
								'type'     => 'text',
								'required' => 1,
							),
							array(
								'key'   => 'field_progressnow_about_governance_docs_covers',
								'label' => 'What it covers',
								'name'  => 'covers',
								'type'  => 'textarea',
								'rows'  => 2,
							),
							array(
								'key'           => 'field_progressnow_about_governance_docs_action',
								'label'         => 'Action label',
								'name'          => 'action',
								'type'          => 'text',
								'default_value' => 'Read',
							),
							array(
								'key'          => 'field_progressnow_about_governance_docs_url',
								'label'        => 'URL',
								'name'         => 'url',
								'type'         => 'text',
								'instructions' => 'Full URL, relative path, or #anchor.',
							),
						),
					),
					array(
						'key'   => 'field_progressnow_about_tab_faq',
						'label' => 'FAQ',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_about_show_faq',
						'label'         => 'Show section',
						'name'          => 'about_show_faq',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_about_faq_heading',
						'label' => 'Heading',
						'name'  => 'about_faq_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_about_faq',
						'label'        => 'FAQ rows',
						'name'         => 'about_faq',
						'type'         => 'repeater',
						'layout'       => 'block',
						'button_label' => 'Add question',
						'sub_fields'   => progressnow_pages_faq_sub_fields( 'progressnow_about_faq' ),
					),
					array(
						'key'   => 'field_progressnow_about_tab_dues',
						'label' => 'Dues callout',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_about_show_dues',
						'label'         => 'Show section',
						'name'          => 'about_show_dues',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_about_dues_heading',
						'label' => 'Heading',
						'name'  => 'about_dues_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_about_dues_body',
						'label'        => 'Body',
						'name'         => 'about_dues_body',
						'type'         => 'wysiwyg',
						'media_upload' => 0,
						'toolbar'      => 'basic',
						'instructions' => 'The button below it links to the Join URL from Chapter Settings.',
					),
				),
			)
		);

		acf_add_local_field_group(
			array(
				'key'      => 'group_progressnow_get_involved_page',
				'title'    => 'Get Involved page',
				'location' => progressnow_pages_location( 'page-templates/get-involved.php', 'get-involved' ),
				'fields'   => array(
					array(
						'key'   => 'field_progressnow_gi_tab_join',
						'label' => 'How to join',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_gi_show_join',
						'label'         => 'Show section',
						'name'          => 'gi_show_join',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_gi_join_heading',
						'label' => 'Heading',
						'name'  => 'gi_join_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_gi_steps',
						'label'        => 'Join steps',
						'name'         => 'gi_steps',
						'type'         => 'repeater',
						'layout'       => 'block',
						'button_label' => 'Add step',
						'instructions' => 'Numbered automatically. Basic HTML (e.g. <strong>) allowed in the body. Leave empty for the theme defaults.',
						'sub_fields'   => array(
							array(
								'key'      => 'field_progressnow_gi_steps_title',
								'label'    => 'Title',
								'name'     => 'title',
								'type'     => 'text',
								'required' => 1,
							),
							array(
								'key'          => 'field_progressnow_gi_steps_body',
								'label'        => 'Body',
								'name'         => 'body',
								'type'         => 'wysiwyg',
								'media_upload' => 0,
								'toolbar'      => 'basic',
							),
							array(
								'key'   => 'field_progressnow_gi_steps_link_label',
								'label' => 'Link label',
								'name'  => 'link_label',
								'type'  => 'text',
							),
							array(
								'key'          => 'field_progressnow_gi_steps_link_url',
								'label'        => 'Link URL',
								'name'         => 'link_url',
								'type'         => 'text',
								'instructions' => 'Full URL, relative path, or #anchor. Leave empty with the label empty to omit the link.',
							),
						),
					),
					array(
						'key'   => 'field_progressnow_gi_tab_committees',
						'label' => 'Committees',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_gi_show_committees',
						'label'         => 'Show section',
						'name'          => 'gi_show_committees',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_gi_committees_heading',
						'label' => 'Heading',
						'name'  => 'gi_committees_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_gi_committees_intro',
						'label'        => 'Intro paragraph',
						'name'         => 'gi_committees_intro',
						'type'         => 'wysiwyg',
						'media_upload' => 0,
						'toolbar'      => 'basic',
						'instructions' => 'The committee cards themselves are edited under Chapter Settings.',
					),
					array(
						'key'   => 'field_progressnow_gi_tab_channels',
						'label' => 'Communication channels',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_gi_show_channels',
						'label'         => 'Show section',
						'name'          => 'gi_show_channels',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_gi_channels_heading',
						'label' => 'Heading',
						'name'  => 'gi_channels_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_gi_channels',
						'label'        => 'Channels',
						'name'         => 'gi_channels',
						'type'         => 'repeater',
						'layout'       => 'block',
						'button_label' => 'Add channel',
						'instructions' => 'Set a link label + URL for a button, or a badge for a non-link tag (e.g. "Members only"). Leave empty for the theme defaults.',
						'sub_fields'   => array(
							array(
								'key'      => 'field_progressnow_gi_channels_label',
								'label'    => 'Channel',
								'name'     => 'label',
								'type'     => 'text',
								'required' => 1,
							),
							array(
								'key'   => 'field_progressnow_gi_channels_desc',
								'label' => 'Description',
								'name'  => 'desc',
								'type'  => 'text',
							),
							array(
								'key'   => 'field_progressnow_gi_channels_link_label',
								'label' => 'Link label',
								'name'  => 'link_label',
								'type'  => 'text',
							),
							array(
								'key'          => 'field_progressnow_gi_channels_url',
								'label'        => 'Link URL',
								'name'         => 'url',
								'type'         => 'text',
								'instructions' => 'Full URL or mailto:. Leave empty to show the badge instead.',
							),
							array(
								'key'   => 'field_progressnow_gi_channels_badge',
								'label' => 'Badge',
								'name'  => 'badge',
								'type'  => 'text',
							),
						),
					),
					array(
						'key'   => 'field_progressnow_gi_tab_faq',
						'label' => 'Common questions',
						'type'  => 'tab',
					),
					array(
						'key'           => 'field_progressnow_gi_show_faq',
						'label'         => 'Show section',
						'name'          => 'gi_show_faq',
						'type'          => 'true_false',
						'default_value' => 1,
						'ui'            => 1,
					),
					array(
						'key'   => 'field_progressnow_gi_faq_heading',
						'label' => 'Heading',
						'name'  => 'gi_faq_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_gi_faq',
						'label'        => 'FAQ items',
						'name'         => 'gi_faq',
						'type'         => 'repeater',
						'layout'       => 'block',
						'button_label' => 'Add question',
						'sub_fields'   => progressnow_pages_faq_sub_fields( 'progressnow_gi_faq' ),
					),
					array(
						'key'   => 'field_progressnow_gi_tab_sidebar',
						'label' => 'Sidebar card',
						'type'  => 'tab',
					),
					array(
						'key'   => 'field_progressnow_gi_card_heading',
						'label' => 'Heading',
						'name'  => 'gi_card_heading',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_gi_card_body',
						'label'        => 'Body',
						'name'         => 'gi_card_body',
						'type'         => 'wysiwyg',
						'media_upload' => 0,
						'toolbar'      => 'basic',
					),
					array(
						'key'   => 'field_progressnow_gi_card_link_label',
						'label' => 'Button label',
						'name'  => 'gi_card_link_label',
						'type'  => 'text',
					),
					array(
						'key'          => 'field_progressnow_gi_card_link_url',
						'label'        => 'Button URL',
						'name'         => 'gi_card_link_url',
						'type'         => 'text',
						'instructions' => 'Leave empty to use the Join URL from Chapter Settings.',
					),
					array(
						'key'          => 'field_progressnow_gi_related_links',
						'label'        => 'Related links',
						'name'         => 'gi_related_links',
						'type'         => 'repeater',
						'layout'       => 'table',
						'button_label' => 'Add link',
						'instructions' => 'The "Related" sidebar list. Leave empty for the theme defaults.',
						'sub_fields'   => array(
							array(
								'key'      => 'field_progressnow_gi_related_links_label',
								'label'    => 'Label',
								'name'     => 'label',
								'type'     => 'text',
								'required' => 1,
							),
							array(
								'key'          => 'field_progressnow_gi_related_links_url',
								'label'        => 'URL',
								'name'         => 'url',
								'type'         => 'text',
								'instructions' => 'Full URL, relative path, or #anchor.',
							),
						),
					),
				),
			)
		);
	}
);

/* -------------------------------------------------------------------------
 * Twig contexts
 * ---------------------------------------------------------------------- */

/**
 * About page context — every key defaulted to the design copy.
 *
 * @param int $post_id About page ID.
 * @return array
 */
function progressnow_about_context( $post_id ) {
	$photo = null;
	if ( function_exists( 'get_field' ) && $post_id ) {
		$image = get_field( 'about_photo', $post_id );
		if ( ! empty( $image['url'] ) ) {
			$photo = array(
				'src' => $image['url'],
				'alt' => ! empty( $image['alt'] ) ? $image['alt'] : 'Chapter members at a meeting or action',
			);
		}
	}

	$identity            = progressnow_identity();
	$short               = esc_html( $identity['short_name'] );
	$region              = $identity['region_label'];
	$committees_link_url = progressnow_pages_text( $post_id, 'about_committees_link_url', '/get-involved/#committees' );

	$about = array(
		'mission'    => array(
			'visible' => progressnow_pages_visible( $post_id, 'about_show_mission' ),
			'eyebrow' => progressnow_pages_text( $post_id, 'about_mission_eyebrow', 'What we believe' ),
			'body'    => progressnow_pages_text( $post_id, 'about_mission_body', 'We believe our economy should be built democratically, by and for working people — not by billionaires for profit.' ),
		),
		'chapter'    => array(
			'visible' => progressnow_pages_visible( $post_id, 'about_show_chapter' ),
			'heading' => progressnow_pages_text( $post_id, 'about_chapter_heading', 'About the Chapter' ),
			'p1'      => progressnow_pages_text( $post_id, 'about_intro_p1', sprintf( 'We are a member-run, member-funded organizing group. Our grassroots work focuses on labor organizing, mutual aid, and political education across %s.', $region ), true ),
			'p2'      => progressnow_pages_text( $post_id, 'about_intro_p2', 'Everything we do is member-led, member-funded, and open to anyone who wants to build a community that works for working people. We regularly host community meetings to share updates, plan campaigns, and hold political education lectures. If you’re a student, ask us about our campus branch.', true ),
			'photo'   => $photo,
			'ctas'    => progressnow_pages_rows(
				$post_id,
				'about_ctas',
				'progressnow_pages_link_row',
				array(
					array( 'label' => 'Come to a meeting', 'url' => '/calendar/', 'external' => false ),
					array( 'label' => 'Get involved', 'url' => '/get-involved/', 'external' => false ),
					array( 'label' => 'Students', 'url' => '/get-involved/', 'external' => false ),
				)
			),
		),
		'history'    => array(
			'visible'  => progressnow_pages_visible( $post_id, 'about_show_history' ),
			'heading'  => progressnow_pages_text( $post_id, 'about_history_heading', 'Mission & History' ),
			'body'     => progressnow_pages_text( $post_id, 'about_history_body', sprintf( 'We fight for a future where housing, healthcare, and a dignified living are guaranteed — and we believe the people who live and work in %s should be the ones deciding it. Our work centers on three pillars: labor organizing, mutual aid, and political education.', $region ), true ),
			// 20XX years are chapter-copy placeholders (edited in wp-admin) — do not invent dates.
			'timeline' => progressnow_pages_rows(
				$post_id,
				'about_timeline',
				function ( $row ) {
					$year = trim( (string) ( $row['year'] ?? '' ) );
					if ( '' === $year ) {
						return null;
					}
					return array(
						'year' => $year,
						'text' => wp_kses_post( trim( (string) ( $row['text'] ?? '' ) ) ),
					);
				},
				array(
					array( 'year' => '1982', 'text' => 'Progress Now is founded as a member-run organizing project.' ),
					array( 'year' => '20XX', 'text' => 'Local organizers form an organizing committee and begin meeting. <em class="text-muted">(Year and details to be filled in by the chapter.)</em>' ),
					array( 'year' => '20XX', 'text' => 'The chapter is chartered as an official local chapter. <em class="text-muted">(Year and details to be filled in by the chapter.)</em>' ),
				)
			),
		),
		'counties'   => array(
			'visible' => progressnow_pages_visible( $post_id, 'about_show_counties' ),
			'heading' => progressnow_pages_text( $post_id, 'about_counties_heading', 'Where We Organize' ),
			'intro'   => progressnow_pages_text( $post_id, 'about_counties_intro', sprintf( 'One chapter, many communities. Wherever you are in %s, you’re covered — and if you can help us organize deeper in your neighborhood, we want to hear from you.', $region ), true ),
			'cards'   => progressnow_pages_rows(
				$post_id,
				'about_county_cards',
				function ( $row ) {
					$name = trim( (string) ( $row['name'] ?? '' ) );
					if ( '' === $name ) {
						return null;
					}
					return array(
						'name'   => $name,
						'cities' => trim( (string) ( $row['cities'] ?? '' ) ),
						'note'   => trim( (string) ( $row['note'] ?? '' ) ),
					);
				},
				array(
					// Placeholder areas — the chapter replaces these in wp-admin.
					array( 'name' => 'Central', 'cities' => 'Downtown · Midtown', 'note' => 'Home base — most meetings held here' ),
					array( 'name' => 'North', 'cities' => 'Northside · Uptown', 'note' => '' ),
					array( 'name' => 'South', 'cities' => 'Southside · Riverside', 'note' => '' ),
					array( 'name' => 'Campus', 'cities' => 'Student branch', 'note' => '' ),
				)
			),
		),
		'committees' => array(
			'visible' => progressnow_pages_visible( $post_id, 'about_show_committees' ),
			'heading' => progressnow_pages_text( $post_id, 'about_committees_heading', 'Committees' ),
			'intro'   => progressnow_pages_text( $post_id, 'about_committees_intro', 'Committees are where the work happens. Each one meets regularly and welcomes new members.', true ),
			'link'    => array(
				'label'    => progressnow_pages_text( $post_id, 'about_committees_link_label', 'Join a committee' ),
				'url'      => $committees_link_url,
				'external' => progressnow_pages_external( $committees_link_url ),
			),
		),
		'governance' => array(
			'visible' => progressnow_pages_visible( $post_id, 'about_show_governance' ),
			'heading' => progressnow_pages_text( $post_id, 'about_governance_heading', 'Bylaws & Code of Conduct' ),
			'intro'   => progressnow_pages_text( $post_id, 'about_governance_intro', 'The chapter is governed by its members through documents we debate and vote on together. Everything is public.', true ),
			'docs'    => progressnow_pages_rows(
				$post_id,
				'about_governance_docs',
				function ( $row ) {
					$title = trim( (string) ( $row['title'] ?? '' ) );
					if ( '' === $title ) {
						return null;
					}
					$action = trim( (string) ( $row['action'] ?? '' ) );
					return array(
						'title'  => $title,
						'covers' => trim( (string) ( $row['covers'] ?? '' ) ),
						'action' => '' !== $action ? $action : 'Read',
						'url'    => trim( (string) ( $row['url'] ?? '' ) ),
					);
				},
				array(
					array( 'title' => 'Chapter Bylaws', 'covers' => 'How the chapter runs: officers, elections, quorum, committees, and how decisions get made.', 'action' => 'Read', 'url' => '/bylaws-code-of-conduct/#documents' ),
					array( 'title' => 'Code of Conduct', 'covers' => 'What we expect of each other in every chapter space — meetings, actions, and online.', 'action' => 'Read', 'url' => '/bylaws-code-of-conduct/#documents' ),
					array( 'title' => 'Grievance Policy', 'covers' => 'How to report harm and how the chapter handles conflict, confidentially and fairly.', 'action' => 'Read', 'url' => '/bylaws-code-of-conduct/#grievance' ),
					array( 'title' => 'Meeting Minutes', 'covers' => 'Records and resolutions from general meetings, available to all members.', 'action' => 'Browse', 'url' => '/bylaws-code-of-conduct/#documents' ),
				)
			),
		),
		'faq'        => array(
			'visible' => progressnow_pages_visible( $post_id, 'about_show_faq' ),
			'heading' => progressnow_pages_text( $post_id, 'about_faq_heading', 'FAQ' ),
			'rows'    => progressnow_pages_rows(
				$post_id,
				'about_faq',
				'progressnow_pages_faq_row',
				array(
					array( 'question' => 'Do I have to be a member to come to events?', 'answer' => "Nope — most of our events are open to everyone. Come to a 101 or a social, meet folks, and see if it's for you." ),
					array( 'question' => 'How much are dues?', 'answer' => 'Dues are sliding-scale — most folks pay a few dollars a month. No one is turned away for inability to pay.' ),
					array( 'question' => 'How do I change my dues rate?', 'answer' => 'Enter the email associated with your membership in the dues form with your new dues amount, and your current dues will be canceled and updated.' ),
					array( 'question' => "I've never done anything political before. Is that okay?", 'answer' => "More than okay — it's the norm. Most members joined without any organizing experience. {$short} 101 exists exactly for this." ),
					array( 'question' => 'Can I participate without being publicly visible?', 'answer' => "Yes. There are plenty of ways to contribute behind the scenes, and we take members' privacy and safety seriously." ),
					array( 'question' => 'How much time does membership take?', 'answer' => 'As much or as little as you have. Some members show up to one event a month; others help lead committees.' ),
				)
			),
		),
		'dues'       => array(
			'visible' => progressnow_pages_visible( $post_id, 'about_show_dues' ),
			'heading' => progressnow_pages_text( $post_id, 'about_dues_heading', 'Switching your dues rate?' ),
			'body'    => progressnow_pages_text( $post_id, 'about_dues_body', 'Already a member and changing your dues rate? Enter the email associated with your membership in the dues form with your new dues amount, and your current dues will be canceled and updated.', true ),
		),
	);

	// On-this-page nav — visible sections only, labels track the headings.
	// Anchors match the section ids in page-about.twig.
	$about['nav'] = array();
	foreach ( array(
		'chapter'    => '#chapter',
		'history'    => '#mission',
		'counties'   => '#counties',
		'committees' => '#committees',
		'governance' => '#bylaws',
		'faq'        => '#faq',
	) as $key => $href ) {
		if ( $about[ $key ]['visible'] ) {
			$about['nav'][] = array(
				'href'  => $href,
				'label' => $about[ $key ]['heading'],
			);
		}
	}

	return $about;
}

/**
 * Get Involved page context — every key defaulted to the design copy.
 *
 * @param int    $post_id  Get Involved page ID.
 * @param string $join_url Chapter join URL (step 1 / sidebar fallback href).
 * @return array
 */
function progressnow_get_involved_context( $post_id, $join_url ) {
	$identity = progressnow_identity();
	$short    = esc_html( $identity['short_name'] );

	// No default profile: the Instagram channel card renders only when the
	// chapter has configured the URL in Chapter Settings.
	$instagram = '';
	if ( function_exists( 'get_field' ) ) {
		$option = get_field( 'instagram_url', 'option' );
		if ( is_string( $option ) && '' !== trim( $option ) ) {
			$instagram = trim( $option );
		}
	}

	$channel_defaults = array(
		array( 'label' => 'WhatsApp', 'desc' => 'Our main channel — members receive an invite during onboarding', 'link_label' => '', 'url' => '', 'badge' => 'Members only', 'external' => false ),
	);
	if ( '' !== $instagram ) {
		$channel_defaults[] = array( 'label' => 'Instagram', 'desc' => 'Events, actions, and updates for everyone', 'link_label' => 'Follow', 'url' => $instagram, 'badge' => '', 'external' => true );
	}
	$channel_defaults[] = array( 'label' => 'Email', 'desc' => 'Questions, press, and anything else', 'link_label' => 'Write us', 'url' => 'mailto:', 'badge' => '', 'external' => false );

	$card_url = progressnow_pages_text( $post_id, 'gi_card_link_url', $join_url );

	$gi = array(
		'join'       => array(
			'visible' => progressnow_pages_visible( $post_id, 'gi_show_join' ),
			'heading' => progressnow_pages_text( $post_id, 'gi_join_heading', 'How to join' ),
			'steps'   => progressnow_pages_rows(
				$post_id,
				'gi_steps',
			function ( $row ) {
				$title = trim( (string) ( $row['title'] ?? '' ) );
				if ( '' === $title ) {
					return null;
				}
				$url = trim( (string) ( $row['link_url'] ?? '' ) );
				return array(
					'title'      => $title,
					'body'       => wp_kses_post( trim( (string) ( $row['body'] ?? '' ) ) ),
					'link_label' => trim( (string) ( $row['link_label'] ?? '' ) ),
					'href'       => $url,
					'external'   => progressnow_pages_external( $url ),
				);
			},
			array(
				array( 'title' => 'Become a member', 'body' => 'Sign up in a few minutes. Dues are sliding-scale — pay what you can, and <strong>no one is turned away for lack of funds</strong>.', 'link_label' => 'Join now →', 'href' => $join_url, 'external' => true ),
				array( 'title' => "Come to {$short} 101", 'body' => "Our intro session for new and curious folks — what we stand for, what our chapter is working on, and how to plug in. Offered virtually and in person, multiple times a month. You don't have to be a member yet to attend.", 'link_label' => 'Find a session →', 'href' => '/calendar/', 'external' => false ),
				array( 'title' => 'Get onboarded & plug in', 'body' => "After 101, we'll add you to our WhatsApp and match you with a committee that fits your interests and capacity — whether that's an hour a month or a night a week.", 'link_label' => 'Browse committees ↓', 'href' => '#committees', 'external' => false ),
			)
			),
		),
		'committees' => array(
			'visible' => progressnow_pages_visible( $post_id, 'gi_show_committees' ),
			'heading' => progressnow_pages_text( $post_id, 'gi_committees_heading', 'Committees' ),
			'intro'   => progressnow_pages_text( $post_id, 'gi_committees_intro', 'Committees are where the work happens. Each one meets regularly and welcomes new members — reach out through the WhatsApp or at any general meeting.', true ),
		),
		'channels'   => array(
			'visible' => progressnow_pages_visible( $post_id, 'gi_show_channels' ),
			'heading' => progressnow_pages_text( $post_id, 'gi_channels_heading', 'Communication channels' ),
			'items'   => progressnow_pages_rows(
				$post_id,
				'gi_channels',
			function ( $row ) {
				$label = trim( (string) ( $row['label'] ?? '' ) );
				if ( '' === $label ) {
					return null;
				}
				$url        = trim( (string) ( $row['url'] ?? '' ) );
				$link_label = trim( (string) ( $row['link_label'] ?? '' ) );
				return array(
					'label'      => wp_kses_post( $label ),
					'desc'       => trim( (string) ( $row['desc'] ?? '' ) ),
					'link_label' => $link_label,
					'url'        => $url,
					'badge'      => trim( (string) ( $row['badge'] ?? '' ) ),
					'external'   => progressnow_pages_external( $url ),
				);
			},
			$channel_defaults
			),
		),
		'faq'        => array(
			'visible' => progressnow_pages_visible( $post_id, 'gi_show_faq' ),
			'heading' => progressnow_pages_text( $post_id, 'gi_faq_heading', 'Common questions' ),
			'items'   => progressnow_pages_rows(
				$post_id,
				'gi_faq',
				'progressnow_pages_faq_row',
			array(
				array( 'question' => 'Do I have to be a member to come to events?', 'answer' => "Nope — most of our events are open to everyone. Come to a 101 or a social, meet folks, and see if it's for you. No pressure." ),
				array( 'question' => 'How much are dues?', 'answer' => 'Dues are sliding-scale — most folks pay a few dollars a month. If dues are a barrier, talk to us: no one is turned away for lack of funds.' ),
				array( 'question' => "I've never done anything political before. Is that okay?", 'answer' => "More than okay — it's the norm. Most members joined without any organizing experience. {$short} 101 exists exactly for this, and committees will teach you everything as you go." ),
				array( 'question' => 'Can I participate without being publicly visible?', 'answer' => "Yes. There are plenty of ways to contribute behind the scenes, and we take members' privacy and safety seriously. Talk to us about what you're comfortable with." ),
				array( 'question' => 'How much time does membership take?', 'answer' => "As much or as little as you have. Some members show up to one event a month; others help lead committees. Capacity changes — that's fine. The work is a marathon, not a sprint." ),
			)
			),
		),
		'card'       => array(
			'heading'    => progressnow_pages_text( $post_id, 'gi_card_heading', 'Ready right now?' ),
			'body'       => progressnow_pages_text( $post_id, 'gi_card_body', 'Membership takes five minutes, and dues are pay-what-you-can.', true ),
			'link_label' => progressnow_pages_text( $post_id, 'gi_card_link_label', 'Join us' ),
			'url'        => $card_url,
			'external'   => progressnow_pages_external( $card_url ),
		),
		'related'    => progressnow_pages_rows(
			$post_id,
			'gi_related_links',
			'progressnow_pages_link_row',
			array(
				array( 'label' => 'Event Calendar', 'url' => '/calendar/', 'external' => false ),
				array( 'label' => 'Bylaws & Code of Conduct', 'url' => '/bylaws-code-of-conduct/', 'external' => false ),
				array( 'label' => 'Mission & History', 'url' => '/about/#mission', 'external' => false ),
			)
		),
	);

	// On-this-page nav — visible sections only, labels track the headings.
	// Anchors match the section ids in page-get-involved.twig.
	$gi['nav'] = array();
	foreach ( array(
		'join'       => '#join',
		'committees' => '#committees',
		'channels'   => '#channels',
		'faq'        => '#faq',
	) as $key => $href ) {
		if ( $gi[ $key ]['visible'] ) {
			$gi['nav'][] = array(
				'href'  => $href,
				'label' => $gi[ $key ]['heading'],
			);
		}
	}

	return $gi;
}

/**
 * Inject the About / Get Involved contexts. Gated on the page template OR the
 * slug page.php would resolve to the same twig, so a page that predates the
 * template assignment still renders with content.
 */
add_filter( 'progressnow/context/page', 'progressnow_pages_page_context', 10, 2 );
function progressnow_pages_page_context( $context, $timber_post ) {
		$post_id = $timber_post ? (int) $timber_post->ID : 0;
		$slug    = $timber_post ? (string) $timber_post->post_name : '';

		// Template checks read the post itself (not the queried object) so the
		// same filter chain builds the REST payloads outside the main query.
		if ( progressnow_page_uses_template( $post_id, 'page-templates/about.php' ) || 'about' === $slug ) {
			$context['about'] = progressnow_about_context( $post_id );
		}

		if ( progressnow_page_uses_template( $post_id, 'page-templates/get-involved.php' ) || 'get-involved' === $slug ) {
			$join_url            = isset( $context['chapter']['join_url'] ) ? (string) $context['chapter']['join_url'] : '/get-involved/#join';
			$context['gi']       = progressnow_get_involved_context( $post_id, $join_url );
			// Email channel default: complete the mailto with the chapter address.
			if ( ! empty( $context['chapter']['contact_email'] ) ) {
				foreach ( $context['gi']['channels']['items'] as $i => $channel ) {
					if ( 'mailto:' === $channel['url'] ) {
						$context['gi']['channels']['items'][ $i ]['url'] = 'mailto:' . $context['chapter']['contact_email'];
					}
				}
			}
		}

		return $context;
}
