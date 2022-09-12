$(document).ready(function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const classCodeFromUrl = urlParams.get('classCode');
    const windowID = generateUniqueId();
    let studentData;
    let topicScoreData;

    // 先拿 user 資料
    $.ajax({
        type: 'POST',
        url: `../../API/getUser.php`,
        dataType: 'json',
        success: function (res) {
            console.log(res);
            if (res.user_status == 1) {
                // 進入頁面
                sendActionLog({ actionCode: `enterPage-ClassManage`, windowID: windowID });

                // 離開頁面
                window.addEventListener('beforeunload', function (e) {
                    sendActionLog({
                        actionCode: `closePage-ClassManage`,
                        windowID: windowID,
                    });
                });

                // 側邊欄
                const { isTeacher, enrollClass } = checkUserIdentity(res.data);

                if (!isTeacher) {
                    setPopMsg({ msg: '非教師' });
                    setTimeout(function () {
                        window.location.href = '../Map';
                    }, 3000);
                } else {
                    // 處理側邊欄
                    addMenuClass({ enrollClass });
                    activeSideMenu({
                        id: 'navClassManage',
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

                    initStudentListTable();

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

                        // 拿學生名單
                        getStudentData({ classID });
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
            case 'studentList':
                getStudentData({ classID });
                break;
            case 'homeworkList':
                getHomeworkData({ classID });
                break;
            case 'topicScore':
                getClassStudentTopicScoreData({ classID });
                break;
        }
    }

    // studentList
    function getStudentData({ classID }) {
        $.ajax({
            type: 'POST',
            url: `../../API/getStudentListByClassID.php`,
            data: {
                class_ID: classID,
            },
            dataType: 'json',
            success: function (res) {
                // 塞表格內容
                studentData = res.data;
                console.log(res);
                $('#studentListTable').DataTable().clear().destroy();

                activeStudentListTab(studentData);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getStudentListByClassID Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    function activeStudentListTab(studentData) {
        $('#studentListTable tbody tr').remove();
        // render studentListData table
        for (let i = 0; i < studentData.length; i++) {
            $('#studentListTable tbody').append(
                generateStudentListDataTr({
                    index: i + 1,
                    id: studentData[i].studentID,
                    name: studentData[i].name,
                    email: studentData[i].email,
                    point: studentData[i].point == 0 ? '0' : studentData[i].point,
                }),
            );
        }

        initStudentListTable();
    }

    function generateStudentListDataTr(props) {
        let studentListDataTrTemplate = `
        <tr data-student-id="{{id}}">
            <td>{{index}}</td>
            <td><button class="watch watchHomework">{{name}}</button></td>
            <td class="studentEmail">{{email}}</td>
            <td class="studentPoint">{{point}}</td>
        </tr>
        `;

        return generateHtml(studentListDataTrTemplate, {
            ...props,
        });
    }

    function initStudentListTable() {
        // table 1 library init
        studentListTable = $('#studentListTable').DataTable({
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
                { width: '5%', targets: 0 },
                { width: '20%', targets: 1 },
                { width: '5%', targets: 3 },
            ],
        });

        studentListTable.columns.adjust().draw();
        sortPosition();
    }
    // studentListEnd
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
    <tr data-submit-id="{{id}}" data-homework-id="{{lessonContentID}}" data-student-id="{{studentID}} data-topic-id="{{topicID}}" data-lesson-id="{{lessonID}}">
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
                { width: '5%', targets: 0 },
                { width: '5%', targets: 7 },
            ],
        });

        homeworkListTable.columns.adjust().draw();
        sortPosition();
    }

    function getClassStudentTopicScoreData({ classID }) {
        $.ajax({
            type: 'POST',
            url: `../../API/getStudentListByClassID.php`,
            data: {
                class_ID: classID,
            },
            dataType: 'json',
            success: function (res) {
                // 塞表格內容
                studentData = res.data;

                $.ajax({
                    type: 'POST',
                    url: `../../API/getClassStudentAllTopicScore.php`,
                    dataType: 'json',
                    data: {
                        classID,
                    },
                    success: function (res) {
                        if (res.status == 200) {
                            const studentTopicScore = res.data;

                            $('#topicScoreTable').DataTable().clear().destroy();
                            activeTopicScoreTab({ studentData, studentTopicScore });
                        }
                    },
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getClassStudentTopicScoreData Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    function activeTopicScoreTab({ studentData, studentTopicScore }) {
        $('#topicScoreTable tbody tr').remove();

        for (let i = 0; i < studentData.length; i++) {
            let sumScore = 0;
            let scoreList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let scoreData = studentTopicScore.filter(
                (item) => item.student_ID == studentData[i].studentID,
            );
            scoreData.forEach((item) => {
                scoreList[item.topic_ID - 1] = parseInt(item.avg, 10);
                sumScore += parseInt(item.avg, 10);
            });

            console.log('student_name:',studentData[i].name,'score:',scoreList);

            $('#topicScoreTable tbody').append(
                generateTopicScoreDataTr({
                    index: i + 1,
                    studentID: studentData[i].studentID,
                    studentName: studentData[i].name,
                    email: studentData[i].email,
                    topic1: scoreList[0] == 0 ? '0' : scoreList[0],
                    topic2: scoreList[1] == 0 ? '0' : scoreList[1],
                    topic3: scoreList[2] == 0 ? '0' : scoreList[2],
                    topic4: scoreList[3] == 0 ? '0' : scoreList[3],
                    topic5: scoreList[4] == 0 ? '0' : scoreList[4],
                    topic6: scoreList[5] == 0 ? '0' : scoreList[5],
                    topic7: scoreList[6] == 0 ? '0' : scoreList[6],
                    topic8: scoreList[7] == 0 ? '0' : scoreList[7],
                    topic9: scoreList[8] == 0 ? '0' : scoreList[8],
                    topic10: scoreList[9] == 0 ? '0' : scoreList[9],
                    topic11: scoreList[10] == 0 ? '0' : scoreList[10],
                    topic12: scoreList[11] == 0 ? '0' : scoreList[11],
                    avgScore: sumScore == 0 ? '0' : Math.round((sumScore * 10) / 12) / 10,
                }),
            );

        }

        initTopicScoreTable();
    }

    function generateTopicScoreDataTr(props) {
        let template = `
        <tr data-student-id="{{studentID}}">
            <td>{{index}}</td>
            <td>{{studentName}}</td>
            <td>{{email}}</td>
            <td>{{topic1}}</td>
            <td>{{topic2}}</td>
            <td>{{topic3}}</td>
            <td>{{topic4}}</td>
            <td>{{topic5}}</td>
            <td>{{topic6}}</td>
            <td>{{topic7}}</td>
            <td>{{topic8}}</td>
            <td>{{topic9}}</td>
            <td>{{topic10}}</td>
            <td>{{topic11}}</td>
            <td>{{topic12}}</td>
            <td>{{avgScore}}</td>
        </tr>
        `;

        return generateHtml(template, {
            ...props,
        });
    }

    function initTopicScoreTable() {
        // table library init
        topicScoreTable = $('#topicScoreTable').DataTable({
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
            columnDefs: [{ width: '5%', targets: 0 }],
        });

        topicScoreTable.columns.adjust().draw();
        sortPosition();
    }
});
