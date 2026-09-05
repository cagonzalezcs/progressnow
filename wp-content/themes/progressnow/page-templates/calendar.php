<?php
/**
 * Template Name: Calendar
 *
 * Renders the event calendar regardless of the page slug. Assign this
 * template to the calendar page (Page Attributes → Template) so the events
 * wiring keys off the template, not a magic `calendar` slug (design D9).
 *
 * Mirrors page.php but pins the calendar view; inc/events.php injects the
 * calendar island props via the `progressnow/context/page` filter, gated on
 * is_page_template( 'page-templates/calendar.php' ).
 *
 * @package  WordPress
 * @subpackage  Timber
 */

$context = Timber::context();

$timber_post     = Timber::get_post();
$context['post'] = $timber_post;

$context = apply_filters( 'progressnow/context/page', $context, $timber_post );

Timber::render( array( 'page-calendar.twig', 'page.twig' ), $context );
