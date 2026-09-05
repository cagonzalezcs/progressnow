<?php
/**
 * The main template file
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists
 *
 * Methods for TimberHelper can be found in the /lib sub-directory
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since   Timber 0.1
 */

$context          = Timber::context();
$context['posts'] = Timber::get_posts();

// inc/blog.php injects the BlogArchive island payload. The posts page
// (is_home with a static front page) renders index.twig like any archive;
// the static front page itself never reaches this template.
$context = apply_filters( 'progressnow/context/blog_archive', $context );

Timber::render( array( 'index.twig' ), $context );
