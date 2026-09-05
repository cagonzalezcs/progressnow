<?php

/**
 *
 * @package   Duplicator
 * @copyright (c) 2023, Snap Creek LLC
 */

use Duplicator\Core\Controllers\ControllersManager;
use Duplicator\Core\Views\TplMng;

defined("ABSPATH") || exit;

/**
 * Variables
 *
 * @var \Duplicator\Core\Views\TplMng $tplMng
 * @var array<string, mixed> $tplData
 */
?>

<div id="duplicator-welcome">
    <div class="container">
        <?php
        $packageUrl      = ControllersManager::getMenuLink(ControllersManager::PACKAGES_SUBMENU_SLUG, 'new1');
        $packageNonceUrl = wp_nonce_url($packageUrl, 'new1-package');
        TplMng::getInstance()->render(
            'admin_pages/welcome/intro',
            array(
                'packageNonceUrl' => $packageNonceUrl
            )
        );

        TplMng::getInstance()->render('admin_pages/welcome/features');

        TplMng::getInstance()->render('admin_pages/welcome/upgrade-cta');

        TplMng::getInstance()->render('admin_pages/welcome/testimonials');

        TplMng::getInstance()->render(
            'admin_pages/welcome/footer',
            array(
                'packageNonceUrl' => $packageNonceUrl
            )
        );
        ?>
    </div>
</div>
