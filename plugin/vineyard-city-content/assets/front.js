/* Alerts: the little x hides the alert for this visit. */
document.addEventListener('click', function (e) {
	var b = e.target.closest('.vcc-alert-close');
	if (!b) { return; }
	var box = b.closest('.vcc-alert'); box.style.display = 'none';
	try { sessionStorage.setItem('vcc-alert-' + box.getAttribute('data-alert'), '1'); } catch (x) {}
});
document.querySelectorAll('.vcc-alert').forEach(function (a) { try { if (sessionStorage.getItem('vcc-alert-' + a.getAttribute('data-alert'))) { a.style.display = 'none'; } } catch (x) {} });
