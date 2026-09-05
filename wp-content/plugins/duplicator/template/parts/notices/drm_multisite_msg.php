<?php

/**
 * @package Duplicator
 */

use Duplicator\Utils\LinkManager;

defined("ABSPATH") or die("");

/**
 * Variables
 *
 * @var Duplicator\Core\Controllers\ControllersManager $ctrlMng
 * @var Duplicator\Core\Views\TplMng $tplMng
 * @var array<string, mixed> $tplData
 */


$upgradeUrl = LinkManager::getCampaignUrl('lite-multisite-notice', 'Upgrade now!')
?>
<span class='dashicons dashicons-warning'></span>
<div class="dup-sub-content">
    <h3 class="margin-bottom-0 margin-top-0">
        <?php esc_html_e('Duplicator Lite does not officially support WordPress multisite functionality', 'duplicator-pro');?>
    </h3>
    <p>
    <?php
    echo esc_html_x(
        'By upgrading to the Elite or Pro plans you will unlock the ability to create backups and do advanced migrations on multi-site installations!',
        '1: name of pro plan, 2: name of elite plan',
        'duplicator-pro'
    );
    ?>
    </p>
    <a class="button primary small target="_blank" href="<?php echo esc_url($upgradeUrl); ?>"><?php esc_html_e('Upgrade Now!', 'duplicator-pro'); ?></a>
</div>
