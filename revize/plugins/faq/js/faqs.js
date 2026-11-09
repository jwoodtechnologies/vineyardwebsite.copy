$(document).ready(function() {
	$('.faqs-heading').each(function() {
		$(this).attr({
			"tabindex": "0",
			"aria-expanded": "false",
			"aria-label": $(this).text() + "Press Enter or Your Screen Reader Action Keys to Find out more",
			"role": "article"
		});
	});
	$(".faqs-toggle-content").hide();

	$('.faqs-heading').on('click keypress', function(event) {
		event.preventDefault();
		if (event.keyCode === 13 || event.type === 'click') {
			$(this)
				.next('.faqs-toggle-content')
				.slideToggle(300);
			if ($(this).hasClass("active")) {
				$(this).attr({"aria-expanded": "false"});
			} else {
				$(this).attr({"aria-expanded": "true"});
			}
			$(this).toggleClass("active");
		}
	});
});