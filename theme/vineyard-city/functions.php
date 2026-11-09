<?php
/**
 * Vineyard City theme. DISPLAY ONLY: it stores no content. Everything it shows comes from WordPress (pages, menus, widgets,
 * Featured Images) or from the companion plugin "Vineyard City Content". Safe to switch away from at any time.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
define( 'VCITY_VERSION', '1.0.1' );
require_once get_template_directory() . '/inc/template-tags.php';
require_once get_template_directory() . '/inc/class-walkers.php';
require_once get_template_directory() . '/inc/redirects.php';

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'wp-block-styles' );
	register_nav_menus( array( 'primary' => 'Main menu (top of every page)' ) );
} );

add_action( 'widgets_init', function () {
	register_sidebar( array( 'name' => 'Left column – under Related Pages', 'id' => 'page-sidebar', 'description' => 'Optional. Appears in the blue left column of inner pages, below the contact box.', 'before_widget' => '<div id="%1$s" class="widget %2$s">', 'after_widget' => '</div>', 'before_title' => '<h2 class="box-header">', 'after_title' => '</h2>' ) );
	register_sidebar( array( 'name' => 'Footer – extra row', 'id' => 'footer-extra', 'description' => 'Optional. Anything you add here shows in a row above the phone/address/hours strip.', 'before_widget' => '<div id="%1$s" class="widget %2$s">', 'after_widget' => '</div>', 'before_title' => '<h3>', 'after_title' => '</h3>' ) );
} );

add_action( 'wp_enqueue_scripts', function () {
	$a = get_template_directory_uri() . '/_assets_';
	wp_enqueue_style( 'vcity-bootstrap', $a . '/vendor/bootstrap-4.6.0/bootstrap.min.css', array(), '4.6.0' );
	wp_enqueue_style( 'vcity-tiny-slider', $a . '/vendor/tiny-slider-2.9.3/tiny-slider.css', array( 'vcity-bootstrap' ), '2.9.3' );
	wp_enqueue_style( 'vcity-fa', $a . '/fonts/font-awesome/css/font-awesome.min.css', array( 'vcity-tiny-slider' ), '4.5.0' );
	wp_enqueue_style( 'vcity-animate', $a . '/css/animate.min.css', array( 'vcity-fa' ), null );
	wp_enqueue_style( 'vcity-ytplayer', $a . '/plugins/ytplayer/jquery.mb.YTPlayer.min.css', array( 'vcity-animate' ), null );
	wp_enqueue_style( 'vcity-layout', $a . '/css/layout.css', array( 'vcity-ytplayer' ), '1.02' ); // original stylesheet, unchanged (loads Montserrat itself)
	wp_enqueue_style( 'vcity-extra', get_template_directory_uri() . '/assets/css/vineyard-city.css', array( 'vcity-layout' ), VCITY_VERSION );
	// WordPress' own jQuery (Jetpack forms rely on it); the original scripts expect the global "$".
	wp_add_inline_script( 'jquery', 'window.$ = window.jQuery;', 'after' );
	wp_enqueue_script( 'vcity-ytplayer', $a . '/plugins/ytplayer/jquery.mb.YTPlayer.min.js', array( 'jquery' ), null, true );
	wp_enqueue_script( 'vcity-modernizr', $a . '/plugins/modernizr/modernizr.custom.js', array( 'jquery' ), null, true );
	wp_enqueue_script( 'vcity-tiny-slider', $a . '/plugins/tiny-slider/dist/min/tiny-slider.js', array( 'jquery' ), null, true );
	wp_enqueue_script( 'vcity-bootstrap', $a . '/vendor/bootstrap-4.6.0/bootstrap.bundle.min.js', array( 'jquery' ), '4.6.0', true );
	wp_enqueue_script( 'vcity-matchheight', $a . '/plugins/matchHeight/dist/jquery.matchHeight-min.js', array( 'jquery' ), null, true );
	wp_enqueue_script( 'vcity-scripts', $a . '/js/scripts.js', array( 'jquery', 'vcity-ytplayer', 'vcity-tiny-slider', 'vcity-bootstrap', 'vcity-matchheight' ), VCITY_VERSION, true );
}, 20 );

// Staff / board directory lists keep their original styling and live search box.
add_action( 'wp_enqueue_scripts', function () {
	if ( ! is_singular() ) { return; }
	$c = (string) get_post_field( 'post_content', get_the_ID() );
	$a = get_template_directory_uri() . '/_assets_';
	if ( preg_match( '/rz-block-list|bus-detail|business-social|rz-business/', $c ) ) { wp_enqueue_style( 'vcity-directory', $a . '/css/business-directory-styles.css', array( 'vcity-layout' ), VCITY_VERSION ); }
	if ( false !== strpos( $c, 'rz-business-directory-search' ) ) { wp_enqueue_script( 'vcity-directory', $a . '/js/business-directory-scripts.js', array( 'jquery' ), VCITY_VERSION, true ); }
}, 25 );

// Mini-calendar look (only when the plugin put a calendar on the page); must come after the plugin's calendar styles.
add_action( 'wp_enqueue_scripts', function () {
	if ( wp_style_is( 'vcc-fc-daygrid', 'enqueued' ) ) {
		wp_enqueue_style( 'vcity-mini', get_template_directory_uri() . '/_assets_/plugins/revizeCalendar/css/mini.css', array( 'vcc-fc-daygrid', 'vcity-layout' ), VCITY_VERSION );
	}
}, 30 );

add_action( 'wp_head', function () {
	$i = get_template_directory_uri() . '/_assets_/images/';
	echo '<link rel="apple-touch-icon" href="' . esc_url( $i . 'touch-icon-iphone.png' ) . '">' . "\n";
}, 2 );

// No tracking or chat widgets are loaded by the theme. Add Google Analytics (Jetpack / Site Kit), an accessibility button or a chat widget with their own WordPress plugins.

add_filter( 'body_class', function ( $c ) {
	if ( ! is_front_page() && is_page_template( 'template-fullwidth.php' ) ) { $c[] = 'fullwidth'; }
	return $c;
} );
