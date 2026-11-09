<?php
/**
 * Read-only details the page converter needs (contact box, top buttons, old template) for pages copied from the old site.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
add_action( 'rest_api_init', function () {
	register_rest_route( 'vineyard/v1', '/page-parts/(?P<id>\d+)', array(
		'methods'             => 'GET',
		'permission_callback' => function ( $r ) { return current_user_can( 'edit_post', (int) $r['id'] ); },
		'callback'            => function ( $r ) {
			$id = (int) $r['id'];
			return array(
				'id'       => $id,
				'contact'  => function_exists( 'vcc_page_contact' ) ? vcc_page_contact( $id ) : null,
				'buttons'  => function_exists( 'vcc_page_buttons' ) ? vcc_page_buttons( $id ) : array(),
				'template' => (string) get_post_meta( $id, '_wp_page_template', true ),
				'is_front' => (int) get_option( 'page_on_front' ) === $id,
				'thumb'    => (int) get_post_thumbnail_id( $id ),
				'related'  => function_exists( 'vcc_page_related' ) ? (string) vcc_page_related( $id ) : '',
			);
		},
	) );
} );

/**
 * Admins only: copy a file from the original site copy (themes/vineyard/files) into the Media Library,
 * so links no longer depend on that folder. Returns the new Media Library address.
 */
add_action( 'rest_api_init', function () {
	register_rest_route( 'vineyard/v1', '/import-file', array(
		'methods'             => 'POST',
		'permission_callback' => function () { return current_user_can( 'manage_options' ); },
		'args'                => array( 'path' => array( 'type' => 'string', 'required' => true ) ),
		'callback'            => function ( $r ) {
			$base = realpath( get_theme_root() . '/vineyard/files' );
			$path = rawurldecode( (string) $r['path'] );
			$src  = $base ? realpath( $base . '/' . ltrim( $path, '/' ) ) : false;
			if ( ! $src || 0 !== strpos( $src, $base . DIRECTORY_SEPARATOR ) || ! is_file( $src ) ) {
				return new WP_Error( 'vcb_missing', 'File not found', array( 'status' => 404 ) );
			}
			$key  = 'vcb_imported_' . md5( $path );
			$have = (int) get_option( $key );
			if ( $have && get_post( $have ) ) {
				return array( 'id' => $have, 'url' => wp_get_attachment_url( $have ) );
			}
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
			$tmp = wp_tempnam( basename( $src ) );
			copy( $src, $tmp );
			$name = basename( $src );
			$id   = media_handle_sideload( array( 'name' => $name, 'tmp_name' => $tmp ), 0, preg_replace( '/\.[a-z0-9]+$/i', '', $name ) );
			if ( is_wp_error( $id ) ) {
				@unlink( $tmp ); // phpcs:ignore
				return $id;
			}
			update_option( $key, (int) $id, false );
			return array( 'id' => (int) $id, 'url' => wp_get_attachment_url( $id ) );
		},
	) );
} );
