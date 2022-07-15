$(document).ready(function () {
    // setTimeout(function () {
    //     $('#loader').fadeOut(800);
    // }, 2000);

    // 處理側邊欄
    activeSideMenu({ id: 'navTopicManage', type: 'main' });

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

    // Topic

    // return 的時候直接按照 order 排
    // let topicData = [
    //     {
    //         id: '11',
    //         name: '人工智慧簡介',
    //         description: '簡介文字簡介文字簡介文字',
    //     },
    //     {
    //         id: '22',
    //         name: '資料收集與前處理',
    //         description: '簡介文字',
    //     },
    //     {
    //         id: '33',
    //         name: '特徵選擇',
    //         description: '簡介文字簡介文字簡介文字',
    //     },
    //     { id: '44', name: '特徵標準化', description: '簡介文字' },
    //     {
    //         id: '55',
    //         name: '數據集分割',
    //         description: '簡介文字簡介文字簡介文字',
    //     },
    //     { id: '66', name: '監督式學習', description: '簡介文字' },
    //     {
    //         id: '77',
    //         name: '最短距離、KNN',
    //         description: '簡介文字',
    //     },
    //     {
    //         id: '88',
    //         name: '決策樹原理',
    //         description: '簡介文字簡介文字簡介文字',
    //     },
    //     { id: '99', name: '決策樹實作', description: '簡介文字' },
    //     {
    //         id: '100',
    //         name: '非監督式學習',
    //         description: '簡介文字',
    //     },
    //     {
    //         id: '110',
    //         name: 'K-means 分群',
    //         description: '簡介文字',
    //     },
    //     {
    //         id: '120',
    //         name: '階層式分群',
    //         description: '簡介文字',
    //     },
    // ];

    getTopicData();

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
            <td class="topicDescrption">{{description}}</td>
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

    // let lessonData = [
    //     {
    //         id: '11',
    //         name: '資料搜集的方法',
    //         description: '',
    //         contentOrder: '1',
    //     },
    //     {
    //         id: '22',
    //         name: '資料前處理',
    //         description: '簡介文字',
    //         contentOrder: '2',
    //     },
    //     {
    //         id: '33',
    //         name: '特徵選擇',
    //         description: '簡介文字',
    //         contentOrder: '3',
    //     },
    // ];

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

            setPopMsg({
                msg: `即將刪除章節「${targetData.name}」`,
                targetAction: 'deleteLesson',
            });

            $('.pop[target-action="deleteLesson"] .confirm-pop').on('click', function () {
                $('.pop').removeClass('active');

                // TODO: 刪除此筆資料

                $(`#lessonTable tr[data-lesson-id='${targetID}']`).remove();
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
            url: `../../API/getLessonContentData.php`,
            data: {
                lessonID: lessonID,
                studentID: 0,
            },
            dataType: 'json',
            success: function (res) {
                // 塞表格內容
                let lessonContentData = res.data;
                console.log(lessonContentData);
                activeLessonContentTab(lessonContentData);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('getTopicData Fail', jqXHR, textStatus, errorThrown);
            },
        });
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
            } else {
                closeModal();
                setPopMsg({ msg: `請先選擇愈新增的內容類型`, targetAction: 'addLessonContent' });

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
            const previewArea = document.getElementById('previewArea');
            previewArea.innerHTML = '';
            $('#previewArea').append(marked.parse(content));

            // previewArea
            $('.modalCancel').on('click', function () {
                $('.modal').find('#previewArea').children().remove();
            });
        });

        // markdown end

        // textArea
        $('#lessonContentModal .textAreaForm #quizImageUpload').on('change', function () {
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
            };
            reader.readAsDataURL(file);
        });

        // 編輯
        $('.editLessonContent').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-lessonContent-id');
            openModal({
                targetModal: $('#lessonContentModal'),
                modalTitle: '編輯章節內容',
                actionType: 'edit',
            });
            $('#lessonContentModal').attr('target-id', targetID);

            const targetData = lessonContentData.filter((item) => item.id == targetID)[0];

            // 填入資料

            $('#lessonContentModal .lessonContentOrder input').val(targetData.contentOrder);
        });

        // TODO: 刪除

        // 確認新增/編輯 主題
        $('#lessonContentModal .modalConfirm').on('click', function () {
            console.log('confirm modal');
            const actionType = $('#lessonContentModal').attr('action-type');
            const contentType = $('#lessonContentModal').attr('target-type');
            const topicID = $('main.content').attr('topic-id');
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

            let allFill = true;
            let errorMsgText = [];
            let contentResult = {};

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

                    sessionStorage.removeItem('uploadImageBase64');

                    break;
                case 'uploadImage':
                    if (quizTitle.length == 0) {
                        errorMsgText.push('標題');
                        allFill = false;
                    }
                    break;
                case 'singleChoice':
                case 'multipleChoice':
                case 'fillBlank':
                    if (quizTitle.length == 0) {
                        errorMsgText.push('標題');
                        allFill = false;
                    }

                    if (quizOption.length == 0) {
                        errorMsgText.push('選項必填');
                        allFill = false;
                    }

                    break;
                case 'embed':
                case 'embedYoutube':
                    break;
                default:
                    allFill = false;
                    break;
            }

            if (allFill) {
                console.log(contentResult);
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
                        console.log('addLessonData Fail', jqXHR, textStatus, errorThrown);
                    },
                });

                // clear dropBox selectLessonContentType
                $('.dropBox.selectLessonContent input').removeAttr('select-id');
                $('.dropBox.selectLessonContent input').val('');

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
