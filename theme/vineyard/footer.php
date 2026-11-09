<?php
/**
 * Footer: markup mirrors the original Revize <footer>; share modal + translate list are verbatim parts.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
get_template_part( 'template-parts/share-translate' );
?>
<footer>
	<div id="footer-top">
		<div class="container">
			<div class="row">
				<div class="col-lg-2">
					<img id="footer-logo" src="<?php echo esc_url( vineyard_asset( 'images/footer-logo.png' ) ); ?>" alt="footer logo" />
				</div><!--/.col-lg-3-->
				<div class="col-lg-3">
					<div class="footer-col first">
						<div class="footer-icon"><img src="<?php echo esc_url( vineyard_asset( 'images/phone-icon.png' ) ); ?>" alt="phone icon"/></div>
						<a href="tel:801.226.1929" class="footer-link">801.226.1929</a>
					</div><!--/.footer-col-->
				</div><!--/.col-lg-3-->
				<div class="col-lg-3">
					<div class="footer-col">
						<div class="footer-icon"><img src="<?php echo esc_url( vineyard_asset( 'images/location-icon.png' ) ); ?>" alt="location icon"/></div>
						<a href="https://goo.gl/maps/cw4EoARDeM4t7DYr5" class="footer-link" target="_blank" rel="noopener">125 S Main Street <br/> Vineyard, UT </a>
					</div><!--/.footer-col-->
				</div><!--/.col-lg-3-->
				<div class="col-lg-4">
					<div class="footer-col justify-content-end">
						<div class="footer-icon"><img src="<?php echo esc_url( vineyard_asset( 'images/clock-icon.png' ) ); ?>" alt="clock icon"/></div>
						<span class="footer-link">Monday - Thursday: 8am &#8211; 5pm <br/> Friday: 8am &#8211; 12pm</span>
					</div><!--/.footer-col-->
				</div><!--/.col-lg-4-->
			</div><!--/.row-->
		</div><!--/.container-->
	</div><!--/.footer-top-->
	<div id="footer-bottom">
		<div class="container">
			<div class="row">
				<div class="col-lg-6">
					<div id="copyright">
						&copy; Vineyard UT
					</div>
				</div><!--/.col-lg-6-->
				<div class="col-lg-6">
					<div id="revize"></div><!--/#revize-->
				</div><!--/.col-lg-6-->
			</div><!--/.row-->
		</div><!--/.container-->
	</div><!--/.footer-bottom-->
</footer>
<?php wp_footer(); ?>
</body>
</html>
