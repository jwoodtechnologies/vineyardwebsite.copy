<?php
/** Footer. Words, phone, address and hours come from Vineyard Site Content → Footer. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
get_template_part( 'template-parts/share-translate' );
$addr_link = vcity_opt( 'address_link' );
?>
<footer>
	<div id="footer-top">
		<div class="container">
			<div class="row">
				<div class="col-lg-2"><img id="footer-logo" src="<?php echo esc_url( vcity_image( 'footer_logo' ) ); ?>" alt="<?php bloginfo( 'name' ); ?>"></div>
				<div class="col-lg-3"><div class="footer-col first">
					<div class="footer-icon"><img src="<?php echo esc_url( vcity_asset( 'images/phone-icon.png' ) ); ?>" alt=""></div>
					<a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', vcity_opt( 'phone' ) ) ); ?>" class="footer-link"><?php echo esc_html( vcity_opt( 'phone' ) ); ?></a>
				</div></div>
				<div class="col-lg-3"><div class="footer-col">
					<div class="footer-icon"><img src="<?php echo esc_url( vcity_asset( 'images/location-icon.png' ) ); ?>" alt=""></div>
					<a href="<?php echo esc_url( $addr_link ? $addr_link : '#' ); ?>" class="footer-link" target="_blank" rel="noopener"><?php echo esc_html( vcity_opt( 'address_line1' ) ); ?> <br/> <?php echo esc_html( vcity_opt( 'address_line2' ) ); ?> </a>
				</div></div>
				<div class="col-lg-4"><div class="footer-col justify-content-end">
					<div class="footer-icon"><img src="<?php echo esc_url( vcity_asset( 'images/clock-icon.png' ) ); ?>" alt=""></div>
					<span class="footer-link"><?php echo esc_html( vcity_opt( 'hours_line1' ) ); ?> <br/> <?php echo esc_html( vcity_opt( 'hours_line2' ) ); ?></span>
				</div></div>
			</div>
			<?php if ( is_active_sidebar( 'footer-extra' ) ) : ?><div class="row"><div class="col-12"><?php dynamic_sidebar( 'footer-extra' ); ?></div></div><?php endif; ?>
		</div>
	</div>
	<div id="footer-bottom">
		<div class="container"><div class="row">
			<div class="col-lg-6"><div id="copyright"><?php echo esc_html( vcity_opt( 'copyright' ) ); ?></div></div>
			<div class="col-lg-6"><div id="revize"></div></div>
		</div></div>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
