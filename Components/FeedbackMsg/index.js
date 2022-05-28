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
            $field.attr('data-error', true);
            $field.find('.errorMsg').addClass('active');
            $field.find('.errorMsg .text').text(msg);
            break;
        }
    }
}

/**
 * Clear all type message on given field.
 *
 * @param {(string | JQuery | HTMLElement)} field - Field going to clear.
 * Type of field can be string (field id), jquery element or html element.
 */
function clearFieldFeedback(field, type) {
    switch (type) {
        case 'error': {
            let $field = transformToJQuery(field);
            $field.find('[data-error]').attr('data-error', false);
            if ($field.attr('data-error')) {
                $field.attr('data-error', false);
            }
            $field.find('.errorMsg').removeClass('active');
            $field.find('.errorMsg .text').text('');
            break;
        }
    }
}
