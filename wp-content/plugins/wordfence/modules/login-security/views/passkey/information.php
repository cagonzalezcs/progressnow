<?php
if (!defined('WORDFENCE_LS_VERSION')) { exit; }
?>
<div class="wfls-passkey-information" role="note">
	<h3 class="wfls-passkey-information-title">
		<i class="wfls-ion-ios-information-outline" aria-hidden="true"></i>
		<span><?php esc_html_e('About Passkeys', 'wordfence'); ?></span>
	</h3>
	<ul class="wfls-passkey-information-list">
		<li>
			<i class="wfls-ion-ios-checkmark-empty" aria-hidden="true"></i>
			<span><?php esc_html_e('A passkey lets you sign in with your device unlock method.', 'wordfence'); ?></span>
		</li>
		<li>
			<i class="wfls-ion-ios-checkmark-empty" aria-hidden="true"></i>
			<span><?php esc_html_e('Your fingerprint/face/PIN is not shared with this site.', 'wordfence'); ?></span>
		</li>
		<li>
			<i class="wfls-ion-ios-checkmark-empty" aria-hidden="true"></i>
			<span><?php esc_html_e('Add more than one passkey before turning off passwords.', 'wordfence'); ?></span>
		</li>
		<li>
			<i class="wfls-ion-ios-checkmark-empty" aria-hidden="true"></i>
			<span><?php esc_html_e('Deleting a passkey here does not necessarily remove it from your device\'s password manager.', 'wordfence'); ?></span>
		</li>
		<li>
			<i class="wfls-ion-ios-checkmark-empty" aria-hidden="true"></i>
			<span><?php esc_html_e('When you start using passkeys, be aware that messages telling you to use your password could be phishing attempts.', 'wordfence'); ?></span>
		</li>
		<li>
			<i class="wfls-ion-ios-checkmark-empty" aria-hidden="true"></i>
			<span><?php esc_html_e('You can use a password manager to store passkeys, to be sure you can still log in if your primary device is lost or broken.', 'wordfence'); ?></span>
		</li>
	</ul>
</div>
