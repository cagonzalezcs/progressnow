<?php
/**
 * Events domain: CPT, taxonomy, calendar + home wiring.
 *
 * Owns: `event` CPT, `event_category` taxonomy + color term meta, event ACF
 * fields, the events ICS feed, and serialization to the island contracts.
 *
 * Public contract (other domains call these):
 * - progressnow_event_to_chapter_event( $post ): array — ChapterEvent shape
 *   { id, date (Y-m-d), time (display), cat (slug), title, location, desc,
 *     rsvpUrl?, gcalUrl? }.
 * - progressnow_event_categories(): array — [{ id, label, color }] from terms.
 */

/**
 * Chapter timezone for event display, gcal links, and the ICS feed.
 *
 * @return DateTimeZone
 */
function progressnow_events_timezone() {
	return new DateTimeZone( 'America/Chicago' );
}

/**
 * CPT + taxonomy registration.
 */
add_action( 'init', 'progressnow_events_register_post_type' );
function progressnow_events_register_post_type() {
	register_post_type(
		'event',
		array(
			'labels'       => array(
				'name'          => 'Events',
				'singular_name' => 'Event',
				'add_new_item'  => 'Add New Event',
				'edit_item'     => 'Edit Event',
				'not_found'     => 'No events found.',
			),
			'public'       => true,
			'has_archive'  => false, // The calendar page is the archive surface.
			'menu_icon'    => 'dashicons-calendar-alt',
			'supports'     => array( 'title', 'editor', 'thumbnail' ),
			'rewrite'      => array( 'slug' => 'events' ),
			'show_in_rest' => true,
		)
	);

	register_taxonomy(
		'event_category',
		array( 'event' ),
		array(
			'labels'            => array(
				'name'          => 'Event Categories',
				'singular_name' => 'Event Category',
			),
			'hierarchical'      => false,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => 'event-category' ),
		)
	);
}

/**
 * Force the classic editor for the `event` CPT. The ACF "Event details" +
 * "Event body" groups render as normal metaboxes below the title instead of
 * being buried in Gutenberg's collapsed "Meta Boxes" drawer. `show_in_rest`
 * stays true on the CPT (the calendar uses the progressnow/v1 endpoints).
 *
 * @param bool   $enabled   Whether the block editor is enabled.
 * @param string $post_type Post type being edited.
 * @return bool
 */
add_filter( 'use_block_editor_for_post_type', 'progressnow_events_disable_block_editor', 10, 2 );
function progressnow_events_disable_block_editor( $enabled, $post_type ) {
	return 'event' === $post_type ? false : $enabled;
}

/**
 * ACF field groups: event details + category term color.
 */
