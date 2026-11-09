/**
 * Busines Directory Scripts
 * Rvize LLC
 * September 2017
 * Alec Armstrong
 */

(function($){
    
var useBlocks = $('#rz-business-directory').hasClass('rz-block-list');
$('#rz-business-categories li a').on('click',function(e){
    e.preventDefault();
    var selectedCats = [];
    if(useBlocks){
        if(!$(this).hasClass('rz-selected-business-category')){
            $('#rz-business-categories li a').removeClass('rz-selected-business-category');
        }
    }
    $(this).toggleClass('rz-selected-business-category')
        .promise().done(function(){
            $('.rz-selected-business-category').each(function(){
                selectedCats.push($(this).text().toUpperCase());
            });
            
            if(useBlocks){
                searchBlocks(selectedCats);
            } else {
                searchCards(selectedCats);
            }
        });
});

$('input[name="business-search"]').on("change keyup paste click", function(){
    var searchVal = $(this).val();
    if(useBlocks){
        searchBlocks(searchVal);
    } else {
        searchCards(searchVal);
    }
});

$('input[name="business-search"]').on("keypress", function(e){
    if(e.keycode == '13'){
        e.preventDefault(); 
    }
});

function searchCards(searchTerms){
    var cardCats, card, cardTitle;
    var cards = $('.rz-business-card');

    var hideLetter = function(row){
        $('#rz-business-list .row').each(function(){
            if($(this).outerHeight() < 300){
                $(this).prev('.letter-label').slideUp();
            } else {
                $(this).prev('.letter-label').slideDown();
            }
        });
    };

    var hideCard = function(target){
        target.css({
            'max-height' : '0px',
            'padding-bottom' : '0px',
            'margin-bottom' : '0px'
        });
    };// end hideCard()

    cards.css({
        'max-height' : '395px',
        'padding-bottom' : '2px',
        'margin-bottom' : '30px'
    });

    cards.each(function(){
        card = $(this);
        cardCats = card.find('.category-list>li').text().toUpperCase();

        if(typeof(searchTerms) === 'object'){
            for(var i = 0; i < searchTerms.length; i++){
                if( cardCats.indexOf(searchTerms[i]) < 0){
                    hideCard(card);
                }// end if
            }// end for loop
        } else if(typeof(searchTerms) === 'string'){
            if(card.find('h2').text().toUpperCase().indexOf(searchTerms.toUpperCase()) < 0){
                hideCard(card);
            }
        }
    }).promise().done(function(){
        setTimeout(hideLetter,400);
    });// end each loop
}///////////////////////// Search Cards


function searchBlocks(searchTerms){
    var block, blockTitle, cat;
    var blocks = $('.rz-business-block');
    
    if(searchTerms.length === 0){
        clearBlocks();
        return;
    }

    var hideBlock = function(target){
        // target.css({
        //     'max-height' : '0px',
        //     'margin-bottom': '0px',
        //     'padding-top':'0px',
        //     'padding-bottom':'0px',
        //     'border-bottom':'0'
        // });
        target.hide();
    };// end hideBlock()
    
    $('.letter-label').slideUp();

    // blocks.css({
    //     'max-height' : '800px',
    //     'padding-bottom':'30px',
    //     'padding-top':'20px',
    //     'margin-bottom':'10px',
    //     'border-bottom':'1px solid rgba(0, 0, 0, 0.2)'
    // });
    blocks.show();
    blocks.each(function(){
        block = $(this);
        cat = block.find('.category-list>li').text().toUpperCase();

        if(typeof(searchTerms) === 'object'){
            if( cat !== searchTerms[0]){
                hideBlock(block);
            }// end if
        } else if(typeof(searchTerms) === 'string'){
            if(block.find('h2').text().toUpperCase().indexOf(searchTerms.toUpperCase()) < 0){
                hideBlock(block);
            }
        }
    });
}///////////////////////// Search Blocks


function clearBlocks(){
    $('.letter-label').each(function(){
        if($(this).is(':hidden')){
            $(this).slideDown();
        }
    });// end loop

    $('.rz-selected-business-category').removeClass('rz-selected-business-category');
    // $('.rz-business-block').css({
    //     'max-height' : '800px',
    //     'padding-bottom':'30px',
    //     'padding-top':'20px',
    //     'margin-bottom':'10px',
    //     'border-bottom':'1px solid rgba(0, 0, 0, 0.2)'
    // });
    $('.rz-business-block').show();
}///////////////////////// Clear Blocks

fontAwesomeVersion = $('.fa, .fas').css('font-family').indexOf('Font Awesome 5') > -1 ? "fa5" : "fa4";
if( fontAwesomeVersion === "fa4" ) {
    $('.fas.fa-trash').addClass('fa').removeClass('fas');
    $('.fas.fa-pencil-alt').addClass('fa').addClass('fa-pencil').removeClass('fas').removeClass('fa-pencil-alt');
}

})(jQuery);