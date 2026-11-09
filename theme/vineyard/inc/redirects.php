<?php
/**
 * Fallback legacy-URL redirects driven by inc/redirects.csv (a copy of /redirects.csv: source,target,regex,code).
 * Skipped automatically when the Redirection plugin is active (import /redirects.csv there instead).
 * Runs only on 404s, so real WordPress URLs and deployed files are never intercepted.
 */
add_action( 'template_redirect', function () {
	if ( ! is_404() || class_exists( 'Red_Item' ) ) {
		return;
	}
	$csv = __DIR__ . '/redirects.csv';
	if ( ! is_readable( $csv ) ) {
		return;
	}
	$req = rawurldecode( (string) wp_parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ) ); // phpcs:ignore
	$h   = fopen( $csv, 'r' );
	if ( ! $h ) {
		return;
	}
	fgetcsv( $h, 0, ',', '"', '' ); // header
	while ( ( $r = fgetcsv( $h, 0, ',', '"', '' ) ) !== false ) {
		if ( count( $r ) < 4 ) {
			continue;
		}
		list( $src, $dst, $regex, $code ) = $r;
		$src = rawurldecode( $src );
		$hit = $regex ? (bool) preg_match( '#' . str_replace( '#', '\#', $src ) . '#i', $req ) : ( 0 === strcasecmp( rtrim( $src, '/' ), rtrim( $req, '/' ) ) );
		if ( $hit ) {
			fclose( $h );
			wp_safe_redirect( home_url( $dst ), (int) $code );
			exit;
		}
	}
	fclose( $h );
} );
