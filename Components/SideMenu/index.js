function activeSideMenu(props) {
    if (props.currentPage) {
    }

    switch (props.currentPage) {
        case 'navLesson' || 'navTopic':
            $(`#navTopicMap`).addClass('active');

            const navSubItemTemplate = `<ul>
            <li id="{{navType}}">
                <a href="{{link}}">{{name}}</a>
            </li>
        </ul>`;

            function generateNavItem(props) {
                return generateHtml(navSubItemTemplate, {
                    ...props,
                });
            }

            $(`#navTopicMap`).append(
                generateNavItem({ navType: props.currentPage, link: props.link, name: props.name }),
            );
    }

    $(`#${props.currentPage}`).addClass('active');
}
