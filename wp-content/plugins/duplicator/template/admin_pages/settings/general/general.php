<?php

/**
 * @package   Duplicator
 * @copyright (c) 2022, Snap Creek LLC
 */

defined("ABSPATH") || exit;

/**
 * Variables
 *
 * @var \Duplicator\Core\Views\TplMng  $tplMng
 * @var array<string, mixed> $tplData
 */

use Duplicator\Core\Controllers\ControllersManager;
use Duplicator\Utils\LinkManager;
use Duplicator\Libs\Snap\SnapUtil;
use Duplicator\Core\Views\TplMng;

global $wp_version;
global $wpdb;

$action_updated  = null;
$action_response = __("General Settings Saved", 'duplicator');

//SAVE RESULTS
if (isset($_POST['action']) && $_POST['action'] == 'save') {
    //Nonce Check
    if (!isset($_POST['dup_settings_save_nonce_field']) || !wp_verify_nonce($_POST['dup_settings_save_nonce_field'], 'dup_settings_save')) {
        die('Invalid token permissions to perform this request.');
    }

    DUP_Settings::Set('wpfront_integrate', isset($_POST['wpfront_integrate']) ? "1" : "0");

    $skip_archive_scan = filter_input(INPUT_POST, 'skip_archive_scan', FILTER_VALIDATE_BOOLEAN);
    DUP_Settings::Set('skip_archive_scan', $skip_archive_scan);

    $unhook_third_party_js = filter_input(INPUT_POST, 'unhook_third_party_js', FILTER_VALIDATE_BOOLEAN);
    DUP_Settings::Set('unhook_third_party_js', $unhook_third_party_js);

    $unhook_third_party_css = filter_input(INPUT_POST, 'unhook_third_party_css', FILTER_VALIDATE_BOOLEAN);
    DUP_Settings::Set('unhook_third_party_css', $unhook_third_party_css);

    $email_summary_frequency = SnapUtil::sanitizeStrictInput(INPUT_POST, 'email_summary_frequency');
    DUP_Settings::setEmailSummaryFrequency($email_summary_frequency);



    DUP_Settings::Save();
    $action_updated = true;
    DUP_Util::initSnapshotDirectory();
}

$wpfront_integrate      = DUP_Settings::Get('wpfront_integrate');
$wpfront_ready          = apply_filters('wpfront_user_role_editor_duplicator_integration_ready', false);
$skip_archive_scan      = DUP_Settings::Get('skip_archive_scan');
$unhook_third_party_js  = DUP_Settings::Get('unhook_third_party_js');
$unhook_third_party_css = DUP_Settings::Get('unhook_third_party_css');
$actionUrl              = ControllersManager::getMenuLink(ControllersManager::SETTINGS_SUBMENU_SLUG, 'general');
?>

