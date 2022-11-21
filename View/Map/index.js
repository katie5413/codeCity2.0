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
                sendActionLog({ actionCode: 'enterPage-Map', windowID: windowID });

                // 離開頁面
                window.addEventListener('beforeunload', function (e) {
                    sendActionLog({ actionCode: 'closePage-Map', windowID: windowID });
                });

                // 顯示麵包屑
                displayCourseBreadcrumb({ isMap: true });

                updateUserDashBoard(res.data);

                // 側邊欄
                const { isTeacher, enrollClass } = checkUserIdentity(res.data);

                if (isTeacher) {
                    addMenuClass({ enrollClass });

                    // deal selectClass dropBox options
                    for (let i = 0; i < enrollClass.length; i++) {
                        let option = document.createElement('div');
                        option.classList.add('option');
                        option.setAttribute('value', enrollClass[i].classID);
                        option.append(document.createTextNode(enrollClass[i].className));
                        $('#classCodeArea .selectItems').append(option);
                    }

                    let classID;

                    // setClassCode
                    $(document).on('click', '#classCodeArea .dropBox .option', function () {
                        classID = $(this).attr('value');
                        // 拿學生名單
                        getStudentData({ classID });
                    });

                    // activeMagicBox();
                }

                activeSideMenu({
                    id: 'navMap',
                    type: 'main',
                    identity: isTeacher ? 'teacher' : 'student',
                    windowID: windowID,
                });

                generateGridMap({
                    userID: res.data.id,
                    identity: isTeacher ? 'teacher' : 'student',
                });
            } else {
                setPopMsg({ msg: '未登入，三秒後自動跳轉' });
                setTimeout(function () {
                    window.location.href = '../Login';
                }, 3000);
            }
        },
    });

    const mapBuilding = {
        1: {
            name: '人工智慧簡介',
        },
        2: {
            name: '資料收集與前處理',
        },
        3: {
            name: '特徵選擇',
        },
        4: {
            name: '特徵標準化',
        },
        5: {
            name: '數據集分割',
        },
        6: {
            name: '監督式學習',
        },
        7: {
            name: '最短距離、KNN',
        },
        8: {
            name: '決策樹原理',
        },
        9: {
            name: '決策樹實作',
        },
        10: {
            name: '非監督式學習',
        },
        11: {
            name: 'K-means 分群',
        },
        12: {
            name: '階層式分群',
        },
    };

    // deco or land
    const gridItemTemplate = `
        <div class="gridItem" limit="{{limit}}">
            <img class="{{type}} {{style}}" src="../../Images/map/{{type}}-{{topicID}}-{{gridID}}.png" />
        </div>
    `;

    // building
    const gridItemBuildingTemplate = `
        <div class="gridItem">
            <a href="../../View/Topic/?topicID={{topicID}}">
                <span class="score"></span>
                <img class="building" level="0" src="../../Images/island/island.png" />
                <img class="building" level="1" src="../../Images/island/island-{{topicID}}-1.png" />
                <img class="building" level="2" src="../../Images/island/island-{{topicID}}-2.png" />
                <p class="title">{{order}} {{name}}</p>
            </a>
        </div>
    `;

    function generateGridItem(props) {
        const { topicID, gridID, type, limit, style, name, backgroundUrl } = props;
        let template;
        switch (type) {
            case 'building':
                template = gridItemBuildingTemplate;
                break;
        }

        return generateHtml(template, {
            topicID,
            gridID,
            type,
            style,
            name,
            order: topicID > 9 ? topicID : `0${topicID}`,
        });
    }

    function generateGridMap({ userID, identity }) {
        const topicOrder = [1, 2, 3, 4, 12, 11, 10, 5, 9, 8, 7, 6];

        topicOrder.forEach((topicID) => {
            $('.gridMap').append(`<div class="grid" rank='0' target-id=${topicID}></div>`);

            $(`.grid[target-id=${topicID}]`).append(
                generateGridItem({
                    topicID: topicID,
                    type: 'building',
                    name: mapBuilding[topicID].name,
                }),
            );
        });

        $('.gridMap a').on('click', function () {
            let targetTopicID = $(this).closest('.grid').attr('target-id');
            sendActionLog({ actionCode: `map-goTo-Topic-${targetTopicID}`, windowID: windowID });
        });

        getUserAllTopicScore({ userID, identity });
    }

    // 不確定每個單元標準是否不同，所以先維持原本的
    const rankTable = {
        1: [60, 80],
        2: [60, 80],
        3: [60, 80],
        4: [60, 80],
        5: [60, 80],
        6: [60, 80],
        7: [60, 80],
        8: [60, 80],
        9: [60, 80],
        10: [60, 80],
        11: [60, 80],
        12: [60, 80],
    };

    function checkRank({ scoreData }) {
        let rank = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let score = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        scoreData.forEach((item) => {
            const avg = parseInt(item.avg, 10);
            rankTable[item.topic_ID].forEach((rankLimit, i) => {
                if (avg >= rankLimit) {
                    rank[item.topic_ID - 1]++;
                }
            });

            if (avg > 0) {
                score[item.topic_ID - 1] = avg;
            }
        });

        return { rank, score };
    }

    function updateMapByRank({ rank, score }) {
        rank.forEach((topicRank, i) => {
            $(`.grid[target-id=${i + 1}]`).attr('rank', topicRank);
        });

        score.forEach((topicScore, i) => {
            $(`.grid[target-id=${i + 1}]`)
                .find('.score')
                .text(topicScore);
        });
    }

    function getUserAllTopicScore({ userID, identity }) {
        $.ajax({
            type: 'POST',
            url: `../../API/getOneStudentAllTopicScore.php`,
            dataType: 'json',
            data: {
                userID,
            },
            success: function (res) {
                console.log(res);
                if (res.status == 200) {
                    console.log(res.data);

                    const { rank, score } = checkRank({ scoreData: res.data });
                    updateMapByRank({ rank, score });

                    // 拿到成績後順便檢查是否拿過本日獎勵
                    checkGetTodayAward({ score });
                }
            },
        });
    }

    function checkGetTodayAward({ score }) {
        $.ajax({
            type: 'POST',
            url: `../../API/checkGetTodayAward.php`,
            dataType: 'json',
            success: function (res) {
                let total = 0;

                score = score.filter((item) => item != 0);
                score.forEach((item) => {
                    total += item;
                });

                if (!res.getTodayAward) {
                    const msg = '本日登入獎勵 ' + score.join('+') + '=' + total + ' 積分';

                    setPopMsg({ msg: msg });

                    // 更新積分
                    updateUserPoint({ updatePoint: total });

                    // 送出 log
                    sendActionLog({ actionCode: 'getTodayAward', windowID: windowID });
                }
            },
        });
    }

    function updateUserPoint({ updatePoint }) {
        $.ajax({
            type: 'POST',
            url: `../../API/updateUserPoint.php`,
            data: {
                updatePoint: updatePoint,
            },
            dataType: 'json',
            success: function (res) {
                if (res.status === '200') {
                    console.log(res);
                    // updateUserPoint
                    $('.profileCard .status .point p').text(res.data.point);
                }
            },
        });
    }
});
