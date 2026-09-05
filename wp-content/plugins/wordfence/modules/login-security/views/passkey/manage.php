<?php
if (!defined('WORDFENCE_LS_VERSION')) { exit; }
/**
 * @var \WP_User $user The user being edited. Required.
 * @var bool $stacked Whether to stack columns. Optional.
 * @var array $passkeys The registered passkeys. Required.
 * @var bool $canRegisterPasskeys Whether the viewer can register a new passkey for this user. Optional.
 * @var bool $passkeysEnabledForUser Whether passkeys are enabled for this user's role. Optional.
 * @var string $settingsURL The login security settings URL. Optional.
 * @var bool $showSettingsButton Whether to show the settings button when passkeys are disabled for this user's role. Optional.
 * @var string[] $initialAllowedHostnames The hostnames that will be saved as Allowed Passkey Hostnames. Optional.
 */

$stacked = isset($stacked) ? $stacked : false;
$canRegisterPasskeys = isset($canRegisterPasskeys) ? $canRegisterPasskeys : true;
$canRegisterPasskeys = $canRegisterPasskeys && \WordfenceLS\Controller_Passkey::shared()->has_passkey_capacity($passkeys);
$passkeysEnabledForUser = isset($passkeysEnabledForUser) ? $passkeysEnabledForUser : true;
$settingsURL = isset($settingsURL) ? $settingsURL : (is_multisite() ? network_admin_url('admin.php?page=WFLS#top#settings') : admin_url('admin.php?page=WFLS#top#settings'));
$showSettingsButton = isset($showSettingsButton) ? $showSettingsButton : true;
$containerClasses = 'wfls-flex-row ' . ($stacked ? 'wfls-flex-row-wrapped' : 'wfls-flex-row-wrappable wfls-flex-row-equal-heights');
$columnClasses = 'wfls-flex-row wfls-flex-item-xs-100 ' . ($stacked ? '' : 'wfls-flex-row-equal-heights');
$hasPasskey = \WordfenceLS\Controller_Users::shared()->has_passkey_active($user);
$requiresPasskey = \WordfenceLS\Controller_Users::shared()->requires_passkey($user, $inPasskeyGracePeriod, $passkeyRequiredAt);
$passkeyLockedOut = $requiresPasskey && !$hasPasskey;
$showPasskeyGracePeriod = $passkeyLockedOut || $inPasskeyGracePeriod;
$ownUser = wp_get_current_user();
$ownAccount = $ownUser->ID == $user->ID;
$uiStyleContext = \WordfenceLS\Controller_WordfenceLS::shared()->ui_style_context();
$addIconClass = $uiStyleContext === \WordfenceLS\Controller_WordfenceLS::UI_STYLE_CONTEXT_CORE
	? 'wf-fa wf-fa-plus'
	: 'wfls-fa wfls-fa-plus';
