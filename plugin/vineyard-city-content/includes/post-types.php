<?php
/** Content types owned by the plugin: Quick Links, Photo Tiles, Alerts, Events (+ event categories). */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function vcc_register_post_types() {
	$common = array( 'public' => false, 'show_ui' => true, 'show_in_menu' => 'vineyard-site-content', 'show_in_rest' => true, 'has_archive' => false, 'rewrite' => false, 'capability_type' => 'post', 'map_meta_cap' => true );
	register_post_type( 'vc_quicklink', array_merge( $common, array(
		'labels' => array( 'name' => 'Quick Links', 'singular_name' => 'Quick Link', 'menu_name' => 'Quick Links', 'add_new' => 'Add a Quick Link', 'add_new_item' => 'Add a Quick Link', 'edit_item' => 'Edit Quick Link', 'all_items' => 'Quick Links', 'search_items' => 'Search Quick Links', 'not_found' => 'No quick links yet.', 'featured_image' => 'Tile icon', 'set_featured_image' => 'Choose the tile icon', 'remove_featured_image' => 'Remove icon', 'use_featured_image' => 'Use as tile icon' ),
		'supports' => array( 'title', 'thumbnail', 'page-attributes' ),
	) ) );
	register_post_type( 'vc_tile', array_merge( $common, array(
		'labels' => array( 'name' => 'Photo Tiles', 'singular_name' => 'Photo Tile', 'menu_name' => 'Photo Tiles', 'add_new' => 'Add a Photo Tile', 'add_new_item' => 'Add a Photo Tile', 'edit_item' => 'Edit Photo Tile', 'all_items' => 'Photo Tiles', 'not_found' => 'No photo tiles yet.', 'featured_image' => 'Tile photo', 'set_featured_image' => 'Choose the tile photo', 'remove_featured_image' => 'Remove photo', 'use_featured_image' => 'Use as tile photo' ),
		'supports' => array( 'title', 'thumbnail', 'page-attributes' ),
	) ) );
	register_post_type( 'vc_alert', array_merge( $common, array(
		'labels' => array( 'name' => 'Alerts', 'singular_name' => 'Alert', 'menu_name' => 'Alerts', 'add_new' => 'Post an Alert', 'add_new_item' => 'Post an Alert', 'edit_item' => 'Edit Alert', 'all_items' => 'Alerts', 'not_found' => 'No alerts. Click “Post an Alert” when something needs to be announced on every page.' ),
		'supports' => array( 'title', 'editor' ),
	) ) );
	register_post_type( 'vc_event', array(
		'labels' => array( 'name' => 'Events', 'singular_name' => 'Event', 'menu_name' => 'Events', 'add_new' => 'Add an Event', 'add_new_item' => 'Add an Event', 'edit_item' => 'Edit Event', 'all_items' => 'Events', 'not_found' => 'No events yet. Click “Add an Event”.' ),
		'public' => true, 'publicly_queryable' => true, 'show_ui' => true, 'show_in_menu' => 'vineyard-site-content', 'show_in_rest' => true, 'has_archive' => false,
		'rewrite' => array( 'slug' => 'event', 'with_front' => false ), 'supports' => array( 'title', 'editor' ), 'capability_type' => 'post', 'map_meta_cap' => true,
	) );
	register_taxonomy( 'vc_event_cat', 'vc_event', array(
		'labels' => array( 'name' => 'Event Categories', 'singular_name' => 'Event Category', 'menu_name' => 'Event Categories', 'add_new_item' => 'Add a category' ),
		'hierarchical' => true, 'show_ui' => true, 'show_admin_column' => true, 'show_in_rest' => true, 'public' => false, 'rewrite' => false,
	) );
}
add_action( 'init', 'vcc_register_post_types' );

/* ---------------------------------------------------------------- meta boxes */
add_action( 'add_meta_boxes', function () {
	add_meta_box( 'vcc_link', 'Where does this go when someone clicks it?', 'vcc_box_link', array( 'vc_quicklink', 'vc_tile' ), 'normal', 'high' );
	add_meta_box( 'vcc_when', 'When and where', 'vcc_box_event', 'vc_event', 'normal', 'high' );
	add_meta_box( 'vcc_alert', 'When should this alert show?', 'vcc_box_alert', 'vc_alert', 'normal', 'high' );
} );

