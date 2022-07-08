$(document).ready(function () {
    // setTimeout(function () {
    //     $('#loader').fadeOut(800);
    // }, 2000);


    // 處理側邊欄
    activeSideMenu({ id: 'navTopicManage', type: 'main' });



    // $.ajax({
    //     type: 'POST',
    //     url: `../../API/getLessonData.php`,
    //     data: {
    //         lessonID: 1,
    //         studentID: 1,
    //     },
    //     dataType: 'json',
    //     success: function (lessonContent) {
    //         console.log('getLessonData', lessonContent);
    //         // 塞課程內容
    //         lessonContentModel(lessonContent.data, $('#lessonContent'));
    //     },
    //     error: function (jqXHR, textStatus, errorThrown) {
    //         console.log('getLessonData Fail', jqXHR, textStatus, errorThrown);
    //     },
    // });
});
