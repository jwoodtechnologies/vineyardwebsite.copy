<?php
/** 404 */
get_header();
?>
<main id="main">
	<div class="container">
		<div id="entry">
			<h1 id="page-title">Page Not Found</h1>
			<div id="post" class="clearfix">
				<p>The page you requested could not be found. Try the search box above or return to the <a href="<?php echo esc_url( home_url( '/' ) ); ?>">home page</a>.</p>
			</div>
		</div>
	</div>
</main>
<?php get_footer();