add_action( 'acf/init', 'progressnow_events_register_fields' );
function progressnow_events_register_fields() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group(
		array(
			'key'      => 'group_progressnow_events_details',
			'title'    => 'Event details',
			'fields'   => array(
				array(
					'key'          => 'field_progressnow_events_intro',
					'label'        => '',
					'name'         => '',
					'type'         => 'message',
					'message'      => 'The <strong>Content</strong> box above is the short summary shown in the Calendar pop-up. The big lede at the top of the event page is the <strong>Summary</strong> field below (Details tab).',
					'new_lines'    => 'wpautop',
					'esc_html'     => 0,
				),

				/* ---- When -------------------------------------------------- */
				array(
					'key'         => 'field_progressnow_events_tab_when',
					'label'       => 'When',
					'name'        => '',
					'type'        => 'tab',
					'placement'   => 'top',
				),
				array(
					'key'            => 'field_progressnow_events_start_datetime',
					'label'          => 'Start date & time',
					'name'           => 'start_datetime',
					'type'           => 'date_time_picker',
					'required'       => 1,
					'return_format'  => 'Y-m-d H:i:s',
					'display_format' => 'M j, Y g:i a',
					'first_day'      => 0,
					'instructions'   => 'Drives the hero date chip, the Time row, the rail date block, and where the event lands on the calendar.',
				),
				array(
					'key'            => 'field_progressnow_events_end_datetime',
					'label'          => 'End date & time',
					'name'           => 'end_datetime',
					'type'           => 'date_time_picker',
					'return_format'  => 'Y-m-d H:i:s',
					'display_format' => 'M j, Y g:i a',
					'first_day'      => 0,
					'instructions'   => 'Completes the Time row range (e.g. “7:00–8:30 PM”). Leave blank for a start-only time.',
				),
				array(
					'key'            => 'field_progressnow_events_doors_time',
					'label'          => 'Doors open',
					'name'           => 'doors_time',
					'type'           => 'time_picker',
					'return_format'  => 'g:i A',
					'display_format' => 'g:i a',
					'instructions'   => 'Appended under the Time row as “Doors open …”.',
				),

				/* ---- Where ------------------------------------------------- */
				array(
					'key'         => 'field_progressnow_events_tab_where',
					'label'       => 'Where',
					'name'        => '',
					'type'        => 'tab',
					'placement'   => 'top',
				),
				array(
					'key'           => 'field_progressnow_events_location_type',
					'label'         => 'Location type',
					'name'          => 'location_type',
					'type'          => 'select',
					'choices'       => array(
						'in-person' => 'In person',
						'online'    => 'Online',
						'hybrid'    => 'Hybrid',
					),
					'default_value' => 'in-person',
					'return_format' => 'value',
					'instructions'  => 'Switches between the Location row, the Online row, and the map block. “Online” hides the address + map; “Hybrid” shows both rows.',
				),
				array(
					'key'          => 'field_progressnow_events_venue',
					'label'        => 'Venue',
					'name'         => 'venue',
					'type'         => 'text',
					'instructions' => 'Location row + “Get directions” link + hero location chip. Also the map block address.',
				),
				array(
					'key'          => 'field_progressnow_events_city',
					'label'        => 'City',
					'name'         => 'city',
					'type'         => 'text',
					'instructions' => 'Shown under the venue in the Location row and used for directions/map.',
				),

				/* ---- Details ----------------------------------------------- */
				array(
					'key'         => 'field_progressnow_events_tab_details',
					'label'       => 'Details',
					'name'        => '',
					'type'        => 'tab',
					'placement'   => 'top',
				),
				array(
					'key'          => 'field_progressnow_events_summary',
					'label'        => 'Summary',
					'name'         => 'event_summary',
					'type'         => 'textarea',
					'rows'         => 3,
					'instructions' => 'Hero lede shown under the title on the event page (max ~52ch reads best). Distinct from the Content box, which is the Calendar pop-up blurb.',
				),
				array(
					'key'          => 'field_progressnow_events_cost',
					'label'        => 'Cost',
					'name'         => 'cost',
					'type'         => 'text',
					'instructions' => 'Cost row in the details rail; blank shows “Free · open to the public”.',
				),
				array(
					'key'           => 'field_progressnow_events_rsvp_required',
					'label'         => 'RSVP required',
					'name'          => 'rsvp_required',
					'type'          => 'true_false',
					'default_value' => 0,
					'ui'            => 1,
					'instructions'  => 'Flips the RSVP status line (“RSVP required” vs “No RSVP needed”) and the RSVP button label.',
				),
				array(
					'key'          => 'field_progressnow_events_rsvp_url',
					'label'        => 'RSVP URL',
					'name'         => 'rsvp_url',
					'type'         => 'url',
					'instructions' => 'Destination for the RSVP button and, for online events, the “Get the link” join link.',
				),
				array(
					'key'          => 'field_progressnow_events_capacity',
					'label'        => 'Capacity',
					'name'         => 'capacity',
					'type'         => 'number',
					'min'          => 1,
					'step'         => 1,
					'instructions' => 'Shown as a “Space” line in the details rail (e.g. “40 spots”). Blank hides the row.',
				),

				/* ---- Contact ----------------------------------------------- */
				array(
					'key'         => 'field_progressnow_events_tab_contact',
					'label'       => 'Contact',
					'name'        => '',
					'type'        => 'tab',
					'placement'   => 'top',
				),
				array(
					'key'          => 'field_progressnow_events_contact_name',
					'label'        => 'Contact name',
					'name'         => 'contact_name',
					'type'         => 'text',
					'instructions' => 'Contact card in the rail. When all three contact fields are blank the card falls back to the chapter email.',
				),
				array(
					'key'          => 'field_progressnow_events_contact_email',
					'label'        => 'Contact email',
					'name'         => 'contact_email',
					'type'         => 'text',
					'instructions' => 'Contact card email link; falls back to the chapter email when blank.',
				),
				array(
					'key'          => 'field_progressnow_events_contact_phone',
					'label'        => 'Contact phone',
					'name'         => 'contact_phone',
					'type'         => 'text',
					'instructions' => 'Contact card phone link (optional).',
				),

				/* ---- Body -------------------------------------------------- */
				array(
					'key'         => 'field_progressnow_events_tab_body',
					'label'       => 'Body',
					'name'        => '',
					'type'        => 'tab',
					'placement'   => 'top',
				),
				array(
					'key'          => 'field_progressnow_events_body',
					'label'        => 'Event body',
					'name'         => 'event_body',
					'type'         => 'flexible_content',
					'button_label' => 'Add block',
					'instructions' => 'Reorderable article-body blocks: Prose, Agenda, Good to know, Accessibility &amp; childcare, and Getting there / map (the map is dropped for online-only events). Section accents inherit the category color.',
					'layouts'      => array(
						'layout_progressnow_event_prose'        => array(
							'key'        => 'layout_progressnow_event_prose',
							'name'       => 'prose',
							'label'      => 'Prose',
							'display'    => 'block',
							'sub_fields' => array(
								array(
									'key'          => 'field_progressnow_event_prose_content',
									'label'        => 'Content',
									'name'         => 'content',
									'type'         => 'wysiwyg',
									'media_upload' => 0,
								),
							),
						),
						'layout_progressnow_event_agenda'       => array(
							'key'        => 'layout_progressnow_event_agenda',
							'name'       => 'agenda',
							'label'      => 'Agenda',
							'display'    => 'block',
							'sub_fields' => array(
								array(
									'key'          => 'field_progressnow_event_agenda_items',
									'label'        => 'Items',
									'name'         => 'items',
									'type'         => 'repeater',
									'layout'       => 'block',
									'button_label' => 'Add agenda item',
									'sub_fields'   => array(
										array(
											'key'      => 'field_progressnow_event_agenda_title',
											'label'    => 'Title',
											'name'     => 'title',
											'type'     => 'text',
											'required' => 1,
										),
										array(
											'key'   => 'field_progressnow_event_agenda_desc',
											'label' => 'Description',
											'name'  => 'desc',
											'type'  => 'text',
										),
									),
								),
							),
						),
						'layout_progressnow_event_good_to_know' => array(
							'key'        => 'layout_progressnow_event_good_to_know',
							'name'       => 'good_to_know',
							'label'      => 'Good to know',
							'display'    => 'block',
							'sub_fields' => array(
								array(
									'key'          => 'field_progressnow_event_gtk_items',
									'label'        => 'Items',
									'name'         => 'items',
									'type'         => 'repeater',
									'layout'       => 'table',
									'button_label' => 'Add item',
									'sub_fields'   => array(
										array(
											'key'      => 'field_progressnow_event_gtk_text',
											'label'    => 'Text',
											'name'     => 'text',
											'type'     => 'text',
											'required' => 1,
										),
									),
								),
							),
						),
						'layout_progressnow_event_a11y_note'    => array(
							'key'        => 'layout_progressnow_event_a11y_note',
							'name'       => 'a11y_note',
							'label'      => 'Accessibility & childcare',
							'display'    => 'block',
							'sub_fields' => array(
								array(
									'key'          => 'field_progressnow_event_a11y_content',
									'label'        => 'Content',
									'name'         => 'content',
									'type'         => 'wysiwyg',
									'media_upload' => 0,
								),
							),
						),
						'layout_progressnow_event_map'          => array(
							'key'        => 'layout_progressnow_event_map',
							'name'       => 'map',
							'label'      => 'Getting there / map',
							'display'    => 'block',
							'sub_fields' => array(),
						),
					),
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'event',
					),
				),
			),
		)
	);

	acf_add_local_field_group(
		array(
			'key'      => 'group_progressnow_events_term_color',
			'title'    => 'Event category color',
			'fields'   => array(
				array(
					'key'   => 'field_progressnow_events_term_color',
					'label' => 'Color',
					'name'  => 'color',
					'type'  => 'color_picker',
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'taxonomy',
						'operator' => '==',
						'value'    => 'event_category',
					),
				),
			),
		)
	);
}

