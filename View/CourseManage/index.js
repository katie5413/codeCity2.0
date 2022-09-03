$(document).ready(function () {
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
                sendActionLog({ actionCode: `enterPage-CourseManage`, windowID: windowID });

                // 離開頁面
                window.addEventListener('beforeunload', function (e) {
                    sendActionLog({
                        actionCode: `closePage-CourseManage`,
                        windowID: windowID,
                    });
                });

                // 側邊欄
                const { isTeacher, enrollClass } = checkUserIdentity(res.data);

                if (isTeacher) {
                    addMenuClass({ enrollClass });
                }

                activeSideMenu({
                    id: 'navCourseManage',
                    type: 'main',
                    identity: isTeacher ? 'teacher' : 'student',
                    windowID: windowID,
                });

                // 一進入：拿主題資料
                getTopicData();
            } else {
                setPopMsg({ msg: '未登入，三秒後自動跳轉' });
                setTimeout(function () {
                    window.location.href = '../Login';
                }, 3000);
            }
        },
    });

    // Common
    function switchContentTopStatus({ topic, lesson }) {
        if (topic) {
            $('.pageTopicName').text(topic.name);
            $('main.content').attr('topic-id', topic.id);
            $('main.content').removeAttr('lesson-id');

            $('.pageLessonName').text('');
            $('main.content').attr('active-tab', 'lesson');

            // button
            $('.contentTopArea .right button.openModal').attr('action-target', 'lesson');
        }

        if (lesson) {
            $('.pageLessonName').text(lesson.name);
            $('main.content').attr('lesson-id', lesson.id);

            $('main.content').attr('active-tab', 'lessonContent');

            // button
            $('.contentTopArea .right button.openModal').attr('action-target', 'lessonContent');

            // 如果要切回 topic tab
            $('.pageTopicName').on('click', function () {
                let topic = {
                    id: $('main.content').attr('topic-id'),
                    name: $('.pageTopicName').text(),
                };
                switchContentTopStatus({ topic });
            });
        }
    }

    function getTopicData() {
        $.ajax({
            type: 'POST',
            url: `../../API/getTopicData.php`,
            data: {},
            dataType: 'json',
            success: function (res) {
                // 塞表格內容
                let topicData = res.data;
                activeTopicTab(topicData);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getTopicData Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    function activeTopicTab(topicData) {
        $('#topicTable tbody tr').remove();
        // render topicData table
        for (let i = 0; i < topicData.length; i++) {
            $('#topicTable tbody').append(
                generateTopicDataTr({
                    index: i + 1,
                    id: topicData[i].id,
                    name: topicData[i].name,
                    description:
                        topicData[i].description.length > 0 ? topicData[i].description : ' ',
                }),
            );
        }

        initTopicTable();

        // TopicModal

        // open modal(新增)
        $('.openModal').on('click', function () {
            console.log('open modal');
            const actionType = $(this).attr('action-type');
            const actionTarget = $(this).attr('action-target');

            let type = actionType == 'add' ? '新增' : '編輯';
            let target;
            switch (actionTarget) {
                case 'topic':
                    target = '主題';
                    break;
                case 'lesson':
                    target = '章節';
                    break;
                case 'lessonContent':
                    target = '章節內容';
                    break;
            }

            openModal({
                targetModal: $(`#${actionTarget}Modal`),
                actionType: actionType,
                modalTitle: `${type}${target}`,
            });
        });

        // 編輯
        $('.editTopic').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-topic-id');
            openModal({
                targetModal: $('#topicModal'),
                modalTitle: '編輯主題',
                actionType: 'edit',
            });

            $('#topicModal').attr('target-id', targetID);
            const targetData = topicData.filter((item) => item.id == targetID)[0];

            // 填入資料
            $('#topicModal .topicName input').val(targetData.name);
            $('#topicModal .topicDescription textarea').val(targetData.description);
        });

        // 確認新增/編輯 主題
        $('#topicModal .modalConfirm').on('click', function () {
            const actionType = $('#topicModal').attr('action-type');
            const targetID = $('#topicModal').attr('target-id');
            const topicName = $('#topicModal .topicName input').val();
            const topicDescription = $('#topicModal .topicDescription textarea').val();
            let allFill = true;
            let errorMsgText = [];

            if (topicName.trim().length == 0) {
                errorMsgText.push('主題名稱');
                allFill = false;
            }

            if (allFill) {
                switch (actionType) {
                    case 'edit':
                        // Update UI
                        $(`tr[data-topic-id="${targetID}"] .manageLesson`).text(topicName);
                        $(`tr[data-topic-id="${targetID}"] .topicDescription`).text(
                            topicDescription,
                        );

                        $.ajax({
                            type: 'POST',
                            url: `../../API/updateTopic.php`,
                            data: {
                                id: targetID,
                                name: topicName,
                                introduction: topicDescription.length > 0 ? topicDescription : ' ',
                            },
                            dataType: 'json',
                            success: function () {
                                $('#topicTable').DataTable().clear().destroy();
                                getTopicData();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log('updateTopicData Fail', jqXHR, textStatus, errorThrown);
                            },
                        });

                        break;
                    case 'add':
                        $.ajax({
                            type: 'POST',
                            url: `../../API/addTopic.php`,
                            data: {
                                name: topicName,
                                introduction: topicDescription.length > 0 ? topicDescription : '',
                            },
                            dataType: 'json',
                            success: function (res) {
                                console.log('success', res);
                                $('#topicTable').DataTable().clear().destroy();
                                getTopicData();
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log('addTopicData Fail', jqXHR, textStatus, errorThrown);
                            },
                        });

                        break;
                }
                closeModal();
            } else {
                setFieldFeedback($('#topicModal'), `${errorMsgText.join('、')}必填`, 'error');
            }
        });

        // 刪除主題
        $('.deleteTopic').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-topic-id');
            const targetData = topicData.filter((item) => item.id == targetID)[0];

            setPopMsg({ msg: `即將刪除主題：「${targetData.name}」`, targetAction: 'deleteTopic' });

            $('.pop[target-action="deleteTopic"] .confirm-pop').on('click', function () {
                $('.pop').removeClass('active');

                $.ajax({
                    type: 'POST',
                    url: `../../API/deleteTopic.php`,
                    data: {
                        id: targetID,
                    },
                    dataType: 'json',
                    success: function () {
                        $('#topicTable').DataTable().clear().destroy();
                        getTopicData();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('addTopicData Fail', jqXHR, textStatus, errorThrown);
                    },
                });
            });
        });

        /* lesson */

        // manageLesson
        $('.manageLesson').on('click', function () {
            let topic = {
                id: $(this).closest('tr').attr('data-topic-id'),
                name: $(this).text(),
            };
            switchContentTopStatus({ topic });

            getLessonData(topic.id);
        });
    }

    function generateTopicDataTr(props) {
        let topicDataTrTemplate = `
        <tr data-topic-id="{{id}}">
            <td>{{index}}</td>
            <td><button class="manage manageLesson">{{name}}</button></td>
            <td class="topicDescription">{{description}}</td>
            <td><button class="iconButton edit"><img class="editTopic" src="../../Images/icon/general/edit-white.svg" /></button></td>
            <td><button class="iconButton delete"><img class="deleteTopic" src="../../Images/icon/general/delete-white.svg" /></button></td>
        </tr>
        `;

        return generateHtml(topicDataTrTemplate, {
            ...props,
        });
    }

    function initTopicTable() {
        // table 1 library init
        topicTable = $('#topicTable').DataTable({
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
                { width: '20%', targets: 1 },
                { width: '5%', targets: 3 },
                { width: '5%', targets: 4 },
            ],
        });

        topicTable.columns.adjust().draw();
        sortPosition();
    }

    // Lesson

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
                activeLessonTab(lessonData);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getTopicData Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    function activeLessonTab(lessonData) {
        $('#lessonTable tbody tr').remove();

        // render lesson table
        let maxContentOrder = 0;
        for (let i = 0; i < lessonData.length; i++) {
            let contentOrder = parseInt(lessonData[i].contentOrder, 10);
            if (contentOrder > maxContentOrder) {
                maxContentOrder = contentOrder;
            }

            $('#lessonTable tbody').append(
                generateLessonDataTr({
                    index: i + 1,
                    id: lessonData[i].id,
                    name: lessonData[i].name,
                    contentOrder: contentOrder,
                    description:
                        lessonData[i].description.length > 0 ? lessonData[i].description : ' ',
                }),
            );
        }

        $('.openModal[action-target="lesson"]').on('click', function () {
            $('#lessonModal .lessonContentOrder input').val(maxContentOrder + 1);
        });

        // init lessonTable
        initLessonTable();

        // 編輯
        $('.editLesson').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-lesson-id');
            openModal({
                targetModal: $('#lessonModal'),
                modalTitle: '編輯章節',
                actionType: 'edit',
            });
            $('#lessonModal').attr('target-id', targetID);

            const targetData = lessonData.filter((item) => item.id == targetID)[0];

            // 填入資料
            $('#lessonModal .lessonName input').val(targetData.name);
            $('#lessonModal .lessonDescription textarea').val(targetData.description);
            $('#lessonModal .lessonContentOrder input').val(targetData.contentOrder);
        });

        // 確認新增/編輯 主題
        $('#lessonModal .modalConfirm').on('click', function () {
            const actionType = $('#lessonModal').attr('action-type');
            const topicID = $('main.content').attr('topic-id');
            const lessonID = $('#lessonModal').attr('target-id');
            const lessonName = $('#lessonModal .lessonName input').val();
            const lessonContentOrder = $('#lessonModal .lessonContentOrder input').val();
            const lessonDescription = $('#lessonModal .lessonDescription textarea').val();
            let allFill = true;
            let errorMsgText = [];

            if (lessonName.trim().length == 0) {
                errorMsgText.push('章節名稱');
                allFill = false;
            }

            if (allFill) {
                switch (actionType) {
                    case 'edit':
                        // Update UI
                        $(`tr[data-topic-id="${lessonID}"] .manageLessonContent`).text(lessonName);
                        $(`tr[data-topic-id="${lessonID}"] .lessonContentOrder`).text(
                            lessonContentOrder,
                        );
                        $(`tr[data-topic-id="${lessonID}"] .lessonDescription`).text(
                            lessonDescription,
                        );

                        $.ajax({
                            type: 'POST',
                            url: `../../API/updateLesson.php`,
                            data: {
                                id: lessonID,
                                name: lessonName,
                                contentOrder:
                                    lessonContentOrder.length > 0 ? lessonContentOrder : 0,
                                introduction:
                                    lessonDescription.length > 0 ? lessonDescription : ' ',
                            },
                            dataType: 'json',
                            success: function (res) {
                                console.log(res);
                                $('#lessonTable').DataTable().clear().destroy();
                                getLessonData(topicID);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(
                                    'updateLessonData Fail',
                                    jqXHR,
                                    textStatus,
                                    errorThrown,
                                );
                            },
                        });

                        break;
                    case 'add':
                        $.ajax({
                            type: 'POST',
                            url: `../../API/addLesson.php`,
                            data: {
                                topic_ID: topicID,
                                name: lessonName,
                                introduction: lessonDescription.length > 0 ? lessonDescription : '',
                                contentOrder:
                                    lessonContentOrder.length > 0 ? lessonContentOrder : 0,
                            },
                            dataType: 'json',
                            success: function (res) {
                                console.log('success', res);
                                $('#lessonTable').DataTable().clear().destroy();
                                getLessonData(topicID);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log('addLessonData Fail', jqXHR, textStatus, errorThrown);
                            },
                        });

                        break;
                }
                closeModal();
            } else {
                setFieldFeedback($('#lessonModal'), `${errorMsgText.join('、')}必填`, 'error');
            }
        });

        // 刪除
        $('.deleteLesson').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-lesson-id');
            const targetData = lessonData.filter((item) => item.id == targetID)[0];
            const topicID = $('main.content').attr('topic-id');

            setPopMsg({
                msg: `即將刪除章節「${targetData.name}」`,
                targetAction: 'deleteLesson',
            });

            $('.pop[target-action="deleteLesson"] .confirm-pop').on('click', function () {
                $('.pop').removeClass('active');

                // TODO: 刪除此筆資料
                $.ajax({
                    type: 'POST',
                    url: `../../API/deleteLesson.php`,
                    data: {
                        id: targetID,
                    },
                    dataType: 'json',
                    success: function (res) {
                        console.log('success DELETE', res);
                        $('#lessonTable').DataTable().clear().destroy();
                        getLessonData(topicID);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('deleteLessonData Fail', jqXHR, textStatus, errorThrown);
                    },
                });
            });
        });

        /* topicData */
        $('.manageLessonContent').on('click', function () {
            let topic = {
                id: $('main.content').attr('topic-id'),
                name: $('.pageTopicName').text(),
            };
            let lesson = {
                id: $(this).closest('tr').attr('data-lesson-id'),
                name: $(this).text(),
            };
            switchContentTopStatus({ topic, lesson });

            getLessonContentData(lesson.id);
        });
    }

    function generateLessonDataTr(props) {
        let lessonDataTrTemplate = `
        <tr data-lesson-id="{{id}}">
            <td>{{index}}</td>
            <td class="lessonContentOrder">{{contentOrder}}</td>
            <td><button class="manage manageLessonContent">{{name}}</button></td>
            <td class="lessonDescription">{{description}}</td>
            <td><span class="iconButton edit"><img class="editLesson" src="../../Images/icon/general/edit-white.svg" /></span></td>
            <td><span class="iconButton delete"><img class="deleteLesson" src="../../Images/icon/general/delete-white.svg" /></span></td>
        </tr>
        `;

        return generateHtml(lessonDataTrTemplate, {
            ...props,
        });
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
                { width: '5%', targets: 1 },
                { width: '20%', targets: 2 },
                { width: '5%', targets: 4 },
                { width: '5%', targets: 5 },
            ],
        });

        lessonTable.columns.adjust().draw();
        sortPosition();
    }

    function getLessonContentData(lessonID) {
        $.ajax({
            type: 'POST',
            url: `../../API/getAllLessonContentDataByLessonID.php`,
            data: {
                lessonID: lessonID,
                studentID: 0,
            },
            dataType: 'json',
            success: function (res) {
                // 塞表格內容
                let lessonContentData = res.data;
                console.log('get lessonContentData success', lessonContentData);
                activeLessonContentTab(lessonContentData);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('get lessonContentData Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    // 填入資料
    function setLessonContentModalData({
        contentType,
        quizTitle,
        quizDetail,
        quizImageAlt,
        quizImage,
        quizOption,
        quizChoiceAnswer,
        quizFillBlankAnswer,
        embedLink,
        markdown,
    }) {
        console.log('setLessonContentModalData');
        if (quizTitle) {
            $(`#lessonContentModal .${contentType}Form .quizTitle input`).val(quizTitle);
        }

        if (quizDetail) {
            $(`#lessonContentModal .${contentType}Form .quizDetail input`).val(quizDetail);
        }

        if (quizImage) {
            sessionStorage.setItem('uploadImageBase64', quizImage);

            if (contentType == 'fillBlank') {
                $('.fillBlankForm .previewImage img').remove();
                $('.fillBlankForm .previewImage').append(`<img src="${quizImage}">`);
            }
        }

        if (quizImageAlt) {
            $(`#lessonContentModal .${contentType}Form .quizImageAlt input`).val(quizImageAlt);
        }

        // markdown content
        if (markdown) {
            $(`#lessonContentModal .${contentType}Form .lessonContent textarea`).val(markdown);
            $(`#lessonContentModal .${contentType}Form .previewArea`).children().remove();
            $(`#lessonContentModal .${contentType}Form .previewArea`).append(
                marked.parse(markdown),
            );
        }

        // single & multi
        if (quizOption) {
            for (let i = 0; i < quizOption.length; i++) {
                $(`#lessonContentModal .${contentType}Form .quizOption input[type="text"]`)
                    .eq(i)
                    .val(quizOption[i]);
            }

            if (quizChoiceAnswer) {
                console.log('quizChoiceAnswer', quizChoiceAnswer);
                for (let i = 0; i < quizChoiceAnswer.length; i++) {
                    $(
                        `#lessonContentModal .${contentType}Form .quizOption input[type="checkbox"][select-id="${quizChoiceAnswer[i]}"]`,
                    )
                        .not(':checked')
                        .click();
                }
            }
        }

        // fill
        if (quizFillBlankAnswer) {
            for (let i = 0; i < quizFillBlankAnswer.length; i++) {
                $(`#lessonContentModal .${contentType}Form .quizOptionGroup input.quizNumber`)
                    .eq(i)
                    .val(quizFillBlankAnswer[i].id);
                $(`#lessonContentModal .${contentType}Form .quizOptionGroup input.quizAnswer`)
                    .eq(i)
                    .val(quizFillBlankAnswer[i].ans.join(','));
            }
        }

        // embed, embedYT
        if (embedLink) {
            $(`#lessonContentModal .${contentType}Form .embedLink input`).val(embedLink);
        }
    }

    function activeLessonContentTab(lessonContentData) {
        $('#lessonContentTable tbody tr').remove();
        $('#lessonContentTable').DataTable().clear().destroy();

        // render lessonContent table
        let maxContentOrder = 0;
        for (let i = 0; i < lessonContentData.length; i++) {
            const contentOrder = parseInt(lessonContentData[i].contentOrder, 10);
            if (contentOrder > maxContentOrder) {
                maxContentOrder = contentOrder;
            }

            const type = lessonContentData[i].type;

            let displayContent = ' ';

            switch (type) {
                case 'markdown':
                    displayContent = lessonContentData[i].content.data;

                    break;
                case 'textArea':
                case 'singleChoice':
                case 'multipleChoice':
                case 'fillBlank':
                case 'uploadImage':
                    displayContent = lessonContentData[i].content.quizTitle;
                    break;
                case 'embed':
                case 'embedYoutube':
                    displayContent = lessonContentData[i].content.url;
                    break;
            }

            if (displayContent.length > 50) {
                displayContent = displayContent.slice(0, 50).concat('…');
            }

            $('#lessonContentTable tbody').append(
                generateLessonContentDataTr({
                    index: i + 1,
                    id: lessonContentData[i].id,
                    type: type,
                    displayContent: displayContent,
                    contentOrder: lessonContentData[i].contentOrder.toString(),
                }),
            );
        }

        $('.openModal[action-target="lessonContent"]').on('click', function () {
            const type = $('.dropBox.selectLessonContent input').attr('select-id');
            if (type != undefined) {
                $('#lessonContentModal .lessonContentOrder input').val(maxContentOrder + 1);
                $('#lessonContentModal').attr('target-type', type);

                // update modal type
                $('#lessonContentModal .lessonContentType input').val(type);

                // clear feedback msg
                clearFieldFeedback($('#lessonContentModal'));

                // clear session
                sessionStorage.removeItem('uploadImageBase64');

                if (type == 'markdown') {
                    let template =
                        '# h1［文章標題］\n## h2［文章標題］\n### h3［次標題］\n#### h4［小標題］\n> block quote［引言］（bar 會隨著文字高度增加）\n\np［一般文字］\n\n**b［粗體文字］**\n\n一行字當中的`code ［ highlight 文字］`大概是這樣\n\n[a［連結文字］](https://myheroes.tw/codeCity/)\n\n1. 數字列表\n2. 數字列表\n3. 數字列表\n\n- 一般列表\n- 一般列表\n- 一般列表\n\n![圖片說明文字](https://katie5413.github.io/codeCity2.0/Images/city.png)\n\nhint~［提示］提示文字\n\nsum~［總結］總結文字';

                    setLessonContentModalData({
                        contentType: type,
                        markdown: template,
                    });
                }
            } else {
                closeModal();
                setPopMsg({ msg: `請先選擇欲新增的內容類型`, targetAction: 'addLessonContent' });

                $('.pop[target-action="addLessonContent"] .confirm-pop').on('click', function () {
                    $('.pop').removeClass('active');
                });
            }
        });

        // init Table
        initLessonContentTable();

        // markdown

        marked.use({
            renderer: CodeCityExtension,
        });

        hljs.initLineNumbersOnLoad();

        $('#lessonContentModal .markdownForm textarea').on('change input', function () {
            let content = $('#lessonContentModal .markdownForm textarea').val();
            const previewArea = $(`#lessonContentModal .markdownForm .previewArea`);
            previewArea.children().remove();
            $('#lessonContentModal .markdownForm .previewArea').append(marked.parse(content));
        });

        // previewArea
        $('.modalCancel').on('click', function () {
            $('.modal').find('.previewArea').children().remove();
            clearFieldFeedback($('#lessonContentModal'));
        });

        // markdown end

        // quizImageUpload
        $('#lessonContentModal .quizImageUpload').on('change', function () {
            let file = this.files[0];
            // alert(file.name+" | "+file.size+" | "+file.type);
            if (file.size > 5 * 1024 * 1024) {
                alert('檔案不可超過 5MB');
            }

            let reader = new FileReader();
            reader.onload = function () {
                // 通过 reader.result 来访问生成的 base64 DataURL
                let base64 = reader.result;
                sessionStorage.setItem('uploadImageBase64', base64);

                if ($(this).closest('.formModule').hasClass('fillBlankForm')) {
                    console.log('here');
                }
                $('.fillBlankForm .previewImage img').remove();
                $('.fillBlankForm .previewImage').append(`<img src="${base64}">`);
            };
            reader.readAsDataURL(file);
        });
        // quizImageUpload end

        // singleChoice start
        $('#lessonContentModal .singleChoiceForm input[type="checkbox"]').on('change', function () {
            let group = $('#lessonContentModal .singleChoiceForm input[type="checkbox');
            group.not(this).prop('checked', false);
        });
        // singleChoice end

        // 預覽
        $('.previewLessonContent').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-lessonContent-id');
            const targetData = lessonContentData.filter((item) => item.id == targetID);

            openModal({
                targetModal: $('#previewLessonContentModal'),
                modalTitle: '預覽章節內容',
                actionType: 'preview',
            });

            $('#lessonContent').children().remove();

            lessonContentModel({
                data: targetData,
                field: $('#lessonContent'),
                windowID: windowID,
            });
        });

        // 編輯
        $('.editLessonContent').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-lessonContent-id');
            const contentType = $(this).closest('tr').find('td.lessonContentType').text();
            const targetData = lessonContentData.filter((item) => item.id == targetID)[0];

            openModal({
                targetModal: $('#lessonContentModal'),
                modalTitle: '編輯章節內容',
                actionType: 'edit',
            });
            $('#lessonContentModal').attr('target-id', targetID);
            $('#lessonContentModal').attr('target-type', contentType);

            // update modal type
            $('#lessonContentModal .lessonContentType input').val(contentType);

            // set contentOrder
            $('#lessonContentModal .lessonContentOrder input').val(targetData.contentOrder);

            switch (contentType) {
                case 'markdown':
                    setLessonContentModalData({
                        contentType,
                        markdown: targetData.content.data,
                    });

                    break;
                case 'textArea':
                    setLessonContentModalData({
                        contentType,
                        quizTitle: targetData.content.quizTitle,
                        quizDetail: targetData.content.quizDetail,
                        quizImage: targetData.content.quizImage,
                        quizImageAlt: targetData.content.quizImageAlt,
                    });

                    break;
                case 'uploadImage':
                    $(`#lessonContentModal .${contentType}Form .quizTitle input`).val(
                        targetData.content.quizTitle,
                    );
                    $(`#lessonContentModal .${contentType}Form .quizDetail input`).val(
                        targetData.content.quizDetail,
                    );

                    break;
                case 'singleChoice':
                case 'multipleChoice':
                    setLessonContentModalData({
                        contentType,
                        quizTitle: targetData.content.quizTitle,
                        quizDetail: targetData.content.quizDetail,
                        quizImage: targetData.content.quizImage,
                        quizImageAlt: targetData.content.quizImageAlt,
                        quizOption: targetData.content.option,
                        quizChoiceAnswer: targetData.content.answer,
                    });

                    break;
                case 'fillBlank':
                    setLessonContentModalData({
                        contentType,
                        quizTitle: targetData.content.quizTitle,
                        quizDetail: targetData.content.quizDetail,
                        quizImage: targetData.content.quizImage,
                        quizImageAlt: targetData.content.quizImageAlt,
                        quizFillBlankAnswer: targetData.content.answer,
                    });

                    break;
                case 'embed':
                case 'embedYoutube':
                    setLessonContentModalData({
                        contentType,
                        embedLink: targetData.content.url,
                    });
                    break;
            }
        });

        // 刪除
        $('.deleteLessonContent').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-lessonContent-id');
            const targetData = lessonContentData.filter((item) => item.id == targetID)[0];
            const lessonID = $('main.content').attr('lesson-id');

            setPopMsg({
                msg: `即將刪除章節內容「${targetData.type}」`,
                targetAction: 'deleteLessonContent',
            });

            $('.pop[target-action="deleteLessonContent"] .confirm-pop').on('click', function () {
                $('.pop').removeClass('active');

                $.ajax({
                    type: 'POST',
                    url: `../../API/deleteLessonContent.php`,
                    data: {
                        id: targetID,
                    },
                    dataType: 'json',
                    success: function (res) {
                        console.log('success DELETE', res);
                        $('#lessonContentTable').DataTable().clear().destroy();
                        getLessonContentData(lessonID);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('deleteLessonContentData Fail', jqXHR, textStatus, errorThrown);
                    },
                });
            });
        });

        // 確認新增/編輯 主題
        $('#lessonContentModal .modalConfirm').on('click', function () {
            console.log('confirm modal');
            const actionType = $('#lessonContentModal').attr('action-type');
            const contentType = $('#lessonContentModal').attr('target-type');
            const lessonID = $('main.content').attr('lesson-id');
            const lessonContentID = $('#lessonContentModal').attr('target-id');

            // All
            const lessonContentOrder = $('#lessonContentModal .lessonContentOrder input').val();

            // Part
            let quizTitle = $(`#lessonContentModal .${contentType}Form .quizTitle input`).val();
            let quizDetail = $(`#lessonContentModal .${contentType}Form .quizDetail input`).val();
            let quizImage = sessionStorage.getItem('uploadImageBase64');
            let quizImageAlt = $(
                `#lessonContentModal .${contentType}Form .quizImageAlt input`,
            ).val();
            let quizOption = [];
            let quizAnswer = [];

            let allFill = true;
            let errorMsgText = [];
            let contentResult = {};
            let options;

            switch (contentType) {
                case 'markdown':
                    const markdownContent = $(
                        `#lessonContentModal .${contentType}Form .lessonContent textarea`,
                    ).val();

                    if (markdownContent.length == 0) {
                        allFill = false;
                    } else {
                        contentResult = {
                            data: markdownContent,
                        };
                    }
                    break;
                case 'textArea':
                    if (quizTitle.length == 0) {
                        errorMsgText.push('標題');
                        allFill = false;
                    }

                    if (quizImageAlt.length != 0 && quizImage == null) {
                        errorMsgText.push('圖片檔案');
                        allFill = false;
                    }

                    contentResult = {
                        quizDetail: quizDetail.length == 0 ? '' : quizDetail,
                        quizImage: quizImage == null ? '' : quizImage,
                        quizImageAlt: quizImageAlt.length == 0 ? '' : quizImageAlt,
                        quizTitle: quizTitle,
                    };

                    break;
                case 'uploadImage':
                    if (quizTitle.length == 0) {
                        errorMsgText.push('標題');
                        allFill = false;
                    }

                    contentResult = {
                        quizDetail: quizDetail.length == 0 ? '' : quizDetail,
                        quizTitle: quizTitle,
                    };

                    break;
                case 'singleChoice':
                case 'multipleChoice':
                    if (quizTitle.length == 0) {
                        errorMsgText.push('標題');
                        allFill = false;
                    }

                    if (quizImageAlt.length != 0 && quizImage == null) {
                        errorMsgText.push('圖片檔案');
                        allFill = false;
                    }

                    // getOptions
                    options = $(
                        `#lessonContentModal .${contentType}Form .quizOption input[type="text"]`,
                    );

                    for (let i = 0; i < options.length; i++) {
                        if (options[i].value.length != 0) {
                            quizOption.push(options[i].value);
                        }
                    }

                    if (quizOption.length == 0) {
                        errorMsgText.push('選項');
                        allFill = false;
                    } else {
                        if (quizOption.length < 2) {
                            errorMsgText.push('選項至少兩個');
                            allFill = false;
                        }
                    }

                    // getAnswer
                    let choiceAns = $(
                        `#lessonContentModal .${contentType}Form input[type="checkbox"]:checked`,
                    );

                    for (let i = 0; i < choiceAns.length; i++) {
                        quizAnswer.push(choiceAns[i].getAttribute('select-id'));
                    }

                    if (quizAnswer.length == 0) {
                        errorMsgText.push('答案');
                        allFill = false;
                    }

                    contentResult = {
                        quizDetail: quizDetail.length == 0 ? '' : quizDetail,
                        quizImage: quizImage == null ? '' : quizImage,
                        quizImageAlt: quizImageAlt.length == 0 ? '' : quizImageAlt,
                        quizTitle: quizTitle,
                        answer: quizAnswer,
                        option: quizOption,
                    };
                    break;
                case 'fillBlank':
                    if (quizTitle.length == 0) {
                        errorMsgText.push('標題');
                        allFill = false;
                    }

                    if (quizImage == null || quizImage.length == 0) {
                        errorMsgText.push('圖片檔案');
                        allFill = false;
                    }

                    if (quizImageAlt.length != 0 && quizImage == null) {
                        errorMsgText.push('圖片檔案');
                        allFill = false;
                    }

                    // getAnswer and quizNum
                    let ans = $(`#lessonContentModal .${contentType}Form .optionItem`);

                    for (i = 0; i < ans.length; i++) {
                        let number = ans.eq(i).find('.quizNumber').val();
                        let answer = ans.eq(i).find('.quizAnswer').val();

                        if (number.length != 0 && answer.length != 0) {
                            answer = answer.split(',');
                            quizAnswer.push({ id: number, ans: answer });
                        }
                    }

                    if (quizAnswer.length == 0) {
                        errorMsgText.push('至少一題');
                        allFill = false;
                    }

                    contentResult = {
                        quizDetail: quizDetail.length == 0 ? '' : quizDetail,
                        quizImage: quizImage,
                        quizImageAlt: quizImageAlt.length == 0 ? '' : quizImageAlt,
                        quizTitle: quizTitle,
                        answer: quizAnswer,
                    };

                    break;
                case 'embed':
                case 'embedYoutube':
                    let embedLink = $(
                        `#lessonContentModal .${contentType}Form .embedLink input`,
                    ).val();

                    if (embedLink.length == 0) {
                        errorMsgText.push('連結');
                        allFill = false;
                    }

                    let expression =
                        /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
                    let regex = new RegExp(expression);
                    if (embedLink.match(regex)) {
                        contentResult = {
                            url: embedLink,
                        };
                    } else {
                        errorMsgText.push('連結格式錯誤');
                        allFill = false;
                    }
                    break;
                default:
                    allFill = false;
                    break;
            }

            if (allFill) {
                console.log(contentResult);

                if (actionType == 'add') {
                    $.ajax({
                        type: 'POST',
                        url: `../../API/addLessonContent.php`,
                        data: {
                            lesson_ID: lessonID,
                            contentType: contentType,
                            content: JSON.stringify(contentResult),
                            contentOrder: lessonContentOrder.length > 0 ? lessonContentOrder : 0,
                        },
                        dataType: 'json',
                        success: function (res) {
                            console.log('success', res);
                            $('#lessonContentTable').DataTable().clear().destroy();
                            getLessonContentData(lessonID);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(
                                'addLessonContentData Fail',
                                jqXHR,
                                textStatus,
                                errorThrown,
                            );
                        },
                    });
                } else if (actionType == 'edit') {
                    $.ajax({
                        type: 'POST',
                        url: `../../API/updateLessonContent.php`,
                        data: {
                            id: lessonContentID,
                            content: JSON.stringify(contentResult),
                            contentOrder: lessonContentOrder.length > 0 ? lessonContentOrder : 0,
                        },
                        dataType: 'json',
                        success: function (res) {
                            console.log('success EDIT', res);
                            $('#lessonContentTable').DataTable().clear().destroy();
                            getLessonContentData(lessonID);
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(
                                'editLessonContentData Fail',
                                jqXHR,
                                textStatus,
                                errorThrown,
                            );
                        },
                    });
                }

                // clear dropBox selectLessonContentType
                $('.dropBox.selectLessonContent input').removeAttr('select-id');
                $('.dropBox.selectLessonContent input').val('');

                // clearImage
                sessionStorage.removeItem('uploadImageBase64');

                $('.fillBlankForm .previewImage img').remove();
                $('.fillBlankForm .previewImage').append(`<img src="../../Images/city.png">`);

                closeModal();
            } else {
                setFieldFeedback(
                    $('#lessonContentModal'),
                    `${errorMsgText.join('、')}必填`,
                    'error',
                );
            }
        });
    }

    function initLessonContentTable() {
        // table 1 library init
        lessonContentTable = $('#lessonContentTable').DataTable({
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
                { width: '5%', targets: 1 },
                { width: '5%', targets: 2 },
                { width: '5%', targets: 4 },
                { width: '5%', targets: 5 },
                { width: '5%', targets: 6 },
            ],
        });

        lessonContentTable.columns.adjust().draw();
        sortPosition();
    }

    function generateLessonContentDataTr(props) {
        let lessonContentDataTrTemplate = `
        <tr data-lessonContent-id="{{id}}">
            <td>{{index}}</td>
            <td class="lessonContentOrder">{{contentOrder}}</td>
            <td class="lessonContentType">{{type}}</td>
            <td class="lessonContentDisplay">{{displayContent}}</td>
            <td><span class="iconButton preview"><img class="previewLessonContent" src="../../Images/icon/general/search.svg" /></span></td>
            <td><span class="iconButton edit"><img class="editLessonContent" src="../../Images/icon/general/edit-white.svg" /></span></td>
            <td><span class="iconButton delete"><img class="deleteLessonContent" src="../../Images/icon/general/delete-white.svg" /></span></td>
        </tr>
        `;

        return generateHtml(lessonContentDataTrTemplate, {
            ...props,
        });
    }
});
