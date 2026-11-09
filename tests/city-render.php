<?php
/**
 * Renders the REAL plugin + theme code (plugin/vineyard-city-content, theme/vineyard-city) through a tiny WordPress stub,
 * using the seed/pages data the plugin ships, so the output can be compared with the live site.
 *   php tests/city-render.php <out_dir> [site_base]
 * This is a smoke-test harness, not WordPress. (Jetpack forms are replaced by a placeholder form.)
 */
$root = dirname( __DIR__ );
define( 'ABSPATH', $root . '/tests/' );
define( 'HOUR_IN_SECONDS', 3600 );
define( 'WP_CONTENT_DIR', $root . '/tests/wp-content' );
$out  = rtrim( isset( $argv[1] ) ? $argv[1] : '/tmp/vcity-render', '/' );
$site = rtrim( isset( $argv[2] ) ? $argv[2] : 'http://localhost:8765', '/' );
@mkdir( $out, 0777, true );

/* ---------------------------------------------------------------- minimal WordPress */
$GLOBALS['S'] = array( 'actions' => array(), 'filters' => array(), 'styles' => array(), 'scripts' => array(), 'inline' => array(), 'options' => array(), 'posts' => array(), 'meta' => array(), 'thumbs' => array(), 'att' => array(), 'blocks' => array(), 'terms' => array(), 'menus' => array(), 'cur' => null, 'front' => false, 'next' => 1000 );
class WP_Error {}
class Walker_Nav_Menu { public function start_lvl( &$o, $d = 0, $a = null ) {} public function end_lvl( &$o, $d = 0, $a = null ) {} public function start_el( &$o, $i, $d = 0, $a = null, $id = 0 ) {} public function end_el( &$o, $i, $d = 0, $a = null ) {} }
function add_action( $h, $cb, $p = 10, $n = 1 ) { $GLOBALS['S']['actions'][ $h ][ $p ][] = $cb; }
function add_filter( $h, $cb, $p = 10, $n = 1 ) { $GLOBALS['S']['filters'][ $h ][ $p ][] = $cb; }
function do_action( $h ) { $a = $GLOBALS['S']['actions'][ $h ] ?? array(); ksort( $a ); foreach ( $a as $cbs ) { foreach ( $cbs as $cb ) { call_user_func( $cb ); } } }
function apply_filters( $h, $v, ...$args ) { $f = $GLOBALS['S']['filters'][ $h ] ?? array(); ksort( $f ); foreach ( $f as $cbs ) { foreach ( $cbs as $cb ) { $v = $cb( $v, ...$args ); } } return $v; }
function add_theme_support() {} function register_nav_menus() {} function register_sidebar() {} function add_shortcode() {} function register_activation_hook() {} function register_deactivation_hook() {}
function register_post_type() {} function register_taxonomy() {} function register_post_meta() {} function add_meta_box() {} function add_menu_page() {} function add_submenu_page() {} function wp_register_script() {}
function wp_localize_script() {} function flush_rewrite_rules() {} function add_post_type_support() {}
function register_block_type( $name, $args ) { if ( is_dir( $name ) ) { $name = json_decode( file_get_contents( $name . '/block.json' ), true )['name']; } $GLOBALS['S']['blocks'][ $name ] = $args['render_callback']; }
function wp_register_style() {} function get_bloginfo( $k = '' ) { return 'Vineyard City'; } function get_queried_object_id() { return $GLOBALS['S']['cur']; }
function plugin_dir_path( $f ) { return dirname( $f ) . '/'; }
function plugin_dir_url( $f ) { return $GLOBALS['SITE'] . '/wp-content/plugins/vineyard-city-content/'; }
function get_template_directory() { return $GLOBALS['ROOT'] . '/theme/vineyard-city'; }
function get_template_directory_uri() { return $GLOBALS['SITE'] . '/wp-content/themes/vineyard-city'; }
function home_url( $p = '' ) { return $GLOBALS['SITE'] . ( '' === $p ? '' : '/' . ltrim( $p, '/' ) ); }
function content_url( $p = '' ) { return $GLOBALS['SITE'] . '/wp-content/' . ltrim( $p, '/' ); }
function trailingslashit( $s ) { return rtrim( $s, '/' ) . '/'; }
function esc_url( $u ) { return htmlspecialchars( (string) $u, ENT_QUOTES ); } function esc_attr( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); }
function esc_html( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); } function esc_textarea( $s ) { return htmlspecialchars( (string) $s ); }
function wp_kses_post( $s ) { return $s; } function wp_strip_all_tags( $s ) { return trim( strip_tags( $s ) ); } function strip_shortcodes( $s ) { return preg_replace( '/\[[^\]]+\]/', '', $s ); }
function wp_json_encode( $v ) { return json_encode( $v, JSON_UNESCAPED_SLASHES ); } function wp_unslash( $v ) { return $v; }
function current_time( $t ) { return 'timestamp' === $t ? strtotime( '2026-11-09 08:00:00' ) : ( 'mysql' === $t ? '2026-11-09 08:00:00' : date( $t, strtotime( '2026-11-09 08:00:00' ) ) ); }
function date_i18n( $f, $ts ) { return date( $f, $ts ); }
function wp_enqueue_style( $h, $src = '', $d = array(), $v = null ) { if ( $src ) { $GLOBALS['S']['styles'][ $h ] = $src; } }
function wp_enqueue_script( $h, $src = '', $d = array(), $v = null, $f = false ) { if ( $src ) { $GLOBALS['S']['scripts'][ $h ] = $src; } }
function wp_add_inline_script( $h, $code, $pos = 'after' ) { $GLOBALS['S']['inline'][ $h ][] = array( $pos, $code ); }
function wp_style_is( $h, $w ) { return isset( $GLOBALS['S']['styles'][ $h ] ); }
function wp_print_scripts() {} function wp_body_open() {} function language_attributes() { echo 'lang="en-US"'; } function bloginfo( $w ) { echo 'Vineyard City'; }
function body_class() { $c = apply_filters( 'body_class', array_filter( array( 'page', $GLOBALS['S']['body'] ?? '' ) ) ); echo 'class="' . esc_attr( implode( ' ', array_unique( $c ) ) ) . '"'; }
function is_page_template( $t ) { return 'fullwidth' === ( $GLOBALS['S']['body'] ?? '' ) && 'template-fullwidth.php' === $t; }
function get_option( $k, $d = false ) { return array_key_exists( $k, $GLOBALS['S']['options'] ) ? $GLOBALS['S']['options'][ $k ] : $d; }
function update_option( $k, $v ) { $GLOBALS['S']['options'][ $k ] = $v; }
function wp_get_attachment_url( $id ) { return $GLOBALS['S']['att'][ $id ] ?? false; }
function get_post( $id ) { return $GLOBALS['S']['posts'][ $id ] ?? null; }
function get_post_meta( $id, $k, $single = true ) { return $GLOBALS['S']['meta'][ $id ][ $k ] ?? ''; }
function get_the_post_thumbnail_url( $id, $s = 'full' ) { return $GLOBALS['S']['thumbs'][ $id ] ?? false; }
function get_permalink( $id = 0 ) { $p = get_post( $id ?: ( $GLOBALS['S']['cur'] ?? 0 ) ); return $p ? home_url( '/' . ( $p->path ?? '' ) ) : home_url( '/' ); }
function get_the_title( $id = 0 ) { $p = get_post( $id ?: ( $GLOBALS['S']['cur'] ?? 0 ) ); return $p ? $p->post_title : ''; }
function get_the_ID() { return $GLOBALS['S']['cur']; } function wp_get_post_parent_id( $id ) { $p = get_post( $id ); return $p ? (int) ( $p->post_parent ?? 0 ) : 0; }
function get_posts( $a ) {
	$r = array_filter( $GLOBALS['S']['posts'], function ( $p ) use ( $a ) { return $p->post_type === $a['post_type'] && 'publish' === ( $p->post_status ?? 'publish' ); } );
	if ( isset( $a['meta_query'][0] ) ) { $mq = $a['meta_query'][0]; $r = array_filter( $r, function ( $p ) use ( $mq ) { $v = get_post_meta( $p->ID, $mq['key'] ); return $v && $v >= $mq['value']; } ); }
	if ( ! empty( $a['tax_query'][0] ) ) { $slug = $a['tax_query'][0]['terms']; $r = array_filter( $r, function ( $p ) use ( $slug ) { return in_array( $slug, $GLOBALS['S']['terms'][ $p->ID ] ?? array(), true ); } ); }
	if ( isset( $a['meta_key'] ) && '_vcc_start' === $a['meta_key'] ) { usort( $r, function ( $x, $y ) { return strcmp( get_post_meta( $x->ID, '_vcc_start' ), get_post_meta( $y->ID, '_vcc_start' ) ); } ); }
	else { usort( $r, function ( $x, $y ) { return ( $x->menu_order ?? 0 ) <=> ( $y->menu_order ?? 0 ); } ); }
	return array_slice( array_values( $r ), 0, $a['numberposts'] ?? 10 );
}
function wp_get_post_terms( $id, $tax ) { return array_map( function ( $s ) { return (object) array( 'slug' => $s, 'name' => ucfirst( $s ), 'term_id' => 1 ); }, $GLOBALS['S']['terms'][ $id ] ?? array() ); }
function get_term_by( $f, $slug, $tax ) { return (object) array( 'term_id' => 1, 'slug' => $slug ); } function get_term_meta() { return ''; }
function get_terms( $a ) { return array_map( function ( $s ) { return (object) array( 'slug' => $s, 'name' => ucfirst( $s ) ); }, array( 'meetings', 'recreation', 'community', 'utilities', 'library' ) ); }
function get_post_field( $f, $id ) { return $GLOBALS['S']['content'] ?? ''; }
function has_block( $n ) { return false !== strpos( $GLOBALS['S']['content'] ?? '', 'wp:' . $n ); }
function wp_list_pluck( $a, $f ) { return array_map( function ( $o ) use ( $f ) { return is_object( $o ) ? $o->$f : $o[ $f ]; }, $a ); }
function is_wp_error( $x ) { return $x instanceof WP_Error; }
function is_front_page() { return $GLOBALS['S']['front']; } function is_singular() { return true; } function in_the_loop() { return true; } function is_main_query() { return true; }
function is_search() { return false; } function get_search_query() { return ''; } function is_404() { return false; } function is_active_sidebar() { return false; } function dynamic_sidebar() {}
function get_pages( $a ) { return array(); } function wp_parse_url( $u, $c = -1 ) { return parse_url( $u, $c ); } function is_admin() { return false; } function current_user_can( $c ) { return false; } function admin_url( $p = '' ) { return $GLOBALS['SITE'] . '/wp-admin/' . $p; }
function wp_head() { do_action( 'wp_enqueue_scripts' ); echo '<title>' . esc_html( $GLOBALS['S']['title'] ?? 'Vineyard City' ) . "</title>\n"; foreach ( $GLOBALS['S']['styles'] as $h => $s ) { echo '<link rel="stylesheet" href="' . esc_url( $s ) . '">' . "\n"; } do_action( 'wp_head' ); }
function wp_footer() {
	// original jQuery 3.5.1 stands in for WordPress' own jQuery in this harness
	echo '<script src="' . $GLOBALS['SITE'] . '/wp-content/themes/vineyard-city/_assets_/vendor/jquery-3.5.1/jquery.min.js"></script>' . "\n<script>window.\$=window.jQuery;</script>\n";
	do_action( 'wp_footer' );
	foreach ( $GLOBALS['S']['scripts'] as $h => $s ) { foreach ( $GLOBALS['S']['inline'][ $h ] ?? array() as $i ) { if ( 'before' === $i[0] ) { echo '<script>' . $i[1] . "</script>\n"; } } echo '<script src="' . esc_url( $s ) . '"></script>' . "\n"; foreach ( $GLOBALS['S']['inline'][ $h ] ?? array() as $i ) { if ( 'before' !== $i[0] ) { echo '<script>' . $i[1] . "</script>\n"; } } }
	foreach ( $GLOBALS['S']['inline'] as $h => $list ) { if ( ! isset( $GLOBALS['S']['scripts'][ $h ] ) && 'jquery' !== $h ) { foreach ( $list as $i ) { echo '<script>' . $i[1] . "</script>\n"; } } }
}
function get_header() { include get_template_directory() . '/header.php'; } function get_footer() { include get_template_directory() . '/footer.php'; }
function get_template_part( $s ) { include get_template_directory() . '/' . $s . '.php'; }
function have_posts() { static $d = false; if ( $d ) { $d = false; return false; } $d = true; return true; } function the_post() {}
function the_title() { echo esc_html( get_the_title() ); } function get_the_content() { return $GLOBALS['S']['content']; }
function the_content() { echo do_blocks_stub( $GLOBALS['S']['content'] ); }
function do_blocks_stub( $c ) {
	$c = preg_replace_callback( '/<!-- wp:([a-z0-9-]+\/[a-z0-9-]+) \/-->/', function ( $m ) { return isset( $GLOBALS['S']['blocks'][ $m[1] ] ) ? call_user_func( $GLOBALS['S']['blocks'][ $m[1] ] ) : ''; }, $c );
	$c = preg_replace( '/<!-- \/?wp:shortcode -->/', '', $c );
	return preg_replace_callback( '/\[contact-form ([^\]]*)\](.*?)\[\/contact-form\]/s', function ( $m ) { return '<form class="contact-form"><p>[form stand-in]</p></form>'; }, $c );
}
function wp_nav_menu( $a ) {
	$walker = $a['walker']; $id = $a['menu_id'] ?? 'x'; $items = array();
	$conv = function ( $nodes, $depth ) use ( &$conv, $walker ) {
		$s = '';
		foreach ( $nodes as $n ) {
			static $uid = 100; $uid++;
			$kids = $n['children'] ?? array();
			$url = $n['url']; if ( 0 === strpos( $url, '/' ) ) { $url = home_url( $url ); }
			$it = (object) array( 'ID' => $uid, 'url' => $url, 'title' => $n['title'], 'target' => ( ! empty( $n['new_tab'] ) || in_array( $n['target'] ?? '', array( '_new', '_blank' ), true ) ) ? '_blank' : '', 'classes' => $kids ? array( 'menu-item-has-children' ) : array() );
			$one = ''; $walker->start_el( $one, $it, $depth );
			if ( $kids ) { $walker->start_lvl( $one, $depth ); $one .= $conv( $kids, $depth + 1 ); $walker->end_lvl( $one, $depth ); }
			$walker->end_el( $one, $it, $depth ); $s .= $one;
		}
		return $s;
	};
	if ( isset( $a['theme_location'] ) ) {
		$tree = json_decode( file_get_contents( $GLOBALS['ROOT'] . '/content/menu.json' ), true );
		$map = include $GLOBALS['ROOT'] . '/theme/vineyard/inc/legacy-map.php';
		$fix = function ( $nodes ) use ( &$fix, $map ) { foreach ( $nodes as &$n ) { $p = ltrim( rawurldecode( (string) parse_url( $n['url'], PHP_URL_PATH ) ), '/' ); $h = parse_url( $n['url'], PHP_URL_HOST ); if ( ( ! $h || preg_match( '/vineyardutah/', $h ) ) ) { $n['url'] = isset( $map[ $p ] ) ? '/' . $map[ $p ] : ( '' === $p || 'index.php' === $p ? '/' : $n['url'] ); } $n['children'] = $fix( $n['children'] ); } return $nodes; };
		$body = $conv( $fix( $tree ), 0 );
	} else {
		$body = $conv( $GLOBALS['S']['menus'][ $a['menu'] ] ?? array(), 0 );
	}
	$html = sprintf( $a['items_wrap'], $id, $a['menu_class'], $body );
	if ( isset( $a['echo'] ) && ! $a['echo'] ) { return $html; }
	echo $html;
}
function the_posts_pagination() {} function the_permalink() {} function get_the_excerpt() { return ''; }