/**
 * Parse an ACF "Y-m-d H:i:s" value as chapter-local wall time.
 *
 * @param mixed $value Raw ACF/meta value.
 * @return DateTimeImmutable|null
 */
function progressnow_events_parse_datetime( $value ) {
	if ( ! is_string( $value ) || '' === $value ) {
		return null;
	}
	$dt = DateTimeImmutable::createFromFormat( 'Y-m-d H:i:s', $value, progressnow_events_timezone() );

	return $dt ?: null;
}

/**
 * Display time range, en-dash, meridiem deduped when start/end share it.
 * "7:00–8:30 PM" · "9:00 AM–12:00 PM" · "7:00 PM" (no end).
 *
 * @param DateTimeImmutable|null $start Start datetime.
 * @param DateTimeImmutable|null $end   End datetime.
 * @return string
 */
function progressnow_events_format_time_range( $start, $end ) {
	if ( ! $start ) {
		return '';
	}
	$start_meridiem = $start->format( 'A' );
	if ( ! $end ) {
		return $start->format( 'g:i' ) . ' ' . $start_meridiem;
	}
	$end_meridiem = $end->format( 'A' );
	if ( $start_meridiem === $end_meridiem ) {
		return $start->format( 'g:i' ) . '–' . $end->format( 'g:i' ) . ' ' . $end_meridiem;
	}

	return $start->format( 'g:i' ) . ' ' . $start_meridiem . '–' . $end->format( 'g:i' ) . ' ' . $end_meridiem;
}

/**
 * Event field value with an ACF-less fallback (values are stored raw in meta).
 *
 * @param int    $post_id Event post ID.
 * @param string $name    Field name.
 * @return mixed
 */
function progressnow_events_get_field( $post_id, $name ) {
	if ( function_exists( 'get_field' ) ) {
		return get_field( $name, $post_id );
	}

	return get_post_meta( $post_id, $name, true );
}

/**
 * Serialize an event post to the ChapterEvent island contract.
 *
 * @param int|WP_Post|\Timber\Post $post Event post (ID or object).
 * @return array ChapterEvent assoc array, or empty array if the post is gone.
 */
