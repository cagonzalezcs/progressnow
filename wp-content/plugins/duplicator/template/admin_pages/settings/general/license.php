<?php

/**
 * License section template for General settings
 *
 * @package   Duplicator
 * @copyright (c) 2022, Snap Creek LLC
 */

defined("ABSPATH") || exit;

use Duplicator\Utils\LinkManager;

?>

<h3 class="title"><?php esc_html_e('License', 'duplicator'); ?> </h3>
<hr size="1" />
<table class="form-table licenses-table">
    <tr valign="top">
        <th scope="row"><label><?php esc_html_e('License Key', 'duplicator'); ?></label></th>
        <td>
            <div class="description" style="max-width:700px">
                <p><?php esc_html_e('You\'re using Duplicator Lite - no license needed. Enjoy!', 'duplicator'); ?> 🙂</p>
                <p>
                    <?php printf(
                        wp_kses(
                            __('To unlock more features consider <strong><a href="%s" target="_blank"
                            rel="noopener noreferrer">upgrading to PRO</a></strong>.', 'duplicator'),
                            array(
                                'a'      => array(
                                    'href'   => array(),
                                    'class'  => array(),
                                    'target' => array(),
                                    'rel'    => array(),
                                ),
                                'strong' => array(),
                            )
                        ),
                        esc_url(LinkManager::getCampaignUrl('license-tab', 'upgrading to PRO'))
                    ); ?>
                </p>
                <p class="discount-note">
                    <?php
                    printf(
                        __(
                            'As a valued Duplicator Lite user you receive <strong>%1$d%% off</strong>, automatically applied at checkout!',
                            'duplicator'
                        ),
                        DUP_Constants::UPSELL_DEFAULT_DISCOUNT
                    );
                    ?>
                </p>
                <hr>
                <p>
                    <?php _e('Already purchased? Connect to unlock <b>Duplicator PRO!</b>', 'duplicator'); ?></p>
                <p>
                    <button type="button" class="dup-btn dup-btn-md dup-btn-orange" id="dup-settings-connect-btn">
                        <?php echo esc_html__('Connect to Duplicator Pro', 'duplicator'); ?>
                    </button>
                </p>
                <p>
                    <small><?php esc_html_e('This opens connect.duplicator.com where you\'ll securely connect to Duplicator Pro.', 'duplicator'); ?></small>
                </p>
            </div>
        </td>
    </tr>
</table>
