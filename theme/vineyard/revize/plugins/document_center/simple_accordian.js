//DCO 04-25-2015: not used by subcat include
function showSection(section) {
	
	if(typeof(openSection) == "undefined"){ openSection = ''; }
	
	// alert("openSection: "+openSection+" - section: "+section);
	
	//Close section if clicking on an open heading
	if(section == openSection){	
		var openElements = getElementsByClass(document,section,'*');
		var totalElements = openElements.length;	
		count = 0;
		//close each item, one at a time, with a slight delay (animate)
		intervalID = window.setInterval('closeAnimate(\''+section+'\', \''+totalElements+'\')', 15);	
		openSection = '';
		return;
	}
	
	//Close any open sections
	if(openSection != ''){
		var visibleSection = getElementsByClass(document,openSection,'*');
		var visibleElements = visibleSection.length;
		for(i=0; i < visibleElements; i++){
			visibleSection[i].style.display = 'none'; 
		}		
		openSection = '';
	}
	
	//Open selected section
	if(openSection == '' && openSection != section){	
		var openElements = getElementsByClass(document,section,'*');	
		var totalElements = openElements.length;
		// alert(section);
		count = 0;
		//Open each item, one at a time, with a slight delay (animate)
		intervalID = window.setInterval('openAnimate(\''+section+'\', \''+totalElements+'\')', 15);
		openSection = section;	
		return;
	}
}

function openAnimate(sec, total){
	if(count >= total){
	   window.clearInterval(intervalID);
	} else {
		var openElements = getElementsByClass(document,sec,'*');			
		var openElement = openElements[count];		
		openElement.style.display = 'inline';
		count = count + 1;
	}
}

function closeAnimate(sec, total){
	if(count >= total){
	   window.clearInterval(intervalID);
	} else {
		var openElements = getElementsByClass(document,sec,'*');			
		var openElement = openElements[count];		
		openElement.style.display = 'none';
		count = count + 1;
	}
}

function getElementsByClass(node,searchClass,tag) {
	var classElements = new Array();
	var els = node.getElementsByTagName(tag); // use "*" for all elements
	var elsLen = els.length;
	var pattern = new RegExp("\\b"+searchClass+"\\b");
	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
 			classElements[j] = els[i];
			 j++;
		}
	}
	return classElements;
}