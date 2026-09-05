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
use Duplicator\Libs\Snap\SnapUtil;

global $wp_version;
global $wpdb;

$action_updated  = null;
$action_response = __("Misc Settings Saved", 'duplicator');

//SAVE RESULTS
if (isset($_POST['action']) && $_POST['action'] == 'save') {
    //Nonce Check
    if (!isset($_POST['dup_settings_save_nonce_field']) || !wp_verify_nonce($_POST['dup_settings_save_nonce_field'], 'dup_settings_save')) {
        die('Invalid token permissions to perform this request.');
    }

    DUP_Settings::Set('uninstall_settings', isset($_POST['uninstall_settings']) ? "1" : "0");
    DUP_Settings::Set('uninstall_files', isset($_POST['uninstall_files']) ? "1" : "0");
    DUP_Settings::Set('package_debug', isset($_POST['package_debug']) ? "1" : "0");

    $usage_tracking = filter_input(INPUT_POST, 'usage_tracking', FILTER_VALIDATE_BOOLEAN);
    DUP_Settings::setUsageTracking($usage_tracking);

    $amNotices = !SnapUtil::sanitizeBoolInput(INPUT_POST, 'dup_am_notices');
    DUP_Settings::Set('amNotices', $amNotices);

    if (isset($_REQUEST['trace_log_enabled'])) {
        dup_log::trace("#### trace log enabled");
        // Trace on

        if (DUP_Settings::Get('trace_log_enabled') == 0) {
            DUP_Log::DeleteTraceLog();
        }

        DUP_Settings::Set('trace_log_enabled', 1);
    } else {
        dup_log::trace("#### trace log disabled");

        // Trace off
        DUP_Settings::Set('trace_log_enabled', 0);
    }

    DUP_Settings::Save();
    $action_updated = true;
    DUP_Util::initSnapshotDirectory();
}

