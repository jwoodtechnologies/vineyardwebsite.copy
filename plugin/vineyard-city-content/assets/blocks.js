/* Registers the Vineyard blocks in the editor. They are "live" blocks: the editor shows a preview, the content is edited under Vineyard Site Content. */
(function (wp) {
	var el = wp.element.createElement;
	var SSR = wp.serverSideRender;
	Object.keys(vccBlocks.blocks).forEach(function (slug) {
		var b = vccBlocks.blocks[slug];
		wp.blocks.registerBlockType('vineyard-city-content/' + slug, {
			title: b[0], description: b[2], category: 'vineyard', icon: 'admin-home', supports: { html: false, align: false },
			edit: function () {
				return el('div', { className: 'vcc-block-preview' },
					el('p', { style: { margin: '0 0 6px', padding: '6px 10px', background: '#f0f6fc', borderLeft: '4px solid #2271b1', fontSize: '13px' } }, b[0] + ' – ' + b[2]),
					el(SSR, { block: 'vineyard-city-content/' + slug }));
			},
			save: function () { return null; }
		});
	});
})(window.wp);
