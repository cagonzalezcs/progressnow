<?php

/**
 * @package   Duplicator
 * @copyright (c) 2022, Snap Creek LLC
 */

namespace Duplicator\Ajax;

use Plugin_Upgrader;
use Duplicator\Ajax\AjaxWrapper;
use Duplicator\Views\EducationElements;
use Exception;
use Duplicator\Libs\OneClickUpgrade\UpgraderSkin;
use DUP_Log;
use DUP_Settings;
use Duplicator\Core\Controllers\ControllersManager;
use Duplicator\Core\Notifications\Notice;
use Duplicator\Libs\Snap\SnapUtil;

class ServicesEducation extends AbstractAjaxService
{
    const OPTION_KEY_ONE_CLICK_UPGRADE_OTH  = 'duplicator_one_click_upgrade_oth';
    const AUTH_TOKEN_KEY_OPTION_AUTO_ACTIVE = 'duplicator_pro_auth_token_auto_active';
    const DUPLICATOR_STORE_URL              = "https://duplicator.com";
    const REMOTE_SUBSCRIBE_URL              = 'https://duplicator.com/?lite_email_signup=1';

    /**
     * Init ajax calls
     *
     * @return void
     */
    public function init()
    {
        $this->addAjaxCall('wp_ajax_duplicator_settings_callout_cta_dismiss', 'dismissCalloutCTA');
        $this->addAjaxCall('wp_ajax_duplicator_packages_bottom_bar_dismiss', 'dismissBottomBar');
        $this->addAjaxCall('wp_ajax_duplicator_email_subscribe', 'setEmailSubscribed');
        $this->addAjaxCall('wp_ajax_duplicator_generate_connect_oth', 'generateConnectOTH');
        $this->addAjaxCall('wp_ajax_nopriv_duplicator_lite_run_one_click_upgrade', 'oneClickUpgrade');
        $this->addAjaxCall('wp_ajax_duplicator_lite_run_one_click_upgrade', 'oneClickUpgrade');
        $this->addAjaxCall('wp_ajax_duplicator_enable_usage_stats', 'enableUsageStats');
    }

    /**
     * Set email subscribed
     *
     * @return bool
     */
    public static function setEmailSubscribedCallback()
    {
        if (EducationElements::userIsSubscribed()) {
            return true;
        }

        $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL, FILTER_NULL_ON_FAILURE);
        if (is_null($email)) {
            throw new \Exception('Invalid email');
        }

        $response = wp_remote_post(self::REMOTE_SUBSCRIBE_URL, array(
            'method'      => 'POST',
            'timeout'     => 45,
            'body'        => array('email' => $email)
        ));

        if (is_wp_error($response) || 200 !== wp_remote_retrieve_response_code($response)) {
            $error_msg = $response->get_error_code() . ': ' . $response->get_error_message();
            SnapUtil::errorLog($error_msg);
            throw new \Exception($error_msg);
        }

