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

                let enrollClass = [];
                let applyClass = [];

                // 檢查登記班級是否有可成功加入
                for (let i = 0; i < userClassData.length; i++) {
                    if (userClassData[i].enrollTime == null) {
                        applyClass.push(userClassData[i]);
                    } else {
                        enrollClass.push(userClassData[i]);
                    }
                }

                if (enrollClass.length > 0) {
                    // 如果已經有註冊，一律選第一個
                    $('#classCodeArea input').val(enrollClass[0].className);

                    // deal dropBox options
                    for (let i = 0; i < enrollClass.length; i++) {
                        let option = document.createElement('div');
                        option.classList.add('option');
                        option.setAttribute('value', enrollClass[i].classID);
                        option.append(document.createTextNode(enrollClass[i].className));
                        $('#classCodeArea .selectItems').append(option);
                    }

                    // get Topics data
                    $(document).on('click', '#classCodeArea .dropBox .option', function () {
                        getTopicsData($(this).attr('value'));
                    });
                } else if (applyClass.length > 0) {
                } else {
                    setPopMsg({ msg: '目前未加入班級，前往 [設定頁面] 申請' });
                }

                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                const topicID = urlParams.get('topicID');

                getLessonData(topicID);

                function generateLessonLink({ lessonID, name }) {
                    let template = `<div class="group center">
<a class="button btn-primary" href="../Lesson/?lessonID={{lessonID}}">{{name}}</a>
</div>`;
                    return generateHtml(template, { lessonID, name });
                }

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

                            for (let i = 0; i < lessonData.length; i++) {
                                $('#mapContent').append(
                                    generateLessonLink({
                                        lessonID: lessonData[i].id,
                                        name: lessonData[i].name,
                                    }),
                                );
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log('getTopicData Fail', jqXHR, textStatus, errorThrown);
                        },
                    });
                }
            } else {
                setPopMsg({ msg: '未登入，三秒後自動跳轉' });
                setTimeout(function () {
                    window.location.href = '../Login';
                }, 3000);
            }
        },
    });
    //
});
