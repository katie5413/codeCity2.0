function openModal({ targetModal, modalTitle, actionType }) {
    targetModal.addClass('active');

    if (modalTitle) {
        targetModal.find('.content .top .title').text(modalTitle);
    }

    if (actionType) {
        targetModal.attr('action-type', actionType);
    }

    targetModal.find('.mustFill input').on('click', function () {
        clearFieldFeedback(targetModal);
    });
}

function closeModal() {
    $('.modal').removeClass('active');

    // 一般 input
    $('.modal').find('input').val('');

    // dropBox
    $('.modal').find('label.active').removeClass('active');
    $('.modal').find('input').attr('select-id', '');

    // textarea
    $('.modal').find('textarea').val('');

    // feedback msg
    clearFieldFeedback($('.modal'));
}

$('.modalCancel').on('click', function () {
    closeModal();
});
