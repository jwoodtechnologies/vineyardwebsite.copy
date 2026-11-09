<?php
/**
 * Create/update pages from content/manifest.json and rewrite internal links.
 * Run via:  wp eval-file scripts/import-pages.php <repo_root>   (use --user=admin so HTML is not kses-filtered)
 * Idempotent: pages are matched on meta "_vc_old_path".
 */
if ( ! defined( 'WP_CLI' ) ) {
	exit( "Run with WP-CLI: wp eval-file scripts/import-pages.php <repo_root>\n" );
}
require_once __DIR__ . '/lib-rewrite.php';
kses_remove_filters(); // legacy markup contains iframes/forms/styles that must be kept verbatim.

$root     = isset( $args[0] ) ? rtrim( $args[0], '/' ) : dirname( __DIR__ );
$manifest = json_decode( file_get_contents( $root . '/content/manifest.json' ), true );
$up       = wp_upload_dir();
$ctx      = array(
	'page_map'     => vc_load_page_map( $root . '/theme/vineyard' ),
	'media_map'    => vc_load_media_csv( $root . '/content/media.csv' ),
	'home'         => trailingslashit( home_url( '/' ) ),
	'uploads'      => $up['baseurl'],
	'theme_assets' => get_theme_root_uri() . '/vineyard/_assets_',
	'theme_uri'    => get_theme_root_uri() . '/vineyard',
	'unresolved'   => array(),
);

function vc_find_by_old_path( $old ) {
	$q = new WP_Query( array(
		'post_type' => 'page', 'post_status' => 'any', 'posts_per_page' => 1, 'fields' => 'ids',
		'meta_key' => '_vc_old_path', 'meta_value' => $old, 'no_found_rows' => true,
	) );
	return $q->posts ? (int) $q->posts[0] : 0;
}

$ids     = array(); // slug-path => id
$created = 0; $updated = 0;

// Home page (rendered by front-page.php)
$home_id = vc_find_by_old_path( 'index.php' );
if ( ! $home_id ) {
	$home_id = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Home', 'post_name' => 'home', 'post_content' => '' ) );
	update_post_meta( $home_id, '_vc_old_path', 'index.php' );
}
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $home_id );

foreach ( $manifest as $m ) {
	$html = file_get_contents( $root . '/content/' . $m['content_file'] );
	$html = vc_rewrite_html( $html, $ctx );
	$parent_id = 0;
	if ( ! empty( $m['parent'] ) ) {
		$parent_id = isset( $ids[ $m['parent'] ] ) ? $ids[ $m['parent'] ] : 0;
		if ( ! $parent_id ) { WP_CLI::warning( "parent '{$m['parent']}' missing for {$m['slug']}" ); }
	}
	$post = array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => $m['title'],
		'post_name'    => $m['slug'],
		'post_content' => $html,
		'post_parent'  => $parent_id,
		'menu_order'   => (int) $m['menu_order'],
	);
	$id = vc_find_by_old_path( $m['old_path'] );
	if ( $id ) { $post['ID'] = $id; wp_update_post( wp_slash( $post ) ); $updated++; }
	else       { $id = wp_insert_post( wp_slash( $post ) ); $created++; }
	if ( is_wp_error( $id ) || ! $id ) { WP_CLI::warning( "failed: {$m['old_path']}" ); continue; }
	if ( empty( $m['parent'] ) ) { $ids[ $m['slug'] ] = $id; } // top-level pages (section landings) are looked up by slug as parents
	update_post_meta( $id, '_vc_old_path', $m['old_path'] );
	update_post_meta( $id, '_vc_old_url', $m['old_url'] );
	foreach ( $m['meta'] as $k => $v ) {
		if ( 'vc_banner_images' === $k ) {
			// keep only banner images that resolve to a file we actually have; page.php falls back to the default banner
			$urls = array();
			foreach ( json_decode( $v, true ) ?: array() as $u ) {
				$n = vc_map_url( $u, $ctx );
				if ( $n ) { $urls[] = $n; }
			}
			$v = wp_json_encode( $urls );
		} elseif ( 'vc_breadcrumbs' === $k ) {
			$crumbs = json_decode( $v, true ) ?: array();
			foreach ( $crumbs as &$c ) {
				if ( ! empty( $c['url'] ) ) { $n = vc_map_url( $c['url'], $ctx ); $c['url'] = $n ?: $c['url']; }
			}
			unset( $c );
			$v = wp_json_encode( $crumbs );
		} elseif ( in_array( $k, array( 'vc_leftnav', 'vc_inner_buttons', 'vc_contact_box' ), true ) ) {
			$v = vc_rewrite_html( $v, $ctx );
		}
		update_post_meta( $id, $k, wp_slash( $v ) );
	}
}

// Banner/slider URLs that point at the Media Library need the homepage too
WP_CLI::success( "pages: $created created, $updated updated" );
if ( $ctx['unresolved'] ) {
	$file = $root . '/content/unresolved-links.txt';
	file_put_contents( $file, implode( "\n", array_keys( $ctx['unresolved'] ) ) . "\n" );
	WP_CLI::warning( count( $ctx['unresolved'] ) . " internal URLs had no target (not mirrored); listed in content/unresolved-links.txt" );
}
