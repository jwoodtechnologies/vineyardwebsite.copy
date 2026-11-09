<?php
/**
 * One-time setup when the theme is turned on, and the Vineyard Site admin menu.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Copy a picture that ships with the theme into the Media Library (once) and return its ID. */
function vcb_media_from_theme( $rel, $key ) {
	$have = (int) get_option( 'vcb_media_' . $key );
	if ( $have && get_post( $have ) ) {
		return $have;
	}
	$src = get_theme_file_path( $rel );
	if ( ! file_exists( $src ) ) {
		return 0;
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	$tmp = wp_tempnam( basename( $src ) );
	copy( $src, $tmp );
	$id = media_handle_sideload( array( 'name' => basename( $src ), 'tmp_name' => $tmp ), 0 );
	if ( is_wp_error( $id ) ) {
		@unlink( $tmp ); // phpcs:ignore
		return 0;
	}
	update_option( 'vcb_media_' . $key, (int) $id, false );
	return (int) $id;
}

function vcb_setup() {
	if ( ! get_theme_mod( 'custom_logo' ) ) {
		$logo = function_exists( 'vcc_opt' ) ? (int) vcc_opt( 'logo' ) : 0;
		$logo = $logo && get_post( $logo ) ? $logo : vcb_media_from_theme( '_assets_/images/logo.png', 'logo' );
		if ( $logo ) {
			set_theme_mod( 'custom_logo', $logo );
		}
	}
	$cur = (int) get_theme_mod( 'vcb_default_banner' );
	if ( ! $cur || $cur === (int) get_option( 'vcb_media_banner' ) ) { // not set, or still the earlier wrong picture
		$b = vcb_media_from_theme( '_assets_/images/inner-slide-1.jpg', 'banner_std' );
		if ( $b ) {
			set_theme_mod( 'vcb_default_banner', $b );
		}
	}
	update_option( 'vcb_setup_done', VCB_VERSION );
}
add_action( 'after_switch_theme', 'vcb_setup' );
add_action( 'admin_init', function () {
	if ( get_option( 'vcb_setup_done' ) !== VCB_VERSION && current_user_can( 'manage_options' ) ) {
		vcb_setup();
	}
} );

/**
 * Vineyard Site menu: header, footer, quick links and photo tiles are now edited right on the page,
 * so their old settings screens are replaced with links into the editor.
 */
add_action( 'admin_menu', function () {
	global $menu;
	if ( ! menu_page_url( 'vineyard-site-content', false ) ) {
		return;
	}
	foreach ( array( 'vineyard-site-content', 'vcc-header', 'vcc-footer', 'vcc-home', 'edit.php?post_type=vc_quicklink', 'edit.php?post_type=vc_tile' ) as $slug ) {
		remove_submenu_page( 'vineyard-site-content', $slug );
	}
	$theme = get_stylesheet();
	$front = (int) get_option( 'page_on_front' );
	$links = array(
		'Home page'    => $front ? 'post.php?post=' . $front . '&action=edit' : 'edit.php?post_type=page',
		'All pages'    => 'edit.php?post_type=page',
		'Header'       => 'site-editor.php?postType=wp_template_part&postId=' . rawurlencode( $theme . '//header' ) . '&canvas=edit',
		'Footer'       => 'site-editor.php?postType=wp_template_part&postId=' . rawurlencode( $theme . '//footer' ) . '&canvas=edit',
		'Colors & fonts' => 'site-editor.php?path=' . rawurlencode( '/wp_global_styles' ) . '&canvas=edit',
		'Menus'        => 'site-editor.php?path=' . rawurlencode( '/navigation' ),
	);
	$pos = 0;
	foreach ( $links as $label => $url ) {
		add_submenu_page( 'vineyard-site-content', $label, $label, in_array( $label, array( 'Header', 'Footer', 'Colors & fonts', 'Menus' ), true ) ? 'edit_theme_options' : 'edit_pages', $url, '', $pos++ );
	}
	foreach ( $menu as $k => $item ) {
		if ( isset( $item[2] ) && 'vineyard-site-content' === $item[2] ) {
			$menu[ $k ][0] = 'Vineyard Site'; // phpcs:ignore
		}
	}
}, 99 );

// The old "Start here" screen is gone: the top menu item opens the home page in the editor.
add_action( 'load-toplevel_page_vineyard-site-content', function () {
	$front = (int) get_option( 'page_on_front' );
	wp_safe_redirect( admin_url( $front ? 'post.php?post=' . $front . '&action=edit' : 'edit.php?post_type=page' ) );
	exit;
} );

// New pages start with the standard layout: left column with Related Pages and contact box, page text on the right.
add_filter( 'default_content', function ( $content, $post ) {
	if ( 'page' !== $post->post_type || '' !== $content ) {
		return $content;
	}
	$p = WP_Block_Patterns_Registry::get_instance()->get_registered( 'vineyard-city/inner-page' );
	return $p ? $p['content'] : $content;
}, 10, 2 );

// The contact box, page buttons and Related Pages list are now blocks on the page itself, so their old side boxes are removed.
// With no old-style boxes, the editor shows each page inside the real header, banner and footer.
add_action( 'add_meta_boxes', function () {
	remove_meta_box( 'vcc_page_contact', 'page', 'side' );
	remove_meta_box( 'vcc_page_buttons', 'page', 'normal' );
	remove_meta_box( 'vcc_page_related', 'page', 'side' );
}, 20 );
add_action( 'init', function () {
	remove_post_type_support( 'page', 'editor' );
	add_post_type_support( 'page', 'editor', array( 'default-mode' => 'template-locked' ) ); // WordPress 6.8
}, 20 );
add_filter( 'post_type_default_rendering_mode', function ( $mode, $post_type ) {
	return 'page' === $post_type ? 'template-locked' : $mode;
}, 10, 2 );
add_filter( 'register_post_type_args', function ( $args, $post_type ) {
	if ( 'page' === $post_type ) {
		$args['default_rendering_mode'] = 'template-locked';
	}
	return $args;
}, 10, 2 );

/**
 * The header's menu: a block menu made once from the site's existing main menu ("Primary"),
 * so it can be edited in the editor like any other block.
 */
function vcb_navigation_id() {
	$id = (int) get_option( 'vcb_nav_id' );
	if ( $id && 'wp_navigation' === get_post_type( $id ) && 'publish' === get_post_status( $id ) ) {
		return $id;
	}
	$menu = 0;
	foreach ( array( 'vineyard-city', 'vineyard' ) as $old ) {
		$mods = get_option( 'theme_mods_' . $old );
		if ( ! empty( $mods['nav_menu_locations']['primary'] ) ) {
			$menu = (int) $mods['nav_menu_locations']['primary'];
			break;
		}
	}
	if ( ! $menu ) {
		$m    = wp_get_nav_menu_object( 'Primary' );
		$menu = $m ? (int) $m->term_id : 0;
	}
	$menu = $menu ? wp_get_nav_menu_object( $menu ) : null;
	if ( ! $menu || ! class_exists( 'WP_Classic_To_Block_Menu_Converter' ) ) {
		return 0;
	}
	$content = WP_Classic_To_Block_Menu_Converter::convert( $menu );
	if ( is_wp_error( $content ) || ! $content ) {
		return 0;
	}
	$content = preg_replace( '/"className":"[^"]*",/', '', $content ); // drop leftover classic-menu classes
	$id = wp_insert_post( array( 'post_type' => 'wp_navigation', 'post_status' => 'publish', 'post_title' => 'Main menu', 'post_content' => wp_slash( $content ) ), true );
	if ( is_wp_error( $id ) ) {
		return 0;
	}
	update_option( 'vcb_nav_id', (int) $id, false );
	return (int) $id;
}
