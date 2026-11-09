<?php
/** Helpers. Content comes from the companion plugin when it is active; sensible built-in defaults otherwise. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function vcity_files_url( $path ) {
	return function_exists( 'vcc_file_url' ) ? vcc_file_url( $path ) : content_url( 'themes/vineyard/files/' . implode( '/', array_map( 'rawurlencode', explode( '/', $path ) ) ) );
}
function vcity_asset( $path ) {
	return get_template_directory_uri() . '/_assets_/' . ltrim( $path, '/' );
}

function vcity_defaults() {
	return array( 'search_placeholder' => 'Search ...', 'phone' => '801.226.1929', 'address_line1' => '125 S Main Street', 'address_line2' => 'Vineyard, UT', 'address_link' => 'https://goo.gl/maps/cw4EoARDeM4t7DYr5',
		'hours_line1' => 'Monday - Thursday: 8am – 5pm', 'hours_line2' => 'Friday: 8am – 12pm', 'copyright' => '© Vineyard UT', 'hero_button_label' => 'Transparency Portal', 'hero_button_url' => '/transparency-portal/' );
}
function vcity_opt( $key ) {
	if ( function_exists( 'vcc_opt' ) ) { return vcc_opt( $key ); }
	$d = vcity_defaults();
	return isset( $d[ $key ] ) ? $d[ $key ] : '';
}
function vcity_url( $u ) {
	return function_exists( 'vcc_url' ) ? vcc_url( $u ) : ( preg_match( '#^(https?:)?//#', (string) $u ) ? $u : home_url( '/' . ltrim( (string) $u, '/' ) ) );
}
/** Image setting: plugin's saved picture, else the original one. */
function vcity_image( $key ) {
	$url = function_exists( 'vcc_image' ) ? vcc_image( $key ) : '';
	return $url ? $url : vcity_default_image( '', $key );
}
function vcity_default_image( $url, $key ) {
	$map = array(
		'logo' => vcity_asset( 'images/logo.png' ), 'footer_logo' => vcity_asset( 'images/footer-logo.png' ),
		'hero_logo' => vcity_files_url( 'revize_photo_gallery/slider-logo.png' ),
		'hero_photo' => vcity_files_url( 'links/Vineyard City Sunset_KendallBowman - Copy.jpg' ),
		'menu_image_2' => vcity_files_url( 'revize_photo_gallery/_DSC4715 - Copy.jpg' ), 'menu_image_3' => vcity_files_url( 'Headshots/IMG_1037 - Copy.jpg' ),
	);
	return isset( $map[ $key ] ) ? $map[ $key ] : $url;
}
add_filter( 'vcc_default_image', 'vcity_default_image', 10, 2 );
add_filter( 'vcc_social_icon', function ( $u, $net ) { return vcity_asset( 'images/' . $net . '-icon.png' ); }, 10, 2 );
add_filter( 'vcc_banner_mask', function () { return vcity_asset( 'images/slider-mask.png' ); } );
add_filter( 'vcc_newsletter_shape', function () { return vcity_asset( 'images/newsletter-shape.png' ); } );

/** Banner picture of an inner page = its Featured Image (falls back to the original default banner). */
function vcity_banner_url( $id ) {
	$u = $id ? get_the_post_thumbnail_url( $id, 'full' ) : '';
	return $u ? $u : vcity_asset( 'images/nav-img.jpg' );
}

/** Home page hero photo = the Home page's Featured Image. */
function vcity_hero_url() {
	$id = (int) get_option( 'page_on_front' );
	$u  = $id ? get_the_post_thumbnail_url( $id, 'full' ) : '';
	return $u ? $u : vcity_files_url( 'links/Vineyard City Sunset_KendallBowman - Copy.jpg' );
}

/** "Related Pages" list: the menu chosen on the page, or (automatic) the page's sub-pages. Returns HTML or ''. */
function vcity_related_pages( $id ) {
	$sel = function_exists( 'vcc_page_related' ) ? vcc_page_related( $id ) : 0;
	if ( 'none' === $sel ) { return ''; }
	if ( $sel ) {
		return (string) wp_nav_menu( array( 'menu' => (int) $sel, 'container' => false, 'echo' => false, 'menu_id' => 'flyout', 'menu_class' => 'v08-30-2012', 'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>', 'walker' => new Vineyard_City_Flyout_Walker(), 'fallback_cb' => false ) );
	}
	$kids = get_pages( array( 'child_of' => $id, 'parent' => $id, 'sort_column' => 'menu_order,post_title' ) );
	if ( ! $kids ) { return ''; }
	$o = '<ul id="flyout" class="v08-30-2012">';
	foreach ( $kids as $i => $k ) {
		$o .= '<li class="menuLI level0 menuSelectedChild' . ( 0 === $i ? ' first' : '' ) . '" id="li-' . (int) $k->ID . '"><a class="menuA level0 menuSelectedChild' . ( 0 === $i ? ' first' : '' ) . '" href="' . esc_url( get_permalink( $k ) ) . '">' . esc_html( $k->post_title ) . '</a></li>';
	}
	return $o . '</ul>';
}

