<?php
/** What visitors see: events, quick links, photo tiles, social, newsletter, alerts – as blocks any page can contain. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ------------------------------------------------------------------ events data */
/**
 * Plain text for titles/descriptions: WordPress returns titles "texturized" (& → &#038;, ' → &#8217;), which is right for
 * HTML but shows as "&#038;" once a script inserts it as text (the calendar). Decode ONCE here; every output escapes it again
 * (esc_html / esc_attr in PHP, the calendar library escapes titles itself).
 */
function vcc_plain_text( $s ) {
	$s = html_entity_decode( wp_strip_all_tags( (string) $s ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	return trim( preg_replace( '/[\s\x{00A0}]+/u', ' ', $s ) );
}

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
	$desc  = vcc_plain_text( str_replace( '>', '> ', strip_shortcodes( $p->post_content ) ) );
	$time  = $all || ! $ts ? '' : date_i18n( 'g:i a', $ts ) . ( $end ? ' – ' . date_i18n( 'g:i a', strtotime( $end ) ) : '' );
	return array(
		'id' => $id, 'title' => vcc_plain_text( get_the_title( $id ) ), 'url' => get_permalink( $id ), 'start' => $start, 'end' => $end, 'all_day' => $all, 'location' => vcc_plain_text( get_post_meta( $id, '_vcc_location', true ) ),
		'desc_html' => $p->post_content, 'desc_short' => mb_strlen( $desc ) > 120 ? rtrim( mb_substr( $desc, 0, 120 ) ) . '…' : $desc, 'cats' => $cats,
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
	wp_add_inline_script( 'vcc-events', 'window.vccEvents=' . wp_json_encode( vcc_calendar_json(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE ) . ';', 'before' );
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

/* ------------------------------------------------------------------ alerts (shown on every page, any theme) */
function vcc_current_alerts() {
	$today = current_time( 'Y-m-d' );
	$posts = get_posts( array( 'post_type' => 'vc_alert', 'post_status' => 'publish', 'numberposts' => 5, 'orderby' => 'date', 'order' => 'DESC' ) );
	return array_values( array_filter( $posts, function ( $p ) use ( $today ) {
		$from = get_post_meta( $p->ID, '_vcc_from', true ); $until = get_post_meta( $p->ID, '_vcc_until', true );
		return ! ( ( $from && $today < $from ) || ( $until && $today > $until ) );
	} ) );
}

function vcc_alerts_html( $posts ) {
	$o = '';
	foreach ( $posts as $p ) {
		$bl = get_post_meta( $p->ID, '_vcc_btn_label', true ); $bu = get_post_meta( $p->ID, '_vcc_btn_url', true );
		$o .= '<div class="floating-alert vcc-alert" role="alert" data-alert="' . (int) $p->ID . '"><button type="button" class="close vcc-alert-close" aria-label="Close alert">&times;</button><h2>' . esc_html( $p->post_title ) . '</h2><div class="vcc-alert-body">' . wp_kses_post( wpautop( $p->post_content ) ) . '</div>'
			. ( $bl && $bu ? '<a class="btn rz-btn vcc-alert-btn" href="' . esc_url( $bu ) . '">' . esc_html( $bl ) . '</a>' : '' ) . '</div>';
	}
	return $o;
}

/** "Alerts" block: where it sits on a page decides whether that page shows alerts (they still float in the corner). */
function vcc_render_alerts_block() {
	$posts = vcc_current_alerts();
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) { // editor preview
		if ( ! $posts ) { return '<div class="vcc-preview-empty">No alert is showing right now. When you publish one under Vineyard Site Content → Alerts, it appears in the corner of every page.</div>'; }
		return '<div class="vcc-alert-preview">' . vcc_alerts_html( $posts ) . '</div>';
	}
	$GLOBALS['vcc_alerts_done'] = true;
	if ( ! $posts ) { return ''; }
	wp_enqueue_script( 'vcc-front', VCC_URL . 'assets/front.js', array(), VCC_VERSION, true );
	return vcc_alerts_html( $posts );
}

/** Every other page shows alerts automatically. The home page shows them where its "Alerts" block is (none if removed). */
add_action( 'wp_footer', function () {
	if ( ! empty( $GLOBALS['vcc_alerts_done'] ) ) { return; }
	$front = (int) get_option( 'page_on_front' );
	if ( is_front_page() && $front && has_block( 'vineyard-city-content/home-banner', $front ) && ! has_block( 'vineyard-city-content/alerts', $front ) ) { return; } // removed by the clerk
	$posts = vcc_current_alerts();
	if ( ! $posts ) { return; }
	wp_enqueue_script( 'vcc-front', VCC_URL . 'assets/front.js', array(), VCC_VERSION, true );
	wp_print_scripts( 'vcc-front' );
	echo vcc_alerts_html( $posts ); // phpcs:ignore
}, 5 );

/** "Home Banner" block: the big photo (the front page's Featured Image), the logo over it and the button. */
function vcc_render_home_banner() {
	$front = (int) get_option( 'page_on_front' );
	$photo = $front ? get_the_post_thumbnail_url( $front, 'full' ) : '';
	$photo = $photo ? $photo : (string) apply_filters( 'vcc_default_image', '', 'hero_photo' );
	$mask  = (string) apply_filters( 'vcc_banner_mask', '' );
	$logo  = vcc_image( 'hero_logo' );
	$label = vcc_opt( 'hero_button_label' );
	$bg    = "background:url('" . esc_url( $photo ) . "') center no-repeat;background-size:cover";
	$edit  = defined( 'REST_REQUEST' ) && REST_REQUEST; // the editor preview cannot run the slider script: show the photo directly
	return '<section id="slider" class="tiny-slider-wrap"><ul class="tiny-slider"><li class="tiny-item"><div class="tns-lazy-img tns-bg-slide" data-style="' . esc_attr( $bg ) . '"' . ( $edit ? ' style="' . esc_attr( $bg ) . '"' : '' ) . '></div></li></ul>'
		. ( $mask ? '<img src="' . esc_url( $mask ) . '" class="slider-mask" alt="">' : '' )
		. ( $logo ? '<img src="' . esc_url( $logo ) . '" id="slider-logo" alt="' . esc_attr( get_bloginfo( 'name' ) ) . '">' : '' )
		. ( $label ? '<a href="' . esc_url( vcc_url( vcc_opt( 'hero_button_url' ) ) ) . '" class="slider-button-link"><span class="btn slider-button">' . esc_html( $label ) . '</span></a>' : '' )
		. '</section>';
}

add_action( 'wp_enqueue_scripts', function () { // load the calendar files early (in the page head) when the page contains an events block
	if ( is_singular() && ( has_block( 'vineyard-city-content/events' ) || has_block( 'vineyard-city-content/events-calendar' ) ) ) {
		vcc_enqueue_calendar();
	}
}, 5 );
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'vcc-front', VCC_URL . 'assets/front.css', array(), VCC_VERSION );
} );
