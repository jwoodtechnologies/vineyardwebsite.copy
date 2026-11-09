<?php
/**
 * Build content/vineyard-import.xml — a WordPress eXtended RSS (WXR 1.2) file for Tools > Import > WordPress.
 *
 *   php scripts/build_wxr.php            (run from anywhere; needs only PHP CLI, no WordPress)
 *
 * Contents: a "Home" page (for Settings > Reading), all pages from content/manifest.json with parent/child hierarchy,
 * the page "chrome" as post meta (vc_*), and the main menu from content/menu.json as nav_menu_item entries.
 *
 * Links are written as ROOT-RELATIVE URLs so the file works on any domain:
 *   page links  -> /government/building/
 *   file links  -> /wp-content/themes/vineyard/files/<old path>   (the files/ folder of branch deploy/site)
 *   theme files -> /wp-content/themes/vineyard/_assets_/...        (branch deploy/site)
 */
require __DIR__ . '/lib-rewrite.php';

$root     = dirname( __DIR__ );
$manifest = json_decode( file_get_contents( $root . '/content/manifest.json' ), true );
$menu     = json_decode( file_get_contents( $root . '/content/menu.json' ), true );
$ctx      = array(
	'page_map'     => vc_load_page_map( $root . '/theme/vineyard' ),
	'media_map'    => vc_load_media_csv( $root . '/content/media.csv' ),
	'home'         => '/',
	'uploads'      => '/wp-content/uploads',
	'files_base'   => '/wp-content/themes/vineyard/files',
	'theme_assets' => '/wp-content/themes/vineyard/_assets_',
	'theme_uri'    => '/wp-content/themes/vineyard',
	'unresolved'   => array(),
);

function x_cdata( $s ) {
	return '<![CDATA[' . str_replace( ']]>', ']]]]><![CDATA[>', (string) $s ) . ']]>';
}
function x_meta( $k, $v ) {
	return "\t\t<wp:postmeta>\n\t\t\t<wp:meta_key>" . x_cdata( $k ) . "</wp:meta_key>\n\t\t\t<wp:meta_value>" . x_cdata( $v ) . "</wp:meta_value>\n\t\t</wp:postmeta>\n";
}
function x_item( $a ) {
	$date = '2026-11-09 00:00:00';
	$o  = "\t<item>\n";
	$o .= "\t\t<title>" . x_cdata( $a['title'] ) . "</title>\n";
	$o .= "\t\t<link>" . htmlspecialchars( $a['link'], ENT_XML1 ) . "</link>\n";
	$o .= "\t\t<pubDate>Mon, 09 Nov 2026 00:00:00 +0000</pubDate>\n";
	$o .= "\t\t<dc:creator>" . x_cdata( 'admin' ) . "</dc:creator>\n";
	$o .= "\t\t<guid isPermaLink=\"false\">" . htmlspecialchars( $a['guid'], ENT_XML1 ) . "</guid>\n";
	$o .= "\t\t<description></description>\n";
	$o .= "\t\t<content:encoded>" . x_cdata( $a['content'] ) . "</content:encoded>\n";
	$o .= "\t\t<excerpt:encoded>" . x_cdata( '' ) . "</excerpt:encoded>\n";
	$o .= "\t\t<wp:post_id>" . (int) $a['id'] . "</wp:post_id>\n";
	$o .= "\t\t<wp:post_date>" . x_cdata( $date ) . "</wp:post_date>\n";
	$o .= "\t\t<wp:post_date_gmt>" . x_cdata( $date ) . "</wp:post_date_gmt>\n";
	$o .= "\t\t<wp:post_modified>" . x_cdata( $date ) . "</wp:post_modified>\n";
	$o .= "\t\t<wp:post_modified_gmt>" . x_cdata( $date ) . "</wp:post_modified_gmt>\n";
	$o .= "\t\t<wp:comment_status>" . x_cdata( 'closed' ) . "</wp:comment_status>\n";
	$o .= "\t\t<wp:ping_status>" . x_cdata( 'closed' ) . "</wp:ping_status>\n";
	$o .= "\t\t<wp:post_name>" . x_cdata( $a['slug'] ) . "</wp:post_name>\n";
	$o .= "\t\t<wp:status>" . x_cdata( 'publish' ) . "</wp:status>\n";
	$o .= "\t\t<wp:post_parent>" . (int) $a['parent'] . "</wp:post_parent>\n";
	$o .= "\t\t<wp:menu_order>" . (int) $a['menu_order'] . "</wp:menu_order>\n";
	$o .= "\t\t<wp:post_type>" . x_cdata( $a['type'] ) . "</wp:post_type>\n";
	$o .= "\t\t<wp:post_password>" . x_cdata( '' ) . "</wp:post_password>\n";
	$o .= "\t\t<wp:is_sticky>0</wp:is_sticky>\n";
	if ( ! empty( $a['category'] ) ) {
		$o .= "\t\t<category domain=\"nav_menu\" nicename=\"" . htmlspecialchars( $a['category'][0], ENT_XML1 ) . "\">" . x_cdata( $a['category'][1] ) . "</category>\n";
	}
	foreach ( $a['meta'] as $k => $v ) {
		$o .= x_meta( $k, $v );
	}
	return $o . "\t</item>\n";
}

