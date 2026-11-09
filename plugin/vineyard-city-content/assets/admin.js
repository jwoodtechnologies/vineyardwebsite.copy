(function ($) {
	$(document).on('click', '.vcc-pick', function (e) {
		e.preventDefault();
		var box = $(this).closest('.vcc-image');
		var frame = wp.media({ title: 'Choose a picture', button: { text: 'Use this picture' }, multiple: false, library: { type: 'image' } });
		frame.on('select', function () {
			var a = frame.state().get('selection').first().toJSON();
			box.find('input[type=hidden]').val(a.id);
			box.find('img').attr('src', a.url).show();
		});
		frame.open();
	});
	$(document).on('click', '.vcc-clear', function (e) {
		e.preventDefault();
		var box = $(this).closest('.vcc-image');
		box.find('input[type=hidden]').val('0');
		box.find('img').hide();
	});
})(jQuery);
