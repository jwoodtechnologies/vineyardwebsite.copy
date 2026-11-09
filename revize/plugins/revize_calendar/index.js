var VIEWS = {
    'dayGridMonth': 'month',
    'timeGridWeek': 'week',
    'timeGridDay': 'day',
    'listMonth': 'list'
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

var jsonEvents = [],
icsEvents = [],
fcEvents = [];
var ImportCals = ImportCals || ["0"];
var icalExport = ics();
var eventExport = ics();
var icalFullExport = ics();
var calendar;
var calendarProps = calendarProps || {};
var calShowLoading = calShowLoading || true;
var RZCalendarTimezone = RZCalendarTimezone || null;
var activeCalendar = "";
var RZ_ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
var RZ_RRULE_FORMAT = 'YYYYMMDDTHHmmss';

$(function(){
    var oldQuery = $.query.parseNew(location.search, location.hash.split("?").length > 1 ? location.hash.split("?")[1] : "");
    if(oldQuery.get('id')){
        changeUrlQuery('calendar');
    }
    var calendarEl = document.getElementById('calendar');
    var gKey = "";
    var gFeed = "";
	if (calendarEl) {
		gKey = calendarEl.getAttribute('data-google-api');
		gFeed = calendarEl.getAttribute('data-google-feed');
	}
    var calendarParam = oldQuery.get('calendar').toString();
    var searchParam = oldQuery.get('query');
    var activeSearch = typeof searchParam === 'string' && searchParam.length ? searchParam : "";
    var yearParam = oldQuery.get('year').toString();
    var monthParam = oldQuery.get('month').toString();
    var dayParam = oldQuery.get('day').toString();
    var viewParam = oldQuery.get('view').toString().toLowerCase();
    var idParam = oldQuery.get('id');
    idParam = typeof idParam === 'string' && idParam.length || typeof idParam === 'number' ? idParam.toString() : '';
    var dt = new  Date();
    var filterNum = 0;


    var year = ""
    var month = "";
    var day = "";
    var defaultView = undefined;

    if(typeof viewParam === 'string' && viewParam.length){
        if(viewParam === 'day'){
            defaultView = 'timeGridDay';
        } else if(viewParam === 'week'){
            defaultView = 'timeGridWeek';
        } else if(viewParam === 'list'){
            defaultView = 'listMonth';
        } else {
            defaultView = 'dayGridMonth';
        }
    }


    // Get Year
    year = typeof yearParam === 'string' && yearParam.length === 4 ? yearParam : dt.getFullYear();

    // Get Month
    month = typeof month === 'string' && monthParam.length && month.length < 3 ? monthParam : (dt.getMonth() + 1).toString();
    month = month.length < 2 ? '0' + month : month;

    // Get Day
    day = typeof dayParam === 'string' && dayParam.length && dayParam.length < 3 ? dayParam : (dt.getDate()).toString();
    day = day.length < 2 ? '0' + day : day;

    var defaultDate = year + '-' + month + '-' + day;

    if(activeSearch !== ""){
        $('#calendar-search').val(activeSearch);
    }

    if(calendarParam.length && $('[data-calendar-id='+calendarParam+']').length){
        activeCalendar = calendarParam;
        $('[data-calendar-id='+calendarParam+']').parent().addClass('calendar-active');
    }


    var jqxhr = $.get('./_assets_/plugins/revizeCalendar/cache/calendarimport.ics', function(){
        console.log('pulled ics');
    })
    .fail(function(){
        console.log('failed');
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
                    importedEvent.end = moment(mEnd).add(parseInt(hrs),'hours').add(parseInt(mins),'minutes').format(RZ_ISO_FORMAT);
                    importedEvent.end = importedEvent.end.substr(0,importedEvent.end.length - 2) + '00';
                }
                return importedEvent;
            }
        });
        // end
    }).always(function(){
        //console.log('calling: ' + './_assets_/plugins/revizeCalendar/calendar_data_handler.php?webspace=' + RZ.webspace + '&relative_revize_url=' + RZ.protocolRelativeRevizeBaseUrl+'&protocol='+window.location.protocol);
        $.get('./_assets_/plugins/revizeCalendar/calendar_data_handler.php?webspace=' + RZ.webspace + '&relative_revize_url=' + RZ.protocolRelativeRevizeBaseUrl+'&protocol='+window.location.protocol, function(){
            console.log('called cache');
        }).done(function(data){
            //console.log(data);
            jsonEvents = data;
            var fCalendarProps = {
                eventStartEditable: false,
                plugins: [ 'dayGrid', 'timeGrid', 'list', 'rrule', 'googleCalendar' ],
                defaultDate: defaultDate,
                defaultView: defaultView,
                lazyFetching: true,
                header: {
                    left: 'prev,next,today dayGridMonth,timeGridWeek,timeGridDay,listMonth',
                    center: '',
                    right: 'title'
                },
                navLinks: true, // can click day/week names to navigate views
                editable: true,
                eventLimit: true, // allow "more" link when too many events
                eventSources: [
                    jsonEvents
                ],
                eventRender: function (info) {
                    var showEvent = false;
                    var textClass = getContrastYIQ(getEventColor(info.event));
                    $(info.el).addClass(textClass);
                    info.event.textClass = textClass;
					$(info.el).css("background-color",getEventColor(info.event)).css("border-color",getEventColor(info.event));

                    if (typeof ACTIVE_CALENDAR_IDS != 'undefined' && !$(info.el).hasClass('gcal-event')) {
						if (info.event.extendedProps.calendar_displays.length > 0 && calendarProps[info.event.extendedProps.calendar_displays[0]]) {
							for (var i = 0; i < info.event.extendedProps.calendar_displays.length; i++) {
								if(ACTIVE_CALENDAR_IDS.indexOf('|'+info.event.extendedProps.calendar_displays[i] + '|') >= 0){
									showEvent = true;
								}
							}
						}
                    } else {
                        showEvent = true;
                    }


                    if(showEvent){
                        if($(info.el).hasClass('gcal-event')){
                            $(info.el).attr('target','_blank');
                        }
                        if(activeCalendar.length && $(info.el).hasClass('gcal-event') || activeCalendar.length && info.event.extendedProps.calendar_displays.indexOf(activeCalendar) < 0){
                            return false;
                        }

                        if(activeSearch.length && $(info.el).hasClass('gcal-event') || activeSearch.length && (info.event.title.toLowerCase()).indexOf(activeSearch) < 0){
                            return false;
                        }
                        var e = info.event;
                        var rid = e.extendedProps.rid;
                        var selectedDate = e.start;
                        var dateStr = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().slice(0,-1).replace(/[-:\.]/g,'').slice(0,-3);
                        var editUrl = 'javascript:RZedit(\''+rid+'\',\'\/revize\/plugins\/revize_calendar/editforms\/calendar_events-editform.jsp?selected_date='+dateStr+'\',\'0\',\'0\',\'\',\'\',\'rzevents\',\'\',\'\',\'editform\',\'*none*\',\'\',\'\')';

                        if(idParam === info.event.id.toString() && filterNum === 0){
                            showModal(e, editUrl);
                            filterNum++;

                            changeUrlQuery('id');
                        }
                    } else {
                        info.event.remove();
                    }
                },
                eventClick: function(info){
                    if(!$(info.el).hasClass('gcal-event')){
                        info.jsEvent.preventDefault();
                        var e = info.event;
                        var start = e.start;
                        var rid = e.id;
                        var selectedDate = e.start;
                        var dateStr = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().slice(0,-1).replace(/[-:\.]/g,'').slice(0,-3);
                        var editUrl = 'javascript:RZedit(\''+rid+'\',\'\/revize\/plugins\/revize_calendar/editforms\/calendar_events-editform.jsp?selected_date='+dateStr+'\',\'0\',\'0\',\'\',\'\',\'rzevents\',\'\',\'\',\'editform\',\'*none*\',\'\',\'\')';
                        var day = start.getDate().toString();
                        var month = (start.getMonth() + 1 ).toString();
                        var year = start.getFullYear();
                        day = day.length < 2 ? '0' + day : day;
                        month = month.length < 2 ? '0' + month : month;

                        changeUrlQuery([{
                            prop: 'view',
                            val: 'day'
                        }, {
                            prop: 'calendar',
                            val: ''
                        }, {
                            prop: 'year',
                            val: year
                        }, {
                            prop: 'month',
                            val: month
                        }, {
                            prop: 'day',
                            val: day
                        }, {
                            prop: 'id',
                            val: rid
                        }]);
                        showModal(e, editUrl);
                    }
                },
                datesRender: function(info){
                    var start = info.view.currentStart;
                    var day = start.getDate().toString();
                    var month = (start.getMonth() + 1 ).toString();
                    var year = start.getFullYear();

                    day = day.length < 2 ? '0' + day : day;
                    month = month.length < 2 ? '0' + month : month;


                    changeUrlQuery([{
                        prop: 'view',
                        val: VIEWS[info.view.type]
                    }, {
                        prop: 'month',
                        val: month
                    }, {
                        prop: 'day',
                        val: day
                    }, {
                        prop: 'year',
                        val: year
                    }]);
                }
            };// End fCalendarProps

            // Add Google key if it exists
            if(gKey !== null){
                fCalendarProps.googleCalendarApiKey = gKey;
            }

            // Add Google feed if it exists
            if(gFeed !== null){
                fCalendarProps.eventSources.push({
                    googleCalendarId: gFeed,
                    className: 'gcal-event',
					success: function(a,b) {
						// Add missing attributes to GCal events.
						a.forEach(function(v, c) {
							a[c].calendar_displays = ImportCals;
							if (!a[c].image) { a[c].image = '<img src="noimage.gif"/>'; }
						});
					}
                });
            }

            if(icsEvents.length){
                fCalendarProps.eventSources.push(icsEvents);
            }

            calendar = new FullCalendar.Calendar(calendarEl, fCalendarProps);
			$(calendarEl).children(".progress-spinner-container").remove();
            calendar.render();

            var fullEvents = jsonEvents.concat(icsEvents);
            setTimeout(function(){
				addEventsToExport(fullEvents, false, icalFullExport);
                $('<button type="button" onclick="javascript:exportCalendar();return false;" id="ics-export" class="btn btn-primary">Export</button>').insertAfter('#calendar');
            },1000);
        });
    });

    $('.calendar-name-filter,.calendar-tab-filter').on('click',function(e){
        e.preventDefault();
		if ($(this).data('calendar-id').toString() === "clear") {
			$('.calendar-active').removeClass('calendar-active');
			activeCalendar = "";
			activeCalendarText = "";
			changeUrlQuery("calendar");
		} else {
			if(!$(this).parent().hasClass('calendar-active')){
				$('.calendar-active').removeClass('calendar-active');
				$(this).parent().addClass('calendar-active');
				activeCalendar = $(this).data('calendar-id').toString();
				activeCalendarText = $(this).text();
			} else {
				$('.calendar-active').removeClass('calendar-active');
				activeCalendar = "";
				activeCalendarText = "";
			}
			changeUrlQuery([{
				prop: 'calendar',
				val: activeCalendar
			}]);
		}
        calendar.rerenderEvents();
    });

    $('#calendar-search').on('keyup', function(e){
        if(e.which === 13){
            submitSearch($(this).val());
        }
    });

    $('#calendar-submit').on('click',function(e){
        e.preventDefault();
        submitSearch($('#calendar-search').val());
    });

    $('#event-modal').on('hidden.bs.modal', function(){
        changeUrlQuery('id','');
    });

    function submitSearch(searchStr){
        activeSearch = searchStr.toLowerCase();
        changeUrlQuery([{
            prop: 'query',
            val: searchStr.toLowerCase()
        }]);
        calendar.rerenderEvents();
    }

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

    function showModal(event, editUrl){
        // console.log(event);
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
            textClass = getContrastYIQ(getEventColor(event)),
            startStr, endStr = '';

        if(event.allDay || event.end === null){
            // for all day time doesn't really matter but we add 00 form format detection in ics
            startStr = moment(start).format('YYYY-MM-DD') + 'T00:00:00';
            endStr = startStr;
            end = start;
        } else {
            // Here we roll back to utc and drop Z since ics will handle adding Z
            startStr = moment.utc(toMomentDate(start)).toISOString();
            endStr = moment.utc(toMomentDate(end)).toISOString();
        }

        eventExport = ics();

        if(hasRule){
            var tempRule = {};
            tempRule.rrule = event._def.recurringDef.typeData.toString();
            tempRule.rrule = tempRule.rrule.split('\n').filter(function(rule){
                return rule.indexOf('RRULE:') >= 0;
            }).join('\n');
            eventExport.addEvent(title, desc.replace(/(<([^>]+)>)/ig,"").replace("\n",""), location, startStr, endStr, tempRule);
        } else {
            eventExport.addEvent(title, desc.replace(/(<([^>]+)>)/ig,"").replace("\n",""), location, startStr, endStr);
        }
        var imageSrc ="";

        // Resets
        $('#event-modal #ics-export').remove();
        $('#event-modal #modal-event-duration').remove();
        $('#event-modal .modal-footer').prepend('<button onclick="javascript:eventExport.download(\''+title+'\');return false;" id="ics-export" class="btn btn-primary">ICS</button>');
        $('.event-modal-header').css('background','none');
        $('.modal-event-date-wrap').removeClass('dark-text').removeClass('light-text').css('background-color', getEventColor(event)).addClass(textClass);
        $('#event-edit,#event-delete').remove();
        if(typeof RZ !== 'undefined' && RZ.login && rid.indexOf("RevizeCalendar") < 0){
            var flag = true;
            if ((!/\bsuperuser\b/.test(RZ.roles) && !/\badministrator\b/.test(RZ.roles)) && calendarProps.hasOwnProperty(event.extendedProps.calendar_displays[0])) {
                var prop = calendarProps[event.extendedProps.calendar_displays[0]];
                if (prop.hasOwnProperty("permissions")) {
                    if (prop['permissions'].indexOf(RZ.hashed_username) === -1) {
                        flag = false;
                    }
                }
            }
            if (flag) {
                $('#event-modal .modal-footer').prepend('<a id="event-edit" href="'+edit+'" class="btn btn-secondary">Edit Event</a>');
                $('#event-modal .modal-footer').prepend('<a id="event-delete" class="btn btn-danger" href="javascript:RZdelete( \''+rid+'\', \'rzevents\' );">Delete</a>');
            }
        }
        $('#event-modal .modal-footer .btn').removeClass('dark-text').removeClass('light-text').css('background-color',getEventColor(event)).addClass(textClass);
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
        $('.event-modal-header').append('<div class="'+textClass+'" style="background-color:'+ getEventColor(event)+'" id="modal-event-duration">'
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

    function changeUrlQuery(args){
        var q = $.query.parseNew(location.search, location.hash.split("?").length > 1 ? location.hash.split("?")[1] : "");
        oldQuery = q;

        var url = window.location.href.split('?').shift();
        var s;
        if(arguments.length){

            if(Array.isArray(args)){
                for(var i = 0; i < args.length; i++){
                    if(args[i].prop)
                    q = q.set(args[i].prop, args[i].val);
                }
            } else if(typeof args === 'string'){
                q =  oldQuery.REMOVE(args);
            }
        }
        s = q.toString();
        window.history.replaceState(q, 'Calendar', url + s);
    }


    if($('#calendar-mega-wrap').length){
        $('#calendar-mega-wrap #view-calendar-categories').on('click',function(e){
            e.preventDefault();
            if($('#calendar-filters.calendar-filter-mega').is(':visible')){
                $('#calendar-filters.calendar-filter-mega li').not('.close-filters').css('opacity',0);
            }
			$('#calendar-filters.calendar-filter-mega').stop(true).slideToggle(function(){
                if($('#calendar-filters.calendar-filter-mega').is(':visible')){
                    $('#calendar-filters.calendar-filter-mega li').not('.close-filters').css('opacity',1);
                }
            });
        });

        $('#calendar-filters .close-filters').on('click',function(e){
            e.preventDefault();
            $('#calendar-filters.calendar-filter-mega li').not('.close-filters').css('opacity',0);
            $('#calendar-filters.calendar-filter-mega').stop().slideUp();
        });
    }

	// Show Loading Spinner
	if (calShowLoading) {
		var cal = document.getElementById('calendar');
		if (cal) {
			$(cal).append('<div class="progress-spinner-container" style="text-align:center;padding:50px 15px;"><span class="progress-spinner"></span></div>');
		}
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

    function getContrastYIQ(hexcolor){
        hexcolor = hexcolor.replace("#", "");
        var r = parseInt(hexcolor.substr(0,2),16);
        var g = parseInt(hexcolor.substr(2,2),16);
        var b = parseInt(hexcolor.substr(4,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 150) ? 'dark-text' : 'light-text';
    }
});

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

// Helpers
function parseIcsDate(icsDate) {
	if (!/^[0-9]{8}T[0-9]{6}Z?$/.test(icsDate))
	throw new Error("ICS Date is wrongly formatted: " + icsDate);

	return toMomentDate(icsDate); // SHORT CIRCUIT BOOM.
}

function exportCalendar() {
	if (activeCalendar == "") {
		console.log(icalFullExport.download('Full Calendar'));
		return false;
	}
	console.log("hey");
	var fullEvents = jsonEvents.concat(icsEvents);
	icalExport = ics();
	addEventsToExport(fullEvents, activeCalendar, icalExport);
	icalExport.download($(".calendar-name-filter[data-calendar-id="+activeCalendar+"]").text() || "Calendar");
}

function addEventsToExport(events, calendar, ical) {
	$.each(events, function(i,ev){
		// skip over events that do not belong to any active calendars
		var isOrphan = true;
		var inCalendar = false;
		for (var c=0; c < ev.calendar_displays.length; c++) {
			if (calendarProps[ev.calendar_displays[c]]) {
				isOrphan = false;
			}
			if (!calendar || ev.calendar_displays[c] == calendar) {
				inCalendar = true;
			}
		}

		if (isOrphan || !inCalendar) {
			return true;
		}

		try {
			decodeURIComponent(ev.desc);
		} catch (e) {
			console.warn("[addEventsToExport] Could not add event " + ev.id + " to the export as the description is malformed.");
			return;
		}

		var evTitle = ev.title,
			evStart = ev.start.replace(/[:.-]/g,''),
			evDesc = ev.id.indexOf("RevizeCalendar") >= 0 ? ev.desc: decodeURIComponent(ev.desc),
			hasRule = ev.hasOwnProperty('rrule'),
			isAllDay = ev.hasOwnProperty('allDay') && ev.allDay,
			location = ev.location === '' ? 'none' : ev.location,
			startStr, evEnd, endStr = '';
		if(!ev.hasOwnProperty('end')){
			isAllDay = true;
		}

		if(isAllDay){
			startStr = evStart.split('T').shift() + 'T00:00:00';
			startStr = startStr.substr(0,4) + '-' + startStr.substr(4,2) + '-' + startStr.substr(6);
			endStr = startStr;
		} else {
			evEnd = ev.end.replace(/[:.-]/g,'');

			var startM = moment(parseIcsDate(evStart));
			var endM = moment(parseIcsDate(evEnd));

			if (startM.isSame(endM)) {
				startStr = moment(parseIcsDate(evStart)).toISOString();
				endStr = moment(parseIcsDate(evEnd)).add(1, 'second').toISOString();
			} else {
				startStr = moment(parseIcsDate(evStart)).toISOString();
				endStr = moment(parseIcsDate(evEnd)).toISOString();
			}
		}

		if(hasRule){
			var tempRule = {};
			tempRule.rrule = ev.rrule;

			if(tempRule.rrule.indexOf('DTSTART') >= 0 ){
				tempRule.rrule = tempRule.rrule.split('\n').filter(function(dt){
					return dt.indexOf('DTSTART') < 0;
				}).join('\n');
			}

			if(tempRule.rrule.indexOf('RDATE') >= 0 ){
				tempRule.rrule = tempRule.rrule.split('\n').filter(function(dt){
					return dt.indexOf('RDATE') < 0;
				}).join('\n');
			}

			ical.addEvent(evTitle, evDesc.replace(/(<([^>]+)>)/ig,"").replace(/\n/ig,"").replace(/\r/ig,' '), location, startStr, endStr, tempRule);
		} else {
			ical.addEvent(evTitle, evDesc.replace(/(<([^>]+)>)/ig,"").replace(/\n/ig,"").replace(/\r/ig,' '), location, startStr, endStr, null);
		}
	});
}
