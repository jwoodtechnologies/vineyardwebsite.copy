<?php
/**
 * Walker that reproduces the Revize menu markup so the original CSS/JS (layout.css, scripts.js) work unchanged:
 *   <ul id="nav"> <li class="menuLI level0 menuDisplay li-3 children"><a class="menuA level0 menuDisplay">…
 */
class Vineyard_Walker_Nav extends Walker_Nav_Menu {

	public function start_lvl( &$output, $depth = 0, $args = null ) {
		$level   = $depth + 1;
		$output .= "\n" . str_repeat( "\t", $level ) . '<ul class="menuUL level' . (int) $level . ' menuHidden">' . "\n";
	}

	public function end_lvl( &$output, $depth = 0, $args = null ) {
		$output .= str_repeat( "\t", $depth + 1 ) . "</ul>\n";
	}

	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$state    = 0 === $depth ? 'menuDisplay' : 'menuHidden';
		$children = in_array( 'menu-item-has-children', (array) $item->classes, true ) ? ' children' : '';
		$target   = ! empty( $item->target ) ? $item->target : '_self';
		$output  .= str_repeat( "\t", $depth + 1 )
			. '<li class="menuLI level' . (int) $depth . ' ' . $state . ' li-' . (int) $item->ID . $children . '">'
			. '<a class="menuA level' . (int) $depth . ' ' . $state . '" href="' . esc_url( $item->url ) . '" target="' . esc_attr( $target ) . '"'
			. ( '_blank' === $target ? ' rel="noopener"' : '' ) . '>'
			. esc_html( $item->title ) . '</a>';
	}

	public function end_el( &$output, $item, $depth = 0, $args = null ) {
		$output .= "</li>\n";
	}
}
