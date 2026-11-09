<?php
/** The "Vineyard Site Content" menu: Start here, Header, Footer, Home page (+ Quick Links, Photo Tiles, Alerts, Events lists). */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Field definitions per screen. type: text | url | image | textarea. */
function vcc_screens() {
	return array(
		'header' => array(
			'title' => 'Header', 'help' => 'The bar at the very top of every page: the city logo and the search box. The menu itself is edited under Appearance → Menus.',
			'sections' => array( 'Logo and search' => array(
				array( 'logo', 'Logo', 'image', 'Shown at the top left of every page. Click “Choose picture”.' ),
				array( 'search_placeholder', 'Words inside the search box', 'text', 'For example: Search ...' ),
			), 'Pictures in the drop-down menus' => array(
				array( 'menu_image_2', 'Picture in the “Government” drop-down', 'image', 'Shown at the top of the menu that opens when someone points at Government.' ),
				array( 'menu_image_3', 'Picture in the “Community” drop-down', 'image', 'Shown at the top of the menu that opens when someone points at Community.' ),
			) ),
		),
		'footer' => array(
			'title' => 'Footer', 'help' => 'The strip at the bottom of every page: phone, address, opening hours, and the social media links.',
			'sections' => array(
				'Contact details' => array(
					array( 'footer_logo', 'Footer logo', 'image', '' ),
					array( 'phone', 'Phone number', 'text', 'For example: 801.226.1929' ),
					array( 'address_line1', 'Address – first line', 'text', '' ),
					array( 'address_line2', 'Address – second line', 'text', '' ),
					array( 'address_link', 'Map link for the address', 'url', 'Paste the Google Maps link. Visitors click the address to open it.' ),
					array( 'hours_line1', 'Opening hours – first line', 'text', '' ),
					array( 'hours_line2', 'Opening hours – second line', 'text', '' ),
					array( 'copyright', 'Copyright line (bottom left)', 'text', '' ),
				),
				'Social media links' => array(
					array( 'facebook', 'Facebook page', 'url', 'Leave empty to hide the icon.' ),
					array( 'instagram', 'Instagram page', 'url', 'Leave empty to hide the icon.' ),
					array( 'twitter', 'X / Twitter page', 'url', 'Leave empty to hide the icon.' ),
				),
			),
		),
		'home' => array(
			'title' => 'Home page', 'help' => 'The words and pictures on the home page. The big background photo is the <strong>Featured Image</strong> of the page called “Home” (Pages → Home). The row of tiles and the photo tiles are edited in <a href="edit.php?post_type=vc_quicklink">Quick Links</a> and <a href="edit.php?post_type=vc_tile">Photo Tiles</a>; events in <a href="edit.php?post_type=vc_event">Events</a>.',
			'sections' => array(
				'Top picture' => array(
					array( 'hero_logo', 'Big logo over the photo', 'image', '' ),
					array( 'hero_button_label', 'Button text', 'text', 'The yellow button under the logo.' ),
					array( 'hero_button_url', 'Button goes to', 'url', 'A page address such as /transparency-portal/ or a full web address.' ),
				),
				'Upcoming events area' => array(
					array( 'events_small', 'Small heading', 'text', '' ), array( 'events_title', 'Big heading', 'text', '' ),
					array( 'events_button_label', 'Button text', 'text', '' ), array( 'events_button_url', 'Button goes to', 'url', '' ),
				),
				'Social media area' => array( array( 'social_small', 'Small heading', 'text', '' ), array( 'social_title', 'Big heading', 'text', 'The icons use the links on the Footer screen.' ) ),
				'Newsletter area' => array(
					array( 'newsletter_small', 'Small heading', 'text', '' ), array( 'newsletter_title', 'Big heading', 'text', '' ),
					array( 'newsletter_placeholder', 'Words inside the box', 'text', '' ), array( 'newsletter_button', 'Button text', 'text', '' ),
					array( 'newsletter_action', 'Where the sign-up goes', 'url', 'The page or sign-up address that receives what people type.' ),
				),
			),
		),
	);
}