function vcity_breadcrumbs( $id ) {
	$trail = function_exists( 'vcc_breadcrumbs' ) ? vcc_breadcrumbs( $id ) : array( array( 'Home', home_url( '/' ) ), array( get_the_title( $id ), '' ) );
	$o = '<ul>';
	foreach ( $trail as $t ) {
		$o .= '<li>' . ( $t[1] ? '<a href="' . esc_url( $t[1] ) . '">' . esc_html( $t[0] ) . '</a> ' : esc_html( $t[0] ) ) . '</li>';
	}
	return $o . '</ul>';
}

/** Inner page (shared by page.php and template-fullwidth.php). */
function vcity_render_inner( $sidebar ) {
	while ( have_posts() ) {
		the_post();
		$id = get_the_ID();
		?>
<section id="slider" class="tiny-slider-wrap" role="complementary" aria-label="page banner">
	<ul class="tiny-slider"><li class="tiny-item"><div class="tns-lazy-img tns-bg-slide" data-style="background:url('<?php echo esc_url( vcity_banner_url( $id ) ); ?>') center no-repeat;background-size:cover"></div></li></ul>
	<h2 id="inner-caption" class="container"><?php the_title(); ?></h2>
</section>
<main id="main">
	<div class="container">
		<?php if ( $sidebar ) : ?>
		<div class="row">
			<aside class="col-lg-3">
				<?php $rel = vcity_related_pages( $id ); if ( $rel ) : ?>
				<nav id="flyout-wrap" aria-labelledby="flyout-header"><h2 id="flyout-header">Related Pages</h2><?php echo $rel; // phpcs:ignore ?></nav>
				<?php endif; ?>
				<?php $c = function_exists( 'vcc_page_contact' ) ? vcc_page_contact( $id ) : null; if ( $c ) : ?>
				<div id="contact-box">
					<?php if ( $c['title'] ) : ?><h2 class="box-header"><?php echo esc_html( $c['title'] ); ?></h2><?php endif; ?>
					<?php if ( $c['text'] ) : ?><p class="contact-details"><?php echo esc_html( $c['text'] ); ?></p><?php endif; ?>
					<?php if ( $c['phone'] ) : ?><a href="<?php echo esc_attr( $c['phone_href'] ); ?>" class="contact-link"><?php echo esc_html( $c['phone'] ); ?></a><?php endif; ?>
				</div>
				<?php endif; ?>
				<?php if ( is_active_sidebar( 'page-sidebar' ) ) { dynamic_sidebar( 'page-sidebar' ); } ?>
			</aside>
			<div class="col-lg-9">
		<?php endif; ?>
				<div id="entry">
					<nav id="breadcrumbs" aria-label="breadcrumb"><?php echo vcity_breadcrumbs( $id ); // phpcs:ignore ?></nav>
					<div id="freeform-main">
						<h1 id="page-title"><?php the_title(); ?></h1>
						<?php $btns = function_exists( 'vcc_page_buttons' ) ? vcc_page_buttons( $id ) : array(); ?>
						<div id="inner-buttons">
							<?php foreach ( $btns as $b ) : ?><a href="<?php echo esc_url( $b['url'] ); ?>" target="<?php echo $b['new_tab'] ? '_blank' : '_self'; ?>"<?php echo $b['new_tab'] ? ' rel="noopener"' : ''; ?><?php echo ! empty( $b['icon'] ) ? ' style="justify-content:center;display:flex;flex-direction:column;text-align:center"' : ''; ?>><?php if ( ! empty( $b['icon'] ) ) : ?><img class="qlink-icon" src="<?php echo esc_url( vcity_asset( 'images/qlink-1.png' ) ); ?>" alt=""><?php endif; ?><?php echo esc_html( $b['label'] ); ?></a><?php endforeach; ?>
						</div>
						<div id="post" class="clearfix"><?php the_content(); ?></div>
					</div>
				</div>
		<?php if ( $sidebar ) : ?>
			</div>
		</div>
		<?php endif; ?>
	</div>
</main>
		<?php
	}
}
