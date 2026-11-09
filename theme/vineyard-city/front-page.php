<?php
/**
 * Home page. The big photo is the Featured Image of the page "Home"; the button and logo come from Vineyard Site Content → Home page;
 * everything below it is the Home page's own content (blocks you can move or delete in the editor).
 */
get_header();
$btn_url = vcity_opt( 'hero_button_url' );
?>
<section id="slider" class="tiny-slider-wrap">
	<ul class="tiny-slider"><li class="tiny-item"><div class="tns-lazy-img tns-bg-slide" data-style="background:url('<?php echo esc_url( vcity_hero_url() ); ?>') center no-repeat;background-size:cover"></div></li></ul>
	<img src="<?php echo esc_url( vcity_asset( 'images/slider-mask.png' ) ); ?>" class="slider-mask" alt="">
	<img src="<?php echo esc_url( vcity_image( 'hero_logo' ) ); ?>" id="slider-logo" alt="<?php bloginfo( 'name' ); ?>">
	<?php if ( vcity_opt( 'hero_button_label' ) ) : ?><a href="<?php echo esc_url( vcity_url( $btn_url ) ); ?>" class="slider-button-link"><span class="btn slider-button"><?php echo esc_html( vcity_opt( 'hero_button_label' ) ); ?></span></a><?php endif; ?>
</section>
<main id="main">
	<?php
	while ( have_posts() ) {
		the_post();
		$c = get_the_content();
		if ( '' === trim( wp_strip_all_tags( $c ) ) && false === strpos( $c, '<!-- wp:' ) && function_exists( 'vcc_render_quick_links' ) ) { // not set up yet: show the standard sections
			echo vcc_render_quick_links() . vcc_render_events() . vcc_render_tiles() . vcc_render_social() . vcc_render_newsletter(); // phpcs:ignore
		} else {
			the_content();
		}
	}
	?>
</main>
<?php get_footer(); ?>
