<?php
/** What visitors see: events, quick links, photo tiles, social, newsletter, alerts – as blocks any page can contain. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ------------------------------------------------------------------ events data */
function vcc_cat_color( $slug ) {
	$map = array( 'meetings' => '#114a76', 'recreation' => '#087968', 'community' => '#fcb215', 'utilities' => '#4e606f', 'library' => '#cc3232' );
	$t   = get_term_by( 'slug', $slug, 'vc_event_cat' );
	$c   = $t ? get_term_meta( $t->term_id, 'vcc_color', true ) : '';
	return $c ? $c : ( isset( $map[ $slug ] ) ? $map[ $slug ] : '#3788d8' );
}

function vcc_event_data( $id ) {
	$p     = get_post( $id );
	$start = get_post_meta( $id, '_vcc_start', true );
	$end   = get_post_meta( $id, '_vcc_end', true );
	$all   = (bool) get_post_meta( $id, '_vcc_all_day', true );
	$ts    = $start ? strtotime( $start ) : 0;
	$terms = wp_get_post_terms( $id, 'vc_event_cat' );
	$cats  = is_wp_error( $terms ) ? array() : wp_list_pluck( $terms, 'slug' );
	$desc  = trim( preg_replace( '/\s+/', ' ', wp_strip_all_tags( str_replace( '>', '> ', strip_shortcodes( $p->post_content ) ) ) ) );
	$time  = $all || ! $ts ? '' : date_i18n( 'g:i a', $ts ) . ( $end ? ' – ' . date_i18n( 'g:i a', strtotime( $end ) ) : '' );
	return array(
		'id' => $id, 'title' => get_the_title( $id ), 'url' => get_permalink( $id ), 'start' => $start, 'end' => $end, 'all_day' => $all, 'location' => get_post_meta( $id, '_vcc_location', true ),
		'desc_html' => $p->post_content, 'desc_short' => mb_strlen( $desc ) > 120 ? mb_substr( $desc, 0, 120 ) . '…' : $desc, 'cats' => $cats,
		'color' => $cats ? vcc_cat_color( $cats[0] ) : '#3788d8',
		'month' => $ts ? strtoupper( date_i18n( 'M', $ts ) ) : '', 'day' => $ts ? date_i18n( 'j', $ts ) : '', 'time' => $time,
		'when_long' => $ts ? date_i18n( 'l, F j, Y', $ts ) . ( $time ? ' · ' . $time : '' ) : '',
	);
}

/** Upcoming events (today or later), soonest first. $cat = category slug or ''. */
function vcc_upcoming_events( $limit = 4, $cat = '' ) {
	$args = array( 'post_type' => 'vc_event', 'post_status' => 'publish', 'numberposts' => $limit, 'meta_key' => '_vcc_start', 'orderby' => 'meta_value', 'order' => 'ASC',
		'meta_query' => array( array( 'key' => '_vcc_start', 'value' => current_time( 'Y-m-d' ) . ' 00:00:00', 'compare' => '>=', 'type' => 'DATETIME' ) ), 'suppress_filters' => false );
	if ( $cat ) {
		$args['tax_query'] = array( array( 'taxonomy' => 'vc_event_cat', 'field' => 'slug', 'terms' => $cat ) );
	}
	$list = array_map( function ( $p ) { return vcc_event_data( $p->ID ); }, get_posts( $args ) );
	usort( $list, function ( $a, $b ) { // soonest day first; on the same day timed events before all-day ones
		return array( substr( $a['start'], 0, 10 ), (int) $a['all_day'], $a['start'] ) <=> array( substr( $b['start'], 0, 10 ), (int) $b['all_day'], $b['start'] );
	} );
	return $list;
}

/** JSON for the calendars: from 2 months ago to 18 months ahead. */
function vcc_calendar_json() {
	$from = date( 'Y-m-d', strtotime( '-2 months', current_time( 'timestamp' ) ) ) . ' 00:00:00'; // phpcs:ignore
	$posts = get_posts( array( 'post_type' => 'vc_event', 'post_status' => 'publish', 'numberposts' => 500, 'meta_key' => '_vcc_start', 'orderby' => 'meta_value', 'order' => 'ASC',
		'meta_query' => array( array( 'key' => '_vcc_start', 'value' => $from, 'compare' => '>=', 'type' => 'DATETIME' ) ) ) );
	$out = array();
	foreach ( $posts as $p ) {
		$e = vcc_event_data( $p->ID );
		if ( ! $e['start'] ) { continue; }
		$out[] = array( 'id' => $e['id'], 'title' => $e['title'], 'url' => $e['url'], 'start' => str_replace( ' ', 'T', $e['start'] ), 'end' => $e['end'] ? str_replace( ' ', 'T', $e['end'] ) : null,
			'allDay' => $e['all_day'], 'color' => $e['color'], 'cats' => $e['cats'] );
	}
	return $out;
}

