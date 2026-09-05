<?php

use Duplicator\Core\Views\TplMng;
use Duplicator\Utils\LinkManager;

defined("ABSPATH") || exit;

/**
 * Variables
 *
 * @var \Duplicator\Core\Views\TplMng  $tplMng
 * @var array<string, mixed> $tplData
 */
?>
<div class="wrap">
    <h1><?php esc_html_e('Staging', 'duplicator') ?></h1>
    <div class="mock-blur">
        <!-- ====================
        TOOL-BAR -->
        <table class="dpro-edit-toolbar">
            <tbody>
            <tr>
                <td>
                    <select id="bulk_action">
                        <option value="-1" selected="selected">Bulk Actions</option>
                        <option value="delete">Delete</option>
                    </select>
                    <input type="button" class="button action" value="Apply">
                </td>
                <td>
                    <div class="btnnav">
                        <a href="#" class="button">Create Staging Site</a>
                    </div>
                </td>
            </tr>
            </tbody>
        </table>

        <form id="dup-staging-form" action="#" method="post">
            <!-- ====================
            LIST ALL STAGING SITES -->
            <table class="widefat staging-tbl">
                <thead>
                <tr>
                    <th style="width:10px;"><input type="checkbox" id="dup-chk-all" title="Select all staging sites"></th>
                    <th style="width:255px;">Name</th>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Created</th>
                </tr>
                </thead>
                <tbody>
                    <tr class="staging-row">
                        <td>
                            <input type="checkbox" class="item-chk">
                        </td>
                        <td>
                            <a href="#" class="name">Dev Staging</a>
                        </td>
                        <td>https://staging1.example.com</td>
                        <td><b><span class="green">Active</span></b></td>
                        <td>January 10, 2023 12:00</td>
                    </tr>
                    <tr class="staging-row">
                        <td>
                            <input type="checkbox" class="item-chk">
                        </td>
                        <td>
                            <a href="#" class="name">Theme Redesign</a>
                        </td>
                        <td>https://staging2.example.com</td>
                        <td><b><span class="green">Active</span></b></td>
                        <td>February 5, 2023 09:30</td>
                    </tr>
                    <tr class="staging-row">
                        <td>
                            <input type="checkbox" class="item-chk">
                        </td>
                        <td>
                            <a href="#" class="name">Plugin Update Test</a>
                        </td>
                        <td>https://staging3.example.com</td>
                        <td><b>Syncing</b></td>
                        <td>March 1, 2023 14:15</td>
                    </tr>
                    <tr class="staging-row">
                        <td>
                            <input type="checkbox" class="item-chk">
                        </td>
                        <td>
                            <a href="#" class="name">WooCommerce Migration</a>
                        </td>
                        <td>https://staging4.example.com</td>
                        <td><b><span class="green">Active</span></b></td>
                        <td>March 8, 2023 11:00</td>
                    </tr>
                    <tr class="staging-row">
                        <td>
                            <input type="checkbox" class="item-chk">
                        </td>
                        <td>
                            <a href="#" class="name">Security Patch Test</a>
                        </td>
                        <td>https://staging5.example.com</td>
                        <td><b><span class="green">Active</span></b></td>
                        <td>March 12, 2023 08:45</td>
                    </tr>
                </tbody>
                <tfoot>
                <tr>
                    <th colspan="5" style="text-align:right; white-space: nowrap; font-size:12px">
                        Total: 5 | Active: 4 | Syncing: 1</th>
                </tr>
                </tfoot>
            </table>
        </form>
    </div>
</div>
<?php
TplMng::getInstance()->render(
    'parts/Education/static-popup',
    array(
        'title'        => __('Create staging sites to safely test changes!', 'duplicator'),
        'warning-text' => __('Staging sites are not available in Duplicator Lite!', 'duplicator'),
        'content-tpl'  => 'mocks/staging/content-popup',
        'upsell-url'   => LinkManager::getCampaignUrl('blurred-mocks', 'Staging')
    )
);
?>
