<?php
/**
 * The template for displaying the static front page.
 *
 * Renders the designed Home layout (views/front-page.twig). The posts index
 * never lands here — with a static front page it renders index.twig.
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since    Timber 0.1
 */

$context = Timber::context();

$timber_post     = Timber::get_post();
$context['post'] = $timber_post;

// inc/options.php injects hero/who copy + event_count (priority 5); inc/events.php
// home_events + calendar_url; inc/blog.php blog_featured + blog_rows.
$context = apply_filters( 'progressnow/context/front_page', $context, $timber_post );

Timber::render( array( 'front-page.twig' ), $context );