function vcc_enqueue_calendar() {
	static $done = false;
	if ( $done ) { return; }
	$done = true;
	wp_enqueue_style( 'vcc-fc-core', VCC_URL . 'assets/fullcalendar/core.css', array(), VCC_VERSION );
	wp_enqueue_style( 'vcc-fc-daygrid', VCC_URL . 'assets/fullcalendar/daygrid.css', array( 'vcc-fc-core' ), VCC_VERSION );
	wp_enqueue_script( 'vcc-fc-core', VCC_URL . 'assets/fullcalendar/core.min.js', array(), VCC_VERSION, true );
	wp_enqueue_script( 'vcc-fc-daygrid', VCC_URL . 'assets/fullcalendar/daygrid.min.js', array( 'vcc-fc-core' ), VCC_VERSION, true );
	wp_enqueue_script( 'vcc-events', VCC_URL . 'assets/events.js', array( 'vcc-fc-daygrid' ), VCC_VERSION, true );
	wp_add_inline_script( 'vcc-events', 'window.vccEvents=' . wp_json_encode( vcc_calendar_json() ) . ';', 'before' );
}

/* ------------------------------------------------------------------ section renderers */
function vcc_render_events() {
	vcc_enqueue_calendar();
	$tabs = array( 'meetings' => 'Meetings', 'community' => 'Community', 'recreation' => 'Recreation' );
	$o  = '<section id="events"><div class="container"><h2 class="section-header"><span>' . esc_html( vcc_opt( 'events_small' ) ) . '</span> ' . esc_html( vcc_opt( 'events_title' ) ) . '</h2>';
	$o .= '<div id="events-list"><div id="events-tabs" class="events-buttons">';
	$i = 0;
	foreach ( $tabs as $slug => $name ) { $o .= '<button type="button" class="tab' . ( 0 === $i++ ? ' active' : '' ) . '">' . esc_html( $name ) . '</button>'; }
	$o .= '</div><div id="mini-events" data-template-file="template.html"><div id="tabContent" class="events-content">';
	$i = 0;
	foreach ( $tabs as $slug => $name ) {
		$o .= '<div class="tab-event' . ( 0 === $i++ ? ' active' : '' ) . '"><div class="mini-calendar" data-calendar="' . esc_attr( $slug ) . '"></div><div class="mini-events-list" data-list-length="4" data-calendar="' . esc_attr( $slug ) . '">';
		foreach ( vcc_upcoming_events( 4, $slug ) as $e ) {
			$o .= '<div class="cal-event"><div class="cal-content" data-href="' . esc_url( $e['url'] ) . '" tabindex="0" role="link"><div><time>' . esc_html( $e['month'] ) . '<span>' . esc_html( $e['day'] ) . '</span></time></div>'
				. '<strong class="cal-event-title">' . esc_html( $e['title'] ) . ( 'recreation' !== $slug && $e['desc_short'] ? '<span class="cal-event-desc">' . esc_html( $e['desc_short'] ) . '</span>' : '' ) . '</strong></div></div>';
		}
		$o .= '</div></div>';
	}
	$o .= '</div></div></div><a href="' . esc_url( vcc_url( vcc_opt( 'events_button_url' ) ) ) . '" class="button section-link">' . esc_html( vcc_opt( 'events_button_label' ) ) . '</a></div></section>';
	return $o;
}

function vcc_link_of( $id ) {
	$url = get_post_meta( $id, '_vcc_url', true );
	if ( ! $url ) {
		$pid = (int) get_post_meta( $id, '_vcc_page', true );
		$url = $pid ? get_permalink( $pid ) : '';
	}
	return $url ? $url : '#';
}

function vcc_render_quick_links() {
	$posts = get_posts( array( 'post_type' => 'vc_quicklink', 'post_status' => 'publish', 'numberposts' => 30, 'orderby' => 'menu_order title', 'order' => 'ASC' ) );
	if ( ! $posts ) { return ''; }
	$o = '<section id="quick-links"><div class="container"><div id="quicklinks-inner"><ul class="tiny-carousel">';
	foreach ( $posts as $p ) {
		$nt  = get_post_meta( $p->ID, '_vcc_new_tab', true );
		$t2  = get_post_meta( $p->ID, '_vcc_title2', true );
		$img = get_the_post_thumbnail_url( $p->ID, 'full' );
		$o  .= '<li class="tiny-item"><a href="' . esc_url( vcc_link_of( $p->ID ) ) . '" target="' . ( $nt ? '_blank' : '_self' ) . '"' . ( $nt ? ' rel="noopener"' : '' ) . ' class="qlink">'
			. ( $img ? '<img src="' . esc_url( $img ) . '" class="qlink-icon" alt="">' : '' )
			. '<strong class="qlink-title equal">' . esc_html( $p->post_title ) . ( $t2 ? '<br> ' . esc_html( $t2 ) : '' ) . '</strong></a></li>';
	}
	return $o . '</ul></div></div></section>';
}

