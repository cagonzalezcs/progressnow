<?php
/**
 * Editor preview only — the front end renders the `action_callout` PostBlock
 * contract via the SinglePost island (BlockActionCallout.vue).
 */

$heading = (string) get_field( 'heading' );
$body    = (string) get_field( 'body' );
$buttons = get_field( 'buttons' );
?>
<div style="padding:1.25rem;border:2px solid #b5121b;border-radius:12px;">
	<p style="margin:0;font-weight:700;font-size:1.1em;"><?php echo esc_html( $heading ? $heading : 'Action callout heading…' ); ?></p>
	<?php if ( $body ) : ?>
		<p style="margin:0.5rem 0 0;color:#444;"><?php echo esc_html( $body ); ?></p>
	<?php endif; ?>
	<?php if ( is_array( $buttons ) && $buttons ) : ?>
		<p style="margin:0.75rem 0 0;">
			<?php foreach ( $buttons as $button ) : ?>
				<span style="display:inline-block;margin-right:0.5rem;padding:0.4rem 1rem;border:2px solid #b5121b;border-radius:999px;font-weight:600;<?php echo 'outline' === ( $button['style'] ?? '' ) ? '' : 'background:#b5121b;color:#fff;'; ?>">
					<?php echo esc_html( (string) ( $button['label'] ?? '' ) ); ?>
				</span>
			<?php endforeach; ?>
		</p>
	<?php endif; ?>
</div>
