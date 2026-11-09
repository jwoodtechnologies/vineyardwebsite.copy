<?php
/** Walkers that print the original class names so the original stylesheet and scripts work unchanged. */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Vineyard_City_Walker_Nav extends Walker_Nav_Menu {
	public function start_lvl( &$output, $depth = 0, $args = null ) {
		$output .= "\n" . str_repeat( "\t", $depth + 1 ) . '<ul class="menuUL level' . ( $depth + 1 ) . ' menuHidden">' . "\n";
	}
	public function end_lvl( &$output, $depth = 0, $args = null ) {
		$output .= str_repeat( "\t", $depth + 1 ) . "</ul>\n";
	}
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$state    = 0 === $depth ? 'menuDisplay' : 'menuHidden';
		$children = in_array( 'menu-item-has-children', (array) $item->classes, true ) ? ' children' : '';
		$target   = ! empty( $item->target ) ? $item->target : '_self';
		$output  .= str_repeat( "\t", $depth + 1 ) . '<li class="menuLI level' . (int) $depth . ' ' . $state . ' li-' . (int) $item->ID . $children . '"><a class="menuA level' . (int) $depth . ' ' . $state . '" href="' . esc_url( $item->url ) . '" target="' . esc_attr( $target ) . '"' . ( '_blank' === $target ? ' rel="noopener"' : '' ) . '>' . esc_html( $item->title ) . '</a>';
	}
	public function end_el( &$output, $item, $depth = 0, $args = null ) {
		$output .= "</li>\n";
	}
}

/** The "Related Pages" box in the left column. */
class Vineyard_City_Flyout_Walker extends Walker_Nav_Menu {
	private $n = 0;
	public function start_lvl( &$output, $depth = 0, $args = null ) {
		$output .= '<ul class="menuUL level' . ( $depth + 1 ) . ' menuHidden">';
	}
	public function end_lvl( &$output, $depth = 0, $args = null ) {
		$output .= '</ul>';
	}
	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$state    = 0 === $depth ? 'menuSelectedChild' : 'menuHidden';
		$first    = ( 0 === $depth && 0 === $this->n++ ) ? ' first' : '';
		$children = in_array( 'menu-item-has-children', (array) $item->classes, true ) ? ' children' : '';
		$target   = ! empty( $item->target ) ? $item->target : '_self';
		$output  .= '<li class="menuLI level' . (int) $depth . ' ' . $state . $first . $children . '" id="li-' . (int) $item->ID . '"><a class="menuA level' . (int) $depth . ' ' . $state . $first . '" href="' . esc_url( $item->url ) . '" target="' . esc_attr( $target ) . '"' . ( '_blank' === $target ? ' rel="noopener"' : '' ) . '>' . esc_html( $item->title ) . '</a>';
	}
	public function end_el( &$output, $item, $depth = 0, $args = null ) {
		$output .= '</li>';
	}
}
