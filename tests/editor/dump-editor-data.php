<?php
/** Runs the plugin's real block registration (includes/blocks.php) with a minimal stand-in for WordPress and prints, as JSON,
 *  what WordPress would hand to the editor: the server-side block definitions (from block.json) and the localized editor data. */
$root = dirname( __DIR__, 2 );
define( 'ABSPATH', __DIR__ . '/' ); define( 'VCC_DIR', $root . '/plugin/vineyard-city-content/' ); define( 'VCC_URL', 'https://example.test/wp-content/plugins/vineyard-city-content/' ); define( 'VCC_VERSION', 'test' );
$GLOBALS['out'] = array( 'scripts' => array(), 'styles' => array(), 'blocks' => array(), 'localized' => null, 'categories' => array() );
function add_action( $h, $cb, $p = 10 ) { if ( 'init' === $h ) { $GLOBALS['init'][] = $cb; } }
function add_filter( $h, $cb ) { if ( 'block_categories_all' === $h ) { $GLOBALS['out']['categories'] = $cb( array( array( 'slug' => 'text', 'title' => 'Text' ) ) ); } }
function wp_register_script( $h, $src, $deps ) { $GLOBALS['out']['scripts'][ $h ] = array( 'src' => $src, 'deps' => $deps ); }
function wp_register_style( $h, $src ) { $GLOBALS['out']['styles'][ $h ] = $src; }
function wp_localize_script( $h, $var, $data ) { $GLOBALS['out']['localized'] = array( 'handle' => $h, 'var' => $var, 'data' => $data ); }
function admin_url( $p = '' ) { return 'https://example.test/wp-admin/' . $p; }
function register_block_type( $path, $args ) {
	if ( ! is_file( $path . '/block.json' ) ) { throw new Exception( "no block.json in $path" ); }
	$m = json_decode( file_get_contents( $path . '/block.json' ), true );
	foreach ( array( 'editorScript', 'editorStyle' ) as $k ) {
		$h = $m[ $k ];
		if ( 'editorScript' === $k && ! isset( $GLOBALS['out']['scripts'][ $h ] ) ) { throw new Exception( "$k $h not registered before the block" ); }
		if ( 'editorStyle' === $k && ! isset( $GLOBALS['out']['styles'][ $h ] ) ) { throw new Exception( "$k $h not registered before the block" ); }
	}
	if ( ! is_callable( $args['render_callback'] ) ) { throw new Exception( 'no render callback' ); }
	$GLOBALS['out']['blocks'][ $m['name'] ] = $m;
}
require VCC_DIR . 'includes/blocks.php';
foreach ( $GLOBALS['init'] as $cb ) { $cb(); }
echo json_encode( $GLOBALS['out'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
