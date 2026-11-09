/* Calendars for the Vineyard events: small month calendars on the home page, a big one on the Calendar page. Plain JavaScript, no jQuery. */
(function () {
	if (!window.FullCalendar) { return; }
	var all = window.vccEvents || [];
	var calendars = [];
	function pick(cat) { return cat ? all.filter(function (e) { return e.cats.indexOf(cat) > -1; }) : all; }
	function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
	function mark(cal, el) { /* highlight days that have an event (the website's own stylesheet colours .day-has-event) */
		var days = {};
		cal.getEvents().forEach(function (e) { if (e.start) { days[e.start.toISOString().slice(0, 10)] = 1; var d = new Date(e.start); days[d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2)] = 1; } });
		el.querySelectorAll('.fc-day-top[data-date]').forEach(function (c) { c.classList.toggle('day-has-event', !!days[c.getAttribute('data-date')]); });
	}
	document.querySelectorAll('.mini-calendar[data-calendar]').forEach(function (el) {
		var cal = new FullCalendar.Calendar(el, {
			plugins: ['dayGrid'], defaultView: 'dayGridMonth', header: { left: 'prev,next today,dayGridMonth', center: '', right: 'title' }, eventLimit: true,
			/* day numbers are links (the site's stylesheet underlines days that have events); a day opens its first event */
			navLinks: true, navLinkDayClick: function (date) { var d = ymd(date); var hit = cal.getEvents().filter(function (e) { return e.start && ymd(e.start) === d; })[0]; if (hit && hit.url) { window.location = hit.url; } },
			events: pick(el.getAttribute('data-calendar')), eventRender: function (i) { i.el.style.backgroundColor = i.event.backgroundColor; },
			eventClick: function (i) { if (i.event.url) { i.jsEvent.preventDefault(); window.location = i.event.url; } },
			datesRender: function () { mark(cal, el); }
		});
		cal.render(); calendars.push(cal); mark(cal, el);
	});
	var big = document.getElementById('vcc-full-calendar');
	var bigCal = null;
	if (big) {
		bigCal = new FullCalendar.Calendar(big, {
			plugins: ['dayGrid'], defaultView: 'dayGridMonth', header: { left: 'prev,next today', center: 'title', right: '' }, eventLimit: true, events: all,
			eventRender: function (i) { i.el.style.backgroundColor = i.event.backgroundColor; i.el.style.borderColor = i.event.backgroundColor; },
			eventClick: function (i) { if (i.event.url) { i.jsEvent.preventDefault(); window.location = i.event.url; } }
		});
		bigCal.render();
		document.querySelectorAll('#calendar-filters a').forEach(function (a) {
			a.addEventListener('click', function (ev) {
				ev.preventDefault();
				var id = a.getAttribute('data-calendar-id'); var cat = id === 'clear' ? '' : id;
				bigCal.getEventSources().forEach(function (s) { s.remove(); }); bigCal.addEventSource(pick(cat));
				document.querySelectorAll('.vcc-upcoming-item').forEach(function (li) { li.style.display = (!cat || li.getAttribute('data-cats').split(' ').indexOf(cat) > -1) ? '' : 'none'; });
			});
		});
	}
	/* events in the small lists open their page */
	function go(e) { var c = e.target.closest('.cal-content[data-href]'); if (c && (e.type === 'click' || e.key === 'Enter')) { window.location = c.getAttribute('data-href'); } }
	document.addEventListener('click', go); document.addEventListener('keydown', go);
	/* tabs (Meetings / Community / Recreation). Always handled here: this file loads before the theme's own script, so
	   relying on it left the tabs dead (fixed in 1.0.3). Switching is idempotent, so another script doing the same is harmless. */
	var tabs = document.querySelectorAll('#events-tabs .tab');
	var panes = document.querySelectorAll('#tabContent .tab-event');
	function show(idx) {
		tabs.forEach(function (x, i) { x.classList.toggle('active', i === idx); x.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
		panes.forEach(function (p, i) { p.classList.toggle('active', i === idx); p.style.display = ''; }); // the stylesheet lays out the active tab (flex)
		setTimeout(function () { calendars.forEach(function (c) { c.updateSize(); }); }, 60);
	}
	tabs.forEach(function (t, idx) {
		t.setAttribute('role', 'tab');
		t.addEventListener('click', function (e) { e.preventDefault(); show(idx); });
	});
})();
