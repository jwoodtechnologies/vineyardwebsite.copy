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

/**
 * The site's Home page. Settings → Reading first; otherwise the imported page that came from the old index.php.
 */
function vcc_home_id() {
	$id = (int) get_option( 'page_on_front' );
	if ( $id && 'page' === get_post_type( $id ) ) {
		return $id;
	}
	$ids = get_posts( array( 'post_type' => 'page', 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids', 'meta_key' => '_vc_old_path', 'meta_value' => 'index.php', 'orderby' => 'ID', 'order' => 'ASC' ) );
	foreach ( $ids as $i ) {
		if ( 'home' === get_post_field( 'post_name', $i ) ) { return (int) $i; }
	}
	return $ids ? (int) $ids[0] : 0;
}

/**
 * The page that came from an old address. NEVER returns the Home page for any other address: WordPress Importer can
 * copy another page's details onto Home (it happened with the untitled "Business Directory" page), and that must not
 * make Home look like that page.
 */
function vcc_page_by_old( $old, $slug = '' ) {
	$ids = get_posts( array( 'post_type' => 'page', 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids', 'meta_key' => '_vc_old_path', 'meta_value' => $old, 'orderby' => 'ID', 'order' => 'ASC' ) );
	if ( 'index.php' !== $old ) {
		$ids = array_values( array_diff( array_map( 'intval', $ids ), array( vcc_home_id() ) ) );
	}
	if ( count( $ids ) > 1 && $slug ) {
		foreach ( $ids as $i ) {
			if ( get_post_field( 'post_name', $i ) === $slug ) { return (int) $i; }
		}
	}
	return $ids ? (int) $ids[0] : 0;
}

/** Details the importer or the page tidy may have put on Home that belong to other pages. */
function vcc_home_foreign_meta_keys() {
	return array( '_vcc_related', '_vcc_crumb', '_vcc_buttons', '_vcc_contact', '_vcc_tidied', 'vc_layout', 'vc_breadcrumbs', 'vc_leftnav', 'vc_banner_images',
		'vc_banner_caption', 'vc_inner_buttons', 'vc_contact_box', 'vc_body_id', 'vc_body_class', 'vc_head_assets', 'vc_meta_description' );
}

/**
 * Make the Home page show the standard home sections again (Quick Links, Upcoming Events, Photo Tiles, Social, Newsletter).
 * Safe to repeat. The old text is kept as a revision first (Pages → Home → Revisions), so nothing is lost.
 * Keeps the Featured Image (the big banner photo) the clerk chose.
 */
function vcc_rebuild_home() {
	$home = vcc_home_id();
	if ( ! $home ) {
		return array( 'ok' => false, 'message' => 'No Home page was found. Create a page called “Home” and choose it under Settings → Reading → Your homepage displays → A static page.' );
	}
	$seed   = vcc_json( 'seed.json' );
	$before = (string) get_post_field( 'post_content', $home );
	$backup = 0;
	if ( '' !== trim( $before ) && $before !== $seed['home_content'] ) {
		$backup = (int) wp_save_post_revision( $home );                       // a copy of the current text, before changing it
		if ( ! $backup ) {                                                    // no new revision: the newest one already holds this text?
			$last = wp_get_post_revisions( $home, array( 'numberposts' => 1 ) );
			$last = $last ? reset( $last ) : null;
			if ( $last && $last->post_content === $before ) {
				$backup = (int) $last->ID;
			} else {                                                          // revisions switched off: keep one copy in the page's details
				update_post_meta( $home, '_vcc_home_content_backup', wp_slash( $before ) );
			}
		}
	}
	kses_remove_filters();
	if ( $before !== $seed['home_content'] ) {
		wp_update_post( array( 'ID' => $home, 'post_content' => wp_slash( $seed['home_content'] ) ) );
	}
	update_post_meta( $home, '_wp_page_template', 'default' );
	foreach ( get_post_meta( $home, '_vc_old_path' ) as $v ) {
		if ( 'index.php' !== $v ) { delete_post_meta( $home, '_vc_old_path', $v ); }
	}
	if ( ! in_array( 'index.php', get_post_meta( $home, '_vc_old_path' ), true ) ) { add_post_meta( $home, '_vc_old_path', 'index.php' ); }
	foreach ( get_post_meta( $home, '_vc_old_url' ) as $v ) {
		if ( ! preg_match( '#/index\.php$#', $v ) ) { delete_post_meta( $home, '_vc_old_url', $v ); }
	}
	foreach ( vcc_home_foreign_meta_keys() as $k ) { delete_post_meta( $home, $k ); }
	if ( ! has_post_thumbnail( $home ) && ! empty( $seed['home_banner'] ) ) {
		$att = vcc_sideload( $seed['home_banner'] ); if ( $att ) { set_post_thumbnail( $home, $att ); }
	}
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $home );
	return array( 'ok' => true, 'home' => $home, 'removed' => strlen( $before ), 'backup' => $backup,
		'message' => ( $before === $seed['home_content'] ? 'The home page already shows the standard sections – nothing needed changing.' :
			sprintf( 'The home page now shows Quick Links, Upcoming Events, Photo Tiles, Social Media and the Newsletter box.%s', $backup ? ' The previous text is saved under Pages → Home → Revisions.' : ' The previous text was saved with the page.' ) ) );
}

/** Pages from the old site that are not on this site (the importer can merge an untitled page into another one). */
function vcc_create_missing_pages( $pages ) {
	$made = array();
	foreach ( $pages as $old => $p ) {
		if ( vcc_page_by_old( $old, $p['slug'] ) ) { continue; }
		$parent = ! empty( $p['parent_old'] ) ? vcc_page_by_old( $p['parent_old'] ) : 0;
		$title  = trim( (string) $p['title'] ) ? $p['title'] : ucwords( str_replace( '-', ' ', $p['slug'] ) );
		$id     = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => $title, 'post_name' => $p['slug'],
			'post_parent' => $parent, 'menu_order' => isset( $p['menu_order'] ) ? (int) $p['menu_order'] : 0, 'post_content' => '' ) );
		if ( $id && ! is_wp_error( $id ) ) {
			add_post_meta( $id, '_vc_old_path', $old );
			$made[] = $title;
		}
	}
	return $made;
}

/** A page still holding the copied old-site markup (and not tidied before) – the only kind Tidy changes. */
function vcc_needs_tidy( $id ) {
	if ( get_post_meta( $id, '_vcc_tidied', true ) ) { return false; }
	$c = (string) get_post_field( 'post_content', $id );
	return '' === trim( $c ) || false !== strpos( $c, 'id="post"' ) || false !== strpos( $c, 'docs-toggle' ) || false !== strpos( $c, 'formwizard' );
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

	// Home page: banner photo = Featured Image (kept if already chosen), sections = blocks, and make it the front page
	vcc_rebuild_home();

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
	$home   = vcc_home_id();
	if ( 0 === $offset ) {
		// pages the importer merged into another page (an untitled page is matched by date alone) are created first,
		// so their sub-pages can point at them. Only on the first full run, so a page you deleted on purpose stays deleted.
		$made = get_option( 'vcc_tidy_complete' ) ? array() : vcc_create_missing_pages( $pages );
		update_option( 'vcc_tidy_created', $made, false );
		update_option( 'vcc_tidy_counts', array( 'tidied' => 0, 'skipped' => 0 ), false );
	}
	$counts = get_option( 'vcc_tidy_counts', array( 'tidied' => 0, 'skipped' => 0 ) );
	foreach ( array_slice( $keys, $offset, $batch ) as $old ) {
		$p  = $pages[ $old ];
		$id = vcc_page_by_old( $old, $p['slug'] );
		if ( ! $id || $id === $home || ! vcc_needs_tidy( $id ) ) { $counts['skipped']++; continue; }   // never touch Home; never re-tidy (keeps your edits)
		$html = $p['html'];
		if ( in_array( $old, $seed['calendar_pages'], true ) ) {
			$html = ( 'calendar.php' === $old || '' === trim( wp_strip_all_tags( $html ) ) ) ? $seed['calendar_block'] : $html . "\n\n" . $seed['calendar_block'];
		}
		$upd = array( 'ID' => $id, 'post_content' => wp_slash( $html ) );
		if ( '' === trim( get_the_title( $id ) ) && trim( (string) $p['title'] ) ) { $upd['post_title'] = $p['title']; }
		wp_update_post( $upd );
		update_post_meta( $id, '_wp_page_template', $p['template'] ? $p['template'] : 'default' );
		if ( ! empty( $p['contact'] ) ) { update_post_meta( $id, '_vcc_contact', array( 'title' => $p['contact']['title'], 'text' => $p['contact']['text'], 'phone' => $p['contact']['phone'] ) ); }
		$btn = array();
		foreach ( $p['buttons'] as $b ) { $btn[] = array( 'label' => $b['label'], 'url' => $b['url'], 'new_tab' => $b['new_tab'] ? '1' : '', 'icon' => ! empty( $b['icon'] ) ? '1' : '' ); }
		update_post_meta( $id, '_vcc_buttons', $btn );
		if ( ! empty( $p['related_menu'] ) ) { $m = wp_get_nav_menu_object( $p['related_menu'] ); if ( $m ) { update_post_meta( $id, '_vcc_related', (string) $m->term_id ); } }
		else { update_post_meta( $id, '_vcc_related', 'none' ); }
		if ( ! empty( $p['crumb_parent'] ) ) { $cp = vcc_page_by_old( $p['crumb_parent'] ); if ( $cp && $cp !== $id ) { update_post_meta( $id, '_vcc_crumb', $cp ); } }
		if ( ! empty( $p['banner'] ) && ! has_post_thumbnail( $id ) ) { $att = vcc_sideload( array( 'file' => $p['banner'] ) ); if ( $att ) { set_post_thumbnail( $id, $att ); } }
		update_post_meta( $id, '_vcc_tidied', VCC_VERSION );
		$counts['tidied']++;
	}
	update_option( 'vcc_tidy_counts', $counts, false );
	$next = $offset + $batch;
	if ( $next < count( $keys ) ) {
		$url = wp_nonce_url( admin_url( 'admin-post.php?action=vcc_tidy&offset=' . $next ), 'vcc_tidy' );
		echo '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="1;url=' . esc_url( $url ) . '"><body style="font:16px sans-serif;padding:40px"><h2>Tidying the pages…</h2><p>' . (int) min( $next, count( $keys ) ) . ' of ' . count( $keys ) . ' pages checked. Please keep this tab open.</p>';
		exit;
	}
	// Breadcrumb links that point at a page created in this run are filled in now (their pages may come earlier in the list).
	foreach ( $keys as $old ) {
		$p = $pages[ $old ];
		if ( empty( $p['crumb_parent'] ) ) { continue; }
		$id = vcc_page_by_old( $old, $p['slug'] ); $cp = vcc_page_by_old( $p['crumb_parent'] );
		if ( $id && $id !== $home && $cp && $cp !== $id && ! get_post_meta( $id, '_vcc_crumb', true ) ) { update_post_meta( $id, '_vcc_crumb', $cp ); }
	}
	update_option( 'vcc_tidy_complete', VCC_VERSION );
	$r    = vcc_rebuild_home();
	$made = (array) get_option( 'vcc_tidy_created', array() );
	$msg  = sprintf( 'Pages checked: %d tidied, %d already tidy or left as you edited them.', $counts['tidied'], $counts['skipped'] )
		. ( $made ? ' Added missing page(s): ' . implode( ', ', $made ) . '.' : '' ) . ' ' . $r['message'];
	wp_safe_redirect( admin_url( 'admin.php?page=vineyard-site-content&vcc_msg=' . rawurlencode( $msg ) ) );
	exit;
} );

add_action( 'admin_post_vcc_rebuild_home', function () {
	if ( ! current_user_can( 'edit_pages' ) || ! check_admin_referer( 'vcc_rebuild_home' ) ) { wp_die( 'Not allowed.' ); }
	$r = vcc_rebuild_home();
	wp_safe_redirect( admin_url( 'admin.php?page=vineyard-site-content&vcc_msg=' . rawurlencode( $r['message'] ) ) );
	exit;
} );
