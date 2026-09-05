<?php
/**
 * Timber starter-theme
 * https://github.com/timber/starter-theme
 */

// Load Composer dependencies.
require_once __DIR__ . '/vendor/autoload.php';

require_once __DIR__ . '/src/StarterSite.php';

Timber\Timber::init();

// Sets the directories (inside your theme) to find .twig files.
Timber::$dirname = [ 'templates', 'views' ];

new StarterSite();

// WP data wiring, one file per domain.
require_once __DIR__ . '/inc/cache.php';
require_once __DIR__ . '/inc/identity.php';
require_once __DIR__ . '/inc/categories.php';
require_once __DIR__ . '/inc/options.php';
require_once __DIR__ . '/inc/events.php';
require_once __DIR__ . '/inc/blocks.php';
require_once __DIR__ . '/inc/blog.php';
require_once __DIR__ . '/inc/rest.php';
require_once __DIR__ . '/inc/interior.php';
require_once __DIR__ . '/inc/pages.php';
require_once __DIR__ . '/inc/seo.php';
require_once __DIR__ . '/inc/i18n.php';
require_once __DIR__ . '/inc/payloads.php';
require_once __DIR__ . '/inc/rebuild.php';
require_once __DIR__ . '/inc/shell.php';
require_once __DIR__ . '/inc/admin-build.php';
require_once __DIR__ . '/inc/cli.php';
