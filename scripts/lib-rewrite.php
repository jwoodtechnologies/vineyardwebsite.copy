<?php
/**
 * Link rewriting shared by import-pages.php and tests (works without WordPress loaded).
 *
 *   vc_rewrite_html( $html, $ctx ) where $ctx = [
 *      'page_map'  => [ 'government/city_council2.php' => 'government/city-council2/', ... ],
 *      'media_map' => [ 'Finance/FY 27 Budget.pdf' => true, ... ],   // keys = old path without query
 *      'home'      => 'https://example.org/',                          // trailing slash
 *      'uploads'   => 'https://example.org/wp-content/uploads',
 *      'unresolved'=> &array,                                          // collects internal URLs that could not be mapped
 *   ]
 */
const VC_OLD_HOSTS = array( 'www.vineyardutah.gov', 'vineyardutah.gov', 'www.vineyardutah.org', 'vineyardutah.org', 'cms3.revize.com' );

function vc_encode_path( $path ) {
	return implode( '/', array_map( 'rawurlencode', explode( '/', $path ) ) );
}

/** Map one URL. Returns the new URL or the original if it is external / unknown. */
function vc_map_url( $url, &$ctx ) {
	$url = trim( html_entity_decode( $url, ENT_QUOTES ) );
	if ( '' === $url || preg_match( '#^(mailto:|tel:|javascript:|data:|\#)#i', $url ) ) {
		return null;
	}
	$parts = parse_url( $url );
	if ( false === $parts ) {
		return null;
	}
	if ( ! empty( $parts['host'] ) && ! in_array( strtolower( $parts['host'] ), VC_OLD_HOSTS, true ) ) {
		return null; // genuinely external
	}
	$path = isset( $parts['path'] ) ? rawurldecode( $parts['path'] ) : '';
	// cms3.revize.com/revize/vineyard/<path> is the CMS origin of the same files
	$path = preg_replace( '#^/?revize/vineyard/#', '', $path );
	$path = ltrim( $path, '/' );
	while ( 0 === strpos( $path, './' ) || 0 === strpos( $path, '../' ) ) { // pages used <base href="/">, so ../ stays at the root
		$path = substr( $path, 0 === strpos( $path, './' ) ? 2 : 3 );
	}
	// relative URL (no host): resolved against the site root, as the old pages used <base href="/">
	$frag = isset( $parts['fragment'] ) ? '#' . $parts['fragment'] : '';
	$qs   = isset( $parts['query'] ) ? $parts['query'] : '';

	if ( '' === $path || 'index.php' === $path || 'index.html' === $path ) {
		return $ctx['home'] . $frag;
	}
	if ( isset( $ctx['page_map'][ $path ] ) ) {
		return $ctx['home'] . $ctx['page_map'][ $path ] . $frag;
	}
	if ( isset( $ctx['page_map'][ rtrim( $path, '/' ) . '/index.php' ] ) ) {
		return $ctx['home'] . $ctx['page_map'][ rtrim( $path, '/' ) . '/index.php' ] . $frag;
	}
	if ( isset( $ctx['media_map'][ $path ] ) ) {
		return ( isset( $ctx['files_base'] ) ? $ctx['files_base'] : $ctx['uploads'] . '/vineyard-files' ) . '/' . vc_encode_path( $path ) . $frag; // drops the ?t=… cache-buster
	}
	if ( 0 === strpos( $path, 'revize/' ) && isset( $ctx['theme_uri'] ) ) {
		return $ctx['theme_uri'] . '/' . vc_encode_path( $path ) . $frag;
	}
	if ( 0 === strpos( $path, '_assets_/' ) ) {
		return $ctx['theme_assets'] . '/' . vc_encode_path( substr( $path, 9 ) );
	}
	if ( 'calendar.php' === $path || 'search.php' === $path ) {
		return $ctx['home'] . ( 'search.php' === $path ? '?s=' . rawurlencode( $qs ) : 'calendar/' ) . $frag;
	}
	$ctx['unresolved'][ $url ] = true;
	return null;
}

function vc_rewrite_html( $html, &$ctx ) {
	// href / src / data-src / poster / action
	$html = preg_replace_callback(
		'/\b(href|src|data-src|poster|action)\s*=\s*("([^"]*)"|\'([^\']*)\')/i',
		function ( $m ) use ( &$ctx ) {
			$q   = $m[2][0];
			$val = '"' === $q ? $m[3] : $m[4];
			$new = vc_map_url( $val, $ctx );
			return null === $new ? $m[0] : $m[1] . '=' . $q . htmlspecialchars( $new, ENT_QUOTES, 'UTF-8', false ) . $q;
		},
		$html
	);
	// url(...) inside inline style / data-style
	$html = preg_replace_callback(
		'/url\(\s*([\'"]?)([^\'")]+)\1\s*\)/i',
		function ( $m ) use ( &$ctx ) {
			$new = vc_map_url( $m[2], $ctx );
			return null === $new ? $m[0] : 'url(' . $m[1] . $new . $m[1] . ')';
		},
		$html
	);
	return $html;
}

/** Load page_map from the theme's generated legacy-map.php. */
function vc_load_page_map( $theme_dir ) {
	$map = include $theme_dir . '/inc/legacy-map.php';
	return is_array( $map ) ? $map : array();
}

/** media.csv -> [ old_path => local_path ] */
function vc_load_media_csv( $file ) {
	$out = array();
	if ( ( $h = fopen( $file, 'r' ) ) ) {
		fgetcsv( $h, 0, ',', '"', '' );
		while ( ( $r = fgetcsv( $h, 0, ',', '"', '' ) ) !== false ) {
			if ( isset( $r[1] ) ) {
				$out[ $r[0] ] = $r[1];
			}
		}
		fclose( $h );
	}
	return $out;
}
