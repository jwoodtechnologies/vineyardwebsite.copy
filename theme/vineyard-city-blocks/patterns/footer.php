<?php
/**
 * Title: Site footer
 * Slug: vineyard-city/footer
 * Categories: footer
 * Block Types: core/template-part/footer
 * Inserter: no
 */
$o     = function ( $k, $d ) { return function_exists( 'vcc_opt' ) && vcc_opt( $k ) ? vcc_opt( $k ) : $d; };
$phone = $o( 'phone', '801.226.1929' );
$tel   = preg_replace( '/[^0-9+]/', '', $phone );
$map   = $o( 'address_link', 'https://goo.gl/maps/cw4EoARDeM4t7DYr5' );
$img   = function ( $f ) { return esc_url( vcb_asset( 'images/' . $f ) ); };
?>
<!-- wp:group {"tagName":"footer","className":"site-footer","layout":{"type":"default"}} -->
<footer class="wp-block-group site-footer"><!-- wp:group {"className":"footer-top","backgroundColor":"base","layout":{"type":"constrained","contentSize":"1320px"}} -->
<div class="wp-block-group footer-top has-base-background-color has-background"><!-- wp:columns {"verticalAlignment":"center","className":"footer-columns"} -->
<div class="wp-block-columns are-vertically-aligned-center footer-columns"><!-- wp:column {"verticalAlignment":"center","width":"16%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:16%"><!-- wp:image {"width":"150px","sizeSlug":"full","linkDestination":"custom","className":"footer-logo"} -->
<figure class="wp-block-image size-full is-resized footer-logo"><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><img src="<?php echo $img( 'footer-logo.png' ); ?>" alt="Vineyard City" style="width:150px"/></a></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","className":"footer-col first"} -->
<div class="wp-block-column is-vertically-aligned-center footer-col first"><!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:image {"width":"40px","sizeSlug":"full","className":"footer-icon"} -->
<figure class="wp-block-image size-full is-resized footer-icon"><img src="<?php echo $img( 'phone-icon.png' ); ?>" alt="" style="width:40px"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"className":"footer-link"} -->
<p class="footer-link"><a href="tel:<?php echo esc_attr( $tel ); ?>"><?php echo esc_html( $phone ); ?></a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","className":"footer-col"} -->
<div class="wp-block-column is-vertically-aligned-center footer-col"><!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center"}} -->
<div class="wp-block-group"><!-- wp:image {"width":"40px","sizeSlug":"full","className":"footer-icon"} -->
<figure class="wp-block-image size-full is-resized footer-icon"><img src="<?php echo $img( 'location-icon.png' ); ?>" alt="" style="width:40px"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"className":"footer-link"} -->
<p class="footer-link"><a href="<?php echo esc_url( $map ); ?>" target="_blank" rel="noreferrer noopener"><?php echo esc_html( $o( 'address_line1', '125 S Main Street' ) ); ?><br><?php echo esc_html( $o( 'address_line2', 'Vineyard, UT' ) ); ?></a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","className":"footer-col"} -->
<div class="wp-block-column is-vertically-aligned-center footer-col"><!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"center"}} -->
<div class="wp-block-group"><!-- wp:image {"width":"40px","sizeSlug":"full","className":"footer-icon"} -->
<figure class="wp-block-image size-full is-resized footer-icon"><img src="<?php echo $img( 'clock-icon.png' ); ?>" alt="" style="width:40px"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"className":"footer-link"} -->
<p class="footer-link"><?php echo esc_html( $o( 'hours_line1', 'Monday - Thursday: 8am – 5pm' ) ); ?><br><?php echo esc_html( $o( 'hours_line2', 'Friday: 8am – 12pm' ) ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"footer-bottom","backgroundColor":"slate","textColor":"base","layout":{"type":"constrained","contentSize":"1140px"}} -->
<div class="wp-block-group footer-bottom has-base-color has-slate-background-color has-text-color has-background"><!-- wp:paragraph {"fontSize":"small"} -->
<p class="has-small-font-size"><?php echo esc_html( $o( 'copyright', '© Vineyard UT' ) ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></footer>
<!-- /wp:group -->
