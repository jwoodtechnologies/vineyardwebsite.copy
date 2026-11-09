( function ( wp ) {
	var el = wp.element.createElement;
	var SSR = wp.serverSideRender;
	var be = wp.blockEditor;
	var C = wp.components;

	function postId() {
		var ed = wp.data.select( 'core/editor' );
		return ed && ed.getCurrentPostId ? ed.getCurrentPostId() : 0;
	}
	function preview( name, props ) {
		return el( 'div', be.useBlockProps(), el( C.Disabled, null, el( SSR, { block: name, attributes: props.attributes, urlQueryArgs: { post_id: postId() } } ) ) );
	}
	function text( props, key, label, help ) {
		return el( C.TextControl, { __nextHasNoMarginBottom: true, label: label, help: help, value: props.attributes[ key ] || '', onChange: function ( v ) { var a = {}; a[ key ] = v; props.setAttributes( a ); } } );
	}

	wp.blocks.registerBlockType( 'vineyard/related-pages', {
		edit: function ( props ) {
			var menus = wp.data.useSelect( function ( s ) { return s( 'core' ).getMenus( { per_page: -1 } ) || []; }, [] );
			var opts = [ { label: 'This page\u2019s sub-pages', value: '' }, { label: 'Hide the list', value: 'none' } ].concat( menus.map( function ( m ) { return { label: m.name, value: String( m.id ) }; } ) );
			return el( wp.element.Fragment, null,
				el( be.InspectorControls, null, el( C.PanelBody, { title: 'Related Pages' },
					text( props, 'title', 'Heading' ),
					el( C.SelectControl, { __nextHasNoMarginBottom: true, label: 'Links shown', value: props.attributes.menu || '', options: opts, onChange: function ( v ) { props.setAttributes( { menu: v } ); } } ),
					el( 'p', { className: 'components-base-control__help' }, el( 'a', { href: 'nav-menus.php', target: '_blank' }, 'Edit menus' ) ) ) ),
				preview( 'vineyard/related-pages', props ) );
		},
		save: function () { return null; }
	} );
	wp.blocks.registerBlockType( 'vineyard/breadcrumbs', {
		edit: function ( props ) { return preview( 'vineyard/breadcrumbs', props ); },
		save: function () { return null; }
	} );
	wp.blocks.registerBlockType( 'vineyard/events', {
		edit: function ( props ) { return preview( 'vineyard/events', props ); },
		save: function () { return null; }
	} );
	wp.blocks.registerBlockType( 'vineyard/newsletter-form', {
		edit: function ( props ) {
			return el( wp.element.Fragment, null,
				el( be.InspectorControls, null, el( C.PanelBody, { title: 'Sign-up box' },
					text( props, 'placeholder', 'Box text' ), text( props, 'button', 'Button' ), text( props, 'action', 'Sends to page', 'For example /community/newsletters/' ) ) ),
				preview( 'vineyard/newsletter-form', props ) );
		},
		save: function () { return null; }
	} );
} )( window.wp );
