<?php
// php tests/test-rewrite.php  — runs the importer's link rewriter over every content/*.html and reports unresolved internal links.
require __DIR__ . '/../scripts/lib-rewrite.php';
$root = dirname( __DIR__ );
$ctx  = array(
	'page_map'     => vc_load_page_map( $root . '/theme/vineyard' ),
	'media_map'    => vc_load_media_csv( $root . '/content/media.csv' ),
	'home'         => 'https://example.test/',
	'uploads'      => 'https://example.test/wp-content/uploads',
	'theme_assets' => 'https://example.test/wp-content/themes/vineyard/_assets_',
	'theme_uri'    => 'https://example.test/wp-content/themes/vineyard',
	'unresolved'   => array(),
);
$m = json_decode( file_get_contents( $root . '/content/manifest.json' ), true );
$left_old = 0; $changed = 0; $files = 0;
foreach ( $m as $p ) {
	$html = file_get_contents( $root . '/content/' . $p['content_file'] );
	$new  = vc_rewrite_html( $html, $ctx );
	$files++;
	if ( $new !== $html ) { $changed++; }
	preg_match_all( '#(?:href|src)=["\'](?:https?:)?//(?:www\.)?vineyardutah\.(?:gov|org)[^"\']*#i', $new, $mm );
	$left_old += count( $mm[0] );
}
printf( "files: %d, rewritten: %d, old-host refs left: %d, unresolved distinct: %d\n", $files, $changed, $left_old, count( $ctx['unresolved'] ) );
$u = array_keys( $ctx['unresolved'] ); sort( $u );
foreach ( array_slice( $u, 0, 40 ) as $x ) { echo "  UNRESOLVED $x\n"; }
// spot check
$t = vc_rewrite_html( '<a href="https://www.vineyardutah.gov/government/city_council2.php#x">a</a><a href="https://www.vineyardutah.gov/Finance/FY 27 Tentative Budget -updated 5.12.2026 rb.pdf?t=202605181114460">b</a><div data-style="background:url(\'Headshots/IMG_1037%20-%20Copy.jpg?t=1\')"></div><a href="https://example.com/x">c</a>', $ctx );
echo $t, "\n";
