<?php
if (!defined('WORDFENCE_LS_VERSION')) { exit; }
/**
 * @var array $tabs An array of Tab instances. Required.
 */
?>
<div class="wfls-row wfls-tab-container">
	<div class="wfls-col-xs-12">
		<div class="wp-header-end"></div>
		<ul class="wfls-page-tabs">
			<li class="wfls-header-icon"></li>
			<?php foreach ($tabs as $t): ?>
				<?php
				$a = $t->a;
				if (!preg_match('/^https?:\/\//i', $a)) {
					$a = '#top#' . urlencode($a);
				}
				$mobileTabTitle = $t->mobileTabTitle;
				?>
				<li class="wfls-tab" id="wfls-tab-<?php echo esc_attr($t->id); ?>" data-target="<?php echo esc_attr($t->id); ?>" data-page-title="<?php echo esc_attr($t->pageTitle); ?>">
					<a href="<?php echo esc_url($a); ?>"<?php if ($mobileTabTitle !== null && $mobileTabTitle !== ''): ?> aria-label="<?php echo esc_attr($t->tabTitle); ?>"<?php endif; ?>>
						<?php if ($mobileTabTitle !== null && $mobileTabTitle !== ''): ?>
							<span class="wfls-hidden-xs" aria-hidden="true"><?php echo esc_html($t->tabTitle); ?></span>
							<span class="wfls-visible-xs-inline" aria-hidden="true"><?php echo esc_html($mobileTabTitle); ?></span>
						<?php else: ?>
							<?php echo esc_html($t->tabTitle); ?>
						<?php endif; ?>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</div>
