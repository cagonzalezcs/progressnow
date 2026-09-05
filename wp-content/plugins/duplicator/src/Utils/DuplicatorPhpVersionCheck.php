<?php

/**
 * These functions are performed before including any other Duplicator file so
 * do not use any Duplicator library or feature and use code compatible with PHP 5.2
 */

defined('ABSPATH') || exit;

// In the future it will be included on both PRO and LITE so you need to check if the define exists.
if (!class_exists('DuplicatorPhpVersionCheck')) {

    class DuplicatorPhpVersionCheck // phpcs:ignore 
    {
        /** @var string */
        protected static $minVer = '';
        /** @var string */
        protected static $suggestedVer = '';

        /**
         * Check PhpVersin
         *
         * @param string $minVer       min version of PHP
         * @param string $suggestedVer suggested version of PHP
         *
         * @return bool
         */
        public static function check($minVer, $suggestedVer)
        {
            self::$minVer       = $minVer;
            self::$suggestedVer = $suggestedVer;

            if (version_compare(PHP_VERSION, self::$minVer, '<')) {
                if (is_multisite()) {
                    add_action('network_admin_notices', array(__CLASS__, 'notice'));
                } else {
                    add_action('admin_notices', array(__CLASS__, 'notice'));
                }
                return false;
            } else {
                return true;
            }
        }

        /**
         * Display notice
         *
         * @return void
         */
        public static function notice()
        {
            if (preg_match('/^(\d+\.\d+(?:\.\d+)?)/', PHP_VERSION, $matches) === 1) {
                $phpVersion = $matches[1];
            } else {
                $phpVersion = PHP_VERSION;
            }
            ?>
            <div class="error notice">
                <p>
                    <?php
                    echo wp_kses(
                        sprintf(
                            __(
                                'DUPLICATOR: Action Required - <b>PHP Version Update Needed</b>, Your site is running PHP version %s.',
                                'duplicator'
                            ),
                            esc_html($phpVersion)
                        ),
                        [
                            'b' => [],
                        ]
                    );
                    ?><br><br>
                    <?php
                    echo wp_kses(
                        sprintf(
                            __(
                                'Starting from <b>Duplicator %1$s</b>, Duplicator will require <b>PHP %2$s or higher</b> to receive new updates.',
                                'duplicator'
                            ),
                            '1.5.12',
                            esc_html(self::$minVer)
                        ),
                        [
                            'b' => [],
                        ]
                    );
                    ?><br>
                    <?php
                    esc_html_e(
                        'While your current version of Duplicator will continue to work, 
                        you\'ll need to upgrade your PHP version to receive future features, improvements, and security updates.',
                        'duplicator'
                    );
                    ?><br>
                    <?php
                    esc_html_e(
                        'Please contact your hosting provider to upgrade your PHP version.',
                        'duplicator'
                    );
                    ?>
                </p>
                <p>
                    <a href="https://duplicator.com/knowledge-base/updating-your-php-version-in-wordpress/" target="_blank">
                        <?php esc_html_e('Learn more about this change and how to upgrade', 'duplicator'); ?>
                    </a>
                </p>
            </div>
            <?php
        }
    }
}