?>
<div id="wfls-passkey-management-embedded" data-wfls-ui-style="<?php echo esc_attr($uiStyleContext); ?>"<?php if ($stacked): ?> class="stacked"<?php endif ?>>
	<?php if (!$passkeysEnabledForUser): ?>
		<?php
		echo \WordfenceLS\Model_View::create('page/feature-disabled', array(
			'title' => $ownAccount ? __('Passkeys are disabled', 'wordfence') : __('Passkeys are disabled for this user.', 'wordfence'),
			'message' => $ownAccount ? __('Your role does not have permission to use passkeys.', 'wordfence') : ($showSettingsButton ? __('Enable passkeys on the settings page for this user\'s role to manage the user\'s passkeys.', 'wordfence') : __('Passkeys are not enabled for this user\'s role.', 'wordfence')),
			'settingsURL' => $settingsURL,
			'showSettingsButton' => $showSettingsButton,
		))->render();
		?>
	</div>
		<?php return; ?>
	<?php endif; ?>
	<div class="<?php echo $containerClasses ?>">
		<div class="<?php echo $columnClasses ?> wfls-passkey-management-column<?php if (!$stacked): ?> <?php echo $canRegisterPasskeys ? 'wfls-flex-item-sm-50' : 'wfls-flex-item-full-width'; ?><?php endif ?>">
			<div class="wfls-block wfls-always-active wfls-flex-item-full-width">
				<div class="wfls-block-header wfls-block-header-border-bottom">
					<div class="wfls-block-header-content">
						<div class="wfls-block-title">
							<strong><?php esc_html_e('Registered Passkeys', 'wordfence'); ?></strong>
						</div>
					</div>
					</div>
					<div class="wfls-block-content wfls-padding-add-bottom">
						<p id="wfls-passkey-empty"<?php if (!empty($passkeys)): ?> style="display: none;"<?php endif; ?>><?php esc_html_e('No passkeys are registered for this account yet.', 'wordfence'); ?></p>
						<div id="wfls-passkey-list">
							<?php foreach ($passkeys as $passkey): ?>
								<?php echo \WordfenceLS\Model_View::create('passkey/item', array('passkey' => $passkey, 'uiStyleContext' => $uiStyleContext))->render(); ?>
							<?php endforeach; ?>
						</div>
					</div>
				</div>
			</div>
		<?php if ($canRegisterPasskeys): ?>
			<div class="<?php echo $columnClasses ?> wfls-passkey-management-column<?php if (!$stacked): ?> wfls-flex-item-sm-50<?php endif ?>">
				<div class="wfls-block wfls-always-active wfls-flex-item-full-width">
					<div class="wfls-block-header wfls-block-header-border-bottom">
						<div class="wfls-block-header-content">
							<div class="wfls-block-title">
								<strong><?php esc_html_e('Add Passkey', 'wordfence'); ?></strong>
							</div>
						</div>
					</div>
					<div class="wfls-block-content wfls-padding-add-bottom">
						<p><?php esc_html_e('Use the current browser or device to create a new passkey for this account. This passkey can work across multiple devices, so pick a nickname that will help you identify it later (e.g., the name of your password manager or account provider).', 'wordfence'); ?></p>
						<div class="wfls-passkey-add-row wfls-add-top">
							<input type="text"
								   id="wfls-passkey-label"
								   class="input wfls-input-text wfls-passkey-add-input"
								   maxlength="255"
								   aria-label="<?php echo esc_attr__('Passkey Label', 'wordfence'); ?>"
								   placeholder="<?php echo esc_attr__('Passkey Name', 'wordfence'); ?>">
							<a href="#"
							   id="wfls-passkey-add"
							   class="wfls-btn wfls-btn-default wfls-passkey-add-button wfls-disabled"
							   aria-label="<?php echo esc_attr__('Add Passkey', 'wordfence'); ?>"
							   aria-disabled="true"
							   title="<?php echo esc_attr__('Add Passkey', 'wordfence'); ?>">
								<i class="<?php echo esc_attr($addIconClass); ?>" aria-hidden="true"></i>
								<span class="sr-only"><?php esc_html_e('Add Passkey', 'wordfence'); ?></span>
							</a>
						</div>
						<?php
						echo \WordfenceLS\Model_View::create('passkey/initial-allowed-hostnames', array(
							'initialAllowedHostnames' => isset($initialAllowedHostnames) ? $initialAllowedHostnames : array(),
						))->render();
						?>
					</div>
				</div>
			</div>
		<?php endif; ?>
	</div>
	<div class="<?php echo $containerClasses ?>">
		<div class="<?php echo $columnClasses ?><?php if (!$stacked && $showPasskeyGracePeriod): ?> wfls-col-sm-half-padding-right wfls-flex-item-sm-50<?php else: ?> wfls-flex-item-full-width<?php endif; ?>">
			<?php
			echo \WordfenceLS\Model_View::create('passkey/options', array(
				'user' => $user,
			))->render();
			?>
		</div>
		<?php if ($showPasskeyGracePeriod): ?>
			<div class="<?php echo $columnClasses ?><?php if (!$stacked): ?> wfls-col-sm-half-padding-left wfls-flex-item-sm-50<?php endif; ?>">
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
	<div style="display: none;">
		<?php
		echo \WordfenceLS\Model_View::create('common/modal-prompt', array(
			'id' => 'wfls-template-passkey-remove-prompt',
			'title' => __('Remove Passkey', 'wordfence'),
			'message' => __('Are you sure you want to remove this passkey?', 'wordfence'),
			'primaryButton' => array('class' => 'wfls-passkey-remove-prompt-cancel', 'label' => __('Cancel', 'wordfence'), 'link' => '#'),
			'secondaryButtons' => array(array('class' => 'wfls-passkey-remove-prompt-confirm', 'label' => __('Remove', 'wordfence'), 'link' => '#')),
		))->render();
		?>
	</div>
