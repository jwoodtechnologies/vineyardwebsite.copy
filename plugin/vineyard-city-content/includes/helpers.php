<?php
/** Settings storage + small helpers. All values are stored in ONE option ("vcc_settings") so they follow the site, not the theme. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Plain-text defaults = what the website showed on the day it was copied. Images default to '' (the theme may supply one). */
function vcc_defaults() {
	return array(
		'logo' => 0, 'search_placeholder' => 'Search ...', 'menu_image_2' => 0, 'menu_image_3' => 0,
		'footer_logo' => 0, 'phone' => '801.226.1929', 'address_line1' => '125 S Main Street', 'address_line2' => 'Vineyard, UT',
		'address_link' => 'https://goo.gl/maps/cw4EoARDeM4t7DYr5', 'hours_line1' => 'Monday - Thursday: 8am – 5pm', 'hours_line2' => 'Friday: 8am – 12pm',
		'copyright' => '© Vineyard UT', 'facebook' => 'https://www.facebook.com/vineyardcity', 'instagram' => 'https://www.instagram.com/vineyardcity', 'twitter' => 'https://www.Twitter.com/vineyardcity',
		'hero_logo' => 0, 'hero_button_label' => 'Transparency Portal', 'hero_button_url' => '/transparency-portal/',
		'events_small' => 'CHECK OUT OUR', 'events_title' => 'UPCOMING EVENTS', 'events_button_label' => 'See All Events', 'events_button_url' => '/calendar/',
		'social_small' => 'EXPLORE OUR', 'social_title' => 'SOCIAL MEDIA', 'newsletter_small' => 'SIGN UP FOR OUR', 'newsletter_title' => 'NEWSLETTER',
		'newsletter_placeholder' => 'Your information here...', 'newsletter_button' => 'Go', 'newsletter_action' => '/community/newsletters/',
	);
}

/** One setting. A value that was saved (even an empty one) wins; otherwise the default. */
function vcc_opt( $key ) {
	$saved = get_option( 'vcc_settings', array() );
	$def   = vcc_defaults();
	if ( is_array( $saved ) && array_key_exists( $key, $saved ) ) {
		return $saved[ $key ];
	}
	return isset( $def[ $key ] ) ? $def[ $key ] : '';
}

/** Image setting -> URL. Saved Media Library image first; then whatever the active theme offers as a default ("vcc_default_image" filter). */
function vcc_image( $key ) {
	$id = (int) vcc_opt( $key );
	if ( $id && wp_get_attachment_url( $id ) ) {
		return wp_get_attachment_url( $id );
	}
	return (string) apply_filters( 'vcc_default_image', '', $key );
}

/** Make "/x/" or "x" addresses work on any domain; leave full web addresses alone. */
function vcc_url( $u ) {
	$u = trim( (string) $u );
	if ( '' === $u ) {
		return '';
	}
	if ( preg_match( '#^(https?:)?//|^(mailto|tel):#i', $u ) ) {
		return $u;
	}
	return home_url( '/' . ltrim( $u, '/' ) );
}

/** Where the first website's documents live (the deployed files folder). Change with the 'vcc_files_base' filter. */
function vcc_files_base() {
	return (string) apply_filters( 'vcc_files_base', content_url( 'themes/vineyard/files' ) );
}

function vcc_file_url( $path ) {
	return trailingslashit( vcc_files_base() ) . implode( '/', array_map( 'rawurlencode', explode( '/', ltrim( $path, '/' ) ) ) );
}

function vcc_esc_br( $text ) {
	return nl2br( esc_html( $text ) );
}