add_action( 'admin_menu', function () {
	add_menu_page( 'Vineyard Site Content', 'Vineyard Site Content', 'edit_pages', 'vineyard-site-content', 'vcc_screen_start', 'dashicons-admin-home', 4 );
	add_submenu_page( 'vineyard-site-content', 'Start here', 'Start here', 'edit_pages', 'vineyard-site-content', 'vcc_screen_start' );
	foreach ( vcc_screens() as $slug => $s ) {
		add_submenu_page( 'vineyard-site-content', $s['title'], $s['title'], 'edit_pages', 'vcc-' . $slug, function () use ( $slug ) { vcc_screen_settings( $slug ); } );
	}
}, 9 );

/** Keep the menu in a friendly order: Start here, Header, Footer, Home page, Quick Links, Photo Tiles, Alerts, Events, categories. */
add_filter( 'custom_menu_order', '__return_true' );
add_filter( 'menu_order', function ( $o ) { return $o; } );
add_action( 'admin_menu', function () {
	global $submenu;
	if ( empty( $submenu['vineyard-site-content'] ) ) { return; }
	$want = array( 'vineyard-site-content', 'vcc-header', 'vcc-footer', 'vcc-home', 'edit.php?post_type=vc_quicklink', 'edit.php?post_type=vc_tile', 'edit.php?post_type=vc_alert', 'edit.php?post_type=vc_event', 'edit-tags.php?taxonomy=vc_event_cat&amp;post_type=vc_event' );
	usort( $submenu['vineyard-site-content'], function ( $a, $b ) use ( $want ) {
		$ia = array_search( $a[2], $want, true ); $ib = array_search( $b[2], $want, true );
		return ( false === $ia ? 99 : $ia ) <=> ( false === $ib ? 99 : $ib );
	} );
	foreach ( $submenu['vineyard-site-content'] as &$item ) { // remove the "Add new" duplicates; add buttons exist on each list
		if ( false !== strpos( $item[2], 'post-new.php' ) ) { $item = null; }
	}
	$submenu['vineyard-site-content'] = array_values( array_filter( $submenu['vineyard-site-content'] ) );
}, 999 );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	$ours = ( false !== strpos( $hook, 'vineyard-site-content' ) || false !== strpos( $hook, 'vcc-' ) );
	if ( $ours ) {
		wp_enqueue_media();
		wp_enqueue_script( 'vcc-admin', VCC_URL . 'assets/admin.js', array( 'jquery' ), VCC_VERSION, true );
		wp_enqueue_style( 'vcc-admin', VCC_URL . 'assets/admin.css', array(), VCC_VERSION );
	}
} );
add_action( 'admin_head', function () { // list screens also get the help line + tidy styling
	$s = get_current_screen();
	if ( $s && in_array( $s->post_type, array( 'vc_quicklink', 'vc_tile', 'vc_alert', 'vc_event' ), true ) ) { echo '<style>.vcc-help{background:#f0f6fc;border-left:4px solid #2271b1;padding:10px 14px;margin:12px 0;max-width:900px}</style>'; }
} );

/** Help line at the top of the four list screens. */
add_action( 'admin_notices', function () {
	$s = get_current_screen();
	if ( ! $s || 'edit' !== $s->base ) { return; }
	$h = array(
		'vc_quicklink' => 'These are the round-icon tiles in the blue strip on the home page. Click “Add a Quick Link” to add one, or click a title to change it. The smallest <strong>Order</strong> number comes first.',
		'vc_tile'      => 'These are the three big photo tiles in the middle of the home page. Click a title to change the photo, words or link.',
		'vc_alert'     => 'An alert is a box that appears in the corner of every page (for example “City Hall closed Friday”). Click “Post an Alert”, write the message, and Publish. To remove it, move it to the Trash.',
		'vc_event'     => 'Add the events here. They appear on the home page and on the Events/Calendar page automatically, and disappear by themselves after the day has passed.',
	);
	if ( isset( $h[ $s->post_type ] ) ) { echo '<div class="vcc-help"><strong>What is this?</strong> ' . wp_kses_post( $h[ $s->post_type ] ) . '</div>'; }
} );

