<?php

use Duplicator\Libs\Snap\SnapIO;
use Duplicator\Utils\Email\EmailSummary;
use Duplicator\Utils\Email\EmailSummaryBootstrap;
use Duplicator\Utils\UsageStatistics\CommStats;

abstract class DUP_Archive_Build_Mode
{
    const Unconfigured = -1;
    const Auto         = 0;
    // should no longer be used
    //  const Shell_Exec   = 1;
    const ZipArchive = 2;
    const DupArchive = 3;
}

/**
 * Maintains the settings for the Duplicator plugin.
 */
class DUP_Settings
{
    const UNINSTALL_PACKAGE_OPTION_KEY  = 'duplicator_uninstall_package';
    const UNINSTALL_SETTINGS_OPTION_KEY = 'duplicator_uninstall_settings';

    const OPT_SETTINGS                  = 'duplicator_settings';
    const INSTALLER_NAME_MODE_WITH_HASH = 'withhash';
    const INSTALLER_NAME_MODE_SIMPLE    = 'simple';
    const STORAGE_POSITION_WP_CONTENT   = 'wpcont';
    const SSDIR_NAME_NEW                = 'backups-dup-lite';

    /**
     * @deprecated since 1.5.14. Use STORAGE_POSITION_WP_CONTENT instead.
     */
    const STORAGE_POSITION_LEGACY = 'legacy';

    /**
     * @deprecated since 1.5.14. Use SSDIR_NAME_NEW instead.
     */
    const SSDIR_NAME_LEGACY = 'wp-snapshots';

    protected static $Data      = array();
    protected static $ssDirPath = null;
    protected static $ssDirUrl  = null;

    /**
     *  Class used to manage all the settings for the plugin
     */
    public static function init(): void
    {
        static $initialized = null;
        if ($initialized == null) {
            $initialized = true; // Must be at the top of the function to prvent infinite loop
            $defaults    = (array) self::GetAllDefaults();
            $data        = (array) get_option(self::OPT_SETTINGS);
            self::$Data  = array_merge($defaults, $data);
            // when the plugin updated, this will be true
            if (empty(self::$Data) || empty(self::$Data['version']) || version_compare(DUPLICATOR_VERSION, self::$Data['version'], '>')) {
                self::SetDefaults();
            }
        }
    }

    /**
     *  Find the setting value
     *
     *  @param string $key  The name of the key to find
     *
     *  @return ?scalar value stored in the key returns null if key does not exist
     */
    public static function Get($key = '')
    {
        self::init();
        $result = null;
        if (isset(self::$Data[$key])) {
            $result = self::$Data[$key];
        } else {
            $defaults = self::GetAllDefaults();
            if (isset($defaults[$key])) {
                $result = $defaults[$key];
            }
        }
        return $result;
    }

    /**
     *  Set the settings value in memory only
     *
     *  @param string $key      The name of the key to find
     *  @param string $value        The value to set
     *  remarks:     The Save() method must be called to write the Settings object to the DB
     */
    public static function Set($key, $value): void
    {
        self::init();
        if ($key == 'usage_tracking') {
            self::setUsageTracking($value);
            return;
        }
        if (isset(self::$Data[$key])) {
            self::$Data[$key] = ($value == null) ? '' : $value;
        } elseif (!empty($key)) {
            self::$Data[$key] = ($value == null) ? '' : $value;
        }
    }

    /**
     * Set usage tracking
     *
     * @param bool $value value
     *
     * @return void
     */
    public static function setUsageTracking($value): void
    {
        if (DUPLICATOR_USTATS_DISALLOW) { // @phpstan-ignore-line
            // If usagfe tracking is hardcoded disabled, don't change the setting value
            return;
        }

        if (!isset(self::$Data['usage_tracking'])) {
            self::$Data['usage_tracking'] = false;
        }

        $value    = (bool) $value;
        $oldValue = self::$Data['usage_tracking'];

        self::$Data['usage_tracking'] = $value;

        if ($value == false && $oldValue != $value) {
            CommStats::disableUsageTracking();
        }
    }

    /**
     * Set the storage position
     *
     * @deprecated since 1.5.14. Storage is now always in wp-content.
     *
     * @param string $newPosition The new storage position
     *
     * @return bool True if the position was set, false otherwise
     */
    public static function setStoragePosition($newPosition)
    {
        self::init();

        $legacyPath     = self::getSsdirPathLegacy();
        $wpContPath     = self::getSsdirPathWpCont();
        $oldStoragePost = self::Get('storage_position');
        self::resetPositionVars();
        switch ($newPosition) {
            case self::STORAGE_POSITION_LEGACY:
                self::$Data['storage_position'] = self::STORAGE_POSITION_LEGACY;
                if (!DUP_Util::initSnapshotDirectory()) {
                    self::resetPositionVars();
                    self::$Data['storage_position'] = $oldStoragePost;
                    return false;
                }
                if (is_dir($wpContPath)) {
                    if (SnapIO::rcopy($wpContPath, $legacyPath)) {
                        SnapIO::rrmdir($wpContPath);
                    }
                }
                break;
            case self::STORAGE_POSITION_WP_CONTENT:
                self::$Data['storage_position'] = self::STORAGE_POSITION_WP_CONTENT;
                if (!DUP_Util::initSnapshotDirectory()) {
                    self::resetPositionVars();
                    self::$Data['storage_position'] = $oldStoragePost;
                    return false;
                }
                if (is_dir($legacyPath)) {
                    if (SnapIO::rcopy($legacyPath, $wpContPath)) {
                        SnapIO::rrmdir($legacyPath);
                    }
                }
                break;
            default:
                throw new Exception('Unknown storage position');
        }

        return true;
    }

