$(document).ready(function () {
    // 先拿 user 資料
    $.ajax({
        type: 'POST',
        url: `../../API/getUser.php`,
        dataType: 'json',
        success: function (res) {
            console.log(res);
            if (res.user_status == 1) {
                const userClassData = res.data.userClass;

                // get Topics data
                $(document).on('click', '#classCodeArea .dropBox .option', function () {
                    getTopicsData($(this).attr('value'));
                });

                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                const topicID = urlParams.get('topicID');

                getLessonData(topicID);
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
            columnDefs: [{ width: '5%', targets: 0 },{ width: '15%', targets: 1 }],
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
