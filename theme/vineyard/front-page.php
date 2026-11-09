<?php
/**
 * Front page. Markup mirrors the original Revize home page (index.php template).
 * Quick links / subsite tiles are static here; edit this file or convert to ACF/blocks later.
 */
get_header();
?>
<section id="slider" class="tiny-slider-wrap">
	<ul class="tiny-slider">
		<li class="tiny-item"><div class="tns-lazy-img tns-bg-slide" data-style="background:url('<?php echo esc_url( vineyard_media_url( 'links/Vineyard City Sunset_KendallBowman - Copy.jpg' ) ); ?>') center no-repeat;background-size:cover"></div></li>
	</ul><!--/.tiny-slider-->
	<img src="<?php echo esc_url( vineyard_asset( 'images/slider-mask.png' ) ); ?>" class="slider-mask" alt="slider mask"/>
	<img src="<?php echo esc_url( vineyard_media_url( 'revize_photo_gallery/slider-logo.png' ) ); ?>" id="slider-logo" alt="slider logo"/>
	<a href="<?php echo esc_url( vineyard_url( 'transparency_portal/index.php' ) ); ?>" class="slider-button-link"><span class="btn slider-button">Transparency Portal</span></a>
</section><!--/#slider-->
<main id="main">
	<section id="quick-links">
		<div class="container">
			<div id="quicklinks-inner">
				<ul class="tiny-carousel">
							<li class="tiny-item">
								<a href="https://vineyardut.portal.civicclerk.com/" target="_blank" class="qlink" rel="noopener">
									<img src="<?php echo esc_url( vineyard_asset( 'images/qlink-1.png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">AGENDAS&#160;, MINUTES & PUBLIC NOTICES</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="<?php echo esc_url( vineyard_url( 'community_/vineyard_101_mini_academy.php' ) ); ?>" target="_blank" class="qlink" rel="noopener">
									<img src="<?php echo esc_url( vineyard_media_url( 'Vineyard 101 (6).png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">Vineyard 101: Mini Academy</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="<?php echo esc_url( vineyard_url( 'services/utility_billing.php' ) ); ?>" target="_self" class="qlink">
									<img src="<?php echo esc_url( vineyard_media_url( 'qlinks/qlink-2.png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">UTILITY</br> INFO</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="https://vineyardrec.activityreg.com/selectfacility_t2.wcs" target="_blank" class="qlink" rel="noopener">
									<img src="<?php echo esc_url( vineyard_media_url( 'qlinks/gazebo (1).png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">Rent a Pavilion</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="<?php echo esc_url( vineyard_url( 'government/water_quality_reports.php' ) ); ?>" target="_self" class="qlink">
									<img src="<?php echo esc_url( vineyard_media_url( 'qlinks/qlink-6.png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">Water Quality Reports</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="https://vineyard.lib.utah.gov/" target="_blank" class="qlink" rel="noopener">
									<img src="<?php echo esc_url( vineyard_media_url( 'Copy of Year in Review Website Links (1).png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">Vineyard Library</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="<?php echo esc_url( vineyard_url( 'community_/report-a-concern.php' ) ); ?>" target="_blank" class="qlink" rel="noopener">
									<img src="<?php echo esc_url( vineyard_media_url( 'bus-directory/warning.png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">Report a Concern</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="<?php echo esc_url( vineyard_url( 'community_/newsletters.php' ) ); ?>" target="_self" class="qlink">
									<img src="<?php echo esc_url( vineyard_media_url( 'qlinks/mail.png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">Newsletter</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="<?php echo esc_url( vineyard_url( 'government/parks_and_recreation.php' ) ); ?>" target="_blank" class="qlink" rel="noopener">
									<img src="<?php echo esc_url( vineyard_media_url( 'qlinks/gazebo (1).png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">Parks & Rec</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="https://vineyard.municipalcodeonline.com/" target="_blank" class="qlink" rel="noopener">
									<img src="<?php echo esc_url( vineyard_asset( 'images/qlink-1.png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">Municipal Code, Ordinances, Resolutions, etc.</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
							<li class="tiny-item">
								<a href="<?php echo esc_url( vineyard_url( 'contact/privacy.php' ) ); ?>" target="_blank" class="qlink" rel="noopener">
									<img src="<?php echo esc_url( vineyard_media_url( 'qlinks/qlink-3.png' ) ); ?>" class="qlink-icon" alt="quick link icon">
									<strong class="qlink-title equal">PRIVACY POLICY</strong>
								</a><!--/.qlink-->
							</li><!--/.tiny-item-->
				</ul><!--/.tiny-carousel-->
			</div><!--/#quicklinks-inner-->
		</div><!--/.container-->
	</section><!--/#quick-links-->
	<section id="events">
		<div class="container">
			<h2 class="section-header">
				<span>CHECK OUT OUR</span>
				UPCOMING EVENTS
			</h2>
			<div id="events-list">
				<div id="events-tabs" class="events-buttons">
					<button class="tab active">Meetings</button>
					<button class="tab">COMMUNITY</button>
					<button class="tab">RECREATION</button>
				</div>
				<?php /* Revize-only dynamic module; see docs/dynamic-features.md (calendar). Output of an events plugin goes here. */ ?>
				<div id="mini-events" data-template-file="template.html"><?php echo do_shortcode( '[vineyard_events]' ); ?></div>
			</div>
			<a href="<?php echo esc_url( vineyard_url( 'calendar.php' ) ); ?>" class="button section-link">See All Events</a>
		</div><!--/.container-->
	</section><!--/#events-->
	<section id="subsites">
		<div id="subsites-inner">
			<a href="<?php echo esc_url( vineyard_url( 'government/city_council2.php' ) ); ?>" target="_blank" class="subsite-link" style="background:url('<?php echo esc_url( vineyard_media_url( 'Misc Photos/City Hall - Copy - Copy.jpg' ) ); ?>') center no-repeat;background-size:cover">
				<h3 class="subsite-name equal"><span>Mayor & City Council</span></h3>
			</a><!--/.subsite-link-->
			<a href="<?php echo esc_url( vineyard_url( 'government/recreation.php' ) ); ?>" target="_self" class="subsite-link" style="background:url('<?php echo esc_url( vineyard_media_url( 'Headshots/IMG_0132 - Copy.jpg' ) ); ?>') center no-repeat;background-size:cover">
				<h3 class="subsite-name equal"><span>RECREATION Department</span></h3>
			</a><!--/.subsite-link-->
			<a href="https://vineyard.lib.utah.gov/" target="_blank" class="subsite-link" style="background:url('<?php echo esc_url( vineyard_media_url( 'links/IMG_7595 - Copy.jpg' ) ); ?>') center no-repeat;background-size:cover">
				<h3 class="subsite-name equal"><span>VINEYARD&#160; LIBRARY</span></h3>
			</a><!--/.subsite-link-->
		</div><!--/#subsites-inner-->
	</section><!--/#subsites-->
	<section id="social">
		<div class="container">
			<h2 class="section-header">
				<span>EXPLORE OUR</span>
				SOCIAL MEDIA
			</h2>
			<div id="social-wrapper">
				<a href="https://www.facebook.com/vineyardcity" class="social-link facebook" target="_blank" rel="noopener"><img src="<?php echo esc_url( vineyard_asset( 'images/facebook-icon.png' ) ); ?>" alt="social icon"/></a>
				<a href="https://www.instagram.com/vineyardcity" class="social-link instagram" target="_blank" rel="noopener"><img src="<?php echo esc_url( vineyard_asset( 'images/instagram-icon.png' ) ); ?>" alt="social icon"/></a>
				<a href="https://www.Twitter.com/vineyardcity" class="social-link twitter" target="_blank" rel="noopener"><img src="<?php echo esc_url( vineyard_asset( 'images/twitter-icon.png' ) ); ?>" alt="social icon"/></a>
			</div><!--/#social-wrapper-->
		</div><!--/.container-->
	</section><!--/#social-->
	<section id="newsletter">
		<div class="container">
			<div class="section-inner">
				<div class="row">
					<div class="col-lg-6">
						<div id="newsletter-left">
							<img src="<?php echo esc_url( vineyard_asset( 'images/newsletter-shape.png' ) ); ?>" class="newsletter-shape" alt="newsletter shape"/>
							<h2 class="section-header">
								<span>SIGN UP FOR OUR</span>
								NEWSLETTER
							</h2>
						</div>
					</div><!--/.col-lg-6-->
					<div class="col-lg-6">
						<div id="newsletter-form">
							<?php /* Original form posted to Revize; replace with the chosen newsletter provider (docs/dynamic-features.md). */ ?>
							<form class="newsletter-form" method="get" action="<?php echo esc_url( apply_filters( 'vineyard_newsletter_action', vineyard_url( 'community_/newsletters.php' ) ) ); ?>">
								<input name="newsletter" class="form-control newsletter-input" placeholder="Your information here..." type="search" id="newsletter-input">
								<button>Go</button>
							</form>
						</div><!-- /#newsletter-form -->
					</div><!--/.col-lg-6-->
				</div><!--/.row-->
			</div><!--/.section-inner-->
		</div><!--/.container-->
	</section><!--/#newsletter-->
</main>
<?php
get_footer();