/* ---------------------------------------------------------------- load the real plugin + theme */
$GLOBALS['ROOT'] = $root; $GLOBALS['SITE'] = $site;
require $root . '/plugin/vineyard-city-content/vineyard-city-content.php';
require $root . '/theme/vineyard-city/functions.php';
do_action( 'init' ); do_action( 'after_setup_theme' ); do_action( 'widgets_init' );

/* ---------------------------------------------------------------- state = what the "Load starter content" + "Tidy pages" buttons create */
$seed  = json_decode( file_get_contents( $root . '/plugin/vineyard-city-content/data/seed.json' ), true );
$pages = json_decode( file_get_contents( $root . '/plugin/vineyard-city-content/data/pages.json' ), true );
$man   = json_decode( file_get_contents( $root . '/content/manifest.json' ), true );
$S = &$GLOBALS['S']; $att = 1;
$ref_url = function ( $r ) use ( &$S, &$att ) { $u = isset( $r['file'] ) ? vcc_file_url( $r['file'] ) : content_url( 'themes/vineyard-city/_assets_/' . $r['asset'] ); $S['att'][ ++$att ] = $u; return $att; };
$settings = array();
foreach ( $seed['settings'] as $k => $v ) { $settings[ $k ] = is_array( $v ) ? $ref_url( $v ) : $v; }
$S['options']['vcc_settings'] = $settings;
$mk = function ( $type, $title, $order = 0, $extra = array() ) use ( &$S ) { $id = ++$S['next']; $S['posts'][ $id ] = (object) array_merge( array( 'ID' => $id, 'post_type' => $type, 'post_title' => $title, 'post_content' => '', 'menu_order' => $order, 'post_status' => 'publish' ), $extra ); return $id; };
foreach ( $seed['quicklinks'] as $i => $q ) { $id = $mk( 'vc_quicklink', $q['title'], $i ); $S['meta'][ $id ] = array( '_vcc_url' => 0 === strpos( $q['url'], '/' ) ? home_url( $q['url'] ) : $q['url'], '_vcc_new_tab' => $q['new_tab'] ? '1' : '', '_vcc_title2' => $q['title2'] ); $S['thumbs'][ $id ] = $S['att'][ $ref_url( $q['image'] ) ]; }
foreach ( $seed['tiles'] as $i => $q ) { $id = $mk( 'vc_tile', $q['title'], $i ); $S['meta'][ $id ] = array( '_vcc_url' => 0 === strpos( $q['url'], '/' ) ? home_url( $q['url'] ) : $q['url'], '_vcc_new_tab' => $q['new_tab'] ? '1' : '' ); $S['thumbs'][ $id ] = $S['att'][ $ref_url( $q['image'] ) ]; }
foreach ( $seed['events'] as $e ) { $id = $mk( 'vc_event', $e['title'], 0, array( 'post_content' => $e['description'], 'path' => 'event/' . sanitize_slug( $e['title'] ) . '/' ) ); $all = ! empty( $e['all_day'] ) || '00:00:00' === substr( $e['start'], 11, 8 ); $S['meta'][ $id ] = array( '_vcc_start' => str_replace( 'T', ' ', $e['start'] ), '_vcc_end' => ( $e['end'] && ! $all ) ? str_replace( 'T', ' ', $e['end'] ) : '', '_vcc_all_day' => $all ? '1' : '', '_vcc_location' => $e['location'] ); $S['terms'][ $id ] = array_map( 'strtolower', $e['categories'] ); }
function sanitize_slug( $s ) { return trim( preg_replace( '/[^a-z0-9]+/', '-', strtolower( $s ) ), '-' ); }
$menu_id = array(); foreach ( $seed['related_menus'] as $i => $m ) { $S['menus'][ 500 + $i ] = $m['items']; $menu_id[ $m['name'] ] = 500 + $i; }
$home_id = $mk( 'page', 'Home', 0, array( 'path' => '' ) ); $S['options']['page_on_front'] = $home_id;
$S['thumbs'][ $home_id ] = vcc_file_url( $seed['home_banner']['file'] );

