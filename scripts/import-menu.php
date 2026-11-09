<?php
/**
 * Build the primary menu from content/menu.json (the live <ul id="nav"> tree).
 * Run via:  wp eval-file scripts/import-menu.php <repo_root>
 */
if ( ! defined( 'WP_CLI' ) ) {
	exit( "Run with WP-CLI: wp eval-file scripts/import-menu.php <repo_root>\n" );
}
require_once __DIR__ . '/lib-rewrite.php';
$root = isset( $args[0] ) ? rtrim( $args[0], '/' ) : dirname( __DIR__ );
$tree = json_decode( file_get_contents( $root . '/content/menu.json' ), true );
$map  = vc_load_page_map( $root . '/theme/vineyard' );

$menu = wp_get_nav_menu_object( 'Primary' );
if ( $menu ) { // rebuild from scratch to stay idempotent
	foreach ( (array) wp_get_nav_menu_items( $menu->term_id ) as $it ) { wp_delete_post( $it->ID, true ); }
	$menu_id = $menu->term_id;
} else {
	$menu_id = wp_create_nav_menu( 'Primary' );
}

function vc_page_id_for_path( $path ) {
	$q = new WP_Query( array( 'post_type' => 'page', 'post_status' => 'publish', 'posts_per_page' => 1, 'fields' => 'ids',
		'meta_key' => '_vc_old_path', 'meta_value' => $path, 'no_found_rows' => true ) );
	return $q->posts ? (int) $q->posts[0] : 0;
}

$n = 0;
function vc_add_items( $nodes, $menu_id, $parent, &$n, $map ) {
	foreach ( $nodes as $node ) {
		$n++;
		$host = parse_url( $node['url'], PHP_URL_HOST );
		$path = ltrim( rawurldecode( (string) parse_url( $node['url'], PHP_URL_PATH ) ), '/' );
		$internal = ( ! $host || in_array( strtolower( $host ), VC_OLD_HOSTS, true ) );
		$args = array(
			'menu-item-title'     => wp_strip_all_tags( $node['title'] ),
			'menu-item-position'  => $n,
			'menu-item-parent-id' => $parent,
			'menu-item-status'    => 'publish',
			'menu-item-target'    => ( '_new' === $node['target'] || '_blank' === $node['target'] ) ? '_blank' : '',
		);
		$pid = ( $internal && isset( $map[ $path ] ) ) ? vc_page_id_for_path( $path ) : 0;
		if ( $internal && ( '' === $path || 'index.php' === $path ) ) {
			$args += array( 'menu-item-type' => 'custom', 'menu-item-url' => home_url( '/' ) );
		} elseif ( $pid ) {
			$args += array( 'menu-item-type' => 'post_type', 'menu-item-object' => 'page', 'menu-item-object-id' => $pid );
			$frag = parse_url( $node['url'], PHP_URL_FRAGMENT );
			if ( $frag ) { $args = array_merge( $args, array( 'menu-item-type' => 'custom', 'menu-item-url' => get_permalink( $pid ) . '#' . $frag ) ); }
		} elseif ( $internal && $path ) { // a file (PDF etc.) living in the media library
			$args += array( 'menu-item-type' => 'custom', 'menu-item-url' => content_url( 'uploads/vineyard-files/' . implode( '/', array_map( 'rawurlencode', explode( '/', $path ) ) ) ) );
		} else {
			$args += array( 'menu-item-type' => 'custom', 'menu-item-url' => $node['url'] );
		}
		$item_id = wp_update_nav_menu_item( $menu_id, 0, $args );
		if ( ! empty( $node['children'] ) && ! is_wp_error( $item_id ) ) {
			vc_add_items( $node['children'], $menu_id, $item_id, $n, $map );
		}
	}
}
vc_add_items( $tree, $menu_id, 0, $n, $map );
$locations = get_theme_mod( 'nav_menu_locations', array() );
$locations['primary'] = $menu_id;
set_theme_mod( 'nav_menu_locations', $locations );
WP_CLI::success( "menu 'Primary' built with $n items" );
