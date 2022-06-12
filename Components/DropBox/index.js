$(document).on('click', '.dropBox', function(){
    $(this).toggleClass('active');

    var search = $(this).find('input.selectSelected[type="text"]').val();
    if (search.trim() != '') {
        $(this).find('.selectItems').children().each(function () {
            if ($(this).text().toLowerCase().indexOf(search.toLowerCase()) == -1) {
                $(this).hide();
            } else {
                $(this).show();
            }
        })
    } else { 
        $(this).find('.selectItems').children().each(function () {
            $(this).show();
        })
        $(this).find('.selectSelected').attr("select-id", '');
    }
})

$(document).on('click', '.dropBox .option', function(){
    $(this).parent().siblings('.selectSelected').val($(this).text());
    $(this).parent().siblings('.selectSelected').attr("select-id", $(this).attr('value'));
})

$(document).on('click', '.dropBox .drop__clear', function (e) {
    e.stopPropagation();
    $(this).parent().find('input.selectSelected[type="text"]').val('');
    $(this).parent().find('.selectItems').children().each(function () {
        $(this).show();
    })
    $(this).parent().find('.selectSelected').attr("select-id", '');
})

$(document).on('focus change paste keyup', '.dropBox input.selectSelected[type="text"]', function() {
    var search = $(this).val();
    if (search.trim() != '') {
        $(this).siblings('.selectItems').children().each(function () {
            if ($(this).text().toLowerCase().indexOf(search.toLowerCase()) == -1) {
                $(this).hide();
            } else {
                $(this).show();
            }
        })
    } else { 
        $(this).siblings('.selectItems').children().each(function () {
            $(this).show();
        })
        $(this).attr("select-id", '');
    }
});

$(document).on('click', function(e) {
    if($('.dropBox') !== e.target && !$('.dropBox').has(e.target).length){
        $('.dropBox').removeClass('active');
    }  
});