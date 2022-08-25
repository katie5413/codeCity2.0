$(document).ready(function () {
    // setTimeout(function () {
    //     $('#loader').fadeOut(800);
    // }, 2000);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const lessonID = urlParams.get('lessonID');

    $.ajax({
        type: 'POST',
        url: `../../API/getTopicLessonNameByLessonID.php`,
        data: {
            lessonID: lessonID,
        },
        dataType: 'json',
        success: function (res) {
            console.log('getTopicLessonName', res);
            updateSideMenuTopicName(res.data);


            // 單元標題
            $('#pageTitle').text(res.data.lessonName);

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('getTopicLessonName Fail', jqXHR, textStatus, errorThrown);
        },
    });

    function updateSideMenuTopicName(data) {
        const { topicID, topicName } = data;

        // 處理側邊欄

        addSideMenuSubPage({
            targetID: 'navTopicMap',
            subPage: [
                { id: `topicID-${topicID}`, name: topicName, link: `../Topic/?topicID=${topicID}` },
            ],
        });

        activeSideMenu({ id: `topicID-${topicID}`, type: 'sub' });

        // 側邊欄 END
    }

    $.ajax({
        type: 'POST',
        url: `../../API/getLessonContentData.php`,
        data: {
            lessonID: lessonID,
            studentID: 10,
            // TODO: fix studentID
        },
        dataType: 'json',
        success: function (lessonContent) {
            console.log('getLessonData', lessonContent);

            // 塞課程內容
            lessonContentModel(lessonContent.data, $('#lessonContent'));
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('getLessonData Fail', jqXHR, textStatus, errorThrown);
        },
    });
});
