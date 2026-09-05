<?php
/**
 * Idempotent demo-content seed for the Progress Now theme (chapter-neutral
 * placeholder content — nothing regional).
 *
 * Run:
 *   wp eval-file wp-content/themes/progressnow/bin/seed.php
 *
 * Safe to re-run — every insert is guarded by a slug/name lookup; menus are
 * rebuilt in place; update_field/update_option calls are naturally idempotent.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit( "Run via: wp eval-file bin/seed.php\n" );
}

function progressnow_seed_log( $msg ) {
	echo $msg . "\n";
}

if ( ! function_exists( 'update_field' ) ) {
	progressnow_seed_log( 'FATAL: ACF is not active (update_field missing). Aborting.' );
	return;
}

// CLI contexts run capability-less; the kses save filters would backslash-
// escape the block comment JSON in seeded post_content.
kses_remove_filters();

/* -------------------------------------------------------------------------
 * 1. Terms — 6 canonical categories in event_category AND category.
 * ---------------------------------------------------------------------- */

$progressnow_seed_palette = progressnow_category_registry();

$progressnow_seed_color_field_keys = array(
	'event_category' => 'field_progressnow_events_term_color',
	'category'       => 'field_progressnow_blog_category_color',
);

foreach ( array( 'event_category', 'category' ) as $tax ) {
	foreach ( $progressnow_seed_palette as $slug => $def ) {
		$term = get_term_by( 'slug', $slug, $tax );
		if ( ! $term ) {
			$result = wp_insert_term( $def['label'], $tax, array( 'slug' => $slug ) );
			if ( is_wp_error( $result ) ) {
				progressnow_seed_log( "ERROR term {$tax}/{$slug}: " . $result->get_error_message() );
				continue;
			}
			$term_id = (int) $result['term_id'];
			progressnow_seed_log( "term created: {$tax}/{$slug} (#{$term_id})" );
		} else {
			$term_id = (int) $term->term_id;
			if ( $term->name !== $def['label'] ) {
				wp_update_term( $term_id, $tax, array( 'name' => $def['label'] ) );
			}
			progressnow_seed_log( "term exists: {$tax}/{$slug} (#{$term_id})" );
		}
		update_field( $progressnow_seed_color_field_keys[ $tax ], $def['color'], $tax . '_' . $term_id );
	}
}

/* -------------------------------------------------------------------------
 * 2. Events — the 14 SAMPLE_EVENTS from src/lib/events.ts.
 * ---------------------------------------------------------------------- */

/**
 * "2:00–4:00 PM" / "9:00 AM–12:00 PM" → [ 'Y-m-d H:i:s' start, end ].
 */
function progressnow_seed_parse_times( $date, $time ) {
	$parts     = preg_split( '/\x{2013}|\x{2014}/u', $time ); // en/em dash
	$start_raw = trim( $parts[0] );
	$end_raw   = isset( $parts[1] ) ? trim( $parts[1] ) : '';

	$end_mer   = preg_match( '/(AM|PM)/i', $end_raw, $m ) ? strtoupper( $m[1] ) : '';
	$start_mer = preg_match( '/(AM|PM)/i', $start_raw, $m ) ? strtoupper( $m[1] ) : $end_mer;

	$to24 = function ( $raw, $mer ) {
		if ( ! preg_match( '/(\d{1,2}):(\d{2})/', $raw, $m ) ) {
			return null;
		}
		$h = (int) $m[1];
		$i = (int) $m[2];
		if ( 'PM' === $mer && 12 !== $h ) {
			$h += 12;
		} elseif ( 'AM' === $mer && 12 === $h ) {
			$h = 0;
		}
		return sprintf( '%02d:%02d:00', $h, $i );
	};

	$start = $to24( $start_raw, $start_mer );
	$end   = '' !== $end_raw ? $to24( $end_raw, $end_mer ) : null;

	return array(
		$start ? "{$date} {$start}" : '',
		$end ? "{$date} {$end}" : '',
	);
}

/** "City — Venue" → [venue, city]; no em dash → whole string is the venue. */
function progressnow_seed_split_location( $location ) {
	if ( false !== strpos( $location, ' — ' ) ) {
		list( $city, $venue ) = explode( ' — ', $location, 2 );
		return array( trim( $venue ), trim( $city ) );
	}
	return array( trim( $location ), '' );
}

$progressnow_seed_events = array(
	// Locations are generic placeholders — a chapter replaces them with real venues.
	array( 'date' => '2026-07-02', 'time' => '7:00–8:30 PM', 'cat' => 'poled', 'title' => 'Night School: Organizing 101', 'location' => 'Central Library, Community Room B', 'desc' => 'First session of our summer night school. No reading required — just bring your questions. We cover what organizing is (and isn’t), and what it looks like here at home.' ),
	array( 'date' => '2026-07-07', 'time' => '6:30–8:00 PM', 'cat' => 'mutual', 'title' => 'Community Fridge Restock & Cleanup', 'location' => 'Community fridge at 10th & Main', 'desc' => 'Help us restock, clean, and inventory the community fridge. Bring shelf-stable goods if you can — but hands are what we need most.' ),
	array( 'date' => '2026-07-09', 'time' => '7:00–8:00 PM', 'cat' => 'labor', 'title' => 'Know Your Rights at Work', 'location' => 'Online (Zoom)', 'desc' => 'A workshop on your rights on the job: concerted activity, retaliation, and what to document. Led by members of the Labor committee with guest organizers.' ),
	array( 'date' => '2026-07-11', 'time' => '2:00–4:00 PM', 'cat' => 'chapter', 'title' => 'July General Meeting', 'location' => 'Downtown — Union Hall (+ Zoom)', 'desc' => 'Our monthly all-member meeting. Committee report-backs, votes on new business, and planning for the fall. Open to visitors — come see how the chapter works.' ),
	array( 'date' => '2026-07-15', 'time' => '7:00–8:00 PM', 'cat' => 'chapter', 'title' => 'Progress Now 101 (New Member Orientation)', 'location' => 'Online (Zoom)', 'desc' => 'New or curious? This one’s for you. A friendly intro to the chapter: who we are, what we’re working on, and how to plug in at whatever capacity you have.' ),
	array( 'date' => '2026-07-18', 'time' => '9:00 AM–12:00 PM', 'cat' => 'mutual', 'title' => 'Brake Light Clinic', 'location' => 'Parking lot, 500 W Main St', 'desc' => 'Free brake light replacement for anyone who pulls up — a broken light shouldn’t mean a traffic stop. Volunteers get a quick training at 8:30 AM. Tools and bulbs provided.' ),
	array( 'date' => '2026-07-21', 'time' => '7:00–9:00 PM', 'cat' => 'electoral', 'title' => 'Candidate Endorsement Forum', 'location' => 'Northside — Neighborhood Center', 'desc' => 'Hear from candidates seeking the chapter’s endorsement ahead of the fall elections. Members vote on endorsements at the August general meeting.' ),
	array( 'date' => '2026-07-23', 'time' => '7:30–9:00 PM', 'cat' => 'poled', 'title' => 'Reading Circle: A People’s Guide to Capitalism', 'location' => 'Eastside — Corner Café', 'desc' => 'Chapters 1–2. New readers welcome; we always start with a recap. Copies available to borrow from the chapter library.' ),
	array( 'date' => '2026-07-25', 'time' => '6:00–9:00 PM', 'cat' => 'social', 'title' => 'Paleta Social', 'location' => 'Riverside Park', 'desc' => 'No agenda, no sign-in sheet — just paletas, lawn games, and comrades. Families welcome. First round of paletas is on the chapter.' ),
	array( 'date' => '2026-07-28', 'time' => '7:00–8:30 PM', 'cat' => 'labor', 'title' => 'Picket Support Training', 'location' => 'Online (Zoom)', 'desc' => 'How to show up well for striking workers: picket line etiquette, marshaling basics, and what support locals actually ask for.' ),
	array( 'date' => '2026-08-01', 'time' => '2:00–4:00 PM', 'cat' => 'chapter', 'title' => 'August General Meeting', 'location' => 'Downtown — Community Center (+ Zoom)', 'desc' => 'Monthly all-member meeting. Endorsement votes from the July forum are on the agenda — members in good standing can vote.' ),
	array( 'date' => '2026-08-04', 'time' => '6:30–8:00 PM', 'cat' => 'mutual', 'title' => 'School Supply Distro Prep', 'location' => 'Member’s garage (address in WhatsApp)', 'desc' => 'Sorting and packing backpacks for the back-to-school distribution on the 15th. Snacks provided.' ),
	array( 'date' => '2026-08-08', 'time' => '10:00 AM–1:00 PM', 'cat' => 'electoral', 'title' => 'Voter Registration Drive', 'location' => 'Farmers market, Main St', 'desc' => 'Tabling and registering voters ahead of the October deadline. Volunteer deputy registrars will be on site — come learn how it’s done.' ),
	array( 'date' => '2026-08-13', 'time' => '7:00–8:30 PM', 'cat' => 'poled', 'title' => 'Night School: Immigration & Labor', 'location' => 'Central Library, Community Room B', 'desc' => 'Session two of summer night school: a locally focused look at labor, migration, and the immigrant working class.' ),
);

$progressnow_seed_event_ids = array(); // title → post ID

foreach ( $progressnow_seed_events as $ev ) {
	$slug     = sanitize_title( $ev['title'] );
	$existing = get_posts( array(
		'post_type'      => 'event',
		'name'           => $slug,
		'post_status'    => 'any',
		'posts_per_page' => 1,
		'fields'         => 'ids',
	) );

	if ( $existing ) {
		$post_id = (int) $existing[0];
		progressnow_seed_log( "event exists: {$slug} (#{$post_id})" );
	} else {
		$post_id = wp_insert_post( array(
			'post_type'    => 'event',
			'post_status'  => 'publish',
			'post_title'   => $ev['title'],
			'post_name'    => $slug,
			'post_content' => $ev['desc'],
		), true );
		if ( is_wp_error( $post_id ) ) {
			progressnow_seed_log( "ERROR event {$slug}: " . $post_id->get_error_message() );
			continue;
		}
		progressnow_seed_log( "event created: {$slug} (#{$post_id})" );
	}

	$progressnow_seed_event_ids[ $ev['title'] ] = $post_id;

	wp_set_object_terms( $post_id, $ev['cat'], 'event_category' );

	list( $start, $end )  = progressnow_seed_parse_times( $ev['date'], $ev['time'] );
	list( $venue, $city ) = progressnow_seed_split_location( $ev['location'] );

	update_field( 'field_progressnow_events_start_datetime', $start, $post_id );
	update_field( 'field_progressnow_events_end_datetime', $end, $post_id );
	update_field( 'field_progressnow_events_venue', $venue, $post_id );
	update_field( 'field_progressnow_events_city', $city, $post_id );
}

