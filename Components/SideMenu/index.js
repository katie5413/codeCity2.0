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

function addSideMenuSubPage({ targetID, subPage = [] }) {
    const targetElem = document.getElementById(targetID);
    let newElm = document.createElement('ul');
    subPage.forEach(function (page) {
        newElm.append(generateNavItem({ id: page.id, link: page.link, name: page.name }));
    });
    targetElem.append(newElm);
}

function activeSideMenu({ id, type }) {
    const targetElem = document.getElementById(id);
    const navOldActive = document.querySelector('nav li.active');

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
}

document.getElementById('navLogOut').addEventListener('click', function () {
    logout();
});

function logout() {
    $.ajax({
        type: 'GET',
        url: `../../API/logout.php`,
        success: function () {
            window.location.href = '../../View/Login';
        },
    });
}
