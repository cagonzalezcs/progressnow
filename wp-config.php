<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wp_progressnowtest_db' );

/** Database username */
define( 'DB_USER', 'wp_progressnowtest_user' );

/** Database password */
define( 'DB_PASSWORD', 'wp_progressnowtest_pw' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          '$k08Dcw)Pv3}0jbvbhVsgp&eqE];eChsc4$h^t-)^wVf|l3yt^O5fEk>CE:({,DM' );
define( 'SECURE_AUTH_KEY',   'DYG^ EvJ#a{=CR8f3;-9eY@_NB+Vyu4yDb=6jL2e6~q.vB]uvt}~Zx?m[`on+O33' );
define( 'LOGGED_IN_KEY',     '/>Z!eFAT1C54T/tny`S*A_JWc<[:jWiBy8,Z#pOFZ,Bb7sC*&:B^P(kI-,x.5X)O' );
define( 'NONCE_KEY',         'vr1n&>2RVhP:Q,MW[#x1O6rr3Za2c%E8;w`qnOK!ep;S}*X*i>&`)y!eSu0Y]?x!' );
define( 'AUTH_SALT',         'gb^hWa=*Ryk3L bFmt*5eKvCy|hj0:Z<z*I47AibL_R.[i_u>*c{}Dl^{DxnaLe]' );
define( 'SECURE_AUTH_SALT',  '<.f]kMa4`DdZsLWnXe<fFB$LwjeN,)$,x+SG[yqjp4H2KCxzx0pmKSc=k~Urd;Ed' );
define( 'LOGGED_IN_SALT',    '*x.RQY!v,#*jA1*d8oHTUixKWy4[lv`rHV*T,@% =g.;#qbWrZsy+)kl~$}^&|Re' );
define( 'NONCE_SALT',        'w~ _ajk%84_ Y8X)4F+YVOX<J%fr]PIvIk k2&YIVPyk6&dH00|6[UkK9-^Jm}o|' );
define( 'WP_CACHE_KEY_SALT', '1uji194n dADDyRL<zoWj%(IyWOPKdjcuR[*Y#bDy>ec:D?K=ToVO;E#Y{FCEUlY' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', true );
}
// Local dev: log fatals/notices to wp-content/debug.log, keep them off-screen.
// A theme fatal (e.g. a syntax error in a required inc/*.php) otherwise blanks
// the block editor silently. See wp-content/debug.log when things break.
if ( ! defined( 'WP_DEBUG_LOG' ) ) {
	define( 'WP_DEBUG_LOG', true );
}
if ( ! defined( 'WP_DEBUG_DISPLAY' ) ) {
	define( 'WP_DEBUG_DISPLAY', false );
}

/* Pin URLs to this vhost; DB is shared with rgvdsa.test. */
if ( ! defined( 'WP_HOME' ) ) {
	define( 'WP_HOME', 'https://progressnow.test:8890' );
}
if ( ! defined( 'WP_SITEURL' ) ) {
	define( 'WP_SITEURL', 'https://progressnow.test:8890' );
}

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
