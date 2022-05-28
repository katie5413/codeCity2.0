/**
 * Generate html content with given template and arguments.
 *
 * @param {string} htmlTemplate - html template with variable wrapped with {{  }}
 * @param {object} args - arguments to be passed to the template
 * @returns {string} - html content
 *
 * @example
 * generateHtml(
 *      '<div>{{ v1 }} {{ v2 }} {{ v3 }}</div>',
 *      {v1: 'value1', v2: 'value2', v3: 'value3'}
 * )
 * // return '<div>value1 value2 value3</div>'
 */
function generateHtml(htmlTemplate, args) {
    return htmlTemplate.replace(/{{(.*?)}}/g, (m, g1) => args[g1.trim()] || m);
}

/**
 * Generate unique id.
 *
 * @returns {string} - unique id
 *
 */
function generateUniqueId() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

/**
 * Transfrom given element to jquery element.
 * Given element support element id (string), HTMLElement or JQueryElement.
 *
 * @param {(string | JQuery | HTMLElement)} element - element going to transform.
 *
 * @returns {JQuery} - transformed jquery element.
 *
 */
function transformToJQuery(element) {
    var $el;

    if (typeof element === 'string') {
        $el = $(`#${element}`);
    } else if (element instanceof jQuery) {
        $el = element;
    } else if (element instanceof HTMLElement) {
        $el = $(element);
    }

    return $el;
}
