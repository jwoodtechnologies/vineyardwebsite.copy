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
		$c       = get_the_content();
		$empty   = '' === trim( wp_strip_all_tags( $c ) ) && false === strpos( $c, '<!-- wp:' );
		// Copied old-site markup on Home (e.g. a whole directory page) instead of the home sections: show the standard sections
		$foreign = false === strpos( $c, 'wp:vineyard-city-content/' ) && preg_match( '/id="post"|rz-block-list|rz-business|docs-toggle|class="clearfix"/', $c );
		if ( ( $empty || $foreign ) && function_exists( 'vcc_render_quick_links' ) ) {
			if ( $foreign && current_user_can( 'edit_pages' ) ) {
				echo '<div class="container" style="padding:12px 0"><div style="background:#fff3cd;border:1px solid #e0c36b;padding:12px 16px">Only you can see this: the Home page holds other content, so the standard home sections are shown instead. <a href="' . esc_url( admin_url( 'admin.php?page=vineyard-site-content#vcc-rebuild-home' ) ) . '">Rebuild the home page sections</a> to fix it for good.</div></div>';
			}
			echo vcc_render_quick_links() . vcc_render_events() . vcc_render_tiles() . vcc_render_social() . vcc_render_newsletter(); // phpcs:ignore
		} else {
			the_content();
		}
	}
	?>
</main>
<?php get_footer(); ?>
