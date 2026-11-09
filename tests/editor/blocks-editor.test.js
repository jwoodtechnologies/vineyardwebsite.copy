/**
 * Editor test for the Vineyard City blocks, using the REAL WordPress block library (@wordpress/blocks, @wordpress/element).
 *
 *   php tests/editor/dump-editor-data.php > /tmp/editor-data.json
 *   NODE_PATH=<dir with @wordpress/blocks, react, react-dom> node tests/editor/blocks-editor.test.js /tmp/editor-data.json
 *
 * What WordPress does in the editor, reproduced: server block definitions (block.json) are bootstrapped, the plugin's editor
 * script (assets/blocks-editor.js) runs with its localized data, then the saved page content is parsed.
 * Fails if any block would show as "Your site doesn't include support for … block" (core/missing), is invalid
 * ("Attempt recovery"), changes when re-saved, is missing from the "Vineyard City" inserter category, or its editor card
 * does not render a title, help line, edit link and live preview.
 */
// a browser DOM, as in the editor (the block parser uses it)
const { JSDOM } = require( 'jsdom' );
const dom = new JSDOM( '<!doctype html><html><body></body></html>' );
global.window = dom.window; global.document = dom.window.document; global.Node = dom.window.Node; global.DOMParser = dom.window.DOMParser;
global.HTMLElement = dom.window.HTMLElement; global.MutationObserver = dom.window.MutationObserver;
for ( const k of [ 'requestAnimationFrame', 'cancelAnimationFrame' ] ) { global[ k ] = global[ k ] || ( ( cb ) => setTimeout( cb, 0 ) ); }
const fs = require( 'fs' );
const path = require( 'path' );
const vm = require( 'vm' );
const blocks = require( '@wordpress/blocks' );
const element = require( '@wordpress/element' );
const data = require( '@wordpress/data' );
const { renderToStaticMarkup } = require( 'react-dom/server' );

const ROOT = path.resolve( __dirname, '../..' );
const dump = JSON.parse( fs.readFileSync( process.argv[ 2 ], 'utf8' ) );
const seed = JSON.parse( fs.readFileSync( path.join( ROOT, 'plugin/vineyard-city-content/data/seed.json' ), 'utf8' ) );
let failures = 0;
const check = ( ok, what ) => { console.log( ( ok ? '  ok   ' : '  FAIL ' ) + what ); if ( ! ok ) failures++; };

// silence the library's own console chatter (deprecations etc.) but keep errors visible as failures
const errors = [];
console.warn = () => {};
const origError = console.error; console.error = ( ...a ) => { errors.push( a.join( ' ' ) ); };

// 1. what PHP gives the editor: block categories + server-side block definitions (from block.json)
data.dispatch( blocks.store ).setCategories( dump.categories.map( ( c ) => ( { slug: c.slug, title: c.title } ) ).concat( blocks.getCategories() ) );
const serverDefs = {};
for ( const [ name, m ] of Object.entries( dump.blocks ) ) {
	serverDefs[ name ] = { apiVersion: m.apiVersion, title: m.title, description: m.description, icon: m.icon, category: m.category, keywords: m.keywords, attributes: m.attributes, supports: m.supports };
}
blocks.unstable__bootstrapServerSideBlockDefinitions( serverDefs );

// 2. the plugin's editor script, with the globals WordPress provides
const wp = {
	blocks, element,
	blockEditor: { useBlockProps: ( p ) => Object.assign( { 'data-block-props': '1' }, p ) },
	components: { Disabled: ( { children } ) => element.createElement( 'div', { 'data-disabled': '1' }, children ), Spinner: () => null },
	serverSideRender: ( props ) => element.createElement( 'div', { 'data-live-preview': props.block } ),
};
const sandbox = { window: { wp, [ dump.localized.var ]: dump.localized.data }, console };
vm.runInNewContext( fs.readFileSync( path.join( ROOT, 'plugin/vineyard-city-content/assets/blocks-editor.js' ), 'utf8' ), sandbox );

