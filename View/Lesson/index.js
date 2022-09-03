$(document).ready(function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const lessonID = urlParams.get('lessonID');

    const windowID = generateUniqueId();

    // 先拿 user 資料
    $.ajax({
        type: 'POST',
        url: `../../API/getUser.php`,
        dataType: 'json',
        success: function (res) {
            console.log(res);
            if (res.user_status == 1) {
                // 進入頁面
                sendActionLog({ actionCode: `enterPage-Lesson-${lessonID}`, windowID: windowID });

                // 離開頁面
                window.addEventListener('beforeunload', function (e) {
                    sendActionLog({
                        actionCode: `closePage-Lesson-${lessonID}`,
                        windowID: windowID,
                    });
                });

                // 顯示麵包屑
                displayCourseBreadcrumb({ lessonID });

                // 側邊欄
                const { isTeacher, enrollClass }  = checkUserIdentity(res.data);

                if (isTeacher) {
                    addMenuClass({ enrollClass });
                }
                
                activeSideMenu({
                    id: 'navMap',
                    type: 'main',
                    identity: isTeacher ? 'teacher' : 'student',
                    windowID: windowID,
                });

                const lessonContentData = {
                    lessonID,
                    studentID: res.data.id,
                    windowID: windowID,
                };

                getLessonContentData(lessonContentData);
            } else {
                setPopMsg({ msg: '未登入，三秒後自動跳轉' });
                setTimeout(function () {
                    window.location.href = '../Login';
                }, 3000);
            }
        },
    });

    function getLessonContentData(props) {
        const { lessonID, studentID, windowID } = props;
        $.ajax({
            type: 'POST',
            url: `../../API/getAllLessonContentDataByLessonID.php`,
            data: {
                lessonID: lessonID,
                studentID: studentID,
            },
            dataType: 'json',
            success: function (lessonContent) {
                console.log('getLessonData', lessonContent);

                $('#loader').fadeOut(800);
                // 塞課程內容
                lessonContentModel({
                    data: lessonContent.data,
                    field: $('#lessonContent'),
                    windowID: windowID,
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getLessonData Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }
});
