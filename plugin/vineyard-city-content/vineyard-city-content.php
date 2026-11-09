<?php
/**
 * Plugin Name: Vineyard City Content
 * Description: Everything the Vineyard City website shows that is not an ordinary page – header/footer details, home-page tiles, quick links, events and alerts – kept here so it survives a theme change. Find it under "Vineyard Site Content" in the left menu.
 * Version: 1.0.3
 * Author: Vineyard City
 * Text Domain: vineyard-city-content
 * License: GPL-2.0-or-later
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
define( 'VCC_VERSION', '1.0.3' );
define( 'VCC_DIR', plugin_dir_path( __FILE__ ) );
define( 'VCC_URL', plugin_dir_url( __FILE__ ) );

require_once VCC_DIR . 'includes/helpers.php';
require_once VCC_DIR . 'includes/post-types.php';
require_once VCC_DIR . 'includes/admin-screens.php';
require_once VCC_DIR . 'includes/render.php';
require_once VCC_DIR . 'includes/blocks.php';
require_once VCC_DIR . 'includes/page-tools.php';
require_once VCC_DIR . 'includes/seed.php';

register_activation_hook( __FILE__, function () {
	vcc_register_post_types();
	flush_rewrite_rules();
	set_transient( 'vcc_just_activated', 1, 60 );
} );
register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );
