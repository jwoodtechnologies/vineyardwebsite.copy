<?php
/** One-time buttons on "Start here": load the current website content, and tidy the pages that were copied over. Safe to repeat. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function vcc_json( $name ) {
	$f = VCC_DIR . 'data/' . $name;
	return file_exists( $f ) ? json_decode( file_get_contents( $f ), true ) : array();
}

/** Copy a file from the old theme's folders into the Media Library (once). Returns attachment ID or 0. */
function vcc_sideload( $ref ) {
	if ( empty( $ref ) || ! is_array( $ref ) ) { return 0; }
	$url = isset( $ref['file'] ) ? vcc_file_url( $ref['file'] ) : content_url( 'themes/vineyard/_assets_/' . implode( '/', array_map( 'rawurlencode', explode( '/', $ref['asset'] ) ) ) );
	$cache = get_option( 'vcc_seed_media', array() );
	if ( ! empty( $cache[ $url ] ) && get_post( $cache[ $url ] ) ) { return (int) $cache[ $url ]; }
	require_once ABSPATH . 'wp-admin/includes/file.php'; require_once ABSPATH . 'wp-admin/includes/media.php'; require_once ABSPATH . 'wp-admin/includes/image.php';
	$tmp = download_url( $url, 60 );
	if ( is_wp_error( $tmp ) ) { return 0; }
	$id = media_handle_sideload( array( 'name' => basename( rawurldecode( parse_url( $url, PHP_URL_PATH ) ) ), 'tmp_name' => $tmp ), 0 );
	if ( is_wp_error( $id ) ) { @unlink( $tmp ); return 0; } // phpcs:ignore
	$cache[ $url ] = (int) $id; update_option( 'vcc_seed_media', $cache, false );
	return (int) $id;
}

/** "/government/building/" or full URL -> array( page id, url ). */
function vcc_resolve_link( $u ) {
	if ( preg_match( '#^/#', $u ) ) {
		$id = url_to_postid( home_url( $u ) );
		return $id ? array( $id, '' ) : array( 0, home_url( $u ) );
	}
	return array( 0, $u );
}

function vcc_find_seeded( $type, $key ) {
	$q = get_posts( array( 'post_type' => $type, 'post_status' => 'any', 'numberposts' => 1, 'meta_key' => '_vcc_seed', 'meta_value' => $key ) );
	return $q ? $q[0]->ID : 0;
}

function vcc_page_by_old( $old ) {
	$q = get_posts( array( 'post_type' => 'page', 'post_status' => 'any', 'numberposts' => 1, 'meta_key' => '_vc_old_path', 'meta_value' => $old ) );
	return $q ? $q[0]->ID : 0;
}

