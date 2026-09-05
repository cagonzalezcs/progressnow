<?php
/**
 * Editor preview only — the front end renders the `event_embed` PostBlock
 * contract via the SinglePost island (BlockEventEmbed.vue).
 */

$event_id   = (int) get_field( 'event' );
$event_post = $event_id ? get_post( $event_id ) : null;
?>
<div style="padding:1rem;border:1px solid #ddd;border-radius:12px;">
	<?php if ( $event_post && 'publish' === $event_post->post_status ) : ?>
		<p style="margin:0;font-size:0.75em;color:#666;text-transform:uppercase;letter-spacing:0.06em;">Upcoming event</p>
		<p style="margin:0;font-weight:600;">📅 <?php echo esc_html( get_the_title( $event_post ) ); ?></p>
	<?php elseif ( $event_post ) : ?>
		<p style="margin:0;color:#666;">📅 <?php echo esc_html( get_the_title( $event_post ) ); ?> — not published; renders a “no longer scheduled” card.</p>
	<?php else : ?>
		<p style="margin:0;color:#666;">📅 Pick an event…</p>
	<?php endif; ?>
</div>