function vcc_render_tiles() {
	$posts = get_posts( array( 'post_type' => 'vc_tile', 'post_status' => 'publish', 'numberposts' => 12, 'orderby' => 'menu_order title', 'order' => 'ASC' ) );
	if ( ! $posts ) { return ''; }
	$o = '<section id="subsites"><div id="subsites-inner">';
	foreach ( $posts as $p ) {
		$nt = get_post_meta( $p->ID, '_vcc_new_tab', true );
		$img = get_the_post_thumbnail_url( $p->ID, 'full' );
		$o .= '<a href="' . esc_url( vcc_link_of( $p->ID ) ) . '" target="' . ( $nt ? '_blank' : '_self' ) . '"' . ( $nt ? ' rel="noopener"' : '' ) . ' class="subsite-link"' . ( $img ? ' style="background:url(\'' . esc_url( $img ) . '\') center no-repeat;background-size:cover"' : '' ) . '><h3 class="subsite-name equal"><span>' . esc_html( $p->post_title ) . '</span></h3></a>';
	}
	return $o . '</div></section>';
}

function vcc_render_social() {
	$nets = array( 'facebook' => 'Facebook', 'instagram' => 'Instagram', 'twitter' => 'X / Twitter' );
	$links = '';
	foreach ( $nets as $k => $label ) {
		$u = vcc_opt( $k );
		if ( ! $u ) { continue; }
		$icon = apply_filters( 'vcc_social_icon', '', $k );
		$links .= '<a href="' . esc_url( $u ) . '" class="social-link ' . esc_attr( $k ) . '" target="_blank" rel="noopener">' . ( $icon ? '<img src="' . esc_url( $icon ) . '" alt="' . esc_attr( $label ) . '">' : esc_html( $label ) ) . '</a>';
	}
	return '<section id="social"><div class="container"><h2 class="section-header"><span>' . esc_html( vcc_opt( 'social_small' ) ) . '</span> ' . esc_html( vcc_opt( 'social_title' ) ) . '</h2><div id="social-wrapper">' . $links . '</div></div></section>';
}

function vcc_render_newsletter() {
	$shape = apply_filters( 'vcc_newsletter_shape', '' );
	return '<section id="newsletter"><div class="container"><div class="section-inner"><div class="row"><div class="col-lg-6"><div id="newsletter-left">'
		. ( $shape ? '<img src="' . esc_url( $shape ) . '" class="newsletter-shape" alt="">' : '' )
		. '<h2 class="section-header"><span>' . esc_html( vcc_opt( 'newsletter_small' ) ) . '</span> ' . esc_html( vcc_opt( 'newsletter_title' ) ) . '</h2></div></div>'
		. '<div class="col-lg-6"><div id="newsletter-form"><form class="newsletter-form" method="get" action="' . esc_url( vcc_url( vcc_opt( 'newsletter_action' ) ) ) . '">'
		. '<input name="newsletter" class="form-control newsletter-input" placeholder="' . esc_attr( vcc_opt( 'newsletter_placeholder' ) ) . '" type="search" id="newsletter-input" aria-label="' . esc_attr( vcc_opt( 'newsletter_title' ) ) . '"><button>' . esc_html( vcc_opt( 'newsletter_button' ) ) . '</button></form></div></div></div></div></div></section>';
}

/** Full calendar page: category filters, month grid, then the list of upcoming events. */
function vcc_render_events_calendar() {
	vcc_enqueue_calendar();
	$o = '<div class="vcc-calendar-page"><ul class="clearfix" id="calendar-filters"><li class="calendar-tab-filter-all"><a class="calendar-tab-filter" data-calendar-id="clear" href="#">Show All</a></li>';
	foreach ( get_terms( array( 'taxonomy' => 'vc_event_cat', 'hide_empty' => false ) ) as $t ) {
		$c = vcc_cat_color( $t->slug );
		$o .= '<li style="background-color:' . esc_attr( $c ) . ';border:1px solid ' . esc_attr( $c ) . '"><a class="calendar-name-filter" data-calendar-id="' . esc_attr( $t->slug ) . '" href="#">' . esc_html( $t->name ) . '</a></li>';
	}
	$o .= '</ul><div class="vcc-full-calendar" id="vcc-full-calendar"></div><h2 class="vcc-upcoming-title">Upcoming events</h2><ul class="vcc-upcoming">';
	$ev = vcc_upcoming_events( 100 );
	foreach ( $ev as $e ) {
		$o .= '<li class="vcc-upcoming-item" data-cats="' . esc_attr( implode( ' ', $e['cats'] ) ) . '"><a href="' . esc_url( $e['url'] ) . '"><strong>' . esc_html( $e['title'] ) . '</strong></a><br><span>' . esc_html( $e['when_long'] ) . ( $e['location'] ? ' · ' . esc_html( $e['location'] ) : '' ) . '</span></li>';
	}
	if ( ! $ev ) { $o .= '<li>No upcoming events right now. Please check back soon.</li>'; }
	return $o . '</ul></div>';
}

