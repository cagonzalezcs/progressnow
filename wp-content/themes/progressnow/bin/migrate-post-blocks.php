<?php
/**
 * One-shot migration: ACF `post_blocks` flexible-content rows → native
 * Gutenberg block markup in post_content.
 *
 * Run:
 *   wp eval-file wp-content/themes/progressnow/bin/migrate-post-blocks.php [dry]
 * (or require from any WP-loaded PHP context; set $args = array( 'dry' )
 * or PROGRESSNOW_MIGRATE_DRY=1 in the environment for a dry run).
 *
 * Idempotent: posts where has_blocks() is already true are skipped. ACF
 * meta is NOT deleted (rollback: revert post_content and the legacy
 * serializer path takes over). Migrated posts are stamped
 * `_progressnow_blocks_migrated`.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit( "Run via: wp eval-file bin/migrate-post-blocks.php [dry]\n" );
}

$progressnow_migrate_dry = ( isset( $args ) && in_array( 'dry', (array) $args, true ) ) || getenv( 'PROGRESSNOW_MIGRATE_DRY' );

function progressnow_migrate_log( $msg ) {
	echo $msg . "\n";
}

if ( ! function_exists( 'get_field' ) ) {
	progressnow_migrate_log( 'FATAL: ACF is not active (get_field missing). Aborting.' );
	return;
}

// CLI contexts run capability-less; the kses save filters would backslash-
// escape the block comment JSON on wp_update_post and corrupt every block.
kses_remove_filters();

/* -------------------------------------------------------------------------
 * Prose HTML → core block arrays (split by top-level tag; core/html catch-all).
 * ---------------------------------------------------------------------- */

function progressnow_migrate_static_block( $name, $html, $attrs = array() ) {
	return array(
		'blockName'    => $name,
		'attrs'        => $attrs,
		'innerBlocks'  => array(),
		'innerHTML'    => $html,
		'innerContent' => array( $html ),
	);
}

function progressnow_migrate_container_block( $name, $open, $close, $inner_blocks, $attrs = array() ) {
	return array(
		'blockName'    => $name,
		'attrs'        => $attrs,
		'innerBlocks'  => $inner_blocks,
		'innerHTML'    => $open . $close,
		'innerContent' => array_merge( array( $open ), array_fill( 0, count( $inner_blocks ), null ), array( $close ) ),
	);
}

/**
 * Inner HTML of a DOM node (children only).
 */
function progressnow_migrate_inner_html( DOMNode $node ) {
	$html = '';
	foreach ( $node->childNodes as $child ) {
		$html .= $node->ownerDocument->saveHTML( $child );
	}
	return $html;
}

function progressnow_migrate_prose_to_blocks( $html ) {
	$html = trim( (string) $html );
	if ( '' === $html ) {
		return array();
	}

	$doc = new DOMDocument();
	libxml_use_internal_errors( true );
	$loaded = $doc->loadHTML(
		'<?xml encoding="utf-8"?><body>' . $html . '</body>',
		LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
	);
	libxml_clear_errors();

	$body = $doc->getElementsByTagName( 'body' )->item( 0 );
	if ( ! $loaded || ! $body ) {
		return array( progressnow_migrate_static_block( 'core/html', $html ) );
	}

	$blocks = array();

	foreach ( $body->childNodes as $node ) {
		if ( XML_TEXT_NODE === $node->nodeType ) {
			$text = trim( $node->textContent );
			if ( '' !== $text ) {
				$blocks[] = progressnow_migrate_static_block( 'core/paragraph', '<p>' . esc_html( $text ) . '</p>' );
			}
			continue;
		}
		if ( XML_ELEMENT_NODE !== $node->nodeType ) {
			continue;
		}

		$tag   = strtolower( $node->nodeName );
		$inner = progressnow_migrate_inner_html( $node );

		switch ( $tag ) {
			case 'p':
				$blocks[] = progressnow_migrate_static_block( 'core/paragraph', '<p>' . $inner . '</p>' );
				break;

			case 'h2':
			case 'h3':
			case 'h4':
				$level    = (int) substr( $tag, 1 );
				$attrs    = 2 === $level ? array() : array( 'level' => $level );
				$blocks[] = progressnow_migrate_static_block(
					'core/heading',
					"<{$tag} class=\"wp-block-heading\">" . $inner . "</{$tag}>",
					$attrs
				);
				break;

			case 'ul':
			case 'ol':
				$items = array();
				foreach ( $node->childNodes as $li ) {
					if ( XML_ELEMENT_NODE === $li->nodeType && 'li' === strtolower( $li->nodeName ) ) {
						$items[] = progressnow_migrate_static_block( 'core/list-item', '<li>' . progressnow_migrate_inner_html( $li ) . '</li>' );
					}
				}
				$attrs    = 'ol' === $tag ? array( 'ordered' => true ) : array();
				$blocks[] = progressnow_migrate_container_block(
					'core/list',
					"<{$tag} class=\"wp-block-list\">",
					"</{$tag}>",
					$items,
					$attrs
				);
				break;

			case 'blockquote':
				$grafs = array();
				foreach ( $node->childNodes as $child ) {
					if ( XML_ELEMENT_NODE === $child->nodeType && 'p' === strtolower( $child->nodeName ) ) {
						$grafs[] = progressnow_migrate_static_block( 'core/paragraph', '<p>' . progressnow_migrate_inner_html( $child ) . '</p>' );
					}
				}
				if ( ! $grafs ) {
					$grafs[] = progressnow_migrate_static_block( 'core/paragraph', '<p>' . $inner . '</p>' );
				}
				$blocks[] = progressnow_migrate_container_block(
					'core/quote',
					'<blockquote class="wp-block-quote">',
					'</blockquote>',
					$grafs
				);
				break;

			default:
				// Unrecognized top-level markup keeps full fidelity as core/html.
				$blocks[] = progressnow_migrate_static_block( 'core/html', $doc->saveHTML( $node ) );
		}
	}

	return $blocks;
}