function vcc_screen_start() {
	if ( get_transient( 'vcc_just_activated' ) ) { delete_transient( 'vcc_just_activated' ); }
	$seeded = get_option( 'vcc_seeded' );
	echo '<div class="wrap vcc-wrap"><h1>Vineyard Site Content</h1>';
	echo '<div class="vcc-help"><strong>Start here.</strong> This menu holds everything on the website that is <em>not</em> an ordinary page: the header and footer details, the home page tiles, alerts and events. Pages, documents and menus are edited the usual WordPress way (<em>Pages</em>, <em>Media</em>, <em>Appearance → Menus</em>). Everything here belongs to the website, not to the design – if you change the design (theme) later, it all stays.</div>';
	if ( ! empty( $_GET['vcc_msg'] ) ) { echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( wp_unslash( $_GET['vcc_msg'] ) ) . '</p></div>'; } // phpcs:ignore
	echo '<h2>Step 1 – Load the current website content (one time)</h2><p>This fills in the header, footer, home page tiles, current events and the “Related Pages” boxes with what the website shows today. It is safe to click again – nothing is duplicated.</p>';
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">' . wp_nonce_field( 'vcc_seed', '_wpnonce', true, false ) . '<input type="hidden" name="action" value="vcc_seed"><p><button class="button button-primary button-hero">' . ( $seeded ? 'Load it again' : 'Load the starter content' ) . '</button> ' . ( $seeded ? '<span class="description">Last loaded: ' . esc_html( $seeded ) . '</span>' : '' ) . '</p></form>';
	echo '<h2>Step 2 – Tidy the pages that were copied over (one time)</h2><p>Puts the left-hand “Related Pages” list, the contact box, the buttons under the page title and the banner picture of each page into simple editable boxes on that page, turns the document lists into easy lists, and replaces the old forms with working ones. It works in small batches and may take a minute. Safe to click again: pages that are already tidy – including any you have edited since – are left alone, and the home page is never changed by this step except to restore its sections.</p>';
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">' . wp_nonce_field( 'vcc_tidy', '_wpnonce', true, false ) . '<input type="hidden" name="action" value="vcc_tidy"><input type="hidden" name="offset" value="0"><p><button class="button button-primary button-hero">Tidy the pages</button></p></form>';
	$home      = function_exists( 'vcc_home_id' ) ? vcc_home_id() : 0;
	$home_html = $home ? (string) get_post_field( 'post_content', $home ) : '';
	$home_ok   = $home && false !== strpos( $home_html, 'wp:vineyard-city-content/' ) && strlen( $home_html ) < 20000;
	echo '<h2 id="vcc-rebuild-home">Step 3 – Rebuild the home page sections (any time)</h2>';
	if ( $home && ! $home_ok ) {
		echo '<div class="notice notice-warning inline"><p><strong>The home page is not showing its usual sections.</strong> It currently holds ' . esc_html( size_format( strlen( $home_html ) ) ) . ' of other text. Click the button below to fix it.</p></div>';
	}
	echo '<p>Puts the standard sections back on the home page – Home Banner, Quick Links, Upcoming Events, Photo Tiles, Social Media, Newsletter and Alerts – and keeps your banner photo. Each section is a block you can drag up or down, remove, or add back (click + and look under “Vineyard City”). The page’s current text is saved first under <em>Pages → Home → Revisions</em>, so nothing is lost. Your quick links, tiles, events and settings are not changed.</p>';
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">' . wp_nonce_field( 'vcc_rebuild_home', '_wpnonce', true, false ) . '<input type="hidden" name="action" value="vcc_rebuild_home"><p><button class="button ' . ( $home_ok ? '' : 'button-primary ' ) . 'button-hero">Rebuild the home page sections</button>'
		. ( $home ? ' <a href="' . esc_url( get_edit_post_link( $home ) ) . '">Open the Home page</a>' : '' ) . '</p></form>';
	echo '<h2>Where to click</h2><ul class="ul-disc"><li><a href="admin.php?page=vcc-header">Header</a> – logo, search box</li><li><a href="admin.php?page=vcc-footer">Footer</a> – phone, address, hours, social links</li><li><a href="admin.php?page=vcc-home">Home page</a> – the words on the home page</li><li><a href="edit.php?post_type=vc_quicklink">Quick Links</a> · <a href="edit.php?post_type=vc_tile">Photo Tiles</a> · <a href="edit.php?post_type=vc_alert">Alerts</a> · <a href="edit.php?post_type=vc_event">Events</a></li></ul></div>';
}