<style>
    form#dup-settings-form input[type=text] {width: 400px; }
    div.dup-feature-found {padding:3px; border:1px solid silver; background: #f7fcfe; border-radius: 3px; width:400px; font-size: 12px}
    div.dup-feature-notfound {padding:5px; border:1px solid silver; background: #fcf3ef; border-radius: 3px; width:500px; font-size: 13px; line-height: 18px}
    table.nested-table-data td {padding:5px 5px 5px 0}
</style>

<form id="dup-settings-form" action="<?php echo esc_url($actionUrl); ?>" method="post">

    <?php wp_nonce_field('dup_settings_save', 'dup_settings_save_nonce_field', false); ?>
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="page"   value="duplicator-settings">

    <?php if ($action_updated) : ?>
        <div id="message" class="notice notice-success is-dismissible dup-wpnotice-box"><p><?php echo esc_html($action_response); ?></p></div>
    <?php endif; ?>

    <?php TplMng::getInstance()->render('admin_pages/settings/general/license'); ?>

    <?php TplMng::getInstance()->render('admin_pages/settings/general/email_summary'); ?>

    <!-- ===============================
    ADVANCED SETTINGS -->
    <h3 class="title"><?php esc_html_e('Advanced', 'duplicator'); ?> </h3>
    <hr size="1" />
    <table class="form-table">
        <tr>
            <th scope="row"><label><?php esc_html_e("Settings", 'duplicator'); ?></label></th>
            <td>
                <button class="button" onclick="Duplicator.Pack.ConfirmResetAll(); return false;">
                    <i class="fas fa-redo fa-sm"></i> <?php esc_html_e('Reset Backups', 'duplicator'); ?>
                </button>
                <p class="description">
                    <?php
                    esc_html_e("This process will reset all Backups by deleting those without a completed status, reset the active Backup id and perform a "
                        . "cleanup of the build tmp file.", 'duplicator');
                    ?>
                    <i class="fas fa-question-circle fa-sm"
                       data-tooltip-title="<?php esc_attr_e("Reset Settings", 'duplicator'); ?>"
                       data-tooltip="<?php
                        esc_attr_e('This action should only be used if the Backups screen is having issues or a build is stuck.', 'duplicator'); ?>">
                    </i>
                </p>
            </td>
        </tr>
        <tr valign="top">
            <th scope="row"><label><?php esc_html_e('Backup scan', 'duplicator'); ?></label></th>
            <td>
                <input type="checkbox" name="skip_archive_scan" id="_skip_archive_scan" <?php checked($skip_archive_scan, true); ?> value="1" />
                <label for="_skip_archive_scan"><?php esc_html_e("Skip", 'duplicator') ?> </label><br/>
                <p class="description">
                    <?php
                    esc_html_e('If enabled all files check on scan will be skipped before Backup creation.  '
                        . 'In some cases, this option can be beneficial if the scan process is having issues running or returning errors.', 'duplicator');
                    ?>
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label><?php esc_html_e("Foreign JavaScript", 'duplicator'); ?></label></th>
            <td>
                <input type="checkbox" name="unhook_third_party_js" id="unhook_third_party_js" <?php checked($unhook_third_party_js, true); ?>  value="1"/>
                <label for="unhook_third_party_js"><?php esc_html_e("Disable", 'duplicator'); ?></label> <br/>
                <p class="description">
                    <?php
                    esc_html_e("Check this option if other plugins/themes JavaScript files are conflicting with Duplicator.", 'duplicator');
                    echo '<br/>';
                    esc_html_e("Do not modify this setting unless you know the expected result or have talked to support.", 'duplicator');
                    ?>
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label><?php esc_html_e("Foreign CSS", 'duplicator'); ?></label></th>
            <td>
                <input type="checkbox" name="unhook_third_party_css" id="unhook_third_party_css" <?php checked($unhook_third_party_css, true); ?>  value="1"/>
                <label for="unhook_third_party_css"><?php esc_html_e("Disable", 'duplicator'); ?></label> <br/>
                <p class="description">
                    <?php
                    esc_html_e("Check this option if other plugins/themes CSS files are conflicting with Duplicator.", 'duplicator');
                    echo '<br/>';
                    esc_html_e("Do not modify this setting unless you know the expected result or have talked to support.", 'duplicator');
                    ?>
                </p>
            </td>
        </tr>
    </table>

    <p class="submit" style="margin: 20px 0px 0xp 5px;">
        <br/>
        <input
            type="submit"
            name="submit"
            id="submit"
            class="button-primary"
            value="<?php esc_attr_e("Save General Settings", 'duplicator') ?>"
            style="display: inline-block;"
        />
    </p>

</form>

<!-- ==========================================
THICK-BOX DIALOGS: -->
<?php
$reset_confirm                 = new DUP_UI_Dialog();
$reset_confirm->title          = __('Reset Backups ?', 'duplicator');
$reset_confirm->message        = __('This will clear and reset all of the current temporary Backups.  Would you like to continue?', 'duplicator');
$reset_confirm->progressText   = __('Resetting settings, Please Wait...', 'duplicator');
$reset_confirm->jscallback     = 'Duplicator.Pack.ResetAll()';
$reset_confirm->progressOn     = false;
$reset_confirm->okText         = __('Yes', 'duplicator');
$reset_confirm->cancelText     = __('No', 'duplicator');
$reset_confirm->closeOnConfirm = true;
$reset_confirm->initConfirm();

$faqUrl         = esc_url(LinkManager::getDocUrl('how-to-resolve-duplicator-plugin-user-interface-ui-issues', 'settings-admin_notice'));
$msg_ajax_error = new DUP_UI_Messages(
    __('AJAX Call Error!', 'duplicator') . '<br>' .
    sprintf(
        _x(
            'AJAX error encountered when resetting Backups. Please see %1$sthis FAQ entry%2$s for possible resolutions.',
            '1 and 2 are opening and closing <a> tags',
            'duplicator'
        ),
        '<a href="' . $faqUrl . '" target="_blank">',
        '</a>'
    ),
    DUP_UI_Messages::ERROR
);

$msg_ajax_error->hide_on_init   = true;
$msg_ajax_error->is_dismissible = true;
$msg_ajax_error->initMessage();

$msg_response_error                 = new DUP_UI_Messages(__('RESPONSE ERROR!', 'duplicator'), DUP_UI_Messages::ERROR);
$msg_response_error->hide_on_init   = true;
$msg_response_error->is_dismissible = true;
$msg_response_error->initMessage();

$msg_response_success                 = new DUP_UI_Messages('', DUP_UI_Messages::NOTICE);
$msg_response_success->hide_on_init   = true;
$msg_response_success->is_dismissible = true;
$msg_response_success->initMessage();
?>
<script>
    jQuery(document).ready(function ($)
    {
        var msgDebug = <?php echo DUP_Util::isWpDebug() ? 'true' : 'false'; ?>;
        Duplicator.Pack.ConfirmResetAll = function ()
        {
<?php $reset_confirm->showConfirm(); ?>
        };

        Duplicator.Pack.ResetAll = function ()
        {
            $.ajax({
                type: "POST",
                url: ajaxurl,
                dataType: "json",
                data: {
                    action: 'duplicator_reset_all_settings',
                    nonce: '<?php echo wp_create_nonce('duplicator_reset_all_settings'); ?>'
                },
                success: function (result) {
                    if (msgDebug) {
                        console.log(result);
                    }

                    if (result.success) {
                        var message = '<?php _e('Backups successfully reset', 'duplicator'); ?>';
                        if (msgDebug) {
                            console.log(result.data.message);
                            console.log(result.data.html);
                        }
<?php
$msg_response_success->updateMessage('message');
$msg_response_success->showMessage();
?>
                    } else {
                        var message = '<?php _e('RESPONSE ERROR!', 'duplicator'); ?>' + '<br><br>' + result.data.message;
                        if (msgDebug) {
                            message += '<br><br>' + result.data.html;
                        }
<?php
$msg_response_error->updateMessage('message');
$msg_response_error->showMessage();
?>
                    }
                },
                error: function (result) {
                    if (msgDebug) {
                        console.log(result);
                    }
<?php $msg_ajax_error->showMessage(); ?>
                }
            });
        };
    });
</script>