/* -------------------------------------------------------------------------
 * ACF rows → block arrays.
 * ---------------------------------------------------------------------- */

/**
 * Void ACF block (progressnow/*) with flat `data` + field-key refs, matching
 * what ACF writes when the block is saved in the editor.
 */
function progressnow_migrate_acf_block( $name, $data ) {
	return array(
		'blockName'    => $name,
		'attrs'        => array(
			'name' => $name,
			'data' => $data,
			'mode' => 'preview',
		),
		'innerBlocks'  => array(),
		'innerHTML'    => '',
		'innerContent' => array(),
	);
}

/** ACF image/file value (array | ID | '') → attachment ID. */
function progressnow_migrate_attachment_id( $value ) {
	if ( is_array( $value ) ) {
		return (int) ( $value['ID'] ?? $value['id'] ?? 0 );
	}
	return (int) $value;
}

/**
 * core/image block from a legacy image row (id may be 0 — the src-less
 * markup still carries alt/caption for the island's placeholder slot).
 */
function progressnow_migrate_image_block( $attachment_id, $alt, $caption, $breakout = false, $credit = '' ) {
	$src = $attachment_id ? wp_get_attachment_image_url( $attachment_id, 'large' ) : '';

	// Credit travels with the attachment from here on.
	if ( $attachment_id && '' !== $credit && '' === (string) get_post_meta( $attachment_id, 'credit', true ) ) {
		update_post_meta( $attachment_id, 'credit', $credit );
	}

	$attrs = array( 'sizeSlug' => 'large', 'linkDestination' => 'none' );
	if ( $attachment_id ) {
		$attrs['id'] = $attachment_id;
	}
	$class = 'wp-block-image size-large';
	if ( $breakout ) {
		$attrs['align'] = 'full';
		$class         .= ' alignfull';
	}

	$img  = '<img' . ( $src ? ' src="' . esc_url( $src ) . '"' : '' ) . ' alt="' . esc_attr( $alt ) . '"'
		. ( $attachment_id ? ' class="wp-image-' . $attachment_id . '"' : '' ) . '/>';
	$html = '<figure class="' . $class . '">' . $img
		. ( '' !== $caption ? '<figcaption class="wp-element-caption">' . esc_html( $caption ) . '</figcaption>' : '' )
		. '</figure>';

	return progressnow_migrate_static_block( 'core/image', $html, $attrs );
}

