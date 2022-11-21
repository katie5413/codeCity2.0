function setPopMsg({ msg, targetAction }) {
    $('.pop').addClass('active');

    $('.pop.active .middle').text(msg);

    if (targetAction) {
        $('.pop').attr('target-action', targetAction);
    }

    fixBackgroundScrollY();

    $('.pop .close-pop').on('click', function () {
        $('.pop').removeClass('active');
        unfixBackgroundScrollY();
    });
}
