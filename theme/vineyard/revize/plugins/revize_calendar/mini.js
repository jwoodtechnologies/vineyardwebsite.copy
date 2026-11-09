var icalExport = ics();
var RZCalendarTimezone = RZCalendarTimezone || null;
var calendarProps = calendarProps || {};

var VIEWS = {
    'month': 'dayGridMonth',
    'week': 'timeGridWeek',
    'day': 'timeGridDay',
    'list-month': 'listMonth',
    'list-week': 'listWeek',
    'list-day': 'listDay',
    'list': 'listMonth'
}

var SHORT_MONTHS =  [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC'
];

$(function(){
	var RZ_ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
    var RZ_RRULE_FORMAT = 'YYYYMMDDTHHmmss';
	$('[id^=mini-events][data-template-file]').each(function() {
		var fcEvents = [];
		var filteredEvents = {};
		var td = new Date();
		var tdAll = new Date().setHours(0,0,0,0);
		var jsonEvents = [],
			icsEvents = [],
			$calendars = [],
			fullCalendars = [],
			templateFile = 'template.html';
		var ImportCals = ImportCals || [""];
		var googleTimer;
		var googleFeeds = [];
		var calShowLoading = calShowLoading || true;
		var templateElement = $(this);

        templateFile = $(templateElement).attr('data-template-file') || templateFile;

		$.get('./_assets_/plugins/revizeCalendar/templates/'+templateFile, function(){
			console.log('fetching mini events template.');
		}).fail(function(){
			console.log('error fetching html template.');
		})
		.done(function(template){

			$(templateElement).html(template);

			// Check for calendar imports.
			$.get('./_assets_/plugins/revizeCalendar/cache/calendarimport.ics', function(){
				console.log('Checking for calendar import.');
			})
			.fail(function(){
				icsEvents = [];
			})
			.done(function(icsData, textStatus, jXHRObj){
				if (jXHRObj.getAllResponseHeaders().toUpperCase().indexOf("CONTENT-TYPE: APPLICATION/JSON") == -1) { icsEvents = []; }
				// parse the ics data
				var jcalData = ICAL.parse(icsData.trim());
				var comp = new ICAL.Component(jcalData);
				var eventComps = comp.getAllSubcomponents("vevent");
				// map them to FullCalendar events
				icsEvents = $.map(eventComps, function (item) {

					if (item.getFirstPropertyValue("class") == "PRIVATE") {
						return null;
					} else {
						//console.log(item.getFirstPropertyValue('tzid'));
						var dtstart=item.getFirstPropertyValue("dtstart").toString();
						var t = dtstart.replace(/:/g,'').substr(dtstart.indexOf('T') + 1);
						var zeros = t.match(/([0-9]+)/)[1];
						var hasStartTime = zeros.length > 6 || dtstart.indexOf("T000000") >= 0;
						var mstart = toMomentDate(dtstart);

						var hrs, mins, days;
						var allDay = true;

						if (item.getFirstPropertyValue("dtend") !== null) {

							allDay = false;

							var st = moment(dtstart);
							var en = moment(item.getFirstPropertyValue("dtend").toString());
							var du = moment.duration(en.diff(st));
							var diff = du.asMinutes();

							mins = 0;
							hrs = 0;

							while (diff >= (60 * 24)) {
								diff -= (60 * 24);
								hrs+=24;
							}
							while (diff >= 60) {
								diff -= 60;
								hrs++;
							}
							hrs = (hrs < 10) ? "0" + hrs : hrs;
							mins = diff;
							mins = (mins < 10) ? "0" + mins : mins;

						} else {

							if (item.getFirstPropertyValue("duration") !== null) {
								allDay = false;
								var duration = item.getFirstPropertyValue("duration").toString();

								var durTime = duration.indexOf('PT') >= 0 ? duration.replace('PT','') : '';
								var durDays = duration.indexOf('D') >= 0 ? duration.replace('P','') : '';
								var allDay = durTime === '0S';

								hrs = parseInt(durTime.indexOf('H') >= 0 ? durTime.match(/(\d+)H/)[1] : 0);
								mins = parseInt(durTime.indexOf('M') >= 0 ? durTime.match(/(\d+)M/)[1] : 0);
								days = parseInt(durDays.indexOf('D') >= 0 ? durDays.match(/(\d+)D/)[1] : 0);

								if(!allDay){
									hrs += (days*24);
									hrs += Math.floor(mins / 60);
									mins = mins % 60;
									hrs = (hrs < 10) ? "0" + hrs : hrs;
									mins = (mins < 10) ? "0" + mins : mins;
								} else {
									hrs = '00',
									mins = '00'
								}
							}
						}

						var desc;
						if (item.getFirstPropertyValue("description") !== null) {
							desc = item.getFirstPropertyValue("description").toString().replace(/\\r\\n/g,'').replace(/\\/g,'')
						} else if (item.getFirstPropertyValue("x-alt-desc") !== null) {
							desc = item.getFirstPropertyValue("x-alt-desc").toString().replace(/\\r\\n/g,'').replace(/\\/g,'')
						} else {
							desc = "";
						}

						var importedEvent = {
							"title": item.getFirstPropertyValue("summary").toString().replace(/\\r\\n/g,'').replace(/\\/g,''),
							"id": item.getFirstPropertyValue("uid").toString(),
							"desc": desc,
							"calendar_displays": ImportCals,
							"image": '<img src="noimage.gif"/>',
							"location": "",
							"color": defaultCalendarColor
						};

						if(!allDay){
							importedEvent.duration = hrs + ':' + mins;
						}
						var rrule=item.getFirstPropertyValue("rrule");
						if(rrule!= null){ //event recurs
							importedEvent.rrule = {};
							// if(rrule.freq) importedEvent.rrule.freq=rrule.freq;
							// if(rrule.parts.BYDAY) importedEvent.rrule.byweekday=rrule.parts.BYDAY;
							// if(rrule.until) importedEvent.rrule.until=rrule.until.toString();
							// if(rrule.interval) importedEvent.rrule.interval=rrule.interval;
							// if(rrule.parts.BYSETPOS) importedEvent.rrule.bysetpos=rrule.parts.BYSETPOS;
							// if(rrule.parts.BYMONTHDAY) importedEvent.rrule.bysetpos=rrule.parts.BYMONTHDAY;
							// if(rrule.parts.BYMONTH) importedEvent.rrule.bysetpos=rrule.parts.BYMONTH;
							// if(rrule.exdate) importedEvent.rrule.bysetpos=rrule.exdate;
							importedEvent.start = mstart.format(RZ_ISO_FORMAT);
							importedEvent.rrule = 'DTSTART:' + mstart.format(RZ_RRULE_FORMAT) + '\n' + 'RRULE:' + rrule.toString();
							//count duration ms
						} else {
							importedEvent.start = mstart.format(RZ_ISO_FORMAT);
						}
						var mEnd = moment(mstart);
						if(!hasStartTime && allDay){
							importedEvent.allDay = true;
						}
						if(allDay){
							if(hasStartTime){
								importedEvent.end = dtstart.substring(0, dtstart.indexOf('T') + 1 ) + '23:59:59';
							} else {
								importedEvent.start = dtstart;
								importedEvent.end = dtstart;
							}
						} else {
							importedEvent.end = moment(mEnd).add(parseInt(hrs),'hours').add(parseInt(mins),'minutes').format("YYYY-MM-DDTHH:mm:ss");
							importedEvent.end = importedEvent.end.substr(0,importedEvent.end.length - 2) + '00';
						}
						return importedEvent;
					}
				});
			}).always(function(){
				$.get('./_assets_/plugins/revizeCalendar/calendar_data_handler.php?webspace=' + RZ.webspace + '&relative_revize_url=' + RZ.protocolRelativeRevizeBaseUrl+'&protocol='+window.location.protocol, function(){
					console.log('called cache');
				}).done(function(data){
					jsonEvents = data;
					// Push each mini calendar into an array
					$(templateElement).find('.mini-calendar').each(function(i, el){

						var activeCalendars = $(el).attr('data-calendar') ? $(el).attr('data-calendar').split(",") : [];

						var includeAll = true;
						var includeList = [];
						var ignoreList = []; // Exclude event if is primary calendar
						var excludeList = []; // Exclude event if on ANY of these calendars
						for (var c = 0; c < activeCalendars.length; c++) {
							var cID = parseInt(activeCalendars[c]);
							if (isNaN(cID)) {
								excludeList.push(parseInt(activeCalendars[c].replace(/[^0-9]/g, "")));
							} else if (cID < 0) {
								ignoreList.push(cID * -1);
							} else {
								includeList.push(cID);
								includeAll = false;
							}
						}

						var calendarView = $(el).attr('data-calendar-view') !== undefined && $(el).attr('data-calendar-view').length ? $(el).attr('data-calendar-view') : 'month';
						if(VIEWS.hasOwnProperty(calendarView)){
							calendarView = VIEWS[calendarView];
						} else {
							calendarView = VIEWS['month'];
						}

						// Make sure that icsEvents belong on this calendar.
						var icsEventsFiltered = [];
						if (icsEvents.length) {
							if (activeCalendars.length == 0 ||
								icsEvents[0].calendar_displays.filter(function(cal, i) {
									var includeFlag = includeAll;
									var cID = parseInt(cal);
									if (i == 0) {
										if (ignoreList.indexOf(cID) > -1) {
											includeFlag = false;
											return;
										}
									}

									if (includeList.indexOf(cID) > -1) {
										includeFlag = true;
									}

									if (excludeList.indexOf(cID) > -1) {
										includeFlag = false;
										return;
									}
									return includeFlag;
								}).length > 0) {
								icsEventsFiltered = icsEvents;
							}
						}

						//Load in Google Feed info
						var gKey = $(el).attr('data-google-api') || "";
						var gFeed = $(el).attr('data-google-feed') || "";
						var googleFeed = {};


						// Add Google feed if it exists
						if(gFeed != ""){
							googleFeed = {
								googleCalendarId: gFeed,
								className: 'gcal-event',
								success: function(a,b) {
									// Add missing attributes to GCal events.
									a.forEach(function(v, c) {
										a[c].calendar_displays = (includeList.length) ? [includeList[0]] : [undefined];
										a[c].desc = (a[c].description == undefined) ? "" : a[c].description;
										if (!a[c].image) { a[c].image = '<img src="noimage.gif"/>'; }
									});
									googleFeeds[i] = 1;
								}
							};
							googleFeeds.push(0);
						}

						var calendar = new FullCalendar.Calendar($(el)[0], {
							eventStartEditable: false,
							plugins: [ 'dayGrid', 'timeGrid', 'rrule', 'googleCalendar','list' ],
							header: {
								left: 'prev,next today,'+calendarView,
								center: '',
								right: 'title'
							},
							navLinks: true, // can click day/week names to navigate views
							editable: false,
							defaultView: "lookAhead",
							views: {
								"lookAhead":{
									type: "timeGrid",
									duration: { days: 60 },
									buttonText: '60 days'
								}
							},
							eventLimit: true, // allow "more" link when too many events
							googleCalendarApiKey: gKey,
							eventSources: [
								jsonEvents.filter(function(ev) {
									if (ev.calendar_displays.length > 0 && calendarProps[ev.calendar_displays[0]]) {
										if (activeCalendars.length) {
											var includeFlag = includeAll;
											for (var i = 0; i < ev.calendar_displays.length; i++) {
												var cID = parseInt(ev.calendar_displays[i]);
												if (i == 0) {
													if (ignoreList.indexOf(cID) > -1) {
														includeFlag = false;
														return;
													}
												}

												if (includeList.indexOf(cID) > -1) {
													includeFlag = true;
												}

												if (excludeList.indexOf(cID) > -1) {
													includeFlag = false;
													return;
												}
											}
											return includeFlag;
										}
										return true;
									}
									return false;
								}),
								icsEventsFiltered,
								googleFeed
							],
							eventRender: function (info) {
								if($(info.el).hasClass('gcal-event')){
									$(info.el).attr('target','_blank');
								}
								$(info.el).css("background-color",getEventColor(info.event)).css("border-color",getEventColor(info.event));
								if (activeCalendars.length) {
									if($(info.el).hasClass('gcal-event') || info.event.extendedProps.calendar_displays.filter(function(cal, i) {
										var includeFlag = includeAll;
										var cID = parseInt(cal);
										if (i == 0) {
											if (ignoreList.indexOf(cID) > -1) {
												includeFlag = false;
												return;
											}
										}

										if (includeList.indexOf(cID) > -1) {
											includeFlag = true;
										}

										if (excludeList.indexOf(cID) > -1) {
											includeFlag = false;
											return;
										}
										return includeFlag;
									}).length > 0) {
										return true;
									} else {
										return false;
									}
								}
								return true;
							},
							eventClick: function(info){
								if(!$(info.el).hasClass('gcal-event')){
									info.jsEvent.preventDefault();
									var e = info.event;
									var start = e.start;
									var rid = e.id;
									var selectedDate = e.start;
									var dateStr = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().slice(0,-1).replace(/[-:\.]/g,'').slice(0,-3);
									var day = start.getDate().toString();
									var month = (start.getMonth() + 1 ).toString();
									var year = start.getFullYear();
									day = day.length < 2 ? '0' + day : day;
									month = month.length < 2 ? '0' + month : month;
									showModal(e);
								}
							},
							datesRender: function(info){
								var start = info.view.currentStart;
								var day = start.getDate().toString();
								var month = (start.getMonth() + 1 ).toString();
								var year = start.getFullYear();

								day = day.length < 2 ? '0' + day : day;
								month = month.length < 2 ? '0' + month : month;
							}
						});

						calendar.revertView = calendarView;
						$calendars.push(calendar);

					});

					googleTimer = setInterval(function() {
							if (googleFeeds.indexOf(0) == -1) {

								for (var i = 0; i < $calendars.length; i++) {
									fcEvents = fcEvents.concat($calendars[i].getEvents().filter(function(d){
										if (d.allDay) {
											return d.start >= tdAll;
										}
										return d.end >= td;
									}).sort(function(a,b){
										return a.start - b.start;
									}));

									$calendars[i].changeView($calendars[i].revertView);
									$calendars[i].render();
								}

								clearInterval(googleTimer);
								renderMiniList();
							}
						},500);

					function renderMiniList() {
						if($(templateElement).find('.mini-events-list').length && typeof doT !== 'undefined'){

							fcEvents = fcEvents.sort(function(a,b){
								return a.start - b.start;
							});

							var newFc = [];
							for (var i = 0; i < fcEvents.length; i++) {
								var add = true;
								for (var x = 0; x < newFc.length; x++) {
									if (newFc[x].id == fcEvents[i].id && newFc[x].start.toString() == fcEvents[i].start.toString()) {
										add = false;
									}
								}
								if (add) {
									newFc.push(fcEvents[i]);
								}
							}
							fcEvents = newFc;

							$(templateElement).find('.mini-events-list').each(function(miniListIndex, el){
								var listTemplate = $(el);

								var dottedTemplate = doT.template(listTemplate.html());
								var listLen = 3;
								var characterLimit = 120;
								var activeMiniCalendars = $(el).attr('data-calendar') ? $(el).attr('data-calendar').split(",") : [];

								var includeAll = true;
								var includeList = [];
								var ignoreList = []; // Exclude event if is primary calendar
								var excludeList = []; // Exclude event if on ANY of these calendars
								for (var c = 0; c < activeMiniCalendars.length; c++) {
									var cID = parseInt(activeMiniCalendars[c]);
									if (isNaN(cID)) {
										excludeList.push(parseInt(activeMiniCalendars[c].replace(/[^0-9]/g, "")));
									} else if (cID < 0) {
										ignoreList.push(cID * -1);
									} else {
										includeList.push(cID);
										includeAll = false;
									}
								}

								// Check for list length
								if($(listTemplate).attr('data-list-length') !== 'undefined' && $(listTemplate).attr('data-list-length').length){
									listLen = parseInt($(listTemplate).attr('data-list-length'));
									if(isNaN(listLen)){
										listLen = 3;
									}
								}

								if($(listTemplate).find('[data-character-limit]') !== 'undefined' && $(listTemplate).find('[data-character-limit]').length){
									characterLimit = parseInt($(listTemplate).find('[data-character-limit]'));
									if(isNaN(characterLimit)){
										characterLimit = 120;
									}
								}

								var listEvents = activeMiniCalendars.length ?
								fcEvents.filter(function(ev){
									var includeFlag = includeAll;
									for (var i = 0; i < ev.extendedProps.calendar_displays.length; i++) {
										var cID = parseInt(ev.extendedProps.calendar_displays[i]);
										if (i == 0) {
											if (ignoreList.indexOf(cID) > -1) {
												includeFlag = false;
												return;
											}
										}

										if (includeList.indexOf(cID) > -1) {
											includeFlag = true;
										}

										if (excludeList.indexOf(cID) > -1) {
											includeFlag = false;
											return;
										}
									}
									return includeFlag;
								}).slice(0,listLen) : fcEvents.slice(0,listLen);

								filteredEvents[$(el).data("calendar") || ""] = listEvents;

								$(listTemplate).html(dottedTemplate(listEvents.map(function(el, i){
									var d = el.start;
									var m = toMomentDate(d);
									var end = el.end;
									var mEnd = toMomentDate(end);
									var desc = decodeURIComponent(el.extendedProps.desc);
									var calendarName = el.extendedProps.primary_calendar_name;
									calendarName = calendarName == 'undefined' || calendarName === '' || calendarName === ' ' ? false : calendarName;
									var strippedDesc = desc.replace(/<\/?br ?\/?>/gi,"&lt;br&gt;").replace(/(<([^>]+)>)/gi,"").replace(/&lt;br&gt;/gi,"<br>").replace(/href=\"\.\.\//g,"href=\"");
									var location = el.extendedProps.location;
									if(strippedDesc.length > characterLimit){
										strippedDesc = strippedDesc.substr(0,characterLimit) + '...';
									}

									var tempEvent = {
										title: el.title,
										desc: strippedDesc,
										image: el.extendedProps.image.indexOf('noimage.gif') < 0 ? decodeURIComponent(el.extendedProps.image) : '',
										color: getEventColor(el),
										loaded: 'mini-list-loaded',
										i: i,
										calendar_name: calendarName,
										location: location,
										start: {
											date: d,
											month:{
												num: m.format('M'),
												numPadded: m.format('MM'),
												ord: m.format('Mo'),
												short: m.format('MMM'),
												long: m.format('MMMM')
											},
											day: {
												num: m.format('D'),
												ord: m.format('Do'),
												numPadded: m.format('DD')
											},
											year: {
												short: m.format('YY'),
												long: m.format('YYYY')
											}
										},
										end: {
											date: end,
											month:{
												num: mEnd.format('M'),
												numPadded: mEnd.format('MM'),
												ord: mEnd.format('Mo'),
												short: mEnd.format('MMM'),
												long: mEnd.format('MMMM')
											},
											day: {
												num: mEnd.format('D'),
												ord: mEnd.format('Do'),
												numPadded: mEnd.format('DD')
											},
											year: {
												short: mEnd.format('YY'),
												long: mEnd.format('YYYY')
											},
											hidden: el.extendedProps.hide_end_date === 'true'
										},
									}

									return tempEvent;
								})));
								$(listTemplate).children(".progress-spinner-container").remove();
								$(listTemplate).addClass('mini-list-loaded');
								if( typeof RZRenderMini !== 'undefined' ){
									RZRenderMini(listTemplate);
								}
								$(listTemplate).on('click', '[data-click-event]', function(e){
									e.preventDefault();
									showModal(filteredEvents[$(e.delegateTarget).data("calendar") || ""][$(this).data('index')]);
								});
							});
						}
					}
				});
			});
		});

		//$(document).on('click', '[data-click-event]', function(e){

			//showModal(filteredEvents[$(e).parents("parseInt($(this).attr('data-index'))]);
		//});

		function getEventColor(event) {
			var color = defaultCalendarColor; // var color = event.backgroundColor;

			var ind;

			if (event.extendedProps) {
				ind = event.extendedProps.calendar_displays[0];
			} else {
				ind = event.calendar_displays[0];
			}

			if (calendarProps[ind]) {
				color = calendarProps[ind].color;
			}

			return color;
		}

		function fixDateOffset(d, option){
			var tempDate;
			if(option === 'RRULE'){
				tempDate = new Date(d.getTime()).toISOString().slice(0,-1).replace(/[-:]/g, '');
			} else if(option === 'EXDATE'){
				tempDate = new Date(d.getTime()).toISOString().slice(0,-4).replace(/[-:]/g, '');
			}else {
				tempDate = new Date(d.getTime()).toISOString().slice(0,-1);
			}
			return tempDate.substr(0,tempDate.indexOf('.'));
		}

		function toMomentDate(date, isLocal) {
			isLocal = (typeof isLocal !== 'underfined' || !isLocal) ? false : true;

			if (!RZCalendarTimezone) {
				return moment(date);
			}

			// Date obj brings in time as local so we can recreate a moment instance with the correct time
			// by outputting local format string and and creating a new moment time in intended tz
			if (date instanceof Date) {
				// console.log('date');
				// console.log(date, moment.tz(moment(date).format(RZ_ISO_FORMAT), RZCalendarTimezone));
				return moment.tz(moment(date).format(RZ_ISO_FORMAT), RZCalendarTimezone);
			}

			if (typeof date === 'string') {
				return date.indexOf('Z') > -1 && !isLocal ?
					moment.utc(date).tz(RZCalendarTimezone) :
					moment.tz(date, RZCalendarTimezone);
			}

			return moment.tz(date, RZCalendarTimezone);
		}

		function showModal(event, editUrl){
			var title = event.title,
				desc = event.id.indexOf('RevizeCalendar') >= 0 ? event.extendedProps.desc: decodeURIComponent(event.extendedProps.desc),
				start = event.start,
				end = event.end,
				hide_end_date = event.extendedProps.hide_end_date === 'true',
				url = event.url,
				rid = event.id,
				location = event.extendedProps.location === '' ? 'none' : event.extendedProps.location,
				edit = editUrl,
				image = event.extendedProps.image !== '' ? $(decodeURIComponent(event.extendedProps.image)) : '',
				hasRule = event._def.hasOwnProperty('recurringDef'),
				startStr, endStr = '';

			if(event.allDay){
				startStr = moment(start).format('YYYY-MM-DD') + 'T00:00:00';
				endStr = startStr;
				end = start;
			} else {
				startStr = moment.utc(toMomentDate(start)).format(RZ_ISO_FORMAT);
				endStr = moment.utc(toMomentDate(end)).format(RZ_ISO_FORMAT);
			}
			icalExport = ics();
			if(hasRule){
				var tempRule = {};
				tempRule.rrule = event._def.recurringDef.typeData.toString();
				tempRule.rrule = tempRule.rrule.split('\n').filter(function(rule){
					return rule.indexOf('RRULE:') >= 0;
				}).join('\n');
				icalExport.addEvent(title, desc.replace(/(<([^>]+)>)/ig,"").replace("\n",""), location, startStr, endStr, tempRule);
			} else {
				icalExport.addEvent(title, desc.replace(/(<([^>]+)>)/ig,"").replace("\n",""), location, startStr, endStr);
			}
			var imageSrc ="";

			// Resets
			$('#event-modal #ics-export').remove();
			$('#event-modal #modal-event-duration').remove();
			$('#event-modal .modal-footer').prepend('<button onclick="javascript:icalExport.download(\''+title+'\');return false;" id="ics-export" class="btn btn-primary">ICS</button>');
			$('.event-modal-header').css('background','none');
			$('.modal-event-date-wrap').css('background-color', getEventColor(event));
			$('#event-edit,#event-delete').remove();
			$('#event-modal .modal-footer .btn').css('background-color', getEventColor(event));
			$('#modal-event-location').html('');

			if(location !== '' && location !== 'none'){
				$('#modal-event-location').html('<iframe class="rz-business-inner-map" height="175" frameborder="0" style="width:100%;margin:10px 0;border:1px solid '+getEventColor(event)+'" src=https://www.google.com/maps/embed/v1/place?key=AIzaSyC5cMe92Yw3JgHrkvgIyHgdS2lTsH4C95k&amp;q="'+encodeURIComponent(location)+'" allowfullscreen="true"></iframe>')
			}
			if(typeof image === 'object'){
				imageSrc = $(image).attr('src');
			}

			if(imageSrc === "" || imageSrc.indexOf('noimage.gif') >= 0 || imageSrc.indexOf('placeholder.png') >= 0){
				imageSrc = './_assets_/plugins/revizeCalendar/images/default-event.jpg';
			}

			var startMoment = toMomentDate(start, true);
			var startDate = startMoment.format('YYYY-MM-DD');
			var endMoment = toMomentDate(end, true);
			var endDate = endMoment.format('YYYY-MM-DD');
			startMoment = startMoment.format('hh:mm A');
			endMoment = startDate === endDate ? endMoment.format('hh:mm A') : endMoment.format('MMM Do, hh:mm A');
			var eventTimes = event.allDay ? "All Day" : '<span class="dur-start">'+startMoment+'</span> ' + ( hide_end_date ? '' : '- <span class="dur-end">'+ endMoment +'</span>');
			$('.event-modal-header').css('background', 'url(\'' + imageSrc + '\') center center / cover no-repeat');
			$('.event-modal-header').append('<div style="background-color:'+ getEventColor(event)+'" id="modal-event-duration">'
			+ '<h3>'+eventTimes+'</h3>'
			+ '</div>');

			$('.modal-event-date-number').text(start.getDate().toString().length < 2 ? '0' + start.getDate() : start.getDate());
			$('.modal-event-date-month').text(SHORT_MONTHS[start.getMonth()]);

			$('#modal-event-title').text(title);
			$('#modal-event-description').html(desc.replace(/href=\"\.\.\//g,"href=\""));

			if(url.length){
				$('#modal-event-readmore').attr('href',url).show();
			} else {
				$('#modal-event-readmore').hide();
			}

			$('#event-modal').modal('show');
		}

		// Show Loading Spinner
		if (calShowLoading) {
			$(".mini-events-list").each(function() {
				$(this).after('<div class="progress-spinner-container" style="text-align:center;padding:15px;"><span class="progress-spinner"></span></div>');
			});
		}
	});
});
