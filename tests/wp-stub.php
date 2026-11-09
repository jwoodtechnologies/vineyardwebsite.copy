<?php
/**
 * Minimal WordPress function stubs so the theme templates can be rendered with plain PHP (NOT a WordPress replacement;
 * used only to smoke-test markup/asset wiring when Docker/WP isn't available). See tests/render.php.
 */
define( 'ABSPATH', __DIR__ . '/' );
define( 'HOUR_IN_SECONDS', 3600 );
$GLOBALS['vc'] = array( 'actions' => array(), 'styles' => array(), 'scripts' => array(), 'inline' => array(), 'meta' => array(), 'post' => null, 'site' => 'http://localhost:8765', 'theme' => 'wp-content/themes/vineyard', 'uploads' => 'wp-content/uploads' );
function add_action( $h, $cb, $p = 10 ) { $GLOBALS['vc']['actions'][ $h ][] = $cb; }
function add_filter( $h, $cb, $p = 10, $n = 1 ) {}
function remove_filter() {}
function add_shortcode() {}
function add_theme_support() {}
function register_nav_menus() {}
function do_action( $h ) { foreach ( $GLOBALS['vc']['actions'][ $h ] ?? array() as $cb ) { $cb(); } }
function get_template_directory() { return $GLOBALS['vc']['root'] . '/theme/vineyard'; }
function get_template_directory_uri() { return $GLOBALS['vc']['site'] . '/' . $GLOBALS['vc']['theme']; }
function get_theme_root_uri() { return $GLOBALS['vc']['site'] . '/wp-content/themes'; }
function trailingslashit( $s ) { return rtrim( $s, '/' ) . '/'; }
function home_url( $p = '' ) { return $GLOBALS['vc']['site'] . ( '' === $p ? '' : '/' . ltrim( $p, '/' ) ); }
function content_url( $p = '' ) { return $GLOBALS['vc']['site'] . '/wp-content/' . ltrim( $p, '/' ); }
function esc_url( $u ) { return htmlspecialchars( $u, ENT_QUOTES ); }
function esc_attr( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); }
function esc_html( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); }
function wp_kses_post( $s ) { return $s; }
function wp_enqueue_style( $h, $src, $deps = array(), $v = null ) { $GLOBALS['vc']['styles'][ $h ] = $src . ( $v ? '?ver=' . $v : '' ); }
function wp_enqueue_script( $h, $src = '', $deps = array(), $v = null, $f = false ) { if ( $src ) { $GLOBALS['vc']['scripts'][ $h ] = $src; } }
function wp_register_script( $h, $src, $deps = array(), $v = null, $f = false ) { $GLOBALS['vc']['scripts'][ $h ] = $src; }
function wp_deregister_script() {}
function wp_add_inline_script( $h, $code, $pos = 'after' ) { $GLOBALS['vc']['inline'][ $h ][] = $code; }
function wp_head() {
	do_action( 'wp_enqueue_scripts' );
	echo '<title>' . esc_html( $GLOBALS['vc']['post']['title'] ?? 'Welcome to Vineyard UT' ) . "</title>\n";
	foreach ( $GLOBALS['vc']['styles'] as $h => $s ) { echo '<link rel="stylesheet" id="' . $h . '" href="' . esc_url( $s ) . '">' . "\n"; }
	do_action( 'wp_head' );
}
function wp_footer() {
	foreach ( $GLOBALS['vc']['scripts'] as $h => $s ) {
		echo '<script src="' . esc_url( $s ) . '"></script>' . "\n";
		foreach ( $GLOBALS['vc']['inline'][ $h ] ?? array() as $c ) { echo '<script>' . $c . "</script>\n"; }
	}
	do_action( 'wp_footer' );
}
function wp_body_open() {}
function language_attributes() { echo 'lang="en-US"'; }
function bloginfo( $w ) { echo 'UTF-8'; }
function body_class() { echo 'class="page ' . esc_attr( $GLOBALS['vc']['post']['meta']['vc_body_class'] ?? '' ) . '"'; }
function get_header() { include get_template_directory() . '/header.php'; }
function get_footer() { include get_template_directory() . '/footer.php'; }
function get_template_part( $slug ) { include get_template_directory() . '/' . $slug . '.php'; }
function get_search_query() { return ''; }
function is_front_page() { return ! empty( $GLOBALS['vc']['front'] ); }
function is_singular() { return empty( $GLOBALS['vc']['front'] ); }
function is_page() { return false; }
function is_404() { return false; }
function is_search() { return false; }
function get_the_ID() { return 1; }
function get_post_field( $f, $id ) { return $GLOBALS['vc']['post']['content'] ?? ''; }
function get_post_meta( $id, $k, $single = true ) { return $GLOBALS['vc']['post']['meta'][ $k ] ?? ''; }
function have_posts() { static $done = false; if ( $done ) { $done = false; return false; } $done = true; return true; }
function the_post() {}
function the_title() { echo esc_html( $GLOBALS['vc']['post']['title'] ); }
function the_content() { echo $GLOBALS['vc']['post']['content']; }
function get_the_title( $id = 0 ) { return $GLOBALS['vc']['post']['title'] ?? ''; }
function get_permalink( $id = 0 ) { return $GLOBALS['vc']['site'] . '/' . ( $GLOBALS['vc']['post']['new_path'] ?? '' ); }
function get_post_ancestors() { return array(); }
function do_shortcode( $s ) { return ''; }
function apply_filters( $h, $v ) { return $v; }
function wp_json_encode( $v ) { return json_encode( $v ); }
function wp_parse_url( $u, $c = -1 ) { return parse_url( $u, $c ); }
function wp_upload_dir() { return array( 'baseurl' => $GLOBALS['vc']['site'] . '/wp-content/uploads', 'basedir' => '/tmp' ); }
function get_transient() { return false; }
function set_transient() {}
function delete_transient() {}
function wp_nav_menu( $a ) {
	$tree = json_decode( file_get_contents( $GLOBALS['vc']['root'] . '/content/menu.json' ), true );
	$map  = include get_template_directory() . '/inc/legacy-map.php';
	$id = 100;
	$walk = function ( $nodes, $depth ) use ( &$walk, $map, &$id ) {
		$o = '';
		foreach ( $nodes as $n ) {
			$id++;
			$path = ltrim( rawurldecode( (string) parse_url( $n['url'], PHP_URL_PATH ) ), '/' );
			$host = parse_url( $n['url'], PHP_URL_HOST );
			$url  = ( ! $host || preg_match( '/vineyardutah/', $host ) ) ? ( isset( $map[ $path ] ) ? home_url( $map[ $path ] ) : ( '' === $path || 'index.php' === $path ? home_url( '/' ) : $n['url'] ) ) : $n['url'];
			$it = (object) array( 'ID' => $id, 'url' => $url, 'title' => $n['title'], 'target' => in_array( $n['target'], array( '_new', '_blank' ), true ) ? '_blank' : '', 'classes' => $n['children'] ? array( 'menu-item-has-children' ) : array() );
			$w = new Vineyard_Walker_Nav();
			$s = '';
			$w->start_el( $s, $it, $depth );
			if ( $n['children'] ) { $w->start_lvl( $s, $depth ); $s .= $walk( $n['children'], $depth + 1 ); $w->end_lvl( $s, $depth ); }
			$w->end_el( $s, $it, $depth );
			$o .= $s;
		}
		return $o;
	};
	printf( $a['items_wrap'], $a['menu_id'], $a['menu_class'], $walk( $tree, 0 ) );
}
class Walker_Nav_Menu { public function start_lvl( &$o, $d = 0, $a = null ) {} public function end_lvl( &$o, $d = 0, $a = null ) {} public function start_el( &$o, $i, $d = 0, $a = null, $id = 0 ) {} public function end_el( &$o, $i, $d = 0, $a = null ) {} }
function wp_safe_redirect() {}
function wp_unslash( $v ) { return $v; }
function wp_strip_all_tags( $s ) { return strip_tags( $s ); }
class VC_Stub_DB { public $postmeta = 'wp_postmeta'; public function get_results( $q ) {
	require_once $GLOBALS['vc']['root'] . '/scripts/lib-rewrite.php';
	$rows = array(); $i = 0; foreach ( vc_load_media_csv( $GLOBALS['vc']['root'] . '/content/media.csv' ) as $old => $_ ) { $i++; $rows[] = (object) array( 'post_id' => $i, 'meta_value' => $old ); $GLOBALS['vc']['att'][ $i ] = $old; }
	return $rows; } }
$GLOBALS['wpdb'] = new VC_Stub_DB();
function wp_get_attachment_url( $id ) { return $GLOBALS['vc']['site'] . '/wp-content/uploads/vineyard-files/' . vc_encode_path( $GLOBALS['vc']['att'][ $id ] ); }
