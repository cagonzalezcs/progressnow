<?php
/**
 * Template Name: Get Involved
 *
 * Renders the Get Involved page regardless of the page slug — assign it under
 * Page Attributes → Template, same pattern as the Calendar template (design
 * D9). inc/pages.php locates the "Get Involved page" ACF group on this
 * template and injects the section content via `progressnow/context/page`.
 *
 * @package  WordPress
 * @subpackage  Timber
 */

$context = Timber::context();

$timber_post     = Timber::get_post();
$context['post'] = $timber_post;

$context = apply_filters( 'progressnow/context/page', $context, $timber_post );

Timber::render( array( 'page-get-involved.twig', 'page.twig' ), $context );
