<?php
/**
 * Security settings for the city website.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Browser security headers on every public page.
add_action( 'send_headers', function () {
	if ( headers_sent() ) {
		return;
	}
	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: camera=(), microphone=(), payment=(), usb=(), geolocation=(self)' );
	if ( is_ssl() ) {
		header( 'Strict-Transport-Security: max-age=31536000' );
	}
} );

// Don't advertise the WordPress version.
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );

// Staff account names stay private: no public user list, author pages or user sitemap.
add_filter( 'rest_endpoints', function ( $endpoints ) {
	if ( is_user_logged_in() ) {
		return $endpoints;
	}
	foreach ( array_keys( $endpoints ) as $route ) {
		if ( 0 === strpos( $route, '/wp/v2/users' ) ) {
			unset( $endpoints[ $route ] );
		}
	}
	return $endpoints;
} );
add_action( 'template_redirect', function () {
	if ( is_author() || ( isset( $_GET['author'] ) && ! is_user_logged_in() ) ) { // phpcs:ignore
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
}, 1 );
add_filter( 'wp_sitemaps_add_provider', function ( $provider, $name ) {
	return 'users' === $name ? false : $provider;
}, 10, 2 );
add_filter( 'oembed_response_data', function ( $data ) {
	unset( $data['author_name'], $data['author_url'] );
	return $data;
} );

// Login errors don't reveal whether a username exists.
add_filter( 'login_errors', function () {
	return 'Incorrect username or password.';
} );

// No editing of theme or plugin code from inside wp-admin.
add_filter( 'map_meta_cap', function ( $caps, $cap ) {
	return in_array( $cap, array( 'edit_themes', 'edit_plugins', 'edit_files' ), true ) ? array( 'do_not_allow' ) : $caps;
}, 10, 2 );

// No app passwords (a second way to log in that bypasses two-step login).
add_filter( 'wp_is_application_passwords_available', '__return_false' );

// Pingbacks are a common abuse route and not used by the city.
add_filter( 'xmlrpc_methods', function ( $methods ) {
	unset( $methods['pingback.ping'], $methods['pingback.extensions.getPingbacks'], $methods['system.multicall'] );
	return $methods;
} );
add_filter( 'wp_headers', function ( $h ) {
	unset( $h['X-Pingback'] );
	return $h;
} );

// Comments are off everywhere (a city site has no comment threads, and it removes a spam route).
add_action( 'init', function () {
	foreach ( array( 'post', 'page', 'attachment' ) as $t ) {
		remove_post_type_support( $t, 'comments' );
		remove_post_type_support( $t, 'trackbacks' );
	}
}, 100 );
add_filter( 'comments_open', '__return_false', 20 );
add_filter( 'pings_open', '__return_false', 20 );
add_filter( 'comments_array', '__return_empty_array', 20 );
add_action( 'admin_menu', function () {
	remove_menu_page( 'edit-comments.php' );
}, 999 );
add_action( 'wp_before_admin_bar_render', function () {
	global $wp_admin_bar;
	$wp_admin_bar->remove_menu( 'comments' );
} );