/* ------------------------------------------------------------------ blocks (no code needed: Add block → "Vineyard") */
add_filter( 'block_categories_all', function ( $cats ) {
	array_unshift( $cats, array( 'slug' => 'vineyard', 'title' => 'Vineyard City' ) );
	return $cats;
} );
function vcc_blocks() {
	return array(
		'quick-links'     => array( 'Quick Links (row of icon tiles)', 'vcc_render_quick_links', 'Shows the Quick Links from Vineyard Site Content → Quick Links.' ),
		'events'          => array( 'Upcoming Events (home page)', 'vcc_render_events', 'Shows the next events with a small calendar. Add events under Vineyard Site Content → Events.' ),
		'photo-tiles'     => array( 'Photo Tiles (three big pictures)', 'vcc_render_tiles', 'Shows the Photo Tiles from Vineyard Site Content → Photo Tiles.' ),
		'social'          => array( 'Social Media Icons', 'vcc_render_social', 'Shows the social media links from Vineyard Site Content → Footer.' ),
		'newsletter'      => array( 'Newsletter Sign-up', 'vcc_render_newsletter', 'Shows the sign-up box. Words come from Vineyard Site Content → Home page.' ),
		'events-calendar' => array( 'Events Calendar and List', 'vcc_render_events_calendar', 'Shows a monthly calendar and the list of all upcoming events.' ),
	);
}
add_action( 'init', function () {
	wp_register_script( 'vcc-blocks', VCC_URL . 'assets/blocks.js', array( 'wp-blocks', 'wp-element', 'wp-server-side-render', 'wp-block-editor' ), VCC_VERSION, true );
	wp_localize_script( 'vcc-blocks', 'vccBlocks', array( 'blocks' => vcc_blocks() ) );
	foreach ( vcc_blocks() as $slug => $b ) {
		$cb = $b[1];
		register_block_type( 'vineyard-city-content/' . $slug, array( 'api_version' => 2, 'title' => $b[0], 'category' => 'vineyard', 'editor_script' => 'vcc-blocks', 'render_callback' => function () use ( $cb ) { return call_user_func( $cb ); } ) );
	}
} );

/* ------------------------------------------------------------------ alerts (shown on every page, any theme) */
add_action( 'wp_footer', function () {
	$today = current_time( 'Y-m-d' );
	$posts = get_posts( array( 'post_type' => 'vc_alert', 'post_status' => 'publish', 'numberposts' => 5, 'orderby' => 'date', 'order' => 'DESC' ) );
	$shown = array();
	foreach ( $posts as $p ) {
		$from = get_post_meta( $p->ID, '_vcc_from', true ); $until = get_post_meta( $p->ID, '_vcc_until', true );
		if ( ( $from && $today < $from ) || ( $until && $today > $until ) ) { continue; }
		$shown[] = $p;
	}
	if ( ! $shown ) { return; }
	wp_enqueue_script( 'vcc-front', VCC_URL . 'assets/front.js', array(), VCC_VERSION, true );
	wp_print_scripts( 'vcc-front' );
	foreach ( $shown as $p ) {
		$bl = get_post_meta( $p->ID, '_vcc_btn_label', true ); $bu = get_post_meta( $p->ID, '_vcc_btn_url', true );
		echo '<div class="floating-alert vcc-alert" role="alert" data-alert="' . (int) $p->ID . '"><button type="button" class="close vcc-alert-close" aria-label="Close alert">&times;</button><h2>' . esc_html( $p->post_title ) . '</h2><div class="vcc-alert-body">' . wp_kses_post( wpautop( $p->post_content ) ) . '</div>'
			. ( $bl && $bu ? '<a class="btn rz-btn vcc-alert-btn" href="' . esc_url( $bu ) . '">' . esc_html( $bl ) . '</a>' : '' ) . '</div>';
	}
}, 5 );

add_action( 'wp_enqueue_scripts', function () { // load the calendar files early (in the page head) when the page contains an events block
	if ( is_singular() && ( has_block( 'vineyard-city-content/events' ) || has_block( 'vineyard-city-content/events-calendar' ) ) ) {
		vcc_enqueue_calendar();
	}
}, 5 );
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'vcc-front', VCC_URL . 'assets/front.css', array(), VCC_VERSION );
} );
