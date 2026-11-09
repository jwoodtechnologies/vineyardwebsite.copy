<?php
/**
 * Vineyard City block theme.
 * Pages, header, footer, colors, fonts and layout are all edited in the WordPress editor.
 * Calendar events and alerts still come from the "Vineyard City Content" plugin (Vineyard Site menu).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
define( 'VCB_VERSION', '2.0.0' );

require_once __DIR__ . '/inc/class-walkers.php';
require_once __DIR__ . '/inc/redirects.php';
require_once __DIR__ . '/inc/blocks.php';
require_once __DIR__ . '/inc/setup.php';
require_once __DIR__ . '/inc/rest.php';

function vcb_asset( $path ) {
	return get_theme_file_uri( '_assets_/' . ltrim( $path, '/' ) );
}

add_action( 'after_setup_theme', function () {
	add_theme_support( 'editor-styles' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo' );
	register_nav_menus( array( 'primary' => 'Main menu' ) );
	add_editor_style( array( '_assets_/fonts/font-awesome/css/font-awesome.min.css', '_assets_/css/legacy.css', 'assets/css/extra.css', 'assets/css/mini.css', 'assets/css/blocks.css', 'assets/css/editor.css' ) );
} );

// Bootstrap first (older page content uses its grid), then WordPress' own styles, then the site's styles.
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'vcb-bootstrap', vcb_asset( 'vendor/bootstrap-4.6.0/bootstrap.min.css' ), array(), '4.6.0' );
}, 1 );
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'vcb-fa', vcb_asset( 'fonts/font-awesome/css/font-awesome.min.css' ), array(), '4.7.0' );
	wp_enqueue_style( 'vcb-legacy', vcb_asset( 'css/legacy.css' ), array( 'vcb-fa' ), VCB_VERSION );
	wp_enqueue_style( 'vcb-extra', get_theme_file_uri( 'assets/css/extra.css' ), array( 'vcb-legacy' ), VCB_VERSION );
	wp_enqueue_style( 'vcb-blocks', get_theme_file_uri( 'assets/css/blocks.css' ), array( 'vcb-extra', 'vcb-mini' ), VCB_VERSION );
	wp_enqueue_script( 'vcb-site', get_theme_file_uri( 'assets/js/site.js' ), array(), VCB_VERSION, true );
	// Staff / board directory lists keep their original styling and live search box.
	if ( is_singular() ) {
		$c = (string) get_post_field( 'post_content', get_the_ID() );
		if ( preg_match( '/rz-block-list|bus-detail|business-social|rz-business/', $c ) ) {
			wp_enqueue_style( 'vcb-directory', vcb_asset( 'css/business-directory-styles.css' ), array( 'vcb-legacy' ), VCB_VERSION );
		}
		if ( preg_match( '/data-toggle|class="[^"]*\bcollapse\b/', $c ) ) { // FAQ answers open and close
			wp_enqueue_script( 'vcb-bootstrap', vcb_asset( 'vendor/bootstrap-4.6.0/bootstrap.bundle.min.js' ), array( 'jquery' ), '4.6.0', true );
		}
		if ( false !== strpos( $c, 'rz-business-directory-search' ) ) {
			wp_enqueue_script( 'jquery' );
			wp_add_inline_script( 'jquery', 'window.$ = window.jQuery;', 'after' );
			wp_enqueue_script( 'vcb-directory', vcb_asset( 'js/business-directory-scripts.js' ), array( 'jquery' ), VCB_VERSION, true );
		}
	}
	wp_enqueue_style( 'vcb-mini', get_theme_file_uri( 'assets/css/mini.css' ), array( 'vcb-legacy' ), VCB_VERSION );
}, 20 );

add_action( 'wp_head', function () {
	echo '<link rel="apple-touch-icon" href="' . esc_url( vcb_asset( 'images/touch-icon-iphone.png' ) ) . '">' . "\n";
	if ( ! has_site_icon() ) {
		echo '<link rel="icon" href="' . esc_url( vcb_asset( 'images/favicon.ico' ) ) . '">' . "\n";
	}
}, 2 );

add_filter( 'body_class', function ( $c ) {
	$c[] = 'vineyard-city-theme'; // the companion plugin skips its fallback styling
	$c[] = is_front_page() ? 'homepage' : 'freeform';
	return $c;
} );

// Share and translate buttons on the right edge of every page (same as the original site).
add_action( 'wp_footer', function () {
	include __DIR__ . '/inc/share-translate.php';
}, 1 );

// Theme helpers the plugin asks for.
add_filter( 'vcc_social_icon', function ( $u, $net ) { return vcb_asset( 'images/' . $net . '-icon.png' ); }, 10, 2 );
add_filter( 'vcc_default_image', function ( $url, $key ) {
	$map = array( 'logo' => vcb_asset( 'images/logo.png' ), 'footer_logo' => vcb_asset( 'images/footer-logo.png' ), 'hero_logo' => vcb_asset( 'images/hero-logo.png' ), 'hero_photo' => vcb_asset( 'images/hero.jpg' ) );
	return isset( $map[ $key ] ) ? $map[ $key ] : $url;
}, 10, 2 );

/**
 * A page banner uses the page's Featured Image. Pages without one show the standard banner photo,
 * so no page ever has an empty banner.
 */
add_filter( 'render_block_core/cover', function ( $html, $block ) {
	if ( empty( $block['attrs']['useFeaturedImage'] ) ) {
		return $html;
	}
	$id = get_the_ID();
	if ( $id && has_post_thumbnail( $id ) ) {
		return $html;
	}
	$img = '<img class="wp-block-cover__image-background" alt="" src="' . esc_url( vcb_default_banner() ) . '" data-object-fit="cover"/>';
	return preg_replace( '/(<span[^>]*wp-block-cover__background[^>]*><\/span>)/', '$1' . $img, $html, 1 );
}, 10, 2 );

function vcb_default_banner() {
	$id = (int) get_theme_mod( 'vcb_default_banner' );
	$u  = $id ? wp_get_attachment_image_url( $id, 'full' ) : '';
	return $u ? $u : vcb_asset( 'images/nav-img.jpg' );
}

// Site logo block falls back to the city logo until one is chosen.
add_filter( 'render_block_core/site-logo', function ( $html, $block ) {
	if ( '' !== trim( $html ) ) {
		return $html;
	}
	$w = ! empty( $block['attrs']['width'] ) ? (int) $block['attrs']['width'] : 200;
	return '<div class="wp-block-site-logo"><a href="' . esc_url( home_url( '/' ) ) . '" class="custom-logo-link" rel="home"><img src="' . esc_url( vcb_asset( 'images/logo.png' ) ) . '" class="custom-logo" alt="' . esc_attr( get_bloginfo( 'name' ) ) . '" width="' . $w . '"></a></div>';
}, 10, 2 );

// Pattern category for the city's own sections.
add_action( 'init', function () {
	register_block_pattern_category( 'vineyard', array( 'label' => 'Vineyard City' ) );
} );
