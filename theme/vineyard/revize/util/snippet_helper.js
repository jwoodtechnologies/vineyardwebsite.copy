/*
#############################################################################
##
## 	file: .../util/snippet_helper.js
##
## 	JavaScript Library used on all Revize html pages
##
## 	Copyright (C) 2000-2014 Revize Software Systems All rights reserved.
##
##	--------------------------------------------
##	Source Code Changes Required for Doc-O-Matic
##	--------------------------------------------
##
##	Separate text with blank lines to force new link on output
##
##	Use ## to ignore lines in Doc-O-Matic (like these comments)
##
##	Bracket initialization code with the following:
##		//DOM-IGNORE-BEGIN
##		//DOM-IGNORE-END
##
##	Below are sample sections used:
##
##		For RZ.*** input arguments use one of the following section names
##
##			RZ Parameters:
##			RZ Input Parameters:
##
##		Internal: Called by
##		then start description with (Internal Function) ...
##
##		Future: under development (may be available in a later release)
##
##		Parameters:
##		  	None: (no input parameters)
##
##		Returns:
##		  	no value currently returned
##
## Add the following as preceeding comment for deprecated functions
## 		Same as RZcalleditlist (retained for backward compatibility)
*/
/****************************************************************************
##	First part of code below executes before the onload handler
****************************************************************************/

/*---------------------------------------------------------------------------
Define RZ object and variables if not already defined.
----------------------------------------------------------------------------*/
if (!window.EZ) EZ = {};
if (!EZ.isFeature) EZ.isFeature = function() {return false};

if (typeof RZ == 'undefined') var RZ = new Object();
if (typeof RZ.pagetype == 'undefined') RZ.pagetype = '';
if (typeof RZ.jsversion == 'undefined') RZ.jsversion = '1.2';

//********************************************************\\
RZ.snippet_helper_version = '02-20-2014';
//********************************************************//

//-----	Define additional RZ objects used by javascript library functions
if (typeof RZ.rte == 'undefined') RZ.rte = new Object();
if (typeof RZ.link == 'undefined') RZ.link = new Object();
if (typeof RZ.icons == 'undefined') RZ.icons = new Array();
if (typeof RZ.image == 'undefined') RZ.image = new Object();
if (typeof RZ.setvalues == 'undefined') RZ.setvalues = new Object();
if (typeof RZ.control == 'undefined') RZ.control = new Object();
if (typeof RZ.permits == 'undefined') RZ.permits = new Object();
if (typeof RZ.permits.modules == 'undefined') RZ.permits.modules = new Object();
if (typeof RZ.linkpagekey == 'undefined') RZ.linkpagekey = new Object();
if (typeof RZ.linkparentnew == 'undefined') RZ.linkparentnew = new Object();
if (typeof RZ.linkparentreset == 'undefined') RZ.linkparentreset = new Object();
if (typeof RZ.linktemplates == 'undefined') RZ.linktemplates = new Object();
if (typeof RZ.badlinks == 'undefined') RZ.badlinks = new Object();
if (typeof RZ.warning == 'undefined') RZ.warning = '';
if (typeof RZ.alert == 'undefined') RZ.alert = '';
RZ.linklevel = -1
RZ.nextseq = {linknames:{},modules:{}};	//can be removed after all channels published

// For very old backward compatibility (probably build 27-) on templates
RZ.webSpaceName = RZ.webspace;
var rzRecordID = RZ.editrecordid;
/*---------------------------------------------------------------------------
Call additional setup functions as soon as JavaScript is compiled.

TODO: all inline code should be moved to onload handler to eliminate race
	  conditions mostly using image mananger with Firefox as of 08-01-2009
	  Of course some code is needed to hide or display buttons so that login
	  would need reworking (probably display:none until page loads)

	  Consider RZeventadd(..) allowing this file in head for all scenaios
----------------------------------------------------------------------------*/
RZpageSetup();		// get page into
RZpermits();		// setup module permissions
RZpagepermission()	// determine page permission
RZactionReset();  	// clear all action button input arguments
RZpageLoaded();		// final page setup

/****************************************************************************
Remaining code defines javaScript library functions
****************************************************************************/
/*!
  * Bowser - a browser detector
  * https://github.com/ded/bowser
  * MIT License | (c) Dustin Diaz 2013
  * DCO 11-18-2015: function renamed by code not changed
  */
