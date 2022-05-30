/**
 * Set field input type message.
 *
 * @param {(string | JQuery | HTMLElement)} field - field going to set error.
 * Type of field can be string (field id), jquery element or html element.
 *
 * @param {string} msg - message
 *
 */
function setFieldFeedback(field, msg, type) {
    switch (type) {
        case 'error': {
            let $field = transformToJQuery(field);
            $field.attr('data-feedback', true);
            $field.find('.feedbackMsg').addClass('errorMsg').removeClass('successMsg');
            $field.find('.feedbackMsg .text').text(msg);
            break;
        }
        case 'success': {
            let $field = transformToJQuery(field);
            $field.attr('data-feedback', true);
            $field.find('.feedbackMsg').addClass('successMsg').removeClass('errorMsg');
            $field.find('.feedbackMsg .text').text(msg);
            break;
        }
    }

    console.log('setFeedBack');
}
function activeFeedBack() {
    setFieldFeedback();
    clearFieldFeedback();
}

/**
 * Clear all type message on given field.
 *
 * @param {(string | JQuery | HTMLElement)} field - Field going to clear.
 * Type of field can be string (field id), jquery element or html element.
 */
function clearFieldFeedback(field) {
    if (field) {
        let $field = transformToJQuery(field);
        if ($field.attr('data-feedback') == 'true') {
            $field.attr('data-feedback', false);
            $field.find('.feedbackMsg').removeClass('successMsg').removeClass('errorMsg');
            $field.find('.feedbackMsg .text').text('');
        }
    }
    console.log('clearFeedBack');
}