function vcc_box_link( $post ) {
	wp_nonce_field( 'vcc_save', 'vcc_nonce' );
	$page = (int) get_post_meta( $post->ID, '_vcc_page', true );
	$url  = get_post_meta( $post->ID, '_vcc_url', true );
	echo '<p class="description">Pick a page of this website <strong>or</strong> type a web address – not both.</p>';
	echo '<p><label><strong>A page on this website</strong><br>';
	wp_dropdown_pages( array( 'name' => 'vcc_page', 'selected' => $page, 'show_option_none' => '— none —', 'option_none_value' => '0' ) );
	echo '</label></p>';
	echo '<p><label><strong>Or a web address</strong> (starts with https://)<br><input type="text" class="large-text" name="vcc_url" value="' . esc_attr( $url ) . '" placeholder="https://"></label></p>';
	echo '<p><label><input type="checkbox" name="vcc_new_tab" value="1" ' . checked( get_post_meta( $post->ID, '_vcc_new_tab', true ), '1', false ) . '> Open in a new browser tab</label></p>';
	if ( 'vc_quicklink' === $post->post_type ) {
		echo '<p><label><strong>Second line of the title</strong> (optional – only if you want the words to break onto a new line)<br><input type="text" class="regular-text" name="vcc_title2" value="' . esc_attr( get_post_meta( $post->ID, '_vcc_title2', true ) ) . '"></label></p>';
	}
	echo '<p class="description">The picture is set on the right side (“' . ( 'vc_tile' === $post->post_type ? 'Tile photo' : 'Tile icon' ) . '”). Use the <strong>Order</strong> number on the right to arrange tiles – the smallest number comes first.</p>';
}

function vcc_box_event( $post ) {
	wp_nonce_field( 'vcc_save', 'vcc_nonce' );
	$start = get_post_meta( $post->ID, '_vcc_start', true );
	$end   = get_post_meta( $post->ID, '_vcc_end', true );
	$all   = get_post_meta( $post->ID, '_vcc_all_day', true );
	$d  = $start ? substr( $start, 0, 10 ) : '';
	$st = ( $start && ! $all ) ? substr( $start, 11, 5 ) : '';
	$et = ( $end && ! $all ) ? substr( $end, 11, 5 ) : '';
	echo '<p class="description">Events appear on the home page and the Events/Calendar page until the day has passed – you never need to remove them.</p>';
	echo '<p><label><strong>Date</strong><br><input type="date" name="vcc_date" value="' . esc_attr( $d ) . '" required></label></p>';
	echo '<p><label><input type="checkbox" name="vcc_all_day" value="1" ' . checked( $all, '1', false ) . '> No set time (all day)</label></p>';
	echo '<p><label><strong>Starts at</strong> <input type="time" name="vcc_start_time" value="' . esc_attr( $st ) . '"></label> &nbsp; <label><strong>Ends at</strong> <input type="time" name="vcc_end_time" value="' . esc_attr( $et ) . '"></label></p>';
	echo '<p><label><strong>Where</strong><br><input type="text" class="large-text" name="vcc_location" value="' . esc_attr( get_post_meta( $post->ID, '_vcc_location', true ) ) . '" placeholder="For example: 125 S Main Street"></label></p>';
	echo '<p class="description">Write the details of the event in the big box above. Tick a <strong>category</strong> on the right (Meetings, Community, Recreation …) so it shows under the right tab on the home page.</p>';
}

function vcc_box_alert( $post ) {
	wp_nonce_field( 'vcc_save', 'vcc_nonce' );
	echo '<p class="description">An alert shows as a box in the corner of <strong>every</strong> page while it is <strong>Published</strong>. Write the message in the big box above. To take it down, click “Move to Trash” (or fill in “Stop showing on”).</p>';
	echo '<p><label><strong>Start showing on</strong> (optional) <input type="date" name="vcc_from" value="' . esc_attr( get_post_meta( $post->ID, '_vcc_from', true ) ) . '"></label> &nbsp; <label><strong>Stop showing on</strong> (optional) <input type="date" name="vcc_until" value="' . esc_attr( get_post_meta( $post->ID, '_vcc_until', true ) ) . '"></label></p>';
	echo '<p><label><strong>Button text</strong> (optional) <input type="text" name="vcc_btn_label" value="' . esc_attr( get_post_meta( $post->ID, '_vcc_btn_label', true ) ) . '"></label> &nbsp; <label><strong>Button goes to</strong> <input type="text" class="regular-text" name="vcc_btn_url" value="' . esc_attr( get_post_meta( $post->ID, '_vcc_btn_url', true ) ) . '" placeholder="https://"></label></p>';
}

