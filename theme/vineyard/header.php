<?php
/**
 * Header: markup mirrors the original Revize <header> block (class names unchanged).
 */
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
<body id="<?php echo esc_attr( is_front_page() ? 'homepage' : ( is_singular() ? vineyard_meta( 'vc_body_id', 'freeform' ) : 'freeform' ) ); ?>" <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header>
	<a href="#main" id="skip" tabindex="0" class="button">Skip to main content</a>
	<div class="topnav"></div>
	<div id="menu-content" class="d-none">
		<div class="nav-content">
			<h2 class="nav-page-title"></h2>
			<div class="nav-banner" style="background:url('<?php echo esc_url( vineyard_asset( 'images/nav-img.jpg' ) ); ?>') center/cover no-repeat"></div>
			<p class="nav-page-text"></p>
		</div>
		<div class="nav-content">
			<h2 class="nav-page-title"></h2>
			<div class="nav-banner" style="background:url('<?php echo esc_url( vineyard_media_url( 'revize_photo_gallery/_DSC4715 - Copy.jpg' ) ); ?>') center/cover no-repeat"></div>
			<p class="nav-page-text"></p>
		</div>
		<div class="nav-content">
			<h2 class="nav-page-title"></h2>
			<div class="nav-banner" style="background:url('<?php echo esc_url( vineyard_media_url( 'Headshots/IMG_1037 - Copy.jpg' ) ); ?>') center/cover no-repeat"></div>
			<p class="nav-page-text"></p>
		</div>
	</div><!--/d-none-->
	<div id="toggles" class="d-lg-none">
		<div id="search-toggle" class="fa fa-search"></div>
		<div id="nav-toggle" class="fa fa-bars"></div>
	</div><!--/#toggles-->
	<div class="container-fluid">
		<div class="row">
			<div class="col-lg-2">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" id="logo"><img src="<?php echo esc_url( vineyard_asset( 'images/logo.png' ) ); ?>" alt="navigation logo"></a>
			</div><!--/.col-lg-2-->
			<nav class="col-lg-8">
				<?php
				wp_nav_menu( array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_id'        => 'nav',
					'menu_class'     => 'v2_05-23-2012',
					'items_wrap'     => '<ul id="%1$s" class="%2$s">%3$s</ul>',
					'walker'         => new Vineyard_Walker_Nav(),
					'fallback_cb'    => false,
				) );
				?>
			</nav><!--/.col-lg-8-->
			<div class="col-lg-2">
				<div id="search">
					<form class="search-form" method="GET" action="<?php echo esc_url( home_url( '/' ) ); ?>" role="search" aria-label="sitewide">
						<input name="s" class="form-control search-input" placeholder="Search ..." type="search" id="search-input" value="<?php echo esc_attr( get_search_query() ); ?>">
						<button><img src="<?php echo esc_url( vineyard_asset( 'images/search-icon.png' ) ); ?>" alt="search icon" /></button>
					</form>
				</div><!-- /#search -->
			</div><!--/.col-lg-3-->
		</div><!--/.row-->
	</div><!--/.container-fluid-->
</header>
