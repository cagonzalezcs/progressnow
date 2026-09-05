<?php
if (!defined('WORDFENCE_LS_VERSION')) { exit; }

/**
 * @var \WP_User $user The user being edited. Required.
 * @var bool $canEditUsers Whether or not the viewer of the page can edit other users. Optional, defaults to false.
 * @var bool $canRegisterPasskeys Whether the viewer can register a new passkey for this user. Optional, defaults to true.
 * @var bool $passkeysEnabledForUser Whether passkeys are enabled for this user's role. Optional, defaults to true.
 * @var bool $targetUserPermissionDenied Whether the viewer is not allowed to view or edit the target user's passkeys. Optional, defaults to false.
 * @var string $settingsURL The login security settings URL. Optional.
 * @var bool $showSettingsButton Whether to show the settings button when passkeys are disabled for this user's role. Optional, defaults to true.
 * @var string[] $initialAllowedHostnames The hostnames that will be saved as Allowed Passkey Hostnames. Optional.
 */

if (!isset($canEditUsers)) {
	$canEditUsers = false;
}
if (!isset($canRegisterPasskeys)) {
	$canRegisterPasskeys = true;
}
if (!isset($passkeysEnabledForUser)) {
	$passkeysEnabledForUser = true;
}
if (!isset($targetUserPermissionDenied)) {
	$targetUserPermissionDenied = false;
}
if (!isset($settingsURL)) {
	$settingsURL = is_multisite() ? network_admin_url('admin.php?page=WFLS#top#settings') : admin_url('admin.php?page=WFLS#top#settings');
}
if (!isset($showSettingsButton)) {
	$showSettingsButton = true;
}

$ownAccount = false;
$ownUser = wp_get_current_user();
if ($ownUser->ID == $user->ID) {
	$ownAccount = true;
}
?>

<p><?php esc_html_e('A passkey is a password replacement that validates your identity using touch, facial recognition, a device password, or a PIN. They can be used for sign-in as a simple and secure alternative to your password and two-factor credentials.', 'wordfence'); ?></p>
<p><?php esc_html_e('Passkeys are harder for hackers to steal because they aren\'t stored on websites like traditional passwords where a vulnerability could allow capture, and they can\'t be easily guessed, reused, or phished using emails or fake login pages. They make signing in both easier and more secure.', 'wordfence'); ?></p>
<?php if ($canEditUsers): ?>
<div id="wfls-passkey-editing-display" class="wfls-flex-row wfls-flex-row-xs-wrappable wfls-flex-row-equal-heights">
	<div class="wfls-block wfls-always-active wfls-flex-item-full-width wfls-add-bottom">
		<div class="wfls-block-header wfls-block-header-border-bottom">
			<div class="wfls-block-header-content">
				<div class="wfls-block-title">
					<strong><?php echo wp_kses(sprintf(/* translators: 1. WordPress avatar tag; 2. WordPress username */ __('Editing User:&nbsp;&nbsp;%1$s <span class="wfls-text-plain">%2$s</span>', 'wordfence'), get_avatar($user->ID, 16, '', $user->user_login), \WordfenceLS\Text\Model_HTML::esc_html($user->user_login) . ($ownAccount ? ' ' . __('(you)', 'wordfence') : '')), array('span'=>array('class'=>array()))); ?></strong>
				</div>
			</div>
		</div>
	</div>
</div>
<?php endif; ?>
<?php if ($targetUserPermissionDenied): ?>
	<?php
	echo \WordfenceLS\Model_View::create('page/feature-disabled', array(
		'title' => __('Permission Denied', 'wordfence'),
		'message' => __('You are not allowed to view or edit that user.', 'wordfence'),
		'showSettingsButton' => false,
	))->render();
	return;
	?>
