<?php
/**
 * Editor preview only — the front end renders the `audio` PostBlock contract
 * via the SinglePost island (BlockAudio.vue).
 */

$file_id  = (int) get_field( 'file' );
$title    = (string) get_field( 'title' );
$duration = (string) get_field( 'duration' );
$file_url = $file_id ? wp_get_attachment_url( $file_id ) : '';
?>
<div style="padding:1rem;border:1px solid #ddd;border-radius:12px;">
	<p style="margin:0;font-weight:600;">🔊 <?php echo esc_html( $title ? $title : 'Audio title…' ); ?><?php echo $duration ? esc_html( ' · ' . $duration ) : ''; ?></p>
	<?php if ( $file_url ) : ?>
		<audio controls src="<?php echo esc_url( $file_url ); ?>" style="width:100%;margin-top:0.5rem;"></audio>
	<?php endif; ?>
</div>
