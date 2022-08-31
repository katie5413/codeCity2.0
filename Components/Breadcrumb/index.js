function activeBreadcrumb(props) {
    const { breadcrumbItem } = props;

    $('#breadcrumb').children().remove();

    breadcrumbItem.forEach((item) => {
        $('#breadcrumb').append(generateBreadcrumbItem({ link: item.link, name: item.name }));
    });
}

function generateBreadcrumbItem({ link, name }) {
    /*
    <div class="item">
        <a href="{{link}}">{{name}}</a>
        <img src="../../Images/icon/direction/arrow-right.svg" />
    </div>
    */
    let newElm = document.createElement('div');
    newElm.classList.add('item');

    let newLink = document.createElement('a');
    newLink.href = link;
    newLink.append(document.createTextNode(name));

    newElm.appendChild(newLink);

    let arrowImg = document.createElement('img');
    arrowImg.src = '../../Images/icon/direction/arrow-right.svg';

    newElm.appendChild(arrowImg);

    return newElm;
}

function displayCourseBreadcrumb(props) {
    // 只會有一個或是都沒有
    const { topicID, lessonID, isMap } = props;

    let breadcrumbItem = [{ link: '../Map', name: '地圖' }];

    if (isMap) {
        // Map only
        activeBreadcrumb({ breadcrumbItem });
    } else if (lessonID) {
        $.ajax({
            type: 'POST',
            url: `../../API/getTopicLessonNameByLessonID.php`,
            data: {
                lessonID: lessonID,
            },
            dataType: 'json',
            success: function (res) {
                console.log('getTopicLessonName', res);

                breadcrumbItem.push({
                    link: `../Topic/?topicID=${res.data.topicID}`,
                    name: res.data.topicName,
                });
                breadcrumbItem.push({
                    link: `../Lesson/?lessonID=${res.data.lessonID}`,
                    name: res.data.lessonName,
                });

                activeBreadcrumb({ breadcrumbItem });

                // 單元標題
                $('#pageTitle').text(res.data.lessonName);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getTopicLessonName Fail', jqXHR, textStatus, errorThrown);
            },
        });
    } else if (topicID) {
        $.ajax({
            type: 'POST',
            url: `../../API/getTopicNameByTopicID.php`,
            data: {
                topicID: topicID,
            },
            dataType: 'json',
            success: function (res) {
                console.log('getTopicName', res);

                breadcrumbItem.push({
                    link: `../Topic/?topicID=${res.data.topicID}`,
                    name: res.data.topicName,
                });

                activeBreadcrumb({ breadcrumbItem });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getTopicName Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }
}
