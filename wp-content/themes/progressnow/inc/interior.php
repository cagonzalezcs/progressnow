<?php
/**
 * Interior page template wiring.
 *
 * Owns: governing-documents ACF repeater on pages and the page.twig
 * documents context.
 */

/**
 * ACF field group: Interior page (documents repeater + lede override).
 */
add_action( 'acf/init', function () {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( array(
		'key'      => 'group_progressnow_interior_page',
		'title'    => 'Interior page',
		'location' => array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'page',
				),
			),
		),
		'fields'   => array(
			array(
				'key'          => 'field_progressnow_interior_lede',
				'label'        => 'Lede',
				'name'         => 'lede',
				'type'         => 'text',
				'instructions' => 'Optional override for the page-header lede. Falls back to the excerpt when empty.',
			),
			array(
				'key'          => 'field_progressnow_interior_seo_description',
				'label'        => 'Search description',
				'name'         => 'seo_description',
				'type'         => 'textarea',
				'rows'         => 2,
				'instructions' => 'Optional meta description for search engines and link previews (~155 characters). Falls back to the lede, then the site tagline.',
			),
			array(
				'key'           => 'field_progressnow_interior_show_grievance',
				'label'         => 'Show grievance callout',
				'name'          => 'show_grievance',
				'type'          => 'true_false',
				'default_value' => 1,
				'ui'            => 1,
			),
			array(
				'key'          => 'field_progressnow_interior_grievance_body',
				'label'        => 'Grievance callout body',
				'name'         => 'grievance_body',
				'type'         => 'wysiwyg',
				'media_upload' => 0,
				'instructions' => 'Shown in the grievance callout. Leave empty to use the default copy (with the chapter contact email).',
			),
			array(
				'key'          => 'field_progressnow_interior_documents',
				'label'        => 'Documents',
				'name'         => 'documents',
				'type'         => 'repeater',
				'instructions' => 'Governing documents listed on the page. Leave empty to show the prototype fixture.',
				'layout'       => 'block',
				'button_label' => 'Add document',
				'sub_fields'   => array(
					array(
						'key'      => 'field_progressnow_interior_documents_title',
						'label'    => 'Title',
						'name'     => 'title',
						'type'     => 'text',
						'required' => 1,
					),
					array(
						'key'          => 'field_progressnow_interior_documents_description',
						'label'        => 'Description',
						'name'         => 'description',
						'type'         => 'text',
						'instructions' => 'Short meta line, e.g. "Last amended March 2026". Falls back to the file size.',
					),
					array(
						'key'           => 'field_progressnow_interior_documents_file',
						'label'         => 'File',
						'name'          => 'file',
						'type'          => 'file',
						'return_format' => 'array',
					),
				),
			),
		),
	) );
} );

/**
 * Map an ACF documents row to the page.twig documents shape.
 *
 * Twig fixture keys: { title, meta, url }. Meta line is
 * "TYPE · description" (or "TYPE · 340 KB" when no description).
 *
 * @param array $row ACF repeater row (title, description, file array).
 * @return array|null Null when the row has no downloadable file.
 */
function progressnow_interior_document_row( $row ) {
	$file = isset( $row['file'] ) && is_array( $row['file'] ) ? $row['file'] : array();
	$url  = isset( $file['url'] ) ? $file['url'] : '';

	if ( '' === $url ) {
		return null;
	}

	$meta_parts = array();

	$type = ! empty( $file['subtype'] ) ? $file['subtype'] : pathinfo( $url, PATHINFO_EXTENSION );
	if ( $type ) {
		$meta_parts[] = strtoupper( $type );
	}

	$description = isset( $row['description'] ) ? trim( (string) $row['description'] ) : '';
	if ( '' !== $description ) {
		$meta_parts[] = $description;
	} elseif ( ! empty( $file['filesize'] ) ) {
		$meta_parts[] = size_format( (int) $file['filesize'] );
	}

	return array(
		'title' => isset( $row['title'] ) ? $row['title'] : '',
		'meta'  => implode( ' · ', $meta_parts ),
		'url'   => $url,
	);
}

/**
 * Inject interior-page ACF data into the page.twig context.
 *
 * Keys are always set (possibly empty) — Twig owns empty states instead of
 * |default() fixtures (island-empty-states).
 */
add_filter( 'progressnow/context/page', 'progressnow_interior_page_context', 10, 2 );
function progressnow_interior_page_context( $context, $timber_post ) {
	$context['page_lede']      = '';
	$context['show_grievance'] = true;
	$context['grievance_body'] = '';
	$context['documents']      = array();
	// "New here?" sidebar card — Chapter Settings copy w/ design fallback.
	$context['newhere'] = function_exists( 'progressnow_newhere_card' ) ? progressnow_newhere_card() : array(
		'heading'    => 'New here?',
		'body'       => 'Come to a <span class="notranslate">Progress Now 101</span> — our intro session for new and curious folks.',
		'link_label' => 'Find a session',
		'url'        => '/calendar/',
	);

	if ( ! function_exists( 'get_field' ) || ! $timber_post ) {
		return $context;
	}

	$lede = get_field( 'lede', $timber_post->ID );
	if ( is_string( $lede ) && '' !== trim( $lede ) ) {
		$context['page_lede'] = trim( $lede );
	}

	// Grievance callout: toggle (default on) + optional editor body.
	$show_grievance            = get_field( 'show_grievance', $timber_post->ID );
	$context['show_grievance'] = ( null === $show_grievance || '' === $show_grievance ) ? true : (bool) $show_grievance;

	$grievance_body = get_field( 'grievance_body', $timber_post->ID );
	if ( is_string( $grievance_body ) && '' !== trim( $grievance_body ) ) {
		$context['grievance_body'] = wp_kses_post( $grievance_body );
	}

	$rows = get_field( 'documents', $timber_post->ID );
	if ( is_array( $rows ) && $rows ) {
		$context['documents'] = array_values( array_filter( array_map( 'progressnow_interior_document_row', $rows ) ) );
	}

	return $context;
}
