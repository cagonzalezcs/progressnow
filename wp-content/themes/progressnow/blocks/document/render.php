<?php
/**
 * Editor preview only — the front end renders the `document` PostBlock
 * contract via the SinglePost island (BlockDocument.vue).
 */

$file_id     = (int) get_field( 'file' );
$title       = (string) get_field( 'title' );
$description = (string) get_field( 'description' );
$file_url    = $file_id ? wp_get_attachment_url( $file_id ) : '';
?>
<div style="display:flex;gap:0.75rem;align-items:center;padding:1rem;border:1px solid #ddd;border-radius:12px;">
	<span style="font-size:1.5rem;">📄</span>
	<div>
		<p style="margin:0;font-weight:600;"><?php echo esc_html( $title ? $title : 'Document title…' ); ?></p>
		<?php if ( $description ) : ?>
			<p style="margin:0;font-size:0.85em;color:#666;"><?php echo esc_html( $description ); ?></p>
		<?php endif; ?>
		<?php if ( $file_url ) : ?>
			<p style="margin:0;font-size:0.85em;"><a href="<?php echo esc_url( $file_url ); ?>">Download</a></p>
		<?php endif; ?>
	</div>
</div>