        return (update_user_meta(get_current_user_id(), EducationElements::DUP_EMAIL_SUBSCRIBED_OPT_KEY, true) !== false);
    }

    /**
     * Set recovery action
     *
     * @return void
     */
    public function setEmailSubscribed()
    {
        AjaxWrapper::json(
            array(__CLASS__, 'setEmailSubscribedCallback'),
            'duplicator_email_subscribe',
            $_POST['nonce'],
            'export'
        );
    }

    /**
     * Set dismiss callout CTA callback
     *
     * @return bool
     */
    public static function dismissCalloutCTACallback()
    {
        return (update_user_meta(get_current_user_id(), EducationElements::DUP_SETTINGS_FOOTER_CALLOUT_DISMISSED, true) !== false);
    }

    /**
     * Dismiss callout CTA
     *
     * @return void
     */
    public function dismissCalloutCTA()
    {
        AjaxWrapper::json(
            array(__CLASS__, 'dismissCalloutCTACallback'),
            'duplicator_settings_callout_cta_dismiss',
            $_POST['nonce'],
            'export'
        );
    }

    /**
     * Dismiss bottom bar callback
     *
     * @return bool
     */
    public static function dismissBottomBarCallback()
    {
        return (update_user_meta(get_current_user_id(), EducationElements::DUP_PACKAGES_BOTTOM_BAR_DISMISSED, true) !== false);
    }

    /**
     * Dismiss bottom bar
     *
     * @return void
     */
    public function dismissBottomBar()
    {
        AjaxWrapper::json(
            array(__CLASS__, 'dismissBottomBarCallback'),
            'duplicator_packages_bottom_bar_dismiss',
            $_POST['nonce'],
            'export'
        );
    }


    /**
     * Generate OTH for connect flow
     *
     * @return void
     */
    public function generateConnectOTH()
    {
        AjaxWrapper::json(
            array(__CLASS__, 'generateConnectOTHCallback'),
            'duplicator_generate_connect_oth',
            SnapUtil::sanitizeTextInput(INPUT_POST, 'nonce'),
            'export'
        );
    }

    /**
     * Generate OTH for connect flow callback
     *
     * @return array
     * @throws Exception
     */
    public static function generateConnectOTHCallback()
    {
        $oth        = wp_generate_password(30, false, false);
        $hashed_oth = self::hashOth($oth);

        // Save HASHED OTH with TTL for security
        $oth_data = array(
            'token' => $hashed_oth,  // Store hashed OTH for decryption
            'created_at' => time(),
            'expires_at' => time() + (10 * MINUTE_IN_SECONDS) // 10 minute expiration
        );

        delete_option(self::OPTION_KEY_ONE_CLICK_UPGRADE_OTH);
        $ok = update_option(self::OPTION_KEY_ONE_CLICK_UPGRADE_OTH, $oth_data);

        if (!$ok) {
            throw new Exception("Problem saving security token.");
        }

        return array(
            'success' => true,
            'oth' => $hashed_oth,
            'php_version' => phpversion(),
            'wp_version' => get_bloginfo('version'),
            'redirect_url' => admin_url('admin-ajax.php?action=duplicator_lite_run_one_click_upgrade')
        );
    }


    /**
     * Returh hashed OTH
     *
     * @param string $oth OTH
     *
     * @return string Hashed OTH
     */
    protected static function hashOth($oth)
    {
        return  hash_hmac('sha512', $oth, wp_salt());
    }

    /**
     * Decrypt data using OTH-based key.
     *
     * @param string $encryptedData Base64 encoded encrypted data
     * @param string $oth           The OTH token
     *
     * @return string|false Decrypted data or false on failure
     */
    protected static function decryptData($encryptedData, $oth)
    {
        try {
            $encryption_key = substr(hash('sha256', $oth), 0, 32); // 32-byte key from OTH
            $iv             = substr($oth, 0, 16); // 16-byte IV from OTH

            $encrypted = base64_decode($encryptedData);
            return openssl_decrypt($encrypted, 'AES-256-CBC', $encryption_key, 0, $iv);
        } catch (Exception $e) {
            DUP_Log::trace("ERROR: Decryption failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Decrypt and parse encrypted package from service.
     *
     * @param string $encryptedPackage Base64 encoded encrypted package
     * @param string $oth              The OTH token
     *
     * @return array|false Parsed package data or false on failure
     */
    protected static function decryptPackage($encryptedPackage, $oth)
    {
        $decrypted = self::decryptData($encryptedPackage, $oth);

        if ($decrypted === false) {
            return false;
        }

        $package = json_decode($decrypted, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            DUP_Log::trace("ERROR: Invalid JSON in decrypted package");
            return false;
        }

        return $package;
    }


    /**
     * Enable usage stats
     *
     * @return void
     */
    public function enableUsageStats()
    {
        AjaxWrapper::json(
            array(__CLASS__, 'enableUsageStatsCallback'),
            'duplicator_enable_usage_stats',
            SnapUtil::sanitizeTextInput(INPUT_POST, 'nonce'),
            'manage_options'
        );
    }

    /**
     * Enable usage stats callback
     *
     * @return void
     */
    public static function enableUsageStatsCallback()
    {
        $result = true;
        if (DUP_Settings::Get('usage_tracking') !== true) {
            DUP_Settings::setUsageTracking(true);
            $result = DUP_Settings::Save();
        }

        return $result && self::setEmailSubscribedCallback();
    }


    /**
     * Accepts encrypted package from remote endpoint, after validating the OTH.
     *
     * @return void
     */
    public function oneClickUpgrade()
    {
        try {
            // Get encrypted package from service
            $encryptedPackage = sanitize_text_field($_REQUEST["package"] ?? '');

            if (empty($encryptedPackage)) {
                DUP_Log::trace("ERROR: No encrypted package received from service.");
                throw new Exception("No encrypted package received from service");
            }

            // Get OTH data for validation
            $oth_data = get_option(self::OPTION_KEY_ONE_CLICK_UPGRADE_OTH);

            if (empty($oth_data) || !is_array($oth_data)) {
                DUP_Log::trace("ERROR: Invalid OTH data structure.");
                throw new Exception("Invalid security token");
            }

            // Check TTL expiration
            if (time() > $oth_data['expires_at']) {
                DUP_Log::trace("ERROR: OTH token expired.");
                delete_option(self::OPTION_KEY_ONE_CLICK_UPGRADE_OTH);
                throw new Exception("Security token expired");
            }

            // Decrypt package using OTH
            $package = self::decryptPackage($encryptedPackage, $oth_data['token']);

            if ($package === false) {
                DUP_Log::trace("ERROR: Failed to decrypt package from service.");
                throw new Exception("Invalid encrypted data");
            }

            // Extract data from decrypted package
            $download_url = $package['download_url'] ?? '';
            $auth_token   = $package['auth_token'] ?? '';

            if (empty($download_url)) {
                DUP_Log::trace("ERROR: No download URL in decrypted package.");
                throw new Exception("No download URL provided");
            }

            // Delete OTH so it cannot be replayed (single-use)
            delete_option(self::OPTION_KEY_ONE_CLICK_UPGRADE_OTH);

            // Save authentication token for Pro to use
            if (!empty($auth_token)) {
                delete_option(self::AUTH_TOKEN_KEY_OPTION_AUTO_ACTIVE);
                update_option(self::AUTH_TOKEN_KEY_OPTION_AUTO_ACTIVE, $auth_token);
                DUP_Log::trace("Authentication token saved for Pro activation.");
            }

            // Validate download URL format
            if (!filter_var($download_url, FILTER_VALIDATE_URL)) {
                DUP_Log::trace("ERROR: Invalid download URL format: " . $download_url);
                throw new Exception("Invalid download URL format");
            }

            // Install Pro if not already installed
            if (!is_dir(WP_PLUGIN_DIR . "/duplicator-pro")) {
                DUP_Log::trace("Installing Pro using service-provided URL: " . $download_url);

                // Request filesystem credentials
                $url   = esc_url_raw(add_query_arg(array('page' => 'duplicator-settings'), admin_url('admin.php')));
                $creds = request_filesystem_credentials($url, '', false, false, null);

                if (false === $creds || ! \WP_Filesystem($creds)) {
                    wp_send_json_error(array('message' => 'File system permissions error. Please check permissions and try again.'));
                }

                // Install the plugin
                require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
                remove_action('upgrader_process_complete', array('Language_Pack_Upgrader', 'async_upgrade'), 20);

                $installer = new Plugin_Upgrader(new UpgraderSkin());
                $result    = $installer->install($download_url);

                if (is_wp_error($result)) {
                    DUP_Log::trace("ERROR: Plugin installation failed: " . $result->get_error_message());
                    throw new Exception('Plugin installation failed: ' . $result->get_error_message());
                }

                wp_cache_flush();
                $plugin_basename = $installer->plugin_info();

                if ($plugin_basename) {
                    $upgradeDir = dirname($plugin_basename);
                    if ($upgradeDir != "duplicator-pro" && !rename(WP_PLUGIN_DIR . "/" . $upgradeDir, WP_PLUGIN_DIR . "/duplicator-pro")) {
                        throw new Exception('Failed renaming plugin directory');
                    }
                } else {
                    throw new Exception('Installation of upgrade version failed');
                }
            }

            $newFolder = WP_PLUGIN_DIR . "/duplicator-pro";
            if (!is_dir($newFolder)) {
                DUP_Log::trace("ERROR: Duplicator Pro folder not found after installation");
                throw new Exception('Pro plugin installation failed - folder not created');
            }

            // Deactivate Lite FIRST (critical for avoiding conflicts)
            deactivate_plugins(DUPLICATOR_PLUGIN_PATH . "/duplicator.php");

            // Create activation URL for Pro
            $plugin          = "duplicator-pro/duplicator-pro.php";
            $pluginsAdminUrl = is_multisite() ? network_admin_url('plugins.php') : admin_url('plugins.php');
            $activateProUrl  = esc_url_raw(
                add_query_arg(
                    array(
                        'action' => 'activate',
                        'plugin' => $plugin,
                        '_wpnonce' => wp_create_nonce("activate-plugin_$plugin")
                    ),
                    $pluginsAdminUrl
                )
            );

            // Redirect to WordPress activation URL
            DUP_Log::trace("Pro installation successful. Redirecting to activation URL: " . $activateProUrl);
            wp_safe_redirect($activateProUrl);
            exit;
        } catch (Exception $e) {
            DUP_Log::trace("ERROR in oneClickUpgrade: " . $e->getMessage());

            // Add error notice and redirect to settings page
            Notice::error(
                sprintf(__('Upgrade installation failed: %s. Please try again or install manually.', 'duplicator'), $e->getMessage()),
                'one_click_upgrade_failed'
            );

            $settingsUrl = ControllersManager::getMenuLink(
                ControllersManager::SETTINGS_SUBMENU_SLUG,
                'general'
            );

            wp_safe_redirect($settingsUrl);
            exit;
        }
    }
}
