<?php
/**
 * Legacy URL redirects driven by inc/redirects.csv (copy of /redirects.csv; scripts/import.sh installs it).
 * Runs only on 404s, so real WordPress URLs and uploaded files are never intercepted.
 * Columns: old_path,new_path,status,note   — an old_path starting with "^" is a regular expression.
 */
add_action( 'template_redirect', function () {
	if ( ! is_404() ) {
		return;
	}
	$csv = __DIR__ . '/redirects.csv';
	if ( ! is_readable( $csv ) ) {
		return;
	}
	$req = rawurldecode( wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ) ); // phpcs:ignore
	$req_l = strtolower( $req );
	static $rows = null;
	if ( null === $rows ) {
		$rows = array();
		if ( ( $h = fopen( $csv, 'r' ) ) ) {
			fgetcsv( $h, 0, ',', '"', '' );
			while ( ( $r = fgetcsv( $h, 0, ',', '"', '' ) ) !== false ) {
				$rows[] = $r;
			}
			fclose( $h );
		}
	}
	foreach ( $rows as $r ) {
		if ( count( $r ) < 3 ) { continue; }
		list( $old, $new, $status ) = $r;
		if ( '^' === substr( $old, 0, 1 ) ) {
			if ( preg_match( '#' . str_replace( '#', '\#', $old ) . '#i', $req ) ) { wp_safe_redirect( home_url( $new ), (int) $status ); exit; }
		} elseif ( strtolower( $old ) === $req_l || strtolower( rtrim( $old, '/' ) ) === strtolower( rtrim( $req, '/' ) ) ) {
			wp_safe_redirect( home_url( $new ), (int) $status );
			exit;
		}
	}
} );
