<?php
/** Fallback template (posts, archives, search results). */
get_header();
?>
<section id="slider" class="tiny-slider-wrap" role="complementary" aria-label="page banner">
	<ul class="tiny-slider"><li class="tiny-item"><div class="tns-lazy-img tns-bg-slide" data-style="background:url('<?php echo esc_url( vineyard_asset( 'images/nav-img.jpg' ) ); ?>') center no-repeat;background-size:cover"></div></li></ul>
	<h2 id="inner-caption" class="container"><?php echo is_search() ? 'Search Results' : esc_html( get_the_archive_title() ?: 'News' ); ?></h2>
</section>
<main id="main">
	<div class="container">
		<div id="entry">
			<h1 id="page-title"><?php echo is_search() ? 'Results for &ldquo;' . esc_html( get_search_query() ) . '&rdquo;' : 'Latest'; ?></h1>
			<div id="post" class="clearfix">
				<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
					<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
					<p><?php echo esc_html( wp_trim_words( get_the_excerpt(), 40 ) ); ?></p>
				<?php endwhile; the_posts_pagination(); else : ?>
					<p>No results found.</p>
				<?php endif; ?>
			</div>
		</div>
	</div>
</main>
<?php get_footer();