function progressnow_migrate_rows_to_blocks( $rows ) {
	$blocks = array();

	foreach ( (array) $rows as $row ) {
		switch ( $row['acf_fc_layout'] ?? '' ) {
			case 'prose':
				$blocks = array_merge( $blocks, progressnow_migrate_prose_to_blocks( $row['content'] ?? '' ) );
				break;

			case 'image':
				$blocks[] = progressnow_migrate_image_block(
					progressnow_migrate_attachment_id( $row['image'] ?? 0 ),
					(string) ( $row['alt_text'] ?? '' ),
					trim( (string) ( $row['caption'] ?? '' ) ),
					! empty( $row['breakout'] ),
					trim( (string) ( $row['credit'] ?? '' ) )
				);
				break;

			case 'pull_quote':
				$quote       = trim( (string) ( $row['quote'] ?? '' ) );
				$attribution = trim( (string) ( $row['attribution'] ?? '' ) );
				$html        = '<figure class="wp-block-pullquote"><blockquote><p>' . esc_html( $quote ) . '</p>'
					. ( '' !== $attribution ? '<cite>' . esc_html( $attribution ) . '</cite>' : '' )
					. '</blockquote></figure>';
				$blocks[]    = progressnow_migrate_static_block( 'core/pullquote', $html );
				break;

			case 'gallery':
				$images = array();
				foreach ( (array) ( $row['images'] ?? array() ) as $img_row ) {
					$images[] = progressnow_migrate_image_block(
						progressnow_migrate_attachment_id( $img_row['image'] ?? 0 ),
						(string) ( $img_row['alt_text'] ?? '' ),
						trim( (string) ( $img_row['caption'] ?? '' ) )
					);
				}
				$is_grid  = 'grid' === ( $row['layout'] ?? '' );
				$attrs    = array( 'linkTo' => 'none' );
				$class    = 'wp-block-gallery has-nested-images columns-default is-cropped';
				if ( $is_grid ) {
					$attrs['className'] = 'is-style-grid';
					$class             .= ' is-style-grid';
				}
				$blocks[] = progressnow_migrate_container_block(
					'core/gallery',
					'<figure class="' . $class . '">',
					'</figure>',
					$images,
					$attrs
				);
				break;

			case 'person_quote':
				$blocks[] = progressnow_migrate_acf_block(
					'progressnow/person-quote',
					array(
						'photo'        => progressnow_migrate_attachment_id( $row['photo'] ?? 0 ),
						'_photo'       => 'field_progressnow_block_pq_photo',
						'alt_text'     => (string) ( $row['alt_text'] ?? '' ),
						'_alt_text'    => 'field_progressnow_block_pq_alt_text',
						'quote'        => (string) ( $row['quote'] ?? '' ),
						'_quote'       => 'field_progressnow_block_pq_quote',
						'translation'  => (string) ( $row['translation'] ?? '' ),
						'_translation' => 'field_progressnow_block_pq_translation',
						'name'         => (string) ( $row['name'] ?? '' ),
						'_name'        => 'field_progressnow_block_pq_name',
						'role'         => (string) ( $row['role'] ?? '' ),
						'_role'        => 'field_progressnow_block_pq_role',
						'lang'         => 'es' === ( $row['lang'] ?? '' ) ? 'es' : 'en',
						'_lang'        => 'field_progressnow_block_pq_lang',
					)
				);
				break;

			case 'video':
				$blocks[] = progressnow_migrate_acf_block(
					'progressnow/video',
					array(
						'url'             => (string) ( $row['url'] ?? '' ),
						'_url'            => 'field_progressnow_block_video_url',
						'poster'          => progressnow_migrate_attachment_id( $row['poster'] ?? 0 ),
						'_poster'         => 'field_progressnow_block_video_poster',
						'caption'         => (string) ( $row['caption'] ?? '' ),
						'_caption'        => 'field_progressnow_block_video_caption',
						'transcript_url'  => (string) ( $row['transcript_url'] ?? '' ),
						'_transcript_url' => 'field_progressnow_block_video_transcript_url',
					)
				);
				break;

			case 'audio':
				$blocks[] = progressnow_migrate_acf_block(
					'progressnow/audio',
					array(
						'file'        => progressnow_migrate_attachment_id( $row['file'] ?? 0 ),
						'_file'       => 'field_progressnow_block_audio_file',
						'title'       => (string) ( $row['title'] ?? '' ),
						'_title'      => 'field_progressnow_block_audio_title',
						'duration'    => (string) ( $row['duration'] ?? '' ),
						'_duration'   => 'field_progressnow_block_audio_duration',
						'transcript'  => progressnow_migrate_attachment_id( $row['transcript'] ?? 0 ),
						'_transcript' => 'field_progressnow_block_audio_transcript',
					)
				);
				break;

			case 'document':
				$blocks[] = progressnow_migrate_acf_block(
					'progressnow/document',
					array(
						'file'         => progressnow_migrate_attachment_id( $row['file'] ?? 0 ),
						'_file'        => 'field_progressnow_block_document_file',
						'title'        => (string) ( $row['title'] ?? '' ),
						'_title'       => 'field_progressnow_block_document_title',
						'description'  => (string) ( $row['description'] ?? '' ),
						'_description' => 'field_progressnow_block_document_description',
					)
				);
				break;

			case 'event_embed':
				$ids      = array_filter( array_map( 'progressnow_migrate_attachment_id', (array) ( $row['event'] ?? array() ) ) );
				$blocks[] = progressnow_migrate_acf_block(
					'progressnow/event-embed',
					array(
						'event'  => $ids ? (int) reset( $ids ) : 0,
						'_event' => 'field_progressnow_block_event_embed_event',
					)
				);
				break;

			case 'action_callout':
				$data = array(
					'heading'  => (string) ( $row['heading'] ?? '' ),
					'_heading' => 'field_progressnow_block_ac_heading',
					'body'     => (string) ( $row['body'] ?? '' ),
					'_body'    => 'field_progressnow_block_ac_body',
				);
				$i    = 0;
				foreach ( (array) ( $row['buttons'] ?? array() ) as $btn ) {
					$data[ "buttons_{$i}_label" ]  = (string) ( $btn['label'] ?? '' );
					$data[ "_buttons_{$i}_label" ] = 'field_progressnow_block_ac_btn_label';
					$data[ "buttons_{$i}_url" ]    = (string) ( $btn['url'] ?? '' );
					$data[ "_buttons_{$i}_url" ]   = 'field_progressnow_block_ac_btn_url';
					$data[ "buttons_{$i}_style" ]  = (string) ( $btn['style'] ?? 'primary' );
					$data[ "_buttons_{$i}_style" ] = 'field_progressnow_block_ac_btn_style';
					$i++;
				}
				$data['buttons']  = $i;
				$data['_buttons'] = 'field_progressnow_block_ac_buttons';
				$blocks[]         = progressnow_migrate_acf_block( 'progressnow/action-callout', $data );
				break;
		}
	}

	return $blocks;
}

