<?php
/** Plain boxes on the normal "Edit Page" screen (no code): contact box, buttons, Related Pages, breadcrumb parent. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'add_meta_boxes', function () {
	add_meta_box( 'vcc_page_related', 'Left-hand “Related Pages” box', 'vcc_box_related', 'page', 'side', 'default' );
	add_meta_box( 'vcc_page_contact', 'Contact box (left column)', 'vcc_box_contact', 'page', 'side', 'default' );
	add_meta_box( 'vcc_page_buttons', 'Buttons under the page title (optional)', 'vcc_box_buttons', 'page', 'normal', 'default' );
} );

function vcc_related_menus() {
	$out = array();
	foreach ( wp_get_nav_menus() as $m ) {
		if ( 0 === strpos( $m->name, 'Related Pages' ) ) { $out[ $m->term_id ] = $m->name; }
	}
	asort( $out );
	return $out;
}

function vcc_box_related( $post ) {
	wp_nonce_field( 'vcc_page', 'vcc_page_nonce' );
	$cur = get_post_meta( $post->ID, '_vcc_related', true );
	echo '<p class="description">The list of links in the blue box at the left of the page.</p><select name="vcc_related" style="width:100%"><option value="">Automatic – this page’s sub-pages</option><option value="none"' . selected( $cur, 'none', false ) . '>Show nothing</option>';
	foreach ( vcc_related_menus() as $id => $name ) { echo '<option value="' . (int) $id . '"' . selected( (string) $cur, (string) $id, false ) . '>' . esc_html( $name ) . '</option>'; }
	echo '</select><p class="description">To change what a list contains, go to <a href="nav-menus.php">Appearance → Menus</a> and pick the menu whose name starts with “Related Pages”.</p>';
	$crumb = (int) get_post_meta( $post->ID, '_vcc_crumb', true );
	echo '<p><strong>Show this page under (for the “Home › … ” trail at the top)</strong><br>';
	wp_dropdown_pages( array( 'name' => 'vcc_crumb', 'selected' => $crumb, 'show_option_none' => 'Automatic', 'option_none_value' => '0', 'exclude' => $post->ID ) );
	echo '</p><p class="description">Leave on “Automatic” unless you want the page to appear below another page in the trail.</p>';
}

function vcc_box_contact( $post ) {
	$c = (array) get_post_meta( $post->ID, '_vcc_contact', true );
	$c = array_merge( array( 'title' => '', 'text' => '', 'phone' => '' ), $c );
	echo '<p class="description">Shown under the Related Pages box. Leave all three empty to show nothing.</p>';
	echo '<p><label>Name or department<br><input type="text" class="widefat" name="vcc_c_title" value="' . esc_attr( $c['title'] ) . '"></label></p>';
	echo '<p><label>Email address<br><input type="text" class="widefat" name="vcc_c_text" value="' . esc_attr( $c['text'] ) . '"></label></p>';
	echo '<p><label>Phone<br><input type="text" class="widefat" name="vcc_c_phone" value="' . esc_attr( $c['phone'] ) . '"></label></p>';
}

function vcc_box_buttons( $post ) {
	$b = (array) get_post_meta( $post->ID, '_vcc_buttons', true );
	echo '<p class="description">Big buttons shown right under the page title (for example “Apply for a permit”). Fill in as many as you need; leave the rest empty.</p><table class="widefat striped"><thead><tr><th>Button words</th><th>Goes to (page address or https://…)</th><th>New tab</th><th>Small icon</th></tr></thead><tbody>';
	for ( $i = 0; $i < 6; $i++ ) {
		$r = isset( $b[ $i ] ) ? $b[ $i ] : array( 'label' => '', 'url' => '', 'new_tab' => '', 'icon' => '' );
		echo '<tr><td><input type="text" class="widefat" name="vcc_b[' . $i . '][label]" value="' . esc_attr( $r['label'] ) . '"></td><td><input type="text" class="widefat" name="vcc_b[' . $i . '][url]" value="' . esc_attr( $r['url'] ) . '"></td><td><input type="checkbox" name="vcc_b[' . $i . '][new_tab]" value="1" ' . checked( ! empty( $r['new_tab'] ), true, false ) . '></td><td><input type="checkbox" name="vcc_b[' . $i . '][icon]" value="1" ' . checked( ! empty( $r['icon'] ), true, false ) . '></td></tr>';
	}
	echo '</tbody></table>';
}

add_action( 'save_post_page', function ( $post_id ) {
	if ( ! isset( $_POST['vcc_page_nonce'] ) || ! wp_verify_nonce( $_POST['vcc_page_nonce'], 'vcc_page' ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) { // phpcs:ignore
		return;
	}
	$g = function ( $k, $d = '' ) { return isset( $_POST[ $k ] ) ? wp_unslash( $_POST[ $k ] ) : $d; }; // phpcs:ignore
	update_post_meta( $post_id, '_vcc_related', sanitize_text_field( $g( 'vcc_related' ) ) );
	update_post_meta( $post_id, '_vcc_crumb', (int) $g( 'vcc_crumb', 0 ) );
	update_post_meta( $post_id, '_vcc_contact', array( 'title' => sanitize_text_field( $g( 'vcc_c_title' ) ), 'text' => sanitize_text_field( $g( 'vcc_c_text' ) ), 'phone' => sanitize_text_field( $g( 'vcc_c_phone' ) ) ) );
	$rows = array();
	foreach ( (array) $g( 'vcc_b', array() ) as $r ) {
		if ( ! empty( $r['label'] ) && ! empty( $r['url'] ) ) {
			$rows[] = array( 'label' => sanitize_text_field( $r['label'] ), 'url' => esc_url_raw( trim( $r['url'] ), array( 'http', 'https', 'mailto', 'tel' ) ) ?: '/' . ltrim( sanitize_text_field( $r['url'] ), '/' ), 'new_tab' => ! empty( $r['new_tab'] ) ? '1' : '', 'icon' => ! empty( $r['icon'] ) ? '1' : '' );
		}
	}
	update_post_meta( $post_id, '_vcc_buttons', $rows );
} );

/* ---------------------------------------------------------------- getters used by any theme */
function vcc_page_contact( $id ) {
	$c = get_post_meta( $id, '_vcc_contact', true );
	if ( ! is_array( $c ) || ! array_filter( $c ) ) { return null; }
	$c['phone_href'] = $c['phone'] ? 'tel:' . preg_replace( '/[^0-9+]/', '', $c['phone'] ) : '';
	return $c;
}
function vcc_page_buttons( $id ) {
	$b = get_post_meta( $id, '_vcc_buttons', true );
	return is_array( $b ) ? array_map( function ( $r ) { $r['url'] = vcc_url( $r['url'] ); return $r; }, $b ) : array();
}
/** 'none' | menu term id | 0 for automatic. */
function vcc_page_related( $id ) {
	$v = get_post_meta( $id, '_vcc_related', true );
	return 'none' === $v ? 'none' : (int) $v;
}
/** Breadcrumb trail: array of array( title, url ), starting with Home, ending with the page itself (url ''). */
function vcc_breadcrumbs( $id ) {
	$chain = array(); $seen = array(); $cur = (int) $id;
	while ( $cur && ! in_array( $cur, $seen, true ) ) {
		$seen[]  = $cur;
		$chain[] = $cur;
		$over    = (int) get_post_meta( $cur, '_vcc_crumb', true );
		$cur     = $over ? $over : (int) wp_get_post_parent_id( $cur );
	}
	$out = array( array( 'Home', home_url( '/' ) ) );
	foreach ( array_reverse( $chain ) as $i => $pid ) {
		$out[] = array( html_entity_decode( get_the_title( $pid ), ENT_QUOTES ), $pid === (int) $id ? '' : get_permalink( $pid ) );
	}
	return $out;
}
