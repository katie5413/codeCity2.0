function generateNavItem({ id, link, name }) {
    /*
    <li id="{{id}}">
        <a href="{{link}}">{{name}}</a>
    </li>
    */
    let newElm = document.createElement('li');
    newElm.id = id;

    let newLink = document.createElement('a');
    newLink.href = link;
    newLink.append(document.createTextNode(name));

    newElm.appendChild(newLink);

    return newElm;
}

// 班級管理（子選項）
function addSideMenuSubPage({ targetID, subPage = [] }) {
    const targetElem = document.getElementById(targetID);
    let newElm = document.createElement('ul');
    subPage.forEach(function (page) {
        newElm.append(generateNavItem({ id: page.id, link: page.link, name: page.name }));
    });
    targetElem.append(newElm);

    // // 重新註冊
    // $(`#${targetID} a`).on('click', function (e) {
    //     let target = $(this).closest('li').attr('id').slice(3);
    //     console.log(target);
    //     sendActionLog({ actionCode: `nav-goTo-${target}`, windowID: windowID });
    // });
}

function activeSideMenu({ id, type, identity, windowID }) {
    const targetElem = document.getElementById(id);
    const navOldActive = document.querySelector('nav li.active');

    switch (identity) {
        case 'teacher':
            $('#navClassManage').removeClass('hide');
            $('#navCourseManage').removeClass('hide');
            break;
        default:
            $('#navClassManage').remove();
            $('#navCourseManage').remove();
            break;
    }

    switch (type) {
        case 'main':
            navOldActive.classList.remove('active');
            targetElem.classList.add('active');
            break;
        case 'sub':
            navOldActive.classList.remove('active');
            targetElem.classList.add('active');
            targetElem.parentElement.parentElement.classList.add('active');
            break;
    }

    $('nav a').on('click', function (e) {
        let target = $(this).closest('li').attr('id').slice(3);
        console.log(target);
        sendActionLog({ actionCode: `nav-goTo-${target}`, windowID: windowID });
    });

    document.getElementById('navLogOut').addEventListener('click', function () {
        sendActionLog({ actionCode: 'logout', windowID: windowID });
        logout();
    });
}

function logout() {
    $.ajax({
        type: 'GET',
        url: `../../API/logout.php`,
        success: function () {
            sessionStorage.removeItem('classID');
            window.location.href = '../../View/Login';
        },
    });
}
