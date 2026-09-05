<?php
/**
 * Template Name: Styleguide
 *
 * Renders the component styleguide regardless of the page slug — assign it
 * under Page Attributes → Template, same pattern as the Calendar template
 * (design D9). The page is a dev/demo surface: inc/seo.php noindexes it via
 * is_page_template( 'page-templates/styleguide.php' ).
 *
 * @package  WordPress
 * @subpackage  Timber
 */

$context = Timber::context();

$timber_post     = Timber::get_post();
$context['post'] = $timber_post;

$context = apply_filters( 'progressnow/context/page', $context, $timber_post );

Timber::render( array( 'page-styleguide.twig', 'page.twig' ), $context );