function progressnow_event_to_chapter_event( $post ) {
	$post_id = is_object( $post ) ? (int) $post->ID : (int) $post;
	$wp_post = get_post( $post_id );
	if ( ! $wp_post ) {
		return array();
	}

	$start = progressnow_events_parse_datetime( progressnow_events_get_field( $post_id, 'start_datetime' ) );
	$end   = progressnow_events_parse_datetime( progressnow_events_get_field( $post_id, 'end_datetime' ) );

	$registry = progressnow_category_registry();
	$cat      = 'chapter';
	$terms    = get_the_terms( $post_id, 'event_category' );
	if ( $terms && ! is_wp_error( $terms ) && isset( $registry[ $terms[0]->slug ] ) ) {
		$cat = $terms[0]->slug;
	}

	$venue    = trim( (string) progressnow_events_get_field( $post_id, 'venue' ) );
	$city     = trim( (string) progressnow_events_get_field( $post_id, 'city' ) );
	$location = $venue;
	if ( $city && $venue ) {
		$location = $city . ' — ' . $venue;
	} elseif ( $city ) {
		$location = $city;
	}

	$event = array(
		'id'       => (string) $post_id,
		'date'     => $start ? $start->format( 'Y-m-d' ) : get_the_date( 'Y-m-d', $wp_post ),
		'time'     => progressnow_events_format_time_range( $start, $end ),
		'cat'      => $cat,
		'title'    => html_entity_decode( get_the_title( $wp_post ), ENT_QUOTES, 'UTF-8' ),
		'location' => $location,
		'desc'     => trim( wp_strip_all_tags( $wp_post->post_content ) ),
		// Single Event permalink — the modal/chip "View event" destination (04 §3d).
		'url'      => (string) get_permalink( $wp_post ),
	);

	$rsvp = trim( (string) progressnow_events_get_field( $post_id, 'rsvp_url' ) );
	if ( $rsvp ) {
		$event['rsvpUrl'] = $rsvp;
	}

	if ( $start ) {
		$gcal_end         = $end && $end > $start ? $end : $start->modify( '+1 hour' );
		$event['gcalUrl'] = 'https://calendar.google.com/calendar/render?' . http_build_query(
			array(
				'action'   => 'TEMPLATE',
				'text'     => $event['title'],
				'dates'    => $start->format( 'Ymd\THis' ) . '/' . $gcal_end->format( 'Ymd\THis' ),
				'details'  => $event['desc'],
				'location' => $location,
				'ctz'      => 'America/Chicago',
			),
			'',
			'&',
			PHP_QUERY_RFC3986
		);
	}

	return $event;
}

/**
 * The 6 event categories for the island `categories` prop.
 * Label from the term when it exists, color from the term's ACF "color"
 * field; both fall back to the registry (categories.json) pre-seed.
 *
 * @return array [{ id: slug, label: string, color: hex }]
 */
function progressnow_event_categories() {
	return progressnow_categories( 'event_category' );
}

/**
 * Published events ordered by start_datetime meta.
 *
 * Language-aware under Polylang, filtered on the `language` taxonomy directly
 * (not the `lang` query var). That tax_query is honored in every context —
 * including a bare REST request, where Polylang's front-end query filter is not
 * loaded and `pll_current_language()` does not resolve to the page language —
 * and is unaffected by `get_posts()`'s default `suppress_filters => true`.
 *
 * The target language is an explicit `'lang'` in $args when provided (the REST
 * layer passes the page language it received from the island), otherwise the
 * current front-end language. Pass `'lang' => ''` to query across all languages.
 *
 * @param array $args Overrides merged over the defaults (meta_query, lang, etc.).
 * @return WP_Post[]
 */
function progressnow_events_query( $args = array() ) {
	$lang = array_key_exists( 'lang', $args )
		? (string) $args['lang']
		: ( function_exists( 'pll_current_language' ) ? (string) pll_current_language() : '' );
	unset( $args['lang'] );

	$defaults = array(
		'post_type'      => 'event',
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'meta_key'       => 'start_datetime',
		'orderby'        => 'meta_value',
		'meta_type'      => 'DATETIME',
		'order'          => 'ASC',
		'no_found_rows'  => true,
	);

	// No current caller passes its own tax_query, so this default never collides
	// (meta_query + tax_query coexist as distinct keys under wp_parse_args).
	if ( '' !== $lang && taxonomy_exists( 'language' ) ) {
		$defaults['tax_query'] = array(
			array(
				'taxonomy' => 'language',
				'field'    => 'slug',
				'terms'    => $lang,
			),
		);
	}

	return get_posts( wp_parse_args( $args, $defaults ) );
}

/* -------------------------------------------------------------------------
 * Single event → SingleEvent island contract (src/lib/schemas.ts).
 * ---------------------------------------------------------------------- */

/**
 * kses helpers: reuse the blog allowlists when inc/blog.php is loaded,
 * otherwise fall back to core sanitizers (defense-in-depth on both paths).
 */
