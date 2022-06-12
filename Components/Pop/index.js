function setPopMsg(msg) {
    $('.pop').addClass('active');

    $('.pop.active .middle').text(msg);

    $('.pop .close-pop').on('click', function () {
        $('.pop').removeClass('active');
    });
}
