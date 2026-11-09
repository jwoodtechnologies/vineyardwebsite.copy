<?php
/**
 * Title: Home page sections
 * Slug: vineyard-city/home
 * Categories: vineyard
 * Post Types: page
 * Description: Banner, quick links, upcoming events, photo tiles, social media and newsletter.
 */
$opt   = function ( $k, $d ) { return function_exists( 'vcc_opt' ) && '' !== (string) vcc_opt( $k ) ? (string) vcc_opt( $k ) : $d; };
$url   = function ( $u ) { return function_exists( 'vcc_url' ) ? vcc_url( $u ) : home_url( '/' . ltrim( (string) $u, '/' ) ); };
$link  = function ( $id ) { return function_exists( 'vcc_link_of' ) ? vcc_link_of( $id ) : '#'; };
$e     = 'esc_html';
$front = (int) get_option( 'page_on_front' );
$hero  = $front ? get_the_post_thumbnail_url( $front, 'full' ) : '';
$hero  = $hero ? $hero : (string) apply_filters( 'vcc_default_image', '', 'hero_photo' );
$hero  = $hero ? $hero : vcb_asset( 'images/nav-img.jpg' );
$logo  = function_exists( 'vcc_image' ) ? vcc_image( 'hero_logo' ) : '';
$logo  = $logo ? $logo : vcb_asset( 'images/hero-logo.png' );
$qls   = get_posts( array( 'post_type' => 'vc_quicklink', 'post_status' => 'publish', 'numberposts' => 30, 'orderby' => 'menu_order title', 'order' => 'ASC' ) );
$tiles = get_posts( array( 'post_type' => 'vc_tile', 'post_status' => 'publish', 'numberposts' => 3, 'orderby' => 'menu_order title', 'order' => 'ASC' ) );
$widths = array( '37.5%', '25%', '37.5%' );
$target = function ( $id ) { return get_post_meta( $id, '_vcc_new_tab', true ) ? ' target="_blank" rel="noreferrer noopener"' : ''; };
$tattr  = function ( $id ) { return get_post_meta( $id, '_vcc_new_tab', true ) ? ',"linkTarget":"_blank","rel":"noreferrer noopener"' : ''; };
?>
<!-- wp:cover {"url":"<?php echo esc_url( $hero ); ?>","dimRatio":10,"overlayColor":"contrast","minHeight":780,"align":"full","className":"home-hero","layout":{"type":"constrained"}} -->
<div class="wp-block-cover alignfull home-hero" style="min-height:780px"><span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-10 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( $hero ); ?>" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:image {"width":"549px","sizeSlug":"full","align":"center","className":"hero-logo"} -->
<figure class="wp-block-image aligncenter size-full is-resized hero-logo"><img src="<?php echo esc_url( $logo ); ?>" alt="Vineyard, Stay Connected" style="width:549px"/></figure>
<!-- /wp:image -->

