<?php
/**
 * Import images & documents into the Media Library.
 * Run via:  wp eval-file scripts/import-media.php <repo_root>
 *
 * Files are copied to wp-content/uploads/legacy/<original site path> (so the new URL is predictable and
 * redirects.csv can be exact) and registered as attachments. The old path is stored in meta "_vc_old_path"
 * (used by vineyard_media_url() in the theme). Idempotent: already-imported paths are skipped.
 */
if ( ! defined( 'WP_CLI' ) ) {
	exit( "Run with WP-CLI: wp eval-file scripts/import-media.php <repo_root>\n" );
}
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once __DIR__ . '/lib-rewrite.php';

$root = isset( $args[0] ) ? rtrim( $args[0], '/' ) : dirname( __DIR__ );
$map  = vc_load_media_csv( $root . '/content/media.csv' );
$up   = wp_upload_dir();
global $wpdb;
$existing = $wpdb->get_col( "SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key='_vc_old_path'" ); // phpcs:ignore
$existing = array_flip( $existing );

$total = count( $map );
$done  = 0; $skipped = 0; $failed = 0; $i = 0;
add_filter( 'intermediate_image_sizes_advanced', function ( $sizes ) { return $sizes; } );
foreach ( $map as $old => $local ) {
	$i++;
	if ( isset( $existing[ $old ] ) ) { $skipped++; continue; }
	$src = $root . '/' . $local;
	if ( ! is_file( $src ) ) { WP_CLI::warning( "missing file: $local" ); $failed++; continue; }
	$rel  = 'legacy/' . $old;
	$dest = $up['basedir'] . '/' . $rel;
	wp_mkdir_p( dirname( $dest ) );
	if ( ! copy( $src, $dest ) ) { WP_CLI::warning( "copy failed: $old" ); $failed++; continue; }
	$type = wp_check_filetype( basename( $old ) );
	$att  = array(
		'post_mime_type' => $type['type'] ?: 'application/octet-stream',
		'post_title'     => preg_replace( '/\.[^.]+$/', '', basename( $old ) ),
		'post_status'    => 'inherit',
		'guid'           => $up['baseurl'] . '/legacy/' . vc_encode_path( $old ),
	);
	$id = wp_insert_attachment( $att, $dest );
	if ( is_wp_error( $id ) || ! $id ) { WP_CLI::warning( "attachment failed: $old" ); $failed++; continue; }
	update_post_meta( $id, '_wp_attached_file', $rel );
	update_post_meta( $id, '_vc_old_path', $old );
	if ( 0 === strpos( $att['post_mime_type'], 'image/' ) && 'image/svg+xml' !== $att['post_mime_type'] ) {
		wp_update_attachment_metadata( $id, wp_generate_attachment_metadata( $id, $dest ) );
	}
	$done++;
	if ( 0 === $done % 100 ) { WP_CLI::log( "  …$done imported ($i/$total)" ); }
}
delete_transient( 'vineyard_media_index' );
WP_CLI::success( "media: $done imported, $skipped already present, $failed failed (of $total)" );