/* --- Enrich two demo events with the full field set so every field's
 *     frontend section is visible live. One in-person (with the map block),
 *     one online (map layout is dropped for online-only events). Idempotent:
 *     update_field just overwrites. */

$progressnow_seed_enriched = array(
	// In-person — exercises the Location row, map block, and every rail row.
	'Night School: Organizing 101' => array(
		'event_summary' => 'Kick off our summer night school with a plain-language intro to organizing — no reading, no jargon, just your questions and ours.',
		'doors_time'    => '6:30 PM',
		'location_type' => 'in-person',
		'cost'          => 'Free · open to the public',
		'rsvp_required' => 1,
		'rsvp_url'      => '/get-involved/#join',
		'capacity'      => 40,
		'contact_name'  => 'Political Education Committee',
		'contact_email' => 'poled@example.org',
		'contact_phone' => '(555) 555-0142',
		'body'          => array(
			array(
				'acf_fc_layout' => 'prose',
				'content'       => '<p>Curious about organizing but not sure where to start? This is the session for you. We break down what people-powered organizing actually means, where it comes from, and — most importantly — what it looks like organizing here in our community.</p><p>No prior reading is required and there are no wrong questions. Come as you are, bring a friend, and stay for the conversation afterward.</p>',
			),
			array(
				'acf_fc_layout' => 'agenda',
				'items'         => array(
					array( 'title' => 'Welcome & introductions', 'desc' => 'New folks say hi and share what brought them.' ),
					array( 'title' => 'What is organizing?', 'desc' => 'A short, plain-language talk — no jargon.' ),
					array( 'title' => 'Small-group discussion', 'desc' => 'Break out and talk through the ideas together.' ),
					array( 'title' => 'Q&A and next steps', 'desc' => 'Ask anything; learn how to plug in.' ),
				),
			),
			array(
				'acf_fc_layout' => 'good_to_know',
				'items'         => array(
					array( 'text' => 'Doors open 30 minutes early — come early to mingle.' ),
					array( 'text' => 'Free snacks and coffee provided.' ),
					array( 'text' => 'Free parking in the library lot.' ),
				),
			),
			array(
				'acf_fc_layout' => 'a11y_note',
				'content'       => '<p>The venue is wheelchair accessible. Childcare and Spanish interpretation are available on request — email us at least 48 hours ahead and we will make it happen.</p>',
			),
			array( 'acf_fc_layout' => 'map' ),
		),
	),
	// Online — exercises the Online row; the map layout is dropped.
	'Know Your Rights at Work'                    => array(
		'event_summary' => 'A practical, worker-to-worker workshop on your rights on the job — what they are, and how to protect them.',
		'doors_time'    => '',
		'location_type' => 'online',
		'cost'          => 'Free · open to the public',
		'rsvp_required' => 1,
		'rsvp_url'      => '/get-involved/#join',
		'capacity'      => 100,
		'contact_name'  => 'Labor Committee',
		'contact_email' => 'labor@example.org',
		'contact_phone' => '',
		'body'          => array(
			array(
				'acf_fc_layout' => 'prose',
				'content'       => '<p>Whether you are salaried, hourly, or gig, you have rights on the job — and knowing them is the first step to defending them. This online workshop covers concerted activity, retaliation, and what to document, led by members of the Labor committee alongside guest organizers.</p><p>Bring your questions. The Zoom link is shared with everyone who RSVPs.</p>',
			),
			array(
				'acf_fc_layout' => 'agenda',
				'items'         => array(
					array( 'title' => 'Your rights at work', 'desc' => 'Concerted activity and what it protects.' ),
					array( 'title' => 'Spotting retaliation', 'desc' => 'What it looks like and what to do.' ),
					array( 'title' => 'Documentation clinic', 'desc' => 'Practical habits for building a record.' ),
					array( 'title' => 'Open Q&A', 'desc' => 'Bring your workplace questions.' ),
				),
			),
			array(
				'acf_fc_layout' => 'good_to_know',
				'items'         => array(
					array( 'text' => 'The Zoom link is emailed to everyone who RSVPs.' ),
					array( 'text' => 'Live Spanish interpretation available on request.' ),
				),
			),
			array(
				'acf_fc_layout' => 'a11y_note',
				'content'       => '<p>Auto-captions are enabled on the call. Need something else to take part? Email us and we will arrange it.</p>',
			),
			array( 'acf_fc_layout' => 'map' ),
		),
	),
);

foreach ( $progressnow_seed_enriched as $title => $fields ) {
	if ( empty( $progressnow_seed_event_ids[ $title ] ) ) {
		progressnow_seed_log( "WARN: enrich target not found: {$title}" );
		continue;
	}
	$event_id = (int) $progressnow_seed_event_ids[ $title ];

	update_field( 'field_progressnow_events_summary', $fields['event_summary'], $event_id );
	update_field( 'field_progressnow_events_doors_time', $fields['doors_time'], $event_id );
	update_field( 'field_progressnow_events_location_type', $fields['location_type'], $event_id );
	update_field( 'field_progressnow_events_cost', $fields['cost'], $event_id );
	update_field( 'field_progressnow_events_rsvp_required', $fields['rsvp_required'], $event_id );
	update_field( 'field_progressnow_events_rsvp_url', $fields['rsvp_url'], $event_id );
	update_field( 'field_progressnow_events_capacity', $fields['capacity'], $event_id );
	update_field( 'field_progressnow_events_contact_name', $fields['contact_name'], $event_id );
	update_field( 'field_progressnow_events_contact_email', $fields['contact_email'], $event_id );
	update_field( 'field_progressnow_events_contact_phone', $fields['contact_phone'], $event_id );
	update_field( 'field_progressnow_events_body', $fields['body'], $event_id );

	progressnow_seed_log( "event enriched: {$title} (#{$event_id})" );
}

/* -------------------------------------------------------------------------
 * 3. Blog — posts page, the 9 SAMPLE_POSTS, p1 block markup.
 * ---------------------------------------------------------------------- */

$progressnow_seed_blog_page = get_page_by_path( 'blog' );
if ( ! $progressnow_seed_blog_page ) {
	$blog_page_id = wp_insert_post( array(
		'post_type'   => 'page',
		'post_status' => 'publish',
		'post_title'  => 'Blog',
		'post_name'   => 'blog',
	), true );
	if ( is_wp_error( $blog_page_id ) ) {
		progressnow_seed_log( 'ERROR blog page: ' . $blog_page_id->get_error_message() );
		$blog_page_id = 0;
	} else {
		progressnow_seed_log( "page created: blog (#{$blog_page_id})" );
	}
} else {
	$blog_page_id = (int) $progressnow_seed_blog_page->ID;
	progressnow_seed_log( "page exists: blog (#{$blog_page_id})" );
}

if ( $blog_page_id ) {
	update_option( 'page_for_posts', $blog_page_id );
}
if ( 'page' !== get_option( 'show_on_front' ) ) {
	update_option( 'show_on_front', 'page' );
	progressnow_seed_log( 'option fixed: show_on_front=page' );
}
progressnow_seed_log(
	'reading options: show_on_front=' . get_option( 'show_on_front' )
	. ' page_on_front=' . get_option( 'page_on_front' )
	. ' page_for_posts=' . get_option( 'page_for_posts' )
);

/* --- Calendar page: assign the "Calendar" template so the events wiring
 *     keys off the template, not the `calendar` slug (D9); the slug is then
 *     free to change without breaking the calendar. */
$progressnow_seed_calendar_page = get_page_by_path( 'calendar' );
if ( ! $progressnow_seed_calendar_page ) {
	$calendar_page_id = wp_insert_post( array(
		'post_type'   => 'page',
		'post_status' => 'publish',
		'post_title'  => 'Event Calendar',
		'post_name'   => 'calendar',
	), true );
	if ( is_wp_error( $calendar_page_id ) ) {
		progressnow_seed_log( 'ERROR calendar page: ' . $calendar_page_id->get_error_message() );
		$calendar_page_id = 0;
	} else {
		progressnow_seed_log( "page created: calendar (#{$calendar_page_id})" );
	}
} else {
	$calendar_page_id = (int) $progressnow_seed_calendar_page->ID;
	progressnow_seed_log( "page exists: calendar (#{$calendar_page_id})" );
}
if ( $calendar_page_id ) {
	update_post_meta( $calendar_page_id, '_wp_page_template', 'page-templates/calendar.php' );
	progressnow_seed_log( 'calendar page template assigned: page-templates/calendar.php' );
}