function vc_render( $S_cb ) { ob_start(); $S_cb(); return ob_get_clean(); }
$S['front'] = true; $S['cur'] = $home_id; $S['content'] = $seed['home_content']; $S['title'] = 'Welcome to Vineyard UT';
$html = vc_render( function () { include get_template_directory() . '/front-page.php'; } );
file_put_contents( "$out/index.html", $html );
// the state reported on the live site after v1.0.0: Home holding the Business Directory page (theme safeguard must still show the home sections)
$S['content'] = $pages['government/business_directory.php']['html'];
@mkdir( "$out/home-polluted", 0777, true );
file_put_contents( "$out/home-polluted/index.html", vc_render( function () { include get_template_directory() . '/front-page.php'; } ) );
$S['content'] = $seed['home_content'];

// inner pages
$S['front'] = false; $S['body'] = '';
$byold = array(); foreach ( $man as $m ) { $byold[ $m['old_path'] ] = $m; }
$ids = array(); $n = 0;
foreach ( $man as $m ) { $p = $pages[ $m['old_path'] ]; $id = $mk( 'page', $m['title'], 0, array( 'path' => $m['new_path'] ) ); $ids[ $m['old_path'] ] = $id; }
foreach ( $man as $m ) {
	$p = $pages[ $m['old_path'] ]; $id = $ids[ $m['old_path'] ]; $S['posts'][ $id ]->post_parent = $m['parent'] ? ( $ids[ array_values( array_filter( array_keys( $byold ), function ( $o ) use ( $byold, $m ) { return $byold[ $o ]['slug'] === $m['parent'] && ! $byold[ $o ]['parent']; } ) )[0] ] ?? 0 ) : 0;
}
foreach ( $man as $m ) {
	$p = $pages[ $m['old_path'] ]; $id = $ids[ $m['old_path'] ];
	$meta = array();
	if ( $p['contact'] ) { $meta['_vcc_contact'] = array( 'title' => $p['contact']['title'], 'text' => $p['contact']['text'], 'phone' => $p['contact']['phone'] ); }
	$meta['_vcc_buttons'] = array_map( function ( $b ) { return array( 'label' => $b['label'], 'url' => $b['url'], 'new_tab' => $b['new_tab'] ? '1' : '', 'icon' => ! empty( $b['icon'] ) ? '1' : '' ); }, $p['buttons'] );
	$meta['_vcc_related'] = ! empty( $p['related_menu'] ) ? (string) $menu_id[ $p['related_menu'] ] : 'none';
	if ( ! empty( $p['crumb_parent'] ) && isset( $ids[ $p['crumb_parent'] ] ) ) { $meta['_vcc_crumb'] = $ids[ $p['crumb_parent'] ]; }
	$S['meta'][ $id ] = $meta;
	if ( $p['banner'] ) { $S['thumbs'][ $id ] = vcc_file_url( $p['banner'] ); }
}
$want = isset( $argv[3] ) ? explode( ',', $argv[3] ) : null;
foreach ( $man as $m ) {
	if ( $want && ! in_array( $m['old_path'], $want, true ) ) { continue; }
	$p = $pages[ $m['old_path'] ]; $id = $ids[ $m['old_path'] ];
	$S['cur'] = $id; $S['content'] = $p['html']; $S['title'] = $m['title']; $S['body'] = $p['template'] ? 'fullwidth' : '';
	$tpl = $p['template'] ? 'template-fullwidth.php' : 'page.php';
	$html = vc_render( function () use ( $tpl ) { include get_template_directory() . '/' . $tpl; } );
	$dir = $out . '/' . $m['new_path']; @mkdir( $dir, 0777, true ); file_put_contents( $dir . 'index.html', $html ); $n++;
}
echo "rendered home + $n pages to $out\n";

