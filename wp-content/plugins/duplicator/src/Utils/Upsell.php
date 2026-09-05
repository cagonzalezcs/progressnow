<?php

/**
 * @package Duplicator
 */

namespace Duplicator\Utils;

/**
 * Upsell class, this class is used on plugin and installer
 */
class Upsell
{
    /**
     * Get Pro features list
     *
     * @return string[]
     */
    public static function getProFeatureList()
    {
        return array(
            __('Scheduled Backups', 'duplicator'),
            __('Recovery Points', 'duplicator'),
            __('Secure File Encryption', 'duplicator'),
            __('Server to Server Import', 'duplicator'),
            __('File & Database Table Filters', 'duplicator'),
            __('Cloud Storage - Google Drive', 'duplicator'),
            __('Cloud Storage - Amazon S3', 'duplicator'),
            __('Cloud Storage - DropBox', 'duplicator'),
            __('Cloud Storage - OneDrive', 'duplicator'),
            __('Cloud Storage - FTP/SFTP', 'duplicator'),
            __('Drag & Drop Installs', 'duplicator'),
            __('Larger Site Support', 'duplicator'),
            __('Multisite Network Support', 'duplicator'),
            __('Email Alerts', 'duplicator'),
            __('Advanced Backup Permissions', 'duplicator')
        );
    }

    /**
     * Get Pro callout features list
     *
     * @return string[]
     */
    public static function getCalloutCTAFeatureList()
    {
        return array(
            __('Scheduled Backups', 'duplicator'),
            __('Recovery Points', 'duplicator'),
            __('Secure File Encryption', 'duplicator'),
            __('Server to Server Import', 'duplicator'),
            __('File & Database Table Filters', 'duplicator'),
            __('Cloud Storage', 'duplicator'),
            __('Smart Migration Wizard', 'duplicator'),
            __('Drag & Drop Installs', 'duplicator'),
            __('Streamlined Installer', 'duplicator'),
            __('Developer Hooks', 'duplicator'),
            __('Managed Hosting Support', 'duplicator'),
            __('Larger Site Support', 'duplicator'),
            __('Installer Branding', 'duplicator'),
            __('Migrate Duplicator Settings', 'duplicator'),
            __('Regenerate SALTS', 'duplicator'),
            __('Multisite Network', 'duplicator'),
            __('Email Alerts', 'duplicator'),
            __('Custom Search & Replace', 'duplicator'),
            __('Advanced Backup Permissions', 'duplicator')
        );
    }
}