    /**
     * Reset the position variables
     *
     * @return void
     */
    protected static function resetPositionVars(): void
    {
        self::$ssDirPath = null;
        self::$ssDirUrl  = null;
    }

    /**
     *  Saves all the setting values to the database
     *
     *  @return bool True if option value has changed, false if not or if update failed.
     */
    public static function Save()
    {
        self::init();

        update_option(self::UNINSTALL_PACKAGE_OPTION_KEY, self::$Data['uninstall_files']);
        update_option(self::UNINSTALL_SETTINGS_OPTION_KEY, self::$Data['uninstall_settings']);
        return update_option(self::OPT_SETTINGS, self::$Data);
    }

    /**
     *  Deletes all the setting values to the database
     *
     *  @return bool true if option value has changed, false if not or if update failed.
     */
    public static function Delete()
    {
        $defaults   = self::GetAllDefaults();
        self::$Data = apply_filters('duplicator_defaults_settings', $defaults);
        return delete_option(self::OPT_SETTINGS);
    }

    /**
     *  Sets the defaults if they have not been set
     *
     *  @return bool True if option value has changed, false if not or if update failed.
     */
    public static function SetDefaults()
    {
        $defaults   = self::GetAllDefaults();
        self::$Data = apply_filters('duplicator_defaults_settings', $defaults);
        return self::Save();
    }

    /**
     *  DeleteWPOption: Cleans up legacy data
     */
    public static function DeleteWPOption($optionName)
    {
        if (in_array($optionName, $GLOBALS['DUPLICATOR_OPTS_DELETE'])) {
            return delete_option($optionName);
        }
        return false;
    }

    /**
     * Get all defaults
     *
     * @return array The defaults
     */
    public static function GetAllDefaults()
    {
        $default            = array();
        $default['version'] = DUPLICATOR_VERSION;
        //Flag used to remove the wp_options value duplicator_settings which are all the settings in this class
        $default['uninstall_settings'] = isset(self::$Data['uninstall_settings']) ? self::$Data['uninstall_settings'] : true;
        //Flag used to remove entire wp-snapshot directory
        $default['uninstall_files'] = isset(self::$Data['uninstall_files']) ? self::$Data['uninstall_files'] : true;
        //Flag used to show debug info
        $default['package_debug'] = isset(self::$Data['package_debug']) ? self::$Data['package_debug'] : false;
        //Frequency of email summary
        $default['email_summary_frequency'] = isset(self::$Data['email_summary_frequency'])
            ? self::$Data['email_summary_frequency'] : EmailSummary::SEND_FREQ_WEEKLY;
        //Setting to enable AM notifications
        $default['amNotices'] = isset(self::$Data['amNotices']) ? self::$Data['amNotices'] : true;
        //Flag used to enable mysqldump
        $default['package_mysqldump'] = isset(self::$Data['package_mysqldump']) ? self::$Data['package_mysqldump'] : true;
        //Optional mysqldump search path
        $default['package_mysqldump_path'] = isset(self::$Data['package_mysqldump_path']) ? self::$Data['package_mysqldump_path'] : '';
        //Optional mysql limit size
        $default['package_phpdump_qrylimit'] = isset(self::$Data['package_phpdump_qrylimit']) ? self::$Data['package_phpdump_qrylimit'] : "100";
        //Optional mysqldump search path
        $default['package_zip_flush'] = isset(self::$Data['package_zip_flush']) ? self::$Data['package_zip_flush'] : false;
        //Optional mysqldump search path
        $default['installer_name_mode'] = isset(self::$Data['installer_name_mode']) ? self::$Data['installer_name_mode'] : self::INSTALLER_NAME_MODE_SIMPLE;
        // storage position
        $default['storage_position'] = isset(self::$Data['storage_position']) ? self::$Data['storage_position'] : self::STORAGE_POSITION_WP_CONTENT;
        //Flag for .htaccess file
        $default['storage_htaccess_off'] = isset(self::$Data['storage_htaccess_off']) ? self::$Data['storage_htaccess_off'] : false;
        // Initial archive build mode
        if (isset(self::$Data['archive_build_mode'])) {
            $default['archive_build_mode'] = self::$Data['archive_build_mode'];
        } else {
            $is_ziparchive_available       = apply_filters('duplicator_is_ziparchive_available', class_exists('ZipArchive'));
            $default['archive_build_mode'] = $is_ziparchive_available ? DUP_Archive_Build_Mode::ZipArchive : DUP_Archive_Build_Mode::DupArchive;
        }

        // $default['package_zip_flush'] = apply_filters('duplicator_package_zip_flush_default_setting', '0');
        //Skip scan archive
        $default['skip_archive_scan']      = isset(self::$Data['skip_archive_scan']) ? self::$Data['skip_archive_scan'] : false;
        $default['unhook_third_party_js']  = isset(self::$Data['unhook_third_party_js']) ? self::$Data['unhook_third_party_js'] : false;
        $default['unhook_third_party_css'] = isset(self::$Data['unhook_third_party_css']) ? self::$Data['unhook_third_party_css'] : false;
        $default['active_package_id']      = -1;
        $default['usage_tracking']         = isset(self::$Data['usage_tracking']) ? self::$Data['usage_tracking'] : false;
        return $default;
    }

