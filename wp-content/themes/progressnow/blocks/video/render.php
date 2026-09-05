<?php
/**
 * Editor preview only — the front end renders the `video` PostBlock contract
 * via the SinglePost island (BlockVideo.vue).
 */

$url            = (string) get_field( 'url' );
$poster_id      = (int) get_field( 'poster' );
$caption        = (string) get_field( 'caption' );
$transcript_url = (string) get_field( 'transcript_url' );
?>
<figure style="padding:1rem;border:1px solid #ddd;border-radius:12px;">
	<?php if ( $poster_id ) : ?>
		<?php echo wp_get_attachment_image( $poster_id, 'medium', false, array( 'style' => 'width:100%;height:auto;border-radius:8px;' ) ); ?>
	<?php endif; ?>
	<p style="margin:0.5rem 0 0;font-weight:600;">▶ <?php echo esc_html( $url ? $url : 'Video URL…' ); ?></p>
	<?php if ( $caption ) : ?>
		<figcaption style="margin-top:0.25rem;font-size:0.85em;color:#666;"><?php echo esc_html( $caption ); ?></figcaption>
	<?php endif; ?>
	<?php if ( $transcript_url ) : ?>
		<p style="margin:0.25rem 0 0;font-size:0.85em;"><a href="<?php echo esc_url( $transcript_url ); ?>">Transcript</a></p>
	<?php endif; ?>
</figure>
