/*
 * Converts pages copied from the old Revize site into real WordPress blocks.
 * Run inside wp-admin on an editor screen (post-new.php?post_type=page), where WordPress' block library is loaded:
 *     await vcbConvert.run({ ids: [12, 34] })      // some pages
 *     await vcbConvert.run({ all: true })           // every page
 * Each page keeps its old version in Revisions. Already converted pages are skipped.
 */
window.vcbConvert = ( function () {
	var B = wp.blocks;
	var api = wp.apiFetch;
	var MARK = 'vcb-converted';

	// Markup the block converter would flatten: kept exactly as it is in a Custom HTML block.
	var KEEP_SEL = 'iframe,form,input,select,textarea,button,script,style,embed,object,video,audio,canvas,svg,i.fa,[class*="rz-"],[class*="bus-"],[class*="business"],[class*="faq-"],.collapse,.letter-label,[data-toggle],[onclick]';
	var WRAP_CLASSES = /^(row|container(-fluid)?|clearfix|col-[a-z]{2}-\d+|col-\d+|col|pull-left|pull-right|text-center|docs-list|docs-group)$/;

	function html( markup ) { return B.createBlock( 'core/html', { content: markup.trim() } ); }

	function rawBlocks( markup ) {
		if ( ! markup.replace( /<br\s*\/?>|&nbsp;|\s/gi, '' ) ) { return []; }
		var out = B.rawHandler( { HTML: markup } ) || [];
		return out.map( function ( b ) { return fixBlock( b, markup ); } ).filter( Boolean );
	}
	function fixBlock( b ) {
		if ( ! b ) { return null; }
		if ( b.name === 'core/freeform' || b.name === 'core/missing' ) { return html( b.attributes.content || b.originalContent || '' ); }
		if ( b.innerBlocks && b.innerBlocks.length ) { b.innerBlocks = b.innerBlocks.map( fixBlock ).filter( Boolean ); }
		return b;
	}

	function classesOf( el ) { return ( el.getAttribute( 'class' ) || '' ).split( /\s+/ ).filter( Boolean ); }

	/** One DOM node -> blocks. */
	function nodeBlocks( el ) {
		if ( el.nodeType === 3 ) { return rawBlocks( el.textContent ); }
		if ( el.nodeType !== 1 ) { return []; }
		var tag = el.tagName.toLowerCase();
		var cls = classesOf( el );
		var plainWrapper = /^(div|section|article|header|span)$/.test( tag ) && cls.every( function ( c ) { return WRAP_CLASSES.test( c ); } ) && ! el.getAttribute( 'style' );
		var special = el.matches( KEEP_SEL ) || el.querySelector( KEEP_SEL );
		if ( /^(div|section|article|header)$/.test( tag ) && ( plainWrapper || ! special ) && el.children.length ) {
			var inner = childBlocks( el );
			var keep = cls.filter( function ( c ) { return ! /^(clearfix)$/.test( c ); } );
			if ( ! keep.length && ! el.id ) { return inner; } // a plain box: just its content
			var attrs = { className: keep.join( ' ' ), layout: { type: 'default' } };
			if ( el.id && ! /^(post|entry|main)$/.test( el.id ) ) { attrs.anchor = el.id; }
			return [ B.createBlock( 'core/group', attrs, inner ) ];
		}
		if ( tag === 'details' && el.querySelector( ':scope > summary' ) && ! el.querySelector( 'iframe,form,script,input' ) ) {
			var sum = el.querySelector( ':scope > summary' );
			var rest = el.cloneNode( true );
			rest.removeChild( rest.querySelector( ':scope > summary' ) );
			var dcls = cls.join( ' ' );
			return [ B.createBlock( 'core/details', { summary: sum.innerHTML.trim(), className: dcls || undefined, showContent: el.hasAttribute( 'open' ) }, childBlocks( rest ) ) ];
		}
		if ( special ) {
			if ( tag === 'iframe' && /youtube\.com|youtu\.be|vimeo\.com/.test( el.src || '' ) ) {
				var u = el.src.replace( /\/embed\/([^?]+).*/, '/watch?v=$1' ).replace( 'youtube-nocookie.com', 'youtube.com' );
				return [ B.createBlock( 'core/embed', { url: u, providerNameSlug: /vimeo/.test( u ) ? 'vimeo' : 'youtube', type: 'video', responsive: true } ) ];
			}
			return [ html( el.outerHTML ) ];
		}
		if ( tag === 'a' && /\b(btn|button|rz-btn|newbtn)\b/.test( el.className ) ) {
			return [ B.createBlock( 'core/buttons', {}, [ B.createBlock( 'core/button', { text: el.innerHTML, url: el.getAttribute( 'href' ) || '', linkTarget: el.getAttribute( 'target' ) || undefined } ) ] ) ];
		}
		return rawBlocks( el.outerHTML );
	}
	function childBlocks( parent ) {
		var out = [], inline = '';
		function flush() { if ( inline.trim() ) { out = out.concat( rawBlocks( inline ) ); } inline = ''; }
		Array.prototype.forEach.call( parent.childNodes, function ( n ) {
			var isInline = n.nodeType === 3 || ( n.nodeType === 1 && /^(a|span|strong|b|em|i|u|small|sup|sub|br|img|label|font)$/i.test( n.tagName ) && ! n.matches( KEEP_SEL ) && ! n.querySelector( KEEP_SEL ) && ! /\b(btn|button|rz-btn|newbtn)\b/.test( n.className || '' ) );
			if ( isInline ) { inline += n.nodeType === 3 ? n.textContent.replace( /</g, '&lt;' ) : n.outerHTML; return; }
			flush();
			out = out.concat( nodeBlocks( n ) );
		} );
		flush();
		return out;
	}

	function htmlToBlocks( markup ) {
		var doc = new DOMParser().parseFromString( '<div id="vcb-root">' + markup + '</div>', 'text/html' );
		return childBlocks( doc.getElementById( 'vcb-root' ) );
	}

	/** Existing content (may already hold some blocks, e.g. the calendar) -> blocks. */
	function contentToBlocks( raw ) {
		var parsed = B.parse( raw );
		var out = [];
		parsed.forEach( function ( b ) {
			if ( b.name === 'core/freeform' || ( b.name === 'core/html' && ! /<!--\s*wp:/.test( raw ) ) ) {
				out = out.concat( htmlToBlocks( b.attributes.content || '' ) );
			} else if ( b.name === 'core/missing' ) {
				out.push( html( b.originalContent || '' ) );
			} else {
				out.push( b );
			}
		} );
		return out;
	}

	function sidebar( parts ) {
		var rel = parts.related && parts.related !== '0' ? parts.related : '';
		var side = [ B.createBlock( 'vineyard/related-pages', rel ? { menu: rel } : {} ) ];
		var c = parts.contact;
		if ( c ) {
			var box = [];
			if ( c.title ) { box.push( B.createBlock( 'core/heading', { level: 2, content: esc( c.title ), className: 'box-header' } ) ); }
			if ( c.text ) { box.push( B.createBlock( 'core/paragraph', { content: esc( c.text ), className: 'contact-details' } ) ); }
			if ( c.phone ) { box.push( B.createBlock( 'core/paragraph', { content: '<a href="' + c.phone_href + '">' + esc( c.phone ) + '</a>', className: 'contact-link' } ) ); }
			side.push( B.createBlock( 'core/group', { className: 'contact-box', backgroundColor: 'slate', textColor: 'base', layout: { type: 'default' } }, box ) );
		}
		return side;
	}
	function topButtons( parts ) {
		if ( ! parts.buttons || ! parts.buttons.length ) { return []; }
		return [ B.createBlock( 'core/buttons', { className: 'inner-buttons' }, parts.buttons.map( function ( b ) {
			return B.createBlock( 'core/button', { text: esc( b.label ), url: b.url, linkTarget: b.new_tab ? '_blank' : undefined, rel: b.new_tab ? 'noreferrer noopener' : undefined, className: 'inner-button' } );
		} ) ) ];
	}
	function esc( s ) { var d = document.createElement( 'div' ); d.textContent = s || ''; return d.innerHTML; }

	function build( raw, parts ) {
		var body = contentToBlocks( raw );
		var full = /fullwidth/.test( parts.template || '' );
		var head = [ B.createBlock( 'vineyard/breadcrumbs' ), B.createBlock( 'core/post-title', { level: 1, className: 'page-title' } ) ].concat( topButtons( parts ) );
		var main = head.concat( body );
		var blocks = full ? [ B.createBlock( 'core/group', { className: 'entry-wrap', layout: { type: 'default' } }, main ) ]
			: [ B.createBlock( 'core/columns', { className: 'inner-layout' }, [
				B.createBlock( 'core/column', { width: '25%', className: 'inner-sidebar' }, sidebar( parts ) ),
				B.createBlock( 'core/column', { width: '75%', className: 'inner-main' }, main )
			] ) ];
		return { content: B.serialize( blocks ), template: full ? 'page-full-width' : '', invalid: countInvalid( B.serialize( blocks ) ) };
	}
	function countInvalid( content ) {
		var n = 0;
		( function walk( list ) { list.forEach( function ( b ) { if ( b.isValid === false ) { n++; } walk( b.innerBlocks || [] ); } ); } )( B.parse( content ) );
		return n;
	}

	async function one( id, opts ) {
		var page = await api( { path: '/wp/v2/pages/' + id + '?context=edit&_fields=id,content,meta,template,status' } );
		var raw = page.content.raw || '';
		if ( raw.indexOf( MARK ) !== -1 || /wp:vineyard\/(breadcrumbs|related-pages)/.test( raw ) ) { return { id: id, skipped: 'done' }; }
		var parts = await api( { path: '/vineyard/v1/page-parts/' + id } );
		if ( parts.is_front ) { return { id: id, skipped: 'home' }; }
		var r = build( raw, parts );
		if ( r.invalid ) { return { id: id, error: r.invalid + ' invalid blocks' }; }
		if ( opts && opts.dry ) { return { id: id, content: r.content }; }
		await api( { path: '/wp/v2/pages/' + id, method: 'POST', data: { content: r.content, template: r.template } } );
		return { id: id, ok: true };
	}

	async function run( opts ) {
		opts = opts || {};
		var ids = opts.ids || [];
		if ( opts.all ) {
			for ( var p = 1; ; p++ ) {
				var batch = await api( { path: '/wp/v2/pages?per_page=100&status=publish,draft,private&_fields=id&page=' + p } ).catch( function () { return []; } );
				if ( ! batch.length ) { break; }
				ids = ids.concat( batch.map( function ( x ) { return x.id; } ) );
				if ( batch.length < 100 ) { break; }
			}
		}
		var res = { ok: 0, skipped: 0, errors: [] };
		for ( var i = 0; i < ids.length; i++ ) {
			try {
				var r = await one( ids[ i ], opts );
				if ( r.ok ) { res.ok++; } else if ( r.skipped ) { res.skipped++; } else if ( r.error ) { res.errors.push( r ); } else if ( opts.dry ) { res.last = r; }
			} catch ( e ) { res.errors.push( { id: ids[ i ], error: String( e && e.message || e ) } ); }
			window.vcbProgress = ( i + 1 ) + '/' + ids.length;
		}
		return res;
	}
	return { run: run, one: one, build: build, htmlToBlocks: htmlToBlocks };
} )();
