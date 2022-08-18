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
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('getTopicLessonName Fail', jqXHR, textStatus, errorThrown);
        },
    });

    // 動態顯示單元內容
    const pageData = {
        title: '單元標題',
    };

    $('#pageTitle').text(pageData.title);

    // 處理側邊欄

    addSideMenuSubPage({
        targetID: 'navTopicMap',
        subPage: [{ id: 'lessonID', name: pageData.title, link: '#' }],
    });

    activeSideMenu({ id: 'lessonID', type: 'sub' });

    // 側邊欄 END

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