// ---- editor preview: what each block's card shows in the block editor (ServerSideRender asks the site with REST_REQUEST)
define( 'REST_REQUEST', true );
$S['content'] = $seed['home_content']; $S['cur'] = $home_id;
$cards = '';
foreach ( json_decode( file_get_contents( $root . '/tests/editor/editor-data.json' ), true )['localized']['data']['blocks'] as $b ) {
	$html   = call_user_func( $S['blocks'][ $b['name'] ] );
	$cards .= '<div class="vcc-card"><div class="vcc-card__head"><span class="vcc-card__title dashicons-before dashicons-' . esc_attr( $b['icon'] ) . '">' . esc_html( $b['title'] ) . '</span>'
		. '<a class="components-button is-secondary vcc-card__edit" href="' . esc_url( $b['editUrl'] ) . '">' . esc_html( $b['editLabel'] ) . ' ↗</a></div><p class="vcc-card__help">' . esc_html( $b['description'] ) . '</p>'
		. '<div class="vcc-card__preview vcc-preview">' . $html . '</div></div>';
}
@mkdir( "$out/editor-preview", 0777, true );
file_put_contents( "$out/editor-preview/index.html", '<!doctype html><meta charset="utf-8"><title>Home – Edit Page</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dashicons/0.9.0/css/dashicons.min.css">'
	. '<link rel="stylesheet" href="' . $GLOBALS['SITE'] . '/wp-content/plugins/vineyard-city-content/assets/blocks-editor.css"><body style="margin:0;background:#fff;font-family:sans-serif">'
	. '<div style="max-width:840px;margin:0 auto;padding:24px"><h1 style="font-size:40px;font-weight:600;margin:10px 0 20px">Home</h1>' . $cards . '</div>' );
echo "editor preview written\n";