<!-- wp:buttons {"className":"hero-buttons","layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons hero-buttons"><!-- wp:button {"backgroundColor":"secondary","textColor":"contrast","width":100,"className":"hero-button"} -->
<div class="wp-block-button has-custom-width wp-block-button__width-100 hero-button"><a class="wp-block-button__link has-contrast-color has-secondary-background-color has-text-color has-background wp-element-button" href="<?php echo esc_url( $url( $opt( 'hero_button_url', '/transparency-portal/' ) ) ); ?>"><?php echo $e( $opt( 'hero_button_label', 'Transparency Portal' ) ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:cover -->

<!-- wp:group {"align":"full","className":"quick-links","backgroundColor":"primary","textColor":"base","layout":{"type":"constrained","contentSize":"1140px"}} -->
<div class="wp-block-group alignfull quick-links has-base-color has-primary-background-color has-text-color has-background"><!-- wp:group {"className":"quick-links__track","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"left"}} -->
<div class="wp-block-group quick-links__track"><?php foreach ( $qls as $q ) :
	$icon  = get_the_post_thumbnail_url( $q->ID, 'full' );
	$t2    = (string) get_post_meta( $q->ID, '_vcc_title2', true );
	$href  = esc_url( $link( $q->ID ) );
	$label = $e( $q->post_title ) . ( $t2 ? '<br>' . $e( $t2 ) : '' );
	?><!-- wp:group {"className":"qlink","layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-group qlink"><?php if ( $icon ) : ?><!-- wp:image {"width":"50px","sizeSlug":"full","linkDestination":"custom"<?php echo $tattr( $q->ID ); ?>,"className":"qlink-icon"} -->
<figure class="wp-block-image size-full is-resized qlink-icon"><a href="<?php echo $href; ?>"<?php echo $target( $q->ID ); ?>><img src="<?php echo esc_url( $icon ); ?>" alt="" style="width:50px"/></a></figure>
<!-- /wp:image -->

<?php endif; ?><!-- wp:paragraph {"align":"center","className":"qlink-title"} -->
<p class="has-text-align-center qlink-title"><a href="<?php echo $href; ?>"<?php echo $target( $q->ID ); ?>><?php echo $label; ?></a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<?php endforeach; ?></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","anchor":"events","className":"home-events","layout":{"type":"constrained","contentSize":"1170px"}} -->
<div class="wp-block-group alignfull home-events" id="events"><!-- wp:paragraph {"align":"center","className":"section-kicker"} -->
<p class="has-text-align-center section-kicker"><?php echo $e( $opt( 'events_small', 'CHECK OUT OUR' ) ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","className":"section-title"} -->
<h2 class="wp-block-heading has-text-align-center section-title"><?php echo $e( $opt( 'events_title', 'UPCOMING EVENTS' ) ); ?></h2>
<!-- /wp:heading -->

<!-- wp:vineyard/events /-->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"right"}} -->
<div class="wp-block-buttons"><!-- wp:button {"className":"section-link"} -->
<div class="wp-block-button section-link"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( $url( $opt( 'events_button_url', '/calendar/' ) ) ); ?>"><?php echo $e( $opt( 'events_button_label', 'See All Events' ) ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<?php if ( $tiles ) : ?><!-- wp:columns {"align":"full","className":"photo-tiles"} -->
<div class="wp-block-columns alignfull photo-tiles"><?php foreach ( $tiles as $i => $t ) :
	$img = get_the_post_thumbnail_url( $t->ID, 'full' );
	$img = $img ? $img : vcb_default_banner();
	$w   = $widths[ $i % 3 ];
	?><!-- wp:column {"width":"<?php echo $w; ?>"} -->
<div class="wp-block-column" style="flex-basis:<?php echo $w; ?>"><!-- wp:cover {"url":"<?php echo esc_url( $img ); ?>","dimRatio":0,"minHeight":400,"contentPosition":"center center","className":"photo-tile","layout":{"type":"constrained"}} -->
<div class="wp-block-cover photo-tile" style="min-height:400px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( $img ); ?>" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:heading {"textAlign":"center","level":3,"className":"tile-title"} -->
<h3 class="wp-block-heading has-text-align-center tile-title"><a href="<?php echo esc_url( $link( $t->ID ) ); ?>"<?php echo $target( $t->ID ); ?>><?php echo $e( $t->post_title ); ?></a></h3>
<!-- /wp:heading --></div></div>
<!-- /wp:cover --></div>
<!-- /wp:column -->

<?php endforeach; ?></div>
<!-- /wp:columns -->

<?php endif; ?><!-- wp:group {"align":"full","className":"home-social","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull home-social"><!-- wp:paragraph {"align":"center","className":"section-kicker"} -->
<p class="has-text-align-center section-kicker"><?php echo $e( $opt( 'social_small', 'EXPLORE OUR' ) ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","className":"section-title"} -->
<h2 class="wp-block-heading has-text-align-center section-title"><?php echo $e( $opt( 'social_title', 'SOCIAL MEDIA' ) ); ?></h2>
<!-- /wp:heading -->

<!-- wp:social-links {"size":"has-huge-icon-size","className":"social-big","layout":{"type":"flex","justifyContent":"center"}} -->
<ul class="wp-block-social-links has-huge-icon-size social-big"><!-- wp:social-link {"url":"<?php echo esc_url( $opt( 'facebook', 'https://www.facebook.com/vineyardcity' ) ); ?>","service":"facebook"} /-->

<!-- wp:social-link {"url":"<?php echo esc_url( $opt( 'instagram', 'https://www.instagram.com/vineyardcity' ) ); ?>","service":"instagram"} /-->

<!-- wp:social-link {"url":"<?php echo esc_url( $opt( 'twitter', 'https://www.twitter.com/vineyardcity' ) ); ?>","service":"twitter"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","className":"home-newsletter","backgroundColor":"light","layout":{"type":"constrained","contentSize":"1140px"}} -->
<div class="wp-block-group alignfull home-newsletter has-light-background-color has-background"><!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center"} -->
<div class="wp-block-column is-vertically-aligned-center"><!-- wp:paragraph {"align":"center","className":"section-kicker"} -->
<p class="has-text-align-center section-kicker"><?php echo $e( $opt( 'newsletter_small', 'SIGN UP FOR OUR' ) ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","className":"section-title"} -->
<h2 class="wp-block-heading has-text-align-center section-title"><?php echo $e( $opt( 'newsletter_title', 'NEWSLETTER' ) ); ?></h2>
<!-- /wp:heading --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center"} -->
<div class="wp-block-column is-vertically-aligned-center"><!-- wp:vineyard/newsletter-form {"placeholder":"<?php echo esc_attr( $opt( 'newsletter_placeholder', 'Your information here...' ) ); ?>","button":"<?php echo esc_attr( $opt( 'newsletter_button', 'Go' ) ); ?>","action":"<?php echo esc_attr( $opt( 'newsletter_action', '/community/newsletters/' ) ); ?>"} /--></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
