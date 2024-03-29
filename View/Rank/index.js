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
                sendActionLog({ actionCode: `enterPage-Rank`, windowID: windowID });

                // 離開頁面
                window.addEventListener('beforeunload', function (e) {
                    sendActionLog({
                        actionCode: `closePage-Rank`,
                        windowID: windowID,
                    });
                });

                // 側邊欄
                const { isTeacher, enrollClass } = checkUserIdentity(res.data);
                IS_TEACHER = isTeacher;

                addMenuRankClass({ enrollClass });
                addMenuNewsClass({ enrollClass });
                activeSideMenu({
                    id: 'navRank',
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

                if (!isTeacher) {
                } else {
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
                    point: studentData[i].point == 0 ? '0' : studentData[i].point,
                }),
            );
        }

        // $('.watchOtherStudent').on('click', function(){
        //     const targetStudentID = $(this).parent().attr('data-student-id');
        //     openModal({
        //         targetModal: $('#watchOtherStudentModal'),
        //         modalTitle: '拜訪島嶼',
        //         actionType: 'preview',
        //     });
        // })

        initStudentListTable();
    }

    function generateStudentListDataTr(props) {
        let studentListDataTrTemplate = `
        <tr data-student-id="{{id}}">
            <td>{{index}}</td>
            <td><a class="watch watchOtherStudent" href="../Map/index.html?viewStudent={{id}}">{{name}}</a></td>
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
                { width: '5%', targets: 0, orderable: false, searchable: false },
                { width: '20%', targets: 1 },
            ],
            order: [[2, 'desc']],
        });

        studentListTable
            .on('order.dt search.dt', function () {
                studentListTable
                    .column(0, { search: 'applied', order: 'applied' })
                    .nodes()
                    .each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
            })
            .draw();

        studentListTable.columns.adjust().draw();
        sortPosition();
    }
    // studentListEnd

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
                    success: function (resScore) {
                        if (resScore.status == 200) {
                            const studentTopicScore = resScore.data;

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
            let scoreList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let scoreData = studentTopicScore.filter(
                (item) => item.student_ID == studentData[i].studentID,
            );
            scoreData.forEach((item) => {
                scoreList[item.topic_ID - 1] = parseInt(item.avg, 10);
                sumScore += parseInt(item.avg, 10);
            });

            $('#topicScoreTable tbody').append(
                generateTopicScoreDataTr({
                    index: i + 1,
                    studentID: studentData[i].studentID,
                    studentName: studentData[i].name,
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
                    topic13: scoreList[12] == 0 ? '0' : scoreList[12],
                    topic14: scoreList[13] == 0 ? '0' : scoreList[13],
                    topic15: scoreList[14] == 0 ? '0' : scoreList[14],
                    avgScore:
                        sumScore == 0 || scoreData.length == 0
                            ? '0'
                            : Math.round((sumScore * 10) / scoreData.length) / 10,
                }),
            );
        }

        initTopicScoreTable();
    }

    function generateTopicScoreDataTr(props) {
        let template = `
        <tr data-student-id="{{studentID}}">
            <td>{{index}}</td>
            <td><a class="watch watchOtherStudent" href="../Map/index.html?viewStudent={{studentID}}">{{studentName}}</a></td>
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
            <td>{{topic13}}</td>
            <td>{{topic14}}</td>
            <td>{{topic15}}</td>
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
            columnDefs: [{ width: '5%', targets: 0, orderable: false, searchable: false }],
        });

        topicScoreTable
            .on('order.dt search.dt', function () {
                topicScoreTable
                    .column(0, { search: 'applied', order: 'applied' })
                    .nodes()
                    .each(function (cell, i) {
                        cell.innerHTML = i + 1;
                    });
            })
            .draw();

        topicScoreTable.columns.adjust().draw();
        sortPosition();
    }
});
