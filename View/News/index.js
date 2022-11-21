$(document).ready(function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const classCodeFromUrl = urlParams.get('classCode');
    const windowID = generateUniqueId();
    let studentData;
    let topicScoreData;
    let userData;
    let IS_TEACHER;

    // 先拿 user 資料
    $.ajax({
        type: 'POST',
        url: `../../API/getUser.php`,
        dataType: 'json',
        success: function (res) {
            console.log(res);
            if (res.user_status == 1) {
                userData = res.data;
                // 進入頁面
                sendActionLog({ actionCode: `enterPage-News`, windowID: windowID });

                // 離開頁面
                window.addEventListener('beforeunload', function (e) {
                    sendActionLog({
                        actionCode: `closePage-News`,
                        windowID: windowID,
                    });
                });

                // 側邊欄
                const { isTeacher, enrollClass } = checkUserIdentity(res.data);
                IS_TEACHER = isTeacher;

                addMenuRankClass({ enrollClass });
                addMenuNewsClass({ enrollClass });
                activeSideMenu({
                    id: 'navNews',
                    type: 'main',
                    identity: isTeacher ? 'teacher' : 'student',
                    windowID: windowID,
                });

                // deal selectClass dropBox options
                for (let i = 0; i < enrollClass.length; i++) {
                    let option = document.createElement('div');
                    option.classList.add('option');
                    option.setAttribute('value', enrollClass[i].classID);
                    option.append(document.createTextNode(enrollClass[i].className));
                    $('#classCodeArea .selectItems').append(option);
                }

                let classID;
                let className;

                initHomeworkListTable();

                // 如果網址有帶班級參數
                if (classCodeFromUrl) {
                    let classData = res.data.userClass.filter(
                        (item) => item.classCode == classCodeFromUrl,
                    )[0];

                    classID = classData.classID;

                    className = classData.className;

                    // 改變下拉選單的值
                    $('#classCodeArea input').val(className);

                    activeSideMenu({
                        id: `class-${classCodeFromUrl}`,
                        type: 'sub',
                        identity: isTeacher ? 'teacher' : 'student',
                        windowID: windowID,
                    });

                    // 拿學生作業
                    getHomeworkData({ classID });
                }

                // setClassCode
                $(document).on('click', '#classCodeArea .dropBox .option', function () {
                    classID = $(this).attr('value');

                    let targetTab = $('.tabMenu .tabMenuBtn.active').attr('target');

                    activeTab({ targetTab, classID });
                });

                $('.tabMenuBtn').on('click', function () {
                    const targetTab = $(this).attr('target');

                    if (classID != null) {
                        // 點擊 tabMenuBtn 切換分頁
                        activeTab({ targetTab, classID });
                    } else {
                        setPopMsg({ msg: '請先選擇班級' });
                    }
                });

                if (classID == null) {
                    setPopMsg({ msg: '請先選擇班級' });
                }

                if (isTeacher) {
                    // 處理側邊欄
                    addMenuManageClass({ enrollClass });
                }
            } else {
                setPopMsg({ msg: '未登入，三秒後自動跳轉' });
                setTimeout(function () {
                    window.location.href = '../Login';
                }, 3000);
            }
        },
    });

    // tabMenu
    function activeTab({ targetTab, classID }) {
        $(`.tabMenuBtn.active`).removeClass('active');

        $(`.tabMenuBtn[target=${targetTab}]`).addClass('active');

        $(`main.content`).attr('active-tab', targetTab);

        switch (targetTab) {
            case 'homeworkList':
                getHomeworkData({ classID });
                break;
        }
    }

    let homeworkData;
    // homeworkList
    function getHomeworkData({ classID }) {
        $.ajax({
            type: 'POST',
            url: `../../API/getHomeworkListByClassID.php`,
            data: {
                class_ID: classID,
            },
            dataType: 'json',
            success: function (res) {
                // 塞表格內容
                homeworkData = res.data;
                // console.log(res);
                $('#homeworkListTable').DataTable().clear().destroy();

                activeHomeworkListTab(homeworkData);

                getLessonContentData({ classID });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getHomeworkListByClassID Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    let lessonContentData;

    function getLessonContentData({ classID }) {
        $.ajax({
            type: 'POST',
            url: `../../API/getLessonContentDataByClassID.php`,
            data: {
                classID: classID,
            },
            dataType: 'json',
            success: function (res) {
                lessonContentData = res.data;
                // console.log(lessonContentData);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getLessonContentDataByClassID Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    function activeHomeworkListTab(homeworkData) {
        $('#homeworkListTable tbody tr').remove();
        // render studentListData table
        for (let i = 0; i < homeworkData.length; i++) {
            $('#homeworkListTable tbody').append(
                generateHomeworkListDataTr({
                    index: i + 1,
                    id: homeworkData[i].submitID,
                    lessonContentID: homeworkData[i].lessonContentID,
                    topicID: homeworkData[i].topicID,
                    topicName: homeworkData[i].topicName,
                    lessonID: homeworkData[i].lessonID,
                    lessonName: homeworkData[i].lessonName,
                    contentType: homeworkData[i].contentType,
                    studentID: homeworkData[i].studentID,
                    studentName: homeworkData[i].studentName,
                    submitTime: homeworkData[i].submitTime,
                    content: homeworkData[i].content,
                    score:
                        homeworkData[i].score == null ? '未批改' : homeworkData[i].score.toString(),
                }),
            );
        }

        $('.checkHomeworkScore').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-submit-id');
            const lessonContentID = $(this).closest('tr').attr('data-homework-id');

            let homeworkDetail = homeworkData.filter((item) => item.submitID == targetID)[0];
            let lessonContentDetail = lessonContentData.filter(
                (item) => item.id == lessonContentID,
            );

            const studentAnswer = [
                {
                    content: homeworkDetail.content,
                    score: homeworkDetail.score,
                    submitTime: homeworkDetail.submitTime,
                },
            ];

            lessonContentDetail[0].studentAnswer = studentAnswer;

            openModal({
                targetModal: $('#previewLessonContentModal'),
                modalTitle: '預覽章節內容',
                actionType: 'preview',
            });

            $('#lessonContent').children().remove();

            sendActionLog({
                actionCode: `preview-Submit-Homework-${lessonContentDetail[0].id}`,
                windowID: windowID,
            });

            lessonContentModel({
                data: lessonContentDetail,
                field: $('#lessonContent'),
                windowID: windowID,
                showStudentAnswer: true,
            });
        });

        initHomeworkListTable();
    }

    const homeworkListDataTrTemplate = `
    <tr data-submit-id="{{id}}" data-homework-id="{{lessonContentID}}" data-student-id="{{studentID}}" data-topic-id="{{topicID}}" data-lesson-id="{{lessonID}}">
        <td>{{index}}</td>
        <td>{{studentName}}</td>
        <td>{{submitTime}}</td>
        <td>{{score}}</td>
        <td>{{topicName}}</td>
        <td>{{lessonName}}</td>
        <td>{{contentType}}</td>
        <td><span class="iconButton preview"><img class="checkHomeworkScore" src="../../Images/icon/general/search.svg"></span></td>
    </tr>
    `;

    function generateHomeworkListDataTr(props) {
        let template = homeworkListDataTrTemplate;

        if (props.score == '未批改') {
            template = template.replace('<td>{{score}}</td>', '<td class="alert">{{score}}</td>');
        }

        return generateHtml(template, {
            ...props,
        });
    }

    function initHomeworkListTable() {
        // table library init
        homeworkListTable = $('#homeworkListTable').DataTable({
            scrollResize: true,
            scrollCollapse: true,
            scrollX: true,
            paging: false,
            searching: true,
            language: {
                lengthMenu: '每頁顯示 _MENU_ 筆',
                zeroRecords: '沒有資料',
                info: '',
                infoEmpty: '沒有資料',
                search: '<img src="../../Images/icon/general/search.svg">',
                searchPlaceholder: '篩選',
                paginate: {
                    next: '<img src="../../Images/icon/direction/arrow-right.svg">',
                    previous: '<img src="../../Images/icon/direction/arrow-left.svg">',
                },
            },
            columnDefs: [
                { width: '5%', targets: 0, orderable: false, searchable: false },
                { width: '5%', targets: 7 },
            ],
        });

        homeworkListTable.columns(1).search(userData.name).draw();

        homeworkListTable
            .on('order.dt search.dt', function () {
                homeworkListTable
                    .column(0, { search: 'applied', order: 'applied' })
                    .nodes()
                    .each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
            })
            .draw();

        homeworkListTable.columns.adjust().draw();
        sortPosition();
    }
});