    /**
     * Sets the emaul summary frequency
     *
     * @param string $frequency The new frequency
     *
     * @return void
     */
    public static function setEmailSummaryFrequency($frequency): void
    {
        $oldFrequency = self::Get('email_summary_frequency');
        if (EmailSummaryBootstrap::updateFrequency($oldFrequency, $frequency) === false) {
            DUP_Log::Trace("Invalide email summary frequency: {$frequency}");
            return;
        }

        self::Set('email_summary_frequency', $frequency);
    }

    /**
     * Get the create date format
     *
     * @return int The create date format
     */
    public static function get_create_date_format()
    {
        static $ui_create_frmt = null;
        if (is_null($ui_create_frmt)) {
            $ui_create_frmt = is_numeric(self::Get('package_ui_created')) ? self::Get('package_ui_created') : 1;
        }
        return $ui_create_frmt;
    }

    /**
     * Get legacy storage directory path (wp-snapshots)
     *
     * @deprecated since 1.5.14. Use getSsdirPathWpCont() instead.
     *
     * @return string The legacy storage path
     */
    public static function getSsdirPathLegacy()
    {
        return SnapIO::safePathTrailingslashit(duplicator_get_abs_path()) . self::SSDIR_NAME_LEGACY;
    }

    /**
     * Get wp-content storage directory path (backups-dup-lite)
     *
     * @return string The wp-content storage path
     */
    public static function getSsdirPathWpCont()
    {
        return SnapIO::safePathTrailingslashit(WP_CONTENT_DIR) . self::SSDIR_NAME_NEW;
    }

    /**
     * Get the storage directory path
     *
     * @return string The storage directory path
     *
     * @todo: This function should be removed in future versions as the storage position is now always in wp-content
     */
    public static function getSsdirPath()
    {
        if (is_null(self::$ssDirPath)) {
            if (self::Get('storage_position') === self::STORAGE_POSITION_LEGACY) {
                self::$ssDirPath = self::getSsdirPathLegacy();
            } else {
                self::$ssDirPath = self::getSsdirPathWpCont();
            }
        }
        return self::$ssDirPath;
    }

    /**
     * Get the storage directory URL
     *
     * @return string The storage directory URL
     *
     * @todo: This function should be removed in future versions as the storage position is now always in wp-content
     */
    public static function getSsdirUrl()
    {
        if (is_null(self::$ssDirUrl)) {
            if (self::Get('storage_position') === self::STORAGE_POSITION_LEGACY) {
                self::$ssDirUrl = SnapIO::trailingslashit(DUPLICATOR_SITE_URL) . self::SSDIR_NAME_LEGACY;
            } else {
                self::$ssDirUrl = SnapIO::trailingslashit(content_url()) . self::SSDIR_NAME_NEW;
            }
        }
        return self::$ssDirUrl;
    }

    /**
     * Get the temporary directory path
     *
     * @return string The temporary directory path
     */
    public static function getSsdirTmpPath()
    {
        return self::getSsdirPath() . '/tmp';
    }

    /**
     * Get the installer directory path
     *
     * @return string The installer directory path
     */
    public static function getSsdirInstallerPath()
    {
        return self::getSsdirPath() . '/installer';
    }

    /**
     * Get the logs directory path
     *
     * @return string The logs directory path
     */
    public static function getSsdirLogsPath()
    {
        return self::getSsdirPath() . '/' . DUPLICATOR_LOGS_DIR_NAME;
    }

    /**
     * Get the logs directory URL
     *
     * @return string The logs directory URL
     */
    public static function getSsdirLogsUrl()
    {
        return self::getSsdirUrl() . '/' . DUPLICATOR_LOGS_DIR_NAME;
    }
}
