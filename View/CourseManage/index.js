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

            $('main.content').attr('active-tab', 'topicData');

            // button
            $('.contentTopArea .right button.openModal').attr('action-target', 'topicData');

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

    getTopicData();

    function getTopicData() {
        $.ajax({
            type: 'POST',
            url: `../../API/getAllTopicData.php`,
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
            let target = actionTarget == 'topic' ? '主題' : '章節';

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
                        $(`tr[data-topic-id="${targetID}"] .topicDescrption`).text(
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
                                console.log('addTopicData Fail', jqXHR, textStatus, errorThrown);
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

            //TODO: 拿該 topic 下的 lesson data
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
            url: `../../API/getAllLessonData.php`,
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

    function activeLessonTab(lessonData){
        $('#lessonTable tbody tr').remove();

        // render lesson table
        for (let i = 0; i < lessonData.length; i++) {
            $('#lessonTable tbody').append(
                generateLessonDataTr({
                    index: lessonData[i].contentOrder,
                    id: lessonData[i].id,
                    name: lessonData[i].name,
                    contentOrder: lessonData[i].contentOrder,
                    description:
                        lessonData[i].description.length > 0 ? lessonData[i].description : ' ',
                }),
            );
        }

        // init lessonTable
        initLessonTable();

        // 編輯
        $('.editLesson').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-lesson-id');
            openModal({ targetModal: $('#lessonModal'), modalTitle: '編輯章節' });
            const targetData = lessonData.filter((item) => item.id === targetID)[0];
            const tagID = targetData.tag;

            // 填入資料

            $('#lessonModal .lessonName input').val(targetData.name);
            $('#lessonModal .lessonDescription textarea').val(targetData.description);
            $('#lessonModal .topicDataOrder input').val(targetData.contentOrder);
            tagID.forEach((tag) => {
                $(`#lessonModal .lessonTag .option[data-value="${tag}"]`).click();
            });
        });

        // 刪除
        $('.deleteLesson').on('click', function () {
            const targetID = $(this).closest('tr').attr('data-lesson-id');
            const targetData = lessonData.filter((item) => item.id === targetID)[0];

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
        });

    }

    function generateLessonDataTr(props) {
        let lessonDataTrTemplate = `
        <tr data-lesson-id="{{id}}">
            <td>{{index}}</td>
            <td>{{contentOrder}}</td>
            <td><button class="manage manageLessonContent">{{name}}</button></td>
            <td>{{description}}</td>
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
});