function progressnow_events_kses_prose( $html ) {
	return function_exists( 'progressnow_blog_kses_prose' )
		? progressnow_blog_kses_prose( $html )
		: wp_kses_post( (string) $html );
}

function progressnow_events_kses_plain( $text ) {
	return function_exists( 'progressnow_blog_kses_plain' )
		? progressnow_blog_kses_plain( $text )
		: trim( wp_strip_all_tags( (string) $text ) );
}

/**
 * First canonical event_category slug on the event, fallback "chapter".
 *
 * @param int $post_id Event post ID.
 * @return string
 */
function progressnow_events_single_cat( $post_id ) {
	$registry = progressnow_category_registry();
	$terms    = get_the_terms( $post_id, 'event_category' );
	if ( $terms && ! is_wp_error( $terms ) ) {
		foreach ( $terms as $term ) {
			if ( isset( $registry[ $term->slug ] ) ) {
				return $term->slug;
			}
		}
	}

	return 'chapter';
}

/**
 * event_body flexible content → EventBlock[] (eventBlockSchema union). The
 * `map` layout has no fields — its address is derived from the location and
 * it is dropped for online-only events.
 *
 * @param int    $post_id       Event post ID.
 * @param string $location_type in-person|online|hybrid.
 * @param string $address       Derived "venue, city" line for the map block.
 * @return array
 */
function progressnow_events_map_event_body( $post_id, $location_type, $address ) {
	if ( ! function_exists( 'get_field' ) ) {
		return array();
	}
	$rows = get_field( 'event_body', $post_id );
	if ( ! is_array( $rows ) ) {
		return array();
	}

	$blocks = array();
	foreach ( $rows as $row ) {
		switch ( $row['acf_fc_layout'] ?? '' ) {
			case 'prose':
				$html = trim( progressnow_events_kses_prose( $row['content'] ?? '' ) );
				if ( '' !== $html ) {
					$blocks[] = array(
						'type' => 'prose',
						'html' => $html,
					);
				}
				break;

			case 'agenda':
				$items = array();
				foreach ( (array) ( $row['items'] ?? array() ) as $item ) {
					$title = progressnow_events_kses_plain( $item['title'] ?? '' );
					if ( '' === $title ) {
						continue;
					}
					$entry = array( 'title' => $title );
					$desc  = progressnow_events_kses_plain( $item['desc'] ?? '' );
					if ( '' !== $desc ) {
						$entry['desc'] = $desc;
					}
					$items[] = $entry;
				}
				if ( $items ) {
					$blocks[] = array(
						'type'  => 'agenda',
						'items' => $items,
					);
				}
				break;

			case 'good_to_know':
				$items = array();
				foreach ( (array) ( $row['items'] ?? array() ) as $item ) {
					$text = progressnow_events_kses_plain( $item['text'] ?? '' );
					if ( '' !== $text ) {
						$items[] = $text;
					}
				}
				if ( $items ) {
					$blocks[] = array(
						'type'  => 'good_to_know',
						'items' => $items,
					);
				}
				break;

			case 'a11y_note':
				$html = trim( progressnow_events_kses_prose( $row['content'] ?? '' ) );
				if ( '' !== $html ) {
					$blocks[] = array(
						'type' => 'a11y_note',
						'html' => $html,
					);
				}
				break;

			case 'map':
				if ( 'online' !== $location_type && '' !== $address ) {
					$blocks[] = array(
						'type'    => 'map',
						'address' => $address,
					);
				}
				break;
		}
	}

	return $blocks;
}

/**
 * Serialize an event post to the SingleEventData island contract. Reuses the
 * ChapterEvent parse/format/gcal plumbing; prose is kses-sanitized.
 *
 * @param int|WP_Post|\Timber\Post $post Event post (ID or object).
 * @return array SingleEventData assoc array, or empty array if the post is gone.
 */