function vcc_screen_settings( $slug ) {
	$all = vcc_screens();
	$scr = $all[ $slug ];
	echo '<div class="wrap vcc-wrap"><h1>' . esc_html( $scr['title'] ) . '</h1><div class="vcc-help">' . wp_kses_post( $scr['help'] ) . '</div>';
	if ( ! empty( $_GET['saved'] ) ) { echo '<div class="notice notice-success is-dismissible"><p>Saved. Look at your website to see the change.</p></div>'; } // phpcs:ignore
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">' . wp_nonce_field( 'vcc_settings_' . $slug, '_wpnonce', true, false ) . '<input type="hidden" name="action" value="vcc_save_settings"><input type="hidden" name="screen" value="' . esc_attr( $slug ) . '">';
	foreach ( $scr['sections'] as $name => $fields ) {
		echo '<h2>' . esc_html( $name ) . '</h2><table class="form-table"><tbody>';
		foreach ( $fields as $f ) {
			list( $key, $label, $type, $help ) = $f;
			$val = vcc_opt( $key );
			echo '<tr><th scope="row"><label for="vcc_' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label></th><td>';
			if ( 'image' === $type ) {
				$url = vcc_image( $key );
				echo '<div class="vcc-image"><img src="' . esc_url( $url ) . '" style="max-width:240px;max-height:120px;background:#ddd;' . ( $url ? '' : 'display:none' ) . '" alt=""><br><input type="hidden" name="vcc[' . esc_attr( $key ) . ']" id="vcc_' . esc_attr( $key ) . '" value="' . esc_attr( (int) $val ) . '"><button type="button" class="button vcc-pick">Choose picture</button> <button type="button" class="button-link vcc-clear">Remove</button></div>';
			} elseif ( 'textarea' === $type ) {
				echo '<textarea class="large-text" rows="3" name="vcc[' . esc_attr( $key ) . ']" id="vcc_' . esc_attr( $key ) . '">' . esc_textarea( $val ) . '</textarea>';
			} else {
				echo '<input type="text" class="large-text" name="vcc[' . esc_attr( $key ) . ']" id="vcc_' . esc_attr( $key ) . '" value="' . esc_attr( $val ) . '">';
			}
			if ( $help ) { echo '<p class="description">' . esc_html( $help ) . '</p>'; }
			echo '</td></tr>';
		}
		echo '</tbody></table>';
	}
	echo '<p><button class="button button-primary button-large">Save changes</button></p></form></div>';
}

add_action( 'admin_post_vcc_save_settings', function () {
	$slug = isset( $_POST['screen'] ) ? sanitize_key( $_POST['screen'] ) : ''; // phpcs:ignore
	$all  = vcc_screens();
	if ( ! isset( $all[ $slug ] ) || ! current_user_can( 'edit_pages' ) || ! check_admin_referer( 'vcc_settings_' . $slug ) ) { wp_die( 'Not allowed.' ); }
	$saved = get_option( 'vcc_settings', array() );
	$saved = is_array( $saved ) ? $saved : array();
	$in    = isset( $_POST['vcc'] ) ? wp_unslash( $_POST['vcc'] ) : array(); // phpcs:ignore
	foreach ( $all[ $slug ]['sections'] as $fields ) {
		foreach ( $fields as $f ) {
			list( $key, , $type ) = $f;
			$v = isset( $in[ $key ] ) ? $in[ $key ] : '';
			$saved[ $key ] = 'image' === $type ? (int) $v : ( 'url' === $type ? ( preg_match( '#^[/\#]#', trim( $v ) ) ? '/' . ltrim( sanitize_text_field( trim( $v ) ), '/' ) : esc_url_raw( trim( $v ) ) ) : sanitize_text_field( $v ) );
		}
	}
	update_option( 'vcc_settings', $saved );
	wp_safe_redirect( admin_url( 'admin.php?page=vcc-' . $slug . '&saved=1' ) );
	exit;
} );
