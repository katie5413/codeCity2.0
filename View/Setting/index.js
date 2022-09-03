$(document).ready(function () {
    getUserData();
    const windowID = generateUniqueId();

    function getUserData() {
        // 先拿 user 資料
        $.ajax({
            type: 'POST',
            url: `../../API/getUser.php`,
            dataType: 'json',
            success: function (res) {
                console.log(res);

                if (res.user_status == 1) {
                    displayUserData(res.data);
                    // 進入頁面
                    sendActionLog({ actionCode: `enterPage-Setting`, windowID: windowID });

                    // 離開頁面
                    window.addEventListener('beforeunload', function (e) {
                        sendActionLog({ actionCode: `closePage-Setting`, windowID: windowID });
                    });

                    // 側邊欄
                    const { isTeacher, enrollClass } = checkUserIdentity(res.data);

                    if (isTeacher) {
                        addMenuClass({ enrollClass });
                    }

                    activeSideMenu({
                        id: 'navSetting',
                        type: 'sub',
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
    }

    // userData
    function displayUserData(data) {
        const { name, email, userClass, nickName, avatar } = data;

        if (name) {
            $('#userNameDisplay').text(name);
        }

        if (nickName) {
            $('#userNickNameDisplay').text(nickName);
        }

        if (email) {
            $('#userEmailDisplay').text(email);
        }

        if (avatar) {
            $('#userAvatarDisplay').attr('src', avatar);
        }

        if (userClass) {
            activeUserClassTable(userClass);
            let enrollClass = [];
            let applyClass = [];

            const classItemTemplate = `<div class="classItem">
        <div class="className">{{className}}</div>
        <div class="classStatus">{{classStatus}}</div>
    </div>`;

            // 檢查登記班級是否有可成功加入
            for (let i = 0; i < userClass.length; i++) {
                let classStatus = '';
                if (userClass[i].enrollTime != null) {
                    enrollClass.push(userClass[i]);
                    classStatus = `已加入`;
                } else {
                    applyClass.push(userClass[i]);
                    classStatus = `申請中`;
                }
                $('#userClassDisplay').append(
                    generateHtml(classItemTemplate, {
                        className: userClass[i].className,
                        classStatus: classStatus,
                    }),
                );
            }
        }
    }

    // userClass

    function activeUserClassTable(userClassData) {
        $('#userClassTable tbody tr').remove();
        // render userClassData table
        for (let i = 0; i < userClassData.length; i++) {
            $('#userClassTable tbody').append(
                generateUserClassDataTr({
                    ...userClassData[i],
                }),
            );
        }

        initUserClassTable();
    }

    function generateUserClassDataTr(props) {
        let userClassDataTrTemplate = `
        <tr data-class-id="{{classID}}">
            <td>{{classCode}}</td>
            <td>{{className}}</td>
            <td>{{classStatus}}</td>
            <td>{{classIdentity}}</td>
        </tr>
        `;

        return generateHtml(userClassDataTrTemplate, {
            ...props,
            classStatus: props.enrollTime == null ? '申請中' : '已加入',
            classIdentity: props.identity == 0 ? '學生' : '老師',
        });
    }

    function initUserClassTable() {
        // table 1 library init
        userClassTable = $('#userClassTable').DataTable({
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
        });

        userClassTable.columns.adjust().draw();
        sortPosition();
    }

    // applyClass
    $('#applyClassBtn').on('click', function () {
        const classCode = $('#applyClassCode input').val().toUpperCase();
        checkClassCodeExist(classCode);
    });

    function checkClassCodeExist(classCode) {
        $.ajax({
            type: 'POST',
            url: `../../API/checkClassCodeExist.php`,
            data: {
                classCode: classCode,
            },
            dataType: 'json',
            success: function (res) {
                const classStatus = res.open_status;
                const classID = res.class_id;

                switch (classStatus) {
                    case -1:
                        // 未成功，代號不存在
                        $('#applyClassCode').addClass('alert');
                        $('#applyClassCode input').focus();
                        setFieldFeedback(
                            $('.formArea[action="applyClassCode"]'),
                            `班級代號不存在`,
                            'error',
                        );

                        $('#applyClassCode input').on('click input', function () {
                            $(this).parent().removeClass('alert');
                            clearFieldFeedback($('.formArea[action="applyClassCode"]'));
                        });

                        sendActionLog({
                            action: `applyClass-Fail-${classCode}`,
                            windowID: windowID,
                        });

                        break;
                    case 0:
                    // 可直接加入
                    case 1:
                        // 須審核
                        $.ajax({
                            type: 'POST',
                            url: `../../API/applyClass.php`,
                            data: {
                                classOpenStatus: classStatus,
                                classID: classID,
                            },
                            dataType: 'json',
                            success: function (res) {
                                console.log('applyClass', res);
                                $('#userClassTable').DataTable().clear().destroy();
                                sendActionLog({
                                    action: `applyClass-Success-${classCode}`,
                                    windowID: windowID,
                                });

                                getUserData();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log('applyClass', jqXHR, textStatus, errorThrown);
                            },
                        });

                        break;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('checkClassCodeExist', jqXHR, textStatus, errorThrown);
            },
        });
    }

    // systemLog
    function getSystemLog() {
        $.ajax({
            type: 'POST',
            url: `../../API/getSystemLog.php`,
            dataType: 'json',
            success: function (res) {
                console.log(res);
                activeSystemLogTable(res.data);
            },
        });
    }

    function activeSystemLogTable(systemLogData) {
        $('#systemLogTable tbody tr').remove();
        // render systemLogData table
        for (let i = 0; i < systemLogData.length; i++) {
            $('#systemLogTable tbody').append(
                generateSystemLogDataTr({
                    ...systemLogData[i],
                }),
            );
        }

        initSystemLogTable();
    }

    function generateSystemLogDataTr(props) {
        let systemLogDataTrTemplate = `
        <tr data-log-id="{{id}}">
            <td>{{time}}</td>
            <td>{{actionCode}}</td>
            <td>{{giverType}}</td>
            <td></td>
        </tr>
        `;

        return generateHtml(systemLogDataTrTemplate, {
            ...props,
            classStatus: props.enrollTime == null ? '申請中' : '已加入',
            classIdentity: props.identity == 0 ? '學生' : '老師',
        });
    }

    function initSystemLogTable() {
        // table 1 library init
        systemLogTable = $('#systemLogTable').DataTable({
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
        });

        systemLogTable.columns.adjust().draw();
        sortPosition();
    }
});