add_action( 'admin_post_vcc_seed', function () {
	if ( ! current_user_can( 'manage_options' ) || ! check_admin_referer( 'vcc_seed' ) ) { wp_die( 'Not allowed.' ); }
	@set_time_limit( 300 ); // phpcs:ignore
	kses_remove_filters();
	$seed = vcc_json( 'seed.json' );
	$n = array( 'links' => 0, 'tiles' => 0, 'events' => 0, 'menus' => 0 );

	// settings
	$s = get_option( 'vcc_settings', array() ); $s = is_array( $s ) ? $s : array();
	foreach ( $seed['settings'] as $k => $v ) { $s[ $k ] = is_array( $v ) ? vcc_sideload( $v ) : $v; }
	update_option( 'vcc_settings', $s );

	// event categories (+ colours)
	foreach ( $seed['categories'] as $c ) {
		$t = term_exists( $c['name'], 'vc_event_cat' ) ?: wp_insert_term( $c['name'], 'vc_event_cat' );
		if ( ! is_wp_error( $t ) ) { update_term_meta( is_array( $t ) ? $t['term_id'] : $t, 'vcc_color', $c['color'] ); }
	}

	// quick links + photo tiles
	foreach ( array( 'quicklinks' => array( 'vc_quicklink', 'ql', 'links' ), 'tiles' => array( 'vc_tile', 'tile', 'tiles' ) ) as $key => $cfg ) {
		foreach ( $seed[ $key ] as $i => $it ) {
			$k = $cfg[1] . '-' . $i; $id = vcc_find_seeded( $cfg[0], $k );
			$arr = array( 'post_type' => $cfg[0], 'post_status' => 'publish', 'post_title' => $it['title'], 'menu_order' => 10 * ( $i + 1 ) );
			if ( $id ) { $arr['ID'] = $id; wp_update_post( $arr ); } else { $id = wp_insert_post( $arr ); }
			list( $pid, $url ) = vcc_resolve_link( $it['url'] );
			update_post_meta( $id, '_vcc_seed', $k ); update_post_meta( $id, '_vcc_page', $pid ); update_post_meta( $id, '_vcc_url', $url );
			update_post_meta( $id, '_vcc_new_tab', $it['new_tab'] ? '1' : '' ); update_post_meta( $id, '_vcc_title2', isset( $it['title2'] ) ? $it['title2'] : '' );
			$att = vcc_sideload( $it['image'] ); if ( $att ) { set_post_thumbnail( $id, $att ); }
			$n[ $cfg[2] ]++;
		}
	}

	// events
	foreach ( $seed['events'] as $i => $e ) {
		$k = 'ev-' . md5( $e['title'] . $e['start'] ); $id = vcc_find_seeded( 'vc_event', $k );
		$arr = array( 'post_type' => 'vc_event', 'post_status' => 'publish', 'post_title' => $e['title'], 'post_content' => $e['description'] );
		if ( $id ) { $arr['ID'] = $id; wp_update_post( wp_slash( $arr ) ); } else { $id = wp_insert_post( wp_slash( $arr ) ); }
		$all = ! empty( $e['all_day'] ) || substr( $e['start'], 11, 8 ) === '00:00:00';
		update_post_meta( $id, '_vcc_seed', $k ); update_post_meta( $id, '_vcc_all_day', $all ? '1' : '' ); update_post_meta( $id, '_vcc_start', str_replace( 'T', ' ', $e['start'] ) );
		update_post_meta( $id, '_vcc_end', ( $e['end'] && ! $all ) ? str_replace( 'T', ' ', $e['end'] ) : '' ); update_post_meta( $id, '_vcc_location', $e['location'] );
		wp_set_object_terms( $id, $e['categories'], 'vc_event_cat' );
		$n['events']++;
	}

	// Home page: banner photo = Featured Image, sections = blocks, and make it the front page
	$home = vcc_page_by_old( 'index.php' );
	if ( $home ) {
		wp_update_post( array( 'ID' => $home, 'post_content' => wp_slash( $seed['home_content'] ) ) );
		$att = vcc_sideload( $seed['home_banner'] ); if ( $att ) { set_post_thumbnail( $home, $att ); }
		update_option( 'show_on_front', 'page' ); update_option( 'page_on_front', $home );
	}

	// "Related Pages" menus
	foreach ( $seed['related_menus'] as $m ) {
		$menu = wp_get_nav_menu_object( $m['name'] );
		$mid  = $menu ? $menu->term_id : wp_create_nav_menu( $m['name'] );
		if ( is_wp_error( $mid ) ) { continue; }
		if ( $menu && wp_get_nav_menu_items( $mid ) ) { $n['menus']++; continue; } // already built
		$add = function ( $items, $parent ) use ( &$add, $mid ) {
			foreach ( $items as $it ) {
				list( $pid, $url ) = vcc_resolve_link( $it['url'] );
				$args = array( 'menu-item-title' => $it['title'], 'menu-item-status' => 'publish', 'menu-item-parent-id' => $parent, 'menu-item-target' => $it['new_tab'] ? '_blank' : '' );
				$args += $pid ? array( 'menu-item-type' => 'post_type', 'menu-item-object' => 'page', 'menu-item-object-id' => $pid ) : array( 'menu-item-type' => 'custom', 'menu-item-url' => $url );
				$item = wp_update_nav_menu_item( $mid, 0, $args );
				if ( ! is_wp_error( $item ) && ! empty( $it['children'] ) ) { $add( $it['children'], $item ); }
			}
		};
		$add( $m['items'], 0 );
		$n['menus']++;
	}
	update_option( 'vcc_seeded', current_time( 'mysql' ) );
	wp_safe_redirect( admin_url( 'admin.php?page=vineyard-site-content&vcc_msg=' . rawurlencode( sprintf( 'Done: %d quick links, %d photo tiles, %d events and %d “Related Pages” lists are in place. Now click Step 2.', $n['links'], $n['tiles'], $n['events'], $n['menus'] ) ) ) );
	exit;
} );

