<?php
/**
 * Editor preview only — the front end renders the `person_quote` PostBlock
 * contract via the SinglePost island (BlockPersonQuote.vue).
 */

$photo_id    = (int) get_field( 'photo' );
$quote       = (string) get_field( 'quote' );
$translation = (string) get_field( 'translation' );
$name        = (string) get_field( 'name' );
$role        = (string) get_field( 'role' );
?>
<figure style="display:flex;gap:1rem;align-items:flex-start;padding:1rem;border:1px solid #ddd;border-radius:12px;">
	<?php if ( $photo_id ) : ?>
		<?php echo wp_get_attachment_image( $photo_id, 'thumbnail', false, array( 'style' => 'border-radius:50%;width:56px;height:56px;object-fit:cover;' ) ); ?>
	<?php endif; ?>
	<div>
		<blockquote style="margin:0;font-weight:600;"><?php echo esc_html( $quote ? $quote : 'Person quote…' ); ?></blockquote>
		<?php if ( $translation ) : ?>
			<p style="margin:0.25rem 0 0;color:#666;font-style:italic;"><?php echo esc_html( $translation ); ?></p>
		<?php endif; ?>
		<figcaption style="margin-top:0.5rem;font-size:0.85em;color:#666;">
			<?php echo esc_html( trim( $name . ( $role ? ' · ' . $role : '' ) ) ); ?>
		</figcaption>
	</div>
</figure>