$progressnow_seed_posts = array(
	array( 'slug' => 'lorem-ipsum-dolor', 'title' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod', 'cat' => 'mutual', 'date' => '2026-06-14 10:00:00', 'excerpt' => 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 'dek' => 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 'byline_mode' => 'named', 'committee' => 'Mutual Aid Committee', 'sticky' => true ),
	array( 'slug' => 'sed-ut-perspiciatis', 'title' => 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem', 'cat' => 'poled', 'date' => '2026-06-28 10:00:00', 'excerpt' => 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'byline_mode' => 'named' ),
	array( 'slug' => 'nemo-enim-ipsam', 'title' => 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur', 'cat' => 'labor', 'date' => '2026-06-21 10:00:00', 'excerpt' => 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'byline_mode' => 'committee', 'committee' => 'Labor Committee' ),
	array( 'slug' => 'ut-enim-ad-minima', 'title' => 'Ut enim ad minima veniam quis nostrum', 'cat' => 'chapter', 'date' => '2026-06-08 10:00:00', 'excerpt' => 'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae.', 'byline_mode' => 'named' ),
	array( 'slug' => 'quis-autem-vel-eum', 'title' => 'Quis autem vel eum iure reprehenderit', 'cat' => 'electoral', 'date' => '2026-05-30 10:00:00', 'excerpt' => 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.', 'byline_mode' => 'committee', 'committee' => 'Electoral Committee' ),
	array( 'slug' => 'neque-porro-quisquam', 'title' => 'Neque porro quisquam est qui dolorem', 'cat' => 'social', 'date' => '2026-05-22 10:00:00', 'excerpt' => 'Et harum quidem rerum facilis est et expedita distinctio nam libero tempore.', 'byline_mode' => 'named' ),
	array( 'slug' => 'temporibus-autem', 'title' => 'Temporibus autem quibusdam et aut officiis debitis', 'cat' => 'labor', 'date' => '2026-05-16 10:00:00', 'excerpt' => 'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus.', 'byline_mode' => 'named' ),
	array( 'slug' => 'nam-libero-tempore', 'title' => 'Nam libero tempore cum soluta nobis', 'cat' => 'poled', 'date' => '2026-05-09 10:00:00', 'excerpt' => 'Omnis voluptas assumenda est, omnis dolor repellendus maiores alias consequatur.', 'byline_mode' => 'committee', 'committee' => 'Political Education Committee' ),
	array( 'slug' => 'at-vero-eos', 'title' => 'At vero eos et accusamus et iusto odio', 'cat' => 'mutual', 'date' => '2026-05-02 10:00:00', 'excerpt' => 'Quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.', 'byline_mode' => 'named' ),
);

$progressnow_seed_p1_id = 0;

foreach ( $progressnow_seed_posts as $sp ) {
	$existing = get_posts( array(
		'post_type'      => 'post',
		'name'           => $sp['slug'],
		'post_status'    => 'any',
		'posts_per_page' => 1,
		'fields'         => 'ids',
	) );

	if ( $existing ) {
		$post_id = (int) $existing[0];
		progressnow_seed_log( "post exists: {$sp['slug']} (#{$post_id})" );
	} else {
		$post_id = wp_insert_post( array(
			'post_type'    => 'post',
			'post_status'  => 'publish',
			'post_title'   => $sp['title'],
			'post_name'    => $sp['slug'],
			'post_excerpt' => $sp['excerpt'],
			'post_content' => '<!-- wp:paragraph --><p>' . $sp['excerpt'] . '</p><!-- /wp:paragraph -->',
			'post_date'    => $sp['date'],
			'post_author'  => 1,
		), true );
		if ( is_wp_error( $post_id ) ) {
			progressnow_seed_log( "ERROR post {$sp['slug']}: " . $post_id->get_error_message() );
			continue;
		}
		progressnow_seed_log( "post created: {$sp['slug']} (#{$post_id})" );
	}

	wp_set_object_terms( $post_id, $sp['cat'], 'category' );

	if ( isset( $sp['dek'] ) ) {
		update_field( 'field_progressnow_blog_dek', $sp['dek'], $post_id );
	}
	update_field( 'field_progressnow_blog_byline_mode', $sp['byline_mode'], $post_id );
	if ( isset( $sp['committee'] ) ) {
		update_field( 'field_progressnow_blog_committee', $sp['committee'], $post_id );
	}

	if ( ! empty( $sp['sticky'] ) ) {
		if ( ! is_sticky( $post_id ) ) {
			stick_post( $post_id );
			progressnow_seed_log( "post stuck: {$sp['slug']}" );
		}
		$progressnow_seed_p1_id = $post_id;
	}
}

/* --- Placeholder PDF (interior documents + p1 document block need a file). */

function progressnow_seed_placeholder_pdf() {
	$existing = get_posts( array(
		'post_type'      => 'attachment',
		'name'           => 'progressnow-placeholder-pdf',
		'post_status'    => 'inherit',
		'posts_per_page' => 1,
		'fields'         => 'ids',
	) );
	if ( $existing ) {
		return (int) $existing[0];
	}

	// Minimal valid one-page PDF, built with correct xref offsets.
	$pdf  = "%PDF-1.4\n";
	$objs = array(
		"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n",
		"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n",
		"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n",
	);
	$offsets = array();
	foreach ( $objs as $obj ) {
		$offsets[] = strlen( $pdf );
		$pdf      .= $obj;
	}
	$xref = strlen( $pdf );
	$pdf .= "xref\n0 4\n0000000000 65535 f \n";
	foreach ( $offsets as $off ) {
		$pdf .= sprintf( "%010d 00000 n \n", $off );
	}
	$pdf .= "trailer<</Size 4/Root 1 0 R>>\nstartxref\n{$xref}\n%%EOF\n";

	$upload = wp_upload_bits( 'progressnow-placeholder.pdf', null, $pdf );
	if ( ! empty( $upload['error'] ) ) {
		progressnow_seed_log( 'ERROR placeholder PDF upload: ' . $upload['error'] );
		return 0;
	}

	$att_id = wp_insert_attachment( array(
		'post_title'     => 'Placeholder PDF',
		'post_name'      => 'progressnow-placeholder-pdf',
		'post_mime_type' => 'application/pdf',
		'post_status'    => 'inherit',
	), $upload['file'] );

	if ( is_wp_error( $att_id ) || ! $att_id ) {
		progressnow_seed_log( 'ERROR placeholder PDF attachment insert failed' );
		return 0;
	}

	require_once ABSPATH . 'wp-admin/includes/image.php';
	$meta = wp_generate_attachment_metadata( $att_id, $upload['file'] );
	if ( $meta ) {
		wp_update_attachment_metadata( $att_id, $meta );
	}

	progressnow_seed_log( "attachment created: progressnow-placeholder-pdf (#{$att_id})" );

	return (int) $att_id;
}

$progressnow_seed_pdf_id = progressnow_seed_placeholder_pdf();

/* --- Default share image (Chapter Settings → og:image fallback, inc/seo.php). */

function progressnow_seed_default_share_image() {
	$existing = get_posts( array(
		'post_type'      => 'attachment',
		'name'           => 'progressnow-default-share',
		'post_status'    => 'inherit',
		'posts_per_page' => 1,
		'fields'         => 'ids',
	) );
	if ( $existing ) {
		return (int) $existing[0];
	}

	// Placeholder: the shipped share image as a real attachment so the seeded
	// site exercises the attachment branch of the share-image ladder.
	$source = get_theme_file_path( 'static/images/brand/share-default.jpg' );
	if ( ! is_readable( $source ) ) {
		progressnow_seed_log( 'ERROR default share image: placeholder not readable' );
		return 0;
	}

	$upload = wp_upload_bits( 'progressnow-default-share.jpg', null, (string) file_get_contents( $source ) );
	if ( ! empty( $upload['error'] ) ) {
		progressnow_seed_log( 'ERROR default share image upload: ' . $upload['error'] );
		return 0;
	}

	$att_id = wp_insert_attachment( array(
		'post_title'     => 'Default Share Image',
		'post_name'      => 'progressnow-default-share',
		'post_mime_type' => 'image/jpeg',
		'post_status'    => 'inherit',
	), $upload['file'] );

	if ( is_wp_error( $att_id ) || ! $att_id ) {
		progressnow_seed_log( 'ERROR default share image attachment insert failed' );
		return 0;
	}

	update_post_meta( $att_id, '_wp_attachment_image_alt', 'Chapter share image' );

	require_once ABSPATH . 'wp-admin/includes/image.php';
	$meta = wp_generate_attachment_metadata( $att_id, $upload['file'] );
	if ( $meta ) {
		wp_update_attachment_metadata( $att_id, $meta );
	}

	progressnow_seed_log( "attachment created: progressnow-default-share (#{$att_id})" );

	return (int) $att_id;
}

$progressnow_seed_share_id = progressnow_seed_default_share_image();
if ( $progressnow_seed_share_id && ! get_field( 'default_share_image', 'option' ) ) {
	update_field( 'field_progressnow_options_default_share_image', $progressnow_seed_share_id, 'option' );
	progressnow_seed_log( "option set: default_share_image (#{$progressnow_seed_share_id})" );
}

/* --- p1: block markup using every block type (SAMPLE_SINGLE fixture). */

if ( $progressnow_seed_p1_id ) {
	$brake_light_id = isset( $progressnow_seed_event_ids['Brake Light Clinic'] ) ? (int) $progressnow_seed_event_ids['Brake Light Clinic'] : 0;
	$doc_id         = $progressnow_seed_pdf_id ? (int) $progressnow_seed_pdf_id : 0;

	$acf_block = function ( $name, $data ) {
		return '<!-- wp:' . $name . ' ' . wp_json_encode( array(
			'name' => $name,
			'data' => $data,
			'mode' => 'preview',
		) ) . ' /-->';
	};

	$markup =
		'<!-- wp:paragraph --><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><!-- /wp:paragraph -->'
		. '<!-- wp:paragraph --><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><!-- /wp:paragraph -->'
		. '<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img alt="Photo"/><figcaption class="wp-element-caption">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</figcaption></figure><!-- /wp:image -->'
		. '<!-- wp:paragraph --><p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p><!-- /wp:paragraph -->'
		. '<!-- wp:pullquote --><figure class="wp-block-pullquote"><blockquote><p>“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.”</p><cite>Attribution line</cite></blockquote></figure><!-- /wp:pullquote -->'
		. '<!-- wp:gallery {"linkTo":"none"} --><figure class="wp-block-gallery has-nested-images columns-default is-cropped">'
		. '<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img alt="Wide photo"/><figcaption class="wp-element-caption">Lorem ipsum dolor sit amet.</figcaption></figure><!-- /wp:image -->'
		. '<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img alt="Photo"/><figcaption class="wp-element-caption">Consectetur adipiscing elit.</figcaption></figure><!-- /wp:image -->'
		. '<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} --><figure class="wp-block-image size-large"><img alt="Photo"/><figcaption class="wp-element-caption">Sed do eiusmod tempor.</figcaption></figure><!-- /wp:image -->'
		. '</figure><!-- /wp:gallery -->'
		. $acf_block( 'progressnow/person-quote', array(
			'photo'        => 0,
			'_photo'       => 'field_progressnow_block_pq_photo',
			'alt_text'     => 'Portrait',
			'_alt_text'    => 'field_progressnow_block_pq_alt_text',
			'quote'        => '“Lorem ipsum dolor sit amet, consectetur adipiscing elit.”',
			'_quote'       => 'field_progressnow_block_pq_quote',
			'translation'  => '“Translation of the quote appears here.”',
			'_translation' => 'field_progressnow_block_pq_translation',
			'name'         => 'Person Name',
			'_name'        => 'field_progressnow_block_pq_name',
			'role'         => 'Role or affiliation',
			'_role'        => 'field_progressnow_block_pq_role',
			'lang'         => 'es',
			'_lang'        => 'field_progressnow_block_pq_lang',
		) )
		. $acf_block( 'progressnow/video', array(
			'url'             => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			'_url'            => 'field_progressnow_block_video_url',
			'poster'          => 0,
			'_poster'         => 'field_progressnow_block_video_poster',
			'caption'         => 'Watch: lorem ipsum dolor sit amet consectetur. Captioned in English and Spanish.',
			'_caption'        => 'field_progressnow_block_video_caption',
			'transcript_url'  => '#',
			'_transcript_url' => 'field_progressnow_block_video_transcript_url',
		) )
		. '<!-- wp:heading --><h2 class="wp-block-heading">Lorem ipsum dolor sit amet</h2><!-- /wp:heading -->'
		. '<!-- wp:paragraph --><p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt, neque porro quisquam est qui dolorem ipsum quia dolor sit amet.</p><!-- /wp:paragraph -->'
		. $acf_block( 'progressnow/audio', array(
			'file'        => 0,
			'_file'       => 'field_progressnow_block_audio_file',
			'title'       => 'Listen: lorem ipsum audio title',
			'_title'      => 'field_progressnow_block_audio_title',
			'duration'    => '3:12',
			'_duration'   => 'field_progressnow_block_audio_duration',
			'transcript'  => 0,
			'_transcript' => 'field_progressnow_block_audio_transcript',
		) )
		. $acf_block( 'progressnow/document', array(
			'file'         => $doc_id,
			'_file'        => 'field_progressnow_block_document_file',
			'title'        => 'Lorem ipsum document title',
			'_title'       => 'field_progressnow_block_document_title',
			'description'  => 'Bilingual · 2 pages · 340 KB',
			'_description' => 'field_progressnow_block_document_description',
		) )
		. $acf_block( 'progressnow/event-embed', array(
			'event'  => $brake_light_id,
			'_event' => 'field_progressnow_block_event_embed_event',
		) )
		. $acf_block( 'progressnow/action-callout', array(
			'heading'          => 'Lorem ipsum dolor sit amet',
			'_heading'         => 'field_progressnow_block_ac_heading',
			'body'             => 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
			'_body'            => 'field_progressnow_block_ac_body',
			'buttons_0_label'  => 'Primary action',
			'_buttons_0_label' => 'field_progressnow_block_ac_btn_label',
			'buttons_0_url'    => '/get-involved/',
			'_buttons_0_url'   => 'field_progressnow_block_ac_btn_url',
			'buttons_0_style'  => 'primary',
			'_buttons_0_style' => 'field_progressnow_block_ac_btn_style',
			'buttons_1_label'  => 'Secondary action',
			'_buttons_1_label' => 'field_progressnow_block_ac_btn_label',
			'buttons_1_url'    => '#',
			'_buttons_1_url'   => 'field_progressnow_block_ac_btn_url',
			'buttons_1_style'  => 'outline',
			'_buttons_1_style' => 'field_progressnow_block_ac_btn_style',
			'buttons'          => 2,
			'_buttons'         => 'field_progressnow_block_ac_buttons',
		) );

	wp_update_post( array(
		'ID'           => $progressnow_seed_p1_id,
		'post_content' => wp_slash( $markup ),
	) );
	update_field( 'field_progressnow_blog_read_minutes', 6, $progressnow_seed_p1_id );
	wp_set_post_terms( $progressnow_seed_p1_id, array( 'tag one', 'tag two' ), 'post_tag' );
	progressnow_seed_log( "p1 block markup seeded (#{$progressnow_seed_p1_id})" );
}

/* -------------------------------------------------------------------------
 * 4. Menus — rebuild each named menu to exactly the given items + location.
 * ---------------------------------------------------------------------- */

function progressnow_seed_menu( $name, $location, $items ) {
	$menu    = wp_get_nav_menu_object( $name );
	$menu_id = $menu ? (int) $menu->term_id : (int) wp_create_nav_menu( $name );
	if ( is_wp_error( $menu_id ) || ! $menu_id ) {
		progressnow_seed_log( "ERROR menu {$name}: could not create" );
		return;
	}

	// Wipe existing items so the menu is exactly the given set (idempotent).
	$existing = wp_get_nav_menu_items( $menu_id, array( 'post_status' => 'any' ) );
	if ( is_array( $existing ) ) {
		foreach ( $existing as $item ) {
			wp_delete_post( $item->ID, true );
		}
	}

	$position = 1;
	foreach ( $items as $label => $url ) {
		wp_update_nav_menu_item( $menu_id, 0, array(
			'menu-item-title'    => $label,
			'menu-item-url'      => $url,
			'menu-item-type'     => 'custom',
			'menu-item-status'   => 'publish',
			'menu-item-position' => $position++,
		) );
	}

	$locations              = get_nav_menu_locations();
	$locations[ $location ] = $menu_id;
	set_theme_mod( 'nav_menu_locations', $locations );

	progressnow_seed_log( "menu seeded: {$name} → {$location} (" . count( $items ) . ' items)' );
}

progressnow_seed_menu( 'Primary', 'primary', array(
	'Calendar'     => '/calendar/',
	'Blog'         => '/blog/',
	'Get Involved' => '/get-involved/',
) );

progressnow_seed_menu( 'Header — About', 'about', array(
	'About the Chapter'        => '/about/#chapter',
	'Mission & History'        => '/about/#mission',
	'Where We Organize'        => '/about/#counties',
	'Committees'               => '/about/#committees',
	'Bylaws & Code of Conduct' => '/about/#bylaws',
	'FAQ'                      => '/about/#faq',
) );

progressnow_seed_menu( 'Footer — About', 'footer_about', array(
	'About the Chapter'        => '/about/',
	'Mission & History'        => '/about/#mission',
	'Where We Organize'        => '/about/#counties',
	'Bylaws & Code of Conduct' => '/about/#bylaws',
	'FAQ'                      => '/about/#faq',
) );

progressnow_seed_menu( 'Footer — Get Involved', 'footer_involved', array(
	'Join us'               => '/get-involved/#join',
	'Event Calendar'         => '/calendar/',
	'Committees'             => '/get-involved/#committees',
	'Communication Channels' => '/get-involved/#channels',
) );

progressnow_seed_menu( 'Footer — Resources', 'footer_resources', array(
	'Documents & Minutes' => '/bylaws-code-of-conduct/#documents',
	'Resolutions'         => '/bylaws-code-of-conduct/',
	'Education Library'   => '/bylaws-code-of-conduct/',
	'Grievance Contact'   => '/bylaws-code-of-conduct/#grievance',
) );

progressnow_seed_menu( 'Footer — Contact', 'footer_contact', array(
	'Email' => 'mailto:hello@example.org',
) );

/* -------------------------------------------------------------------------
 * 5. Chapter Settings options.
 * ---------------------------------------------------------------------- */

update_field( 'field_progressnow_options_join_url', '/get-involved/#join', 'option' );
update_field( 'field_progressnow_options_contact_email', 'hello@example.org', 'option' );
// Social profiles have no placeholder — the chapter sets its own in wp-admin
// (footer icons, Get Involved channel, JSON-LD sameAs render only when set).
update_field( 'field_progressnow_options_instagram_url', '', 'option' );
update_field( 'field_progressnow_options_facebook_url', '', 'option' );
update_field( 'field_progressnow_options_twitter_url', '', 'option' );
update_field( 'field_progressnow_options_event_count', 5, 'option' );
update_field( 'field_progressnow_options_committees', array(
	array( 'name' => 'Political Education', 'desc' => 'Reading groups, night school, and workshops that build our shared analysis.' ),
	array( 'name' => 'Mutual Aid', 'desc' => "Meeting our neighbors' immediate needs while organizing for lasting change." ),
	array( 'name' => 'Labor', 'desc' => 'Supporting workers organizing on the job across our community.' ),
	array( 'name' => 'Communications', 'desc' => "Social media, design, and this website — telling the chapter's story." ),
	array( 'name' => 'Electoral', 'desc' => 'Backing candidates and ballot measures that fight for working people.' ),
	array( 'name' => 'Membership & Onboarding', 'desc' => 'Welcoming new members and making sure no one falls through the cracks.' ),
), 'option' );
update_field( 'field_progressnow_options_counties', array_map(
	static function ( $name ) {
		return array( 'name' => $name );
	},
	// Placeholder areas — the chapter replaces these in wp-admin.
	array( 'Downtown', 'Northside', 'Southside', 'Eastside', 'Westside' )
), 'option' );
// v3 footer (06-V3-BRAND-REFRESH.md) carries no tagline under the logo; leave the
// Chapter Settings field empty so the design default renders (editors may still set one).
update_field( 'field_progressnow_options_footer_tagline', '', 'option' );
update_field( 'field_progressnow_options_newhere_heading', 'New here?', 'option' );
update_field( 'field_progressnow_options_newhere_body', 'Come to a <span class="notranslate">Progress Now 101</span> — our intro session for new and curious folks.', 'option' );
update_field( 'field_progressnow_options_newhere_link_label', 'Find a session', 'option' );
update_field( 'field_progressnow_options_newhere_link_url', '/calendar/', 'option' );
progressnow_seed_log( 'chapter settings options seeded' );

/* --- Translation is now Polylang (see the Spanish-home seed at the end of this
 *     file). No GTranslate option to pin. */

/* --- Posts-page lede (interior `lede` field on the page_for_posts page). */
if ( $blog_page_id ) {
	update_field( 'field_progressnow_interior_lede', 'News, analysis, and dispatches from chapter organizers across our community.', $blog_page_id );
	progressnow_seed_log( "posts-page lede seeded (#{$blog_page_id})" );
}

/* --- Home hero copy (front-page ACF group). Needs a front page assigned. */
$progressnow_seed_front_id = (int) get_option( 'page_on_front' );
if ( $progressnow_seed_front_id ) {
	update_field( 'field_progressnow_hero_lede', 'We’re a member-run organization building working-class power in our community.', $progressnow_seed_front_id );
	update_field( 'field_progressnow_hero_cta_primary_label', 'Join us', $progressnow_seed_front_id );
	update_field( 'field_progressnow_hero_cta_primary_url', '/get-involved/#join', $progressnow_seed_front_id );
	// v3 home: subhead under the headline; the secondary CTA is the dashed
	// "New member?" box → Get Involved.
	update_field( 'field_progressnow_hero_subhead', 'We’re fighting for the future our community deserves.', $progressnow_seed_front_id );
	update_field( 'field_progressnow_hero_cta_secondary_label', 'New member? Start with Progress Now 101. Sign up here', $progressnow_seed_front_id );
	update_field( 'field_progressnow_hero_cta_secondary_url', '/get-involved/', $progressnow_seed_front_id );
	progressnow_seed_log( "home hero copy seeded (#{$progressnow_seed_front_id})" );

	// Home sections (Who we are — v3 prototype copy).
	update_field( 'field_progressnow_who_eyebrow', 'Who we are', $progressnow_seed_front_id );
	update_field( 'field_progressnow_who_heading', 'We are <span class="notranslate">Progress Now</span>', $progressnow_seed_front_id );
	update_field( 'field_progressnow_who_p1', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, quis nostrud exercitation ullamco laboris.', $progressnow_seed_front_id );
	update_field( 'field_progressnow_who_p2', 'Ut enim ad minim veniam, quis nostrud.', $progressnow_seed_front_id );
	update_field( 'field_progressnow_who_p3', "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis.\nLorem ipsum dolor sit amet.", $progressnow_seed_front_id );
	update_field( 'field_progressnow_who_link_label', 'More about our chapter', $progressnow_seed_front_id );
	update_field( 'field_progressnow_who_link_url', '/about/', $progressnow_seed_front_id );
	update_field( 'field_progressnow_cta_line', 'Progress now, not someday!', $progressnow_seed_front_id );
	progressnow_seed_log( "home sections copy seeded (#{$progressnow_seed_front_id})" );
} else {
	progressnow_seed_log( 'WARN: no page_on_front — home hero copy not seeded (assign a static front page)' );
}

/* -------------------------------------------------------------------------
 * 6. Interior — bylaws page governing-documents repeater.
 * ---------------------------------------------------------------------- */

$progressnow_seed_bylaws = get_page_by_path( 'bylaws-code-of-conduct' );
if ( $progressnow_seed_bylaws && $progressnow_seed_pdf_id ) {
	update_field( 'field_progressnow_interior_documents', array(
		array( 'title' => 'Chapter Bylaws', 'description' => 'Last amended March 2026', 'file' => $progressnow_seed_pdf_id ),
		array( 'title' => 'Code of Conduct', 'description' => 'Adopted January 2026', 'file' => $progressnow_seed_pdf_id ),
		array( 'title' => 'Grievance Policy', 'description' => 'Adopted January 2026', 'file' => $progressnow_seed_pdf_id ),
	), $progressnow_seed_bylaws->ID );
	progressnow_seed_log( "bylaws documents seeded (#{$progressnow_seed_bylaws->ID}, 3 rows)" );
} else {
	progressnow_seed_log( 'WARN: bylaws-code-of-conduct page or placeholder PDF missing — documents not seeded' );
}

/* -------------------------------------------------------------------------
 * 6.5 About + Get Involved pages — template assignment (D9) + section copy.
 * ---------------------------------------------------------------------- */

function progressnow_seed_template_page( $slug, $title, $template ) {
	$page = get_page_by_path( $slug );
	if ( ! $page ) {
		$page_id = wp_insert_post( array(
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => $title,
			'post_name'   => $slug,
		), true );
		if ( is_wp_error( $page_id ) ) {
			progressnow_seed_log( "ERROR page {$slug}: " . $page_id->get_error_message() );
			return 0;
		}
		progressnow_seed_log( "page created: {$slug} (#{$page_id})" );
	} else {
		$page_id = (int) $page->ID;
		progressnow_seed_log( "page exists: {$slug} (#{$page_id})" );
	}

	update_post_meta( $page_id, '_wp_page_template', $template );
	progressnow_seed_log( "{$slug} page template assigned: {$template}" );

	return $page_id;
}

$progressnow_seed_about_id = progressnow_seed_template_page( 'about', 'About the Chapter', 'page-templates/about.php' );
if ( $progressnow_seed_about_id ) {
	update_field( 'field_progressnow_interior_lede', 'A member-run chapter of the Progress Now, organizing for working people across our community.', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_mission_eyebrow', 'What we believe', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_mission_body', 'We believe our economy should be built democratically, by and for working people — not by billionaires for profit.', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_chapter_heading', 'About the Chapter', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_intro_p1', 'We are a member-run, member-funded organizing group. Our grassroots work focuses on labor organizing, mutual aid, and political education across our community.', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_intro_p2', 'Everything we do is member-led, member-funded, and open to anyone who wants to build a community that works for working people. We regularly host community meetings to share updates, plan campaigns, and hold political education lectures. If you’re a student, ask us about our campus branch.', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_ctas', array(
		array( 'label' => 'Come to a meeting', 'url' => '/calendar/' ),
		array( 'label' => 'Get involved', 'url' => '/get-involved/' ),
		array( 'label' => 'Students', 'url' => '/get-involved/' ),
	), $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_history_heading', 'Mission & History', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_history_body', 'We fight for a future where housing, healthcare, and a dignified living are guaranteed — and we believe the people who live and work in our community should be the ones deciding it. Our work centers on three pillars: labor organizing, mutual aid, and political education.', $progressnow_seed_about_id );
	// 20XX years are chapter-copy placeholders — the chapter fills them in via wp-admin.
	update_field( 'field_progressnow_about_timeline', array(
		array( 'year' => '1982', 'text' => 'Progress Now is founded as a member-run organizing project.' ),
		array( 'year' => '20XX', 'text' => 'Local organizers form an organizing committee and begin meeting. <em class="text-[#78716c]">(Year and details to be filled in by the chapter.)</em>' ),
		array( 'year' => '20XX', 'text' => 'The chapter is chartered as an official local chapter. <em class="text-[#78716c]">(Year and details to be filled in by the chapter.)</em>' ),
	), $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_counties_heading', 'Where We Organize', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_counties_intro', 'One chapter, many communities. Wherever you are in our community, you’re covered — and if you can help us organize deeper in your neighborhood, we want to hear from you.', $progressnow_seed_about_id );
	// Placeholder areas — the chapter replaces these in wp-admin.
	update_field( 'field_progressnow_about_county_cards', array(
		array( 'name' => 'Central', 'cities' => 'Downtown · Midtown', 'note' => 'Home base — most meetings held here' ),
		array( 'name' => 'North', 'cities' => 'Northside · Uptown', 'note' => '' ),
		array( 'name' => 'South', 'cities' => 'Southside · Riverside', 'note' => '' ),
		array( 'name' => 'Campus', 'cities' => 'Student branch', 'note' => '' ),
	), $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_committees_heading', 'Committees', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_committees_intro', 'Committees are where the work happens. Each one meets regularly and welcomes new members.', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_committees_link_label', 'Join a committee', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_committees_link_url', '/get-involved/#committees', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_governance_heading', 'Bylaws & Code of Conduct', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_governance_intro', 'The chapter is governed by its members through documents we debate and vote on together. Everything is public.', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_governance_docs', array(
		array( 'title' => 'Chapter Bylaws', 'covers' => 'How the chapter runs: officers, elections, quorum, committees, and how decisions get made.', 'action' => 'Read', 'url' => '/bylaws-code-of-conduct/#documents' ),
		array( 'title' => 'Code of Conduct', 'covers' => 'What we expect of each other in every chapter space — meetings, actions, and online.', 'action' => 'Read', 'url' => '/bylaws-code-of-conduct/#documents' ),
		array( 'title' => 'Grievance Policy', 'covers' => 'How to report harm and how the chapter handles conflict, confidentially and fairly.', 'action' => 'Read', 'url' => '/bylaws-code-of-conduct/#grievance' ),
		array( 'title' => 'Meeting Minutes', 'covers' => 'Records and resolutions from general meetings, available to all members.', 'action' => 'Browse', 'url' => '/bylaws-code-of-conduct/#documents' ),
	), $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_faq_heading', 'FAQ', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_faq', array(
		array( 'question' => 'Do I have to be a member to come to events?', 'answer' => "Nope — most of our events are open to everyone. Come to a 101 or a social, meet folks, and see if it's for you." ),
		array( 'question' => 'How much are dues?', 'answer' => 'Dues are sliding-scale — most folks pay a few dollars a month. No one is turned away for inability to pay.' ),
		array( 'question' => 'How do I change my dues rate?', 'answer' => 'Enter the email associated with your membership in the dues form with your new dues amount, and your current dues will be canceled and updated.' ),
		array( 'question' => "I've never done anything political before. Is that okay?", 'answer' => "More than okay — it's the norm. Most members joined without any organizing experience. Progress Now 101 exists exactly for this." ),
		array( 'question' => 'Can I participate without being publicly visible?', 'answer' => "Yes. There are plenty of ways to contribute behind the scenes, and we take members' privacy and safety seriously." ),
		array( 'question' => 'How much time does membership take?', 'answer' => 'As much or as little as you have. Some members show up to one event a month; others help lead committees.' ),
	), $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_dues_heading', 'Switching your dues rate?', $progressnow_seed_about_id );
	update_field( 'field_progressnow_about_dues_body', 'Already a member and changing your dues rate? Enter the email associated with your membership in the dues form with your new dues amount, and your current dues will be canceled and updated.', $progressnow_seed_about_id );
	progressnow_seed_log( "about page copy seeded (#{$progressnow_seed_about_id})" );
}

$progressnow_seed_gi_id = progressnow_seed_template_page( 'get-involved', 'Get involved', 'page-templates/get-involved.php' );
if ( $progressnow_seed_gi_id ) {
	update_field( 'field_progressnow_interior_lede', "No experience needed, no perfect politics required. If you want a better world, there's a place for you here.", $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_join_heading', 'How to join', $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_steps', array(
		array( 'title' => 'Become a member', 'body' => 'Sign up in a few minutes. Dues are sliding-scale — pay what you can, and <strong>no one is turned away for lack of funds</strong>.', 'link_label' => 'Join now →', 'link_url' => '/get-involved/#join' ),
		array( 'title' => 'Come to Progress Now 101', 'body' => "Our intro session for new and curious folks — what we stand for, what our chapter is working on, and how to plug in. Offered virtually and in person, multiple times a month. You don't have to be a member yet to attend.", 'link_label' => 'Find a session →', 'link_url' => '/calendar/' ),
		array( 'title' => 'Get onboarded & plug in', 'body' => "After 101, we'll add you to our WhatsApp and match you with a committee that fits your interests and capacity — whether that's an hour a month or a night a week.", 'link_label' => 'Browse committees ↓', 'link_url' => '#committees' ),
	), $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_committees_heading', 'Committees', $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_committees_intro', 'Committees are where the work happens. Each one meets regularly and welcomes new members — reach out through the WhatsApp or at any general meeting.', $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_channels_heading', 'Communication channels', $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_channels', array(
		array( 'label' => 'WhatsApp', 'desc' => 'Our main channel — members receive an invite during onboarding', 'link_label' => '', 'url' => '', 'badge' => 'Members only' ),
		array( 'label' => 'Email', 'desc' => 'Questions, press, and anything else', 'link_label' => 'Write us', 'url' => 'mailto:hello@example.org', 'badge' => '' ),
	), $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_faq_heading', 'Common questions', $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_faq', array(
		array( 'question' => 'Do I have to be a member to come to events?', 'answer' => "Nope — most of our events are open to everyone. Come to a 101 or a social, meet folks, and see if it's for you. No pressure." ),
		array( 'question' => 'How much are dues?', 'answer' => 'Dues are sliding-scale — most folks pay a few dollars a month. If dues are a barrier, talk to us: no one is turned away for lack of funds.' ),
		array( 'question' => "I've never done anything political before. Is that okay?", 'answer' => "More than okay — it's the norm. Most members joined without any organizing experience. Progress Now 101 exists exactly for this, and committees will teach you everything as you go." ),
		array( 'question' => 'Can I participate without being publicly visible?', 'answer' => "Yes. There are plenty of ways to contribute behind the scenes, and we take members' privacy and safety seriously. Talk to us about what you're comfortable with." ),
		array( 'question' => 'How much time does membership take?', 'answer' => "As much or as little as you have. Some members show up to one event a month; others help lead committees. Capacity changes — that's fine. The work is a marathon, not a sprint." ),
	), $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_card_heading', 'Ready right now?', $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_card_body', 'Membership takes five minutes, and dues are pay-what-you-can.', $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_card_link_label', 'Join us', $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_card_link_url', '/get-involved/#join', $progressnow_seed_gi_id );
	update_field( 'field_progressnow_gi_related_links', array(
		array( 'label' => 'Event Calendar', 'url' => '/calendar/' ),
		array( 'label' => 'Bylaws & Code of Conduct', 'url' => '/bylaws-code-of-conduct/' ),
		array( 'label' => 'Mission & History', 'url' => '/about/#mission' ),
	), $progressnow_seed_gi_id );
	progressnow_seed_log( "get-involved page copy seeded (#{$progressnow_seed_gi_id})" );
}

/* -------------------------------------------------------------------------
 * 6.9 Spanish home (Polylang Pro) — language assignment, ES page + ACF copy,
 *     and UI string translations. Idempotent: guarded by translation lookups.
 * ---------------------------------------------------------------------- */

/**
 * Create (idempotently) a Spanish translation of an event, copying its meta so
 * the date/location render, and linking it to the English original. Keyed by
 * the English post_title so it survives changing IDs.
 */
function progressnow_seed_translate_event( $en_id, $es_title ) {
	if ( pll_get_post( $en_id, 'es' ) ) {
		return; // already translated
	}
	$es_id = wp_insert_post( array(
		'post_type'    => 'event',
		'post_status'  => 'publish',
		'post_title'   => $es_title,
		'post_name'    => sanitize_title( $es_title ),
		'post_content' => get_post_field( 'post_content', $en_id ),
	), true );
	if ( is_wp_error( $es_id ) ) {
		progressnow_seed_log( "ERROR es event '{$es_title}': " . $es_id->get_error_message() );
		return;
	}
	// Copy every meta value (ACF start_datetime, city, venue, links, …).
	foreach ( get_post_meta( $en_id ) as $key => $values ) {
		if ( '_edit_lock' === $key || '_edit_last' === $key ) {
			continue;
		}
		delete_post_meta( $es_id, $key );
		foreach ( $values as $value ) {
			add_post_meta( $es_id, $key, maybe_unserialize( $value ) );
		}
	}
	pll_set_post_language( $es_id, 'es' );
	pll_save_post_translations( array( 'en' => $en_id, 'es' => $es_id ) );
	progressnow_seed_log( "polylang: es event '{$es_title}' created (#{$es_id})" );
}

/**
 * Create (idempotently) a Spanish translation of a page, linking it to the
 * English original and copying its page template so the template-keyed context
 * wiring (D9) fires. ACF/lede values in $es_fields are written only on create,
 * so re-runs never clobber an editor's Spanish edits. Returns the ES page id
 * (0 on failure).
 *
 * @param int    $en_id    English page ID.
 * @param string $es_title Spanish post_title.
 * @param string $es_slug  Spanish post_name (the /es/<slug>/ segment).
 * @param array  $es_fields field_key => value pairs for update_field (create only).
 * @return int
 */
function progressnow_seed_translate_page( $en_id, $es_title, $es_slug, $es_fields = array() ) {
	if ( ! $en_id ) {
		return 0;
	}
	if ( ! pll_get_post_language( $en_id ) ) {
		pll_set_post_language( $en_id, 'en' );
	}

	$existing = pll_get_post( $en_id, 'es' );
	if ( $existing ) {
		// Keep the template link current, but never overwrite existing ES copy.
		$tmpl = get_post_meta( $en_id, '_wp_page_template', true );
		if ( $tmpl ) {
			update_post_meta( $existing, '_wp_page_template', $tmpl );
		}
		progressnow_seed_log( "polylang: es page '{$es_slug}' exists (#{$existing})" );
		return (int) $existing;
	}

	$es_id = wp_insert_post( array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => $es_title,
		'post_name'    => $es_slug,
		'post_content' => get_post_field( 'post_content', $en_id ),
	), true );
	if ( is_wp_error( $es_id ) ) {
		progressnow_seed_log( "ERROR es page '{$es_slug}': " . $es_id->get_error_message() );
		return 0;
	}

	pll_set_post_language( $es_id, 'es' );
	pll_save_post_translations( array( 'en' => (int) $en_id, 'es' => (int) $es_id ) );

	// wp_insert_post enforces global slug uniqueness *before* the language is
	// set, so a slug shared with the English original (e.g. 'blog') gets deduped
	// to 'blog-2'. Now that Polylang knows the language — and allows the same
	// slug across languages — re-assert the intended slug.
	if ( get_post_field( 'post_name', $es_id ) !== $es_slug ) {
		wp_update_post( array( 'ID' => (int) $es_id, 'post_name' => $es_slug ) );
	}

	$tmpl = get_post_meta( $en_id, '_wp_page_template', true );
	if ( $tmpl ) {
		update_post_meta( $es_id, '_wp_page_template', $tmpl );
	}

	foreach ( $es_fields as $key => $value ) {
		update_field( $key, $value, $es_id );
	}

	progressnow_seed_log( "polylang: es page '{$es_slug}' created (#{$es_id}, " . count( $es_fields ) . ' fields)' );
	return (int) $es_id;
}

/**
 * Seed source→translation string pairs into Polylang's per-language MO store.
 * These power `pll__()` in the theme (see inc/i18n.php).
 */
function progressnow_seed_string_translations( $lang_slug, $pairs ) {
	if ( ! function_exists( 'PLL' ) || ! class_exists( 'PLL_MO' ) ) {
		progressnow_seed_log( 'WARN: Polylang PLL_MO unavailable — strings not translated' );
		return;
	}
	$lang = PLL()->model->get_language( $lang_slug );
	if ( ! $lang ) {
		progressnow_seed_log( "WARN: Polylang language '{$lang_slug}' not found — strings not translated" );
		return;
	}
	$mo = new PLL_MO();
	$mo->import_from_db( $lang );
	foreach ( $pairs as $source => $translation ) {
		$mo->add_entry( $mo->make_entry( $source, $translation ) );
	}
	$mo->export_to_db( $lang );
	progressnow_seed_log( 'polylang: ' . count( $pairs ) . " '{$lang_slug}' string translations seeded" );
}

if ( function_exists( 'pll_set_post_language' ) && function_exists( 'pll_save_post_translations' ) ) {

	// 6.9a — Every published page/post/event needs a language so Polylang's
	// per-language query filter includes it. Backfill 'en' where missing.
	$progressnow_seed_all = get_posts( array(
		'post_type'   => array( 'page', 'post', 'event' ),
		'post_status' => 'publish',
		'numberposts' => -1,
		'fields'      => 'ids',
	) );
	$progressnow_seed_tagged = 0;
	foreach ( $progressnow_seed_all as $progressnow_pid ) {
		if ( ! pll_get_post_language( $progressnow_pid ) ) {
			pll_set_post_language( $progressnow_pid, 'en' );
			++$progressnow_seed_tagged;
		}
	}
	progressnow_seed_log( "polylang: backfilled 'en' on {$progressnow_seed_tagged} untagged posts" );

	// 6.9b — Spanish translation of the static front page.
	$progressnow_seed_front_id = (int) get_option( 'page_on_front' );
	if ( $progressnow_seed_front_id ) {
		if ( ! pll_get_post_language( $progressnow_seed_front_id ) ) {
			pll_set_post_language( $progressnow_seed_front_id, 'en' );
		}

		$progressnow_seed_es_home = pll_get_post( $progressnow_seed_front_id, 'es' );
		if ( ! $progressnow_seed_es_home ) {
			$progressnow_seed_es_home = wp_insert_post( array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => 'Inicio',
				'post_name'    => 'inicio',
				'post_content' => get_post_field( 'post_content', $progressnow_seed_front_id ),
			), true );
			if ( is_wp_error( $progressnow_seed_es_home ) ) {
				progressnow_seed_log( 'ERROR es home: ' . $progressnow_seed_es_home->get_error_message() );
				$progressnow_seed_es_home = 0;
			} else {
				pll_set_post_language( $progressnow_seed_es_home, 'es' );
				pll_save_post_translations( array(
					'en' => $progressnow_seed_front_id,
					'es' => $progressnow_seed_es_home,
				) );
				$progressnow_seed_tmpl = get_post_meta( $progressnow_seed_front_id, '_wp_page_template', true );
				if ( $progressnow_seed_tmpl ) {
					update_post_meta( $progressnow_seed_es_home, '_wp_page_template', $progressnow_seed_tmpl );
				}
				progressnow_seed_log( "polylang: es home created (#{$progressnow_seed_es_home})" );
			}
		} else {
			progressnow_seed_log( "polylang: es home exists (#{$progressnow_seed_es_home})" );
		}

		// 6.9c — Spanish front-page ACF copy (mirrors the EN fields above).
		if ( $progressnow_seed_es_home ) {
			update_field( 'field_progressnow_hero_lede', 'Somos una organización dirigida por sus miembros que construye el poder de la clase trabajadora en nuestra comunidad.', $progressnow_seed_es_home );
			update_field( 'field_progressnow_hero_cta_primary_label', 'Únete', $progressnow_seed_es_home );
			update_field( 'field_progressnow_hero_cta_primary_url', '/get-involved/#join', $progressnow_seed_es_home );
			update_field( 'field_progressnow_hero_subhead', 'Luchamos por el futuro que nuestra comunidad merece.', $progressnow_seed_es_home );
			update_field( 'field_progressnow_hero_cta_secondary_label', '¿Nuevo miembro? Empieza con Progress Now 101. Inscríbete aquí', $progressnow_seed_es_home );
			update_field( 'field_progressnow_hero_cta_secondary_url', '/es/participa/', $progressnow_seed_es_home );

			update_field( 'field_progressnow_who_eyebrow', 'Quiénes somos', $progressnow_seed_es_home );
			// v3 who-we-are (Spanish drafts of the prototype copy, chapter-neutral).
			update_field( 'field_progressnow_who_heading', 'Somos <span class="notranslate">Progress Now</span>', $progressnow_seed_es_home );
			update_field( 'field_progressnow_who_p1', 'En nuestra comunidad estamos en la primera línea contra el fascismo. Tenemos multimillonarios en nuestro patio, a ICE en nuestros vecindarios y empleos que nos dejan sobrecargados y mal pagados.', $progressnow_seed_es_home );
			update_field( 'field_progressnow_who_p2', 'Pero no tiene por qué seguir así.', $progressnow_seed_es_home );
			update_field( 'field_progressnow_who_p3', "Juntos, construimos poder de la clase trabajadora en varios frentes para que cada persona de nuestra comunidad pueda vivir con dignidad, respeto y solidaridad. Organizamos nuestros lugares de trabajo y nuestra comunidad para asegurar que nuestro futuro sea para y por la clase trabajadora. Un mundo mejor es posible.\nVamos a ganar.", $progressnow_seed_es_home );
			update_field( 'field_progressnow_who_link_label', 'Más sobre nuestro capítulo', $progressnow_seed_es_home );
			update_field( 'field_progressnow_who_link_url', '/es/acerca-de/', $progressnow_seed_es_home );
			update_field( 'field_progressnow_cta_line', '¡Progreso ahora, no algún día!', $progressnow_seed_es_home );


			progressnow_seed_log( "polylang: es home ACF copy seeded (#{$progressnow_seed_es_home})" );
		}
	} else {
		progressnow_seed_log( 'WARN: no page_on_front — Spanish home not seeded' );
	}

	// 6.9d — UI string translations (chrome + home section labels / empty states).
	progressnow_seed_string_translations( 'es', array(
		'About'                  => 'Acerca de',
		'Calendar'               => 'Calendario',
		'Blog'                   => 'Blog',
		'Get Involved'           => 'Participa',
		'Join us'               => 'Únete',
		'Join'                  => 'Únete',
		'Join Now'              => 'Únete ahora',
		'Progress now, not someday!' => '¡Progreso ahora, no algún día!',
		'Volunteers working together at a community event' => 'Voluntarios trabajando juntos en un evento comunitario',
		'About the Chapter'      => 'Sobre el capítulo',
		'Mission & History'      => 'Misión e historia',
		'Where We Organize'      => 'Dónde organizamos',
		'Committees'             => 'Comités',
		'Bylaws & Code of Conduct' => 'Estatutos y código de conducta',
		'FAQ'                    => 'Preguntas frecuentes',
		// Chrome — skip link + footer bottom bar.
		'Skip to main content'   => 'Saltar al contenido principal',
		'Built to be accessible —' => 'Hecho para ser accesible —',
		'tell us how we can do better.' => 'dinos cómo podemos mejorar.',
		// Home v3 — headline + art alt text (inc/identity.php).
		'A better world is possible!' => '¡Un mundo mejor es posible!',
		'Chapter members gathered at a community action' => 'Miembros del capítulo reunidos en una acción comunitaria',
		'Chapter artwork' => 'Arte del capítulo',
		// Home v3 — headings, arrow links (no "→": the arrow is an SVG), empty states.
		'Upcoming events'        => 'Próximos eventos',
		'Full calendar'          => 'Calendario completo',
		'No events on the books yet' => 'Aún no hay eventos programados',
		'New meetings and actions land on the %s first — subscribe there and never miss one.' => 'Las nuevas reuniones y acciones aparecen primero en el %s — suscríbete allí y no te pierdas ninguna.',
		'calendar'               => 'calendario',
		'View event'             => 'Ver evento',
		'From the blog'          => 'Del blog',
		'All posts'              => 'Todas las publicaciones',
		'Read the post'          => 'Leer la publicación',
		'Posts coming soon'      => 'Publicaciones muy pronto',
		'The chapter is writing its first dispatches — check back shortly.' => 'El capítulo está escribiendo sus primeras publicaciones — vuelve pronto.',
		// Interior page chrome (page-about / page-get-involved / page.twig).
		'On this page'           => 'En esta página',
		'Related'                => 'Relacionado',
		'Document'               => 'Documento',
		'What it covers'         => 'Qué cubre',
		'Action'                 => 'Acción',
	) );

	// 6.9e — Spanish translations of the upcoming events (home teasers). Keyed
	// by English title so re-runs and ID shifts stay stable.
	$progressnow_seed_es_events = array(
		'Community Fridge Restock & Cleanup'        => 'Reabastecimiento y limpieza del refrigerador comunitario',
		'Know Your Rights at Work'                  => 'Conoce tus derechos en el trabajo',
		'July General Meeting'                      => 'Reunión general de julio',
		'Progress Now 101 (New Member Orientation)'          => 'Progress Now 101 (Orientación para nuevos miembros)',
		'Brake Light Clinic'                        => 'Clínica de luces de freno',
		'Candidate Endorsement Forum'               => 'Foro de respaldo a candidatos',
		'Reading Circle: A People’s Guide to Capitalism' => 'Círculo de lectura: una guía popular del capitalismo',
		'Paleta Social'                             => 'Convivio con paletas',
		'Picket Support Training'                   => 'Capacitación de apoyo a piquetes',
		'August General Meeting'                    => 'Reunión general de agosto',
		'School Supply Distro Prep'                 => 'Preparación de la distribución de útiles escolares',
		'Voter Registration Drive'                  => 'Jornada de registro de votantes',
		'Night School: Immigration & Labor'     => 'Escuela nocturna: migración y trabajo',
	);
	$progressnow_seed_en_events = get_posts( array(
		'post_type'   => 'event',
		'post_status' => 'publish',
		'numberposts' => -1,
		'lang'        => 'en',
	) );
	foreach ( $progressnow_seed_en_events as $progressnow_ev ) {
		$progressnow_title = html_entity_decode( $progressnow_ev->post_title, ENT_QUOTES, 'UTF-8' );
		if ( isset( $progressnow_seed_es_events[ $progressnow_title ] ) ) {
			progressnow_seed_translate_event( $progressnow_ev->ID, $progressnow_seed_es_events[ $progressnow_title ] );
		}
	}

	// 6.9f — Spanish translations of the interior pages (Calendar, Blog, About,
	// Get Involved). Each is a translated page pair carrying its EN template
	// (D9); internal link fields point at the /es/ slugs seeded here. Bylaws +
	// Privacy are intentionally deferred — their bodies are prose/legal copy
	// that needs human authoring (see the change docs).

	// Calendar — shell only (events are a language-filtered island); the ES lede
	// replaces the English Twig fallback.
	if ( $calendar_page_id ) {
		progressnow_seed_translate_page( $calendar_page_id, 'Calendario de eventos', 'calendario', array(
			'field_progressnow_interior_lede' => 'Reuniones, acciones, capacitaciones y convivios por toda nuestra comunidad. Todo es abierto al público a menos que se indique — trae a alguien.',
		) );
	}

	// Blog (page_for_posts) — Polylang resolves the ES posts page from the link.
	if ( $blog_page_id ) {
		progressnow_seed_translate_page( $blog_page_id, 'Blog', 'blog', array(
			'field_progressnow_interior_lede' => 'Noticias, análisis y crónicas de los organizadores del capítulo en toda nuestra comunidad.',
		) );
	}

	// About — full page ACF group in Spanish. Internal links use /es/ slugs.
	if ( $progressnow_seed_about_id ) {
		progressnow_seed_translate_page( $progressnow_seed_about_id, 'Sobre el capítulo', 'acerca-de', array(
			'field_progressnow_interior_lede'               => 'Un capítulo dirigido por sus miembros, organizando por la gente trabajadora en toda nuestra comunidad.',
			'field_progressnow_about_mission_eyebrow'       => 'En qué creemos',
			'field_progressnow_about_mission_body'          => 'Creemos que nuestra economía debe construirse democráticamente, por y para la gente trabajadora — no por los multimillonarios para su lucro.',
			'field_progressnow_about_chapter_heading'       => 'Sobre el capítulo',
			'field_progressnow_about_intro_p1'              => 'Somos un grupo organizador dirigido y financiado por sus miembros. Nuestro trabajo de base se enfoca en la organización laboral, la ayuda mutua y la educación política en toda nuestra comunidad.',
			'field_progressnow_about_intro_p2'              => 'Todo lo que hacemos es dirigido por los miembros, financiado por los miembros y abierto a cualquiera que quiera construir una comunidad que funcione para la gente trabajadora. Organizamos reuniones comunitarias con regularidad para compartir novedades, planear campañas y ofrecer charlas de educación política. Si eres estudiante, pregúntanos por nuestra rama universitaria.',
			'field_progressnow_about_ctas'                  => array(
				array( 'label' => 'Ven a una reunión', 'url' => '/es/calendario/' ),
				array( 'label' => 'Participa', 'url' => '/es/participa/' ),
				array( 'label' => 'Estudiantes', 'url' => '/es/participa/' ),
			),
			'field_progressnow_about_history_heading'       => 'Misión e historia',
			'field_progressnow_about_history_body'          => 'Luchamos por un futuro donde la vivienda, la salud y una vida digna estén garantizadas — y creemos que quienes viven y trabajan en nuestra comunidad deben ser quienes lo decidan. Nuestro trabajo se centra en tres pilares: la organización laboral, la ayuda mutua y la educación política.',
			'field_progressnow_about_timeline'              => array(
				array( 'year' => '1982', 'text' => 'Se funda Progress Now como un proyecto organizador dirigido por sus miembros.' ),
				array( 'year' => '20XX', 'text' => 'Organizadores locales forman un comité organizador y comienzan a reunirse. <em class="text-[#78716c]">(El capítulo completará el año y los detalles.)</em>' ),
				array( 'year' => '20XX', 'text' => 'El capítulo se constituye como capítulo local oficial. <em class="text-[#78716c]">(El capítulo completará el año y los detalles.)</em>' ),
			),
			'field_progressnow_about_counties_heading'      => 'Dónde organizamos',
			'field_progressnow_about_counties_intro'        => 'Un capítulo, muchas comunidades. Dondequiera que estés en nuestra comunidad, te tenemos cubierto — y si puedes ayudarnos a organizar más a fondo en tu vecindario, queremos saber de ti.',
			// Áreas de ejemplo — el capítulo las reemplaza en wp-admin.
			'field_progressnow_about_county_cards'          => array(
				array( 'name' => 'Centro', 'cities' => 'Centro · Zona media', 'note' => 'Base principal — aquí se realizan la mayoría de las reuniones' ),
				array( 'name' => 'Norte', 'cities' => 'Zona norte · Alta', 'note' => '' ),
				array( 'name' => 'Sur', 'cities' => 'Zona sur · Ribera', 'note' => '' ),
				array( 'name' => 'Campus', 'cities' => 'Rama estudiantil', 'note' => '' ),
			),
			'field_progressnow_about_committees_heading'     => 'Comités',
			'field_progressnow_about_committees_intro'       => 'Los comités son donde ocurre el trabajo. Cada uno se reúne con regularidad y da la bienvenida a nuevos miembros.',
			'field_progressnow_about_committees_link_label'  => 'Únete a un comité',
			'field_progressnow_about_committees_link_url'    => '/es/participa/#committees',
			'field_progressnow_about_governance_heading'     => 'Estatutos y código de conducta',
			'field_progressnow_about_governance_intro'       => 'El capítulo se gobierna por sus miembros a través de documentos que debatimos y votamos juntos. Todo es público.',
			'field_progressnow_about_governance_docs'        => array(
				array( 'title' => 'Estatutos del capítulo', 'covers' => 'Cómo funciona el capítulo: dirigentes, elecciones, quórum, comités y cómo se toman las decisiones.', 'action' => 'Leer', 'url' => '/bylaws-code-of-conduct/#documents' ),
				array( 'title' => 'Código de conducta', 'covers' => 'Lo que esperamos de cada quien en todos los espacios del capítulo: reuniones, acciones y en línea.', 'action' => 'Leer', 'url' => '/bylaws-code-of-conduct/#documents' ),
				array( 'title' => 'Política de quejas', 'covers' => 'Cómo reportar un daño y cómo el capítulo maneja los conflictos, de forma confidencial y justa.', 'action' => 'Leer', 'url' => '/bylaws-code-of-conduct/#grievance' ),
				array( 'title' => 'Actas de reuniones', 'covers' => 'Registros y resoluciones de las reuniones generales, disponibles para todos los miembros.', 'action' => 'Explorar', 'url' => '/bylaws-code-of-conduct/#documents' ),
			),
			'field_progressnow_about_faq_heading'           => 'Preguntas frecuentes',
			'field_progressnow_about_faq'                   => array(
				array( 'question' => '¿Tengo que ser miembro para asistir a los eventos?', 'answer' => 'No — la mayoría de nuestros eventos son abiertos a todo el mundo. Ven a un 101 o a un convivio, conoce a la gente y ve si es para ti.' ),
				array( 'question' => '¿Cuánto son las cuotas?', 'answer' => 'Las cuotas son de escala móvil — la mayoría paga unos pocos dólares al mes. A nadie se le rechaza por no poder pagar.' ),
				array( 'question' => '¿Cómo cambio mi cuota?', 'answer' => 'Ingresa el correo asociado a tu membresía en el formulario de cuotas con tu nuevo monto, y tu cuota actual se cancelará y se actualizará.' ),
				array( 'question' => 'Nunca he participado en algo político. ¿Está bien?', 'answer' => 'Más que bien — es lo normal. La mayoría de los miembros se unieron sin experiencia organizando. Progress Now 101 existe justo para esto.' ),
				array( 'question' => '¿Puedo participar sin ser visible públicamente?', 'answer' => 'Sí. Hay muchas maneras de contribuir tras bambalinas, y tomamos en serio la privacidad y la seguridad de los miembros.' ),
				array( 'question' => '¿Cuánto tiempo requiere la membresía?', 'answer' => 'Tanto o tan poco como tengas. Algunos miembros asisten a un evento al mes; otros ayudan a dirigir comités.' ),
			),
			'field_progressnow_about_dues_heading'          => '¿Cambiando tu cuota?',
			'field_progressnow_about_dues_body'             => '¿Ya eres miembro y quieres cambiar tu cuota? Ingresa el correo asociado a tu membresía en el formulario de cuotas con tu nuevo monto, y tu cuota actual se cancelará y se actualizará.',
		) );
	}

	// Get Involved — full page ACF group in Spanish.
	if ( $progressnow_seed_gi_id ) {
		progressnow_seed_translate_page( $progressnow_seed_gi_id, 'Participa', 'participa', array(
			'field_progressnow_interior_lede'        => 'No se necesita experiencia ni una política perfecta. Si quieres un mundo mejor, aquí hay un lugar para ti.',
			'field_progressnow_gi_join_heading'      => 'Cómo unirte',
			'field_progressnow_gi_steps'             => array(
				array( 'title' => 'Hazte miembro', 'body' => 'Regístrate en unos minutos. Las cuotas son de escala móvil — paga lo que puedas, y <strong>a nadie se le rechaza por falta de fondos</strong>.', 'link_label' => 'Únete ahora →', 'link_url' => '/get-involved/#join' ),
				array( 'title' => 'Ven a Progress Now 101', 'body' => 'Nuestra sesión introductoria para gente nueva y curiosa: qué defendemos, en qué trabaja nuestro capítulo y cómo sumarte. Se ofrece virtual y en persona, varias veces al mes. No tienes que ser miembro todavía para asistir.', 'link_label' => 'Encuentra una sesión →', 'link_url' => '/es/calendario/' ),
				array( 'title' => 'Recibe orientación y súmate', 'body' => 'Después del 101, te agregamos a nuestro WhatsApp y te conectamos con un comité que se ajuste a tus intereses y tu disponibilidad — ya sea una hora al mes o una noche a la semana.', 'link_label' => 'Explora los comités ↓', 'link_url' => '#committees' ),
			),
			'field_progressnow_gi_committees_heading' => 'Comités',
			'field_progressnow_gi_committees_intro'   => 'Los comités son donde ocurre el trabajo. Cada uno se reúne con regularidad y da la bienvenida a nuevos miembros — comunícate por el WhatsApp o en cualquier reunión general.',
			'field_progressnow_gi_channels_heading'  => 'Canales de comunicación',
			'field_progressnow_gi_channels'          => array(
				array( 'label' => 'WhatsApp', 'desc' => 'Nuestro canal principal — los miembros reciben una invitación durante la orientación', 'link_label' => '', 'url' => '', 'badge' => 'Solo miembros' ),
				array( 'label' => 'Correo', 'desc' => 'Preguntas, prensa y cualquier otra cosa', 'link_label' => 'Escríbenos', 'url' => 'mailto:hello@example.org', 'badge' => '' ),
			),
			'field_progressnow_gi_faq_heading'       => 'Preguntas comunes',
			'field_progressnow_gi_faq'               => array(
				array( 'question' => '¿Tengo que ser miembro para asistir a los eventos?', 'answer' => 'No — la mayoría de nuestros eventos son abiertos a todo el mundo. Ven a un 101 o a un convivio, conoce a la gente y ve si es para ti. Sin presión.' ),
				array( 'question' => '¿Cuánto son las cuotas?', 'answer' => 'Las cuotas son de escala móvil — la mayoría paga unos pocos dólares al mes. Si las cuotas son un obstáculo, háblanos: a nadie se le rechaza por falta de fondos.' ),
				array( 'question' => 'Nunca he participado en algo político. ¿Está bien?', 'answer' => 'Más que bien — es lo normal. La mayoría de los miembros se unieron sin experiencia organizando. Progress Now 101 existe justo para esto, y los comités te enseñarán todo sobre la marcha.' ),
				array( 'question' => '¿Puedo participar sin ser visible públicamente?', 'answer' => 'Sí. Hay muchas maneras de contribuir tras bambalinas, y tomamos en serio la privacidad y la seguridad de los miembros. Háblanos sobre con qué te sientes cómodo.' ),
				array( 'question' => '¿Cuánto tiempo requiere la membresía?', 'answer' => 'Tanto o tan poco como tengas. Algunos miembros asisten a un evento al mes; otros ayudan a dirigir comités. La disponibilidad cambia — está bien. El trabajo es una maratón, no un sprint.' ),
			),
			'field_progressnow_gi_card_heading'      => '¿Con ganas de empezar ya?',
			'field_progressnow_gi_card_body'         => 'Hacerte miembro toma cinco minutos, y las cuotas son de paga-lo-que-puedas.',
			'field_progressnow_gi_card_link_label'   => 'Únete',
			'field_progressnow_gi_card_link_url'     => '/get-involved/#join',
			'field_progressnow_gi_related_links'     => array(
				array( 'label' => 'Calendario de eventos', 'url' => '/es/calendario/' ),
				array( 'label' => 'Estatutos y código de conducta', 'url' => '/bylaws-code-of-conduct/' ),
				array( 'label' => 'Misión e historia', 'url' => '/es/acerca-de/#mission' ),
			),
		) );
	}
} else {
	progressnow_seed_log( 'WARN: Polylang not active — Spanish home / strings not seeded' );
}

/* -------------------------------------------------------------------------
 * 7. Rewrites (event CPT + chapter-events feed need a flush).
 * ---------------------------------------------------------------------- */

flush_rewrite_rules();
progressnow_seed_log( 'rewrite rules flushed' );
progressnow_seed_log( 'SEED COMPLETE' );
