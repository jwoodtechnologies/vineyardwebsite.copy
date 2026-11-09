<?php
/**
 * Inner page template. Structure mirrors the original Revize inner page:
 * banner slider -> <main id="main"> (aside: related pages + contact box | #entry: breadcrumbs, h1, buttons, #post).
 * Page chrome that was not part of the main content is stored in post meta by scripts/import.sh.
 */
get_header();
while ( have_posts() ) :
	the_post();
	$images  = vineyard_banner_images();
	$caption = vineyard_meta( 'vc_banner_caption', get_the_title() );
	?>
<section id="slider" class="tiny-slider-wrap" role="complementary" aria-label="page banner">
	<ul class="tiny-slider">
		<?php if ( $images ) : foreach ( $images as $img ) : ?>
		<li class="tiny-item"><div class="tns-lazy-img tns-bg-slide" data-style="background:url('<?php echo esc_url( $img ); ?>') center no-repeat;background-size:cover"></div></li>
		<?php endforeach; else : ?>
		<li class="tiny-item"><div class="tns-lazy-img tns-bg-slide" data-style="background:url('<?php echo esc_url( vineyard_asset( 'images/nav-img.jpg' ) ); ?>') center no-repeat;background-size:cover"></div></li>
		<?php endif; ?>
	</ul><!--/.tiny-slider-->
	<h2 id="inner-caption" class="container">
		<?php echo esc_html( $caption ); ?>
	</h2>
</section><!-- /#slider -->
<main id="main">
	<div class="container">
		<div class="row">
			<aside class="col-lg-3">
				<nav id="flyout-wrap" aria-labelledby="flyout-header">
					<h2 id="flyout-header">Related Pages</h2>
					<?php echo wp_kses_post( vineyard_meta( 'vc_leftnav' ) ); // phpcs:ignore -- imported markup, links rewritten at import ?>
				</nav>
				<div id="contact-box">
					<?php echo wp_kses_post( vineyard_meta( 'vc_contact_box' ) ); ?>
				</div>
			</aside>
			<div class="col-lg-9">
				<div id="entry">
					<nav id="breadcrumbs" aria-label="breadcrumb">
						<ul>
							<li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a> </li>
							<?php
							foreach ( array_reverse( get_post_ancestors( get_the_ID() ) ) as $anc ) {
								echo '<li><a href="' . esc_url( get_permalink( $anc ) ) . '">' . esc_html( get_the_title( $anc ) ) . '</a> </li>';
							}
							?>
							<li><?php the_title(); ?></li>
						</ul>
					</nav><!-- /#breadcrumbs -->
					<div id="freeform-main">
						<h1 id="page-title">
							<?php the_title(); ?>
						</h1>
						<?php $btns = vineyard_meta( 'vc_inner_buttons' ); if ( $btns ) : ?>
						<div id="inner-buttons">
							<?php echo wp_kses_post( $btns ); ?>
						</div>
						<?php endif; ?>
						<div id="post" class="clearfix">
							<?php the_content(); ?>
						</div>
					</div><!-- /#freeform-main -->
				</div>
			</div><!-- /.col-lg-9 -->
		</div><!-- /.row -->
	</div><!-- /.container -->
</main>
	<?php
endwhile;
get_footer();