add_action( 'save_post', function ( $post_id, $post ) {
	if ( ! isset( $_POST['vcc_nonce'] ) || ! wp_verify_nonce( $_POST['vcc_nonce'], 'vcc_save' ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) { // phpcs:ignore
		return;
	}
	$g = function ( $k ) { return isset( $_POST[ $k ] ) ? wp_unslash( $_POST[ $k ] ) : ''; }; // phpcs:ignore
	switch ( $post->post_type ) {
		case 'vc_quicklink':
		case 'vc_tile':
			update_post_meta( $post_id, '_vcc_page', (int) $g( 'vcc_page' ) );
			update_post_meta( $post_id, '_vcc_url', esc_url_raw( trim( $g( 'vcc_url' ) ) ) );
			update_post_meta( $post_id, '_vcc_new_tab', $g( 'vcc_new_tab' ) ? '1' : '' );
			if ( 'vc_quicklink' === $post->post_type ) {
				update_post_meta( $post_id, '_vcc_title2', sanitize_text_field( $g( 'vcc_title2' ) ) );
			}
			break;
		case 'vc_event':
			$date = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $g( 'vcc_date' ) ) ? $g( 'vcc_date' ) : '';
			$all  = $g( 'vcc_all_day' ) ? '1' : '';
			$st   = preg_match( '/^\d{2}:\d{2}$/', $g( 'vcc_start_time' ) ) ? $g( 'vcc_start_time' ) : '';
			$et   = preg_match( '/^\d{2}:\d{2}$/', $g( 'vcc_end_time' ) ) ? $g( 'vcc_end_time' ) : '';
			if ( ! $st ) { $all = '1'; }
			update_post_meta( $post_id, '_vcc_all_day', $all );
			update_post_meta( $post_id, '_vcc_start', $date ? $date . ' ' . ( $all ? '00:00' : $st ) . ':00' : '' );
			update_post_meta( $post_id, '_vcc_end', ( $date && $et && ! $all ) ? $date . ' ' . $et . ':00' : '' );
			update_post_meta( $post_id, '_vcc_location', sanitize_text_field( $g( 'vcc_location' ) ) );
			break;
		case 'vc_alert':
			foreach ( array( 'from' => 'vcc_from', 'until' => 'vcc_until' ) as $k => $f ) {
				update_post_meta( $post_id, '_vcc_' . $k, preg_match( '/^\d{4}-\d{2}-\d{2}$/', $g( $f ) ) ? $g( $f ) : '' );
			}
			update_post_meta( $post_id, '_vcc_btn_label', sanitize_text_field( $g( 'vcc_btn_label' ) ) );
			update_post_meta( $post_id, '_vcc_btn_url', esc_url_raw( trim( $g( 'vcc_btn_url' ) ) ) );
			break;
	}
}, 10, 2 );

/* ---------------------------------------------------------------- admin lists */
add_filter( 'manage_vc_event_posts_columns', function ( $c ) {
	return array( 'cb' => $c['cb'], 'title' => 'Event', 'vcc_when' => 'When', 'taxonomy-vc_event_cat' => 'Category', 'vcc_where' => 'Where' );
} );
add_filter( 'manage_vc_quicklink_posts_columns', function ( $c ) { return array( 'cb' => $c['cb'], 'title' => 'Title', 'vcc_img' => 'Icon', 'vcc_order' => 'Order' ); } );
add_filter( 'manage_vc_tile_posts_columns', function ( $c ) { return array( 'cb' => $c['cb'], 'title' => 'Title', 'vcc_img' => 'Photo', 'vcc_order' => 'Order' ); } );
add_action( 'manage_posts_custom_column', function ( $col, $id ) {
	if ( 'vcc_when' === $col ) {
		$s = get_post_meta( $id, '_vcc_start', true );
		echo $s ? esc_html( mysql2date( 'D, M j, Y', $s ) . ( get_post_meta( $id, '_vcc_all_day', true ) ? '' : ' · ' . mysql2date( 'g:i a', $s ) ) ) : '—'; // phpcs:ignore
	} elseif ( 'vcc_where' === $col ) {
		echo esc_html( get_post_meta( $id, '_vcc_location', true ) );
	} elseif ( 'vcc_img' === $col ) {
		echo get_the_post_thumbnail( $id, array( 60, 60 ) ) ?: '—'; // phpcs:ignore
	} elseif ( 'vcc_order' === $col ) {
		echo (int) get_post_field( 'menu_order', $id );
	}
}, 10, 2 );
add_action( 'pre_get_posts', function ( $q ) {
	if ( is_admin() && $q->is_main_query() && 'vc_event' === $q->get( 'post_type' ) && ! $q->get( 'orderby' ) ) {
		$q->set( 'meta_key', '_vcc_start' ); $q->set( 'orderby', 'meta_value' ); $q->set( 'order', 'ASC' );
	}
	if ( is_admin() && $q->is_main_query() && in_array( $q->get( 'post_type' ), array( 'vc_quicklink', 'vc_tile' ), true ) && ! $q->get( 'orderby' ) ) {
		$q->set( 'orderby', 'menu_order title' ); $q->set( 'order', 'ASC' );
	}
} );

/** Event page for visitors: show date / time / where above the description (works in any theme). */
add_filter( 'the_content', function ( $content ) {
	if ( is_singular( 'vc_event' ) && in_the_loop() && is_main_query() ) {
		$e = vcc_event_data( get_the_ID() );
		$h = '<p class="vcc-event-meta"><strong>' . esc_html( $e['when_long'] ) . '</strong>' . ( $e['location'] ? '<br>' . esc_html( $e['location'] ) : '' ) . '</p>';
		return $h . $content;
	}
	return $content;
} );