add_action( 'admin_post_vcc_tidy', function () {
	if ( ! current_user_can( 'manage_options' ) || ! check_admin_referer( 'vcc_tidy' ) ) { wp_die( 'Not allowed.' ); }
	@set_time_limit( 300 ); // phpcs:ignore
	kses_remove_filters();
	$pages  = vcc_json( 'pages.json' );
	$seed   = vcc_json( 'seed.json' );
	$keys   = array_keys( $pages );
	$offset = isset( $_POST['offset'] ) ? (int) $_POST['offset'] : ( isset( $_GET['offset'] ) ? (int) $_GET['offset'] : 0 ); // phpcs:ignore
	$batch  = 20;
	foreach ( array_slice( $keys, $offset, $batch ) as $old ) {
		$id = vcc_page_by_old( $old );
		if ( ! $id ) { continue; }
		$p    = $pages[ $old ];
		$html = $p['html'];
		if ( in_array( $old, $seed['calendar_pages'], true ) ) {
			$html = ( 'calendar.php' === $old || '' === trim( wp_strip_all_tags( $html ) ) ) ? $seed['calendar_block'] : $html . "\n\n" . $seed['calendar_block'];
		}
		wp_update_post( array( 'ID' => $id, 'post_content' => wp_slash( $html ) ) );
		update_post_meta( $id, '_wp_page_template', $p['template'] ? $p['template'] : 'default' );
		if ( ! empty( $p['contact'] ) ) { update_post_meta( $id, '_vcc_contact', array( 'title' => $p['contact']['title'], 'text' => $p['contact']['text'], 'phone' => $p['contact']['phone'] ) ); }
		$btn = array();
		foreach ( $p['buttons'] as $b ) { $btn[] = array( 'label' => $b['label'], 'url' => $b['url'], 'new_tab' => $b['new_tab'] ? '1' : '', 'icon' => ! empty( $b['icon'] ) ? '1' : '' ); }
		update_post_meta( $id, '_vcc_buttons', $btn );
		if ( ! empty( $p['related_menu'] ) ) { $m = wp_get_nav_menu_object( $p['related_menu'] ); if ( $m ) { update_post_meta( $id, '_vcc_related', (string) $m->term_id ); } }
		else { update_post_meta( $id, '_vcc_related', 'none' ); }
		if ( ! empty( $p['crumb_parent'] ) ) { $cp = vcc_page_by_old( $p['crumb_parent'] ); if ( $cp ) { update_post_meta( $id, '_vcc_crumb', $cp ); } }
		if ( ! empty( $p['banner'] ) && ! has_post_thumbnail( $id ) ) { $att = vcc_sideload( array( 'file' => $p['banner'] ) ); if ( $att ) { set_post_thumbnail( $id, $att ); } }
	}
	$next = $offset + $batch;
	if ( $next < count( $keys ) ) {
		$url = wp_nonce_url( admin_url( 'admin-post.php?action=vcc_tidy&offset=' . $next ), 'vcc_tidy' );
		echo '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="1;url=' . esc_url( $url ) . '"><body style="font:16px sans-serif;padding:40px"><h2>Tidying the pages…</h2><p>' . (int) min( $next, count( $keys ) ) . ' of ' . count( $keys ) . ' pages done. Please keep this tab open.</p>';
		exit;
	}
	wp_safe_redirect( admin_url( 'admin.php?page=vineyard-site-content&vcc_msg=' . rawurlencode( 'All ' . count( $keys ) . ' pages are tidy. You are finished – open Pages → All Pages to see them.' ) ) );
	exit;
} );