$trace_log_enabled  = DUP_Settings::Get('trace_log_enabled');
$uninstall_settings = DUP_Settings::Get('uninstall_settings');
$uninstall_files    = DUP_Settings::Get('uninstall_files');
$package_debug      = DUP_Settings::Get('package_debug');
$actionUrl          = ControllersManager::getMenuLink(ControllersManager::SETTINGS_SUBMENU_SLUG, 'misc');
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

    <h3 class="title"><?php esc_html_e("Plugin", 'duplicator') ?> </h3>
    <hr size="1" />
    <table class="form-table">
        <tr valign="top">
            <th scope="row"><label><?php esc_html_e("Version", 'duplicator'); ?></label></th>
            <td>
                <?php
                    echo DUPLICATOR_VERSION;
                ?>
            </td>
        </tr>
        <tr valign="top">
            <th scope="row"><label><?php esc_html_e("Uninstall", 'duplicator'); ?></label></th>
            <td>
                <p>
                    <input type="checkbox" name="uninstall_settings" id="uninstall_settings" <?php echo ($uninstall_settings) ? 'checked="checked"' : ''; ?> />
                    <label for="uninstall_settings"><?php esc_html_e("Delete Plugin Settings", 'duplicator') ?> </label>
                </p>
                <p>
                    <input type="checkbox" name="uninstall_files" id="uninstall_files" <?php echo ($uninstall_files) ? 'checked="checked"' : ''; ?> />
                    <label for="uninstall_files"><?php esc_html_e("Delete Entire Storage Directory", 'duplicator') ?></label><br/>
                </p>
            </td>
        </tr>
        <tr valign="top">
            <th scope="row"><label><?php esc_html_e("Usage statistics", 'duplicator'); ?></label></th>
            <td>
                <?php if (DUPLICATOR_USTATS_DISALLOW) {  // @phpstan-ignore-line ?>
                    <span class="maroon">
                        <?php _e('Usage statistics are hardcoded disallowed.', 'duplicator'); ?>
                    </span>
                <?php } else { ?>
                    <input
                        type="checkbox"
                        name="usage_tracking"
                        id="usage_tracking"
                        value="1"
                        <?php checked(DUP_Settings::Get('usage_tracking')); ?>
                    >
                    <label for="usage_tracking"><?php _e("Enable usage tracking", 'duplicator'); ?> </label>
                    <i
                            class="fas fa-question-circle fa-sm"
                            data-tooltip-title="<?php esc_attr_e("Usage Tracking", 'duplicator'); ?>"
                            data-tooltip="<?php echo esc_attr($tplMng->render('admin_pages/settings/general/usage_tracking_tooltip', array(), false)); ?>"
                            data-tooltip-width="600"
                    >
                    </i>
                <?php } ?>
            </td>
        </tr>
        <tr valign="top">
            <th scope="row"><label><?php esc_html_e("Hide Announcements", 'duplicator'); ?></label></th>
            <td>
                <input
                    type="checkbox"
                    name="dup_am_notices"
                    id="dup_am_notices"
                    <?php checked(!DUP_Settings::Get('amNotices')); ?>
                />
                <label for="dup_am_notices">
                    <?php esc_html_e("Check this option to hide plugin announcements and update details.", 'duplicator') ?>
                </label>
            </td>
        </tr>
    </table>

    <h3 class="title"><?php esc_html_e("Debug", 'duplicator') ?> </h3>
    <hr size="1" />
    <table class="form-table">
        <tr>
            <th scope="row"><label><?php esc_html_e("Debugging", 'duplicator'); ?></label></th>
            <td>
                <input type="checkbox" name="package_debug" id="package_debug" <?php echo ($package_debug) ? 'checked="checked"' : ''; ?> />
                <label for="package_debug"><?php esc_html_e("Enable debug options throughout user interface", 'duplicator'); ?></label>
            </td>
        </tr>
        <tr valign="top">
            <th scope="row"><label><?php esc_html_e("Trace Log", 'duplicator'); ?></label></th>
            <td>
                <input type="checkbox" name="trace_log_enabled" id="trace_log_enabled" <?php echo ($trace_log_enabled == 1) ? 'checked="checked"' : ''; ?> />
                <label for="trace_log_enabled"><?php esc_html_e("Enabled", 'duplicator') ?> </label><br/>
                <p class="description">
                    <?php
                    esc_html_e('Turns on detailed operation logging. Logging will occur in both PHP error and local trace logs.', 'duplicator');
                    echo ('<br/>');
                    esc_html_e('WARNING: Only turn on this setting when asked to by support as tracing will impact performance.', 'duplicator');
                    ?>
                </p><br/>
                <button class="button" <?php
                if (!DUP_Log::TraceFileExists()) {
                    echo 'disabled';
                }
                ?> onclick="Duplicator.Pack.DownloadTraceLog(); return false">
                    <i class="fa fa-download"></i> <?php echo esc_html__('Download Trace Log', 'duplicator') . ' (' . DUP_LOG::GetTraceStatus() . ')'; ?>
                </button>
            </td>
        </tr>
    </table><br/>

    <p class="submit" style="margin: 20px 0px 0xp 5px;">
        <br/>
        <input
            type="submit"
            name="submit"
            id="submit"
            class="button-primary"
            value="<?php esc_attr_e("Save Misc Settings", 'duplicator') ?>"
            style="display: inline-block;"
        />
    </p>

</form>

<script>
    jQuery(document).ready(function ($)
    {
        // which: 0=installer, 1=archive, 2=sql file, 3=log
        Duplicator.Pack.DownloadTraceLog = function ()
        {
            var actionLocation = ajaxurl + '?action=DUP_CTRL_Tools_getTraceLog&nonce=' + '<?php echo wp_create_nonce('DUP_CTRL_Tools_getTraceLog'); ?>';
            location.href = actionLocation;
        };
    });
</script>