$items  = '';
$next   = 10;
$by_old = array();   // old_path => post id
$by_top = array();   // slug of top-level page => post id

// ---- Home page (so Settings > Reading has something to point at; front-page.php renders the real home page)
$home_id = $next++;
$items  .= x_item( array( 'id' => $home_id, 'title' => 'Home', 'slug' => 'home', 'link' => '/', 'guid' => 'https://www.vineyardutah.gov/index.php', 'content' => '', 'parent' => 0, 'menu_order' => 0, 'type' => 'page',
	'meta' => array( '_vc_old_path' => 'index.php', '_vc_old_url' => 'https://www.vineyardutah.gov/index.php' ) ) );
$by_old['index.php'] = $home_id;

// ---- Pages. Manifest is sorted so top-level pages come before their children.
$n_pages = 0;
foreach ( $manifest as $m ) {
	$id = $next++;
	$by_old[ $m['old_path'] ] = $id;
	if ( empty( $m['parent'] ) ) {
		$by_top[ $m['slug'] ] = $id;
	}
}
foreach ( $manifest as $m ) {
	$id     = $by_old[ $m['old_path'] ];
	$parent = empty( $m['parent'] ) ? 0 : ( isset( $by_top[ $m['parent'] ] ) ? $by_top[ $m['parent'] ] : 0 );
	$html   = vc_rewrite_html( file_get_contents( $root . '/content/' . $m['content_file'] ), $ctx );
	$meta   = array( '_vc_old_path' => $m['old_path'], '_vc_old_url' => $m['old_url'] );
	foreach ( $m['meta'] as $k => $v ) {
		if ( 'vc_banner_images' === $k ) {
			$urls = array();
			foreach ( json_decode( $v, true ) ?: array() as $u ) {
				$r = vc_map_url( $u, $ctx );
				if ( $r ) { $urls[] = $r; }
			}
			$v = json_encode( $urls, JSON_UNESCAPED_SLASHES );
		} elseif ( 'vc_breadcrumbs' === $k ) {
			$cr = json_decode( $v, true ) ?: array();
			foreach ( $cr as &$c ) {
				if ( ! empty( $c['url'] ) ) { $c['url'] = vc_map_url( $c['url'], $ctx ) ?: $c['url']; }
			}
			unset( $c );
			$v = json_encode( $cr, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		} elseif ( in_array( $k, array( 'vc_leftnav', 'vc_inner_buttons', 'vc_contact_box' ), true ) ) {
			$v = vc_rewrite_html( $v, $ctx );
		}
		$meta[ $k ] = $v;
	}
	$items .= x_item( array( 'id' => $id, 'title' => $m['title'], 'slug' => $m['slug'], 'link' => '/' . $m['new_path'], 'guid' => $m['old_url'], 'content' => $html,
		'parent' => $parent, 'menu_order' => $m['menu_order'], 'type' => 'page', 'meta' => $meta ) );
	$n_pages++;
}

// ---- Menu
$n_menu = 0;
$walk   = function ( $nodes, $parent_item ) use ( &$walk, &$items, &$next, &$n_menu, $by_old, $ctx ) {
	foreach ( $nodes as $node ) {
		$id   = $next++;
		$n_menu++;
		$url  = $node['url'];
		$host = parse_url( $url, PHP_URL_HOST );
		$path = ltrim( rawurldecode( (string) parse_url( $url, PHP_URL_PATH ) ), '/' );
		$frag = parse_url( $url, PHP_URL_FRAGMENT );
		$internal = ( ! $host || in_array( strtolower( $host ), VC_OLD_HOSTS, true ) );
		$meta = array(
			'_menu_item_type'           => 'custom',
			'_menu_item_menu_item_parent' => (string) $parent_item,
			'_menu_item_object_id'      => (string) $id,
			'_menu_item_object'         => 'custom',
			'_menu_item_target'         => in_array( $node['target'], array( '_new', '_blank' ), true ) ? '_blank' : '',
			'_menu_item_classes'        => 'a:1:{i:0;s:0:"";}',
			'_menu_item_xfn'            => '',
			'_menu_item_url'            => '',
		);
		if ( $internal && ( '' === $path || 'index.php' === $path ) ) {
			$meta['_menu_item_url'] = '/';
		} elseif ( $internal && isset( $by_old[ $path ] ) && ! $frag ) {
			$meta['_menu_item_type']      = 'post_type';
			$meta['_menu_item_object']    = 'page';
			$meta['_menu_item_object_id'] = (string) $by_old[ $path ];
		} elseif ( $internal ) {
			$new = vc_map_url( $url, $ctx );
			$meta['_menu_item_url'] = $new ?: $url;
		} else {
			$meta['_menu_item_url'] = $url;
		}
		$items .= x_item( array( 'id' => $id, 'title' => $node['title'], 'slug' => (string) $id, 'link' => '/?p=' . $id, 'guid' => 'vineyard-menu-item-' . $id, 'content' => '',
			'parent' => 0, 'menu_order' => $n_menu, 'type' => 'nav_menu_item', 'category' => array( 'primary', 'Primary' ), 'meta' => $meta ) );
		if ( ! empty( $node['children'] ) ) {
			$walk( $node['children'], $id );
		}
	}
};
$walk( $menu, 0 );

$xml  = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n";
$xml .= "<!-- Generated by scripts/build_wxr.php from the Vineyard City site mirror (2026-11-09). Import with Tools > Import > WordPress. -->\n";
$xml .= "<rss version=\"2.0\" xmlns:excerpt=\"http://wordpress.org/export/1.2/excerpt/\" xmlns:content=\"http://purl.org/rss/1.0/modules/content/\" xmlns:wfw=\"http://wellformedweb.org/CommentAPI/\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:wp=\"http://wordpress.org/export/1.2/\">\n";
$xml .= "<channel>\n\t<title>Vineyard City, Utah</title>\n\t<link>https://www.vineyardutah.gov</link>\n\t<description></description>\n";
$xml .= "\t<pubDate>Mon, 09 Nov 2026 00:00:00 +0000</pubDate>\n\t<language>en-US</language>\n\t<wp:wxr_version>1.2</wp:wxr_version>\n";
$xml .= "\t<wp:base_site_url>https://www.vineyardutah.gov</wp:base_site_url>\n\t<wp:base_blog_url>https://www.vineyardutah.gov</wp:base_blog_url>\n";
$xml .= "\t<wp:author><wp:author_id>1</wp:author_id><wp:author_login>" . x_cdata( 'admin' ) . "</wp:author_login><wp:author_email>" . x_cdata( 'admin@example.com' ) . "</wp:author_email><wp:author_display_name>" . x_cdata( 'admin' ) . "</wp:author_display_name><wp:author_first_name>" . x_cdata( '' ) . "</wp:author_first_name><wp:author_last_name>" . x_cdata( '' ) . "</wp:author_last_name></wp:author>\n";
$xml .= "\t<wp:term><wp:term_id>2</wp:term_id><wp:term_taxonomy>" . x_cdata( 'nav_menu' ) . "</wp:term_taxonomy><wp:term_slug>" . x_cdata( 'primary' ) . "</wp:term_slug><wp:term_parent>" . x_cdata( '' ) . "</wp:term_parent><wp:term_name>" . x_cdata( 'Primary' ) . "</wp:term_name></wp:term>\n";
$xml .= "\t<generator>https://wordpress.org/?v=6.8</generator>\n";
$xml .= $items . "</channel>\n</rss>\n";

file_put_contents( $root . '/content/vineyard-import.xml', $xml );
if ( $ctx['unresolved'] ) {
	ksort( $ctx['unresolved'] );
	file_put_contents( $root . '/content/unresolved-links.txt', implode( "\n", array_keys( $ctx['unresolved'] ) ) . "\n" );
}
printf( "wrote content/vineyard-import.xml: %d pages + Home, %d menu items, %d bytes, %d unresolved internal URLs (content/unresolved-links.txt)\n", $n_pages, $n_menu, strlen( $xml ), count( $ctx['unresolved'] ) );
