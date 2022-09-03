$(document).ready(function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const topicID = urlParams.get('topicID');

    const windowID = generateUniqueId();

    // 先拿 user 資料
    $.ajax({
        type: 'POST',
        url: `../../API/getUser.php`,
        dataType: 'json',
        success: function (res) {
            console.log(res);

            if (res.user_status == 1) {
                // 先拿課程資料
                getLessonData(topicID);

                // 進入頁面
                sendActionLog({ actionCode: `enterPage-Topic-${topicID}`, windowID: windowID });

                // 離開頁面
                window.addEventListener('beforeunload', function (e) {
                    sendActionLog({ actionCode: `closePage-Topic-${topicID}`, windowID: windowID });
                });

                // 顯示麵包屑
                displayCourseBreadcrumb({ topicID });

                // 側邊欄
                const { isTeacher, enrollClass } = checkUserIdentity(res.data);

                if (isTeacher) {
                    addMenuClass({ enrollClass });
                }

                activeSideMenu({
                    id: 'navMap',
                    type: 'main',
                    identity: isTeacher ? 'teacher' : 'student',
                    windowID: windowID,
                });
            } else {
                setPopMsg({ msg: '未登入，三秒後自動跳轉' });
                setTimeout(function () {
                    window.location.href = '../Login';
                }, 3000);
            }
        },
    });

    function getLessonData(topicID) {
        $.ajax({
            type: 'POST',
            url: `../../API/getLessonData.php`,
            data: {
                topic_ID: topicID,
            },
            dataType: 'json',
            success: function (res) {
                // 塞表格內容
                let lessonData = res.data;

                console.log(lessonData);
                $('#loader').fadeOut(800);
                activeLessonTable(lessonData);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getTopicData Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    function activeLessonTable(lessonData) {
        $('#lessonTable tbody tr').remove();

        for (let i = 0; i < lessonData.length; i++) {
            $('#lessonTable tbody').append(
                generateLessonDataTr({
                    index: i + 1,
                    id: lessonData[i].id,
                    name: lessonData[i].name,
                    description:
                        lessonData[i].description.length > 0 ? lessonData[i].description : ' ',
                }),
            );
        }

        // init lessonTable
        initLessonTable();
    }

    function initLessonTable() {
        // table 1 library init
        lessonTable = $('#lessonTable').DataTable({
            scrollResize: true,
            scrollY: 100,
            scrollCollapse: true,
            scrollX: true,
            paging: false,
            searching: false,
            language: {
                lengthMenu: '',
                zeroRecords: '沒有資料',
                info: '',
                infoEmpty: '沒有資料',
                search: '<img src="../../Images/icon/general/search.svg">',
                searchPlaceholder: '篩選',
            },
            columnDefs: [
                { width: '5%', targets: 0 },
                { width: '15%', targets: 1 },
            ],
        });

        $('#lessonTable .classLink').on('click', function () {
            const lessonID = $(this).closest('tr').attr('data-lesson-id');
            sendActionLog({ actionCode: `goTo-Lesson-${lessonID}`, windowID: windowID });
        });

        lessonTable.columns.adjust().draw();
        sortPosition();
    }

    function generateLessonDataTr(props) {
        let lessonDataTrTemplate = `
        <tr data-lesson-id="{{id}}">
            <td>{{index}}</td>
            <td><a class="classLink" href="../Lesson/?lessonID={{id}}">{{name}}</a></td>
            <td class="lessonDescription">{{description}}</td>
        </tr>
        `;

        return generateHtml(lessonDataTrTemplate, {
            ...props,
        });
    }
});
