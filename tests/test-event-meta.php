<?php
/** php tests/test-event-meta.php — Events REST API registration (real includes/post-types.php, minimal WordPress stand-in). */
$root = dirname( __DIR__ );
define( 'ABSPATH', __DIR__ . '/' );
$R = array( 'types' => array(), 'tax' => array(), 'meta' => array(), 'init' => array(), 'caps' => array() );
function add_action( $h, $cb, $p = 10 ) { global $R; if ( 'init' === $h ) { $R['init'][ $p ][] = $cb; } }
function add_filter() {}
function register_post_type( $t, $a ) { global $R; $R['types'][ $t ] = $a; }
function register_taxonomy( $t, $o, $a ) { global $R; $R['tax'][ $t ] = $a + array( 'object' => $o ); }
function register_post_meta( $t, $k, $a ) { global $R; $R['meta'][ $t ][ $k ] = $a; }
function current_user_can( $c ) { global $R; return in_array( $c, $R['caps'], true ); }
function sanitize_text_field( $s ) { return trim( preg_replace( '/[\r\n\t ]+/', ' ', strip_tags( $s ) ) ); }
require $root . '/plugin/vineyard-city-content/includes/post-types.php';
ksort( $R['init'] ); foreach ( $R['init'] as $cbs ) { foreach ( $cbs as $cb ) { $cb(); } }
$f = 0; function check( $ok, $w ) { global $f; echo ( $ok ? '  ok   ' : '  FAIL ' ) . $w . "\n"; if ( ! $ok ) { $f++; } }

$ev = $R['types']['vc_event'];
check( ! empty( $ev['show_in_rest'] ) && 'vc_event' === $ev['rest_base'], 'vc_event is in the REST API at /wp/v2/vc_event' );
check( in_array( 'editor', $ev['supports'], true ), 'vc_event supports the editor (description = content.raw / content.rendered)' );
check( in_array( 'custom-fields', $ev['supports'], true ), 'vc_event supports custom-fields (required for "meta" in REST)' );
check( ! empty( $R['tax']['vc_event_cat']['show_in_rest'] ) && 'vc_event_cat' === $R['tax']['vc_event_cat']['rest_base'], 'vc_event_cat is in the REST API at /wp/v2/vc_event_cat' );

// the keys the "When and where" box saves (read from the source, so this test fails if the two ever drift apart)
preg_match_all( "/update_post_meta\\( \\\$post_id, '(_vcc_(?:start|end|all_day|location))'/", file_get_contents( $root . '/plugin/vineyard-city-content/includes/post-types.php' ), $m );
$box = array_values( array_unique( $m[1] ) ); sort( $box );
$reg = array_keys( $R['meta']['vc_event'] ); sort( $reg );
check( $box === $reg, 'registered keys = the keys the meta box saves: ' . implode( ', ', $reg ) );
foreach ( $R['meta']['vc_event'] as $k => $a ) {
	check( 'string' === $a['type'] && true === $a['single'] && ! empty( $a['show_in_rest'] ) && 'string' === $a['show_in_rest']['schema']['type'], "$k: string, single, show_in_rest" );
	$R['caps'] = array(); $no = call_user_func( $a['auth_callback'] );
	$R['caps'] = array( 'edit_posts' ); $yes = call_user_func( $a['auth_callback'] );
	check( ! $no && $yes, "$k: writable only by users who can edit_posts" );
}
// what REST accepts (schema pattern, applied before saving) and what gets stored (sanitize) – must match what the website reads
$S = $R['meta']['vc_event'];
$valid = function ( $k, $v ) use ( $S ) { $sc = $S[ $k ]['show_in_rest']['schema']; if ( isset( $sc['enum'] ) && ! in_array( $v, $sc['enum'], true ) ) { return false; } return empty( $sc['pattern'] ) || preg_match( '#' . $sc['pattern'] . '#', $v ); };
$san = function ( $k, $v ) use ( $S ) { return call_user_func( $S[ $k ]['sanitize_callback'], $v ); };
foreach ( array( array( '2026-11-10 17:00:00', '2026-11-10 17:00:00' ), array( '2026-11-10T17:00', '2026-11-10 17:00:00' ), array( '2026-11-10 17:00', '2026-11-10 17:00:00' ), array( '2026-11-10', '2026-11-10 00:00:00' ), array( '', '' ) ) as $c ) {
	check( $valid( '_vcc_start', $c[0] ) && $c[1] === $san( '_vcc_start', $c[0] ), "_vcc_start \"{$c[0]}\" accepted, stored as \"{$c[1]}\"" );
}
foreach ( array( '11/10/2026', '2026-11-10 5pm', 'tomorrow' ) as $bad ) { check( ! $valid( '_vcc_start', $bad ), "_vcc_start \"$bad\" rejected by the REST API (400)" ); }
check( $valid( '_vcc_all_day', '1' ) && $valid( '_vcc_all_day', '' ) && ! $valid( '_vcc_all_day', 'yes' ) && '1' === $san( '_vcc_all_day', '1' ), '_vcc_all_day accepts only "1" or ""' );
check( 'Vineyard Grove Park' === $san( '_vcc_location', " Vineyard Grove <b>Park</b>\n" ), '_vcc_location stored as plain text' );
// the format the meta box saves is exactly what REST stores (front end sorts/filters on it as DATETIME)
check( preg_match( '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $san( '_vcc_start', '2026-11-10T17:00' ) ), 'REST value has the same shape as the meta box value ("Y-m-d H:i:s")' );
// 1.0.3: titles/descriptions become plain text once (WordPress returns titles texturized: & → &#038;) and are escaped on output
function wp_strip_all_tags( $s ) { return trim( strip_tags( preg_replace( '@<(script|style)[^>]*?>.*?</\\1>@si', '', $s ) ) ); }
require $root . '/plugin/vineyard-city-content/includes/render.php';
foreach ( array(
	array( 'Trash &#038; Recycle Pickup', 'Trash & Recycle Pickup' ), array( 'Blizzard 5K &#038; 1K', 'Blizzard 5K & 1K' ),
	array( 'Mayor&#8217;s &#8220;Coffee&#8221; Chat &#038; Q&#038;A', "Mayor\u{2019}s \u{201C}Coffee\u{201D} Chat & Q&A" ), array( 'Fish &amp; Chips', 'Fish & Chips' ),
	array( 'It&#039;s &quot;on&quot;', 'It\'s "on"' ), array( '<p>Bins&nbsp;out &amp; <a href="/x">schedule</a></p>', 'Bins out & schedule' ), array( 'Plain & simple', 'Plain & simple' ),
) as $c ) {
	check( $c[1] === vcc_plain_text( $c[0] ), 'vcc_plain_text( ' . $c[0] . ' ) = ' . $c[1] );
}
$j = json_encode( array( 'title' => vcc_plain_text( 'Trash &#038; Recycle </script>' ) ), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE );
check( false === strpos( $j, '</' ) && false === strpos( $j, '&' ) && 'Trash & Recycle' === json_decode( $j, true )['title'], 'calendar JSON is safe inside <script> and decodes to "Trash & Recycle"' );

echo $f ? "\n$f check(s) FAILED\n" : "\nAll event REST checks passed\n";
exit( $f ? 1 : 0 );