function progressnow_event_to_single( $post ) {
	$post_id = is_object( $post ) ? (int) $post->ID : (int) $post;
	$wp_post = get_post( $post_id );
	if ( ! $wp_post ) {
		return array();
	}

	$title = html_entity_decode( get_the_title( $wp_post ), ENT_QUOTES, 'UTF-8' );
	$start = progressnow_events_parse_datetime( progressnow_events_get_field( $post_id, 'start_datetime' ) );
	$end   = progressnow_events_parse_datetime( progressnow_events_get_field( $post_id, 'end_datetime' ) );

	$venue = trim( (string) progressnow_events_get_field( $post_id, 'venue' ) );
	$city  = trim( (string) progressnow_events_get_field( $post_id, 'city' ) );

	$location_type = (string) progressnow_events_get_field( $post_id, 'location_type' );
	if ( ! in_array( $location_type, array( 'in-person', 'online', 'hybrid' ), true ) ) {
		$location_type = 'in-person';
	}

	$address    = trim( implode( ', ', array_filter( array( $venue, $city ) ) ) );
	$directions = '';
	if ( 'online' !== $location_type && '' !== $address ) {
		$directions = 'https://maps.google.com/?q=' . rawurlencode( $address );
	}

	$capacity_raw = progressnow_events_get_field( $post_id, 'capacity' );
	$capacity     = ( null === $capacity_raw || '' === $capacity_raw ) ? null : (int) $capacity_raw;

	// gcalUrl reuses the single ChapterEvent builder (no second query string).
	$chapter_event = progressnow_event_to_chapter_event( $post_id );
	$gcal_url      = $chapter_event['gcalUrl'] ?? '';

	// Contact card: per-event fields, chapter contact_email as the fallback.
	$contact_email = trim( (string) progressnow_events_get_field( $post_id, 'contact_email' ) );
	if ( '' === $contact_email && function_exists( 'get_field' ) ) {
		$chapter_email = get_field( 'contact_email', 'option' );
		if ( is_string( $chapter_email ) ) {
			$contact_email = trim( $chapter_email );
		}
	}

	$thumb_id  = get_post_thumbnail_id( $wp_post );
	$thumb_alt = $thumb_id ? (string) get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) : '';

	$featured_image = array(
		'src' => get_the_post_thumbnail_url( $wp_post, 'large' ) ?: null,
		'alt' => '' !== $thumb_alt ? $thumb_alt : $title,
	);
	if ( $thumb_id ) {
		$caption = progressnow_events_kses_plain( wp_get_attachment_caption( $thumb_id ) );
		if ( '' !== $caption ) {
			$featured_image['caption'] = $caption;
		}
		$credit = progressnow_events_kses_plain( get_post_meta( $thumb_id, 'credit', true ) );
		if ( '' !== $credit ) {
			$featured_image['credit'] = $credit;
		}
	}

	return array(
		'title'         => $title,
		'summary'       => progressnow_events_kses_plain( progressnow_events_get_field( $post_id, 'event_summary' ) ),
		'cat'           => progressnow_events_single_cat( $post_id ),
		'date'          => $start ? $start->format( 'Y-m-d' ) : get_the_date( 'Y-m-d', $wp_post ),
		'time'          => progressnow_events_format_time_range( $start, $end ),
		'doorsTime'     => trim( (string) progressnow_events_get_field( $post_id, 'doors_time' ) ),
		'locationType'  => $location_type,
		'venue'         => $venue,
		'city'          => $city,
		'cost'          => trim( (string) progressnow_events_get_field( $post_id, 'cost' ) ),
		'rsvpRequired'  => (bool) progressnow_events_get_field( $post_id, 'rsvp_required' ),
		'rsvpUrl'       => trim( (string) progressnow_events_get_field( $post_id, 'rsvp_url' ) ),
		'capacity'      => $capacity,
		'directionsUrl' => $directions,
		'gcalUrl'       => $gcal_url,
		// No per-event iCal endpoint is exposed (the only ICS feed is the
		// whole-calendar subscribe feed); the island hides the button on "".
		'icsUrl'        => '',
		'contact'       => array(
			'name'  => trim( (string) progressnow_events_get_field( $post_id, 'contact_name' ) ),
			'email' => $contact_email,
			'phone' => trim( (string) progressnow_events_get_field( $post_id, 'contact_phone' ) ),
		),
		'featuredImage' => $featured_image,
		'blocks'        => progressnow_events_map_event_body( $post_id, $location_type, $address ),
	);
}

/**
 * Permalink of the Calendar page (assigned template), fallback "/calendar/".
 *
 * @return string
 */
function progressnow_events_calendar_url() {
	$pages = get_posts(
		array(
			'post_type'      => 'page',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_key'       => '_wp_page_template',
			'meta_value'     => 'page-templates/calendar.php',
			'no_found_rows'  => true,
		)
	);

	return $pages ? get_permalink( $pages[0] ) : home_url( '/calendar/' );
}

// Single event — the SingleEvent island payload (sibling of blog's single).
add_filter( 'progressnow/context/single', 'progressnow_events_single_context', 10, 2 );

function progressnow_events_single_context( $context, $timber_post ) {
	if ( ! $timber_post || 'event' !== $timber_post->post_type ) {
		return $context;
	}

	$context['single_event']            = progressnow_event_to_single( $timber_post->ID );
	$context['single_event_categories'] = progressnow_event_categories();
	$context['single_event_calendar_url'] = progressnow_events_calendar_url();
	$context['single_event_home_url']     = home_url( '/' );
	// Template-level setting (not per-event); the band hides when false.
	$context['single_event_show_related'] = true;

	// More upcoming events: next 3 by start_datetime, excluding the current
	// event. Each carries its own permalink (ChapterEvent has no url field).
	$now   = new DateTimeImmutable( 'now', progressnow_events_timezone() );
	$posts = progressnow_events_query(
		array(
			'posts_per_page' => 3,
			'post__not_in'   => array( (int) $timber_post->ID ),
			'meta_query'     => array(
				array(
					'key'     => 'start_datetime',
					'value'   => $now->format( 'Y-m-d H:i:s' ),
					'compare' => '>=',
					'type'    => 'DATETIME',
				),
			),
		)
	);

	$related = array();
	foreach ( $posts as $event_post ) {
		$chapter_event = progressnow_event_to_chapter_event( $event_post );
		if ( empty( $chapter_event ) ) {
			continue;
		}
		$related[] = array(
			'id'       => $chapter_event['id'],
			'date'     => $chapter_event['date'],
			'time'     => $chapter_event['time'],
			'cat'      => $chapter_event['cat'],
			'title'    => $chapter_event['title'],
			'location' => $chapter_event['location'],
			'url'      => get_permalink( $event_post ),
		);
	}
	$context['single_event_related'] = $related;

	return $context;
}