</div>
<script type="application/javascript">
	(function($) {
		$(function() {
			var button = $('#wfls-passkey-add');
			var labelField = $('#wfls-passkey-label');
			var list = $('#wfls-passkey-list');
			var empty = $('#wfls-passkey-empty');
			var uiStyleContext = $('#wfls-passkey-management-embedded').attr('data-wfls-ui-style') || 'wfls';
			var busy = false;

			function canSubmit() {
				return labelField.val().trim().length > 0;
			}

			function updateButtonState() {
				var disabled = busy || !canSubmit();
				button.toggleClass('wfls-disabled', disabled);
				button.attr('aria-disabled', disabled ? 'true' : 'false');
			}

			function setBusy(nextBusy) {
				busy = nextBusy;
				updateButtonState();
			}

			function updateEmptyState() {
				empty.toggle(list.find('.wfls-passkey-item').length === 0);
			}

			<?php echo \WordfenceLS\Model_View::create('passkey/registration-error-handler')->render(); ?>

			if (button.length && labelField.length) {
				labelField.on('input change', updateButtonState);

				button.on('click', function(event) {
					event.preventDefault();
					event.stopPropagation();

					if (busy || !canSubmit()) {
						return;
					}
					if (!window.PublicKeyCredential || !navigator.credentials || !navigator.credentials.create) {
						if (passkeysRequireHTTPS()) {
							WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Passkeys Not Available', 'wordfence')); ?>', httpsRequiredMessage);
							return;
						}
						WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Passkeys Not Available', 'wordfence')); ?>', '<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('This browser does not support passkey registration.', 'wordfence')); ?>');
						return;
					}

					setBusy(true);
					var label = labelField.val();
					WFLS.ajax(
						'wordfence_ls_begin_passkey_registration',
						{
							user: <?php echo (int) $user->ID; ?>,
							label: label
						},
						function(response) {
							if (response.error) {
								setBusy(false);
								WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Error Starting Passkey Registration', 'wordfence')); ?>', response.error);
								return;
							}

							var publicKey = WFLS.publicKeyOptionsFromJSON(response.options);
							navigator.credentials.create({ publicKey: publicKey }).then(function(credential) {
								WFLS.ajax(
									'wordfence_ls_finish_passkey_registration',
									{
										user: <?php echo (int) $user->ID; ?>,
										label: label,
										token: response.token,
										credential: WFLS.credentialToJSON(credential),
										ui_style_context: uiStyleContext
									},
									function(finishResponse) {
										setBusy(false);
										if (finishResponse.error) {
											WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Error Adding Passkey', 'wordfence')); ?>', finishResponse.error);
											return;
										}

										list.append(finishResponse.item_html);
										labelField.val('');
										updateButtonState();
										updateEmptyState();
									},
									function() {
										setBusy(false);
										WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Error Adding Passkey', 'wordfence')); ?>', '<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('An error was encountered while trying to save the new passkey. Please try again.', 'wordfence')); ?>');
									}
								);
							}).catch(function(error) {
								setBusy(false);
								if (error && error.name === 'NotAllowedError') {
									return;
								}
								WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Error Adding Passkey', 'wordfence')); ?>', describeError(error, '<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Passkey registration could not be completed.', 'wordfence')); ?>'));
							});
						},
						function() {
							setBusy(false);
							WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Error Starting Passkey Registration', 'wordfence')); ?>', '<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('An error was encountered while trying to start passkey registration. Please try again.', 'wordfence')); ?>');
						}
					);
				});

				updateButtonState();
			}

			list.on('click', '.wfls-passkey-remove', function(event) {
				event.preventDefault();
				event.stopPropagation();

				var item = $(this).closest('.wfls-passkey-item');
				var passkeyId = $(this).data('passkey-id');
				var content = $('#wfls-template-passkey-remove-prompt').clone().attr('id', null);
				WFLS.standaloneModalHTML(content, { onOpen: function(modal) {
					$(modal).find('.wfls-passkey-remove-prompt-cancel').on('click', WFLS.closeStandaloneModal);
					$(modal).find('.wfls-passkey-remove-prompt-confirm').on('click', function(confirmEvent) {
						confirmEvent.preventDefault();
						confirmEvent.stopPropagation();

						WFLS.ajax(
							'wordfence_ls_remove_passkey',
							{
								user: <?php echo (int) $user->ID; ?>,
								passkey_id: passkeyId
							},
							function(response) {
								if (response.error) {
									WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Error Removing Passkey', 'wordfence')); ?>', response.error);
									return;
								}

								WFLS.closeStandaloneModal();
								item.remove();
								updateEmptyState();
							},
							function() {
								WFLS.standaloneModal('<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('Error Removing Passkey', 'wordfence')); ?>', '<?php echo \WordfenceLS\Text\Model_JavaScript::esc_js(__('An error was encountered while trying to remove the passkey. Please try again.', 'wordfence')); ?>');
							}
						);
					});
				}});
			});
		});
	})(jQuery);
</script>
