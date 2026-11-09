<?php
// php tests/render.php <out_dir> [site_base]   — render front page + every page in content/manifest.json through the theme templates
$root = dirname( __DIR__ );
$GLOBALS['vc'] = array();
require __DIR__ . '/wp-stub.php';
$GLOBALS['vc']['root'] = $root;
if ( isset( $argv[2] ) ) { $GLOBALS['vc']['site'] = rtrim( $argv[2], '/' ); }
$out = rtrim( $argv[1] ?? '/tmp/vc-render', '/' );
@mkdir( $out, 0777, true );
require $root . '/scripts/lib-rewrite.php';
require $root . '/theme/vineyard/functions.php';
function vc_run_template( $file ) {
	$GLOBALS['vc']['styles'] = $GLOBALS['vc']['scripts'] = $GLOBALS['vc']['inline'] = array();
	ob_start();
	include get_template_directory() . '/' . $file;
	return ob_get_clean();
}
// media: for the harness, "Media Library" lookups fall back to the theme-less path; resolve to /wp-content/uploads/legacy/<path>
$GLOBALS['vc']['front'] = true;
file_put_contents( "$out/index.html", vc_run_template( 'front-page.php' ) );
$GLOBALS['vc']['front'] = false;
$ctx = array( 'page_map' => vc_load_page_map( $root . '/theme/vineyard' ), 'media_map' => vc_load_media_csv( $root . '/content/media.csv' ), 'home' => $GLOBALS['vc']['site'] . '/',
	'uploads' => $GLOBALS['vc']['site'] . '/wp-content/uploads', 'theme_assets' => get_template_directory_uri() . '/_assets_', 'theme_uri' => get_template_directory_uri(), 'unresolved' => array() );
$m = json_decode( file_get_contents( $root . '/content/manifest.json' ), true );
$n = 0;
foreach ( $m as $p ) {
	$meta = array();
	foreach ( $p['meta'] as $k => $v ) {
		if ( 'vc_banner_images' === $k ) { $u = array(); foreach ( json_decode( $v, true ) as $x ) { $y = vc_map_url( $x, $ctx ); if ( $y ) { $u[] = $y; } } $v = json_encode( $u ); }
		elseif ( 'vc_breadcrumbs' === $k ) { $cr = json_decode( $v, true ); foreach ( $cr as &$c ) { if ( ! empty( $c['url'] ) ) { $c['url'] = vc_map_url( $c['url'], $ctx ) ?: $c['url']; } } unset( $c ); $v = json_encode( $cr ); }
		elseif ( in_array( $k, array( 'vc_leftnav', 'vc_inner_buttons', 'vc_contact_box' ), true ) ) { $v = vc_rewrite_html( $v, $ctx ); }
		$meta[ $k ] = $v;
	}
	$GLOBALS['vc']['post'] = array( 'title' => $p['title'], 'content' => vc_rewrite_html( file_get_contents( $root . '/content/' . $p['content_file'] ), $ctx ), 'meta' => $meta, 'new_path' => $p['new_path'] );
	$html = vc_run_template( 'page.php' );
	$dir = $out . '/' . $p['new_path'];
	@mkdir( $dir, 0777, true );
	file_put_contents( $dir . 'index.html', $html );
	$n++;
}
echo "rendered front page + $n pages to $out\n";
