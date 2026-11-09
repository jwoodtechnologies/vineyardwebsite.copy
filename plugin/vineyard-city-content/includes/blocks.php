<?php
/**
 * Editor blocks for the home page sections. Each block has a block.json (blocks/<name>/) and is drawn on the page by PHP
 * (render callbacks in includes/render.php). In the editor every block appears as a labelled card with a live preview and
 * an "Edit these items" button (assets/blocks-editor.js – plain JavaScript, no build step).
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** slug => array( render callback, edit screen (relative admin URL), button words ). */
function vcc_block_list() {
	return array(
		'home-banner'     => array( 'vcc_render_home_banner', 'admin.php?page=vcc-home', 'Edit banner logo & button' ),
		'quick-links'     => array( 'vcc_render_quick_links', 'edit.php?post_type=vc_quicklink', 'Edit Quick Links' ),
		'events'          => array( 'vcc_render_events', 'edit.php?post_type=vc_event', 'Edit Events' ),
		'photo-tiles'     => array( 'vcc_render_tiles', 'edit.php?post_type=vc_tile', 'Edit Photo Tiles' ),
		'social'          => array( 'vcc_render_social', 'admin.php?page=vcc-footer', 'Edit social media links' ),
		'newsletter'      => array( 'vcc_render_newsletter', 'admin.php?page=vcc-home', 'Edit newsletter words' ),
		'alerts'          => array( 'vcc_render_alerts_block', 'edit.php?post_type=vc_alert', 'Edit Alerts' ),
		'events-calendar' => array( 'vcc_render_events_calendar', 'edit.php?post_type=vc_event', 'Edit Events' ),
	);
}

add_filter( 'block_categories_all', function ( $cats ) {
	foreach ( $cats as $c ) {
		if ( 'vineyard' === $c['slug'] ) { return $cats; }
	}
	array_unshift( $cats, array( 'slug' => 'vineyard', 'title' => 'Vineyard City', 'icon' => null ) );
	return $cats;
} );

add_action( 'init', function () {
	// handles named in every block.json ("editorScript"/"editorStyle"); registered first so the blocks can find them
	wp_register_script( 'vcc-blocks-editor', VCC_URL . 'assets/blocks-editor.js', array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-server-side-render', 'wp-i18n' ), VCC_VERSION, true );
	wp_register_style( 'vcc-blocks-editor', VCC_URL . 'assets/blocks-editor.css', array(), VCC_VERSION );
	$js = array();
	foreach ( vcc_block_list() as $slug => $b ) {
		list( $cb, $screen, $label ) = $b;
		$meta = json_decode( (string) file_get_contents( VCC_DIR . 'blocks/' . $slug . '/block.json' ), true );
		register_block_type( VCC_DIR . 'blocks/' . $slug, array(
			'render_callback' => function () use ( $cb ) { return (string) call_user_func( $cb ); },
		) );
		$js[] = array( 'name' => $meta['name'], 'title' => $meta['title'], 'description' => $meta['description'], 'icon' => $meta['icon'], 'category' => $meta['category'],
			'keywords' => $meta['keywords'], 'supports' => $meta['supports'], 'editUrl' => admin_url( $screen ), 'editLabel' => $label );
	}
	wp_localize_script( 'vcc-blocks-editor', 'vccBlocksEditor', array( 'blocks' => $js ) );
}, 9 );

// Belt and braces: also load the editor script/style whenever the block editor opens (WordPress loads each script once).
add_action( 'enqueue_block_editor_assets', function () {
	wp_enqueue_script( 'vcc-blocks-editor' );
	wp_enqueue_style( 'vcc-blocks-editor' );
} );
