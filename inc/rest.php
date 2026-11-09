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
