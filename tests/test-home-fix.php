<?php
/**
 * php tests/test-home-fix.php
 * Reproduces the live-site state reported after v1.0.0 (Home page ID 10 carrying the untitled Business Directory page's
 * content, template and _vc_old_path, and no Business Directory page) in an in-memory stand-in for WordPress, then runs the
 * REAL plugin functions from includes/seed.php: vcc_home_id, vcc_page_by_old, vcc_create_missing_pages, vcc_needs_tidy,
 * vcc_rebuild_home. Exits 1 on the first failed check.
 */
$root = dirname( __DIR__ );
define( 'ABSPATH', __DIR__ . '/' );
define( 'VCC_DIR', $root . '/plugin/vineyard-city-content/' );
define( 'VCC_VERSION', 'test' );

/* ---------------------------------------------------------------- in-memory WordPress */
$DB = array( 'posts' => array(), 'meta' => array(), 'options' => array(), 'next' => 100, 'revisions_on' => true );
class WP_Error {}
function add_action() {} function add_filter() {} function kses_remove_filters() {} function is_wp_error( $x ) { return $x instanceof WP_Error; }
function wp_slash( $v ) { return $v; } function wp_strip_all_tags( $s ) { return trim( strip_tags( $s ) ); }
function get_option( $k, $d = false ) { global $DB; return array_key_exists( $k, $DB['options'] ) ? $DB['options'][ $k ] : $d; }
function update_option( $k, $v ) { global $DB; $DB['options'][ $k ] = $v; return true; }
function get_post_type( $id ) { global $DB; return isset( $DB['posts'][ $id ] ) ? $DB['posts'][ $id ]['post_type'] : false; }
function get_post_field( $f, $id ) { global $DB; return isset( $DB['posts'][ $id ] ) ? $DB['posts'][ $id ][ $f ] : ''; }
function get_the_title( $id ) { return get_post_field( 'post_title', $id ); }
function get_post_meta( $id, $k = '', $single = false ) { global $DB; $v = isset( $DB['meta'][ $id ][ $k ] ) ? $DB['meta'][ $id ][ $k ] : array(); return $single ? ( $v ? $v[0] : '' ) : $v; }
function add_post_meta( $id, $k, $v ) { global $DB; $DB['meta'][ $id ][ $k ][] = $v; return true; }
function update_post_meta( $id, $k, $v ) { global $DB; $DB['meta'][ $id ][ $k ] = array( $v ); return true; }
function delete_post_meta( $id, $k, $v = '' ) { global $DB; if ( '' === $v ) { unset( $DB['meta'][ $id ][ $k ] ); } elseif ( isset( $DB['meta'][ $id ][ $k ] ) ) { $DB['meta'][ $id ][ $k ] = array_values( array_filter( $DB['meta'][ $id ][ $k ], function ( $x ) use ( $v ) { return $x !== $v; } ) ); } return true; }
function has_post_thumbnail( $id ) { return (bool) get_post_meta( $id, '_thumbnail_id', true ); }
function set_post_thumbnail( $id, $a ) { update_post_meta( $id, '_thumbnail_id', $a ); }
function get_posts( $a ) {
	global $DB;
	$ids = array();
	foreach ( $DB['posts'] as $id => $p ) {
		if ( $p['post_type'] !== $a['post_type'] ) { continue; }
		if ( isset( $a['meta_key'] ) && ! in_array( $a['meta_value'], get_post_meta( $id, $a['meta_key'] ), true ) ) { continue; }
		$ids[] = $id;
	}
	sort( $ids );
	if ( isset( $a['numberposts'] ) && $a['numberposts'] > 0 ) { $ids = array_slice( $ids, 0, $a['numberposts'] ); }
	return ( isset( $a['fields'] ) && 'ids' === $a['fields'] ) ? $ids : array_map( function ( $i ) { global $DB; return (object) ( array( 'ID' => $i ) + $DB['posts'][ $i ] ); }, $ids );
}
function wp_insert_post( $a ) { global $DB; $id = ++$DB['next']; $DB['posts'][ $id ] = array_merge( array( 'post_type' => 'post', 'post_title' => '', 'post_name' => '', 'post_content' => '', 'post_parent' => 0, 'post_status' => 'publish' ), $a ); return $id; }
function wp_update_post( $a ) { global $DB; $id = $a['ID']; unset( $a['ID'] ); $DB['posts'][ $id ] = array_merge( $DB['posts'][ $id ], $a ); if ( $DB['revisions_on'] ) { wp_save_post_revision( $id ); } return $id; } // like WordPress: the NEW text is saved as a revision after the update
function wp_get_post_revisions( $id, $a = array() ) { global $DB; $r = array(); foreach ( $DB['posts'] as $i => $p ) { if ( 'revision' === $p['post_type'] && $p['post_parent'] === $id ) { $r[ $i ] = (object) ( array( 'ID' => $i ) + $p ); } } krsort( $r ); return isset( $a['numberposts'] ) ? array_slice( $r, 0, $a['numberposts'], true ) : $r; }
function wp_save_post_revision( $id ) { // like WordPress: nothing when revisions are off, or when the newest revision already holds this text
	global $DB;
	if ( ! $DB['revisions_on'] ) { return null; }
	$last = wp_get_post_revisions( $id, array( 'numberposts' => 1 ) ); $last = $last ? reset( $last ) : null;
	if ( $last && $last->post_content === $DB['posts'][ $id ]['post_content'] ) { return null; }
	$rid = ++$DB['next']; $DB['posts'][ $rid ] = array( 'post_type' => 'revision', 'post_parent' => $id, 'post_content' => $DB['posts'][ $id ]['post_content'], 'post_title' => $DB['posts'][ $id ]['post_title'], 'post_name' => '', 'post_status' => 'inherit' ); return $rid;
}
function vcc_file_url( $p ) { return 'https://example.test/wp-content/themes/vineyard/files/' . $p; }

