/*********************************************************

Document Center

Alec Armstrong

2017

Revize.com

*********************************************************/


(function($){
	$(document).ready(function(){


		if($('.doc-center-counter').length){
			var docCount = 0;
			var docMsg = "";
			$('.doc-center-counter').each(function(){
				docCount = $(this).parent().parent().find('.file-group>li').length;

				if(docCount < 1) docMsg = "No documents";
				else if(docCount == 1)docMsg = "1 document";
				else docMsg = docCount + " documents";
				$(this).text(docMsg);
			});
		} else {
			$('h3.docs-toggle').each(function(){
			    $(this).find('small').text(countDocuments($(this).siblings('.inner-cat-wrap').find('li').length));
			});

			$('h4.docs-toggle').each(function(){
			    $(this).find('small').text(countDocuments($(this).siblings('.file-group').find('li').length));
			});
		}

   // RZ Class
	if(typeof RZ !== "undefined"){
	    if(RZ.login){
	     $('body').addClass("user-logged-in");
	    } else{
	        $('body').addClass("user-not-logged-in");
	    }
      }
	  });
    var innerCatWrap = $('.inner-cat-wrap');
    var hash = location.hash.length > 0 ? location.hash.replace('#','') : undefined;
    var oldSearch = '';

    if (hash == undefined)
    {
        hash = '';
    } else {
        var outerHashClass, innerHashClass;
        innerHashClass = hash.indexOf('sub') >= 0 ? '.' + hash.substr(hash.indexOf('sub')) : '';
        outerHashClass = hash.indexOf('sub') >= 0 ? '.' + hash.substr(0,hash.indexOf('sub')) : '.' + hash;

        rzDocToggleOuter($(outerHashClass));
        if(outerHashClass.length){
            rzDocToggleInner($(innerHashClass));
        }
    }


    if($('body').hasClass('user-logged-in')){
        $('.docs-toggle>small').css('margin-right','71px');
    }

    var startingPos = $(document).scrollTop();
    $(document).scroll(function(){
        startingPos = $(document).scrollTop();
    });

    $('h3.docs-toggle').on('click',function(){
        rzDocToggleOuter($(this));
        hash = $(this).prev('.rz-doc-center-hash').attr('name');
        location.hash = hash;
        $(document).scrollTop(startingPos);
    });

    $('h4.docs-toggle').on('click',function(){
        rzDocToggleInner($(this));
        if(hash.indexOf('sub')>= 0){
            hash = hash.substr(0,hash.indexOf('sub'));
        }
        hash += $(this).prev('.rz-doc-center-sub-hash').attr('name');
        location.hash = hash;
    });


    // Press Enter
    $('#file-search').on("keypress", function(e){
        if(e.keycode == '13'){
            searchUpdate();
        }
    });// Enter

    $('.rz-doc-search-reset').on('click',function(){
        $('#file-search').val('');
        $('#categorties-wrap').slideDown();
        $('.search-results').slideUp(function(){
            $(this).remove();
        });
        $('.rz-doc-search-reset').slideUp();
        oldSearch = '';
    });


    $('.rz-doc-search-submit').on('click',function(e){
        e.preventDefault();
        searchUpdate();
    });

    function searchUpdate(){
        var searchValue = $('#file-search').val().toUpperCase();

        if(searchValue.length > 0 && searchValue !== oldSearch){
            searchDocuments(searchValue);
        }

        oldSearch = searchValue;
    }


    // toggle outer
    function rzDocToggleOuter(el){
        var thisInnerCatWrap = el.parent().find('.inner-cat-wrap');
        $('.inner-cat-wrap').not(el).stop().slideUp(300);
        flipArrows(el);

        $('.inner-cat').find('.file-group').stop().slideUp(300);
        thisInnerCatWrap.stop().slideToggle(300,function(){
            $('.inner-cat-wrap').each(function(){
                fixSlideToggles($(this));
            });
        });
    }/////////////////////////////////////////////////////////////// toggle outer


    // toggle inner
    function rzDocToggleInner(el){
        flipArrows(el);
        $('.inner-cat .file-group').not(el).stop().slideUp(300);
        var thisFileGroup = el.parent().find('.file-group');
        thisFileGroup.stop().slideToggle(300,function(){
            $('.inner-cat .file-group').each(function(){
                fixSlideToggles($(this));
            });
        });
    }/////////////////////////////////////////////////////////////// toggle inner


    // fix toggles
    function fixSlideToggles(el){
        if(el.css('display') === 'none'){
            el.attr('style','');
            el.parent().find('.fa').removeClass('toggled-open');
        }
    }//////////////////////////////////////////////////////////////// fix toggles

    function flipArrows(el){
        if(el.hasClass('inner-cat-wrap')){
            setTimeout(function(){
                el.parent().find('.docs-toggle').first().find('.fa').addClass('toggled-open');
            },100);
        } else if(el.hasClass('file-group')){
            setTimeout(function(){
                el.prev().prev().find('.fa').addClass('toggled-open');
            },200);
        } else {
            if((el).is('h3')){
                $('h3.docs-toggle').not(el).find('.fa').removeClass('toggled-open');
            } else {
                $('h4.docs-toggle').not(el).find('.fa').removeClass('toggled-open');
            }
            el.find('.fa').toggleClass('toggled-open');
        }
    }


    // search
    function searchDocuments(searchValue){
        var fileText = '';
        var $fileGroup = $('<ul>',{'class':'file-group search-results'});
        $fileGroup.empty();
        $('.search-results').remove();
        $('.file-group a').each(function(i,el){
            fileText = $(el).text().toUpperCase();

            if(fileText.indexOf(searchValue) >= 0){
                $fileGroup.append($(el).parent().clone());
            } else {
                var $desc = $(el).parent().children(".doc-file-desc");
                if ($desc.length > 0) {
					fileText = $desc.text().toUpperCase();
					if(fileText.indexOf(searchValue) >= 0){
						$fileGroup.append($(el).parent().clone());
					}
				}
			}
        }).promise().then(function(){
            if(!$($fileGroup).find('li').length){
                var messageNode = document.createElement('li');
                messageNode.className = 'text-danger';
                messageNode.innerText = "No results found for: " + searchValue;
                $fileGroup.append(messageNode);
            }
            $('#document-center').append($fileGroup);
            $('#categorties-wrap').slideUp();
            $('.search-results').slideDown();
            $('.rz-doc-search-reset').slideDown();
        });// end loop & promise


    }//////////////////////////////////////////////////////////////// search

	 function countDocuments(num){
		 if(num != 1){
			 return num + ' documents';
		 } else {
			 return num + ' document';
		 }
	 }


})(jQuery);
