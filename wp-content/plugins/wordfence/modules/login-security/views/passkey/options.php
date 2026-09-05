<?php
if (!defined('WORDFENCE_LS_VERSION')) { exit; }
/**
 * @var \WP_User $user The user being edited. Required.
 */

$passkeyController = \WordfenceLS\Controller_Passkey::shared();
$usernamePasswordAuthEnabled = $passkeyController->is_effective_username_password_auth_enabled($user);
$canChangeUsernamePasswordAuth = $passkeyController->can_change_username_password_auth($user);
$ownAccount = get_current_user_id() === (int) $user->ID;
?>
<div class="wfls-block wfls-always-active wfls-flex-item-full-width">
	<div class="wfls-block-header wfls-block-header-border-bottom">
		<div class="wfls-block-header-content">
			<div class="wfls-block-title">
				<strong><?php esc_html_e('User Options', 'wordfence'); ?></strong>
			</div>
		</div>
	</div>
	<div class="wfls-block-content wfls-padding-add-bottom">
		<ul id="wfls-passkey-password-auth-toggle-container" class="wfls-option wfls-option-toggled wfls-add-top<?php if (!$canChangeUsernamePasswordAuth): ?> wfls-disabled<?php endif; ?>">
			<li
				id="wfls-passkey-password-auth-enabled"
				class="wfls-option-checkbox<?php if ($usernamePasswordAuthEnabled): ?> wfls-checked<?php endif; ?>"
				role="checkbox"
				aria-checked="<?php echo $usernamePasswordAuthEnabled ? 'true' : 'false'; ?>"
				tabindex="0"
				aria-labelledby="wfls-passkey-password-auth-label"
			><i class="wfls-ion-ios-checkmark-empty" aria-hidden="true"></i></li>
			<li class="wfls-option-title">
				<ul class="wfls-flex-vertical wfls-flex-align-left">
					<li>
						<span id="wfls-passkey-password-auth-label" class="wfls-option-extended-toggle"><strong><?php esc_html_e('Allow username/password authentication', 'wordfence'); ?></strong></span>
					</li>
					<li class="wfls-option-subtitle wfls-option-extended-toggle">
						<?php
						esc_html_e('If disabled, logging in with a username and password will be blocked for this account when a passkey is registered.', 'wordfence');
						if (!$canChangeUsernamePasswordAuth) {
							echo '<br><br>';
							echo esc_html__('NOTE: This option is currently overridden by the global role requirement', 'wordfence');
						}
						?>
					</li>
				</ul>
			</li>
		</ul>
	</div>
</div>
<?php if ($ownAccount): ?>
<div style="display: none;">
	<?php
	echo \WordfenceLS\Model_View::create('common/modal-prompt', array(
		'id' => 'wfls-template-passkey-password-auth-disable-prompt',
		'title' => __('Confirm Disabling Username/Password Authentication', 'wordfence'),
		'message' => __('Disabling username/password authentication will make your account more secure. However, if you lose access to your passkey, you will not be able to log in to this account at all. We recommend testing your login using another browser or incognito window before you log out in this window.', 'wordfence'),
		'primaryButton' => array('class' => 'wfls-passkey-password-auth-disable-prompt-cancel', 'label' => __('Cancel', 'wordfence'), 'link' => '#'),
		'secondaryButtons' => array(array('class' => 'wfls-passkey-password-auth-disable-prompt-confirm', 'label' => __('Disable', 'wordfence'), 'link' => '#')),
	))->render();
	?>
</div>
<?php endif; ?>
<script type="application/javascript">
	(function($) {
		$(function() {
			var toggle = $('#wfls-passkey-password-auth-enabled');
			var toggleTarget = $('#wfls-passkey-password-auth-toggle-container').find('.wfls-option-extended-toggle');
			var requiresDisableConfirmation = <?php echo $ownAccount ? 'true' : 'false'; ?>;
			if (!toggle.length) {
				return;
			}

			var busy = false;
			var previousState = toggle.hasClass('wfls-checked');

			function updateToggleState(enabled) {
				toggle.toggleClass('wfls-checked', enabled);
				toggle.attr('aria-checked', enabled ? 'true' : 'false');
			}

			function saveToggleState(nextState) {
				busy = true;
				toggle.closest('.wfls-option').addClass('wfls-disabled');

				WFLS.ajax(
					'wordfence_ls_set_passkey_password_auth',
					{
						user: <?php echo (int) $user->ID; ?>,
						enabled: nextState ? 1 : 0
					},
					function(response) {
						busy = false;
						toggle.closest('.wfls-option').removeClass('wfls-disabled');
						if (response.error) {
							updateToggleState(previousState);
							WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Error Updating Passkey Options', 'wordfence')); ?>', response.error);
							return;
						}

						previousState = !!response.enabled;
						updateToggleState(previousState);
					},
					function() {
						busy = false;
						toggle.closest('.wfls-option').removeClass('wfls-disabled');
						updateToggleState(previousState);
						WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Error Updating Passkey Options', 'wordfence')); ?>', '<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('An error was encountered while trying to save the user-specific passkey options. Please try again.', 'wordfence')); ?>');
					}
				);
			}

			function confirmDisable(callback) {
				var content = $('#wfls-template-passkey-password-auth-disable-prompt').clone().attr('id', null);
				if (!content.length) {
					callback();
					return;
				}

				WFLS.standaloneModalHTML(content, { onOpen: function(modal) {
					$(modal).find('.wfls-passkey-password-auth-disable-prompt-cancel').on('click', WFLS.closeStandaloneModal);
					$(modal).find('.wfls-passkey-password-auth-disable-prompt-confirm').on('click', function(confirmEvent) {
						confirmEvent.preventDefault();
						confirmEvent.stopPropagation();

						WFLS.closeStandaloneModal();
						callback();
					});
				}});
			}

			function handleToggle() {
				if (busy || toggle.closest('.wfls-disabled').length) {
					return;
				}

				var nextState = !toggle.hasClass('wfls-checked');
				if (!nextState && requiresDisableConfirmation) {
					confirmDisable(function() {
						saveToggleState(nextState);
					});
					return;
				}

				saveToggleState(nextState);
			}

			if (toggle.closest('.wfls-disabled').length) {
				return;
			}

			toggle.on('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				handleToggle();
			}).on('keydown', function(event) {
				if (event.key === ' ' || event.key === 'Spacebar') {
					event.preventDefault();
					event.stopPropagation();
					handleToggle();
				}
			});

			toggleTarget.on('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				handleToggle();
			});
		});
	})(jQuery);
</script>
