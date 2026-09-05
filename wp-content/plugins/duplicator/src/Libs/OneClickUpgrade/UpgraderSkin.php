<?php

/**
 * @package Duplicator
 *
 * phpcs:disable PSR1.Files.SideEffects.FoundWithSymbols
 * phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
 */

namespace Duplicator\Libs\OneClickUpgrade;

use WP_Upgrader_Skin;

defined('ABSPATH') || exit;

/**
 * Silent upgrader skin for one-click upgrade
 *
 * @since 1.5.13
 */
class UpgraderSkin extends WP_Upgrader_Skin
{
    /**
     * Primary class constructor.
     *
     * @since 1.5.13
     *
     * @param array $args Empty array of args (we will use defaults).
     */
    public function __construct($args = array())
    {
        parent::__construct($args);
    }

    /**
     * Set the upgrader object and store it as a property in the parent class.
     *
     * @since 1.5.13
     *
     * @param object $upgrader The upgrader object (passed by reference).
     *
     * @return void
     */
    public function set_upgrader(&$upgrader)
    {
        if (is_object($upgrader)) {
            $this->upgrader =& $upgrader;
        }
    }

    /**
     * Set the upgrader result and store it as a property in the parent class.
     *
     * @since 1.5.13
     *
     * @param object $result The result of the install process.
     *
     * @return void
     */
    public function set_result($result)
    {
        $this->result = $result;
    }

    /**
     * Empty out the header of its HTML content and only check to see if it has
     * been performed or not.
     *
     * @since 1.5.13
     *
     * @return void
     */
    public function header()
    {
    }

    /**
     * Empty out the footer of its HTML contents.
     *
     * @since 1.5.13
     *
     * @return void
     */
    public function footer()
    {
    }

    /**
     * Instead of outputting HTML for errors, send proper WordPress AJAX error response.
     *
     * @since 1.5.13
     *
     * @param array $errors Array of errors with the install process.
     *
     * @return void
     */
    public function error($errors)
    {
        if (!empty($errors)) {
            wp_send_json_error(array('message' => esc_html__('There was an error installing the upgrade. Please try again.', 'duplicator')));
        }
    }

    /**
     * Empty out the feedback method to prevent outputting HTML strings as the install
     * is progressing.
     *
     * @since 1.5.13
     *
     * @param string $string  The feedback string.
     * @param mixed  ...$args Additional arguments.
     *
     * @return void
     */
    public function feedback($string, ...$args)
    {
    }
}
