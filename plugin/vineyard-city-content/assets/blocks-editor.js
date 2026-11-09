/**
 * Vineyard City blocks in the editor (plain JavaScript, no build step).
 * Every home-page section is a block shown as a labelled card: title, one-line help, an "Edit these items" button that
 * opens the right Vineyard Site Content screen, and a LIVE PREVIEW drawn by the website itself (ServerSideRender).
 * The blocks store nothing in the page except their name, e.g. <!-- wp:vineyard-city-content/quick-links /-->,
 * so they can be dragged, removed and added back from the inserter ("Vineyard City") without any risk of "invalid block".
 */
( function ( wp, data ) {
	'use strict';
	if ( ! wp || ! wp.blocks || ! wp.element || ! data || ! data.blocks ) {
		return;
	}
	var el = wp.element.createElement;
	var useBlockProps = wp.blockEditor && wp.blockEditor.useBlockProps;
	var ServerSideRender = wp.serverSideRender || ( wp.editor && wp.editor.ServerSideRender );
	var Disabled = wp.components && wp.components.Disabled;
	var Spinner = wp.components && wp.components.Spinner;

	function Loading() {
		return el( 'div', { className: 'vcc-card__loading' }, Spinner ? el( Spinner ) : null, ' Loading preview…' );
	}

	function makeEdit( b ) {
		return function Edit() {
			var props = useBlockProps ? useBlockProps( { className: 'vcc-card' } ) : { className: 'vcc-card' };
			var preview = ServerSideRender
				? el( ServerSideRender, { block: b.name, LoadingResponsePlaceholder: Loading } )
				: el( 'p', null, 'Preview not available – the section will show on the website.' );
			return el( 'div', props,
				el( 'div', { className: 'vcc-card__head' },
					el( 'span', { className: 'vcc-card__title dashicons-before dashicons-' + b.icon }, b.title ),
					el( 'a', { className: 'components-button is-secondary vcc-card__edit', href: b.editUrl, target: '_blank', rel: 'noopener noreferrer' }, b.editLabel + ' ↗' )
				),
				el( 'p', { className: 'vcc-card__help' }, b.description ),
				el( 'div', { className: 'vcc-card__preview vcc-preview' }, Disabled ? el( Disabled, null, preview ) : preview )
			);
		};
	}

	data.blocks.forEach( function ( b ) {
		if ( wp.blocks.getBlockType( b.name ) && wp.blocks.getBlockType( b.name ).edit ) {
			return; // already registered (script loaded twice)
		}
		wp.blocks.registerBlockType( b.name, {
			// these mirror block.json so the block still registers if the server definitions are not available
			apiVersion: 3,
			title: b.title,
			description: b.description,
			category: b.category,
			icon: b.icon,
			keywords: b.keywords,
			supports: b.supports,
			attributes: {},
			edit: makeEdit( b ),
			save: function () {
				return null; // drawn by the website (PHP), never stored in the page → never "invalid"
			}
		} );
	} );
} )( window.wp, window.vccBlocksEditor );
