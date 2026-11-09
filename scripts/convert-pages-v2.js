/*
 * Second pass: rebuilds pages so no part is a Custom HTML block, and points document links at the Media Library.
 * Run in wp-admin on an editor screen:  await vcb2.run()
 * Pages whose Custom HTML parts were lost are rebuilt from their last version before the first conversion.
 */
window.vcb2 = ( function () {
	var B = wp.blocks, api = wp.apiFetch;
	var media = null; // lowercased file name (no extension) -> Media Library URL

	function esc( s ) { var d = document.createElement( 'div' ); d.textContent = s == null ? '' : s; return d.innerHTML; }
	function txt( el ) { return ( el && el.textContent || '' ).replace( /\s+/g, ' ' ).trim(); }

	async function loadMedia() {
		if ( media ) { return media; }
		media = {};
		for ( var p = 1; ; p++ ) {
			var b = await api( { path: '/wp/v2/media?per_page=100&context=edit&_fields=id,source_url,title&page=' + p } ).catch( function () { return []; } );
			b.forEach( function ( m ) {
				var t = ( m.title && ( m.title.raw || m.title.rendered ) || '' ).toLowerCase().trim();
				if ( t && ! media[ t ] ) { media[ t ] = m.source_url; }
				var f = decodeURIComponent( m.source_url.split( '/' ).pop() ).replace( /\.[a-z0-9]+$/i, '' ).toLowerCase();
				if ( ! media[ f ] ) { media[ f ] = m.source_url; }
			} );
			if ( b.length < 100 ) { break; }
		}
		return media;
	}
	function mediaFor( path ) {
		var base = decodeURIComponent( path.split( '?' )[ 0 ].split( '#' )[ 0 ].split( '/' ).pop() || '' ).replace( /\+/g, ' ' );
		var key = base.replace( /\.[a-z0-9]+$/i, '' ).toLowerCase().trim();
		return media[ key ] || null;
	}
	/** Old copied-file links -> Media Library links (when the file is there). */
	function relink( s ) {
		return s.replace( /(?:https?:\/\/[a-z0-9.-]+)?\/wp-content\/themes\/vineyard\/files\/([^"'\s)<>]+)/gi, function ( all, path ) {
			try { return mediaFor( path ) || all; } catch ( e ) { return all; }
		} );
	}

	function para( html, cls ) { return B.createBlock( 'core/paragraph', cls ? { content: html, className: cls } : { content: html } ); }
	function cleanInline( el ) {
		var c = el.cloneNode( true );
		c.querySelectorAll( 'i.fa, script, style, input, button, form' ).forEach( function ( x ) { x.remove(); } );
		return c;
	}
	function fallback( el ) {
		var t = txt( el );
		return t ? [ para( esc( t ) ) ] : [];
	}
	function okBlock( b ) {
		if ( ! b ) { return null; }
		if ( b.name === 'core/html' || b.name === 'core/freeform' || b.name === 'core/missing' || b.name === 'core/shortcode' && ! /\S/.test( b.attributes.text || '' ) ) {
			var d = document.createElement( 'div' ); d.innerHTML = b.attributes.content || b.originalContent || '';
			return fallback( d );
		}
		if ( b.innerBlocks && b.innerBlocks.length ) { b.innerBlocks = flat( b.innerBlocks.map( okBlock ) ); }
		return b;
	}
	function flat( a ) { var o = []; a.forEach( function ( x ) { o = o.concat( x || [] ); } ); return o; }
	function raw( markup ) {
		if ( ! markup.replace( /<br\s*\/?>|&nbsp;|\s/gi, '' ) ) { return []; }
		var d = document.createElement( 'div' ); d.innerHTML = markup;
		d.querySelectorAll( 'i.fa, script, style' ).forEach( function ( x ) { x.remove(); } );
		var out = B.rawHandler( { HTML: d.innerHTML } ) || [];
		return flat( out.map( okBlock ) );
	}

	var SOCIAL = [ [ /facebook/, 'facebook' ], [ /instagram/, 'instagram' ], [ /twitter|x\.com/, 'twitter' ], [ /linkedin/, 'linkedin' ], [ /youtube/, 'youtube' ] ];
	function socialLinks( links ) {
		var items = [];
		links.forEach( function ( a ) {
			var h = a.getAttribute( 'href' ) || '';
			for ( var i = 0; i < SOCIAL.length; i++ ) { if ( SOCIAL[ i ][ 0 ].test( h ) ) { items.push( B.createBlock( 'core/social-link', { url: h, service: SOCIAL[ i ][ 1 ] } ) ); return; } }
		} );
		return items.length ? [ B.createBlock( 'core/social-links', { className: 'directory-social' }, items ) ] : [];
	}
	function label( i ) {
		var c = i ? i.className : '';
		if ( /fa-phone/.test( c ) ) { return 'Phone: '; }
		if ( /fa-envelope/.test( c ) ) { return 'Email: '; }
		if ( /fa-map-marker/.test( c ) ) { return 'Address: '; }
		if ( /fa-globe/.test( c ) ) { return 'Website: '; }
		return '';
	}
	function linkHtml( a ) {
		var h = a.getAttribute( 'href' ) || '';
		var t = txt( a ) || h;
		var tgt = a.getAttribute( 'target' ) === '_blank' ? ' target="_blank" rel="noreferrer noopener"' : '';
		return '<a href="' + esc( h ) + '"' + tgt + '>' + esc( t ) + '</a>';
	}
	/** Contact lines (phone, email, address, website) as paragraphs, plus social icons. */
	function contactLines( box ) {
		var out = [];
		box.querySelectorAll( '.bus-detail > a, .bus-detail > span, .rz-business-links .pull-left > a, .rz-business-links .pull-left > span' ).forEach( function ( n ) {
			if ( n.closest( '.business-social-links' ) ) { return; }
			var lab = label( n.querySelector( 'i.fa' ) );
			var a = n.tagName === 'A' ? n : n.querySelector( 'a' );
			var html = a ? linkHtml( a ) : esc( txt( n ) );
			if ( txt( n ) ) { out.push( para( ( lab ? '<strong>' + lab + '</strong>' : '' ) + html, 'directory-line' ) ); }
		} );
		var soc = box.querySelector( '.business-social-links' );
		if ( soc ) { out = out.concat( socialLinks( Array.prototype.slice.call( soc.querySelectorAll( 'a' ) ) ) ); }
		return out;
	}
	function mapButton( iframe ) {
		var src = iframe.getAttribute( 'src' ) || '';
		var q = ( src.match( /[?&]q=([^&]+)/ ) || [] )[ 1 ];
		if ( ! q ) { return []; }
		var url = 'https://www.google.com/maps/search/?api=1&query=' + q.trim();
		return [ B.createBlock( 'core/buttons', {}, [ B.createBlock( 'core/button', { text: 'View on map', url: url, linkTarget: '_blank', rel: 'noreferrer noopener' } ) ] ) ];
	}
	function bgImage( el ) {
		var st = el && el.getAttribute( 'style' ) || '';
		var at = st.indexOf( 'url(' );
		if ( at < 0 ) { return ''; }
		var rest = st.slice( at + 4 );
		var end = rest.search( /['"]?\)\s*(center|no-repeat|top|left|right|bottom|\/|;|$)/ );
		var u = ( end < 0 ? rest : rest.slice( 0, end ) ).replace( /^\s*['"]?/, '' ).split( '?' )[ 0 ].trim();
		if ( ! /^(https?:)?\//.test( u ) ) { u = '/wp-content/themes/vineyard/files/' + u.split( '/' ).map( encodeURIComponent ).join( '/' ); }
		return relink( u );
	}

	/** One directory entry (staff, council member, business) -> columns. */
	function directoryItem( blk ) {
		var img = bgImage( blk.querySelector( '.rz-block-img' ) );
		var col2 = blk.querySelector( '.col-md-5' ) || blk;
		var name = col2.querySelector( 'h2' );
		var more = col2.querySelector( '.rz-bus-readmore' );
		var mid = [];
		if ( name ) { mid.push( B.createBlock( 'core/heading', { level: 3, content: esc( txt( name ) ), className: 'directory-name' } ) ); }
		var rest = col2.cloneNode( true ); // everything between the name and Read More (the browser may have moved it out of its span)
		var rn = rest.querySelector( 'h2' ); if ( rn ) { rn.remove(); }
		rest.querySelectorAll( '.rz-bus-readmore' ).forEach( function ( x ) { x.remove(); } );
		var descHtml = rest.innerHTML.replace( /<h2/g, '<p' ).replace( /<\/h2>/g, '</p>' );
		mid = mid.concat( raw( descHtml ) );
		if ( more ) { mid.push( para( '<a href="' + esc( more.getAttribute( 'href' ) ) + '">Read More</a>', 'directory-more' ) ); }
		var right = contactLines( blk );
		var cols = [
			B.createBlock( 'core/column', { width: '25%' }, img ? [ B.createBlock( 'core/image', { url: img, alt: name ? txt( name ) : '', sizeSlug: 'full', className: 'directory-photo' } ) ] : [] ),
			B.createBlock( 'core/column', { width: '42%' }, mid ),
			B.createBlock( 'core/column', { width: '33%' }, right )
		];
		return [ B.createBlock( 'core/columns', { className: 'directory-item' }, cols ), B.createBlock( 'core/separator', { className: 'is-style-wide directory-sep' } ) ];
	}
	function directoryList( el ) {
		var out = [];
		el.querySelectorAll( '.letter-label, .rz-business-block' ).forEach( function ( n ) {
			if ( ! n.classList.contains( 'letter-label' ) ) { out = out.concat( directoryItem( n ) ); } // A, B, C... labels were hidden on the original site
		} );
		return out;
	}
	/** Business / person detail page box. */
	function detailBox( el ) {
		var out = contactLines( el );
		var f = el.querySelector( 'iframe' );
		if ( f ) { out = out.concat( mapButton( f ) ); }
		return out;
	}
	/** FAQ: category headings and one fold-out box per question. */
	function faq( el ) {
		var out = [];
		el.querySelectorAll( '.faq-category' ).forEach( function ( cat ) {
			var h = cat.querySelector( '.faq-header' );
			if ( h && txt( h ) ) { out.push( B.createBlock( 'core/heading', { level: 3, content: esc( txt( h ) ), className: 'faq-heading' } ) ); }
			cat.querySelectorAll( '.faq-item' ).forEach( function ( it ) {
				var q = it.querySelector( '.faq-question-header' ) || it.querySelector( '.faq-question' );
				var a = it.querySelector( '.faq-answer' );
				out.push( B.createBlock( 'core/details', { summary: esc( txt( q ) ), className: 'faq-item' }, a ? raw( a.innerHTML ) : [] ) );
			} );
		} );
		if ( ! out.length ) { // FAQ without categories
			el.querySelectorAll( '.faq-item' ).forEach( function ( it ) {
				var q = it.querySelector( '.faq-question-header' ) || it.querySelector( '.faq-question' );
				var a = it.querySelector( '.faq-answer' );
				out.push( B.createBlock( 'core/details', { summary: esc( txt( q ) ), className: 'faq-item' }, a ? raw( a.innerHTML ) : [] ) );
			} );
		}
		return out;
	}
	function iframeBlocks( f ) {
		var src = f.getAttribute( 'src' ) || '';
		if ( /youtube\.com|youtu\.be|vimeo\.com/.test( src ) ) {
			var u = src.replace( /\/embed\/([^?]+).*/, '/watch?v=$1' ).replace( 'youtube-nocookie.com', 'youtube.com' );
			return [ B.createBlock( 'core/embed', { url: u, providerNameSlug: /vimeo/.test( u ) ? 'vimeo' : 'youtube', type: 'video', responsive: true } ) ];
		}
		if ( /google\.[a-z.]+\/maps|maps\.google/.test( src ) ) { return mapButton( f ); }
		if ( ! src ) { return []; }
		var host = ( src.split( '/' )[ 2 ] || '' ).replace( /^www\./, '' );
		var name = f.getAttribute( 'title' ) || ( /calendar\.google/.test( src ) ? 'Open calendar' : /forms|form/.test( src ) ? 'Open form' : 'Open ' + host );
		return [ B.createBlock( 'core/buttons', {}, [ B.createBlock( 'core/button', { text: esc( name ), url: src.replace( /^\/\//, 'https://' ), linkTarget: '_blank', rel: 'noreferrer noopener' } ) ] ) ];
	}

	var DROP = '.rz-block-edit, .faq-editbtns, .seq-no, .newbtn, .chooseBtn, .categorybtn, .faq-search, .faq-filter-count, #rz-business-directory-search, #rz-business-categories, #selected-business-categories, a[name]:empty, script, style, noscript, label.sr-only, input[type=text], input[type=search]';
	var CONTAINERS = /^(div|section|article|header|footer|span|main|aside|nav|font|center|figure)$/;

	function node( el ) {
		if ( el.nodeType === 3 ) { return raw( el.textContent.replace( /</g, '&lt;' ) ); }
		if ( el.nodeType !== 1 ) { return []; }
		var tag = el.tagName.toLowerCase();
		if ( el.matches( '.rz-block-list, #rz-business-list' ) || el.querySelector( ':scope .rz-business-block' ) && ! el.matches( '.rz-business-block' ) && el.matches( 'article, section' ) ) { return directoryList( el ); }
		if ( el.matches( '.rz-business-block' ) ) { return directoryItem( el ); }
		if ( el.matches( '.faq-container' ) || el.matches( '.faq-category' ) ) { return faq( el.matches( '.faq-category' ) ? wrap( el ) : el ); }
		if ( el.querySelector( ':scope > .bus-detail' ) || el.matches( '.bus-detail' ) ) { return detailBox( el.matches( '.bus-detail' ) ? el.parentNode : el ); }
		if ( el.matches( '.business-social-links' ) ) { return socialLinks( Array.prototype.slice.call( el.querySelectorAll( 'a' ) ) ); }
		if ( tag === 'iframe' ) { return iframeBlocks( el ); }
		if ( tag === 'embed' || tag === 'object' ) {
			var s = el.getAttribute( 'src' ) || el.getAttribute( 'data' ) || '';
			return s ? [ B.createBlock( 'core/file', { href: relink( s ), fileName: esc( decodeURIComponent( s.split( '/' ).pop().split( '?' )[ 0 ] ) ), textLinkHref: relink( s ), displayPreview: /\.pdf/i.test( s ), showDownloadButton: true } ) ] : [];
		}
		if ( tag === 'video' || tag === 'audio' ) {
			var vs = el.getAttribute( 'src' ) || ( el.querySelector( 'source' ) || { getAttribute: function () { return ''; } } ).getAttribute( 'src' );
			return vs ? [ B.createBlock( tag === 'video' ? 'core/video' : 'core/audio', { src: relink( vs ) } ) ] : [];
		}
		if ( tag === 'form' ) { return children( el ); }
		if ( tag === 'details' && el.querySelector( ':scope > summary' ) ) {
			var sum = el.querySelector( ':scope > summary' ), rest = el.cloneNode( true );
			rest.removeChild( rest.querySelector( ':scope > summary' ) );
			var cls = ( el.getAttribute( 'class' ) || '' ).trim();
			return [ B.createBlock( 'core/details', { summary: cleanInline( sum ).innerHTML.trim(), className: cls || undefined, showContent: el.hasAttribute( 'open' ) }, children( rest ) ) ];
		}
		if ( tag === 'a' && /\b(btn|button|rz-btn|newbtn)\b/.test( el.className ) && txt( el ) ) {
			return [ B.createBlock( 'core/buttons', {}, [ B.createBlock( 'core/button', { text: esc( txt( el ) ), url: el.getAttribute( 'href' ) || '', linkTarget: el.getAttribute( 'target' ) || undefined } ) ] ) ];
		}
		if ( CONTAINERS.test( tag ) && el.children.length && hasBlockChild( el ) ) {
			var inner = children( el );
			var keep = ( el.getAttribute( 'class' ) || '' ).split( /\s+/ ).filter( function ( c ) { return /^(docs-list|docs-group)$/.test( c ); } );
			return keep.length ? [ B.createBlock( 'core/group', { className: keep.join( ' ' ), layout: { type: 'default' } }, inner ) ] : inner;
		}
		if ( el.querySelector( 'iframe, embed, object, video, audio, details, form' ) ) { return children( el ); }
		return raw( cleanInline( el ).outerHTML );
	}
	function wrap( el ) { var d = document.createElement( 'div' ); d.appendChild( el.cloneNode( true ) ); return d; }
	var BLOCKY = /^(div|section|article|header|footer|main|aside|nav|p|h[1-6]|ul|ol|table|details|iframe|embed|object|video|audio|form|figure|blockquote|hr|pre|center)$/i;
	function hasBlockChild( el ) { return Array.prototype.some.call( el.children, function ( c ) { return BLOCKY.test( c.tagName ); } ); }
	function children( parent ) {
		var out = [], inline = '';
		function flush() { if ( inline.replace( /<br\s*\/?>|&nbsp;|\s/gi, '' ) ) { out = out.concat( raw( inline ) ); } inline = ''; }
		Array.prototype.forEach.call( parent.childNodes, function ( n ) {
			var isInline = n.nodeType === 3 || ( n.nodeType === 1 && ! BLOCKY.test( n.tagName ) && ! /\b(btn|button|rz-btn|newbtn)\b/.test( n.className || '' ) && ! n.querySelector( 'iframe,embed,object,video,audio,details,form,div,p,ul,ol,table,h1,h2,h3,h4,h5,h6' ) );
			if ( isInline ) { inline += n.nodeType === 3 ? n.textContent.replace( /</g, '&lt;' ) : cleanInline( n ).outerHTML; return; }
			flush();
			out = out.concat( node( n ) );
		} );
		flush();
		return out;
	}
	function htmlToBlocks( markup ) {
		var doc = new DOMParser().parseFromString( '<div id="vcb-root">' + relink( markup ) + '</div>', 'text/html' );
		var root = doc.getElementById( 'vcb-root' );
		root.querySelectorAll( DROP ).forEach( function ( x ) { x.remove(); } );
		return children( root );
	}

	/** Replace empty Custom HTML parts in a converted page with the rebuilt old content. */
	function rebuildBody( oldRaw ) {
		var parsed = B.parse( oldRaw ), out = [];
		parsed.forEach( function ( b ) {
			if ( b.name === 'core/freeform' || b.name === 'core/html' ) {
				out = out.concat( htmlToBlocks( b.attributes.content || b.originalContent || '' ) );
			} else if ( b.name === 'core/missing' ) { out = out.concat( htmlToBlocks( b.originalContent || '' ) ); }
			else { out.push( b ); }
		} );
		return out;
	}
	function walk( list, fn ) { list.forEach( function ( b ) { fn( b ); walk( b.innerBlocks || [], fn ); } ); }
	function findMain( blocks ) {
		var m = null;
		walk( blocks, function ( b ) { if ( ! m && /\b(inner-main|entry-wrap)\b/.test( b.attributes.className || '' ) ) { m = b; } } );
		return m;
	}
	function check( content ) {
		var bad = 0, html = 0;
		walk( B.parse( content ), function ( b ) { if ( b.isValid === false ) { bad++; } if ( b.name === 'core/html' || b.name === 'core/freeform' ) { html++; } } );
		return { bad: bad, html: html };
	}

	async function oldVersion( id ) {
		var revs = await api( { path: '/wp/v2/pages/' + id + '/revisions?context=edit&per_page=100&_fields=id,content,date' } );
		for ( var i = 0; i < revs.length; i++ ) { // newest first
			var r = revs[ i ].content.raw || '';
			if ( r && ! /wp:vineyard\/(breadcrumbs|related-pages)/.test( r ) ) { return r; }
		}
		return null;
	}

	/** A page still in its original copied form: build the standard layout around its converted content. */
	function esc2( s ) { return esc( s ); }
	function freshLayout( raw, parts ) {
		var body = rebuildBody( raw );
		var full = /fullwidth/.test( parts.template || '' );
		var head = [ B.createBlock( 'vineyard/breadcrumbs' ), B.createBlock( 'core/post-title', { level: 1, className: 'page-title' } ) ];
		if ( parts.buttons && parts.buttons.length ) {
			head.push( B.createBlock( 'core/buttons', { className: 'inner-buttons' }, parts.buttons.map( function ( b ) {
				return B.createBlock( 'core/button', { text: esc2( b.label ), url: b.url, linkTarget: b.new_tab ? '_blank' : undefined, rel: b.new_tab ? 'noreferrer noopener' : undefined, className: 'inner-button' } );
			} ) ) );
		}
		var main = head.concat( body );
		if ( full ) { return { blocks: [ B.createBlock( 'core/group', { className: 'entry-wrap', layout: { type: 'default' } }, main ) ], template: 'page-full-width' }; }
		var rel = parts.related && parts.related !== '0' ? parts.related : '';
		var side = [ B.createBlock( 'vineyard/related-pages', rel ? { menu: rel } : {} ) ];
		var c = parts.contact;
		if ( c ) {
			var box = [];
			if ( c.title ) { box.push( B.createBlock( 'core/heading', { level: 2, content: esc2( c.title ), className: 'box-header' } ) ); }
			if ( c.text ) { box.push( para( esc2( c.text ), 'contact-details' ) ); }
			if ( c.phone ) { box.push( para( '<a href="' + c.phone_href + '">' + esc2( c.phone ) + '</a>', 'contact-link' ) ); }
			side.push( B.createBlock( 'core/group', { className: 'contact-box', backgroundColor: 'slate', textColor: 'base', layout: { type: 'default' } }, box ) );
		}
		return { blocks: [ B.createBlock( 'core/columns', { className: 'inner-layout' }, [
			B.createBlock( 'core/column', { width: '25%', className: 'inner-sidebar' }, side ),
			B.createBlock( 'core/column', { width: '75%', className: 'inner-main' }, main )
		] ) ], template: '' };
	}
	async function fresh( id, opts ) {
		var page = await api( { path: '/wp/v2/pages/' + id + '?context=edit&_fields=id,content' } );
		var cur = page.content.raw || '';
		if ( /wp:vineyard\/breadcrumbs/.test( cur ) ) { return { id: id, skipped: true }; }
		var parts = await api( { path: '/vineyard/v1/page-parts/' + id } );
		if ( parts.is_front ) { return { id: id, skipped: true }; }
		var r = freshLayout( cur, parts );
		var next = relink( B.serialize( r.blocks ) );
		var c = check( next );
		if ( c.bad || c.html ) { return { id: id, error: c.bad + ' invalid, ' + c.html + ' html' }; }
		if ( opts && opts.dry ) { return { id: id, content: next }; }
		await api( { path: '/wp/v2/pages/' + id, method: 'POST', data: { content: next, template: r.template } } );
		return { id: id, ok: true };
	}

	async function one( id, opts ) {
		var page = await api( { path: '/wp/v2/pages/' + id + '?context=edit&_fields=id,content' } );
		var cur = page.content.raw || '';
		var lost = ( opts && opts.force ) || /<!-- wp:html \/-->|<!-- wp:html -->\s*<!-- \/wp:html -->/.test( cur );
		var next = cur;
		if ( lost ) {
			var old = await oldVersion( id );
			if ( old === null ) { return { id: id, error: 'no earlier version' }; }
			var blocks = B.parse( cur );
			var main = findMain( blocks );
			if ( ! main ) { return { id: id, error: 'layout not found' }; }
			// keep the new page head (breadcrumbs, title, buttons), replace the body with the rebuilt old content
			var head = main.innerBlocks.filter( function ( b ) { return b.name === 'vineyard/breadcrumbs' || b.name === 'core/post-title' || /inner-buttons/.test( b.attributes.className || '' ); } );
			main.innerBlocks = head.concat( rebuildBody( old ) );
			next = B.serialize( blocks );
		} else {
			// already fine: convert any Custom HTML that still has content, and relink documents
			var bl = B.parse( cur ), changed = false;
			( function fix( list ) {
				for ( var i = 0; i < list.length; i++ ) {
					var b = list[ i ];
					if ( b.name === 'core/html' && ( b.attributes.content || b.originalContent ) ) {
						var rep = htmlToBlocks( b.attributes.content || b.originalContent );
						list.splice.apply( list, [ i, 1 ].concat( rep ) ); i += rep.length - 1; changed = true;
					} else if ( b.innerBlocks ) { fix( b.innerBlocks ); }
				}
			} )( bl );
			if ( changed ) { next = B.serialize( bl ); }
		}
		next = relink( next );
		if ( next === cur ) { return { id: id, skipped: true }; }
		var c = check( next );
		if ( c.bad || c.html ) { return { id: id, error: c.bad + ' invalid, ' + c.html + ' html' }; }
		if ( opts && opts.dry ) { return { id: id, content: next, lost: lost }; }
		await api( { path: '/wp/v2/pages/' + id, method: 'POST', data: { content: next } } );
		return { id: id, ok: true, lost: lost };
	}

	async function run( opts ) {
		opts = opts || {};
		await loadMedia();
		var ids = opts.ids;
		if ( ! ids ) {
			ids = [];
			for ( var p = 1; ; p++ ) {
				var b = await api( { path: '/wp/v2/pages?per_page=100&status=publish,draft,private&_fields=id&page=' + p } ).catch( function () { return []; } );
				ids = ids.concat( b.map( function ( x ) { return x.id; } ) );
				if ( b.length < 100 ) { break; }
			}
		}
		var res = { ok: 0, rebuilt: 0, skipped: 0, errors: [], done: false }, q = ids.slice();
		window.vcb2Res = res;
		async function worker() {
			while ( q.length ) {
				var id = q.shift();
				try {
					var r = await one( id, opts );
					if ( r.ok ) { res.ok++; if ( r.lost ) { res.rebuilt++; } } else if ( r.skipped ) { res.skipped++; } else if ( r.error ) { res.errors.push( r ); } else if ( opts.dry ) { res.last = r; }
				} catch ( e ) { res.errors.push( { id: id, error: String( e && e.message || e ) } ); }
				res.left = q.length;
			}
		}
		await Promise.all( [ 1, 2, 3, 4, 5, 6 ].map( worker ) );
		res.done = true;
		return res;
	}
	return { run: run, one: one, fresh: fresh, htmlToBlocks: htmlToBlocks, loadMedia: loadMedia, relink: relink };
} )();