<?php endif; ?>
<?php if (!$passkeysEnabledForUser): ?>
	<?php
	echo \WordfenceLS\Model_View::create('page/feature-disabled', array(
		'title' => $ownAccount ? __('Passkeys are disabled', 'wordfence') : __('Passkeys are disabled for this user.', 'wordfence'),
		'message' => $ownAccount ? __('Your role does not have permission to use passkeys.', 'wordfence') : ($showSettingsButton ? __('Enable passkeys on the settings page for this user\'s role to manage the user\'s passkeys.', 'wordfence') : __('Passkeys are not enabled for this user\'s role.', 'wordfence')),
		'settingsURL' => $settingsURL,
		'showSettingsButton' => $showSettingsButton,
	))->render();
	return;
	?>
<?php endif; ?>
<?php
$hasPasskey = \WordfenceLS\Controller_Users::shared()->has_passkey_active($user);
$requiresPasskey = \WordfenceLS\Controller_Users::shared()->requires_passkey($user, $inPasskeyGracePeriod, $passkeyRequiredAt);
$passkeyLockedOut = $requiresPasskey && !$hasPasskey;
$showPasskeyGracePeriod = $passkeyLockedOut || $inPasskeyGracePeriod;
$uiStyleContext = \WordfenceLS\Controller_WordfenceLS::shared()->ui_style_context();
$passkeys = \WordfenceLS\Controller_Passkey::shared()->get_passkeys($user);
$canRegisterPasskeys = $canRegisterPasskeys && \WordfenceLS\Controller_Passkey::shared()->has_passkey_capacity($passkeys);
?>
<div id="wfls-passkey-management-controls" class="wfls-flex-row wfls-flex-row-xs-wrappable wfls-flex-row-equal-heights">
	<!-- begin active content -->
	<div class="wfls-flex-row wfls-flex-row-equal-heights <?php echo $canRegisterPasskeys ? 'wfls-col-sm-half-padding-right wfls-flex-item-sm-50' : 'wfls-flex-item-full-width'; ?> wfls-flex-item-xs-100">
		<?php
		echo \WordfenceLS\Model_View::create('passkey/active', array(
			'user' => $user,
			'passkeys' => $passkeys,
			'uiStyleContext' => $uiStyleContext,
		))->render();
		?>
	</div>
	<!-- end active content -->
	<?php if ($canRegisterPasskeys): ?>
		<!-- begin register passkey -->
		<div class="wfls-flex-row wfls-flex-row-equal-heights wfls-col-sm-half-padding-left wfls-flex-item-xs-100 wfls-flex-item-sm-50">
			<?php
			echo \WordfenceLS\Model_View::create('passkey/register', array(
				'user' => $user,
				'uiStyleContext' => $uiStyleContext,
				'initialAllowedHostnames' => isset($initialAllowedHostnames) ? $initialAllowedHostnames : array(),
			))->render();
			?>
		</div>
		<!-- end register passkey -->
	<?php endif; ?>
</div>
<div id="wfls-passkey-options-controls" class="wfls-flex-row wfls-flex-row-xs-wrappable wfls-flex-row-equal-heights">
	<div class="wfls-flex-row wfls-flex-row-equal-heights <?php echo $showPasskeyGracePeriod ? 'wfls-col-sm-half-padding-right wfls-flex-item-sm-50' : 'wfls-flex-item-full-width'; ?> wfls-flex-item-xs-100">
		<?php
		echo \WordfenceLS\Model_View::create('passkey/options', array(
			'user' => $user,
		))->render();
		?>
	</div>
	<?php if ($showPasskeyGracePeriod): ?>
		<div class="wfls-flex-row wfls-flex-row-equal-heights wfls-col-sm-half-padding-left wfls-flex-item-xs-100 wfls-flex-item-sm-50">
			<?php
			echo \WordfenceLS\Model_View::create('passkey/grace-period', array(
				'user' => $user,
				'gracePeriod' => $inPasskeyGracePeriod,
				'lockedOut' => $passkeyLockedOut,
				'requiredAt' => $passkeyRequiredAt,
			))->render();
			?>
		</div>
	<?php endif; ?>
</div>
<?php echo \WordfenceLS\Model_View::create('passkey/information')->render(); ?>
