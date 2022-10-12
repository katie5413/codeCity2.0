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

                    activeMagicBox();
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

    const mapType = {
        1: {
            1: 'deco',
            2: 'land',
            3: 'deco',
            4: 'land',
            5: 'building',
            6: 'road_--',
            7: 'deco',
            8: 'deco',
            9: 'land',
        },
        2: {
            1: 'land',
            2: 'deco',
            3: 'deco',
            4: 'road_--',
            5: 'building',
            6: 'land',
            7: 'deco',
            8: 'road_I',
            9: 'deco',
        },
        3: {
            1: 'deco',
            2: 'road_I',
            3: 'land',
            4: 'road_--',
            5: 'building',
            6: 'deco',
            7: 'land',
            8: 'deco',
            9: 'land',
        },
        4: {
            1: 'deco',
            2: 'land',
            3: 'deco',
            4: 'land',
            5: 'building',
            6: 'road_--',
            7: 'deco',
            8: 'road_I',
            9: 'deco',
        },
        5: {
            1: 'deco',
            2: 'road_I',
            3: 'land',
            4: 'land',
            5: 'building',
            6: 'road_--',
            7: 'deco',
            8: 'road_I',
            9: 'deco',
        },
        6: {
            1: 'deco',
            2: 'deco',
            3: 'land',
            4: 'road_--',
            5: 'building',
            6: 'land',
            7: 'deco',
            8: 'road_I',
            9: 'deco',
        },
        7: {
            1: 'land',
            2: 'road_I',
            3: 'land',
            4: 'deco',
            5: 'building',
            6: 'land',
            7: 'deco',
            8: 'road_I',
            9: 'deco',
        },
        8: {
            1: 'land',
            2: 'road_I',
            3: 'deco',
            4: 'deco',
            5: 'building',
            6: 'land',
            7: 'land',
            8: 'road_I',
            9: 'deco',
        },
        9: {
            1: 'deco',
            2: 'road_I',
            3: 'deco',
            4: 'land',
            5: 'building',
            6: 'land',
            7: 'deco',
            8: 'land',
            9: 'deco',
        },
        10: {
            1: 'land',
            2: 'road_I',
            3: 'deco',
            4: 'land',
            5: 'building',
            6: 'deco',
            7: 'deco',
            8: 'road_I',
            9: 'land',
        },
        11: {
            1: 'land',
            2: 'road_I',
            3: 'deco',
            4: 'land',
            5: 'building',
            6: 'land',
            7: 'deco',
            8: 'road_I',
            9: 'deco',
        },
        12: {
            1: 'deco',
            2: 'road_I',
            3: 'land',
            4: 'land',
            5: 'building',
            6: 'deco',
            7: 'deco',
            8: 'land',
            9: 'land',
        },
    };

    const mapLimit = {
        1: {
            1: 6,
            2: 7,
            3: 5,
            4: 3,
            5: 0,
            6: 1,
            7: 8,
            8: 2,
            9: 4,
        },
        2: {
            1: 4,
            2: 5,
            3: 8,
            4: 1,
            5: 0,
            6: 3,
            7: 6,
            8: 2,
            9: 7,
        },
        3: {
            1: 6,
            2: 1,
            3: 3,
            4: 2,
            5: 0,
            6: 7,
            7: 5,
            8: 8,
            9: 4,
        },
        4: {
            1: 3,
            2: 6,
            3: 8,
            4: 5,
            5: 0,
            6: 1,
            7: 4,
            8: 2,
            9: 7,
        },

        5: {
            1: 8,
            2: 1,
            3: 6,
            4: 4,
            5: 0,
            6: 2,
            7: 5,
            8: 3,
            9: 7,
        },
        6: {
            1: 8,
            2: 7,
            3: 6,
            4: 1,
            5: 0,
            6: 3,
            7: 4,
            8: 2,
            9: 5,
        },
        7: {
            1: 7,
            2: 1,
            3: 3,
            4: 8,
            5: 0,
            6: 4,
            7: 5,
            8: 2,
            9: 6,
        },
        8: {
            1: 3,
            2: 1,
            3: 6,
            4: 7,
            5: 0,
            6: 5,
            7: 4,
            8: 2,
            9: 8,
        },
        9: {
            1: 6,
            2: 1,
            3: 8,
            4: 2,
            5: 0,
            6: 3,
            7: 5,
            8: 4,
            9: 7,
        },
        10: {
            1: 3,
            2: 1,
            3: 7,
            4: 6,
            5: 0,
            6: 8,
            7: 4,
            8: 2,
            9: 5,
        },
        11: {
            1: 3,
            2: 1,
            3: 6,
            4: 4,
            5: 0,
            6: 5,
            7: 7,
            8: 2,
            9: 8,
        },
        12: {
            1: 7,
            2: 1,
            3: 2,
            4: 6,
            5: 0,
            6: 5,
            7: 8,
            8: 4,
            9: 3,
        },
    };

    const mapBuilding = {
        1: {
            backgroundUrl: 'road_-.png',
            name: '人工智慧簡介',
        },
        2: {
            backgroundUrl: 'road_⌝.png',
            name: '資料收集與前處理',
        },
        3: {
            backgroundUrl: 'road_⌟.png',
            name: '特徵選擇',
        },
        4: {
            backgroundUrl: 'road_⌜.png',
            name: '特徵標準化',
        },
        5: {
            backgroundUrl: 'road_I-.png',
            name: '數據集分割',
        },
        6: {
            backgroundUrl: 'road_⌝.png',
            name: '監督式學習',
        },
        7: {
            backgroundUrl: 'road_I.png',
            name: '最短距離、KNN',
        },
        8: {
            backgroundUrl: 'road_I.png',
            name: '決策樹原理',
        },
        9: {
            backgroundUrl: 'road_1.png',
            name: '決策樹實作',
        },
        10: {
            backgroundUrl: 'road_I.png',
            name: '非監督式學習',
        },
        11: {
            backgroundUrl: 'road_I.png',
            name: 'K-means 分群',
        },
        12: {
            backgroundUrl: 'road_1.png',
            name: '階層式分群',
        },
    };

    // deco or land
    const gridItemTemplate = `
        <div class="gridItem" limit="{{limit}}">
            <img class="{{type}} {{style}}" src="../../Images/map/{{type}}-{{topicID}}-{{gridID}}.png" />
        </div>
    `;

    const gridItemLandTemplate = `
        <div class="gridItem" limit="{{limit}}">
            <img class="land" src="../../Images/map/land.png" />
        </div>
    `;

    const gridItemRoadTemplate = `
        <div class="gridItem" limit="{{limit}}">
            <img class="road" src="../../Images/map/{{type}}.png" />
        </div>
    `;

    // building
    const gridItemBuildingTemplate = `
        <div class="gridItem">
            <a href="../../View/Topic/?topicID={{topicID}}">
                <span class="order">{{order}}</span>
                <img class="building" level="0" src="../../Images/island/island.png" />
                <img class="building" level="1" src="../../Images/island/island-{{topicID}}-1.png" />
                <img class="building" level="2" src="../../Images/island/island-{{topicID}}-2.png" />
                <p class="title">{{name}} <span class="score"></span></p>
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
            case 'road_--':
            case 'road_I':
                template = gridItemRoadTemplate;
                break;
            case 'deco':
                template = gridItemTemplate;
                break;
            case 'land':
                template = gridItemLandTemplate;
                break;
        }

        return generateHtml(template, {
            topicID,
            gridID,
            type,
            limit,
            style,
            name,
            backgroundUrl,
            order: topicID > 9 ? topicID : `0${topicID}`,
        });
    }

    function generateGridMap({ userID, identity }) {
        const topicOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        topicOrder.forEach((topicID) => {
            $('.gridMap').append(`<div class="grid" rank='0' target-id=${topicID}></div>`);

            $(`.grid[target-id=${topicID}]`).append(
                generateGridItem({
                    topicID: topicID,
                    type: 'building',
                    limit: mapLimit[topicID],
                    name: mapBuilding[topicID].name,
                    backgroundUrl: mapBuilding[topicID].backgroundUrl,
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
                }
            },
        });
    }
});
