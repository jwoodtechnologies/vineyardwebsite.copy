<?php
/**
 * Title: Standard page (left column + page text)
 * Slug: vineyard-city/inner-page
 * Categories: vineyard
 * Block Types: core/post-content
 * Post Types: page
 */
?>
<!-- wp:columns {"className":"inner-layout"} -->
<div class="wp-block-columns inner-layout"><!-- wp:column {"width":"25%","className":"inner-sidebar"} -->
<div class="wp-block-column inner-sidebar" style="flex-basis:25%"><!-- wp:vineyard/related-pages /-->

<!-- wp:group {"className":"contact-box","backgroundColor":"slate","textColor":"base","layout":{"type":"default"}} -->
<div class="wp-block-group contact-box has-base-color has-slate-background-color has-text-color has-background"><!-- wp:heading {"className":"box-header"} -->
<h2 class="wp-block-heading box-header">Contact Us</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"contact-details"} -->
<p class="contact-details">Vineyard City Hall</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"contact-link"} -->
<p class="contact-link"><a href="tel:8012261929">801.226.1929</a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"75%","className":"inner-main"} -->
<div class="wp-block-column inner-main" style="flex-basis:75%"><!-- wp:vineyard/breadcrumbs /-->

<!-- wp:post-title {"level":1,"className":"page-title"} /-->

<!-- wp:paragraph {"placeholder":"Page text"} -->
<p></p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