require VCC_DIR . 'includes/seed.php';

$fails = 0;
function check( $ok, $what ) { global $fails; echo ( $ok ? "  ok   " : "  FAIL " ) . $what . "\n"; if ( ! $ok ) { $fails++; } }

/* ---------------------------------------------------------------- the reported state */
function reset_state( $revisions_on = true ) {
	global $DB, $root;
	$pages = json_decode( file_get_contents( $GLOBALS['root'] . '/plugin/vineyard-city-content/data/pages.json' ), true );
	$DB = array( 'posts' => array(), 'meta' => array(), 'options' => array(), 'next' => 100, 'revisions_on' => $revisions_on );
	$DB['posts'][10] = array( 'post_type' => 'page', 'post_title' => 'Home', 'post_name' => 'home', 'post_content' => $pages['government/business_directory.php']['html'], 'post_parent' => 0, 'post_status' => 'publish' );
	$DB['meta'][10]  = array( '_vc_old_path' => array( 'index.php', 'government/business_directory.php' ), '_vc_old_url' => array( 'https://www.vineyardutah.gov/index.php', 'https://www.vineyardutah.gov/government/business_directory.php' ),
		'_wp_page_template' => array( 'template-fullwidth.php' ), 'vc_layout' => array( 'full' ), 'vc_breadcrumbs' => array( '[]' ), '_vcc_related' => array( 'none' ), '_vcc_buttons' => array( array() ), '_thumbnail_id' => array( 999 ) );
	$DB['posts'][11] = array( 'post_type' => 'page', 'post_title' => 'Government', 'post_name' => 'government', 'post_content' => $pages['government/index.php']['html'], 'post_parent' => 0, 'post_status' => 'publish' );
	$DB['meta'][11]  = array( '_vc_old_path' => array( 'government/index.php' ) );
	$DB['posts'][12] = array( 'post_type' => 'page', 'post_title' => 'Building', 'post_name' => 'building', 'post_content' => $pages['government/building.php']['html'] . "\n<p>Edited by the clerk.</p>", 'post_parent' => 11, 'post_status' => 'publish' );
	$DB['meta'][12]  = array( '_vc_old_path' => array( 'government/building.php' ) );
	$DB['posts'][13] = array( 'post_type' => 'page', 'post_title' => 'Budget', 'post_name' => 'budget', 'post_content' => '<div class="clearfix" id="post">old markup</div>', 'post_parent' => 11, 'post_status' => 'publish' );
	$DB['meta'][13]  = array( '_vc_old_path' => array( 'government/budget.php' ) );
	$DB['options']['page_on_front'] = 10; $DB['options']['show_on_front'] = 'page';
	return $pages;
}

