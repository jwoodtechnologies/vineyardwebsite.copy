( function () {
	// Quick links: arrows scroll the row of buttons.
	document.querySelectorAll( '.quick-links' ).forEach( function ( box ) {
		var track = box.querySelector( '.quick-links__track' );
		if ( ! track ) { return; }
		function add( cls, label, dir ) {
			var b = document.createElement( 'button' );
			b.type = 'button';
			b.className = 'vcb-arrow ' + cls;
			b.setAttribute( 'aria-label', label );
			b.innerHTML = '<i class="fa fa-angle-' + ( dir < 0 ? 'left' : 'right' ) + '" aria-hidden="true"></i>';
			b.addEventListener( 'click', function () {
				var max = track.scrollWidth - track.clientWidth;
				var next = track.scrollLeft + dir * track.clientWidth;
				if ( dir > 0 && track.scrollLeft >= max - 2 ) { next = 0; }
				if ( dir < 0 && track.scrollLeft <= 2 ) { next = max; }
				track.scrollTo( { left: next, behavior: 'smooth' } );
			} );
			box.appendChild( b );
			return b;
		}
		function toggle() {
			var show = track.scrollWidth > track.clientWidth + 2;
			box.querySelectorAll( '.vcb-arrow' ).forEach( function ( b ) { b.style.display = show ? '' : 'none'; } );
		}
		add( 'prev', 'Previous', -1 );
		add( 'next', 'Next', 1 );
		toggle();
		window.addEventListener( 'resize', toggle );
	} );

} )();