/**
 * Calendar page context: subscribe URLs + API base. The island fetches its
 * own event window from /progressnow/v1/events on mount (island-data-fetch), so
 * nothing is embedded. Keys are always set.
 */
add_filter( 'progressnow/context/page', 'progressnow_events_calendar_context', 10, 2 );
function progressnow_events_calendar_context( $context, $timber_post ) {
	// Key off the assigned page template, not a magic `calendar` slug, so
	// renaming the page's slug/title never breaks the events wiring (D9). The
	// check reads the post itself so the REST page payload gets the same keys.
	if ( ! $timber_post || ! progressnow_page_uses_template( (int) $timber_post->ID, 'page-templates/calendar.php' ) ) {
		return $context;
	}

	$ics_url = get_feed_link( 'chapter-events' );

	$context['calendar_api_base'] = rest_url( 'progressnow/v1' );
	$context['calendar_ics_url']  = $ics_url;
	$context['calendar_gcal_url'] = 'https://calendar.google.com/calendar/r?cid=' . urlencode( preg_replace( '#^https?://#', 'webcal://', $ics_url ) );

	// Server fallback list (crawlers, Nuxt shells): the next twelve months,
	// same serializer as GET /events.
	$now   = new DateTimeImmutable( 'now', progressnow_events_timezone() );
	$posts = progressnow_events_query(
		array(
			'posts_per_page' => 24,
			'meta_query'     => array(
				array(
					'key'     => 'start_datetime',
					'value'   => array( $now->format( 'Y-m-d' ) . ' 00:00:00', $now->modify( '+12 months' )->format( 'Y-m-d' ) . ' 23:59:59' ),
					'compare' => 'BETWEEN',
					'type'    => 'DATETIME',
				),
			),
		)
	);
	$context['calendar_upcoming'] = array_values( array_filter( array_map( 'progressnow_event_to_chapter_event', $posts ) ) );

	return $context;
}

/**
 * Home page context: next N upcoming events. `event_count` is injected by
 * the options domain at priority 5; we run at 10. Always set (possibly
 * empty) — Twig owns the designed empty state.
 */
add_filter( 'progressnow/context/front_page', 'progressnow_events_front_page_context' );
function progressnow_events_front_page_context( $context ) {
	$count = isset( $context['event_count'] ) ? max( 1, (int) $context['event_count'] ) : 5;
	$now   = new DateTimeImmutable( 'now', progressnow_events_timezone() );
	$posts = progressnow_events_query(
		array(
			'posts_per_page' => $count,
			'meta_query'     => array(
				array(
					'key'     => 'start_datetime',
					'value'   => $now->format( 'Y-m-d H:i:s' ),
					'compare' => '>=',
					'type'    => 'DATETIME',
				),
			),
		)
	);

	$home_events = array();
	foreach ( $posts as $event_post ) {
		$start = progressnow_events_parse_datetime( progressnow_events_get_field( $event_post->ID, 'start_datetime' ) );
		if ( ! $start ) {
			continue;
		}
		$city          = trim( (string) progressnow_events_get_field( $event_post->ID, 'city' ) );
		$venue         = trim( (string) progressnow_events_get_field( $event_post->ID, 'venue' ) );
		$home_events[] = array(
			'day'   => $start->format( 'd' ),
			'month' => strtoupper( $start->format( 'M' ) ),
			'title' => html_entity_decode( get_the_title( $event_post ), ENT_QUOTES, 'UTF-8' ),
			'when'  => $start->format( 'l, F j' ) . ' · ' . $start->format( 'g:i A' ),
			'where' => $city ? $city : $venue,
			// Single Event permalink — the "View event" row destination.
			'url'   => get_permalink( $event_post ),
		);
	}
	$context['home_events'] = $home_events;
	// Canonical calendar page (keys off the template, not a magic slug); falls
	// back to home_url('/calendar/'). Powers "Full calendar →" + empty state.
	$context['calendar_url'] = progressnow_events_calendar_url();

	return $context;
}

/**
 * ICS feed: /?feed=chapter-events (pretty: /feed/chapter-events/).
 * NOTE: registering the feed requires a rewrite flush (the seed step does it).
 *
 * The previous slugs stay registered so subscribed calendar clients keep
 * working — they 301 to the canonical feed URL.
 */
