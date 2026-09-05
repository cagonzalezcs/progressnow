<?php

/**
 * NoticeBar Education template for Lite.
 *
 * @package Duplicator
 */

use Duplicator\Controllers\AboutUsController;
use Duplicator\Core\Controllers\ControllersManager;
use Duplicator\Utils\LinkManager;

defined("ABSPATH") || exit;

/**
 * Variables
 *
 * @var \Duplicator\Core\Views\TplMng  $tplMng
 * @var array<string, mixed> $tplData
 */

$facebookIcon = '<svg width="16" height="16" aria-hidden="true"><path fill="#A7AAAD" d="M16 8.05A8.02 8.02 0 0 0 8 0C3.58 0 0 3.6 0 8.05A8 8 0 0 0 6.74 16v-5.61H4.71V8.05h2.03V6.3c0-2.02 1.2-3.15 3-3.15.9 0 1.8.16 1.8.16v1.98h-1c-1 0-1.31.62-1.31 1.27v1.49h2.22l-.35 2.34H9.23V16A8.02 8.02 0 0 0 16 8.05Z"/></svg>'; // phpcs:disable Generic.Files.LineLength.TooLong
$xIcon        = '<svg width="16" height="16" aria-hidden="true" viewBox="0 0 512 512"><path fill="#A7AAAD" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>'; // phpcs:disable Generic.Files.LineLength.TooLong
$youtubeIcon  = '<svg width="17" height="16" aria-hidden="true"><path fill="#A7AAAD" d="M16.63 3.9a2.12 2.12 0 0 0-1.5-1.52C13.8 2 8.53 2 8.53 2s-5.32 0-6.66.38c-.71.18-1.3.78-1.49 1.53C0 5.2 0 8.03 0 8.03s0 2.78.37 4.13c.19.75.78 1.3 1.5 1.5C3.2 14 8.51 14 8.51 14s5.28 0 6.62-.34c.71-.2 1.3-.75 1.49-1.5.37-1.35.37-4.13.37-4.13s0-2.81-.37-4.12Zm-9.85 6.66V5.5l4.4 2.53-4.4 2.53Z"/></svg>'; // phpcs:disable Generic.Files.LineLength.TooLong    
$links        = [
    [
        'url'    => 'https://wordpress.org/support/plugin/duplicator/',
        'text'   => __('Support', 'duplicator'),
    ],
    [
        'url'    => LinkManager::getDocUrl('', 'plugin-lite-footer'),
        'text'   => __('Docs', 'duplicator')
    ],
    [
        'url'    => 'https://duplicator.com/migration-services/',
        'text'   => __('Migration Services', 'duplicator')
    ],
    [
        'url'  => ControllersManager::getMenuLink(ControllersManager::ABOUT_US_SUBMENU_SLUG, AboutUsController::ABOUT_US_TAB),
        'text' => __('Free Plugins', 'duplicator'),
    ],
];
$count        = count($links);

?>
<div class="duplicator-footer-promotion">
    <p>
        <?php esc_html_e('Made with ♥ by the Duplicator Team', 'duplicator'); ?>
    </p>
    <ul class="duplicator-footer-promotion-links">
        <?php foreach ($links as $i => $item) : ?>
            <li>
                <a href="<?php echo esc_url($item['url']); ?>" target="_blank" rel="noopener noreferrer">
                    <?php echo esc_html($item['text']); ?>
                </a>
                <?php if ($i < $count - 1) : ?>
                    <span>/</span>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ul>
    <ul class="duplicator-footer-promotion-social">
        <li>
            <a href="https://www.facebook.com/snapcreek/" target="_blank" rel="noopener noreferrer">
                <?php echo $facebookIcon; ?>
                <span class="screen-reader-text"><?php echo esc_html('Facebook'); ?></span>
            </a>
        </li>
        <li>
            <a href="https://x.com/duplicatorwp" target="_blank" rel="noopener noreferrer">
                <?php echo $xIcon; ?>
                <span class="screen-reader-text"><?php echo esc_html('X'); ?></span>
            </a>
        </li>
        <li>
            <a href="https://www.youtube.com/c/Snapcreek" target="_blank" rel="noopener noreferrer">
                <?php echo $youtubeIcon; ?>
                <span class="screen-reader-text"><?php echo esc_html('YouTube'); ?></span>
            </a>
        </li>
    </ul>
</div>