console.log( 'Registration' );
for ( const name of Object.keys( dump.blocks ) ) {
	const t = blocks.getBlockType( name );
	check( !! t && typeof t.edit === 'function' && t.category === 'vineyard' && t.supports.inserter !== false, `${ name }: registered, in the “Vineyard City” inserter category` );
}
check( dump.localized.handle === 'vcc-blocks-editor' && Object.values( dump.blocks ).every( ( m ) => m.editorScript === 'vcc-blocks-editor' ), 'every block.json loads the editor script that registers it' );

// WordPress's own paragraph block, minimal stand-in (the real one ships with WordPress, not with this plugin)
blocks.registerBlockType( 'core/paragraph', { title: 'Paragraph', category: 'text', attributes: { content: { type: 'string', source: 'html', selector: 'p', default: '' } },
	edit: () => null, save: ( { attributes } ) => element.createElement( element.RawHTML, null, '<p>' + attributes.content + '</p>' ) } );

// 3. saved page content → editor
const v101 = [ 'quick-links', 'events', 'photo-tiles', 'social', 'newsletter' ].map( ( s ) => `<!-- wp:vineyard-city-content/${ s } /-->` ).join( '\n\n' );
const rearranged = [ 'home-banner', 'photo-tiles', 'quick-links', 'events', 'alerts' ].map( ( s ) => `<!-- wp:vineyard-city-content/${ s } /-->` ).join( '\n\n' ); // dragged + newsletter/social removed
const mixed = seed.home_content + '\n\n<!-- wp:paragraph -->\n<p>Welcome to Vineyard!</p>\n<!-- /wp:paragraph -->';
for ( const [ label, content ] of [ [ 'new Home page (seed)', seed.home_content ], [ 'Home page saved by 1.0.1', v101 ], [ 're-arranged by the clerk', rearranged ], [ 'with a paragraph added', mixed ] ] ) {
	console.log( `Parse: ${ label }` );
	const parsed = blocks.parse( content ).filter( ( b ) => b.name ); // drop whitespace-only freeform
	const bad = parsed.filter( ( b ) => b.name === 'core/missing' || ! blocks.getBlockType( b.name ) );
	check( bad.length === 0, `no “Your site doesn’t include support for … block” (${ parsed.map( ( b ) => b.name.replace( 'vineyard-city-content/', '' ) ).join( ', ' ) })` );
	check( parsed.every( ( b ) => b.isValid !== false && ! ( b.validationIssues || [] ).length ), 'every block valid – no “Attempt recovery”' );
	const again = blocks.serialize( blocks.parse( content ) );
	check( again.replace( /\s+/g, ' ' ).trim() === content.replace( /\s+/g, ' ' ).trim(), 'saving it again produces the same content (no “unsaved changes”)' );
}

console.log( 'Inserter: add a section back' );
for ( const name of Object.keys( dump.blocks ) ) {
	const made = blocks.createBlock( name );
	const html = blocks.serialize( made );
	const back = blocks.parse( html )[ 0 ];
	check( html === `<!-- wp:${ name } /-->` && back.name === name && back.isValid, `${ name.replace( 'vineyard-city-content/', '' ) } inserts as ${ html }` );
}

console.log( 'Editor card' );
for ( const b of dump.localized.data.blocks ) {
	const t = blocks.getBlockType( b.name );
	const html = renderToStaticMarkup( element.createElement( t.edit, { attributes: {}, clientId: 'x', isSelected: false, setAttributes() {} } ) );
	check( html.includes( b.title ) && html.includes( b.description.slice( 0, 30 ) ) && html.includes( `href="${ b.editUrl }"` ) && html.includes( b.editLabel.replace( /&/g, '&amp;' ) ) && html.includes( `data-live-preview="${ b.name }"` ) && html.includes( 'data-block-props' ),
		`${ b.title }: card with title, help line, “${ b.editLabel }” → ${ b.editUrl.replace( 'https://example.test/wp-admin/', '' ) }, live preview` );
}
check( errors.length === 0, 'no errors logged by the block library' + ( errors.length ? ': ' + errors.slice( 0, 3 ).join( ' | ' ) : '' ) );
console.error = origError;
console.log( failures ? `\n${ failures } check(s) FAILED` : '\nAll editor checks passed' );
process.exit( failures ? 1 : 0 );
