<?php

/**
 * @package Duplicator
 */

namespace Duplicator\Installer\Utils;

/**
 * Installer Upsell class
 */
class InstallerUpsell
{
    /**
     * getCampainUrlHtml
     * Get upgrade campaign HTML for tooltips
     *
     * @param string[] $utmData utm_content flag
     *
     * @return string
     */
    public static function getCampaignTooltipHTML($utmData)
    {
        $url = InstallerLinkManager::getCampaignUrl($utmData);
        if (function_exists('esc_url')) {
            $url = esc_url($url);
        } else {
            $url = \DUPX_U::esc_url($url);
        }

        ob_start();
        ?>
        <p class="pro-tip-link" >
            Upgrade to
            <a href="<?php echo $url; ?>" target="_blank">
                <b>Duplicator Pro!</b>
            </a>
        </p>
        <?php
        return ob_get_clean();
    }

    /**
     * Get Pro features list
     *
     * @return string[]
     */
    public static function getProFeatureList()
    {
        return array(
            'Scheduled Backups',
            'Recovery Points',
            'Secure File Encryption',
            'Server to Server Import',
            'File & Database Table Filters',
            'Cloud Storage - Google Drive',
            'Cloud Storage - Amazon S3',
            'Cloud Storage - DropBox',
            'Cloud Storage - OneDrive',
            'Cloud Storage - FTP/SFTP',
            'Drag & Drop Installs',
            'Larger Site Support',
            'Multisite Network Support',
            'Email Alerts',
            'Advanced Backup Permissions'
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
            'Installer Branding',
            'Scheduled Backups',
            'Recovery Points',
            'Secure File Encryption',
            'Server to Server Import',
            'File & Database Table Filters',
            'Cloud Storage',
            'Smart Migration Wizard',
            'Drag & Drop Installs',
            'Streamlined Installer',
            'Developer Hooks',
            'Managed Hosting Support',
            'Larger Site Support',
            'Migrate Duplicator Settings',
            'Regenerate SALTS',
            'Multisite Network',
            'Email Alerts',
            'Custom Search & Replace',
            'Advanced Backup Permissions',
        );
    }
}