function RZbowser()
{
 /**
    * navigator.userAgent =>
    * Chrome:  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57 Safari/534.24"
    * Opera:   "Opera/9.80 (Macintosh; Intel Mac OS X 10.6.7; U; en) Presto/2.7.62 Version/11.01"
    * Safari:  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-us) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
    * IE:      "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)"
    * IE>=11:  "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; .NET4.0E; .NET4.0C; Media Center PC 6.0; rv:11.0) like Gecko"
    * Firefox: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0) Gecko/20100101 Firefox/4.0"
    * iPhone:  "Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5"
    * iPad:    "Mozilla/5.0 (iPad; U; CPU OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5",
    * Android: "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile G2 Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
    * Touchpad: "Mozilla/5.0 (hp-tabled;Linux;hpwOS/3.0.5; U; en-US)) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/234.83 Safari/534.6 TouchPad/1.0"
    * PhantomJS: "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.5.0 Safari/534.34"
    */

  var ua = navigator.userAgent
    , t = true
    , ie = /(msie|trident)/i.test(ua)
    , chrome = /chrome/i.test(ua)
    , phantom = /phantom/i.test(ua)
    , safari = /safari/i.test(ua) && !chrome && !phantom
    , iphone = /iphone/i.test(ua)
    , ipad = /ipad/i.test(ua)
    , touchpad = /touchpad/i.test(ua)
    , android = /android/i.test(ua)
    , opera = /opera/i.test(ua) || /opr/i.test(ua)
    , firefox = /firefox/i.test(ua)
    , gecko = /gecko\//i.test(ua)
    , seamonkey = /seamonkey\//i.test(ua)
    , webkitVersion = /version\/(\d+(\.\d+)?)/i
    , firefoxVersion = /firefox\/(\d+(\.\d+)?)/i
    , o

  function detect() {

    if (ie) return {
        msie: t
      , version: ua.match(/(msie |rv:)(\d+(\.\d+)?)/i)[2]
      }
    if (opera) return {
        opera: t
      , version: ua.match(webkitVersion) ? ua.match(webkitVersion)[1] : ua.match(/opr\/(\d+(\.\d+)?)/i)[1]
      }
    if (chrome) return {
        webkit: t
      , chrome: t
      , version: ua.match(/chrome\/(\d+(\.\d+)?)/i)[1]
      }
    if (phantom) return {
        webkit: t
      , phantom: t
      , version: ua.match(/phantomjs\/(\d+(\.\d+)+)/i)[1]
      }
    if (touchpad) return {
        webkit: t
      , touchpad: t
      , version : ua.match(/touchpad\/(\d+(\.\d+)?)/i)[1]
      }
    if (iphone || ipad) {
      o = {
        webkit: t
      , mobile: t
      , ios: t
      , iphone: iphone
      , ipad: ipad
      , version: (ua.match(/CPU iPhone OS ([0-9_]+) like Mac OS X/i)[1] || '1.1.1').replace('_', '.')
      }
      return o
    }
    if (android) return {
        webkit: t
      , android: t
      , mobile: t
      , version: (ua.match(/Linux; Android ([0-9.]+)/i) || ua.match(firefoxVersion))[1]
      }
    if (safari) return {
        webkit: t
      , safari: t
      , version: ua.match(webkitVersion)[1]
      }
    if (gecko) {
      o = {
        gecko: t
      , mozilla: t
      , version: ua.match(firefoxVersion)[1]
      }
      if (firefox) o.firefox = t
      return o
    }
    if (seamonkey) return {
        seamonkey: t
      , version: ua.match(/seamonkey\/(\d+(\.\d+)?)/i)[1]
      }
    return {}
  }

  var bowser = detect()

  // Graded Browser Support
  // http://developer.yahoo.com/yui/articles/gbs
  if ((bowser.msie && bowser.version >= 8) ||
      (bowser.chrome && bowser.version >= 10) ||
      (bowser.firefox && bowser.version >= 4.0) ||
      (bowser.safari && bowser.version >= 5) ||
      (bowser.opera && bowser.version >= 10.0)) {
    bowser.a = t;
  }

  else if ((bowser.msie && bowser.version < 8) ||
      (bowser.chrome && bowser.version < 10) ||
      (bowser.firefox && bowser.version < 4.0) ||
      (bowser.safari && bowser.version < 5) ||
      (bowser.opera && bowser.version < 10.0)) {
    bowser.c = t
  } else bowser.x = t

  return bowser
}
/*---------------------------------------------------------------------------
(Internal Function) Set page information and display in trace window
Internal: Called by onload handler
----------------------------------------------------------------------------*/
function RZpageSetup()
{
	//----- Set flags
	RZ.revizepreview = false

	//----- Set browser settings
	RZ.MSIE = false       // MS explorer mode
	RZ.isnavigator = true // Netscape
	RZ.pos = navigator.appVersion.indexOf('MSIE')
	if(RZ.pos != -1)
	{
		RZ.MSIE = true
		RZ.isnavigator = false
	}
	if (RZ.isnavigator)
	{
		RZ.language = navigator.language.substring(0,2)
		RZ.browserversion = parseFloat(navigator.appVersion)
	}
	else
	{
		RZ.language = navigator.userLanguage.substring(0,2)
		RZ.browserversion = parseFloat(navigator.appVersion.substring(RZ.pos+4))
	}
	if (navigator.appVersion.toLowerCase().indexOf('windows') != -1)
	{
		RZ.platform = 'win'
		RZ.newline = '\r\n'
	}
	else
	{
		RZ.newline = '\r'
		RZ.platform = 'mac'
	}
	//CREDIT: http://stackoverflow.com/questions/17447373/how-can-i-target-only-internet-explorer-11-with-javascript
	//		  probably copied incorrectly because true/false switched (see not below)
	//Following 2 lines depreciated
	RZ.isIE11 = !navigator.userAgent.match(/Trident.*rv 11\./)	//true for any browser
	RZ.isIEstandards = !navigator.userAgent.match(/Trident/)	//false for any IE ver; true if not any IE

	//DCO 01-23-2014 (CREDIT: tiny_mce.3.5.10/tiny_mcs)
	RZ.isIEstandardsMode = navigator.userAgent.match(/Trident/)	//array for any IE ver (i.e. true)

	//DCO 03-26-2014: latest attempt at code that will pass the test of time
	RZ.isIEw3c = !RZ.MSIE && navigator.userAgent.indexOf('Trident') != -1 && navigator.appCodeName.indexOf('Mozilla') != -1;

	//DJO 04-22-2016: add MS edge user agent detection
	RZ.isMSEdge = navigator.userAgent.match(/Edge/);

	//DCO 12-16-2015: refactor w/o calling RZbowser() -- gets js error on iPad
	var results, ua = navigator.userAgent
	RZ.isMSIE = /(msie|trident)/i.test(ua);
	RZ.isChrome = /chrome/i.test(ua);
	RZ.isFirefox = /firefox/i.test(ua);
	if (RZ.isMSIE)
	{				//nogo for IE5 returns 7 but who cares
		results = ua.match(/(msie |rv:)(\d+(\.\d+)?)/i);
		if (results && results[2])
			RZ.browserversion = results[2];
	}
	else if (RZ.isChrome)
	{
		results = ua.match(/chrome\/(\d+(\.\d+)?)/i)
		if (results && results[1])
			RZ.browserversion = results[1];
	}
	else if (RZ.isFirefox)
	{				//seems to work but not 100% sure
		results = ua.match(/firefox\/(\d+(\.\d+)?)/i)
		if (results && results[1])
			RZ.browserversion = results[1];
	}

	//----- Does browser support css (only old versions of navigator did not support)
	//		Assume true to avoid race condition with image manager on Firefox
	RZ.css = true;

	//----- Parent window if accessable (otherwise current window)
	//		TODO: susceptible to race condition with image_frame.jsp on Firefox
	RZ.parent = window;
	if (RZwinaccess(window.parent)) RZ.parent = window.parent;

	//----- Set page information, login webspace and display page properties
	RZ.page = RZgetfileinfo( location.href )

	/* disabled 08-15-2012; causing issues on some versions of chrome, trace not
	// enabled yet so it never prints AND superceeded by AdminPanel enhancements.
	RZ.message = 'RZ.webspace: ' + RZ.webspace + '\n'
			   + 'RZ.page.domain: ' + RZ.page.domain + '\n'
			   + 'RZ.page.pathname: ' + RZ.page.pathname + '\n'
			   + 'RZ.page.filename: ' + RZ.page.filename + '\n'
			   + 'RZ.page.extension: ' + RZ.page.extension + '\n'
			   + 'RZ.page.query: ' + RZ.page.query + '\n'
			   + 'RZ.page.hash: ' + RZ.page.hash + '\n'
			   + 'RZ.page.home: ' + RZ.page.home + '\n'
			   + 'window.name: ' + window.name + '\n'
			   + 'document.referrer: ' + document.referrer + '\n'
			   + 'opener: '
	if (RZwinaccess(RZ.parent.opener))
	{
		RZ.message += RZ.parent.opener.location.href + '\n'
		if (RZ.parent.opener.name != '')
			RZ.message += 'opener.name: ' + RZ.parent.opener.name
	}
	else if (typeof RZ.parent != 'undefined')
		RZ.message += 'no access to opener'
	else
		RZ.message += 'no opener'

	RZtrace("Initializing Page", RZ.message)
	*/

	RZ.login = RZgetCookieValue('RZlogin', RZ.page.domain);

	//----- Determine trace and debug mode
	RZ.trace = false;	//RZcheckHash('trace');		//issues on some versions of chrome...
	RZ.debug = false;	//RZcheckHash('debug');		//...superceeded by enhanced adminpanel

	if (RZ.webspace && RZ.webspace != 'REVIZE')
	{
		var trace = RZgetcookie('RZtrace',RZ.page.domain);
		if (trace == RZ.webspace)
			RZ.trace = true;
		else if (trace != RZ.webspace)
			RZsetcookie('RZtrace', (RZ.trace ? RZ.webspace : '') ,RZ.page.domain);

		var debug = RZgetcookie('RZdebug',RZ.page.domain);
		if (debug == RZ.webspace)
			RZ.debug = true;
		else if (debug != RZ.webspace)
			RZsetcookie('RZdebug', (RZ.debug ? RZ.webspace : '') ,RZ.page.domain);
	}

	//----- Determine if called from workflow preview
	if (RZwinaccess(parent))
	{
		if (parent.window.name=='revizepreview')
			RZ.revizepreview = true

		if ((parent.window.name != window.name			//must be in frames
		&& parent.window.name=='revizepreview') || window.name == 'workflowCompare1' || window.name == 'workflowCompare2' )
		{
			RZ.login = ''
			//RZ.revizepreview = true
			RZsetuphandler( 'onpagehide', 'return RZtemplateclose()' )
		}
	}
	else
	{
		// if standard permissions button and logged in as admin, treat as "Admin Panel"
		// TODO: can be removed once break keyup is solid
 		var permisisonButton = document.getElementById('RZadminwinButton')
		if (permisisonButton
		//&& RZisadmin()
		//&& navigator.userAgent.indexOf("Firefox") == -1
		&& !RZcheckoptions(RZ.webspacedesc,"noadminpanel")
		&& permisisonButton.src.search('images/edit/permissions\\.(jpg|gif)') != -1)
		{
			permisisonButton.href = 'javascript:RZadminwin()';
			permisisonButton.alt = 'Admin Panel';
		}
	}

	/**********************************************************/
	/*BOOKMARK RZpageSetup() DONE if AdminPanel not supported*/
	/********************************************************/
	if (RZ.revizepreview) return;
	if (location.pathname.search(/(calendar_app\/index.html|calendar_app\/?$)/) != -1) return;
	if (location.pathname.search(/.*\/calendar_app\/(editpages\/)?calendar_.*\.(html|jsp)/) != -1) return;

	if (location.pathname.indexOf('/revize/admincenter/') == 0) return;
	if (location.pathname.indexOf('/revize/debug/') == 0) return;
	if (location.pathname.indexOf('/revize/trace/') == 0) return;
	//if (location.pathname.indexOf('/revize/plugins/') == 0) return;
	if (location.pathname.indexOf('/revize/security/') == 0) return;
	if (location.pathname.indexOf('/revize/util/') == 0) return;

	//----- "Pause/Break" keyup event monitor
	RZadminwin.keypressCount = 0;
	RZadminwin.toggle = function(e,win)
	{
		RZadminwin.keypressCount++;
		/* use following to capture F1 key
		document.onhelp = function() {return(false);}
		window.onhelp = function() {return(false);}
		processF1()
		*/
		var keycode = (window.event) ? event.keyCode : e.keyCode;
		if (keycode == 19 || keycode == 3 || keycode == 135)
		{
			if (RZ.login && RZisadmin())
			{
				// Show more buttons if Ctrl key also pressed
							var more = (keycode == 3) ? 'more' : '';
				RZadminwin('',more);
			}
			else if (!RZ.login && RZadminwin.keypressCount >= 2)
			{
				if (!confirm('Login to Revize?')) return;
				var url = RZ.protocolRelativeRevizeBaseUrl + '/revize/security/index.jsp?webspace=' + RZ.webspace
						+ '&filename=/' + RZ.page.filenameFull;
				parent.location = url;
			}
			/*
			else
			{
				var msg = 'Must login as Administrator to open AdminPanel';
				if (RZadminwin.keypressCount >= 2) alert(msg);
				window.status = msg;
			}
			*/
		}
	}

	//----- After page loads, complete AdminPanel setup
	RZeventadd(window, "load", function()
	{
		// Open AdminPanel if needed
		if (RZisadmin()
		&& (location.hash.indexOf('adminpanel') == 1 || RZ.debug || RZ.trace))
			RZadminwin();

		// Activate "Pause/Break" keyup event monitor
		RZeventadd(document, "keyup", function(e) {RZadminwin.toggle(event,window)});
	});
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
/*function RZpublishcalendars()
{
	var fileinfo = RZgetfileinfo(location.href);
	var url = fileinfo.domain + location.pathname;
	var msg = 'Publishing Calendar Templates';
	document.getElementById(RZ.adminwinId).innerHTML = msg;
	location.href = '/revize/debug/PublishCalendarTemplates.jsp'
				  + '?webspace=' + RZ.webspace
				  + '&hash=' + 'RZadminwin'
				  + '&returnurl=' + escape(url);
}*/
/*---------------------------------------------------------------------------
Show or hide updated Admin Panel
if adminpanel.html not yet loaded, load into new absolute <div> as iframe;
otherwise if loaded, call adminpanel.html::RZadminwin(...)
----------------------------------------------------------------------------*/
function RZadminwin(msg,action)
{
	RZadminwin.width = 680;		//outer width (iframe & its container)
	//if (!RZisadmin()) return;

	// Open adminpanel.html iframe in absolute div at top of body
	// RZ.adminwin set to iframe window object once initialized
	if (!RZ.adminwin)
	{
		RZ.adminwin = 'setup';
		RZadminwin.action = action;			//Save for adminpanel.html

		var adminDiv = document.createElement('div');
		adminDiv.setAttribute('id','RZadminpanelContainer');
		adminDiv.style.position = "fixed";
		adminDiv.style.zIndex = "999999999999";
		adminDiv.style.left = '0px';
		adminDiv.style.top = '0px';
		adminDiv.style.margin = '0';
		adminDiv.style.padding = '0';
		adminDiv.style.boxShadow = '0 0 6px rgba(0,0,0,.175)';
		adminDiv.style.width = '100%';
		adminDiv.style.height = '80px';		//loading height
/* 		adminDiv.style.border = '0px none #FFF'; */
		adminDiv.style.font = '13px Arial,Helvetica,sans-serif';
		adminDiv.style.lineHeight = '21px';
/* 		adminDiv.style.color = 'black'; */
		adminDiv.style.margin = '0';
		adminDiv.style.padding = '20px 0';
		adminDiv.style.textAlign = 'center';
		adminDiv.style.backgroundColor = "#ffffff";
		adminDiv.innerHTML = '<br><b id="RZadminwin-loading">&nbsp;&nbsp;&nbsp;Loading Admin Panel...</b>';

		document.body.insertBefore(adminDiv,document.body.firstChild);
		RZadminwin.container = adminDiv;	//save for adminpanel.html

		var iframe = document.createElement('iframe');
		var	src = '/revize/admincenter/adminpanel.jsp'
		//if (RZ.webspace == 'RostraverTownship')
		//	src = '/revize/admincenter/adminpanel.work.jsp'
		iframe.setAttribute('id','RZadminpanel');
		iframe.setAttribute('src',src);
		iframe.setAttribute('width','100%');
		iframe.setAttribute('height','20');			//loading height
		iframe.setAttribute('scrolling','no');
		iframe.setAttribute('frameborder','0');
		iframe.setAttribute('marginwidth','0');
		iframe.setAttribute('marginheight','0');
		iframe.style.margin = '0';
		iframe.style.padding = '0';
		iframe.style.border = '0px none';
		iframe.style.visibility = "hidden"; 		//hide IE inset borders while loading
		adminDiv.replaceChild(iframe, adminDiv.firstChild);
		return false;
	}

	// Ignore calls after loading starts until it completes
	else if (RZ.adminwin == 'setup')
		return false;

	return RZ.adminwin.RZadminwin('',action);
}
/*---------------------------------------------------------------------------
Add a new style rule or cssRule based on browser

var rules = RZaddrules('.someClass, {color:'black', zIndex:99});
----------------------------------------------------------------------------*/
function RZaddrules(stylesheet,selector,selectorRules)
{
	var cssStyle, rule, rules = '';
	for (rule in selectorRules)
	{
		if (!selectorRules.hasOwnProperty(rule)) continue;
		cssStyle = RZcssfromstyle(rule)
		if (document.all)
			stylesheet.addRule(selector, cssStyle + ':' + selectorRules[rule]);
		else
			rules +=  cssStyle + ':' + selectorRules[rule] + ';';
	}
	if (!document.all)
		stylesheet.insertRule(selector + '{' + rules + '}', 0);
}
/*
* converts a css style name FROM a camelCase style property
*/
function RZcssfromstyle(style)
{
	return style.replace(/([A-Z])/g,'-$1').toLowerCase();
}
/*
* converts a css style name TO a camelCase style property
*/
function RZcsstostyle(style)
{
	var results;
	while (results = style.match(/(-)(\w)/))
	{
		style = style.substring(0,results.index)
			  + results[2].toUpperCase()
			  + style.substring(results.index+results[0].length)
	}
	return style;
}
/*-----------------------------------------------------------------------------------
Returns specified element current specified style

Paramenter:
	el 			html element or element id
	style		css style e.g. display, backgroundColor


02-20-2014 DCO
	Updated code based on: http://help.dottoro.com/ljscsoax.php

	Prior cos document.defaultView.getComputedStyle(el,'') returning null
	for chrome and FF (not sure of original reference used as base)

	Updated code much more bullet-proff and accomodates IE11+)
-----------------------------------------------------------------------------------*/
function RZelementCurrentStyleValue(el,style)
{
	var value = '';

	/* 02-20-2014 DCO: disabled see notes above
	if (document.all)
		value = el.currentStyle[style];
	else
		value =  document.defaultView.getComputedStyle(el,'').getPropertyValue(style);
	*/

	// 02-20-2014 DCO start \\
	var currentStyle = null;
	if (typeof(el) == 'string')
		el = document.getDocumentById(el);

	if (typeof(el) == 'object')
	{
		if (window.getComputedStyle)	//chrome & FF work (others TBD per Ray)
			currentStyle = window.getComputedStyle;

		else if (el.currentStyle)		//pre IE11
			currentStyle = el.currentStyle

		if (currentStyle && currentStyle[style])
			value = currentStyle[style];
	}
	// 02-20-2014 DCO end //

	return value;
}
/*-----------------------------------------------------------------------------------
Return array of all values found for specified CSS selector (e.g. .left, #top)
Array is filled as selector are discovered; CSS priority is not considered.
Upgraded to return object containing array of all values for each specified selector.
-----------------------------------------------------------------------------------*/
function RZselectorValues(selectors)
{
	// if single selector specified as string, convert to array
	if (typeof selectors == 'string')
		selectors = selectors.split(',');

    var values = {};
	var classes = document.styleSheets[0].rules || document.styleSheets[0].cssRules
    for (var x=0;x<classes.length;x++)
	{
        var cssSelector = classes[x].selectorText;
		if (RZcheckoptions(selectors,cssSelector))
		{
            var value = (classes[x].cssText)
					  ? (classes[x].cssText)
					  : (classes[x].style.cssText);
			if (!values[cssSelector])
				values[cssSelector] = [];
			values[cssSelector].push(value);
        }
    }
	return values;
}
/*---------------------------------------------------------------------------
* Set style to value for one or more rules
* IE can only define single selector so rules is an array
* (for Firefox it is a single element array)
----------------------------------------------------------------------------*/
function changeStyle(rules,style,value)
{
	for (var i=0;i<rules.length;i++)
		rules[i]['style'][style] = value;
}
/*---------------------------------------------------------------------------
(Internal Function) Disables links on workflow preview page.
Internal: Called when trying to leave workflow preview page
or onclick for Firefox (TODO: allow html popup by checking the event target).
----------------------------------------------------------------------------*/
function RZtemplateclose(value)
{
	if (!RZ.revizepreview) return
	var msg = 'Links disabled during preview of content changes'
	alert(msg)
	location.href = location.href	//cancels hyperlink
	return false
}
/*---------------------------------------------------------------------------
(Internal Function) Look for specific hash (e.g. debug or trace) on current
window, opener, referrer hash and associated cookie

Internal: Diagnostic Support
----------------------------------------------------------------------------*/
function RZcheckHash(value)
{
	var key = false
	if (!RZwinaccess(top))
		return key;

	//TODO: below has issues on some versions of chrome
	//		(window.top.location.hash may be undefined)
	if(window.top.location.hash.indexOf('#'+value) != -1
	|| location.hash.indexOf('#'+value) != -1
	|| RZ.parent.location.hash.indexOf('#'+value) != -1
	|| RZgetCookieValue('RZ'+value) == 'ON' )
	{
		key = true
	}
	else if (RZwinaccess(RZ.parent.opener))
	{
		if( RZ.parent.opener.location.hash.indexOf('#'+value) != -1)
			key = true
		else if (typeof RZ.parent.opener.top != 'undefined'
		&& RZ.parent.opener.top.location.hash.indexOf('#'+value) != -1)
			key = true
	}
	else if (typeof document.referrer != 'undefined')
	{
		if (document.referrer.indexOf('#'+value) != -1) key = true
	}
	return key
}
/*---------------------------------------------------------------------------
(Internal Function) Sets final variables based on page type
Internal: Called after page loads and all initialzation is done.
----------------------------------------------------------------------------*/
function RZpageLoaded()
{
	window.focus()		//insure window gets focus() after loaded
	if (RZ.pagetype == 'template')
	{
		//----- Display trace information
		var recordid;
		if (typeof RZ.record != 'undefined')
			recordid = RZ.record.id
		else
			recordid = RZ.editrecordid

		RZ.string = 'RZ.webspace: ' + RZ.webspace + '\n'
				  + "RZ.editrecordid: (" + recordid + ")\n"
				  + "Clearing Return URLs ..."
		RZtrace( "Published Page Now Loaded", RZ.string )

		//----- Update cookies
		if (RZgetCookieValue('RZeditFormReturnUrl') != '')
			RZsetCookieValue('RZeditFormReturnUrl','')

		/*	deactivated when list allowed as popup
			(better supports template as list page)
		if (RZgetCookieValue('RZeditListReturnUrl') != '')
			RZsetCookieValue('RZeditListReturnUrl','')
		*/

		if (location.hash == '#logout') return

		//----- Save webSpace name in cookie unless logout call
		RZsetCookieValue('RZwebspace',RZ.webspace + "#" + document.location)

		if (RZlogin())
		{
			//----- Display page username and role in status bar
			if (RZ.pagetype == 'template')
				window.status = 'Logged in User is ' + RZ.username
							  + ' (roles: ' + RZ.roles + ')'

			//----- Call onload handler if permission warning enabled and logged in
			if (RZcheckoptions(RZ.permissions_options,"warnings"))
				RZsetuphandler( 'onload', 'RZshowIcons()' )

			//----- Display critical and warnings for templates
			if (RZ.alert != '') RZalert( RZ.alert );
			RZwarning();
		}

		//----- Create login button for page permission testing
		if (RZcheckoptions(RZ.permissions_options,"warnings")) document.write(
			'<div id="RevizeLogin" style="visibility:visible; position:absolute; z-index:1; top:30">',
			/* TODO: autoclick
			'  <a href="javascript:RZautoClick();"><img border="0"',
			'   src="/revize/images/warning-auto.gif" alt="Auto Click"></a>',
			'  <br>',
			*/
			'  <a href="/revize/security/"><img border="0"',
			'   src="/revize/images/RevizeRzSmall.gif" alt="Revize Login"></a>',
			'</div>',
			'')
	}

	//----- TODO: document why RZ.loaded not set true for edit forms
	//		(perhaps we did not want to use onload handler)
	if (RZ.pagetype != 'editform')
	{
		RZsetuphandler( 'onload', 'RZprocessHash()' )
	}
}
/*---------------------------------------------------------------------------
(Internal Function) position page on hash set by save
Internal: Runs after page is loaded
----------------------------------------------------------------------------*/
function RZprocessHash()
{
	if(location.hash.indexOf('_rz') != -1
	&& location.hash.indexOf('#trace') == -1
	&& location.hash.indexOf('#debug') == -1)
		location.hash = location.hash.substring(1);
	RZ.loaded=true;
}
/*---------------------------------------------------------------------------
(Internal Function) Displays stack trace(s) from rz.setup()
Internal: NOT YET USED
----------------------------------------------------------------------------*/
function RZprintStackTrace(msg)
{
	RZ.tracewin = RZpopupUrl('RevizeTrace');
	var msg = '<pre>' + msg + '</pre>'
	RZ.tracewin.document.write(msg);
}
/*---------------------------------------------------------------------------
(Internal Function) Repair bad page permission link
Internal: Recovery Support
Future: under development (currently placeholder with no functionality)
----------------------------------------------------------------------------*/
function RZbadlink(module,recordid,url)
{
}
/*---------------------------------------------------------------------------
(Internal Function) Displays page permissions warning on templates. NOT COMPLETED
Called as onload handler only

Internal: Called by onload handler permission warning are enabled and user is
currently logged in.

Future: under development (may be available in a later release)

Parameters:
  	None - no input parameters

Returns:
  	There is currently no value returned
----------------------------------------------------------------------------*/
function RZautoClick()
{
	var msg = 'Automatically click on every bad link to define parents.     '
	if (!confirm(msg)) return

return
	RZ.msg = ''
	var tag = 'A'
	if (tag == '')
		RZnodeProperties( 0, dw.getDocumentDOM("document").documentElement )
	else
	{
		var allTags = document.getElementsByTagName(tag);
		for (var i=0; i<allTags.length; i++)
		{
			RZ.msg += tag.toLowerCase() + '[' + i + ']:\n'
			if (allTags[i].hasChildNodes())
				for (var j=0; j<allTags[i].childNodes.length; j++)
					RZnodeProperties( 1, allTags[i].childNodes[j] )
		}
	}

	RZ.msg = RZ.msg.replace( /\t/g, '     ' )
	var pattern = /(.*\n){0,40}/g
	var matchArray = RZ.msg.match(pattern)
	alert('Written to ' + RZ.constant.tempDOM + '\n\n'
	     +'Up to 40 lines below:' + '\n' + matchArray[0])

}
/*---------------------------------------------------------------------------------------------
Parse a DOM node
Future: under development (may be available in a later release)
---------------------------------------------------------------------------------------------*/
function RZnodeProperties( level, childObj )
{
	var i,text
	var tab = ''
	var Node = new Object()
	Node.TEXT_NODE = 2
	Node.ELEMENT_NODE = 1
	Node.COMMENT_NODE = 1


	for (i=0; i<level; i++) tab += '\t'

	if ( childObj.nodeType == Node.TEXT_NODE)
	{
		RZ.msg += tab + 'TEXT NODE:\n'
		text = childObj.data
		text = text.replace(/\r/g,'\\r')
		text = text.replace(/\n/g,'\\n')
		RZ.msg += tab + '\t' + text + '\n'
	}
	else if (childObj.nodeType == Node.ELEMENT_NODE)
	{
		var name = ''
		if ( typeof childObj.getAttribute('name') != 'undefined')
			name = ' ' + childObj.getAttribute('name')
		RZ.msg += tab + '<' + childObj.tagName + '>'+name+':\n'
	}
	else if (childObj.nodeType == Node.COMMENT_NODE)
	{
		RZ.msg += tab + 'COMMENT NODE:\n'
		text = childObj.data
		text = text.replace(/\n/g, '\n\t' + tab )
		RZ.msg += tab + '\t' + text + '\n'
	}
	else
	{
		RZ.msg += tab + 'UKNOWN nodeType=' + childObj.nodeType + ':\n'
		RZ.msg += tab + 'Properties:\n'
		for (i in childObj)
			RZ.msg += tab + '-->' + i + '<--:' + childObj[i]
	}

	//----- Chase child nodes
	if (childObj.hasChildNodes())
		for (i=0; i<childObj.childNodes.length; i++)
			RZnodeProperties( level+1, childObj.childNodes[i] )
}
/*---------------------------------------------------------------------------
(Internal Function) Displays page permissions warning on templates.
Internal: Called by onload handler if warning are active and a user logged in
----------------------------------------------------------------------------*/
function RZshowIcons()
{
	//----- Show top left icon
	var icon = document.getElementById('RevizePageMessage')
	if (icon != null)
		icon.style.visibility = "visible";

	//----- Show frown icon if button must specify a template
	for (var i=0; i<RZ.icons.length; i++)
	{
		var module = RZ.icons[i]
		if(typeof RZ.linktemplates[module] == 'undefined'
		|| RZ.linktemplates[module] == '')
		{
			var icon = document.getElementById('RevizeButtonWarning' + i)
			if (icon != null)
				icon.style.visibility = "visible";
		}
	}
}

/*---------------------------------------------------------------------------
Get File Info for specifiec URL or file.

Description:
	Parses either a url or file and breaks apart into individual fully
	qualified components.  By default the input pathname is assumed to be a
	file if the	syntax is ambigious.  To intepret first component as domain
	as browsers do on the address line specify domain as an option.

	If port 80 is specified on input, it is omitted like IE location functions
	TODO: have not verified if Netscape location omits port 80

Parameters:
	pathname-		fully or partially qualified url or path/filename
	options-		=domain treat everything up to first / as domain
					(if protocol not specified e.g. http://)

Return Value List:
	page.domain     = 'http://localhost:8080'		//no trailing slash
	page.pathname   = '/revize/demositeIII'	//with leading slash but not trailing
	page.filename   = 'contacts'
	page.extension  = 'html'
	page.query      = '?webSpace=demositeII&recordid=1'	//contains leading ?
	page.hash       = 'trace'						//leading # omitted
	page.home       = 'http://localhost:8080//revize/demositeIII/index.html'

Notes:
	Regression test at .../revize/util/snippet_helper_getfileinfo_test

	TODO: some scenarios noted as in above test do not currently work properly.
	Many scenarios of domains ARE ONLY intrepreted correctly if domain option
	is specified and the input pathname ends with a slash when no filename.
	(remember page.href however is never returned with ending slash by design)
	See: .../revize/util/snippet_helper_getfileinfo_test for details.
----------------------------------------------------------------------------*/
/* Same as RZgetfileinfo (retained for backward compatibility) */
function RZgetFileInfo(pathname, options)
{return RZgetfileinfo(pathname, options)}
function RZgetfileinfo(pathname, options)
{
	var pos,idx,results
	var href=''
	var domain=''
	var filename=''
	var sep=''
	var extension=''
	var query=''
	var hash=''
	var home=''
	if (typeof options == 'undefined')
		options = '';
	else
		options += ','
	if (!pathname) pathname = '';
	if (pathname == '#') pathname = location.href
	if (pathname != '')
	{
		pathname = pathname.split('\\').join('/');

		//----- Determine domain
		domain = ''
		pos = pathname.indexOf(':')				//check for first colon :

		//----- If domain option & protocol is missing, prepend to pathname
		if (options.indexOf('domain,') != -1
		&& RZsubstring(pathname,pos+1,pos+3) != '//')
		{
			if (location.protocol != '')
				pathname = location.protocol + '//' + pathname
			else
				pathname = 'http://' + pathname
			pos = pathname.indexOf(':')			//reset colon pos
		}

		//----- If protocol present, e.g. //http:// https:// ftp://
		if (RZsubstring(pathname,pos+1,pos+3) == '//')
		{
			pos += 3
			if (pathname.indexOf('/',pos) != -1)	//if first slash following //:
				pos = pathname.indexOf('/',pos)		//domain goes up to slash
			else if (RZsubstring(pathname,0,4).toLowerCase() != 'file')
				pos = pathname.length				//assume domain is all of pathname
		}
		else if (pos == -1)		//not file type (e.g. C:) so use current page domain
		{
			if (options.indexOf('domain,') != -1
			|| RZsubstring(pathname,0,4).toLowerCase() == 'www.')
			{
				pos = pathname.indexOf('/')
				if (pos >= 0)
				{
					domain = pathname.substring(0,pos)
					pathname = pathname.substring(pos+1)
				}else
				{
					domain = pathname
					pathname = ''
				}
			}
			else
			{
				domain = document.location.host			//blank if file
				if (document.location.protocol != '')	//if not file
				{
					domain = document.location.protocol + '//' + domain
					pos = domain.length
					if (RZsubstring(pathname,0,1) != '/')
						pathname = '/' + pathname
					pathname = domain + pathname
				}
			}
		}

		//-----  if : found, file format of C: (split into domain and pathname)
		if (pos != -1)
		{
			if (pathname.substring(pos,pos+1) == ':')
				domain = pathname.substring(0,pos+1)
			else
				domain = pathname.substring(0,pos)

			pathname = pathname.substring(pos)
			if (pathname.substring(0,1) == ':')
				pathname = pathname.substring(1)
		}

		//----- Strip port 80 if present in domain
		pos = (domain+'/').indexOf(':80/')
		if (pos != -1)
			domain = domain.substring(0,pos);

		//----- Parse pathname and filename
		//		DCO 03-09-2012 previously simple lastIndexOf('/') incorecctly
		//		               found slash past hash "#" or query "?"
		//		e.g. /calendar_app/index.html#Master,03/09/2012
		//			 (both results[0] & results[1] have pathname
		results = pathname.match(/^([^#?]*\/)[^#?]*?/m);

		if (results)	//found slash PRECEEDING query "?" or hash "#"

		{	//results.lastIndex NA on IE9
			pos = results.index + results[1].length;
			filename = pathname.substr(pos);
			pathname = pathname.substr(0,pos-1);
			if (pathname.substr(0,1) != '/')
				pathname = '/' + pathname;
		}
		else			//safe to use lastIndexOf() when no query or hash
		{
			filename = pathname;
			pathname = '';
		}

		//------ Parse search (query)
		pos = filename.indexOf('?')
		if (pos == -1)
			query = ''
		else
		{
			query = filename.substring(pos)
			filename = filename.substring(0,pos)
		}

		//------ Parse hash
		pos = filename.indexOf('#')
		if (pos != -1)
		{
			hash = filename.substring(pos+1)
			filename = filename.substring(0,pos)
		}

		//------ Parse filename extension
		pos = filename.lastIndexOf('.')
		if (pos == -1)
			extension = ''
		else
		{
			extension = filename.substring(pos+1)
			filename = filename.substring(0,pos)
		}
		if (filename == '')		// use index.html when filename is blank
		{
			filename = ''
			extension = ''
		}

		//----- home page (questionable value)
		home = domain + pathname
		if (RZright(home,1) != '/' && pathname != '') home += '/'
	}

	//----- Return all the components
	var page = new Object();
	page.domain = domain;
	page.pathname = pathname;
	page.filename = filename;
	page.extension = extension;
	page.extention = extension;

	page.filenameFull = page.filename;
	if (page.extension)
		page.filenameFull += '.' + extension;
	page.pathfilename = page.filenameFull;
	if (page.pathname)
		page.pathfilename = page.pathname + '/' + page.pathfilename;

	page.query = query;
	page.search = query;
	page.hash = hash;
	page.home = home;

	page.sep = ((extension != '') ? '.' : '')
	page.href = domain
	page.href += pathname
	page.href += ((filename != ''&& RZright(page.href,1) != '/') ? '/' : '')
	page.href += filename + page.sep + extension + query
	if (hash != '') page.href += '#' + hash

	return page
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
function RZbuildurl(fileInfo)
{
	var location = fileInfo.domain + fileInfo.pathname
	if (RZright(location,1) != '/') location += '/'
	location += fileInfo.filename + fileInfo.sep + fileInfo.extension
	          + fileInfo.query
	if (fileInfo.hash != '') location += '#' + fileInfo.hash
	return location
}
/*---------------------------------------------------------------------------
Return Browser Version - report page design flaw if unknown

Parameters:
	None- (no input parameters)

Returns: Browser version
----------------------------------------------------------------------------*/
function RZbrowserversion()
{
	var version = 0
	if (RZ.isnavigator)
	{
		version = parseFloat( navigator.appVersion )
	}else
	{
		var pos = navigator.appVersion.indexOf("MSIE")
		version = parseFloat(navigator.appVersion.substring(pos+4))
	}
	if (isNaN(version) || version == 0)
		RZalert( "Unable to determine Browser version\n"
			 + "navigator.appVersion: " + navigator.appVersion )

	return version
}
/*---------------------------------------------------------------------------
Resize window; if width or hieght not specified use available size

Parameters:
	width -		specifies requested window width (text or number)
	hieght -	specifies requested window hieght (text or number)
	justify -	Optional string; right or left to justify window respectively
	win -		Optional window object to specify window if not window/frame
				that includes the snippet_helper.js library file.
----------------------------------------------------------------------------*/
function RZresize(width,height,justify,win)
{
	 return;
	 if (!width) width = screen.availWidth;
	 if (!height) height = screen.availHeight;
	 if (!justify) justify = 'center'
	 if (!win) win = window
	 if (win.dialogArguments) return; //DCO 02-04-2014

	 //DCO 08-03-2009
	 //if (RZ.isnavigator) height -= 125  //TODO: for linkmanager ???

	 var x = (screen.availWidth - width) / 2
	 var y = (screen.availHeight - height) / 2
	 if (justify == 'right')
	  x = screen.availWidth - width - 10
	 else if (justify == 'left')
	  x = 0
	 if (x < 0) x = 0
	 if (y < 0) y = 0

	 win.resizeTo(width,height);
     win.moveTo( x,y )

}
/*-----------------------------------------------------------------------------------
Return window and browser screen sizes and offset to locate block of width & height.

NOTE: browser width & height returned are limited to screen width/height

---------
Arguments:
---------
width		(optional) width of window or layer to open; default is full size
height		(optional) height of window or layer to open; default is full size
options		list of option=value or option separated by commas from list below:
				norounding	returned width/height & offsets rounded to nearest integer
				browser		returned width/height & offsets relative to browser window
							instead of screen
-----------------------------------------------------------------------------------*/
function RZscreensizes(width,height,options)
{
	if (typeof width == 'undefined') width = 0;
	if (typeof height == 'undefined') height = 0;

	var base, offsetX, offsetY;
	var sizes = {
		width:width, height:height,
		screenWidth:0, screenHeight:0,
		browserWidth:0, browserHeight:0,
		offsetWidth:0, offsetHeight:0
	};

	//----- Is offset limited and relative to browser or screen screen size
	var base = 'screen';
	if (RZcheckoptions(options,'browser'))
		base = 'browser';

	//----- Window sizes...
	sizes.screenWidth=screen.width;
	sizes.screenHeight = screen.height;
	offsetY = 0;
	offsetX = 0;

	//----- Browser sizes...
	if(!window.innerWidth)	//IE...
	{
		if (!(document.documentElement.clientWidth == 0))
		{					//...strict mode
			sizes.browserWidth = document.documentElement.clientWidth;
			sizes.browserHeight = document.documentElement.clientHeight;
			if (base == 'browser')
			{
				offsetY = document.documentElement.scrollTop;
				offsetX = document.documentElement.scrollLeft;
			}
		}
		else
		{					//...quirks mode
			sizes.browserWidth = document.body.clientWidth;
			sizes.browserHeight = document.body.clientHeight;
			if (base == 'browser')
			{
				offsetY = document.body.scrollTop;
				offsetX = document.body.scrollLeft;
			}
		}
	}
	else					//WC3...
	{
		sizes.browserWidth = window.innerWidth;
		sizes.browserHeight = window.innerHeight;
		if (base == 'browser')
		{
			offsetX = window.pageXOffset;
			offsetY = window.pageYOffset;
		}
	}

	//----- If browser sizes exceed screen sizes, adjust
	sizes.browserWidth = Math.min(sizes.browserWidth,sizes.screenWidth);
	sizes.browserHeight = Math.min(sizes.browserHeight,sizes.screenHeight);

	//----- Adjust height & width to center of browser or screen (depending on base value)
	//		If either width or height not specified, set to browser or screen width/height
	//		negative width or height uses full size less negative value specified
	if (width == 0)
		sizes.width = sizes[base+'Width'];
	else if (width < 0)
		sizes.width = sizes[base+'Width'] + width;

	if (height == 0)
		sizes.height = sizes[base+'Height'];
	else if (height < 0)
		sizes.height = sizes[base+'Height'] + height;

	//----- Limit width and height to browser or screen width and height
	sizes.width = Math.min(sizes.width,sizes[base+'Width']);
	sizes.height = Math.min(sizes.height,sizes[base+'Height']);

	offsetX = (sizes[base+'Width'] - sizes.width) / 2 + offsetX;
	offsetY = (sizes[base+'Height'] - sizes.height) / 2 + offsetY;

	//----- round up unless no rounding specified
	if (!RZcheckoptions(options,'norounding'))
	{
		offsetX = parseInt(offsetX + .5);
		offsetY = parseInt(offsetY + .5);
	}

	sizes.offsetWidth = offsetX;
	sizes.offsetHeight  = offsetY;

	//----- Return object with all sizes
	return sizes;
}
/*---------------------------------------------------------------------------
Return true if layer exists and is currently visible.

Parameters:
----------
layerName-	text representing layer name

doc-		Optional argument specifing document object
			(appropriate when caller in in another frame or window)
----------------------------------------------------------------------------*/
function RZisvisible(layerName,doc)
{
	if (typeof doc == 'undefined') doc = document
    if (typeof doc == 'undefined') return false;    //firefox cludge
	if (typeof(layerName) == 'object')
		layerName = layerName.id;
	var status = false;

	if (doc.layers && doc.layers[layerName])		//ns
	{
		if(typeof doc.layers[layerName] != 'undefined'
		&& doc.layers[layerName].visibility == 'visible') status = true
	}
	else if (RZ.css)			//ie or firefox (see notes in RZshowlayer)
	{
		var el = doc.getElementById(layerName)
		if (!el && RZ.MSIE) el = doc.all[layerName];
		if (el != null)
		{
			var layerStyle = el.style
			if (layerStyle.visibility != ''	&& layerStyle.visibility == 'visible')
				status = true
			if (layerStyle.display != '' && layerStyle.display != 'none')
				status = true
		}
	}

	return status;
}
/*---------------------------------------------------------------------------
Does layer exist?

Parameters:
----------
layerName-	text representing layer name

trueFalse-	Not used

doc-		Optional argument specifing document object
			(appropriate when caller in in another frame or window)
----------------------------------------------------------------------------*/
function RZhavelayer(layerName,trueFalse,doc)
{
	if (typeof doc == 'undefined') doc = document
	if (typeof(layerName) == 'object')
		layerName = layerName.id;
	if (doc.layers && doc.layers[layerName])		//ns
	{
		if(typeof doc.layers[layerName] == 'undefined') return false
	}
	else if (RZ.css)			//ie or firefox (see notes in RZshowlayer)
	{
        var el = document.getElementById(layerName)
        if (el == null) return false
		//if(typeof doc.all[layerName] == 'undefined') return false
	}
	return true
}
/*---------------------------------------------------------------------------
Show or hide a layer based on browser type.  If the layer visibility property
is valid (non-blank), it is used to show or hide layer however it does not
work for Firefox.  If the visibility property is blank and the style.display
property if not blank, it is used to hide or show layer.

This feature was initially added as a simple backward compatible method to use
this function in Firefox in legacy utility functions such as the link manager
by simply changing the condictionally displayed code to define a display
property and leave the visiblity property blank.

Parameters:
----------
layerName-	text representing layer name

trueFalse- 	optional argument:
			if not passed, toggle layer (i.e. hide if showing or show if hidden)
			otherwise: if true show layer, if false hide layer

doc-		Optional argument specifing document object
			(appropriate when caller in in another frame or window)
----------------------------------------------------------------------------*/
function RZshowlayer(layerName,trueFalse,doc)
{
	var el, msg = '';
	if (typeof doc == 'undefined') doc = document

	//----- Netscape 4 loses layers if page was resized so leave layer visible
	if (RZ.isnavigator
	&& RZ.isnavigatorLayers == true
	&& doc.layers.length == 0) return

	if (typeof(layerName) == 'object')
		el = layerName;

	//----- If invalie layerName of object, set status and return
	else if (typeof layerName != 'string')
	{
		RZalert('Invalid layer name must be text argument');
		return;
	}
 	//----- Get div/span/layer element
	else
	{
		el = doc.getElementById(layerName)
		if (!el && RZ.MSIE) el = doc.all[layerName];
	}

	//----- If trueFalse not specified, toggle setting
	if (typeof trueFalse == 'undefined')
	{
		if ( RZisvisible(layerName,doc) == true)
			trueFalse = false
		else
			trueFalse = true
	}

	//----- See if layers are found on Netscape
	var msg = "Can't Hide Layer because ...\n"
	if (trueFalse == true) msg ="Can't Show Layer because ...\n"
	if (doc.layers)									//ns
	{
		if(doc.layers.length == 0)
		{
			msg += 'No Netscape Layers Defined (may be caused by resizing the window)\n'
				 + 'Try refreshing the page and re-entering information'
			RZalert(msg)
			return
		}
		RZ.isnavigatorLayers = trueFalse;	//indicate layer existed at one time
		if(typeof doc.layers[layerName] == 'undefined')
		{
			msg += 'Netscape Layer Not Defined: ' + layerName

			// list defined layers
			msg += '\n\nDOM document.layers properties'
			for (i in doc.layers)
				msg += '\n      ' + i + '=' + doc.layers[i]
			RZalert(msg)
			return
		}
	}
	else if (RZ.css)					//ie or firefox (see notes in description)
	{
		if (el == null)
		{
			msg += 'Layer Not Defined: ' + layerName
			RZalert(msg)
			return
		}
	}

	//----- Show or hide layer
	if (trueFalse == true)	// show layer
	{
		if (doc.layers && doc.layers[layerName])			//ns
			doc.layers[layerName].visibility = 'visible';

		else if (RZ.css)					//ie or firefox (see notes in description)
		{
			//var displayBlock = el.tagName.toUpperCase() == 'SPAN' ? 'inline' : 'block' ;
			var displayBlock = 'inline';	//most tags display=inline
			if (el.tagName.toLowerCase() == 'div')
				displayBlock = 'block';		//div display=block
			if (el.style.visibility != '')
			{
				el.style.visibility = 'visible';
				el.style.zIndex = 100;
			}
			else if (el.style.display != displayBlock)
				el.style.display = displayBlock;
		}
    }
    else 					// hide layer
    {
		if (doc.layers && doc.layers[layerName])			//ns
			doc.layers[layerName].visibility = 'hidden';
		else if (RZ.css)				//ie or firefox (see notes in description)
		{
			if (el.style.visibility != '')
				el.style.visibility = 'hidden';
			else if (el.style.display != 'none')
				el.style.display = 'none';
		}
	}
}
/*---------------------------------------------------------------------------
Set Cookie value
-----------
Parameters:
-----------
key			Key part of the Cookie key=value pair
value		Value part of key=value (may have optional qualifier appended)
qualifier	(Optional) string specifyin gualifier
			e.g. current page url or webspace domain
---------
Examples:
---------
	RZsetcookie('RZeditListReturnUrl',location.href);		//no qualifier
	RZsetcookie('RZlogin',RZ.webspace+"#"+RZ.page.domain);	//value has qualifier
	RZsetcookie('RZuser',RZ.username,RZ.page.domain)		//qualifier 3rd arg
----------------------------------------------------------------------------*/
function RZsetCookieValue( key, value, qualifier )
{ return RZsetcookie( key, value, qualifier ) }
function RZsetcookie( key, value, qualifier )
{
	if (!location.host.endsWith('revize.com')) {
		return false;
	}
	if (!qualifier) qualifier = '';
	if (qualifier)
	{
		if (qualifier.substr(0,1) != '#')
			qualifier = '#' + qualifier;
		value += qualifier;
	}

	var cookieSecure = window.location.protocol === 'https:' ? '; Secure' : '';

	document.cookie = key + '=' + value
   	                + '; path=/; SameSite=Strict' + cookieSecure + '; Partitioned';

	var text = key + "=" + value;
	RZtrace( 'Set Cookie', text )
	return text;
}

/* Same as RZgetcookie (retained for backward compatibility) */
function RZgetCookieValue( key, qualifier )
{ return RZgetcookie( key, qualifier ) }
/*---------------------------------------------------------------------------
Get Cookie value

Parameters:
----------
key-		Key part of the Cookie key=value pair

qualifier-	Optional parameter that qualifies the cookie by requiring the
			value to end with qualifier string.  Either a blank value is
			returned the qualifier string is removed from the returned value.
			Examples qualifies are: server domain and/or page url

			If qualifer is blank, accept any qualified value after stripping
			the cookie qualifier
----------------------------------------------------------------------------*/
function RZgetcookie( key, qualifier )
{

	var msg = '';
	var value = '';
	if (!key)
		RZwarn('Key undefined');

	else
	{
		var allcookies = document.cookie + ';'
		var pos = allcookies.toLowerCase().indexOf( key.toLowerCase()+';' );
		if (pos == -1)	// not empty string value
			pos = allcookies.toLowerCase().indexOf( key.toLowerCase()+'=' );
		if (pos == -1) 	// if no cookie defined, return blank
			value = ""
		else // when cookie defined, return value
		{
			var valStart = pos + key.length + 1;
			if (allcookies.substring(valStart-1,valStart) != "=" )
				value = ""
			else
			{
				var valEnd = allcookies.indexOf( ";", valStart );
				if (valEnd == -1 ) valEnd = allcookies.length - 1
				value = allcookies.substring( valStart, valEnd );  //keep value case sensitive
			}
		}

		//----- Build trace message; check for qualifier and remove or set value to blank
		msg = key + "=" + value
		if (typeof qualifier != 'undefined')
		{
			msg += '\nQualifier: (' + qualifier + ')'
			pos = value.indexOf('#')
			if (pos <= 0)
				value = ''
			else if (qualifier != '' && value.substring(pos+1) != qualifier)
				value = ''
			else
				value = value.substring(0,pos)
			msg += '\nQualified Value: (' + value + ')'
		}
	}

	RZtrace("Get Cookie",msg)
	return value
}

async function RZremoveCookie( key )
{
	var cookies = await cookieStore.getAll(key);
	for (var cookie of cookies) {
		await cookieStore.delete(cookie.name);
	}
}

async function RZrebuildRevizeCookies() {
	var cookies = await cookieStore.getAll();
	for (var cookie of cookies) {
		if (cookie.name.startsWith('RZ')) {
			var name = cookie.name;
			var value = cookie.value;
			await RZremoveCookie(cookie.name);
			RZsetcookie(name, value);
		}
	}
}

/*----------------------------------------------------------------------------
Date subclass to supports dashes "-" in constructor for FF & Chrome:
	.e.g. new RZdate('12-21-2012')

Plus additional properties and methods.
The builtin Date() object is not extended to avoid different behavior caused
by adding prototypes directly.

TODO:
	date.formatted.revizeDate --> date.get('revizeDate')
----------------------------------------------------------------------------*/
function RZdate(year,month,day,hours,minutes,seconds,ms)
{
	var date = null;
	switch (RZdate.arguments.length)
	{
		case 0:
			date = new Date();
			break;
		case 1:		//milliseconds since midnight 1-1-70 -OR- date string
			if (typeof year == 'number')
				date = new Date(year)
			else
			{		//date object or string; replace dashs in date
				var dateStr = (year + '')
				dateStr = dateStr.replace(/Noon/i,'12:00pm');
				dateStr = dateStr.replace(/Midnight/i,'12:00am');
				dateStr = dateStr.replace(/(\d)\-(\d)/g,'$1/$2');

				dateStr = dateStr.replace(/(\d{1,2}\/\d{1,2}\/)(\d{2})(?!\d)/, '$120$2');
				dateStr = dateStr.replace(/(\d)(am|pm)/, '$1 $2');

				if (dateStr)
					date = new Date(dateStr);
				else
					date = new Date();
			}
			break;
		case 2:
			date = new Date(year,month);
			break;
		case 3:
			date = new Date(year,month,day);
			break;
		case 4:
			date = new Date(year,month,day,hours);
			break;
		case 5:
			date = new Date(year,month,day,hours,minutes);
			break;
		case 6:
			date = new Date(year,month,day,hours,minutes,seconds);
			break;
		default:
			date = new Date(year,month,day,hours,minutes,seconds,ms);
			break;
	}
	//----- If invalid date, return NaN
	if (isNaN(date)) return null;

	date.isRZdate = true;
	date.string = date.toString();	//only used show value in debugger
	//date.toString = function() ... may work better

	//----- Add additional properties and methods.
	//		calendar_app issues
	//		1. cloning does not get these properties and methods
	//		2. adding reference to homeframe freezes IE7
	//		   must explictly reference as homeframe.RZdate(...)
	//		3. valid date return true for isNaN beside invalid when
	//		   not called from homeframe
	for (var prop in RZdate.prototype)
		date[prop] = RZdate.prototype[prop];

	if (date.getFormatted)			//TODO: change to getFormat()
		date.getFormatted();		//set formatted data for constructor date
	return date;
}
/*----------------------------------------------------------*/
/*BOOKMARK RZdate static properties (instance not required)*/
/*--------------------------------------------------------*/
RZdate.baseDate = '01/01/1970';
RZdate.monthNames = ["January", "February", "March", "April",
				     "May", "June", "July", "August",
					 "September", "October", "November", "December"];
RZdate.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday",
				   "Thursday", "Friday", "Saturday"];

RZdate.getMonth = function(monthName)
{
	for (var i=0; i<RZdate.monthNames; i++)
		if (RZdate.monthNames[i] == monthName) return i;
	return -1;
}

/*-------------------------------------------------------------*/
/*BOOKMARK RZdate instance properties (backward compatibility)*/
/*-----------------------------------------------------------*/
RZdate.prototype.monthNames = ["January", "February", "March", "April",
							   "May", "June", "July", "August",
							   "September", "October", "November", "December"];

RZdate.prototype.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday",
							  "Thursday", "Friday", "Saturday"];

/*------------------------*/
/*BOOKMARK RZdate methods*/
/*----------------------*/
RZdate.prototype.get = function(key)		//return format property
{											//TODO: extend to get any property
	if (typeof this.formatted[key] == 'undefined')
		return key;

	this.getFormatted();
	return this.formatted[key];
}
RZdate.prototype.toString = function()		//return string for date
{
	return new Date(this.getTime()) + '';
}
RZdate.prototype.getMonthName = function()	//return full month name
{
	return this.monthNames[this.getMonth()];
}
RZdate.prototype.getDayName = function()	//return full day name
{
	return this.dayNames[this.getDay()];
}
RZdate.prototype.getDaysInMonth = function()
{
	//                  1  2  3  4  5  6  7  8  9 10 11 12
	var daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
	var month = this.getMonth();
	var days = daysInMonth[month];
	if (month==1 && isLeapYear(this.getFullYear()))
		days=29;
	return (days);

	function isLeapYear(Year)
	{
		if (((Year % 4)==0) && ((Year % 100)!=0) || ((Year % 400)==0))
			return true;
		else
			return false;
	}
	/* alt from: http://msdn.microsoft.com/en-us/library/aa239571(v=vs.60).aspx
	// may not work in non-IE browsers
	eomDate = new Date();
	eomDate.setMonth(eomDate.getMonth() + 1 );
	eomDate.setDate(1);
	eomDate.setDate( eomDate.getDate() - 1);
	alert("Last day of this month = " + eomDate);
	*/
}
/*----------------------------------------------------------------------------
Add/substract number of months to current date.
return number of days added or subtracted
----------------------------------------------------------------------------*/
RZdate.prototype.addMonth = function(number)
{	//backward compatibility
	return this.addMonths(number)
}
RZdate.prototype.addMonths = function(number)
{
	if (typeof number == 'undefined') number = 1;
	number = parseInt(number);

	var time = this.getTime();
	var year = this.getFullYear() + parseInt(number / 12);
	var month = (this.getMonth() + number) % 12;
	if (number > 0 && month < this.getMonth())
		year++;
	else if (number < 0 & month > this.getMonth())
		year--;
	var day = this.getDate();

	// advance to next month using day=1
	this.setDate(1);
	this.setYear(year);
	this.setMonth(month);

	// adjust date using current day or last day of month
	day = Math.min(day,this.getDaysInMonth());
	this.setDate(day);
	this.getFormatted();

	time = this.getTime() - time;
	return time / 24 / 60 / 60 / 1000; 	//number of days added
}
/*----------------------------------------------------------------------------
Add/substract number of weeks to current date.
return number of minutes added or subtracted
----------------------------------------------------------------------------*/
RZdate.prototype.addWeeks = function(number)
{
	if (typeof number == 'undefined') number = 1;
	return this.addDays(number*7);
}
/*----------------------------------------------------------------------------
Add/substract number of days to current date.
return number of minutes added or subtracted

Credit: http://www.w3schools.com/js/js_obj_date.asp
They say if adding days goes into another month or year, Date object adjusts.
----------------------------------------------------------------------------*/
RZdate.prototype.addDays = function(number)
{
	if (typeof number == 'undefined') number = 1;
	number = parseInt(number);

	var time = this.getTime();
	this.setDate(this.getDate() + number);
	this.getFormatted();

	time = this.getTime() - time;
	return (time / 60 / 1000); 	//number of minutes added
}
/*----------------------------------------------------------------------------
Return new RZdate() object containing only the date portion of this RZdate().
----------------------------------------------------------------------------*/
RZdate.prototype.getDatePart = function()
{
	return new RZdate(this.getFullYear(),this.getMonth(),this.getDate());
}
/*----------------------------------------------------------------------------
Return a new Date() object which is GMT representation of time component.

Therefore getTime() returns milliseconds since midnight not since GMT 12:00am
(e.g. 0 for midnight; 1*60*60*1000 = 3600000 for 1am, etc).

However getHours() returns GMT hours not the hour specified when this RZdate
object was created. Therefore RZdate() with no time component (i.e. midnight)
returns 19 (7pm) from getHours() when local is EST since EST is GMT-5 hours.
----------------------------------------------------------------------------*/
RZdate.prototype.getTimePart = function()
{
	var date = new Date(1970,0,1);
	date.setUTCHours(this.getHours(),
					 this.getMinutes(),
					 this.getSeconds(),
					 this.getMilliseconds());
	return date;
}
/*----------------------------------------------------------------------------
Returns the week number for this date.

@param int dowOffset (optional) day week starts on (0 to 6) 1 is Monday
@return int ISO 8601 week number

Credit: Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com
----------------------------------------------------------------------------*/
RZdate.prototype.getWeek = function(dowOffset)
{
	if (isNaN(this)) return null;
	dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero

	var newYear = new Date(this.getFullYear(),0,1);
	var day = newYear.getDay() - dowOffset; //the day of week the year begins on
	day = (day >= 0 ? day : day + 7);
	var daynum = Math.floor((this.getTime() - newYear.getTime() -
				 (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
	var weeknum;

	//if the year starts before the middle of a week
	if(day < 4)
	{
		weeknum = Math.floor((daynum+day-1)/7) + 1;
		if(weeknum > 52)
		{
			nYear = new Date(this.getFullYear() + 1,0,1);
			nday = nYear.getDay() - dowOffset;
			nday = nday >= 0 ? nday : nday + 7;
			/*if the next year starts before the middle of
			  the week, it is week #1 of that year*/
			weeknum = nday < 4 ? 1 : 53;
		}
	}
	else
		weeknum = Math.floor((daynum+day-1)/7);
	return weeknum;
}
/*---------------------------------------------------------------------------------------------
getNthDayInMonth(nth)
If nth specified, get date for nth occurance of this.date dayOfWeek -OR-
If no parameters, determine occurance of day of week in this.date month

----------------------
Parameters (optional):
----------------------
theDayOfWeek 	specifies day of week; 0-6 or day name (at least 3 characters)
theNth			specifies desired occurance of theDayOfWeek

--------
Returns:
--------
if parameters:	(RZdate) matching theNth occurance of theDayOfWeek in the month
otherwise		(String) 1st to 4th or 'last' if nth > 4th)

--------
Examples:
---------
this.date=01-01-2012
				getNthDayInMonth() 			returns '1st' 01-01-201 is 1nd Sun in Jan 2012
				getNthDayInMonth(1) 		returns RZdate('01-01-2012')
				getNthDayInMonth(4) 		returns RZdate('01-22-2012')
				getNthDayInMonth('last') 	returns RZdate('01-29-2012')
this.date=01-09-2012
				getNthDayInMonth() 			returns '2nd'; 01-09-201 is 2nd Mon in Jan 2012
				getNthDayInMonth(1) 		returns RZdate('01-02-2012')
				getNthDayInMonth(4) 		returns RZdate('01-23-2012')
				getNthDayInMonth('last') 	returns RZdate('01-23-2012')
---------------------------------------------------------------------------------------------*/
RZdate.prototype.getNthDayInMonth = function (nth,dayOfWeek)
{
	var day;
	var theDate = RZdate(this);		//work object that can be modified
	var daysInMonth = theDate.getDaysInMonth();
	var nthCount = 0;
	var dateTime = 0;

	//----- Compute nth day of current date in month
	if (arguments.length == 0)
	{
		dayOfWeek = theDate.getDay();
		for (day=1;day<=daysInMonth;day++)
		{
	        theDate.setDate(day);
			if (theDate.getDay() == dayOfWeek)
				nthCount++;
			if (theDate.getDatePart()+'' == this.getDatePart()+'')
				break;
		}
		if (nthCount > 4)
			nthCount = 'last';
		else
			nthCount = RZnth(nthCount);
		return nthCount;
	}

	//----- Find date of nth dayOfWeek in month
	else
	{
		if (nth != 'last')
			nth = nth.substr(0,1);					//drop th; keep number
		for (day=1;day<=daysInMonth;day++)
		{
			theDate.setDate(day);
			if (theDate.getDay() == dayOfWeek)
			{
				if (nth == 'last')
					dateTime = theDate.getTime();
				else if (nth == ++nthCount)
					return RZdate(theDate);
			}
		}
		return RZdate(dateTime);
	}
}
/*---------------------------------------------------------------------------------------------
Return various formatted strings for RZdate() object and save for future reference.
---------------------------------------------------------------------------------------------*/
RZdate.prototype.getFormatted = function(isForceFormat)
{
	//----- Initialize return object; formats shown below replaced by subsequent code:
	var formatted = {									//all dates are blank if no date component...
		briefDate:		'mm-dd-yy',						//2 digits for month, day & year
		shortDate:		'mm-dd-yyyy',					//2 digits for month & day; 4 digit year
		longDate:	 	'wwww mmmm d, yyyy',			//full day name & month name e.g. Monday January
		smartDate:		'mmm d, yyyy',					//3 char day of week (use substr(4) to omit or replace)
		revizeDate:		'yyyy-mm-dd',					//4 digit year, 2 digit month and day

		month:			'mm',							//2 digit month 01-12
		minutes:		'MM',							//2 digit minutes
		seconds:		'ss',							//2 digit seconds
		hours:			'h',							//1 or 2 digit hour; 12 hr clock
		hoursPadded:	'h',							//hours with &nbsp;&nbsp prefix if single digit
														//single digit prefixed with ' &nbsp'
														//Noon for 12:00:00; Midnight for 00:00:00

		hours12:		'hh',							//2 digit hours 12 hour format
		hours24:		'hh',							//2 digit hours 24 hour clock
		ampm:			'am/pm',						//am or pm

		day:			'dd',							//2 digit day 01-31
		daySuffix:		'ST',							//st, nd ... th
		dayLong:		'dST',							//1-2 digit: 1st, 2nd.. 30th

		dayName:     	'WWWW',							//full name of day e.g. Monday
		monthName:   	'mmmm',							//full name of month e.g. January

		briefTime: 		'[hh:MM am/pm]',				//2 digits for hr; seconds always dropped
														//blank if timePart() == 0
														//Noon for 12:00:00; 12 hr clock
		shortTime: 		'hh:MM[:ss]',					//always 2 digits for hour; seconds dropped if 0
														//24 hour clock (hours are 00-23)
		longTime: 		'hh:MM:ss am/pm',				//2 digits for hr; seconds always displayed
														//Noon for 12:00:00; Midnight for 00:00:00
		miniTime:		'hh:MM{:ss] am/pm',				//same as longTime except seconds dropped if 0
														//Noon for 12:00:00; Midnight for 00:00:00
		ampmTime: 		'hh:MM{:ss] am/pm',				//same as longTime except seconds dropped if 0
														//does not use noon or midnight
		smartTime:    	' h:MM:ss am/pm',				//blank if no timePart(); single digit padded
														//Noon for 12:00:00; seconds dropped if 0
														//12 hour clock
		timeZone:		'zzzz',							//as shown in new Date().toString()
														//varies by browser

		briefDateTime: 	'mm-dd-yy [hh:mm am/pm]', 		//time dropped if timePart() = 0
														//Noon for 12:00; seconds always dropped
		shortDateTime:	'mm-dd-yyyy hh:MM:ss',		    //time always displayed with seconds
													    //24 hour clock
		longDateTime:  	'wwww mmm d, yyyy hh:MM:ss zzzz', //time dropped if timePart() = 0
														//Noon for 12:00:00
		smartDateTime: 	' d, yyyy [h:mm:ss am/pm zzzz]', //time dropped if timePart() = 0
														//Noon for 12:00:00
		revizeDateTime:	'yyyy-mm-dd hh:MM:ss',			//time dropped if timePart() = 0
														//hh is 24 hour time; seconds dropped if 0
		shortDateBriefTime: '',
		formattedTime:  0								//getTime() value used for all formatted
	}
	// if not forcing formatting and date has not changed since last call, no need to run again
	if (!isForceFormat && this.formatted && this.formatted.formattedTime == this.getTime())
		return;

	formatted.formattedTime == this.getTime();			//remember value last used for formatted

	var day = this.getDate();
	var month = this.getMonth();
	var year = this.getFullYear()
	var dayOfWeek = this.getDay();

	// day suffix e.g. 1st, 2nd. 3rd, 4th ... 30th
	var suffix = ''
	if (day == 1 || day == 21 || day == 31)
		suffix = 'st';
	else if (day == 2 || day == 22)
		suffix = 'nd';
	else if (day == 3 || day == 23)
		suffix = 'rd';
	else
		suffix = 'th';
	formatted.daySuffix = suffix;
	formatted.dayLong = day + suffix;

	// Full dayName & monthName (use substr(0,3) for short names
	formatted.dayName = this.getDayName();
	formatted.monthName = this.getMonthName();

	//----- Extract time zone from Date.toString() function
	//		chrome: Sun Mar 18 2012 23:21:58 GMT-0400 (Eastern Daylight Time)
	//		FF:		Sun Mar 18 2012 23:42:25 GMT-0400 (Eastern Daylight Time)
	//		IE7-9:  Sun Mar 18 23:21:14 EDT 2012 (may show EST not EDT)
	var pattern = new RegExp( '(\\w*' + day + ')(.*)('+year+')' );	//for IE format...
	formatted.timeZone = this.toString();								//...move year before timezone
	formatted.timeZone = RZtrim(formatted.timeZone.replace(pattern,'$1, $3$2'));
	var results = formatted.timeZone.match(/.*\d (.*)$/mi);			//find time zone at end
	if (results)
		formatted.timeZone = results[1];
	else
		formatted.timeZone = '';

	//----- Dates...
	formatted.month = RZright('0'+(month+1),2);
	formatted.day = RZright('0'+day,2);

	if (month == 0 && day == 1 && year == 1970)		//no date component
	{
		formatted.briefDate = '';
		formatted.shortDate = '';
		formatted.longDate = '';
		formatted.smartDate = '';
		formatted.revizeDate = '';
	}
	else
	{
		formatted.briefDate = formatted.month + '-' + formatted.day + '-' + (year+'').substr(2);
		formatted.shortDate = formatted.month + '-' + formatted.day + '-' + year;
		formatted.longDate = formatted.dayName + ' ' + formatted.monthName + ' '  + day + ', ' + year;
		formatted.smartDate = formatted.dayName.substr(0,3) + ' '
						    + formatted.monthName.substr(0,3) + ' '  + day + ', ' + year;
		formatted.revizeDate = year + '-' +  formatted.month + '-' + formatted.day;
	}

	//----- Time formats...
	var hours = this.getHours();
	var minutes = this.getMinutes();
	var seconds = this.getSeconds();

	var ampm = (hours < 12) ? ' am' : ' pm';
	formatted.ampm = ampm.substr(1);
	formatted.minutes = RZright('0' + minutes,2);
	formatted.seconds = RZright('0' + seconds,2);

	formatted.hours24 = RZright('0' + hours,2);
	formatted.hours = hours <= 12 ? hours : hours -= 12;
	formatted.hours12 = RZright('0'+ (hours==0?'12':hours), 2);
	formatted.hoursPadded = (hours.toString().length == 1 ? '&nbsp;&nbsp;' : '') + hours;

	formatted.briefTime = ((hours + minutes) > 0)
					    ? formatted.hours12 + ':' + formatted.minutes + ampm : '';
	formatted.briefTime = formatted.briefTime.replace(/12:00 pm/i,'Noon');

	formatted.shortTime = formatted.hours24 + ':' + formatted.minutes
					    + (seconds > 0 ? ':' + formatted.seconds : '');

	formatted.longTime  = formatted.hours12 + ':' + formatted.minutes + ':' + formatted.seconds + ampm;
	formatted.longTime  = formatted.longTime.replace(/12:00:00 am/i,'Midnight');
	formatted.longTime  = formatted.longTime.replace(/12:00:00 pm/i,'Noon');

	formatted.ampmTime  = formatted.hours12 + ':' + formatted.minutes + ampm;

	formatted.miniTime  = formatted.ampmTime.replace(/12:00 am/i,'Midnight');
	formatted.miniTime  = formatted.miniTime.replace(/12:00 pm/i,'Noon');

	formatted.smartTime = ((hours + minutes + seconds) > 0)
					    ? (formatted.hoursPadded + ':' + formatted.minutes + ':' + formatted.seconds) + ampm : '';
	formatted.smartTime = formatted.smartTime.replace(/:00 /i,' ');			//drop seconds if zero
	formatted.smartTime = formatted.smartTime.replace(/12:00 pm/i,'Noon');

	//----- Combine Date and Time
	formatted.briefDateTime = formatted.briefDate   + (formatted.briefTime ? ' ' + formatted.briefTime : '');
	formatted.shortDateTime = formatted.shortDate   + ' ' + formatted.shortTime;
	formatted.longDateTime = formatted.longDate     + ' ' + formatted.longTime;
	formatted.smartDateTime = formatted.smartDate   + (formatted.smartTime ? ' ' + RZtrim(formatted.smartTime) : '');
	formatted.revizeDateTime = formatted.revizeDate + (formatted.briefTime ? ' ' + formatted.briefTime : '');

	// trim leading space in case there was no date or time component
	formatted.briefDateTime = RZtrim(formatted.briefDateTime);
	formatted.shortDateTime = RZtrim(formatted.shortDateTime);
	formatted.longDateTime = RZtrim(formatted.longDateTime);
	formatted.smartDateTime = RZtrim(formatted.smartDateTime);
	formatted.revizeDateTime = RZtrim(formatted.revizeDateTime);

	// Additional date & time combinations
	formatted.shortDateBriefTime = RZtrim(formatted.shortDate + ' ' + formatted.briefTime);

	this.string = this.toString();	//update value shown in debugger
	this.formatted = formatted;
	return formatted;
}
/*---------------------------------------------------------------------------------------------
Called to parse a Date string

The JavaSript Date.Parse method is used to accept all valid date formats.  Only problem
is two digits years (99) are intrepreted as 20th century dates (1999),  We counteract this
by adding 100 to the year unless the 4 digit date string exists in the input date string.

Parameters:
	fieldValue-	String representing a date in any standard format

Returns:
	returns 	null if invalid date;
				blank if no date specified;
				formatted date: yyyy-mm-dd hh:mm:ss
---------------------------------------------------------------------------------------------*/
function RZparseDate(fieldValue)
{
	RZparseDate.date = null;

	if (fieldValue == '') return '';
	if (typeof(fieldValue) == 'undefined' || fieldValue == null) return null;

	if (fieldValue.constructor == Date)
		fieldValue = fieldValue.toString();
	if (typeof fieldValue != 'string')
		fieldValue = fieldValue + '';

	var fieldValueOriginal = fieldValue;
	fieldValue = fieldValue.split('-').join('/');	//Chrome, Firefox does not accept -
	var dateSeconds = Date.parse(fieldValue);

	// may have incorrectly changed dash in: "Mon Jan 09 2012 12:28:37 GMT-0500 (EST)"
	// try above legacy conversion first for safe backward compatibility
	if(isNaN(dateSeconds) || fieldValue.search('GMT/') != -1)
	{							// <digit>-<digit> --> <digit>/<digit>
		fieldValue = fieldValueOriginal.replace(/(\d)-(\d)/g,'$1/$2');
		dateSeconds = Date.parse(fieldValue);
	}

	// try time only with today's date
	if(isNaN(dateSeconds))
	{							// <digit>-<digit> --> <digit>/<digit>
		fieldValue = fieldValueOriginal.replace(/(\d)-(\d)/g,'$1/$2');
		if (fieldValue.indexOf('/') == -1 && fieldValue.indexOf(':') != -1)
		{
			fieldValue = RZparseDate(new Date()+'').substr(0,11) + fieldValue;
			fieldValue = RZparseDate(fieldValue);
			if (RZparseDate.date) dateSeconds = 0;	//valid date/time
			fieldValue = RZparseDate.date;
			RZparseDate.date = null;				//restore default
		}
	}

	if( isNaN(dateSeconds) ) return null;			//bad date

	//----- Treat dates of the form 01 as 2001
	var theDate = new Date(fieldValue)
	var year = theDate.getYear()					//js 1.1 compatible
	if (year < 1000) year += 1900					//broswer quirks
	if (year < 2000)
	{
		//see if the 4 digit year matches a string in the date field
		//if not then they we need to add 100 to the year
		if (fieldValue.indexOf(year.toString()) == -1)
			year += 100
	}
	var theMonth = theDate.getMonth() + 1
	var theDay = theDate.getDate()
	fieldValue = year.toString() + '-'
			   + RZright('0' + theMonth, 2)
			   + '-'
			   + RZright('0' + theDay, 2)
	var hour = theDate.getHours()
	var minutes = theDate.getMinutes()
	var seconds = theDate.getSeconds()
	fieldValue += ' ' + RZright('0' + hour.toString(), 2)
			   +  ':' + RZright('0' + minutes.toString(), 2)
			   +  ':' + RZright('0' + seconds.toString(), 2)

	//----- Save Date object with correct year and time to milliseconds
	RZparseDate.date = new Date(year,theDate.getMonth(),theDay,
								hour,minutes,seconds,theDate.getMilliseconds());

	//----- return date/time formatted for saveing int Revize db yyyy-mm-dd hh:mm:ss
	return fieldValue;
}
/*---------------------------------------------------------------------------------------------
Called to validate Date field

Parameters:
	fieldname-	field object containing date to validate

Returns: true if valid date; otherwise false
---------------------------------------------------------------------------------------------*/
function RZcheckdate( thisField )
{
	var fault = false
	var dateString = RZparseDate( thisField.value )
	if (dateString == null)
	{
		fault = true
		alert( "I'm sorry.  You have not entered a valid Date\n\n"
		 + "Examples: 12/12/2011 or 01-01-2012" )
		thisField.focus()
	}
	else
	{
		var theDate = new Date(dateString)
		if (theDate.getFullYear() < 1900)
		{
			if ( !confirm( 'You have entered a date prior to 1900\n\n'
			             + 'Is this correct?' ) )
			{
				fault = true
				thisField.focus()
			}
		}
	}
	return !fault		//cancels save if error
}
/*---------------------------------------------------------------------------
Setup or lookup module permits.
-----------------------------------------------------------------------------
Used by RZaction() and RZlogin to determine if buttons or html should be
displayed based on known permissions.

If RZpermits() is called with no parameters, the following setup occures:

	Get all module permissions determined at login from RZpermits cookie
	Permits (crud) are stored in the cookie as: global=crud,links=r

	RZ.permits.modules will be loaded with individual module permissions
	Following example above:
		RZ.permits.modules.global='crud';
		RZ.permits.modules.links='r'

Currently only the links module permissions are stored at after sucessful
login by the control_panel.jsp page (which is only used by the revizelogin
template).

Parameters:
	module-			Name of module to check
	requirePermits-	One of more of the following characters: (crud)
					c = Create
					r = Read
					u = Update
					d = Delete

TODO: Look up all module permissions, store in future control_panel window

Returns:

If RZpermits() is called with a module and permissions, the specified module
object is checked for the requested permissions returning true or false.

If there is no object for the specified module, the permissions are not known
therefore the function returns true.
----------------------------------------------------------------------------*/
function RZpermits(module,requiredPermits)
{
	if (RZ.isauthenticationactive == false)
		return true

	//----- If setup call...
	else if (typeof module == 'undefined')
	{
		//----- Module permissions
		RZ.message = 'none defined';
		var permits = RZgetCookieValue('RZpermits')
		if (permits != '')
		{
			// temporarily support both delimeter formats
			var permitsArray = permits.indexOf("|") > -1 ? permits.split('|') : permits.split(',')

			RZ.message = '';
			for (var i=0; i<permitsArray.length; i++)
			{
				var module_permit = permitsArray[i].split(':')
				RZ.permits.modules[module_permit[0]] = module_permit[1]
				if (module_permit[1] == '') module_permit[1] = '-none-'
				RZmsgAdd(module_permit[0], ' ' + module_permit[1])
			}
		}
		RZtrace('Module Permissions',RZ.message)

		//----- Page permissions
		RZ.message = ''
		RZmsgAdd( 'RZ.page_key       ', ' ' + RZ.page_key )
		if (RZ.pagetype == 'template')
		{
			RZmsgAdd( 'RZ.page_role      ', ' ' + RZ.page_roles )
			RZmsgAdd( 'RZ.page_users     ', ' ' + RZ.page_users )
		}
		else
		{
			RZmsgAdd( 'RZ.permissions_module  ', ' ' + RZ.permissions_module )
			RZmsgAdd( 'RZ.permissions_parent  ', ' ' + RZ.permissions_parent )
			RZmsgAdd( 'RZ.permissions_template', ' ' + RZ.permissions_template )
		}
		RZtrace('Page Permissions',RZ.message)
	}

	//----- Check permissions...
	else
	{
		//----- Assume full permissions if module not listed in permits
		var modulePermits = 'crud';
		if (typeof RZ.permits.modules[module] != 'undefined')
			modulePermits = RZ.permits.modules[module]
		var requiredPermitsOptions = requiredPermits.split('|')

		var status = true
		for (var j=0; j<requiredPermitsOptions.length; j++)
		{
			var optionStatus = true
			for (var i=0; i<requiredPermitsOptions[j].length; i++)
			{
				var ch = requiredPermitsOptions[j].substring(i,i+1).toLowerCase()
					if (modulePermits.indexOf(ch) == -1)
					{
						optionStatus = false
						break;
					}
			}
			status = optionStatus
			if (optionStatus == true) break;
		}

		RZ.message = ''
		RZmsgAdd( 'module', module)
		RZmsgAdd( 'module permits', modulePermits)
		RZmsgAdd( 'permits required', requiredPermits)
		RZmsgAdd( 'status', status)
		RZtrace('Permissions Checked', RZ.message)
		return status;
	}
}
/*---------------------------------------------------------------------------------------------
Determine current page permissions
---------------------------------------------------------------------------------------------*/
function RZpagepermission()
{
	RZ.roles = ''
	RZ.username = RZgetCookieValue('RZusername',RZ.page.domain)
	RZ.hashed_username = RZgetCookieValue('RZhashedusername',RZ.page.domain)
	if (RZ.username != '') RZ.roles = RZgetCookieValue('RZroles')

	RZ.pagepermission = false;

	//----- Get login username and roles
	var roles = '|' + RZ.roles + '|'
	var username = '|' + RZ.username + '|'
	var hashed_username = '|' + RZ.hashed_username + '|'

	RZ.browserdev = (roles.indexOf('@browserdev') != -1);

	if (RZ.isauthenticationactive == false)
		RZ.pagepermission = true;		//all permits if authentication disabled

	else if (username == '|')
		RZ.pagepermission = false;	//do nothing (not logged in)

	else if( roles.indexOf( '|superuser|' ) != -1
	||  roles.indexOf( '|administrator|') != -1)
		RZ.pagepermission = true;

	else if (RZ.page_roles == '' && RZ.page_users == '')
		RZ.pagepermission = true;		//no users or roles defined so everyone has access

	else
	{
		if ( ('|'+RZ.page_users+'|').indexOf(username) != -1 || ('|'+RZ.page_users+'|').indexOf(hashed_username) != -1 )
			RZ.pagepermission = true;
		else
		{
			var rolesArray = roles.split('|')
			for (var i in rolesArray)
			{
				if ( rolesArray[i] == '' ) continue;
				if ( ('|'+RZ.page_roles+'|').indexOf('|'+rolesArray[i]+'|') != -1)
				{
					RZ.pagepermission = true;
					break;
				}
			}
		}
	}
	return
}
/*---------------------------------------------------------------------------
Calls either addEventListener or attachEvent if defined
RZ.browsertype set to "standard", "non-standard" or "unknown"

Example calls:
	RZeventadd(window, 'focus', function()
	{
		//do something
	});
	RZeventadd(form, 'submit', "validate('red,x=2')");

	// FF (chrome?), specified function object (e.g. validate) must be defined
	// before RZeventAdd called (not required for above calling variations)

	// On IE this form passes object as first argument (click event?)
	RZeventadd(form, 'submit', validate);
----------------------------------------------------------------------------*/
function RZeventadd(target, eventType, functionRef, capture)
{
    if (!capture) capture = false;
	if (eventType.substr(0,2) == 'on') eventType = eventType.substr(2);
	if (typeof target.addEventListener != "undefined")
    {
		// e.g. document.addEventListener("error", function, false);
        target.addEventListener(eventType, functionRef, capture);
        RZ.browsertype = "standards";

    }
	else if (typeof target.attachEvent != "undefined")
	{
        target.attachEvent("on" + eventType, functionRef);
        RZ.browsertype = "non-standards";
    }
	else
	{
        RZ.browsertype = "unknown";
    }
}
/*---------------------------------------------------------------------------
Calls either removeEventListener or removeEvent if defined

if (window.addEventListener) window.removeEventListener("focus", refresh, false);
else if (window.attachEvent) window.detachEvent("onfocus", refresh);   //IE
----------------------------------------------------------------------------*/
function RZeventremove(target, eventType, functionRef, capture)
{
    if (!capture) capture = false;

	if (typeof target.addEventListener != "undefined")
        target.removeEventListener(eventType, functionRef, capture);

	else if (typeof target.attachEvent != "undefined")
        target.detachEvent("on" + eventType, functionRef);
}
/*---------------------------------------------------------------------------------------------
Enable a new handler (append to current handler if one defined)
---------------------------------------------------------------------------------------------*/
function RZsetuphandler(handlerType,handlerFunction,isLast)
{
	//DCO 11-12-2015: MUST use event listeners when called by script before the body tag,
	//because body tag events MAY override (think IE) any body/window events defined here.
	var is = document.getElementsByTagName('body').length == 0;

	//DCO 12-02-2015: if onload and no <body onload="...">, use listener for backward
	//compatibilty with webgen/jquery/scripts.js (which overrides window.onload event)
	if (!is && handlerType.indexOf('onload') != -1 && !window.onload) is = true;
	if (is)
	{
		var fn = typeof(handlerFunction) == 'function' ? handlerFunction
			   : new Function('', handlerFunction.toString());
		if (window.addEventListener) window.addEventListener(handlerType.substr(2), fn, false);
		else if (window.attachEvent) window.attachEvent(handlerType, fn);   //IE
		else return false;	//safety for unexpected
		return true;
	}

	var functionStr = window[handlerType]; //existing handler function if defined
	var parameters = ""; //parameters string
	var pos = -1; //position of '{'
	var pos1 = -1; //position of '('
	var pos2 = -1; //position of ')'

	if ( functionStr != null )
	{
		functionStr = functionStr.toString()
		pos = functionStr.indexOf( '{' );
		pos1 = functionStr.indexOf( '(' );
		pos2 = functionStr.indexOf( ')' );
	}

	//Check if parameters exist.  If they do, then append them to the current
	//parameters string.
	if ( pos1 >= 0  && pos2 >= 0 )
		parameters += functionStr.substring( pos1+1, pos2 );

	//Check if the call to Function() exists.  If it does, then append a call to
	//new handler to it at the beginning; otherwise, just call new handler.
	if ( pos < 0 )
		functionStr = handlerFunction + ';'

	else if (isLast)	//DCO 10-20-2014
		functionStr = functionStr.substring( pos+1, functionStr.length-1 )	//existing function
					+ '\n' + handlerFunction + ';'
	else
		functionStr = handlerFunction + ';'		//appended function call
					+ functionStr.substring( pos+1, functionStr.length-1 );	//existing function

	//----- Set new handler and make trace entry
	window[handlerType] = new Function( parameters, functionStr );

	RZtrace("Initialized " + handlerType + " Handler", window[handlerType].toString() )
	return true;
}
/*-----------------------------------------------------------------------------------
  Implements button action operations (e.g. forward, save, delete, new, exit)
  Either a button or image is displayed on the page if a valid user is
  authenticated via the login page. If security is disabled any username is
  allowed.

  Normally code is generated to display button if authorized however if RZ.action=html
  function does not display button only returns html executed by specified button.

  TODO:  Document remaining RZ.* variables

  Parameters:
  action-		String representing type of action button (See Remarks)
  Parameters Format:
  <table 20c%>
  action         Button Types
  -------------  -----------------------------------------------
  editpage       "Edit this Page" calls -editform.jsp page
  editform       (same as above backward compatibility)
  editglobal     "Edit Globals" globals-editform.jsp
  \
  editlist       Edit this List (-editlist.jsp)
  exit           Exit Edit List page; return to caller
  newitem        Create new list item
  new            (same as above backward compatibility)
  edititem       Edit an existing list item
  edit           (same as above backward compatibility)
  delete         Delete an existing list item
  deleteitem     (same as above backward compatibility)
  \
  save           Edit form save button
  cancel         Edit form or Edit List cancel button
  \
  history        Edit form current record history
  editversion    Selects record to edit on history
  copyversion    Copy record on history as new version
  newversion     Create new version of current record
  permissions    opens permissions window
  </table>

  RZ Input Parameters:
  RZ.module-      Name of module
  RZ.recordid-	  recordid to process
  RZ.nexturl-     url of page recieving control from button
  RZ.popupwidth-  width of popup window
  RZ.popupheight- height of popup window
  RZ.popupscroll- indicate if popup window has scroll bars
  RZ.img-         if non\-blank html displayed for button
  				  (usually an image tag but can be any html)
  RZ.caption-     Label of input type=button
  				  (image button used if RZ.img not blank)
  RZ.tagname-     If non\-blank specified form button name)
  RZ.parentkey-   If not blank, specified parent key rather than letting Revize
  				  automatically determine.
  RZ.action-	  =html, does not display button
                  =false TODO
                  =true TODO

  Returns:  script executed when button clicked; If RZ.action
  -----------------------------------------------------------------------------------*/
function RZaction(action)
{

	if (RZ.nexturl == null || RZ.nexturl == 'null' ) RZ.nexturl = ''
	if (RZ.popupwidth == null || RZ.popupwidth == 'null') RZ.popupwidth = ''
	if (RZ.popupheight == null || RZ.popupheight == 'null') RZ.popupheight = ''
	if (RZ.popupscroll == null || RZ.popupscroll == 'null') RZ.popupscroll = ''

	var script=''
	var html=''
	var anchor = ''
	var level = ''
	var buttonName=''
	var requiredModule = RZ.module
	var requiredPermits = ''
	var options = ''
	var recordid = ''
	var parentkey = ''
	var msg = ''

	//----- Create specific JavaScript executed when button clicked
	//		(based on type of action requested)
	switch ( action.toLowerCase() )
	{

		case "editlist":
		{
			requiredPermits = 'c|u|d'
			if (RZ.tagname == '') RZ.tagname = 'RZeditlist';

			//-----delete below to always use new code-----\\
			if (!EZ.isFeature("EZ"))
			script = "RZcalleditlist("
				   + "'" + RZ.nexturl + "',"
				   + "'" + RZ.popupwidth + "',"
				   + "'" + RZ.popupheight + "',"
				   + "'" + RZ.popupscroll + "', "
				   + "'" + RZ.set + "')"
			else
			//-----delete above to always use new code-----//

			// build call of form:	RZeditlist( {nexturl:RZ.nexturl, ..., set:RZ.set});';
			script = 'RZeditlist({'
				   + EZ.concat([
								RZ.nexturl     ? "nexturl: '"    + RZ.nexturl     + "'" : '',
								RZ.module      ? "module: '"     + RZ.module      + "'" : '',	//added 12-15-2015
								RZ.popupwidth  ? "popupwidth: '" + RZ.popupwidth  + "'" : '',
								RZ.popupheight ? "popupheight:'" + RZ.popupheight + "'" : '',
								RZ.popupscroll ? "popupscroll:'" + RZ.popupscroll + "'" : '',
								RZ.set ? "set:'" + RZ.set.replace(/'/g, "\\'") + "'" : ''
								], ',')
				   + '})';
			break;
		}

		//----- Common code for all new and edit actions
		case "new":
		case "newitem":
			level = RZ.linklevel;
			if (!RZ.linklevel && RZ.module)
				level = RZ.nextseq.listid ? RZ.nextseq.listid : 1;

		case "edit":
		case "edititem":
		case "editform":
		case "editpage":
		case "editglobal":

			recordid = RZ.recordid

			//----- Format edit form call
			//		Note: without the isNaN test, remaining JavaScript not executed
			if ( !isNaN(RZ.recordid) || RZ.recordid.toLowerCase() != 'no items in list' )
			{
				if(action == 'edit' || action == 'edititem')
				{
					if (RZ.parentkey != '')
						parentkey = RZ.parentkey
					else
						parentkey = RZlevelQualifier(RZ.linkname,RZ.linklevel,RZ.recordid)
				}
				else if(action == 'new' || action == 'newitem')
				{
					parentkey = RZ.parentkey;	//non-blank if specified
				}


				if(action == 'new' || action == 'newitem'
				|| action == 'edit' || action == 'edititem')
				{
					//----- If page permissions warnings are enabled...
					if (RZcheckoptions(RZ.permissions_options,"warnings"))
					{
						// Display icon if module not specified on new or edit item button
						if (RZ.module == '' && RZ.template != '*none*')
						{
							msg = "'" + RZpermissionWarning(action,'') + "'"	//module req msg
							html += '<a href="JavaScript:RZpagemessage(' + RZreplace(msg,'\n','--') + ')">'
								 +  '  <img src="/revize/images/warning-button.gif" border=0>'
								 +  '</a>'
						}

						// Display hidden icon in case template can not be determineed
						else if (RZ.template == '' && RZ.linkname == '')
						{
							RZ.html = '<span id="RevizeButtonWarning' + RZ.icons.length + '"'
									+ ' style="visibility:hidden">'
									+ '  <a href="JavaScript:RZiconMessage(\''+ action +'\','
									+ RZ.icons.length + ')"'
									+ '   ><img src=\"/revize/images/warning-button.gif\"'
									+ '   border=0 alt="Click for Details"></a>'
									+ '</span>'
							//RZ.html = RZ.html.replace(/</g,'&lt;')	//display html
							document.write( RZ.html )
							RZ.icons[RZ.icons.length] = RZ.module
						}
					}
				}

				script = "RZedit( "
				       + "'" + RZ.recordid + "', "
				       + "'" + RZ.nexturl + "', "
				       + "'" + RZ.popupwidth + "',"
				       + "'" + RZ.popupheight + "',"
				       + "'" + RZ.popupscroll + "', "
				       + "'" + RZ.set + "', "
				       + "'" + RZ.module + "',"
				       + "'" + RZ.field + "',"
				       + "'" + RZ.linkname + "',"
				       + "'" + action + "',"
				       + "'" + RZ.template + "',"
				       + "'" + level + "',"
				       + "'" + parentkey + "')"
			}

			// if setting a recordid, ignore the recordid.value
			if ( RZ.set.indexOf('_recordid=') >= 0 ) RZ.recordid = ''

			//----- Button name dependent on action
			if (RZ.tagname == '')
			{
				switch (action)
				{
					case "new":
					case "newitem":
						RZ.tagname = 'RZnewitem';
						requiredPermits = 'c'
						anchor = 'Revize_' + RZ.module + '[new]'

						break;
					case "edit":
					case "edititem":
						RZ.tagname = 'RZedititem' + RZ.recordid;
						requiredPermits = 'u'
						anchor = 'Revize_' + RZ.module + '[' + RZ.recordid + ']'
						break;
					case "editform":
					case "editpage":
						RZ.tagname = 'RZeditpage';
						requiredPermits = 'c|u'
						break;
					case "editglobal":
						RZ.tagname = 'RZeditglobal';
						requiredPermits = 'c|u'
						break;
				}
			}
			break;

		case "exit":
			if(typeof RZ.nexturl != 'undefined' && RZ.nexturl != '' && RZ.nexturl != 'NEXTURL')
				script = "location='" + RZ.nexturl + "'";
			else
				script = "RZback( 'RZeditListReturnUrl' );"
			if (RZ.tagname == '') RZ.tagname = 'RZexit';
			break;

		case "delete":
		case "deleteitem":
			if (RZ.recordid.toLowerCase() != 'no items in list')
			{
				//script = "RZrecordDelete( '" + RZ.recordid +  "', '" + RZ.module + "' );"
				script = "RZdelete( '" + RZ.recordid +  "', '" + RZ.module
				if (RZ.nexturl != '') script += "', '" + RZ.nexturl
				script +=  "' );"
			}
			if (RZ.tagname == '') RZ.tagname = 'RZdeleteitem';
			requiredPermits = 'd'
			break;

		case "save":
			script = "RZsave( document.XMLForm, '" + RZ.nexturl + "' );"
			if (RZ.tagname == '') RZ.tagname = 'RevizeSave';
			break;

		case "save_as_draft":
			script = "RZsave_as_draft( '" + RZgetoption(RZ.options,'workflow') + "' );"
			if (RZ.tagname == '') RZ.tagname = 'RevizeSaveAsDraft';
			break;

		case "cancel":
			script = "RZeditFormCancel();"
			if (RZ.tagname == '') RZ.tagname = 'RevizeCancel';
			break;

		case "history":
			if (RZ.nexturl != '')
				options += 'nexturl='+RZ.nexturl
			if (RZ.field != '')
				options += 'fields='+RZ.field
			script = "RZhistory("
			       + "'" + RZ.module + "',"
			       + "'" + RZ.recordid + "', "
			       + "'" + RZ.version + "', "
			       + "'" + options + "') "
			if (RZ.tagname == '') RZ.tagname = 'RevizeHistory';
			break;

		case "permissions":
			requiredModule = RZ.permissions_module
			requiredPermits = 'u'
			if (RZ.nexturl != '')
				options += 'nexturl='+RZ.nexturl
			if (RZ.linkname != '')
				options += 'linkname='+RZ.linkname
			if (RZ.module != '')
				options += 'module='+RZ.module
			if (RZ.object != '')
				options += 'object='+RZ.object

			// if standard permissions buttom, treat as "Admin Panel"
			var isAdminPanel = true;
			if(RZcheckoptions(RZ.webspacedesc,"noadminpanel"))
			{
				isAdminPanel = false;
			}

			if (!options && isAdminPanel
			&& (RZ.img.indexOf('src="images/edit/permissions.jpg"') != -1
			|| RZ.img.indexOf('src="images/edit/permissions.gif"') != -1))
			{
				script = "void(0);";
				requiredModule = '';
				RZ.img = RZ.img.replace(/src="images\/edit\/permissions.jpg"/,'src="/revize/images/edit/admin_panel.jpg"');
				RZ.img = RZ.img.replace(/src="images\/edit\/permissions.gif"/,'src="/revize/images/edit/admin_panel.jpg"');
				RZ.img = RZ.img.replace(/alt="Permissions"/,'alt="Admin Panel" id="RZadminwinButton" onmouseup="RZadminwin()"');
			}
			// if permissions active
			else if (RZ.permissions_module != '')
				script = "RZpermissions("
					   + "'" + RZ.set + "',"
					   + "'" + options + "') "

			if (RZ.tagname == '') RZ.tagname = 'RevizePermissions';
			break;

		case "copyversion":
				options += ',copy'
		case "newversion":
		case "editversion":
			if (RZ.nexturl != '')
				options += 'nexturl='+RZ.nexturl
			script = "RZeditversion("
			       + "'" + RZ.module + "',"
			       + "'" + RZ.version + "', "
			       + "'" + options + "') "
			//TODO: perhaps button should be displayed and message if clicked.
			if (RZ.editnextversion == '') script = ''	//new record - no history
			if (RZ.tagname == '') RZ.tagname = 'RevizeVersion';
			break;

		default:
			script = "RZalert('Unknown or Invalid Revize Action Request');"
	}

	//----- Build html containing script (image or button version)
	if (script == '')
		html = ''
	else
	{
		if (RZ.script != '')
		{
			//----- Test results of user specified script via conditional operator
			//		so RZ.script code can cancel the button by returing false
			//
			// 			e.g. if (!user script)?donothing:button script;
			//
			if (RZright(RZ.script,1) != ';') RZ.script += ';'
			script = 'RZ.results=' + RZ.script
			       + '(!RZ.results && typeof RZ.results != \'undefined\')?void(0):'
			       + script;
		}

		if (RZ.img != "")
		{
			html += '<a href="javascript:' + script + '">' + RZ.img + '</a>'

			// show the help button after the adminpanel button
			if (RZ.img.indexOf('/revize/images/edit/admin_panel.jpg') != -1)
				html += '&nbsp;<a href="http://cms4.revize.com/revize/supportrevize/revize_faq.php" target="_new">'
					  + '<img src="../images/edit/help.jpg" alt="Help" border="0" /></a>';
		}
		else
		{
			if (RZ.caption == '') RZ.caption = 'Edit Page'
			html += '<input type="button" name="' + RZ.tagname + '" value="' + RZ.caption + '" '
				 + 'onClick="' + script + ';">'
		}
	}

	//----- Add <br> and/or anchor tag to html if requested
	if (html != '')
	{
		if (RZ.options.indexOf('<br>') != -1) html += '<br>'
		if (anchor != '') anchor = '<a name="' + anchor + '"></a>'
		html += anchor
	}

	//----- write html if logged into this webspace with correct permits
	//
	//		If RZ.active is blank or false, only write html if logged in with
	//		correct permissions for specified module and only return script
	//		when html written (default case).
	//
	//		If RZ.active is true, always write html
	//
	//		If RZ.active = 'html': return html instead of writting.  If not
	//		logged in or do not have permissions return blank for html.

	var active = RZ.active;
	if (active == 'html')
	{
		if ( RZlogin('', requiredModule, requiredPermits, action) )
			script = html;
		else
			script = '';
	}
	//----- If action is blank (i.e. not used)...
	else if (active == '')	// RZ.active blank or false (note: blank returns false)
	{
		// write html if logged into this webspace & permits for module
		active = RZlogin( html, requiredModule, requiredPermits, action );
		if (!active) script = '';
	}
	//----- If RZ.action is true, write html without checks
	else if ( active == 'true'						// RZ.active is 'true'
	|| (typeof active == 'boolean' && active) )		// RZ.active is true
	{
		document.write(html);
	}

	RZ.message = ''
	RZmsgAdd( "action", action )
    RZmsgAdd( "active", active )
	RZmsgAdd( "webspace", '\t' + RZ.webspace )
    RZmsgAdd( "module  ", '\t' + RZ.module )
    RZmsgAdd( "field   ", '\t' + RZ.field )
    RZmsgAdd( "linkname", '\t' + RZ.linkname )
    RZmsgAdd( "recordid", "\t(" + RZ.recordid + ")" )
    RZmsgAdd( "nexturl",  RZ.nexturl )
    RZmsgAdd( "popup",    RZ.popupwidth + "," + RZ.popupheight + "," + RZ.popupscroll )
    RZmsgAdd( "set",      RZ.set )
    RZmsgAdd( "img tag",  RZ.img )
    RZmsgAdd( "tagname",  RZ.tagname )
    RZmsgAdd( "caption",  RZ.caption )
    RZmsgAdd( "options",  options )
    RZmsgAdd( "generated html", html )
	RZtrace( "Action Button Processed", RZ.message );

	//----- clear RZ.* action arguments
	RZactionReset();

	//if (!active) script = ''
	return script;		//return generated script
}
/*---------------------------------------------------------------------------
Append "key: value" to RZ.message if value is not blank
Note: empty string same as false AND false matches \t & \t\t
----------------------------------------------------------------------------*/
function RZmsgAdd(key,val)
{
	//----- Following line avoids false matching empty string, \t & \t\t
	//		(also allow use of substring on true and false values)
	return;
	value = String(val)

	//----- Return if any empty value
	if(value==''
	|| value==null
	|| value=='\t()'					// empty recordid
	|| value=='0,0,' || value==',,'		// empty popup
	|| value=='\t' || value=='\t\t')
		return

	//----- Append : to key if value does not begin with a tab
	if (value.substring(0,1) != '\t') key += ': '

	//----- Append value to message
	RZ.message += key + value + '\n'
}
/*---------------------------------------------------------------------------
  (Internal Function) Resets RZ.* variables used as input variables for
  serveral functions called using RZ input parameters:
  	RZaction, RZlinkmanager, RZdelete

  This function is called during page setup and after arguments are used.
  This ensures values from one call are not carried forward to the next call.

  Parameters:
	  None  (no input parameters)

  Returns:
  No return value but the RZ input objects are set to an empty string
  * (see source code for current list of objects)
  ---------------------------------------------------------------------------*/
function RZactionReset()
{
	RZ.module=""; RZ.field=""; RZ.recordid=""; RZ.nexturl="";
	RZ.popupwidth=0; RZ.popupheight=0; RZ.popupscroll="";
	RZ.img=""; RZ.set=""; RZ.caption=""; RZ.tagname="";
	RZ.options=""; RZ.active=""; RZ.script="";
	RZ.rtefont=""; RZ.rtestyles = "";
	RZ.template=""; RZ.object="";
	RZ.linkname=""; RZ.linkmodule=""; RZ.linklevel="";
	RZ.filelocation=""; RZ.imagelocation="";
	RZ.version=""; RZ.nextversion="";
	RZ.imagemaxwidth=''; RZ.imagemaxheight=''; RZ.imagemaxbytes='';
	RZ.parentkey=''; RZ.windowname='';

	// optional link properties not initialized by RZTagSupport
	RZ.linkpathname = ''
	RZ.linknewsection = ''
	RZ.linkdisplaydefault = ''
	RZ.linktemplatedefault = ''
	RZ.linkfilenamedefault = ''
	RZ.linkautocontinue = ''
}

/*--------------------------------------------------------------------------
  Convert url to absolute url using the page location information determined
  during page initialization.
  Parameters:
  url :  url to convert
  --------------------------------------------------------------------------*/
function RZabsoluteUrl(url)
{
	if (url != '')
	{
		if ( !RZisAbsoluteUrl(url) )
		{
			if(url.substring(0,4) == 'www.')
				url = 'http://'+url;
			else
            {
                //DCO 02-22-2007\\
                //url = RZ.page.domain + RZ.page.pathname + '/' + url

                // domain + page pathname + baseprefix yeilds url to base channel
                url = RZ.page.domain + RZ.page.pathname + '/'
                	+ (RZ.baseurlprefix ? RZ.baseurlprefix : '')
                	+ url;

                while (url.indexOf("/../") > 0)
                {   //for each ../ remove it along with preceeding folder
                    var offsetEnd = url.indexOf("/../");
                    var offsetBeg = url.lastIndexOf("/",offsetEnd-1);
                    url = RZsubstring(url,0,offsetBeg)
                        + RZsubstring(url,offsetEnd+3);
                }
                //DCO 02-22-2007//
            }
		}
	}
	return url
}
/*---------------------------------------------------------------------------
is url absolute reference
----------------------------------------------------------------------------*/
function RZisAbsoluteUrl(url)
{
	if(url.substring(0,1) != '/'
	&& url.substring(0,7) != 'http://'
	&& url.substring(0,8) != 'https://')
		return false
	else
		return true
}
/*---------------------------------------------------------------------------
Determine Edit Page URL
----------------------------------------------------------------------------*/
function RZgetEditPageUrl( editPageUrl )
{
	var url = ""
	if (editPageUrl == 'EDITLISTURL')
		url = RZ.page.filename + '-editlist.jsp'
	else if (editPageUrl == 'EDITFORMURL')
		url = RZ.page.filename + '-editform.jsp'
	else
		url = editPageUrl

	//----- IE may need baseurlprefix
	//DCO 01-23-2014
	//if (RZ.MSIE && editPageUrl != '' && !RZisAbsoluteUrl(editPageUrl)

	// DJO 06-01-2016 - Can handle Edge with base url method just like IE
	if ((RZ.isMSEdge || RZ.MSIE || RZ.isIEstandardsMode)
	&& editPageUrl != '' && !RZisAbsoluteUrl(editPageUrl)
	&& typeof RZ.baseurlprefix != 'undefined' && RZ.baseurlprefix.length > 0)
		url = RZ.baseurlprefix + url;

	//----- if url contains a function call, replace with results
	//		function call is "non-letter a-z...(...);" semi-colon required
	url = url.replace(/([^\w])(\w+\(.*?\));/g,
	function (inputStr,nonWord,functionCall,semicolon)
	{
		return nonWord + eval(functionCall);
	});

	return url
}
/*---------------------------------------------------------------------------
Save return URL in cookie
TODO: store in control panel window
----------------------------------------------------------------------------*/
function RZsaveReturnUrl( returnUrlKey, url )
{
	if (arguments.length < 2) url = location.href	//DCO 10-20-2014
	//var url = location.href						//		 ''
	var hash = location.hash
	if (hash != '')
		url = url.substring(0,url.length-hash.length)
	if (RZ.trace)
		url += '#trace'
	if (RZ.debug)
		url += '#debug'
	RZsetCookieValue( returnUrlKey, url )
}
/*----------------------------------------------------------------------------
Call EDIT LIST page
----------------------------------------------------------------------------*/
/**
 *	DCO 03-07-2012: now pass single object argument to RZeditlist()
 *					object more flexible & readable
 *	Below function with named arguments retained for backward compatibility.
 **/
function RZcalleditlist(editPageUrl, width, height, scroll, set)
{
	var args = 		//args element names match RZ.??? names passed to RZaction()
	{				//argument names coorespond to legacy argument names
		nexturl     : editPageUrl,
		popupwidth  : width,
		popupheight : height,
		popupscroll : scroll,
		set         : set
	}
	return RZeditlist(args);
}
/**
 *	DCO 03-07-2012: new primary function passed single object argument whose
 *					element names match RZ.??? names passed to RZaction()
 *	Example call:
 *		RZeditlist( {nexturl: nexturl, popupwidth: popupwidth, ...} );
 **/
function RZeditlist (args)
{
	//----- Internal work variables
	var msg = '';

	//----- Following variables were previously passed as named arguments
	//		Local variables & args element names match RZ.??? names passed to RZaction()
	var nexturl     = args.nexturl     ? args.nexturl     : location.href;
	var popupwidth  = args.popupwidth  ? args.popupwidth  : '';
	var popupheight = args.popupheight ? args.popupheight : '';
	var popupscroll = args.popupscroll ? args.popupscroll : '';
	var set         = args.set         ? args.set         : '';

	//----- New input arguments never passed as named arguments
	var windowname = args.windowname ? args.windowname
				   : 'ListWindow';	//default

	//----- Call Developer defined onlist handler and quit if it returns false
	if (typeof window.onlist == 'function')
	{
		// update args with current values and pass to onedit handler
		// returns false to cancel delete, or object with below values:
		args.windowname = windowname;
		var returnValues = window.onlist(args);
		if (typeof returnValues == 'undefined' || returnValues == false)
		{
			window.status = 'Edit Canceled'
			return void(0)
		}
		else if (typeof(returnValues) == 'object')
		{
			if (returnValues.set) set = returnValues.set;
			if (returnValues.nexturl) nexturl = returnValues.nexturl;
			if (returnValues.windowname) windowname = returnValues.windowname;
		}
	}

	//----- Default nexturl if blank and adjust for IE if not absolute
	RZ.parameters = RZgetEditPageUrl(nexturl);
	RZaddUrlParameter( 'webspace=' + RZ.webspace )
	if (args.module && EZ.isFeature("EZ"))
	{
		RZaddUrlParameter( 'module=' + args.module )			//RZ.editmodule for editlist
		if (EZ && EZ.formfields && EZ.formfields.setupDropdown)
			set = EZ.formfields.setupDropdown(set, args.module); //check for EZdropdown class
	}
	RZsetParameter(set)
	RZaddUrlParameter( 'permissions_template=' + RZ.pagetemplatename )
	RZaddUrlParameter( 'permissions_parent=' + RZ.page_key )
	nexturl = RZ.parameters;

	RZtrace("Calling Edit List", RZ.message )

	RZ.editWindow = RZpopupUrl(windowname, nexturl, popupwidth, popupheight, popupscroll)
	if (RZ.editWindow == null)	//no popup properties defined
	{
		RZsaveReturnUrl( 'RZeditListReturnUrl' )
		document.location = nexturl;
	}
	return void(0)
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
function RZlistbegin( listid )
{
	RZ.nextseq.listid = listid + 1;
}
/*---------------------------------------------------------------------------
Called by closing list tag to remember the dependent template used by a link
tag inside the list.  See Dreamweaver help for more details.

TODO: consider triggering a warning if there is more than one list using the
same module which puts the template determination at risk.  Also RZTagSupport
might consider multple links and/or templates ambigous.

This function is also called with the linkname if a link manager link tag was
encountered inside the list.
----------------------------------------------------------------------------*/
function RZlinktemplate( module, template, listlinkname )
{
	if (module != '')
	{
		if (typeof RZ.linktemplates[module] == 'undefined'
		||  RZ.linktemplates[module] == '')
			RZ.linktemplates[module] = template
	}
}

/*---------------------------------------------------------------------------
Multi-level menu / page permissions support:

This function NOW called by RZaction to determine parentkey for level > 0.
For level 0, blank is returned because parent is determined by other means.
The parentkey is stored in RZ.linkpagekey by RZlinkmanager() which is called
via the script generated by the rz:link tag.
TODO: RZ.linkpagekey should probably be qualified by linkname.

This function WAS called by RZlinkmanager() and RZaction() to remember the 1st
recordid encountered at each level change for use by edit buttons.

This scheme is required to pass information from link tag to edit button
processing because the link tag may occur after the button in the html.
----------------------------------------------------------------------------*/
function RZlevelQualifier(linkname,level,recordid)
{
	var parentkey = ''

	if (isNaN(level)) return '';
	level = parseInt(level)

	/* deprecated but strategy may be useful in the future
	//----- If recordid not a number return
	if (isNaN(recordid)) return '';

	if (typeof RZ.linklevelmemory == 'undefined')
		RZ.linklevelmemory = -1

	//----- Clear level qualifier whenever level moves up
	if (level < RZ.linklevelmemory)
	{
		RZ.linklevelmemory = level
		RZ.levelrecordid[level] == null
	}

	//----- Save page_key of prior menu item when level moves down
	else if (level > RZ.linklevelmemory)
	{
		RZ.linklevelmemory = level
		RZ.levelrecordid[level] = recordid

	}
	*/

	//----- Get above level pagekey if level > 0
	if (level > 0)
		parentkey = RZ.linkpagekey[level-1]

	return parentkey
}
/*----------------------------------------------------------------------------
Call EDIT FORM page
----------------------------------------------------------------------------*/
/* Same as RZedit (retained for backward compatibility) */
function RZcallEditForm(recordid, editPageUrl, width,height,scroll, set)
{
	return RZedit(recordid, editPageUrl, width,height,scroll, set);
}
/* Same as RZedit (retained for backward compatibility) */
function RZcalleditform(recordid, editPageUrl, width,height,scroll, set, module, field, linkname)
{
	return RZedit(recordid, editPageUrl, width,height,scroll, set, module, field, linkname);
}
/**
* 01-20-2014 DCO: moved from setup_editlist_javascript.jsp
* Probably only called by NEW and EDIT ITEM buttons created with DW before 02-29-01.
**/
function RZrecordEdit( recordID, editPageUrl ){
  RZcallEditForm ( recordID, editPageUrl )
}
function RZrecordNew( editPageUrl ){
  RZcallEditForm ( 'new', editPageUrl )
}
/**
 *	DCO 03-07-2012: now pass single object argument to RZeditform()
 *					way too many arguments; object more flexible & readable
 *	Below function with named arguments retained for backward compatibility.
 **/
function RZedit(recordid, editPageUrl, width, height, scroll, set, module, field, linkname, action, template, level, parentkey)
{
	var args = 		//args element names match to RZ.??? names passed to RZaction()
	{				//argument names coorespond to legacy argument names
		recordid    : recordid,
		nexturl     : editPageUrl,
		popupwidth  : width,
		popupheight : height,
		popupscroll : scroll,
		set         : set,
		module      : module,
		field       : field,
		linkname    : linkname,
		action      : action,
		template    : template,
		level       : level,
		parentkey   : parentkey
	}
	return RZeditform(args);
}
/**
 *	DCO 03-07-2012: new primary function passed single object argument whose
 *					element names match RZ.??? names passed to RZaction()
 *	Example call:
 *		RZeditform( {recordid: nexturl, popupwidth: popupwidth, ...} );
 **/
function RZeditform(args)
{
	//----- Internal work variables
	var str = '';
	var msg = '';

	//----- Following variables were previously passed as (optional)named arguments.
	//		Local variables & args element names match RZ.??? names passed to RZaction()
	var recordid    = args.recordid    ? args.recordid : '';
	var nexturl     = args.nexturl     ? args.nexturl : '';
	var popupwidth  = args.popupwidth  ? args.popupwidth : ''
	var popupheight = args.popupheight ? args.popupheight : ''
	var popupscroll = args.popupscroll ? args.popupscroll : ''
	var set         = args.set         ? args.set : ''
	var module      = args.module      ? args.module : ''
	var field       = args.field       ? args.field  : ''
	var linkname    = args.linkname    ? args.linkname : ''
	var action      = args.action      ? args.action : ''
	var template    = args.template    ? args.template : ''
	var level       = args.level       ? args.level : ''
	var parentkey   = args.parentkey   ? args.parentkey : ''

	//----- New input arguments never passed as named arguments
	var windowname = args.windowname ? args.windowname
				   : (window.name == 'EditWindow' ? 'EditWindowPopup' : 'EditWindow');

	var samplearg  = args.samplearg  ? args.samplearg : ''; //default is ''

	//----- Processing...
	RZtrace( "Edit Form Button Clicked", "Record Id: (" + recordid + ")" );

	//----- Call Developer defined onedit handler and quit if it returns false
	if (typeof window.onedit == 'function')
	{
		// update args with current values and pass to onedit handler
		// returns false to cancel delete, or object with below values:
		args.windowname = windowname;
		var returnValues = window.onedit(args);
		if (typeof returnValues == 'undefined' || returnValues == false)
		{
			window.status = 'Edit Canceled'
			return void(0)
		}
		else if (typeof(returnValues) == 'object')
		{
			if (returnValues.set) set = returnValues.set;
			if (returnValues.nexturl) nexturl = returnValues.nexturl;
			if (returnValues.windowname) windowname = returnValues.windowname;
		}
	}

	//----- Apply baseurl prefix to nexturl if IE browser
	var url = RZgetEditPageUrl(nexturl);
	if (linkname == '')
	{
		RZ.message = ''
		var nextseqKey = module + '_' + level;	//level is listid
		if (action == 'newitem' && RZ.nextseq.modules[nextseqKey]
		&& (','+set).indexOf(','+ module + '.' + RZ.nextseq.modules[nextseqKey].field) == -1)
		{
			str = module + '.' + RZ.nextseq.modules[nextseqKey].field + '=' + RZ.nextseq.modules[nextseqKey].seq;
			if (set) set += ',';
			set += str;
		}

		RZsetEditParameters(module,field,set)

		recordidParameter = RZsetEditRecordParameter(recordid)
		if (recordidParameter == '*ERROR*') return void(0)

		//----- Page Permissions processing (non-link manager)
		if (RZ.permissions_module != '')
		{
			if (action == 'new' || action == 'newitem'
			|| action == 'edit' || action == 'edititem')
			{
				msg = RZpermissionWarning(action,template,module)
				if (msg != '')
					if (!RZconfirm(msg)) return

				if (template == '')
					if (typeof RZ.linktemplates[module] != 'undefined')
						template = RZ.linktemplates[module];

				// When template passed on url, RZsave will include template & parent page_key
				// in the save record XML request (template defined by new & edit buttons).
				if (template != '' && template != '*none*')
					RZaddUrlParameter( 'permissions_template=' + template )
			}
			else if (action == 'editform' || action == 'editpage' || action == 'editglobal')
			{
				// edit this page button(s) do not define parents because the edited recordid
				// is usually not the dependent record module.  Another issue is parent passed
				// below is the current page when links are added and would not be correct for
				// this dependent page.
				//RZaddUrlParameter( 'permissions_template=' + RZ.pagetemplatename )
			}

			//----- Always pass parent_key in case the edit form adds links via the RTE.
			//		NOTE: Don't add parent if already on url but this is a very specific scenario.
			if (RZ.pagetype == 'template' && url.indexOf("permissions_parent=") == -1)
				RZaddUrlParameter( 'permissions_parent=' + RZ.page_key )
			else	//editlist page
				RZaddUrlParameter( 'permissions_parent=' + RZ.permissions_parent )

			//----- Pass caller page key to determine workflowname
			if (RZ.page_key != '')
				RZaddUrlParameter( 'page_key=' + RZ.page_key )
		}

		if (url.indexOf('?') != -1 && RZ.parameters.substr(0,1) == '?')
			RZ.parameters = '&' + RZ.parameters.substring(1);
		url += RZ.parameters + recordidParameter
		RZtrace('Edit Form url parameters',RZ.message)
	}

	//----- Check for link manager parameters
	else
	{
		if (typeof RZ.link[linkname] != 'object')
			msg = 'Specified Link Name ('+linkname+') Does Not Exist or is Not\n'
				+ 'Properly Defined (make sure the ' + linkname + ' link exists).\n'
				+ 'The link tag defines required options used by Link Manager\n\n'
				+ 'If the list is not displaying a message when empty,\n'
				+ '(i.e. noemptylistmessage option set) a copy of the\n'
				+ 'link tag must be inside the list header.\n\n'
				+ 'If link tag exists make sure its name matches the name specified\n'
				+ 'specified on this button.'

		if (msg == '' && module == '')
			msg = 'Link Name ('+linkname+') associated with this action has\n'
				+ 'not specified a module.\n\n'
				+ 'Link Manager can not be called without knowing the module\n'
				+ '(check associated link and make sure a module is specified).'

		//----- If errors display message and return
		if (msg != '' )
		{
			RZalert(msg);
			return void(0);
		}

		//----- Set all link manager properties including window size and url
		//		(RZsetLinkManagerProperties calls RZsetEditParameters)
		//
		RZsetLinkManagerProperties(linkname,module,field,recordid,set,url)
		recordidParameter = RZsetEditRecordParameter(recordid)
		if (recordidParameter == '*ERROR*') return void(0)

		//----- Pass user popup window values to link manager on url
		RZ.link[linkname].popupwidth = popupwidth
		RZ.link[linkname].popupheight = popupheight
		RZ.link[linkname].popupscroll = popupscroll
		RZ.link[linkname].nexturl = RZabsoluteUrl( url )

		//----- Get link manager popup window properties
		popupwidth  = RZ.link[linkname].linkwidth
		popupheight = RZ.link[linkname].linkheight
		popupscroll = RZ.link[linkname].linkscroll;
		url    = RZ.link[linkname].linkurl + recordidParameter
			   + (RZ.linkmanagertest ? '#test' : '');

		//----- Pass linkparent
		var parent = ''
		if (level == '')
		{
			if (typeof RZ.link[linkname].linkparent != 'undefined')
				parent = RZ.link[linkname].linkparent
			if (parent == '')
				parent = RZ.page_key;
		}
		else	//multi-level processing
		{
			if (parentkey != '')	//if passed as argument
				parent = parentkey;
			else if ( isNaN(level) )
			{
				msg = 'Non-numberic level specified for this button.\n\n'
				    + 'Multi-level menu relationships can not be maintained\n'
				    + '(check button and specify a numeric level).'
				if (!RZconfirm(msg)) return
			}
			else if (action == 'new' || action == 'newitem')
			{
				// for existing level, linkparentnew should be defined
				if(typeof RZ.linkparentnew[linkname] != 'undefined'
				&& typeof RZ.linkparentnew[linkname][level] != 'undefined')
					parent = RZ.linkparentnew[linkname][level]

				// new level; use last item recordid at prior level for parent
				else if (eval(level) != 0)	//TODO: should be min level (not 0)
					parent = RZ.linkpagekey[level-1];	//undefined caught below
				else
					parent = RZ.permissions_parent
			}
			else if (action == 'edit' || action == 'edititem')
			{
				if (eval(level) == 0)
				{
					if(typeof RZ.linkparentnew[linkname] != 'undefined'
					&& typeof RZ.linkparentnew[linkname][level] != 'undefined')
						parent = RZ.linkparentnew[linkname][level]
				}
				else	//level > 0
					parent = parentkey;		//undefined caught below
			}
		}		// end of multi-level processing

		//----- Must have a parent when page permissions are enabled
		if (RZ.permissions_module != ''
		&& (typeof parent == 'undefined' || parent == 'undefined' || parent == ''))
		{
			msg = 'this'
			if (action.indexOf('new') == 0) msg = 'new'
			msg = 'This button is not configured for the '+msg+' page to properly INHERIT\n'
			    + 'page permissions because the parent is unknown'
			if (level != '') msg += ' for level ' + level
			msg +='.\n\n'
			    + 'Permissions may need to be explicitly defined on the page\n'
			    + 'associated with this link.'
			//if ( !RZconfirm(msg) ) return
		}

		if (parent != '' && parent != 'undefined')
			RZ.link[linkname].linkparent = parent

		if (!RZ.link[linkname].linkseq && RZ.nextseq.linknames[linkname])
			RZ.link[linkname].linkseq = RZ.nextseq.linknames[linkname].seq;
	}

	RZtrace("Calling Edit Form", "URL: " + url )

	//----- Suppress empty url parameters
	if (url.indexOf('/revize/util/linkmanager') == 0)
	{
		var urlFull = url;
		url = url.replace(/\&[^\&]*=(?=\&)/g,'');
		if (urlFull != url)
			RZtrace("Calling linkmanager (empty parameters deleted)", "URL: " + url )
	}

	//----- Call popup window if requested else goto Edit Page URL
	RZ.editWindow = RZpopupUrl(windowname, url, popupwidth, popupheight, popupscroll)
	if (RZ.editWindow == null)	//no popup properties
	{
		RZsaveReturnUrl( 'RZeditFormReturnUrl' )
		var pathfilename = RZisPopupCall() ? RZgetfileinfo(RZabsoluteUrl(url)).pathfilename : '';
		RZsetcookie('RZnotPopup', pathfilename, RZ.webspace);
		document.location = url
	}
	//----- If popup call, clear RZeditFormReturnUrl cookie //DCO 10-20-2014
	else
		RZsaveReturnUrl( 'RZeditFormReturnUrl', '' );

	//----- Suspend processing if called as submit
	return void(0);
}
/*---------------------------------------------------------------------------
(Internal Function) Display page permission warning
Internal: Diagnostics Support
----------------------------------------------------------------------------*/
function RZlinkWithoutParent(module,recordid,code)
{
	if (typeof RZ.noparent[module] == 'undefined')
		RZ.noparent[module] = new Object();
	RZ.noparent[module][recordid] = code

	code = "'" + code + "'"
	var html = '<a href="javascript:RZpagemessage(' + code + ')">'
	         + '<img src="/revize/images/warning-parent.gif" border="0"></a>'
	RZlogin(html)
}
/*---------------------------------------------------------------------------
(Internal Function) Display message regarding button configuration issue
Internal: Diagnostics Support
----------------------------------------------------------------------------*/
function RZiconMessage(action,index)
{
	module = RZ.icons[index]
	var msg = RZpermissionWarning(action,'',module)
	if (msg != '')
		if (!RZconfirm(msg)) return
}
/*---------------------------------------------------------------------------
(Internal Function) Display warning if button not configured correctly
Internal: Diagnostics Support
----------------------------------------------------------------------------*/
function RZpermissionWarning(action,template,module)
{
	var msg = '';
	var buttonName = ''
	if (RZsubstring(action,0,3).toLowerCase() == 'new')
		buttonName = 'NEW '
	else if (RZsubstring(action,0,4).toLowerCase() == 'edit')
		buttonName = 'EDIT '

	// Get dependent template for page permissions
	if (template == '')
	{
		if (module == '')	//test by clearing RZ.template and RZ.module on button
		{
			msg = 'The template used to create the new page could not be \n'
				+ 'determined because no module was specified on the '
				+ buttonName + 'button.'
			}

		// Get template processed from the list associated with the specified module
		else if (typeof RZ.linktemplates[module] != 'undefined')
			template = RZ.linktemplates[module];

		else				//test by specifing incorrect module on button
			msg = 'The template used to create new pages can not be determined\n'
				+ 'because there does not appear to be any lists associated with\n'
				+ 'with the currently specified module: ' + module + '.'
	}
	if (msg == '' && template == '')	//test by clearing RZ.template on button
		msg = 'The template used to create new pages can not be determined\n'
			+ 'because there are no links in the list associated with the\n'
			+ 'currently specified module: ' + module + '\n\n'
			+ 'The developer may need to specify the template on the ' + buttonName + 'button\n'
			+ 'If pages are not created when list items are added, a template of none\n'
			+ 'should be specified.'

	// template not required for single record edits
	if (template == '*none*'
	|| action == 'editform' || action == 'editpage' || action == 'editglobal')
		msg = ''

	// Warn content editor about potential permissions inheritance issues
	if (msg != '')
	{
		if (buttonName == 'NEW ')
		{
			msg = 'If this NEW button creates a new page, that page will NOT\n'
				+ 'inherit permissions for the following reason:\n\n'
				+ msg
			msg=''
		}
		else if ( !RZcheckoptions(RZ.permissions_options,"warnings") )
			msg = ''	//no warning if migration option not enabled
		else
			msg = 'The EDIT button is not configured to properly pass page permissions\n'
				+ 'to the page created when this item was added to the associated list.\n\n'
				+ 'The template must be known to assign a parent to child pages.\n\n'
				+ msg
	}
	return msg
}
/*---------------------------------------------------------------------------
(Internal Function) Sets general edit url parameters used with or w/o link manager.
Internal: Update Record Support
----------------------------------------------------------------------------*/
function RZsetEditParameters(module,field,set)
{
	RZ.parameters = ''

	//----- Append webspace parameter
	RZaddUrlParameter( 'webspace=' + RZ.webspace )

	/* Was considered for page navigation variables
	//----- Template name used to create pageid
	if (RZ.pagetemplatename	!= '')
		RZaddUrlParameter( 'template=' + RZ.pagetemplatename )
	*/

	//----- Append module & field
	if (module!='')
		RZaddUrlParameter( 'module=' + module )	//used by link manager
	if (field!='')
		RZaddUrlParameter( 'field=' + field )		//future


	RZsetParameter(set);	//Append set parameters
}
/*---------------------------------------------------------------------------
(Internal Function) Adds the RZ.set values to the url
Called by RZsetEditParameters() & RZcalleditlist()
Internal: Update Record Support
----------------------------------------------------------------------------*/
function RZsetParameter(set)
{
	RZaddUrlParameter( 'pagetemplateid=' + RZ.pagetemplateid );
	RZaddUrlParameter( 'linkedmoduleid=' + RZ.pagemoduleid );
	RZaddUrlParameter( 'linkedrecordid=' + RZ.pagerecordid );
	//----- Append set parameters
	if (set != '')
	{
		set = set.split('pagerecord._recordid').join( RZ.editrecordid )
		RZaddUrlParameter( 'set=' + escape(set) )
	}
}
/*---------------------------------------------------------------------------
(Internal Function) Sets recordid parameter used with or w/o link manager.
Internal: Update Record Support
----------------------------------------------------------------------------*/
function RZsetEditRecordParameter(recordid)
{
	var recordidParameter = '*ERROR*'

	if (recordid == 'new')
		recordidParameter = '&new'

	//----- Calculated value
	else if (recordid.length>0 && recordid.substring(recordid.length-1)==';')
		recordidParameter = '&recordid=' + eval(recordid)

	//----- If rz.fetch returned an error message as text
	//		(use alert because it may not be design flaw)
	else if (recordid != '' && isNaN(recordid))
		alert( 'Revize Button specifies Invalid Record Id: \n' + recordid )

	else if (recordid != '')
		recordidParameter = '&recordid=' + recordid

	else
		recordidParameter = ''

	return recordidParameter
}
/*---------------------------------------------------------------------------
(Internal Function) Called from above and also from snippet_helper_editform.js
before calling RTE.

Computed window size just fits 800 X 600 for all options.
Create link object if undefined and use default options if undefined.

Internal: Link Manager Support
----------------------------------------------------------------------------*/
function RZsetLinkManagerProperties(linkname,module,field,recordid,set,url)
{
	//----- Set general edit Url paramters
	RZ.message = ''
	RZsetEditParameters(module,field,set)

	//----- If link object not yet defined, define it
	if (typeof RZ.link[linkname] == 'undefined') RZ.link[linkname] = new Object()

	//----- Get current options (use default values if undefined)
	var options = RZ.link[linkname].options
	if (typeof options == 'undefined') options = 'url,template,file'
	RZ.link[linkname].options = options

	if (typeof RZ.linkoptions != 'undefined' && RZ.linkoptions != '')
	RZ.link[linkname].options = RZ.linkoptions

	//----- Following properties are used by jsp code and must be passed on url
	RZaddUrlParameter( "linkname=" + linkname )
	RZsetLinkUrlParameter(linkname,'options')
	RZaddUrlParameter( "nexturl=" + RZabsoluteUrl(url) )

	//----- Template specfic properties (DW only defines template property)
	RZdefaultLinkParameter(linkname,'template')			//blank for all templates
	RZdefaultLinkParameter(linkname,'editform')			//template specific editforms
	RZdefaultLinkParameter(linkname,'modulelinkfield')	//back link from dependent module

	//----- TODO: Following properties are now passed on url (but should NOT)
	//		(they are not used by jsp code except to retrieve values for js)
	RZdefaultLinkParameter(linkname,'filelocation')		//file manager location (supported by RTE)
	RZdefaultLinkParameter(linkname,'fileextension')	//file manager extensions

	//----- TODO: Following properties are now passed on url (but probably NOT even used)
	RZdefaultLinkParameter(linkname,'imagelocation')	//image manager location
	RZdefaultLinkParameter(linkname,'imageextension')	//image manager extensions

	//----- Following properties NOT used by jsp code are accessed from the opener window
	//		They can be set on RZ.link.<linkname>.<property_below>
	RZdefaultLinkOption(linkname,'linkpathname')		//prepended pathname (supported by RTE)
	RZdefaultLinkOption(linkname,'linknewsection')		//list of templates that can start new sections

	RZdefaultLinkOption(linkname,'linkdisplaydefault')	//default linkdisplay
	RZdefaultLinkOption(linkname,'linktemplatedefault')	//default template
	RZdefaultLinkOption(linkname,'linkfilenamedefault')	//default path/filename
	RZdefaultLinkOption(linkname,'linkautocontinue')	//Auto click Continue button
	RZdefaultLinkOption(linkname,'nexturl')				//next editform for all templates
	RZdefaultLinkOption(linkname,'set')					//Set passed to dependent module
	RZdefaultLinkOption(linkname,'linkparent')			//parent that added link
	RZdefaultLinkOption(linkname,'linkmodule')			//list module

	//----- Determine link parent (defined by new or edit button - single level menu)
	var linkparent = RZ.link[linkname].linkparent
	if (linkparent == '')
	{
		if (RZ.permissions_parent != '')	//this page is surogate parent (e.g. editlist)
			linkparent = RZ.permissions_parent
		else
			linkparent = RZ.page_key
	}
	RZ.link[linkname].linkparent = linkparent

	//----- Convert nexturl to absolute url (some RTE calls have property defined at this time)
	var nexturl = RZ.link[linkname].nexturl
	if (nexturl != '')
		RZ.link[linkname].nexturl = RZabsoluteUrl(nexturl)

	//----- Compute link manager window size
	var width = 600
	var height = 240 		// base height IE or NS (includes target)
	var testopt = ',' + options + ','
	if (testopt.indexOf(',none,') != -1) height += 25
	if (testopt.indexOf(',url,') != -1) height += 40
	if (testopt.indexOf(',file,') != -1) height += 45
	if (testopt.indexOf(',template,') != -1)
	{
		height += 220 + 40;		//add 40 for section prompt
		if (RZ.isnavigator) height += 25
	}

	//----- Store computed values in the link object itself
	RZ.link[linkname].linkwidth   = width
	RZ.link[linkname].linkheight  = height
	RZ.link[linkname].linkscroll  = 'yes'

	//----- Store link manager url with parameters
	RZ.link[linkname].linkurl = '/revize/util/linkmanager_frame.html' + RZ.parameters

	//----- Display all link manager properties on trace
	RZtrace('Link Manager linkname (' + linkname + ') url parameters',RZ.message)
	var msg = ''
	for (var i in RZ.link[linkname])
		msg += i + '  =  ' + RZ.link[linkname][i] + '\n'
	RZtrace('RZsetLinkManagerProperties() linkname (' + linkname + ')',msg)
}
/*---------------------------------------------------------------------------
(Internal Function)Save all link manager information for this link in a new
object that is referenced at run time by new and edit buttons.

This function is called by the link object to define link properties for use by
new and edit buttons.  A separate link object is defined for each linkname so
these properties are available when the new or edit button is clicked. The new
and edit buttons can then simply supply the linkname to access these properties.

See RZTagSupport.java for more information on the link manager calling process.

**IMPORTANT**
When changing functionality, please update Dreamweaver help file:
	RevizePermissionsWorks-Help.htm (contains high level description)

Internal: Link Manager / Page Permissions Support
----------------------------------------------------------------------------*/
function RZlinkmanager( linkname, linkmodule, linkrecordid, linklevel,
	                    linkpagekey, linkparent )
{
	if (typeof linkname == 'undefined') linkname = RZ.linkname
	if (typeof linkmodule == 'undefined') linkmodule = ''
	if (typeof recordid == 'undefined') recordid = ''
	if (typeof linklevel == 'undefined') linklevel = ''
	if (typeof linkpagekey == 'undefined') linkpagekey = ''
	if (typeof linkparent == 'undefined') linkparent = ''
	if (linkparent.indexOf('This is a STANDARD text field:') == 0) linkparent = '';

	//----- For multi-level link manager lists...
	if (linkmodule != '' && linklevel != '')
	{
		//----- Save first non-blank linkparent for this level
		if (typeof RZ.linkparentnew[linkname] == 'undefined')
			RZ.linkparentnew[linkname] = new Object();

		if (typeof RZ.linkparentreset[linklevel] == 'undefined')
			RZ.linkparentreset[linklevel] = 'reset'

		if (typeof RZ.linkparentnew[linkname][linklevel] == 'undefined'
		|| RZ.linkparentreset[linklevel] == 'reset')
		{
			if (linkparent == '') linkparent = RZ.permissions_parent
			RZ.linkparentnew[linkname][linklevel] = linkparent
			RZ.linkparentreset[linklevel] = ''
		}

		//----- Indicate new next higher level linkparent can be reset
		var nextlevel = RZinteger(linklevel) + 1
		RZ.linkparentreset[nextlevel] = 'reset'

		//----- Save most recent pagekey (used to get parent for new level button)
		RZ.linkpagekey[linklevel] = linkpagekey
		if (typeof RZ.linkpagekey[linklevel+1] != 'undefined')
			RZ.linkpagekey[linklevel+1] = 'undefined';	//clear lower level value
	}

	//----- Create link object if not defined to hold module and parent
	if (typeof RZ.link[linkname] == 'undefined')
	{
		RZ.link[linkname] = new Object()
		RZ.link[linkname].linkparent = ''
		RZ.link[linkname].linkmodule = ''
	}

	//----- Set linkparent to 1st non-blank parent encountered (used for single level links)
	//		When no linkparent is set, the page_key is used when new or edit button clicked.
	if (linkparent != '' && RZ.link[linkname].linkparent == '')
		RZ.link[linkname].linkparent = linkparent

	//----- Save additional link properties
	if(RZ.linkname != '')
	{

		if (RZ.link[linkname].linkmodule == '' && linkmodule != '')
			RZ.link[linkname].linkmodule = linkmodule;

		RZ.link[RZ.linkname].options = RZ.linkoptions
		RZ.link[RZ.linkname].filelocation = RZ.linkfilelocation
		RZ.link[RZ.linkname].fileextension = RZ.linkfileextension
		RZ.link[RZ.linkname].imagelocation = RZ.linkimagelocation
		RZ.link[RZ.linkname].imageextension = RZ.linkimageextension

		RZ.link[RZ.linkname].template = RZ.linktemplate
		RZ.link[RZ.linkname].editform = RZ.linkeditform
		RZ.link[RZ.linkname].modulelinkfield = RZ.linkmodulelinkfield

		//----- Properties not passed on url
		//		TODO: automatically pick up all options starting with link
		RZ.link[RZ.linkname].linkpathname = RZ.linkpathname
		RZ.link[RZ.linkname].linknewsection = RZ.linknewsection
		RZ.link[RZ.linkname].linkdisplaydefault = RZ.linkdisplaydefault
		RZ.link[RZ.linkname].linktemplatedefault = RZ.linktemplatedefault
		RZ.link[RZ.linkname].linkfilenamedefault = RZ.linkfilenamedefault
		RZ.link[RZ.linkname].linkautocontinue = RZ.linkautocontinue
	}

	//----- clear RZ.* action arguments
	RZactionReset();
}
/*---------------------------------------------------------------------------
(Internal Function) Call RZdefaultLinkOption then add to RZ.parameters
Internal: Link Manager Support
----------------------------------------------------------------------------*/
function RZdefaultLinkParameter(linkname,property)
{
	RZdefaultLinkOption(linkname,property)
	RZsetLinkUrlParameter(linkname,property)
}
/*---------------------------------------------------------------------------
(Internal Function) If property is undefined, set to blank
Internal: Link Manager Support
----------------------------------------------------------------------------*/
function RZdefaultLinkOption(linkname,property)
{
	if (typeof RZ.link[linkname][property] == 'undefined')
		RZ.link[linkname][property] = ''

	//RZtrace('RZdefaultLinkOption('+linkname+'):' + property
	//       + '<br>-->' +(RZ.link[linkname][property])+ '<--')
}
/*---------------------------------------------------------------------------
(Internal Function) Build link manager url parameters using link properties
presumably defined elsewhere on the page if property is defined and not blank.

Internal: Link Manager Support
----------------------------------------------------------------------------*/
function RZsetLinkUrlParameter(linkname,property)
{
	if (typeof RZ.link[linkname][property] != 'undefined')
	{
		var value = RZ.link[linkname][property]
		if (value != '')
			RZaddUrlParameter( 'link' + property + '=' + value )
	}
}
/*---------------------------------------------------------------------------
Adds jsp parameter to url
* parameter appended RZ.parameters with preceeding ? or & character
* parameter appended to RZ.message for output by RZtrace()

Parameters:
	parameter-	url parameter of the form key = value
----------------------------------------------------------------------------*/
function RZaddUrlParameter(parameter)
{
	//----- Build url parameter
	if (RZ.parameters.indexOf('?') == -1)
		RZ.parameters += '?' + parameter
	else
		RZ.parameters += '&' + parameter

	//----- Build trace message
	RZ.message += unescape(parameter) + '\n'
}

/* Same as: RZback (retained for backward compatibility) */
function RZpriorPage(returnUrlKey) { RZback(returnUrlKey) }
/*-------------------------------------------------------------------------
  Return to calling page (normally called by cancel button)

  If popupcall, close window and refresh if not an editform

  If returnUrlKey ends with a semicolon, assume it is an expression for url

  Otherwise, return to PRIOR PAGE using the following steps
  * If URL defined in cookie, use it (returnUrlKey specifies cookie name)
  * If not edit list page, use history
  * If RZ.page.home is not blank, use it
  * Make trace entry and stay on current page

  Parameters:
  returnUrlKey-	if specified, one of the following:
                1) expression containing url of page to get control
                2) if expression, must end with semicolon
                3) Cookie name containing calling page url
  win-			Optional specifies the current window (default is window)
  Returns:
  There is currently no value returned
-------------------------------------------------------------------------*/
function RZback(returnUrlKey,win)
{
	if (typeof win == 'undefined') win = window;
	if (!returnUrlKey)
		returnUrlKey = (RZ.pagetype == 'editlist' ? 'RZeditListReturnUrl' : 'RZeditFormReturnUrl');

	//----- If opener and access to opener
	if ( RZisPopupCall(win) )
	{
		//----- Added for LinkManager RTE interface (but never refresh editform)
		if(RZ.parent.opener.RZ != 'undefined'
		&& RZ.parent.opener.RZ != null
		&& RZ.parent.opener.RZ.pagetype != 'editform')
			win.opener.location.reload(true);
		win.close()
		return;
	}

	//----- Not a popup call
	var returnUrl = ''
	if (RZright(returnUrlKey,1) == ';')		//url passed as variable / equation
		returnUrl = eval( returnUrlKey )
	else									//url read from cookie
	{
		returnUrl = RZgetCookieValue(returnUrlKey)
		if (returnUrl != "")
		{	// if cookie defined
			RZsetCookieValue(returnUrlKey,"")
		}else
		{	// when cookie not defined
			if (RZ.pagetype == 'editform')
			{
				returnUrl = ''
				history.go(-1); // use history if not edit list
			}
			else
			{
				returnUrl = RZ.page.home // use home if edit list
			}
		}
	}

	if (returnUrl != null && returnUrl != '')
		RZ.parent.location = returnUrl
	else
		RZtrace('snipper_helper: RZback('+returnUrlKey+')',
				'No Prior URL could be determined')
}
/*--------------------------------------------------------------------------
(Internal Function) Determine if this page was called as a popup.

Internal: Used by Save & Cancel functions to return to calling window.

Returns: true if opener with RZ.pagetype variable defined; otherwise false
--------------------------------------------------------------------------*/
function RZisPopupCall(win, isStrict)
{
	if (typeof win == 'undefined') win = window

	if (win.parent.opener
	&& RZwinaccess(win.parent.opener)
	&& typeof win.parent.opener != 'undefined'
	&& typeof win.parent.opener != 'undefined'
	&& typeof win.parent.opener.RZ != 'undefined'	//opener is a Revize page
	&& win.parent.opener.RZ != null
	&& typeof RZ.parent.opener.RZ.pagetype != 'undefined'
	&& typeof RZ.parent.opener.RZ.editWindow != 'undefined'
	&& win.parent.opener.RZ.editWindow == win.parent
	&& RZisPopupCallStrict())
	{
		return true;
	}
	//----- If opened from workflow task window
	//		TODO: probably should always assume popup if opener exists but too risky w/o
	//		more analysis and serious regression testing.
	else if (win.parent.name == 'Revize_Edit_Record' && typeof win.opener != 'undefined')
		return true;

	// DCO 10-20-2014:
	// Below code can cause js error in RZback() because this is the wrong place to test
	// for callback function in RZnextsavereturn; RZsave() should test. Moot point when
	// RZ.callback used because RZ.nextsavereturn never contains paraenthesis and RZsave()
	// does not rely solely on isPopup() to post save to itself.

	//----- If callback function specified after save
	else if(RZ.nextsavereturn
	&& RZ.nextsavereturn.indexOf('(') > 0 && RZ.nextsavereturn.indexOf(')') > 0)
		return true;

	else
		return false;
	//______________________________________________________________________
	/**
	 *	(Internal function) originally added for email notify
	 *
	 *	Check if opener and referrer pathnames match -- Prevents editform
	 *	from closing popup editlist when editform is not called as popup.
	 *
	 *	Probably always valid test but as safety, only checks if isStrict
	 *	specified and EZ feature active otherwise returns true.
	 */
	function RZisPopupCallStrict()
	{
		if (!isStrict || !EZ.isFeature("EZ")) return true;
		if (window.dialogArguments) return true;

		return RZgetFileInfo(location.href).pathfilename != RZgetcookie('RZnotPopup',RZ.webspace)
	}
}
/*---------------------------------------------------------------------------
Following function is called by the DELETE ITEM button
Deleted specified recordid after prompting
----------------------------------------------------------------------------*/
/* Same as RZdelete (retained for backward compatibility) */
function RZrecordDelete( recordid, module ) { RZdelete( recordid, module ) }
/**
 *	DCO 03-07-2012: Can now be called with single object argument whose
 *					element names match RZ.??? names passed to RZaction()
 *	Example call:
 *		RZdelete( {recordid: recordid, module: module, ...} );
 *
 *	DO NOT add new named arguments; below retained for backward compatibility.
 **/

/**
 * Add Event Listener to delete
 */
var selectedBtn;
document.addEventListener("DOMContentLoaded", function() {
	var deleteBtns = document.querySelectorAll('a[href*="javascript:RZdelete"]');
	for(var i = 0, len = deleteBtns.length; i < len; i++){
		deleteBtns[i].addEventListener('click', function(e){
			selectedBtn = e.target.parentNode;
		}, false);
	}
});


function RZdelete(recordid, module, nexturl, win)
{
	//----- Internal work variables
	var msg = '';

	//----- If first argument is an object, it contains all input arguments as elements.
	//		Local variable names & args element names match RZ.??? passed to RZaction()
	var args = recordid;	//1st argument

	// If first argument not object, create args object containing legacy named arguments
	if (typeof(args) != 'object')
	{
		args = {};
		args.recordid = recordid ? recordid : '';
		args.module   = module   ? module   : '';
		args.nexturl  = nexturl  ? nexturl  : '';
		args.win      = win      ? win      : '';
	}

	//----- Initialize legacy local variables originally passed as named arguments
	recordid = args.recordid ? args.recordid : '';
	module   = args.module   ? args.module   : '';
	win      = args.win      ? args.win      : window;
	nexturl  = args.nexturl  ? args.nexturl  : win.location.href;

	//----- New input arguments never passed as named arguments
	var samplearg = args.samplearg ? args.samplearg : '';	//default '' is in the example

	//----- Processing...
	RZ.message = "WebSpace: " + RZ.webspace + "\n"
			 + "Module: " + module + "\n"
			 + "Record Id: (" + recordid + ")\n"
			 + "Redirect Url: " + nexturl + "\n"
	RZtrace( "Delete Item Clicked", RZ.message );

	if (isNaN(recordid))
	{
		win.alert( 'Invalid Record Id: ' + recordid )
		return void(0)
	}
	else if (recordid=='')
	{
		win.alert( 'Record Not Specified (Id is Blank)' )
		return void(0)
	}

	var deletemsg='Are you sure you want to delete this link?\n\n'
	+'Keep in mind that if this link or page is not being referenced from any other page from your website'
	+' then DELETE will physically delete the page record from the database and there would be no way to restore'
	+' it if you change your mind. You want to proceed?';
	//if (!win.confirm("Ok to Delete This Item?")) return

	if(module !== 'links') {
		deletemsg = 'Are you sure you want to delete this item?\n\n This action is not reversible.';
	}

	if(RZ.pagetemplatename === 'document_center'){
		var delName = selectedBtn.parentNode.parentNode.querySelector('.docs-toggle');
		if(delName != null){
			var delChild = delName.firstChild;
			var delTexts = [];

			while(delChild){
				if(delChild.nodeType == 3){
					delTexts.push(delChild.data);
				}
				delChild = delChild.nextSibling;
			}

			var delText = delTexts.join("");
			var delPromp = win.prompt("Are you sure you want to delete this whole category?"
			+"\nPlease keep in mind that, if you delete this category, ALL THE DOCUMENTS UNDER THIS CATEGORY WILL BE PERMANENTLY DELEETED AND CAN NOT BE RESTORED BY REVIZE STAFF."
			+"\n\nIf you are sure and still want to delete the '"+ delText +"' category, please type in the following in all caps:"
			+"\n"+delText.toUpperCase());

			if(delPromp !== delText.toUpperCase()){
				alert('You entered "'+delPromp+'" while the system expected "'+delText.toUpperCase()+'".\nThe record will NOT be deleted.');
				return;
			}
		} else {
			if (!win.confirm(deletemsg)) return
		}
	} else if(RZ.pagetemplatename === 'agenda_list' || RZ.pagetemplatename === 'agendalist'){
		if (!win.confirm(deletemsg)) return
	} else {
		if (!win.confirm(deletemsg)) return
	}

	//----- Call Developer defined ondelete handler and quit if it returns false
	if (typeof win.ondelete == 'function')
	{
		// update args with default values and pass to ondelete handler
		// returns false to cancel delete, or object with below values;
		var returnValues = win.ondelete(args);
		if (typeof returnValues == 'undefined' || returnValues == false)
		{
			win.status = 'Delete Canceled'
			return void(0)
		}
		else if (typeof returnValues == 'object')
		{
			if (typeof returnValues.nexturl != 'undefined')
				nexturl = returnValues.nexturl
		}

	}

	if (EZ.isFeature("EZ"))
		RZsetcookie('RZlastedit', (RZ.pagetype + ':delete:' + module + ':' +recordid), RZ.webspace);

	// Use the XML translator servlet instead of the old XML form method.
	nexturl = RZgetEditPageUrl(nexturl);
	var deleteUrl =	"/revize/HTTPTranslatorServlet" +
					"?resourcetype=record" +
					"&action=delete" +
					"&webspace=" + RZ.webspace +
					"&softdelete=true" +
					"&id=" + recordid +
					"&pagetemplateid=" + RZ.pagetemplateid +
					"&linkedmoduleid=" + RZ.linkedmoduleid +
					"&linkedrecordid=" + RZ.linkedrecordid +
					"&modulename=" + module +
					"&pagekey=" + RZ.page_key +
					"&redirect=" + escape(RZabsoluteUrl(nexturl));
	RZtrace( "Delete Item Request", deleteUrl );
	RZactionReset();
	win.location = deleteUrl;


}
/*---------------------------------------------------------------------------
Bring up page permissions window.

The options argument can contain one of the following:
	nexturl, linkname, module, object

The AdminPanel uses adminpanel option to specify additional url parameters.
----------------------------------------------------------------------------*/
function RZpermissions(set,options)
{
	var pos;
	if (typeof set == 'object') set = '';	//called from admin panel
	if (typeof set == 'undefined') set = ''
	if (typeof options == 'undefined') options = ''

	var adminpanel = RZgetoption(options, 'adminpanel');
	var linkname = RZgetoption(options, 'linkname');
	var module = RZgetoption(options, 'module');
	var nexturl = RZgetoption(options, 'nexturl');
	if (nexturl == '')
	{
		var fileInfo = RZgetfileinfo('/revize/util/permissions-editform.jsp')
		nexturl = RZbuildurl(fileInfo)
	}

	RZ.message = ''
	RZ.parameters = nexturl
	RZaddUrlParameter( 'webspace=' + RZ.webspace )
	RZaddUrlParameter( 'page_key=' + RZ.page_key )
	RZaddUrlParameter( 'parent_key=' + RZ.parent_key  )
	if(RZ.workflowmodule != '' && RZ.workflowmodule != undefined)
		RZaddUrlParameter('workflowmodule=' + RZ.workflowmodule);
	if (adminpanel)
		RZaddUrlParameter(adminpanel)

	if (set == '')
	{
		set = RZ.permissions_module + '.page_key=' + RZ.page_key
		if (linkname != '')
			set += linkname
		else if (module != '')
			set += module
	}
	RZaddUrlParameter('set='+escape(set))

	RZtrace('Page Permissions Call',RZ.message)
	RZ.editWindow = RZpopupUrl( 'EditWindow', RZ.parameters, 600, 500, 'yes')
}
/*---------------------------------------------------------------------------------------
Find all tagName elements with className
---------------------------------------------------------------------------------------*/
function RZgetTagsByClassName(tagName,className)
{
	var tags = [];
	var elements = document.getElementsByTagName(tagName);
	if (elements.length)
		for (var i=0;i<elements.length;i++)
			if ( (elements[i].className+' ').indexOf(className+' ') != -1)
				tags.push(elements[i]);
	return tags;
}
/*---------------------------------------------------*/
/*BOOKMARK ----- String minupulation functions -----*/
/*-------------------------------------------------*/
/*---------------------------------------------------------------------------------------
Return number occurances of chars (default char is dash)
---------------------------------------------------------------------------------------*/
function RZdup(number,char)
{
	var value = ''
	if (!char) char = '-';
	for (var i=0;i<number;i++)
		value += char;
	return value;
}
/*-----------------------------------------------------------------------------------------------
Append th, st, nd or rd to number specified by n.
Credit: http://uk.answers.yahoo.com/question/index?qid=20100902055222AAr3Bt6
-----------------------------------------------------------------------------------------------*/
function RZnth(n)
{
	n=n+'';
	if (!n) return 0;
	var l=n.length, r=parseInt(n.substring(l-2,l)), i = n % 10;
	var suffix = ((r < 11 || r > 19) && (i < 4)) ? ['th','st','nd','rd'][i] : 'th';
	return n + suffix;
}
/*-----------------------------------------------------------------------------
Return "s" if count > 1 otherwise return empty string
-----------------------------------------------------------------------------*/
function RZs(count)
{
		if (count.constructor == Array)
			count = count.length;
		else if (typeof(count) == 'string')
			count = count.split(',').length;
		else if (isNaN(count))
			count = 0;

	if (count != 1)
			return 's';
	else
	return '';
}
/*------------------------------------------------------------------------------
Remove any leading and ending blank spaces from string (trim)

Parameters:
	tmpStr - Input string

Returns:
	String with leading and trailing spaces removed
------------------------------------------------------------------------------*/
function RZtrim(tmpStr)
{
	if (typeof(tmpStr) == 'undefined' || tmpStr == null || tmpStr == '')
		return tmpStr;

	//----- need to strip \t besides ' '
	//while(tmpStr.substring(0,1) == ' ')
	while (/^\s/.test(tmpStr))
		tmpStr = tmpStr.substring(1, tmpStr.length);

	//while(tmpStr.substring(tmpStr.length-1,tmpStr.length) == ' ')
	while (/\s$/.test(tmpStr))
		tmpStr = tmpStr.substring(0, tmpStr.length - 1);

	return tmpStr;
}
/*------------------------------------------------------------------------------
RZreplace(inStr, fromString, toString)

Replace all occurances of fromString with toString

Created before javascript string.replace was available
(retain RZreplaceAll & RZreplacesubstring for backward compatibility)

Parameters:
	inStr - Input String
	fromString - String to replace
	toString - Replacement String

Returns:
	String with replacements
------------------------------------------------------------------------------*/
function RZreplace( inStr, fromString, toString )
{ return RZreplacesubstring( inStr, fromString, toString ) }
function RZreplaceAll( inStr, fromString, toString )
{ return RZreplacesubstring( inStr, fromString, toString ) }
function RZreplacesubstring( inStr, fromString, toString )
{
	var pos = 0
	if (inStr == null
	|| typeof inStr.length == 'undefined' //true or false
	|| inStr.length == 0) return '';

	var fromLen = fromString.length
	if (fromLen == 0) return inStr

	while (true)
	{
		pos = inStr.indexOf(fromString,pos)
		if (pos == -1) break
		inStr = RZsubstring( inStr, 0, pos )
		      + toString
		      + RZsubstring( inStr, pos + fromLen )
		pos += toString.length
	}
	return inStr
}
/*------------------------------------------------------------------------------
Subsitute for substring method (does not produce javascript errors)

A null or empty input string returns empty string

Start and end positions outside boundries intrepreted as follows:

	if end position not specified or greater than string length,
	adjust to input string length

	if end position before 1st character,
	return empty string

	if start position greater than ending position,
	return empty string

	if start position less than 0,
	assume 0

Parameters:
----------
	str-		Input string
	startpos-	Starting position
	endpos-		Ending position (optional)

Returns:
	substring as described above.

------------------------------------------------------------------------------*/
function RZsubstring(str, startpos, endpos)
{
	if (typeof endpos == 'undefined') endpos = str.length + 1

	//----- Validate input string
	if (str == null || str.length == 0)	//if null or empty string
		return "";						//...return empty string

	//----- Validate end position
	if (endpos > str.length )			//greater than string length
		endpos = str.length;			//...set to length

	else if( endpos <= 0 )				//if end position before 1st character
		return "";						//...return empty string

	//----- Validate start position
	if( startpos >= endpos )  			//if start position greater than ending position
		return "";						//...return empty string

	else if (startpos < 0) 				//if start position less than 0
		startpos = 0;					//...assume 0

	//----- Return the substring
	return str.substring(startpos,endpos);
}
/*---------------------------------------------------------------------------
returns rightmost number of characters specified

Parameters:
	str - Input String
	noChars - number of rightmost characters desired

Example:
	* right("1234",2) returns "34"
    * right("1234",0) returns ""
    * right("0",4) returns "0"

Returns:
	Rightmost substring possible; does not throw exception if string too short
----------------------------------------------------------------------------*/
function RZright( str, noChars )
{
	if (!str) return '';
	var len = str.length;
	if (len == 0) return "";

	if (noChars > len) noChars = len;
	return str.substring(len-noChars);
}
/*---------------------------------------------------------------------------------------------
Converts number to the nearest integer
0 is returned if not a valid number unless a defaultValue is supplied

Parameters:
	number - string or number to be converted to an integer (whole number)
	defaultValue - number returned in number parameter is not a valid number

Returns:
	Nearest whole number of input number; if input number or string is undefined or not
	a number, the defaultValue is returned
---------------------------------------------------------------------------------------------*/
function RZinteger(number,defaultValue)
{
	if (typeof defaultValue == 'undefined') defaultValue = 0

	if (isNaN(number))
		return defaultValue

	return parseInt( parseFloat(number)+.5 )	//convert number to number then round up
}

/* Same as RZcheckoptions (retained for backward compatibility) */
function RZcheckOptions( pOptions, pChoices )
{ return RZcheckoptions( pOptions, pChoices ) }
/*---------------------------------------------------------------------------
Look for specific option choice(s) in the options string.  Both options and
choices use commas to seperate multiple individual options.

Parameters:
        pOptions - Caller supplied options (e.g. "filter,editsingle,alt")
        pChoices - specific option choices to look for (e.g. alt,url,image)

Returns:
        True if at least one choice is contained in options
        False if none of the choice(s) are found

Example: RZcheckOptions('cristy,pam,sandy','cristy') returns true
----------------------------------------------------------------------------*/
function RZcheckoptions( optionsArg, pChoices )
{
	if (typeof(optionsArg) == 'object' && typeof(optionsArg.length) != 'undefined')
		pOptions = optionsArg.join(',');
	else
		pOptions = optionsArg

	if (pOptions == null || pChoices == null
	|| typeof pOptions == 'undefined' || typeof  pChoices == 'undefined')
		return false;

	var str, pos;
	var inputSep = pOptions.indexOf('|') != -1 ? '|' : ',';
	var inputOpts = inputSep + pOptions + inputSep;
	inputOpts = inputOpts.toLowerCase();

	var searchSep = pChoices.indexOf('|') != -1 ? '|' : ',';
	var searchOpts = pChoices.toLowerCase();

	//----- For each desired choice ...
	while ( !searchOpts == "" )
	{
		str = searchOpts;
		pos = str.indexOf(searchSep);
		if (pos == 0)
		{
			searchOpts = str.substring(pos+1);	//strip comma
			continue;
		} else if (pos > 0)
		{
			searchOpts = str.substring(pos+1);
			str = str.substring(0,pos);
		} else
		{// no commaa
			searchOpts = "";
		}
		// check for this choice
		if (inputOpts.indexOf(inputSep + str + inputSep) >= 0) return true;
		if (inputOpts.indexOf(inputSep + str + "=") >= 0) return true;
	}
	return false;
}
/*---------------------------------------------------------------------------
Looks for a key=value in the options string and returns the value portion.
(clone of getValue in RZTabSupport)

Parameters:
	options - String searched for key=value
	key - Key to find in options string

Returns:
	Associated value when key is found, otherwise returns blank string
----------------------------------------------------------------------------*/
function RZcheckoptionvalue(pOptions,pKey)
{ return RZgetoption(pOptions,pKey) }

function RZgetKeyValue(pOptions,pKey)
{ return RZgetoption(pOptions,pKey) }

function RZgetoptionvalue(pOptions,pKey)
{ return RZgetoption(pOptions,pKey) }

function RZgetoption(pOptions, pKey, defaultValue)
{
	var pos, str, keyEqual;
	if (!pOptions) pOptions = '';
	if (typeof defaultValue == 'undefined') defaultValue = '';

	//----- Search for key=
	keyEqual = pKey + "=";
	str = "," + pOptions;
	pos = str.toLowerCase().indexOf( keyEqual.toLowerCase() );

	if (pos == -1) 	// key not found
		str = defaultValue;
	else
	{
		//----- Keep everything after = up to ,
		str = pOptions.substring(pos + keyEqual.length - 1);
		pos = str.indexOf(",");
		if (pos >= 0) str = str.substring( 0, pos );	// value
	}
	//----- For backward compatibility: only map to true or false
	//		if defaultValue specified as boolean type
	if (typeof defaultValue == 'boolean')
		str = RZistrue(str)
	return str;
}
/*---------------------------------------------------------------------------
Return following as false: 'off', 'no', 'false', false, NaN, null, undefined
otherwise any other true value as true
----------------------------------------------------------------------------*/
function RZistrue(str)
{
	if (str == 0 || str == false
	|| str === 'off' || str === 'no' || str === 'false')
		str = false;
	else
		str = true;
	return str;
}
/*---------------------------------------------------------------------------
Call Next URL (popup or forward link)
----------------------------------------------------------------------------*/
function RZcallNextUrl( name,url, width,height,scroll)
{
	if ( RZpopupUrl(name,url, width,height,scroll) == null )
	{
		RZtrace("Calling Next URL Form", "URL: " + url )
		document.location = url
	}
}
/*---------------------------------------------------------------------------
RZeditor(): See RZeditorsetup in snippet_helper_rte.
Stub kept here for backward compatibility and warning message.
----------------------------------------------------------------------------*/
function RZeditor()
{
	if( RZ.pagetype == 'editform' )
		RZeditorsetup()
	else
		RZalert('Rich Text Editor Must be Opened on Form Page')
}
/*---------------------------------------------------------------------------
Set Link Property value in link object passed to RTE (NOT yet used or tested)
Might be useful on edit forms to set link manager properties.
----------------------------------------------------------------------------*/
function RZsetLinkProperty( linkObj, property )
{
	if (typeof RZ.link[linkname] != 'object')
		if (typeof RZ.link[property] == 'undefined')
			linkObj[property] = ''
		else
			linkObj[property] = RZ[property]
}
/*---------------------------------------------------------------------------
Append key=value to end of set if key not already in set and value not blank.

Optional argument options argument
	if not an object and true, replace existing key with specified value.
	if object then
		options.replace contains replaceFlag true to override a prior value
		options.update set true if value changed (replaceFlag must be true)

Returns true if prior value for key was changed.
----------------------------------------------------------------------------*/
function RZaddset(key, value, options)
{
	var replaceFlag = false;
	if (typeof options == 'object')
		replaceFlag = options.replace;
	else if (options)
		replaceFlag = options;

    // will property be updated (i.e. over-ridden)
	var status = false;			//default return status
	if (typeof value == 'undefined' || value == '') return status;

	var setCheck = ','+ RZ.set;
	var start = setCheck.indexOf(','+key);
	if (start == -1)
	{
		if (RZ.set != '') RZ.set += ','
		RZ.set += key + '=' + value;
	}
	else if (replaceFlag)
	{
		var end = RZ.set.indexOf(',',start);
		if (end == -1) end = RZ.set.length;
		var oldStr = RZ.set.substring(start,end);
		var newStr = key + '=' + value;
		if (oldStr != newStr)  status = true;
		RZ.set = RZreplace( RZ.set, oldStr , newStr );
	}

	if (typeof options == 'object')
	 	options.update = (options.update || status);

	return status;
}
/*---------------------------------------------------------------------------
Set or update RZ property
	options.replace contains replaceFlag true to override a prior value
	options.update set true if value changed (replaceFlag must be true)
----------------------------------------------------------------------------*/
function RZupdate(key,value,options)
{
	if (!options.replace && RZ[key] != '') return;
	if (!value == 'undefined' || value == '') return;

    // will property be updated (i.e. over-ridden)
	if (RZ[key] != '' && RZ[key] != value)
		options.update = true;

	RZ[key] = value;
}
/*---------------------------------------------------------------------------
Set or update form property (probably won't work for Firefox).
	options.replace contains replaceFlag true to override a prior value
	options.update set true if value changed (replaceFlag must be true)
----------------------------------------------------------------------------*/
function RZupdateFormProperty(field,key,value,options)
{
	if (!options.replace && typeof field[key] != 'undefined') return;
    if (!field || typeof value == 'undefined') return;

    if (typeof value == 'string' && value == '')
    	return;

    else if (typeof value == 'object')
    {
		if (typeof value.length == 'undefined'
		|| value.length < 1
		|| value[0] == '')
    		return;
	}

    // will property be updated (i.e. over-ridden)
    if (typeof field[key] != 'undefined' && field[key] != '' && field[key] != value)
		options.update = true;

    field[key] = value;
}
/*-----------------------------------------------------------------------------
get innerHTML of el with leading and trailing spaces and &nbsp; removed.
return blank if el not valid element or id of valid element or innerHTML is not
valid element property.
-----------------------------------------------------------------------------*/
function RZgetInnerHTML(el)
{
	if (typeof el == 'string')
		el = document.getElementById(el);

	var html = '';
	if (el && typeof(el.innerHTML) != 'undefined')
	{
		html = el.innerHTML
		html = html.toString();
		html = html.replace(/^(<br[^>]*>)*([\s\S]*?)(<br[^>]*>)*$/, '$2');
		html = html.replace(/^(\s|&nbsp;)*([\s\S]*?)(\s|&nbsp;)*$/, '$2');
	}
	return html;
}
/*-----------------------------------------------------------------------------
set innerHTML if el is valid element or id of valid element and innerHTML is
valid element property.
-----------------------------------------------------------------------------*/
function RZsetInnerHTML(id,html,doc)
{
	var el = id;
	if (!doc) doc = document;
	if (typeof el == 'string')
		el = doc.getElementById(id);

	if (el && typeof(el.innerHTML) != 'undefined')
	{
		el.innerHTML = html.toString().replace(/\n/g,'<br>');
		return true;
	}
	//RZwarn('id=' + id + ' html element NOT found','level=info');
	return false;
}
/*---------------------------------------------------------------------------
Open Trace Window and Display Message
DCO 10-20-2014: Save trace for admin panel if RZ.trace not enabled
----------------------------------------------------------------------------*/
function RZtrace(heading,text)
{
	//console.log({TRACE:heading, message:text})
	if (!RZ.trace && !RZtrace.show) return
	if (!text) text = ''

	text = text.toString();
	text = text.split('--').join('\n')

	var MSIE = true;
	if (navigator.appVersion.indexOf('MSIE') == -1) MSIE = false;

	//----- Always open using browser specific options
	//		(if already open, it reconnects to existing window)
	while (true)
	{
		if(!MSIE) //Navigator
		{
			RZ.tracewin = window.open('', 'RevizeTrace',
			'width=420,height=580,location=no,menubar=no,resizable=yes,screenX='
			+ (screen.availWidth-430)
			+ ',screenY=20,directories=no,status=no,scrollbars=yes');
		}
		else  //IE
		{
			RZ.tracewin = window.open('', 'RevizeTrace',
			'width=420,height=580,location=no,menubar=no,resizable=yes,left='
			+ (screen.availWidth-430)
			+ ',top=20,directories=no,status=no,scrollbars=yes');
		}
		//----- Close trace window if no access and open again
		if (MSIE && !RZwinaccess(RZ.tracewin))
			RZ.tracewin.close()
		else
			break
	}

	//----- Convert special characters
	text = text.split('<').join('&lt;');
	text = text.split('>').join('&gt;');

	//----- Display message.
	if (heading != '')
		RZ.tracewin.document.writeln(
			'</pre>',
			'<html><title>Trace</title><body>\n',
			'<b>',heading,'</b><br>\n',
			'<font size="-2" face="Arial">',location.href,'</font>\n',
			'<pre>\n',
			text)
	else if (text != '')
		RZ.tracewin.document.writeln( text )
	else
		RZ.tracewin.document.writeln( '</pre>' )

	//----- Give focus, if trace window already open and accessible
	if (!MSIE || RZwinaccess(RZ.tracewin)) RZ.tracewin.scrollBy(0,600)
}

/*---------------------------------------------------------------------------
POPUP EDITOR CAN NO LONGER BE CALLED FROM PUBLISHED PAGES

***** Editor Support Code *****

Open Html Editor in popup window
If specified field exists in XMLForm, use that value.
Otherwise Revize editor will read and store data from content database.
----------------------------------------------------------------------------*/
function RZcallEditor( moduleName, fieldName, width, height, options, recordid )
{
	if (typeof moduleName == 'undefined') moduleName = '';
	if (typeof fieldName == 'undefined') fieldName = '';
	if (typeof width == 'undefined' || width=='' ) width = '600';
	if (typeof height == 'undefined' || height=='') height = '400';
	if (typeof options == 'undefined') options = '';
	if (typeof recordid == 'undefined') recordid = '';

	//----- Make sure field and image elements are supplied
	var msg = '';
	var useDatabase = false;
	if (moduleName == '')
		msg = "Module Name Not Specified"
	else
	{
		if (fieldName == '')
			msg = "Editable Field Name Not Specified"
		else
		{
		if (typeof document.XMLForm == 'undefined')
			useDatabase = true;
		else
			if (typeof document.XMLForm[fieldName] == 'undefined')
			useDatabase = true;
		}
	}


	//----- Report any problems with arguments before using
	if (msg != '')
	{
		RZalert( 'Invalid Revize Editor Request\n\n'
			   + 'Function: snippet_helper.js:RZcallEditor()\n\n'
			   + 'Problem: ' + msg + '\n' )
		return;
	}

	//----- Make trace entry
	RZ.message = '';
	RZmsgAdd( "module"  , '\t' + moduleName )
	RZmsgAdd( "field"   , '\t' + fieldName )
	RZmsgAdd( "width"   , '\t' + width )
	RZmsgAdd( "height"  , '\t' + height )
	RZmsgAdd( "recordid", '\t' + recordid )
	RZmsgAdd( "options" , '\t' + options )
	RZtrace( "Revize Editor Request", RZ.message )

	//----- Call Editor screen, passing parameters via Url
	var url;
	var editorDir = '/revize/'

	if (!RZ.MSIE || RZ.browserversion < 5.5)
	{
		editorDir += 'javaeditor'

		// Convert any rich edit options to applet editor Url parameters syntax
		options = RZ.options.split(';').join('&')
		if (options.substring(1,3) == '&&') options = options.substring(1)
	}else
	{
		editorDir += 'htmleditor'
		options = RZeditorOptions(options);		//convert to rich edit format
		options = 'options=' + escape(options)	//passed as a single parameter
	}
	url = editorDir + '/editor-editform.jsp?webspace=' + RZ.webspace;
	if (useDatabase != '') url += '&module=' + moduleName;
	url += '&field=' + fieldName
	if (recordid != '') url += '&recordid=' + recordid
	url += '&width=' + width + '&height=' + height + '&' + options
	RZpopupUrl('revize_editor',url,width,height,'no')
}
/*---------------------------------------------------------------------------
Open Url in Popup Window (return true if popup)

Originally used popup window if either width, height or SCROLL was not blank;
with advent of RZaction() and use of RZ object arguments, do not assume popup
based on scroll value or if both width and height are set to 0.

Since scroll is last feature, it can specify other features after the scroll
value. For example:
	yes,location=yes,menubar=yes,toolbar=yes,directories=yes'

If niether width, heigth or scroll are specified assume popup window with no
features specified.

Returns:
	window object of popup window or null if popup window not used
----------------------------------------------------------------------------*/
function RZpopupUrl(name,url,width,height,scroll)
{
	var useFeatures = true;
	if(typeof width == 'undefined'
	&& typeof height == 'undefined'
	&& typeof scroll == 'undefined')
		useFeatures = false;
	else
	{
		var popup = false;
		if (typeof width != 'undefined' && width != '' && width != 0 && width != '0')
			popup = true;
		if (typeof height != 'undefined' && height != ''	&& height != 0 && height!= '0')
			popup = true;
		if (!popup) return null;

		// DCO 03-26-2014: for IE11+, remove RZ.baseurlprefix
		if ((RZ.isIEw3c || RZ.isMSEdge) && RZ.baseurlprefix && url.indexOf(RZ.baseurlprefix) == 0)
			url = url.substr(RZ.baseurlprefix.length);
	}

	RZ.message = "Name: " + name + "\n"
		 + "Url:  " + url + "\n"
		 + "Width:  " + width + "\n"
		 + "Heigth: " + height + "\n"
		 + "Scroll: " + scroll + "\n"
	RZtrace("Opening Popup Window", RZ.message)

	//----- Determine popup properties
	if(typeof url == 'undefined') url = ''
	if(typeof name == 'undefined') name = 'RevizeWindow'
	if(typeof width == 'undefined' || width=='') width = 400
	if(typeof height == 'undefined' || height=='') height = 400
	if(typeof scroll == 'undefined' || scroll=='') scroll = 'yes'

	var menubar = 'no'
	var location = 'no'
	var toolbar = 'no'
	var directories = 'no'
	var status = 'yes'
	if( RZ.trace || RZ.debug )
	{
		scroll = 'yes'
		menubar = 'yes'
		location = 'yes'
		toolbar = 'yes'
		directories = 'yes'
		status = 'yes'
		width = parseInt(width) + 15
		height = parseInt(height) + 50
	}
	else if (name == 'admin')
	{
		menubar = 'yes'
		location = 'yes'
	}

	var features = 'width=' + width + ',height=' + height
			   + ',location='+location
			   + ',menubar='+menubar
			   + ',resizable=yes'
			   + ',toolbar=' + toolbar
			   + ',directories=' + directories
			   + ',status=' + status
			   + ',scrollbars=' + scroll	//must be last to allow specify features

	var x = (screen.availWidth - width) / 2 - 10
	if (RZ.browserdev) x=0;

	var y = (screen.availHeight - height) / 2 - 30
	if (y < 50) y = 0

	if(navigator.appVersion.indexOf('MSIE') == -1 && !RZ.isIEw3c )  // Netscape
		features += ',screenX=' + x.toString()
				 +  ',screenY=' + y.toString()
	else                                            // IE browser
		features += ',left=' + x.toString()
				 +  ',top=' + y.toString()
	if (!useFeatures) features = ''	//do not specify features

	/*****
	First open the popup window and give it focus in case it was already open.
	It is possible that the popup window has been left open by another instance
	of the browser.  When this occurs on IE, the popup window will NOT have
	access to window.opener property.  To avoid this problem, we wait a second
	and then call RZpopupAccess() to close and reopen the popup if the popup
	window does not have proper access to this window.  We did not want to
	always close and reopen the window because it can be distracting for
	content editors.
	*****/

	//TODO:	This statement gets 1075 error on IE when opening publishing window
	//		if popup edit form was left open from another edit (calendar_app)
	RZ.popupwin = window.open( url, name, features );

	//----- On Netscape, RZ.popupwin sometimes not defined
	if (RZ.popupwin == null || typeof RZ.popupwin == 'undefined')
		RZ.popupwin = window.open( url, name, features );

	//----- Give popup window focus
	RZ.timeoutfocus = window.setTimeout('RZfocus(RZ.popupwin)', 500);

	//----- Check for access after page loads
	var str = 'RZpopupAccess("' + url + '","' + name+ '","' + features + '")'
	RZ.timeoutaccess = window.setTimeout(str, 1000)

	return RZ.popupwin;
}
/*---------------------------------------------------------------------------
Cancel focus and access timeout events.
----------------------------------------------------------------------------*/
function RZcancelPopupEvents()
{
	window.clearTimeout(RZ.timeoutfocus)
	window.clearTimeout(RZ.timeoutaccess)
}
/*---------------------------------------------------------------------------
Sets focus in case the specified window was left open from a previous call
----------------------------------------------------------------------------*/
function RZfocus(win)
{
    if (RZwinaccess(win))
        if (win.name != 'rzrte' && win.name != 'RZpublishing') win.focus();
}
/*---------------------------------------------------------------------------
See above description in RZpopupUrl
----------------------------------------------------------------------------*/
function RZpopupAccess(url,name,features)
{
	var str = ''
	if (!RZwinaccess(RZ.popupwin))
	{
		str = 'popup window closed'
	}else
	{
		str = 'opener: '
		if (RZwinaccess(RZ.popupwin.opener))
		{
			if (typeof RZ.popupwin.opener.location == 'undefined')
				str += '*no url*'
			else
				str += RZ.popupwin.opener.location.href
		}
		else if (typeof RZ.popupwin.opener != 'undefined')
			str += 'no access to opener'
		else
			str += 'opener not defined'
	}

	var msg = 'name: ' + name + '\n'
            + 'url: ' + url + '\n'
            + str + '\n'
	//alert('Popup Properties\n\n' + msg)
	RZtrace( 'Popup Properties', msg)

	//----- Quit if popup window has been closed
	if (!RZwinaccess(RZ.popupwin)) return

	//----- If no access to opener, close window and reopen
	if ( !RZwinaccess(RZ.popupwin.opener))
	{
		RZ.popupwin.close();
		RZ.popupwin = window.open( url, name, features );
		return
	}

	/*
	//----- If Revize Control Panel... (future)
	if ( name == 'revizecontrol' )
	{
		if (typeof RZ.popupwin.RZ == 'undefined')
		{
			window.focus()
			RZ.popupwin.document.write('<title>Revize Control Panel</title>')
		}
	}
	*/
  	RZ.popupwin = null		//indicate popup processing complete
}
/*---------------------------------------------------------------------------------------------
Wait for access to "win" to perform "waitCommand" displaying "waitMsg" while waiting;
Only wait "maxSeconds" (default 30); check every "msInterval" (default 1000) milliseconds.
---------------------------------------------------------------------------------------------*/
function RZwait(win, waitCommand, waitMsg, maxSeconds, msInterval)
{
	if (typeof waitMsg == 'undefined') waitMsg = 'Waiting for access'
	if (typeof maxSeconds == 'undefined') maxSeconds = 30
	if (typeof msInterval == 'undefined') msInterval = 1000

	RZcancelPopupEvents()	//RZwait overrides automatic popup events

	//----- Validate arguments
	var msg = ''
	if (typeof win != 'string')
		msg = '1st Argument is type ' + typeof win;
	else if(typeof waitCommand != 'string')
		msg = '2nd Argument is type ' + typeof win;

	if (msg != '')
	{
		msg = 'RZwait must be called with string variables\n\n' + msg;
		RZalert(msg)
		return;
	}

	//----- Setup call to RZwaitCheck...
	var now = new Date()
	RZ.waitstart = now.getTime()	//start of wait
	RZ.waitaccess = 0

	waitCommand = RZreplacesubstring( waitCommand, '"', '\\"' )

	RZ.waitcall = 'RZwaitCheck( ' + win
	                          + ', "' + waitCommand + '" '
	                          + ', "' + waitMsg  + '" '
	                          + ', ' + maxSeconds
	                          + ', ' + msInterval
	                          + ' )'

	RZtrace('Setup Wait', RZ.waitcall )
	//eval( RZ.waitcall )		//call RZwaitCheck() immediately
	setTimeout( RZ.waitcall, msInterval );	//give the url a chance to load
}
/*---------------------------------------------------------------------------
----------------------------------------------------------------------------*/
function RZwaitError(message)
{
	return true
}
/*---------------------------------------------------------------------------------------------
If access to "win" or "maxSeconds" have passed since "RZ.waitstart", perform "waitCommand";
otherwise wait another "msInterval" milliseconds.

Access means permisison to access window, RZ not null and...
either window name is not blank (works for most non-Revize enabled pages)
--or-- RZ.loaded is not undefined nor null

Notes:
It is possible that access to "win" is lost after checking access but prior to actually
accessing "win" variables which can cause one of the following JavaScript errors:
	RZ is null or not an object
	object does not support this property or method

Checking the page access before the new url starts to load is believed to be one cause.
An alternative onerror handler is set to catch these potential javascript errors.
This function stops running after a javascript error but unfortunately when MS studio is
installed and IE script debugging is not disabled, the currently defined onerror handler
does not run either and therefore can't be used to restore the original onerror handler
or schedule RZwaitCheck() to run again.

In order to restart RZwaitCheck in all cases is therefore rescheduled before the any
javascript error can occur and canceled if no more waiting is required.
---------------------------------------------------------------------------------------------*/
function RZwaitCheck (win, waitCommand, waitMsg, maxSeconds, msInterval)
{
	if (window.onerror == RZwaitError)
		window.onerror = RZ.waitonerror		//restore original handler

	var now = new Date()
	var seconds = (now.getTime() - RZ.waitstart).toString() / 1000
	waitcallId = setTimeout( RZ.waitcall, msInterval)

	var waitMore = ''
	if( !RZwinaccess(win) )
	{
		waitMore = 'no access'
		RZ.waitaccess = 0
	}
	else
	{	// see debugger notes this function description for onerror handling
		if (window.onerror != RZwaitError)
			RZ.waitonerror = window.onerror
		window.onerror = RZwaitError

		//simulate race error one time as described in debugger notes above
		RZ.waitaccess++
		//if (RZ.waitaccess <= 1 && RZ.error.force) RZ.waitaccess = 99

		// if window reloading, RZ.loaded first set to null
		if (typeof win.RZ != 'undefined' && win.RZ != null
		&& typeof win.RZ.loaded != 'undefined' && win.RZ.loaded != true)
			waitMore = 'refresh pending'

		// window name undefined until window loaded (at least on IE)
		else if (typeof win.name == 'undefined')
			waitMore = 'window loading'

		// if window name is not blank, assume window loaded
		// (recognizes non-revize enabled pages especially frames)
		else if (win.name != '')
			waitMore = ''

		// RZ.loaded not defined until onload handler complete
		else if (typeof win.RZ == 'undefined' || win.RZ == null
		|| typeof win.RZ.loaded == 'undefined' || win.RZ.loaded != true)
			waitMore = 'onload pending'

		window.onerror = RZ.waitonerror		//restore original handler
	}

	var waitDone = false
	if (waitMore != '')
	{
		var waitedMsg = ' waited ' + parseInt(seconds) + ' seconds'
		RZtrace(waitMsg, waitedMsg )
		RZ.parent.status = waitMsg + ': ' +  waitedMsg + ' (' + waitMore + ')'
		if (seconds > maxSeconds )	//don't wait too long
			waitDone = true;		//waited long enough
	}
	if (waitMore=='' || waitDone)
	{
		RZ.waitcall = ''			//clear in case scheduled timeout starts
		clearTimeout( waitcallId )	//cancel scheduled waitCheck
		waitedMsg = 'waited ' + seconds + ' total seconds'
		RZtrace('RZwaitCheck(): ' + waitMsg, waitedMsg )
		if (!waitDone) RZ.parent.status = ''
		eval( waitCommand )
	}
}

/*---------------------------------------------------------------------------
Determine if opener properties are still accessible
(they will not be if window closed or moved to another url)

TODO: check access on NS (unknown)

The following is always false on Netscape:

if ( typeof RZ.popupwin.opener.document == 'unknown' )
----------------------------------------------------------------------------*/
function RZwinaccess(win)
{
	//default to opener for backward compatibility but all calls
	//now probably pass an argument.
	if (!win) win = RZ.parent.opener

	try
	{
		//TODO: gets interface error (IE?) if calling window is closed
		//		(inside try/catch so should not cause issues)

		// chrome (and probably FF), throw exception if invalid window
		// e.g. parent.opener when it does not exist
		if (typeof win == 'undefined' || win == 'undefined') return false

		if(win != null
		&& typeof win != 'undefined'
		&& win.closed != true

		// chrome (and probably FF), throw exception if invalid window
		// e.g. parent.opener when it does not exist
		&& win !='undefined')
		{
			if (RZ.MSIE && typeof win.document == 'unknown')
				return false;
			//force error if access denied
			else if (!RZ.MSIE && win.location.href == '')
				return false;
			else
				return true;
		}
	}
	catch (ex)
	{
		return false;
	}
	return false
}

/*---------------------------------------------------------------------------
Give focus to opener if still accessible.
----------------------------------------------------------------------------*/
function RZopenerFocus(win)
{
	if (RZ.refresh)
		RZ.refresh = false
	else
	{
      if (typeof win == 'undefined') win = RZ.parent.opener
		if (RZwinaccess(win)) win.focus()
	}
}

/*---------------------------------------------------------------------------
Display page permission warning defined by code.
----------------------------------------------------------------------------*/
function RZpagemessage(code,linkname,linkparent,linklevel)
{
	if (typeof linkname == 'undefined') linkname = ''
	if (typeof linkparent == 'undefined') linkparent = ''
	if (typeof linklevel == 'undefined') linklevel = ''

	var msg = ''
	var hash = '';

	switch ( code )
	{
		// button warning
		case "":
			break;

		// page permission icon appearing in upper left corner of page is clicked.
		case "noparent":
			msg += 'No parent defined for this PAGE'
			break;

		// link manager
		case "nolinkparentfield":
			msg += 'No linkparent field defined for this LINK'
			break;

		// link manager
		case "nolinkparent":
			msg += 'No parent defined for this LINK'
			break;

		// button warning
		case "nomodule":
			msg += 'Revize module not defined on button'
			break;

		// button warning
		case "parent_itself":
			msg += 'Page can not be a parent of itself \n(no longer true)'
			break;

		// unknown warning
		default:
			msg += 'Page permission incongruency'
			code = RZreplace(code,'--','\n')
			if (code.length > 25)
				msg += ':\n\n' + code
			else
				msg += ' (reason:' + code + ')'
			break;
	}

	RZ.message = ''
	RZ.parameters = ''
	if (linkname != '')
	{
		RZ.message += 'Link Information:\n\n'
		RZaddUrlParameter('Link Name: ' + linkname )
		RZaddUrlParameter('Link Module: ' + RZ.link[linkname].linkmodule )
		RZ.message += '\n'

		if (linkparent == '*nofield*')
			RZ.message += 'No linkparent field in linkmodule\n'
		else if (RZ.link[linkname].linkmodule != '')
			RZaddUrlParameter(RZ.link[linkname].linkmodule+'.linkparent: '+ linkparent)
		RZaddUrlParameter('First List Item Parent: '+ RZ.link[linkname].linkparent)

		if (linklevel != '')
		{
			RZ.message += '\n'
			RZaddUrlParameter('Link Level: '+ linklevel)
			if (typeof RZ.linkparentnew[linkname] != 'undefined')
				RZaddUrlParameter('Level '+linklevel+' new parent_key: '
				                 + RZ.linkparentnew[linkname][linklevel])
		}
	}
	else
	{
		RZ.message += 'Page Information:\n\n'
		var templateType = '(unique)'
		if (RZ.pagemodule != '') templateType = '(dependent)'
		RZaddUrlParameter('Template: ' + RZ.pagetemplatename + '  ' + templateType )
		if (RZ.pagemodule != '')
		{
			RZaddUrlParameter('Module: '    + RZ.pagemodule )
			RZaddUrlParameter('Record Id: ' + RZ.editrecordid )
			hash = '#' + RZ.pagemodule + "_" + RZ.editrecordid;
		}
		RZ.message += '\n'
		RZaddUrlParameter('page_key:     '   + RZ.page_key )
		RZaddUrlParameter('parent_key:  '   + RZ.parent_key )
		RZ.message += '\n'
		RZaddUrlParameter('Permitted roles: ' + RZ.page_roles )
		RZaddUrlParameter('Permitted users: ' + RZ.page_users )
		if (RZ.inherit_key != '')
			RZaddUrlParameter('Inherited from: ' + RZ.inherit_key )
	}
	RZ.message += '\n'
	RZaddUrlParameter('permissions_options: ' + RZ.permissions_options )

	if (msg != '')
	{
		msg =  '---------------------------------------------------\n' + msg + '\n'
		msg += '---------------------------------------------------\n\n'
	}
	msg += RZ.message + '\n'
	msg += '---------------------------------------------------\n'
	msg += 'Click Ok to find pages that link to this page      \n'
	msg += '---------------------------------------------------\n'

	if (confirm(msg))
		location.href = RZ.webspacelinksurl + hash
	return void(0)
}

/*---------------------------------------------------------------------------
Display and clear warning from jsp code
----------------------------------------------------------------------------*/
function RZwarning()
{
	if (RZ.warning != '')
	{
		window.status = RZreplaceAll( RZ.warning, '-- --', '; ')
		RZtrace( 'Warning from JSP code', RZ.warning )
		RZ.warning = ''
	}
}
/*---------------------------------------------------------------------------
Display alert or confirm dialog using RZalert (with prepended issue message)
Only displayed if RZ.debug is true;

By using RZalert, the javascript debugger can be started if in debug mode.

Parameters:
	message	- Message describing problem encounted with page
	isConfirm - Optional If true, confirm dialog is used (default is false)
----------------------------------------------------------------------------*/
function RZwarn(message,isConfirm) { return RZnote(message,isConfirm) }
function RZnote(message,isConfirm)
{
	var isNote = true
	return RZalert(message,isConfirm,isNote)
}
/*---------------------------------------------------------------------------
Display alert using confirm dialog

Parameters:
	message	- Message describing problem encounted with page
----------------------------------------------------------------------------*/
function RZconfirm(message)
{
	return RZalert(message,true)
}
/*---------------------------------------------------------------------------
Add message to trace window (including call stack)

Display message in alert with prepended with notation that page has a problem

DCO 10-20-2014: Stop using alert() -- RZtrace() saves messages for AdminPanel

If RZ.debug is true, a confirm dialog is used with option to start the
JavaScript debugger.

----------
Parameters:
----------
message	 	Message describing problem encounted with page

isConfirm 	(Optional) If true, confirm dialog is used (default is false)
				As of 07-22-2012, always prompt for debugger in Debug Mode
			09-14-2012: was deprecated probably 07-22; reactivated so can be used as
			extended confirm() with option to start debugger in debug mode.
			e.g. RZsave() uses as extended confirm() when Revize form wizard deleted.

isNote 		(Optional) If true and not RZ.Debug, only display message in status bar
			Otherwise use RZalert() to display message.
----------------------------------------------------------------------------*/
function RZalert(message,isConfirm,isNote)
{
  	if (typeof isNote == 'undefined') isNote = false;
  	if (typeof isConfirm == 'undefined') isConfirm = false;

	if (typeof message == 'undefined' || typeof message == 'object')
  		message = 'Message is ' + typeof message;

  	else if (message == '')
  		message = 'No Reason Given';

	message = message.split('--').join('\n\n');
	if (isConfirm || RZ.debug)
	{
		if (RZ.debug)
		{
			var msg = 'DEBUG mode is active; debugger starts if Ok clicked\n\n' + message
			message = RZdisplayCaller(msg);
		}
		if (confirm(message))
		{
			if (RZ.debug) debugger;
			return true;
		}
	}
	else if (isNote)
		window.status = message;
	else
		RZtrace('RZalert',message);	//DCO 10-20-2014
		//alert(message);			//		 ''

	return '';	//can be used to clear message
}
/*---------------------------------------------------------------------------
Convenience function for determining if administrator logged in
----------------------------------------------------------------------------*/
function RZisadmin()
{
	return RZcheckoptions(RZ.roles,'superuser,administrator');
}
/*---------------------------------------------------------------------------
Write html if user is authenticated for current webspace (RZ.webspace).
During page initialization RZ.login is set to the RZlogin cookie defined by
the login function.
TODO: Do not write any html for production channels.

Parameters:
	html -			html code to be written if logged in and proper permission
	module -		Module requiring permissions
	permits -		Permissions required on module
	action -		Button action
----------------------------------------------------------------------------*/
function RZlogin( html, module, permits, action )
{
	// 2nd parameter was webspace way back and there was not a 3rd parameter
	// so defaulting permits to blank retains backward compatibility.
	if (typeof module == 'undefined') module = '';
	if (typeof permits == 'undefined') permits = '';
	if (typeof action == 'undefined') action = '';

	// backward compatibility
	if(typeof RZ.webspace == 'undefined'
	&& typeof RZ.webSpaceName != 'undefined')
		RZ.webspace = RZ.webSpaceName

	// if login webspace does not match page webspace, return false
	if(RZ.login != RZ.webspace && RZ.login != '*ALL')
		return false

	// if pointbasedemo webspace and NOT preview directory, return false
	if(RZ.webspace.indexOf('pointbasedemo') >= 0
	&& RZ.page.pathname.indexOf('-preview') == -1)
		return false;

	// if demosite webspace and production directory, return false
	if(RZ.webspace.indexOf('demosite') >= 0
	&& RZ.page.pathname.indexOf('-prod') != -1)
		return false;

	// if atwatercounty webspace and production directory, return false
	if(RZ.webspace.indexOf('atwatercounty') == 0
	&& RZ.page.pathname.indexOf('-prod') != -1)
		return false;

	// if paradigm webspace and production directory, return false
	if(RZ.webspace.indexOf('paradigm') == 0
	&& RZ.page.pathname.indexOf('-prod') != -1)
		return false;

	// show the help button before the permissions button
	if(module == 'webspace_page_permissions')
		document.write('<a href="http://cms4.revize.com/revize/supportrevize/revize_faq.php" target="_new"><img src="../images/edit/help.jpg" alt="Help" border="0" /></a>');

	//----- If called with a module and required permits, check them.
	//		If no access, return false and do not write any html.
	if ( module != '' && permits != ''
	&& RZpermits(module , permits) != true )
		return false;


	//----- Hide button if no page permissions (TODO: hides what? seq?)
	if ( action != 'save' && action != 'cancel' && action != 'history')
		if ( !RZ.pagepermission && module != '' ) return false;


	if ( typeof html != 'undefined' && html != '')
		document.write(html);

	return true;
}
/*---------------------------------------------------------------------------
Display rendered width of element
----------------------------------------------------------------------------*/
function RZrte(id)
{
	if (!id)
	{
		id=prompt('Enter element id',RZgetcookie('RZrte'));
		if (!id) return;
		RZsetcookie('RZrte',id);
	}
	var msg = '';
	var el = document.getElementById(id);
	if (!el)
		msg = 'id='+id+' not found';
	else
	{
		msg += '\n    font-family=' + currentStyle('font-family') + ';';
		msg += '\n    font-size=' + currentStyle('font-size') + ';';
		while (el.clientWidth == 0 && el.parentNode)
			el = el.parentNode;
		var padding = parseInt(currentStyle('padding-left'))
		            + parseInt(currentStyle('padding-right'));
		msg = '.rte-format {' + msg + '\n}'
			+ '\n\nwidth=' + el.clientWidth;
		if (padding > 0)
			msg += '\n\nwidth=' + (el.clientWidth - padding) + ' (less padding for RTE)';
	}
	alert(msg);
	return;

	function currentStyle(style)	//style is css format (e.g. font-size)
	{
		if (!document.defaultView)
		{
			style = style.replace(/(-)(\w)/, function (all,dash,word){
				return word.toUpperCase();
			})
			return el.currentStyle[style];
		}
		else
		{
			var renderedStyle = document.defaultView.getComputedStyle(el,'');
			return renderedStyle.getPropertyValue(style);
		}
	}
}
/*---------------------------------------------------------------------------
Toggle debug mode with prompt that includes optional notes argument.
----------------------------------------------------------------------------*/
function RZdebug(notes,win)
{
	if (typeof win == 'undefined') win = window;

	if (typeof notes == 'undefined')
		notes = '';
	else if (typeof notes == 'object')
	{
		win = notes;
		notes = '';
	}

	var debugState = !RZ.debug
	var msg = 'Set debug ' + debugState + '?'
	if (typeof notes != 'undefined')
		msg = notes + '\n\n' + msg

	//dont need confirm with new adminpanel
	if (!notes || win.confirm(msg))
	{
		RZ.debug = debugState;
		RZsetcookie('RZdebug', (RZ.debug ? RZ.webspace : '') ,RZ.page.domain);
	}
	return void(0)
}
/*---------------------------------------------------------------------------
Prompt to start debugger with optional notes argument.
----------------------------------------------------------------------------*/
function RZdebugger(notes)
{
	var msg = 'Start Debugger?'
	if (typeof notes != 'undefined')
		msg = notes + '\n\n' + msg

	if (confirm(msg))
	{
		//RZ.debug = true;
		debugger;
	}

	return void(0)
}
/*---------------------------------------------------------------------------
Ask to start IE or Netscript Javascript debugger.
----------------------------------------------------------------------------*/
function RZstartDebugger()
{
	debugger;
	return;
}
/*---------------------------------------------------------------------------
return function name of caller at depth
----------------------------------------------------------------------------*/
function RZgetcaller(depth)
{
	if (!depth) depth = 2;	//caller of this func caller
	var patternFunction = /function\s*(\w*)\s*\((.*?)\)[^{]*{([\s\S]*)}/
	//                                 1         2           3
	//								   name      args        body
	var funcName = '';
	for (var func = RZgetcaller.caller; func != null; func = func.caller)
	{
		var script = func.toString();
		var results = funcName = script.match(patternFunction);
		if (!results)
			funcName = '*unknown*';
		else
		{
			funcName = results[1];
			if (!results[1])
				funcName = "anonymous";
		}
		if (--depth <= 0) return funcName;
	}
	return '-main-';
}
/*---------------------------------------------------------------------------------------
Display caller stack

---------
Arguments:
---------
msg			(Optional) String contain message to display before caller stack
options		(Optional) String contains the following seperated by commas
			debug		pause in debug mode (used in calendar_app)
			debug=???	only pause if RZdebugoption[???] is true
			force		pause even if not in debug mode
			yes			assume yes rather using comfirm
---------------------------------------------------------------------------------------*/
RZdisplayCaller.MAX_FUNCTIONS_SHOW_ARGS = 3;
RZdisplayCaller.MAX_FUNCTIONS = 15;
function RZdisplayCaller(msg,options)
{
    if (!msg) msg = '';
	if (msg) msg += '\n\n';
	if (!options) options = '';

	var isDebug = RZcheckOptions(options,'debug')
	var isDebugForce = RZcheckOptions(options,'force')
	if (isDebugForce) isDebug = true;

	var e = '';
	var funcName = '';
	var indentFunc = isDebug ? 0 : 4;
	var indentArgs = indentFunc + 4;
	var trace = msg;
	try											//don't want js error for users
	{
		if (isDebug)
		{
			if (!RZ.debug && !isDebugForce)		//RZ.debug can be typeof unknown
				return false;
			var isDebugYes = RZcheckOptions(options,'yes');
			var debugOption = RZgetOption(options,'debug');	//debug=
			if (!debugOption || !RZisDebugOption(debugOption)) return false;
		}

		var i, count = 0;
		var patternFunction = /function\s*(\w*)\s*\((.*?)\)[^{]*{([\s\S]*)}/
		//                                 1         2           3
		//								   name      args        body
		for (var func = RZdisplayCaller.caller; func != null; func = func.caller)
		{
			var script = func.toString();
			var results = funcName = script.match(patternFunction);
			if (!results)
				funcName = '*unknown*';
			else
			{
				funcName = results[1] + '(' + results[2] + ')';
				if (!results[1])
					funcName = "anonymous" + funcName;
			}

			// display args for 1st few functions
			if (++count <= RZdisplayCaller.MAX_FUNCTIONS_SHOW_ARGS)
			{
				msg = funcName + '\n';

				// display args and current values
				var args = results[2];
				if (args)
				{
					args = args.split(',');
					for (i=0;i<args.length;i++)
					{
						var value = 'undefined';
						if (i < func.arguments.length) 	//value supplied
						{
							var indentValue = indentArgs + args[i].length + 1;
							value = func.arguments[i] + '';
							value = value.replace(/\t/g,'    ');
							if (value.length > 20)
								value = RZtrim(value.substr(0,20)) + '...';
							value = value.replace(/\n/g,'\n' + RZdup(indentValue,' '));
						}
						msg += RZdup(indentArgs,' ') + args[i] + '='
							   + value
							   + '\n';
					}
				}
				funcName = msg;
			}
			// for anonymous, display first non-blank line of function body
			if (funcName.indexOf('anonymous(') != -1)
			{
				results = results[3].match(/\s*(\w+.*)/);
				if (results)
				{
					funcName += RZdup(indentArgs,' ') + '{' + results[1] + '...}\n';
				}
			}
			if (count == 1)
			{
				if (isDebug)
					trace += 'DEBUG MODE pause in: ' + funcName + 'CALLED FROM...\n';
				else
					trace += 'CALLED FROM...\n' + RZdup(indentFunc,' ') + funcName;
			}
			else
				trace += '    ' + funcName + "";

			if (func.caller == func) break;		//NS 4.0 bug workaround
			if (count > RZdisplayCaller.MAX_FUNCTIONS) break;	//probably in recursive loop (e.g. calendar setup())
		}	// end trace stack

		// append main html file
		RZdisplayCaller.fn = funcName;
		var filepath = location.pathname;
		filepath = filepath.replace(/\\/g,'/');
		RZdisplayCaller.filename = filepath;
		filepath = filepath.substr(filepath.lastIndexOf('/')+1)
		trace += '    ' + filepath;

		if (isDebug)
			return isDebugYes || confirm(trace + '\n\nStart Debugger?');
	}
	catch (e) {}	//ignore js errors

	return trace;
}
/*---------------------------------------------------------------------------------------
Display all object values and expand object children down to OBJECT_DEPTH

Can also be used to return display value for other types (i.e. boolean, number or string) OR
	*undefined*, *empty*, *null*, *true*, *false*

TODO: typeof undefined is not displayed properly
	  html elements have el.contructor == Element is true
---------------------------------------------------------------------------------------*/
function RZdisplayObject(obj,name)
{
	try
	{
		return RZdisplayObjectProcess(obj,name);
	}
	catch (e)
	{
		RZdisplayObject.display += '\nException Displaying Object:\n' + e.description;
		return RZdisplayObject.display;
	}
}
function RZdisplayObjectProcess(obj,name,indent,isArray)
{
	var i, e, results;

	//assume top level starting point, initialize variables
	if (typeof(indent) == 'undefined')
	{
		indent = 0;
		RZdisplayObject.objectCount = 0;
		RZdisplayObject.quit = false;
		RZdisplayObject.lastTypeObject = false;
		RZdisplayObject.firstObject = true;
		RZdisplayObject.display = '';			//build as processed in case exception
	}
	//----- Initialize any undefined RZdisplayObject settings
	if (!RZdisplayObject.OBJECT_LIMIT)
		RZdisplayObject.OBJECT_LIMIT = 100;		//max number of object displayed without prompt
	if (!RZdisplayObject.OBJECT_DEPTH)			//TODO:
		RZdisplayObject.OBJECT_DEPTH = 5;		//max depth for object display
	if (!RZdisplayObject.INDENT_SIZE)
		RZdisplayObject.INDENT_SIZE = 4;		//max depth for object display
	if (!RZdisplayObject.MAXLINE)
		RZdisplayObject.MAXLINE = 500;			//max characters displayed for any value
	if (typeof RZdisplayObject.SHOW_PROTOTYPE == 'undefined')
		RZdisplayObject.SHOW_PROTOTYPE = false;	//true to display prototype elements
	if (typeof RZdisplayObject.SHOW_TYPE == 'undefined')
		RZdisplayObject.SHOW_TYPE = true;		//true to display non-object data types
	if (!RZdisplayObject.MARKER)
		RZdisplayObject.MARKER = '&#8226;';		//used for null, empty, etc
	if (!RZdisplayObject.EOL_MARKER)
		RZdisplayObject.EOL_MARKER = '&#172;';	//end of non-object value
	if (!RZdisplayObject.OBJECT_SPACING)
		RZdisplayObject.OBJECT_SPACING = '\n';	//spacing before and after object

	//----- Set work variables for this depth
	var spaces = RZdup(indent * RZdisplayObject.INDENT_SIZE, "&nbsp;");
	var spacesPlus = spaces + RZdup(RZdisplayObject.INDENT_SIZE, "&nbsp;");
	var spacesPlusPlus = spacesPlus + RZdup(RZdisplayObject.INDENT_SIZE, "&nbsp;");

	var type = '';
	var isEmpty = true;
	var isObject = true;
	var isArrayElement = false;
	if (isArray && !isNaN(name))
		isArrayElement = true;
	var objAdjust = obj;

	//----- Determine type
	if (obj && obj.constructor == Array)
	{
		type = 'array';
		isArray = true;
		//objAdjust = {length: obj.length}
		//for (i in obj) {objAdjust[i] = i};
	}

	else if (obj && obj.constructor == Function)
		type = 'function';

	//----- Not called with object, display value of obj argument
	else if (typeof(obj) != 'object' || (indent==0 && obj === null))
		return getValue(obj);

	//----- Headings
	if (type) type += ' ';
	if (indent == 0)	//display for top level
	{
		if (isObject)
		{
			if (!name) name = '[' + type + 'object]: ';
			RZdisplayObject.display += name + '\n';
			indent = 1;
		}
	}
	else
	{
		RZdisplayObject.display += spaces;
		if (isArrayElement)
			RZdisplayObject.display += '[' + name + ']: (' + type + 'object)\n';
		else
			RZdisplayObject.display += '(' + type + 'object): ' + name + '\n';
		//RZdisplayObject.display += spaces + '[object' + type + ']: ' + name + '\n';
	}

	//----- Iterate through the elements in obj; NOTE: when typeof(obj)==function, no iteration takes place
	//		Use objAdjust defined above since for (i in obj) does not find array length property
	for (i in objAdjust)
	{
		// process OBJECT within obj (including functions)
		if (typeof(obj[i]) == 'object' || typeof(obj[i]) == 'function')		//expand nested object
		{
			if (overLimit()) continue;
			if (typeof(obj[i]) == 'function' && skipPrototype(Function)) continue;

			var prefix = '';
			if (RZdisplayObject.firstObject && !RZdisplayObject.lastTypeObject)
				prefix = RZdisplayObject.OBJECT_SPACING;

			// move down another level
			RZdisplayObject.display += prefix + spaces + RZdisplayObjectProcess(obj[i],i,indent,isArray);
			if (RZdisplayObject.display.substr(RZdisplayObject.display.length-2,1) != '\n')		//don't need newline if returned from nested call
				RZdisplayObject.display += RZdisplayObject.OBJECT_SPACING;

			RZdisplayObject.firstObject = false;
			RZdisplayObject.lastTypeObject = true;
			isEmpty = false;
		}
		// process NON-OBJECT element within obj
		else
		{
			if (skipPrototype()) continue;		// if not displaying prototype variables
			if (isArray && isArrayElement) RZdisplayObject.display += spaces;		// extra indentation for array objects

			var value = getValue(obj[i]) 		// determine non-object value


			value = value.replace(/\n/gm,'\n'+spacesPlusPlus);	//apply indent to all lines
			value = RZdisplayObject.display += spacesPlus + i + ': ' + value + '\n';

			RZdisplayObject.lastTypeObject = false;
			isEmpty = false;
		}
	}

	//----- Done iterating through elements, if nothing displayed, indicate why
	if (isEmpty)
	{
		// extra indentation for array objects
		if (isArray) RZdisplayObject.display += spaces;

		// special values: null, function, empty
		if (obj === null)							//null object
			RZdisplayObject.display += spacesPlus + RZdisplayObject.MARKER + 'null' + RZdisplayObject.MARKER + '\n';

		else if (obj.constructor == Function)		//function (just show name and paramters)
		{
			results = obj.toString().match(/function\s*(\w*)\s*\(([^\)]*)\)/);
			if (results)
				RZdisplayObject.display += spacesPlus + results[0] + '...\n'
			else									//name not found (should not get here)
				RZdisplayObject.display += spacesPlus  + RZdisplayObject.MARKER+ 'unknown function' + RZdisplayObject.MARKER;
			RZdisplayObject.lastTypeObject = false;
		}
		else if (isEmpty)							//empty object (must test after function test above)
			RZdisplayObject.display += spacesPlus + RZdisplayObject.MARKER + 'no elements' + RZdisplayObject.MARKER + '\n';
	}
	// remove last newline (it gets added by caller)
	RZdisplayObject.display = RZdisplayObject.display.substring(0,RZdisplayObject.display.length-1);
	//-----------------------------
	return RZdisplayObject.display;
	//-----------------------------

	/*
	*	Return true if not displaying any more nested objects.
	*/
	function overLimit()
	{
		if (RZdisplayObject.quit || indent >= RZdisplayObject.OBJECT_LIMIT) return true;
		if (++RZdisplayObject.objectCount > RZdisplayObject.OBJECT_LIMIT)
		{
			if ( confirm(RZdisplayObject.OBJECT_LIMIT + ' objects expanded\n'
			   + 'Display ' + RZdisplayObject.OBJECT_LIMIT + ' more?'))
				RZdisplayObject.objectCount = 0;
			else
				RZdisplayObject.quit = true;
		}
		return false;
	}
	/*
	*	Return true if not displaying prototype functions or variables.
	*	type (optional: Function if checking for Function constructor
	*/
	function skipPrototype(type)
	{
		var status = false;
		/* was throwing exceptions (replaced with code below)
		if (!RZdisplayObject.SHOW_PROTOTYPE
		|| !obj[i].hasOwnProperty(obj))
			status = true;
		else
			status = false;
		*/

		//js error from RZupdateFieldList trace after RZclearlist(...)
		if (!RZdisplayObject.SHOW_PROTOTYPE
		&& obj && i && obj[i]
		&& obj[i].constructor
		&& obj[i].constructor.prototype)
		{
			if (type && type == Function
			&& obj[i].constructor.prototype.constructor == type)
				status = true;

			//else if (!type && obj[i].constructor.prototype == i)
			else if (!type
			&& (obj.constructor != Array || isNaN(i))	//added so array[0] displays
			&& obj[i].constructor.prototype == i)
				status = true;
		}
		return status;

		if (!RZdisplayObject.SHOW_PROTOTYPE
		|| !obj[i].hasOwnProperty(obj))
			status = true;
		else
			status = false;
	}
	/*
	*	determine non-object value
	*/
	function getValue(value)
	{
		var type = typeof(value);

		if (type === 'undefined')
			value = RZdisplayObject.MARKER + 'undefined' + RZdisplayObject.MARKER;

		else if (value === '')
			value = RZdisplayObject.MARKER + 'empty string' + RZdisplayObject.MARKER;

		else if (value === null)
			value = RZdisplayObject.MARKER + 'null' + RZdisplayObject.MARKER;

		else if (value === true)
			value = RZdisplayObject.MARKER + 'true' + RZdisplayObject.MARKER;

		else if (value === false)
			value = RZdisplayObject.MARKER + 'false' + RZdisplayObject.MARKER;

		else if (value.length > RZdisplayObject.MAXLINE)
			value = value.substr(0,RZdisplayObject.MAXLINE) + '...' + RZdisplayObject.EOL_MARKER;

		else
			value += RZdisplayObject.EOL_MARKER;

		if (RZdisplayObject.SHOW_TYPE && type !== 'undefined'
		&& value.indexOf(RZdisplayObject.MARKER + 'empty') != 0
		&& value.indexOf(RZdisplayObject.MARKER + 'null') != 0)
			value = '(' + type + '): ' + value;

		return value;
	}
}
/*-----------------------------------------------------------------------------
-----------------------------------------------------------------------------*/
function RZdisplayMessage(msg)
{
	if (!msg) msg = '';
	var el = document.getElementById('errorMessage');
	if (!el)
		el = document.getElementById('message');
	if (!el)
		el = document.getElementById('msg');

	if (el)
		el.innerHTML = msg == '' ? '&nbsp;' : msg;
	else if (msg)
		alert(msg);
	if (msg)
		return false;
	return true;
}
/*---------------------------------------------------------------------------
Load Color Picker.
----------------------------------------------------------------------------*/
function RZcolorpicker(field)
{
	RZ.colorfield = field;
	while (RZ.colorfield.tagName != 'INPUT')
	{
		RZ.colorfield = RZ.colorfield.previousSibling
		if (RZ.colorfield == null || typeof RZ.colorfield == 'undefined')
		{
			RZalert('Input field does not preceed Color Picker Icon')
			return false;
		}
	}
	features = 'width=320,height=160,scroll=auto,status=no,titlebar=no,resizable=yes';
	var x = (screen.availWidth - 320) / 2 - 10;
	var y = (screen.availHeight - 160) / 2 - 30;
	if (y < 50)
		y = 0;

	if(navigator.appVersion.indexOf('MSIE') == -1)  // Netscape
	{
		features += ',screenX=' + x.toString()
				 +  ',screenY=' + y.toString();
	}
	else                                            // IE browser
	{
		features += ',left=' + x.toString()
				 +  ',top=' + y.toString();
	}
	colorPicker = window.open('/revize/util/snippet_helper_colorpicker.html','',features);
	return true;
}
/*---------------------------------------------------------------------------
Spellcheck input or textarea field proceeding specified field.
----------------------------------------------------------------------------*/
function RZspellcheck(field)
{
	RZ.spellcheckfield = field;
	while (RZ.spellcheckfield.tagName != 'INPUT'
	&& RZ.spellcheckfield.tagName != 'TEXTAREA')
	{
		RZ.spellcheckfield = RZ.spellcheckfield.previousSibling
		if (RZ.spellcheckfield == null || typeof RZ.spellcheckfield == 'undefined')
		{
			RZalert('Input field does not preceed Spell Check Icon')
			return false;
		}
	}

	var sURL = "/revize/spellcheck/spellingchecker.html";

	features = 'width=490,height=400,scroll=auto,status=yes,resizable=yes,'
	         + 'titlebar=yes,menubar=no,location=no,'
	         + 'channelmode=0,directories=0,fullscreen=0,center=1'

	RZspellcheckwin = window.open(sURL,'_blank',features);
	return true;
}

/*-----------------------------------------------------------------------------
Replace webspace template embed keys
-----------------------------------------------------------------------------*/
RZ.mapsEmbedKey = "AIzaSyC5cMe92Yw3JgHrkvgIyHgdS2lTsH4C95k";
function RZcycleMapsKeys() {
	var oldMapsKey = "AIzaSyAOLPINIt8gtJpi00yqu4vHL9Ye6hhKDYI";
	var newMapsKey = RZ.mapsEmbedKey;
	document.querySelectorAll("iframe").forEach(function(ifr) {
		if (ifr.src.indexOf(oldMapsKey) > -1) { ifr.src = ifr.src.replaceAll(oldMapsKey, newMapsKey); }
	});
}

function RZaddNoOpenerToBlankLinks() {
	document.querySelectorAll("a[target=_blank]:not([rel*=noopener]),a[target=_new]:not([rel*=noopener])").forEach(function(linkElement) {
		linkElement.setAttribute('rel', 'noopener');
	});
}

document.addEventListener('DOMContentLoaded', function() {
	RZcycleMapsKeys();
	RZaddNoOpenerToBlankLinks();
});

/*-----------------------------------------------------------------------------
Indicate script loaded for RZloadjscss()
-----------------------------------------------------------------------------*/
if (RZ.scriptLoaded)
	RZ.scriptLoaded.snippet_helper = true;
/************************* End of snippet_helper.js *************************/
