<?php

use Duplicator\Utils\ExtraPlugins\ExtraPluginsMng;
use Duplicator\Utils\LinkManager;

defined("ABSPATH") || exit;

/**
 * Variables
 *
 * @var \Duplicator\Core\Views\TplMng $tplMng
 * @var array<string, mixed> $tplData
 */
?>
<div id="db-reset-content-wrapper">
    <h1>
        <?php esc_html_e('Clean & Reset WordPress Database', 'duplicator'); ?>
    </h1>
    <div id="dup-admin-addons" class="full">
        <?php
        $extraPluginsMng = ExtraPluginsMng::getInstance();
        $plugin          = $extraPluginsMng->getBySlug('db-reset-pro/db-reset-pro.php');

        $tplMng->render(
            'admin_pages/about_us/about_us/extra_plugin_item',
            array('plugin' => $plugin->skipLite() ? $plugin->getPro() : $plugin)
        );
        ?>
    </div>
    <p>
        <b>The Simplest Database Reset Solution</b>
    </p>
    <div class="two-cols-valig" >
        <div>
            <img 
                src="<?php echo DUPLICATOR_PLUGIN_URL ?>assets/img/db-reset-plugin.png" 
                alt="Database Reset Pro Screenshot"
            ></img>
        </div>
        <ul class="arrow-list">
            <li>One-Click Operation – No complex settings or configurations</li>
            <li>Clear Visual Interface – Know exactly what will happen before you click</li>
            <li>Instant Reset – Complete database reset in seconds, not minutes</li>
            <li>No Learning Curve – If you can click a button, you can use this plugin</li>
        </ul>
    </div>
</div>
