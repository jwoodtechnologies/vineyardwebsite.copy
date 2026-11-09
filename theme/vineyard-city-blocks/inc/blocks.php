<?php
/**
 * The theme's own blocks. Each one shows live information (sub-pages, the page trail, calendar events),
 * so it is drawn by the server; everything around them is ordinary editable blocks.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** The page being shown, or (in the editor preview) the page being edited. */
function vcb_current_id() {
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST && ! empty( $_GET['post_id'] ) ) { // phpcs:ignore
		return (int) $_GET['post_id']; // phpcs:ignore
	}
	$id = get_the_ID();
	return $id ? (int) $id : (int) get_queried_object_id();
}

function vcb_is_preview() {
	return defined( 'REST_REQUEST' ) && REST_REQUEST;
}

add_action( 'init', function () {
	wp_register_script( 'vcb-editor-blocks', get_theme_file_uri( 'assets/js/editor-blocks.js' ), array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-server-side-render', 'wp-data', 'wp-i18n' ), VCB_VERSION, true );

	register_block_type( 'vineyard/related-pages', array(
		'api_version'     => 3,
		'title'           => 'Related Pages',
		'category'        => 'theme',
		'icon'            => 'list-view',
		'description'     => 'Blue list of related pages. Shows the menu picked for this page, or its sub-pages.',
		'editor_script'   => 'vcb-editor-blocks',
		'attributes'      => array(
			'title' => array( 'type' => 'string', 'default' => 'Related Pages' ),
			'menu'  => array( 'type' => 'string', 'default' => '' ), // '' = this page's sub-pages, 'none', or a menu ID
		),
		'supports'        => array( 'html' => false ),
		'render_callback' => 'vcb_render_related_pages',
	) );
	register_block_type( 'vineyard/breadcrumbs', array(
		'api_version'     => 3,
		'title'           => 'Breadcrumbs',
		'category'        => 'theme',
		'icon'            => 'arrow-right-alt2',
		'description'     => 'Home > Section > This page.',
		'editor_script'   => 'vcb-editor-blocks',
		'supports'        => array( 'html' => false ),
		'render_callback' => 'vcb_render_breadcrumbs',
	) );
	register_block_type( 'vineyard/events', array(
		'api_version'     => 3,
		'title'           => 'Upcoming Events',
		'category'        => 'widgets',
		'icon'            => 'calendar-alt',
		'description'     => 'Meetings, Community and Recreation tabs with a month calendar. Events are added under Vineyard Site > Events.',
		'editor_script'   => 'vcb-editor-blocks',
		'supports'        => array( 'html' => false, 'align' => array( 'wide', 'full' ) ),
		'render_callback' => 'vcb_render_events',
	) );
	register_block_type( 'vineyard/newsletter-form', array(
		'api_version'     => 3,
		'title'           => 'Newsletter Sign-up Box',
		'category'        => 'widgets',
		'icon'            => 'email',
		'description'     => 'Email box with a Go button.',
		'editor_script'   => 'vcb-editor-blocks',
		'attributes'      => array(
			'placeholder' => array( 'type' => 'string', 'default' => 'Your information here...' ),
			'button'      => array( 'type' => 'string', 'default' => 'Go' ),
			'action'      => array( 'type' => 'string', 'default' => '/community/newsletters/' ),
		),
		'supports'        => array( 'html' => false ),
		'render_callback' => 'vcb_render_newsletter_form',
	) );
} );

function vcb_render_related_pages( $atts ) {
	$id  = vcb_current_id();
	$sel = isset( $atts['menu'] ) && '' !== $atts['menu'] ? ( 'none' === $atts['menu'] ? 'none' : (int) $atts['menu'] ) : 0;
	if ( ! $sel && function_exists( 'vcc_page_related' ) ) {
		$sel = vcc_page_related( $id ); // older pages: the choice saved on the page
	}
	$list = '';
	if ( 'none' !== $sel && $sel ) {
		$list = (string) wp_nav_menu( array( 'menu' => (int) $sel, 'container' => false, 'echo' => false, 'menu_id' => 'flyout', 'menu_class' => 'v08-30-2012', 'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>', 'walker' => new Vineyard_City_Flyout_Walker(), 'fallback_cb' => false ) );
	} elseif ( 'none' !== $sel && $id ) {
		$kids = get_pages( array( 'child_of' => $id, 'parent' => $id, 'sort_column' => 'menu_order,post_title' ) );
		if ( $kids ) {
			$list = '<ul id="flyout" class="v08-30-2012">';
			foreach ( $kids as $i => $k ) {
				$cur   = (int) $k->ID === $id ? ' current' : '';
				$list .= '<li class="menuLI level0' . ( 0 === $i ? ' first' : '' ) . $cur . '"><a class="menuA level0" href="' . esc_url( get_permalink( $k ) ) . '">' . esc_html( $k->post_title ) . '</a></li>';
			}
			$list .= '</ul>';
		}
	}
	if ( ! $list ) {
		return vcb_is_preview() ? '<nav id="flyout-wrap" class="vcb-related is-empty"><h2 id="flyout-header">' . esc_html( $atts['title'] ) . '</h2><p class="vcb-note">No related pages yet. Add sub-pages to this page, or pick a menu under Page > Related Pages.</p></nav>' : '';
	}
	$wrap = get_block_wrapper_attributes( array( 'id' => 'flyout-wrap', 'class' => 'vcb-related' ) );
	return '<nav ' . $wrap . ' aria-labelledby="flyout-header"><h2 id="flyout-header">' . esc_html( $atts['title'] ) . '</h2>' . $list . '</nav>';
}

function vcb_render_breadcrumbs() {
	$id    = vcb_current_id();
	$trail = function_exists( 'vcc_breadcrumbs' ) ? vcc_breadcrumbs( $id ) : array();
	if ( ! $trail ) {
		$trail = array( array( 'Home', home_url( '/' ) ) );
		foreach ( array_reverse( get_post_ancestors( $id ) ) as $a ) {
			$trail[] = array( get_the_title( $a ), get_permalink( $a ) );
		}
		$trail[] = array( get_the_title( $id ), '' );
	}
	$o = '<nav ' . get_block_wrapper_attributes( array( 'id' => 'breadcrumbs', 'class' => 'vcb-breadcrumbs' ) ) . ' aria-label="breadcrumb"><ul>';
	foreach ( $trail as $t ) {
		$o .= '<li>' . ( $t[1] ? '<a href="' . esc_url( $t[1] ) . '">' . esc_html( $t[0] ) . '</a> ' : esc_html( $t[0] ) ) . '</li>';
	}
	return $o . '</ul></nav>';
}

/** Events tabs + month calendar, from the plugin's Events list. The heading and button around it are normal blocks. */
function vcb_render_events() {
	if ( ! function_exists( 'vcc_upcoming_events' ) ) {
		return vcb_is_preview() ? '<p class="vcb-note">Turn on the Vineyard City Content plugin to show events.</p>' : '';
	}
	if ( ! vcb_is_preview() && function_exists( 'vcc_enqueue_calendar' ) ) {
		vcc_enqueue_calendar();
	}
	$tabs = array( 'meetings' => 'Meetings', 'community' => 'Community', 'recreation' => 'Recreation' );
	$o    = '<div ' . get_block_wrapper_attributes( array( 'id' => 'events-list', 'class' => 'vcb-events' ) ) . '><div id="events-tabs" class="events-buttons">';
	$i    = 0;
	foreach ( $tabs as $name ) {
		$o .= '<button type="button" class="tab' . ( 0 === $i++ ? ' active' : '' ) . '">' . esc_html( $name ) . '</button>';
	}
	$o .= '</div><div id="mini-events"><div id="tabContent" class="events-content">';
	$i  = 0;
	foreach ( $tabs as $slug => $name ) {
		$o .= '<div class="tab-event' . ( 0 === $i++ ? ' active' : '' ) . '"><div class="mini-calendar" data-calendar="' . esc_attr( $slug ) . '"></div><div class="mini-events-list" data-list-length="4" data-calendar="' . esc_attr( $slug ) . '">';
		$ev = vcc_upcoming_events( 4, $slug );
		foreach ( $ev as $e ) {
			$o .= '<div class="cal-event"><div class="cal-content" data-href="' . esc_url( $e['url'] ) . '" tabindex="0" role="link"><div><time>' . esc_html( $e['month'] ) . '<span>' . esc_html( $e['day'] ) . '</span></time></div>'
				. '<strong class="cal-event-title">' . esc_html( html_entity_decode( $e['title'], ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ) . ( 'recreation' !== $slug && $e['desc_short'] ? '<span class="cal-event-desc">' . esc_html( $e['desc_short'] ) . '</span>' : '' ) . '</strong></div></div>';
		}
		if ( ! $ev ) {
			$o .= '<p class="vcb-no-events">No upcoming ' . esc_html( strtolower( $name ) ) . ' events.</p>';
		}
		$o .= '</div></div>';
	}
	return $o . '</div></div></div>';
}

function vcb_render_newsletter_form( $atts ) {
	$action = function_exists( 'vcc_url' ) ? vcc_url( $atts['action'] ) : home_url( '/' . ltrim( $atts['action'], '/' ) );
	return '<div ' . get_block_wrapper_attributes( array( 'id' => 'newsletter-form', 'class' => 'vcb-newsletter-form' ) ) . '><form class="newsletter-form" method="get" action="' . esc_url( $action ) . '">'
		. '<input name="newsletter" class="form-control newsletter-input" placeholder="' . esc_attr( $atts['placeholder'] ) . '" type="search" aria-label="' . esc_attr( $atts['placeholder'] ) . '"><button>' . esc_html( $atts['button'] ) . '</button></form></div>';
}
