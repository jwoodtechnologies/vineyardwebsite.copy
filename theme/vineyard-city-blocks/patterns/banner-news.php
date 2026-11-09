<?php
/**
 * Title: Banner (News)
 * Slug: vineyard-city/banner-news
 * Inserter: no
 */
$u = esc_url( vcb_default_banner() );
?>
<!-- wp:cover {"url":"<?php echo $u; ?>","dimRatio":20,"overlayColor":"contrast","minHeight":524,"contentPosition":"center left","align":"full","className":"page-banner","layout":{"type":"constrained"}} -->
<div class="wp-block-cover alignfull has-custom-content-position is-position-center-left page-banner" style="min-height:524px"><span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim-20 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="<?php echo $u; ?>" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:heading {"className":"inner-caption"} -->
<h2 class="wp-block-heading inner-caption">News</h2>
<!-- /wp:heading --></div></div>
<!-- /wp:cover -->