add_action( 'init', 'progressnow_events_register_feed' );
function progressnow_events_register_feed() {
	add_feed( 'chapter-events', 'progressnow_events_render_ics' );
	foreach ( progressnow_events_legacy_feed_slugs() as $legacy ) {
		add_feed( $legacy, 'progressnow_events_redirect_legacy_feed' );
	}
}

/**
 * Feed slugs the calendar used to live at.
 *
 * @return string[]
 */
function progressnow_events_legacy_feed_slugs() {
	return array( 'progressnow-events' );
}

/**
 * 301 a legacy feed URL to the canonical ICS feed.
 */
function progressnow_events_redirect_legacy_feed() {
	wp_redirect( get_feed_link( 'chapter-events' ), 301 );
	exit;
}

add_filter( 'feed_content_type', 'progressnow_events_feed_content_type', 10, 2 );
function progressnow_events_feed_content_type( $content_type, $type ) {
	return 'chapter-events' === $type ? 'text/calendar' : $content_type;
}

/**
 * Escape a text value per RFC 5545 (TEXT).
 *
 * @param string $text Raw text.
 * @return string
 */
function progressnow_events_ics_escape( $text ) {
	$text = str_replace( array( '\\', ';', ',' ), array( '\\\\', '\\;', '\\,' ), (string) $text );

	return preg_replace( "/\r\n|\r|\n/", '\\n', $text );
}

/**
 * Fold a content line at 75 octets (RFC 5545 § 3.1), UTF-8 safe.
 *
 * @param string $line Unfolded line.
 * @return string
 */
function progressnow_events_ics_fold( $line ) {
	$out = '';
	while ( strlen( $line ) > 75 ) {
		$chunk = mb_strcut( $line, 0, 75, 'UTF-8' );
		if ( '' === $chunk ) {
			break;
		}
		$out .= $chunk . "\r\n ";
		$line = substr( $line, strlen( $chunk ) );
	}

	return $out . $line;
}

/**
 * Render the VCALENDAR. Datetimes are chapter-local (America/Chicago)
 * converted to UTC so no VTIMEZONE block is needed.
 */
function progressnow_events_render_ics() {
	header( 'Content-Type: text/calendar; charset=utf-8' );
	header( 'Content-Disposition: inline; filename="chapter-events.ics"' );

	echo progressnow_events_build_ics();
}

/**
 * Build the VCALENDAR text (no headers/output — testable, reusable).
 *
 * @return string
 */
function progressnow_events_build_ics() {
	$utc  = new DateTimeZone( 'UTC' );
	$host = wp_parse_url( home_url(), PHP_URL_HOST );
	$name = progressnow_identity()['name'];

	$lines = array(
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//' . str_replace( '/', '-', $name ) . '//Events//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'X-WR-CALNAME:' . progressnow_events_ics_escape( $name . ' Events' ),
		'X-WR-TIMEZONE:America/Chicago',
	);

	foreach ( progressnow_events_query() as $event_post ) {
		$start = progressnow_events_parse_datetime( progressnow_events_get_field( $event_post->ID, 'start_datetime' ) );
		if ( ! $start ) {
			continue;
		}
		$end = progressnow_events_parse_datetime( progressnow_events_get_field( $event_post->ID, 'end_datetime' ) );
		if ( ! $end || $end <= $start ) {
			$end = $start->modify( '+1 hour' );
		}

		$chapter_event = progressnow_event_to_chapter_event( $event_post );
		$desc          = $chapter_event['desc'];
		if ( isset( $chapter_event['rsvpUrl'] ) ) {
			$desc .= ( $desc ? "\n" : '' ) . 'RSVP: ' . $chapter_event['rsvpUrl'];
		}

		$lines[] = 'BEGIN:VEVENT';
		$lines[] = 'UID:progressnow-event-' . $event_post->ID . '@' . $host;
		$lines[] = 'DTSTAMP:' . get_post_modified_time( 'Ymd\THis', true, $event_post ) . 'Z';
		$lines[] = 'DTSTART:' . $start->setTimezone( $utc )->format( 'Ymd\THis\Z' );
		$lines[] = 'DTEND:' . $end->setTimezone( $utc )->format( 'Ymd\THis\Z' );
		$lines[] = 'SUMMARY:' . progressnow_events_ics_escape( $chapter_event['title'] );
		if ( $chapter_event['location'] ) {
			$lines[] = 'LOCATION:' . progressnow_events_ics_escape( $chapter_event['location'] );
		}
		if ( $desc ) {
			$lines[] = 'DESCRIPTION:' . progressnow_events_ics_escape( $desc );
		}
		$lines[] = 'URL:' . esc_url_raw( get_permalink( $event_post ) );
		$lines[] = 'END:VEVENT';
	}

	$lines[] = 'END:VCALENDAR';

	return implode( "\r\n", array_map( 'progressnow_events_ics_fold', $lines ) ) . "\r\n";
}