echo "Reported state: Home (10) holds the Business Directory content\n";
$pages = reset_state();
check( 10 === vcc_home_id(), 'Home is found (Settings → Reading)' );
check( 10 === vcc_page_by_old( 'index.php' ), 'index.php → Home' );
check( 0 === vcc_page_by_old( 'government/business_directory.php', 'business-directory' ), 'business_directory.php does NOT resolve to Home any more (v1.0.0 returned 10)' );
check( 11 === vcc_page_by_old( 'government/index.php' ), 'other pages still resolve' );

echo "Tidy, first step: create pages the importer merged away\n";
$sub  = array_intersect_key( $pages, array_flip( array( 'government/index.php', 'government/business_directory.php', 'government/building.php', 'government/budget.php' ) ) );
$made = vcc_create_missing_pages( $sub );
$bd   = vcc_page_by_old( 'government/business_directory.php', 'business-directory' );
check( array( 'Business Directory' ) === $made, 'exactly one page created: Business Directory' );
check( $bd && 10 !== $bd && 'business-directory' === get_post_field( 'post_name', $bd ) && 11 === get_post_field( 'post_parent', $bd ), 'it has slug business-directory under Government' );
check( array() === vcc_create_missing_pages( $sub ), 'running it again creates nothing' );

echo "Tidy only changes pages that still hold the copied markup\n";
check( vcc_needs_tidy( $bd ), 'new (empty) Business Directory page will be tidied' );
check( vcc_needs_tidy( 13 ), 'untouched page with old markup will be tidied' );
$GLOBALS['DB']['posts'][12]['post_content'] = '<p>Clean, already tidied text the clerk edited.</p>';
check( ! vcc_needs_tidy( 12 ), 'a clean page the clerk edited is left alone' );
update_post_meta( 13, '_vcc_tidied', '1.0.1' );
check( ! vcc_needs_tidy( 13 ), 'a page tidied once is never tidied again' );

echo "Rebuild the home page sections\n";
$seed   = json_decode( file_get_contents( VCC_DIR . 'data/seed.json' ), true );
$before = get_post_field( 'post_content', 10 );
$r      = vcc_rebuild_home();
check( $r['ok'] && $seed['home_content'] === get_post_field( 'post_content', 10 ), 'Home content = the five home-section blocks' );
check( strlen( $before ) > 300000 && false === strpos( get_post_field( 'post_content', 10 ), 'rz-block-list' ), 'the 364 KB directory markup is gone from Home' );
$rev = wp_get_post_revisions( 10 ); $has = false; foreach ( $rev as $x ) { if ( $x->post_content === $before ) { $has = true; } }
check( $has && $r['backup'], 'the old content is kept as a revision (backup id ' . $r['backup'] . ')' );
check( 'default' === get_post_meta( 10, '_wp_page_template', true ), 'template back to default (not full width)' );
check( array( 'index.php' ) === get_post_meta( 10, '_vc_old_path' ), 'only index.php is left in _vc_old_path' );
check( array( 'https://www.vineyardutah.gov/index.php' ) === get_post_meta( 10, '_vc_old_url' ), 'only the Home old URL is left' );
check( ! get_post_meta( 10, 'vc_layout' ) && ! get_post_meta( 10, '_vcc_related' ) && ! get_post_meta( 10, '_vcc_buttons' ), 'details copied from other pages are removed' );
check( 999 === (int) get_post_meta( 10, '_thumbnail_id', true ), 'the chosen banner (Featured Image) is kept' );
check( 10 === (int) get_option( 'page_on_front' ) && 'page' === get_option( 'show_on_front' ), 'Home is still the front page' );
check( $bd === vcc_page_by_old( 'government/business_directory.php' ), 'business_directory.php now resolves to its own page' );
$n  = count( wp_get_post_revisions( 10 ) );
$r2 = vcc_rebuild_home();
check( $r2['ok'] && $seed['home_content'] === get_post_field( 'post_content', 10 ) && count( wp_get_post_revisions( 10 ) ) === $n, 'clicking it again changes nothing and adds no revision' );

echo "Same, with post revisions switched off on the site\n";
reset_state( false );
$before = get_post_field( 'post_content', 10 );
$r      = vcc_rebuild_home();
check( $r['ok'] && $seed['home_content'] === get_post_field( 'post_content', 10 ), 'Home rebuilt' );
check( get_post_meta( 10, '_vcc_home_content_backup', true ) === $before, 'old content kept in the page details instead' );

echo $fails ? "\n$fails check(s) FAILED\n" : "\nAll checks passed\n";
exit( $fails ? 1 : 0 );
