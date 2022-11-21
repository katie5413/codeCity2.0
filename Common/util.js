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

function checkUserIdentity(props) {
    const { userClass } = props;

    const userClassData = userClass;

    let enrollClass = [];
    let applyClass = [];
    let isTeacher = false;

    // 檢查登記班級是否有可成功加入
    for (let i = 0; i < userClassData.length; i++) {
        if (userClassData[i].identity == 1) {
            isTeacher = true;
        }
        if (userClassData[i].enrollTime != null) {
            enrollClass.push({
                classID: userClassData[i].classID,
                className: userClassData[i].className,
                classCode: userClassData[i].classCode,
            });
        }
    }

    return { isTeacher, enrollClass };
}

function addMenuManageClass(props) {
    const { enrollClass } = props;
    // { id: page.id, link: page.link, name: page.name }
    let subPage = [];
    enrollClass.forEach((item) => {
        subPage.push({
            id: `class-${item.classCode}`,
            link: `../../View/ClassManage/?classCode=${item.classCode}`,
            name: item.className,
        });
    });

    addSideMenuSubPage({ targetID: `navClassManage`, subPage });
}

function addMenuRankClass(props) {
    const { enrollClass } = props;
    // { id: page.id, link: page.link, name: page.name }
    let subPage = [];
    enrollClass.forEach((item) => {
        subPage.push({
            id: `class-${item.classCode}`,
            link: `../../View/Rank/?classCode=${item.classCode}`,
            name: item.className,
        });
    });

    addSideMenuSubPage({ targetID: `navRank`, subPage });
}

function addMenuNewsClass(props) {
    const { enrollClass } = props;
    // { id: page.id, link: page.link, name: page.name }
    let subPage = [];
    enrollClass.forEach((item) => {
        subPage.push({
            id: `class-${item.classCode}`,
            link: `../../View/News/?classCode=${item.classCode}`,
            name: item.className,
        });
    });

    addSideMenuSubPage({ targetID: `navNews`, subPage });
}

function sendActionLog(props) {
    const { actionCode, windowID, point } = props;

    // 先拿 user 資料
    $.ajax({
        type: 'POST',
        url: `../../API/addActionLog.php`,
        dataType: 'json',
        data: {
            actionCode: actionCode,
            windowID: windowID.slice(0, 8),
            point: point,
        },
        success: function (res) {
            console.log('sendActionLog', res.data);
        },
    });
}

function fixBackgroundScrollY() {
    if (!document.body.classList.contains('no-scroll')) {
        document.body.style.top = `-${window.pageYOffset}px`;
        document.body.classList.add('no-scroll');
    }
}

function unfixBackgroundScrollY() {
    const classNameArray = document.body.classList.value.split(' ');
    const newClassName = classNameArray.filter((item) => item !== 'no-scroll').join(' ');
    document.body.classList = newClassName;

    const matchesTop = document.body.style.top.match(/\d+/g);
    document.body.style.top = 'unset';
    if (matchesTop !== null && matchesTop.length > 0) {
        window.scrollTo(0, parseInt(matchesTop[0], 10));
    }
}
