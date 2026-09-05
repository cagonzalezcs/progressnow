<?php
if (!defined('WORDFENCE_LS_VERSION')) { exit; }
/**
 * @var \WP_User $user The user being edited. Required.
 * @var array $passkeys The registered passkeys. Required.
 * @var string $uiStyleContext The UI style context to use. Optional.
 */
$uiStyleContext = isset($uiStyleContext) && is_string($uiStyleContext)
	? \WordfenceLS\Controller_WordfenceLS::normalize_ui_style_context($uiStyleContext)
	: \WordfenceLS\Controller_WordfenceLS::shared()->ui_style_context();
?>
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
<script type="application/javascript">
	(function($) {
		$(function() {
			var list = $('#wfls-passkey-list');
			var empty = $('#wfls-passkey-empty');

			function updateEmptyState() {
				empty.toggle(list.find('.wfls-passkey-item').length === 0);
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
