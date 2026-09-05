<?php
if (!defined('WORDFENCE_LS_VERSION')) { exit; }
/**
 * @var \WP_User $user The user being edited. Required.
 * @var bool $gracePeriod Whether the user is currently in the passkey grace period. Required.
 * @var bool $lockedOut Whether the user is currently locked out for a missing passkey. Required.
 * @var int $requiredAt The passkey requirement activation time. Required.
 */

$ownAccount = false;
$ownUser = wp_get_current_user();
if ($ownUser->ID == $user->ID) {
	$ownAccount = true;
}
$canManageGracePeriod = current_user_can(\WordfenceLS\Controller_Permissions::CAP_MANAGE_SETTINGS);
$defaultGracePeriod = \WordfenceLS\Controller_Settings::shared()->get_user_passkey_grace_period();
?>
<div class="wfls-block wfls-always-active wfls-flex-item-full-width">
	<div class="wfls-block-header wfls-block-header-border-bottom">
		<div class="wfls-block-header-content">
			<div class="wfls-block-title">
				<strong><?php echo $gracePeriod ? esc_html__('Grace Period', 'wordfence') : esc_html__('Locked Out', 'wordfence'); ?></strong>
			</div>
		</div>
	</div>
	<div class="wfls-block-content">
		<?php if ($gracePeriod): ?>
			<p><?php
				$requiredDateFormatted = \WordfenceLS\Controller_Time::format_local_time('F j, Y g:i A', $requiredAt);
				echo $ownAccount
					? sprintf(wp_kses(/* translators: Date */ __('Passkey authentication will be required for your account beginning <strong>%s</strong>.', 'wordfence'), array('strong' => array())), $requiredDateFormatted)
					: sprintf(wp_kses(/* translators: 1. Username; 2. Date */ __('Passkey authentication will be required for user <strong>%1$s</strong> beginning <strong>%2$s</strong>.', 'wordfence'), array('strong' => array())), esc_html($user->user_login), $requiredDateFormatted);
			?></p>
			<?php if ($canManageGracePeriod && \WordfenceLS\Controller_Users::shared()->has_revokable_grace_period($user)): ?>
				<?php echo \WordfenceLS\Model_View::create('common/revoke-grace-period', array(
					'user' => $user,
					'idPrefix' => 'wfls-passkey-',
				))->render(); ?>
			<?php endif; ?>
		<?php else: ?>
			<p>
				<?php echo $ownAccount
					? esc_html__('A passkey is required for your account, but has not been configured.', 'wordfence')
					: esc_html__('A passkey is required for this account, but has not been configured.', 'wordfence'); ?>
			</p>
			<?php if ($canManageGracePeriod): ?>
				<?php echo \WordfenceLS\Model_View::create('common/reset-grace-period', array(
					'user' => $user,
					'gracePeriod' => $gracePeriod,
					'defaultGracePeriod' => $defaultGracePeriod,
					'idPrefix' => 'wfls-passkey-',
				))->render(); ?>
			<?php endif; ?>
		<?php endif; ?>
	</div>
</div>
