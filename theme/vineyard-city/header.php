<?php
/** Header. Markup and class names match the original website; the logo, search words and drop-down pictures come from Vineyard Site Content → Header. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body id="<?php echo is_front_page() ? 'homepage' : 'freeform'; ?>" <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header>
	<a href="#main" id="skip" tabindex="0" class="button">Skip to main content</a>
	<div class="topnav"></div>
	<div id="menu-content" class="d-none">
		<div class="nav-content"><h2 class="nav-page-title"></h2><div class="nav-banner" style="background:url('<?php echo esc_url( vcity_asset( 'images/nav-img.jpg' ) ); ?>') center/cover no-repeat"></div><p class="nav-page-text"></p></div>
		<div class="nav-content"><h2 class="nav-page-title"></h2><div class="nav-banner" style="background:url('<?php echo esc_url( vcity_image( 'menu_image_2' ) ); ?>') center/cover no-repeat"></div><p class="nav-page-text"></p></div>
		<div class="nav-content"><h2 class="nav-page-title"></h2><div class="nav-banner" style="background:url('<?php echo esc_url( vcity_image( 'menu_image_3' ) ); ?>') center/cover no-repeat"></div><p class="nav-page-text"></p></div>
	</div>
	<div id="toggles" class="d-lg-none"><div id="search-toggle" class="fa fa-search"></div><div id="nav-toggle" class="fa fa-bars"></div></div>
	<div class="container-fluid">
		<div class="row">
			<div class="col-lg-2"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" id="logo"><img src="<?php echo esc_url( vcity_image( 'logo' ) ); ?>" alt="<?php bloginfo( 'name' ); ?>"></a></div>
			<nav class="col-lg-8">
				<?php
				wp_nav_menu( array( 'theme_location' => 'primary', 'container' => false, 'menu_id' => 'nav', 'menu_class' => 'v2_05-23-2012', 'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>', 'walker' => new Vineyard_City_Walker_Nav(), 'fallback_cb' => false ) );
				?>
			</nav>
			<div class="col-lg-2">
				<div id="search">
					<form class="search-form" method="GET" action="<?php echo esc_url( home_url( '/' ) ); ?>" role="search" aria-label="sitewide">
						<input name="s" class="form-control search-input" placeholder="<?php echo esc_attr( vcity_opt( 'search_placeholder' ) ); ?>" type="search" id="search-input" value="<?php echo esc_attr( get_search_query() ); ?>">
						<button><img src="<?php echo esc_url( vcity_asset( 'images/search-icon.png' ) ); ?>" alt="search"></button>
					</form>
				</div>
			</div>
		</div>
	</div>
</header>