/* -------------------------------------------------------------------------
 * Main loop.
 * ---------------------------------------------------------------------- */

$progressnow_migrate_posts = get_posts(
	array(
		'post_type'      => 'post',
		'post_status'    => 'any',
		'posts_per_page' => -1,
		'orderby'        => 'ID',
		'order'          => 'ASC',
	)
);

progressnow_migrate_log( ( $progressnow_migrate_dry ? 'DRY RUN — ' : '' ) . count( $progressnow_migrate_posts ) . ' posts to inspect' );

foreach ( $progressnow_migrate_posts as $progressnow_migrate_post ) {
	$label = "#{$progressnow_migrate_post->ID} {$progressnow_migrate_post->post_name}";

	if ( has_blocks( $progressnow_migrate_post ) ) {
		progressnow_migrate_log( "skip (already blocks): {$label}" );
		continue;
	}

	$rows = get_field( 'post_blocks', $progressnow_migrate_post->ID );
	if ( ! is_array( $rows ) || ! $rows ) {
		// No ACF body: wrap whatever post_content holds as prose blocks so
		// the post still becomes a block post (search parity).
		$blocks = progressnow_migrate_prose_to_blocks( $progressnow_migrate_post->post_content );
		if ( ! $blocks ) {
			progressnow_migrate_log( "skip (no body at all): {$label}" );
			continue;
		}
		progressnow_migrate_log( "note (no ACF rows — wrapping post_content): {$label}" );
	} else {
		$blocks = progressnow_migrate_rows_to_blocks( $rows );
	}

	$markup = serialize_blocks( $blocks );

	if ( $progressnow_migrate_dry ) {
		progressnow_migrate_log( "----- would migrate {$label} (" . count( $blocks ) . " top-level blocks) -----" );
		progressnow_migrate_log( $markup );
		continue;
	}

	$result = wp_update_post(
		array(
			'ID'           => $progressnow_migrate_post->ID,
			'post_content' => wp_slash( $markup ),
		),
		true
	);

	if ( is_wp_error( $result ) ) {
		progressnow_migrate_log( "ERROR {$label}: " . $result->get_error_message() );
		continue;
	}

	update_post_meta( $progressnow_migrate_post->ID, '_progressnow_blocks_migrated', current_time( 'mysql' ) );
	progressnow_migrate_log( "migrated: {$label} (" . count( $blocks ) . ' top-level blocks; ACF meta retained)' );
}

progressnow_migrate_log( 'MIGRATION ' . ( $progressnow_migrate_dry ? 'DRY RUN ' : '' ) . 'COMPLETE' );
