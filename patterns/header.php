<?php
/**
 * Title: Site header
 * Slug: vineyard-city/header
 * Categories: header
 * Block Types: core/template-part/header
 * Inserter: no
 */
$vcb_nav = function_exists( 'vcb_navigation_id' ) ? vcb_navigation_id() : 0;
$vcb_ref = $vcb_nav ? '"ref":' . (int) $vcb_nav . ',' : '';
?>
<!-- wp:group {"tagName":"header","className":"site-header","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between","verticalAlignment":"stretch"}} -->
<header class="wp-block-group site-header"><!-- wp:site-logo {"width":200,"className":"site-header__logo"} /-->

<!-- wp:navigation {<?php echo $vcb_ref; ?>"overlayMenu":"mobile","className":"site-header__nav","layout":{"type":"flex","justifyContent":"center","flexWrap":"nowrap"}} /-->

<!-- wp:search {"label":"Search","showLabel":false,"placeholder":"Search ...","buttonText":"Search","buttonPosition":"button-inside","buttonUseIcon":true,"className":"site-header__search"} /--></header>
<!-- /wp:group -->
