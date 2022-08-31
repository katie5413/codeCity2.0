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
                const isTeacher = checkUserIdentity(res.data);

                activeSideMenu({
                    id: 'navMap',
                    type: 'main',
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

    const mapStyle = {
        1: {
            1: '',
            2: '',
            3: 'lg',
            4: '',
            5: '',
            6: '',
            7: 'md',
            8: 'xl',
            9: '',
        },
        2: {
            1: '',
            2: 'md',
            3: 'lg',
            4: '',
            5: '',
            6: '',
            7: 'sm',
            8: '',
            9: 'md',
        },
        3: {
            1: 'md',
            2: '',
            3: '',
            4: '',
            5: '',
            6: 'sm',
            7: '',
            8: '',
            9: '',
        },
        4: {
            1: 'xl',
            2: '',
            3: 'md',
            4: '',
            5: '',
            6: '',
            7: 'md',
            8: '',
            9: '',
        },
        5: {
            1: 'lg',
            2: '',
            3: '',
            4: '',
            5: '',
            6: '',
            7: 'md',
            8: '',
            9: 'md',
        },
        6: {
            1: '',
            2: 'lg',
            3: '',
            4: '',
            5: '',
            6: '',
            7: 'xl',
            8: '',
            9: 'md',
        },
        7: {
            1: '',
            2: '',
            3: '',
            4: '',
            5: '',
            6: '',
            7: '',
            8: '',
            9: 'md',
        },
        8: {
            1: '',
            2: '',
            3: 'lg',
            4: 'lg',
            5: '',
            6: '',
            7: '',
            8: '',
            9: 'md',
        },
        9: {
            1: 'lg',
            2: '',
            3: 'lg',
            4: '',
            5: '',
            6: '',
            7: 'lg',
            8: '',
            9: 'lg',
        },
        10: {
            1: '',
            2: '',
            3: 'lg',
            4: '',
            5: '',
            6: 'xl',
            7: 'md',
            8: '',
            9: '',
        },
        11: {
            1: '',
            2: '',
            3: '',
            4: '',
            5: '',
            6: '',
            7: 'md',
            8: '',
            9: '',
        },
        12: {
            1: 'lg',
            2: '',
            3: '',
            4: '',
            5: '',
            6: 'lg',
            7: 'lg',
            8: '',
            9: '',
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
        <div class="gridItem" limit="0">
            <a href="../../View/Topic/?topicID={{topicID}}">
                <span class="order">{{order}}</span>
                <img class="background" src="../../Images/map/{{backgroundUrl}}" />
                <img class="building" src="../../Images/map/building-{{topicID}}.png" />
                <span class="title">{{name}}</span>
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

    function generateGridMap() {
        const topicOrder = [1, 2, 4, 3, 5, 6, 10, 7, 11, 8, 12, 9];

        topicOrder.forEach((topicID) => {
            $('.gridMap').append(`<div class="grid" rank='0' targetID=${topicID}></div>`);
            for (let gridID = 1; gridID <= 9; gridID++) {
                $(`.grid[targetID=${topicID}]`).append(
                    generateGridItem({
                        topicID: topicID,
                        gridID: gridID,
                        type: mapType[topicID][gridID],
                        limit: mapLimit[topicID][gridID],
                        style: mapStyle[topicID][gridID],
                        name: mapBuilding[topicID].name,
                        backgroundUrl: mapBuilding[topicID].backgroundUrl,
                    }),
                );
            }
        });

        $('.gridMap a').on('click', function () {
            let targetTopicID = $(this).closest('.grid').attr('targetID');
            sendActionLog({ actionCode: `map-goTo-Topic-${targetTopicID}`, windowID: windowID });
        });
    }

    generateGridMap();

    // const topicData = [
    //     {
    //         id: 'one',
    //         data: [
    //             { id: 1, name: '人工智慧簡介' },
    //             { id: 2, name: '資料收集與前處理' },
    //         ],
    //     },
    //     {
    //         id: 'two',
    //         data: [
    //             { id: 3, name: '特徵選擇' },
    //             { id: 4, name: '特徵標準化' },
    //             { id: 5, name: '數據集分割' },
    //         ],
    //     },
    //     {
    //         id: 'three',
    //         data: [
    //             { id: 6, name: '監督式學習' },
    //             { id: 7, name: '最短距離、KNN' },
    //             { id: 8, name: '決策樹原理' },
    //             { id: 9, name: '決策樹實作' },
    //         ],
    //     },
    //     {
    //         id: 'four',
    //         data: [
    //             { id: 10, name: '非監督式學習' },
    //             { id: 11, name: 'K-means 分群' },
    //             { id: 12, name: '階層式分群' },
    //         ],
    //     },
    // ];

    // function generateMapItem(props) {
    //     let template = `
    //         <div class="mapItem" id="map-topic-{{id}}">
    //             <a href="../../View/Topic/?topicID={{id}}">
    //                 <img class="city" src="../../Images/city/city{{id}}.jpg" />
    //                 <span class="name">{{orderName}}</span>
    //             </a>
    //         </div>
    //     `;

    //     return generateHtml(template, {
    //         ...props,
    //         orderName: props.id > 9 ? `${props.id} ${props.name}` : `0${props.id} ${props.name}`,
    //     });
    // }

    // topicData.forEach((chapter) => {
    //     chapter.data.forEach((topic) => {
    //         $(`#mapContent .chapter[chapter=${chapter.id}]`).append(generateMapItem(topic));
    //     });
    // });

    // const topicData = [
    //     {
    //         id: '1',
    //         title: '人工智慧簡介',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-01.jpg',
    //         openStatus: true,
    //     },
    //     {
    //         id: '2',
    //         title: '資料收集與前處理',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-02.jpg',
    //         openStatus: true,
    //     },
    //     {
    //         id: '3',
    //         title: '特徵的選擇',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-03.jpg',
    //         openStatus: false,
    //     },
    //     {
    //         id: '4',
    //         title: '特徵的標準化',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-04.jpg',
    //         openStatus: false,
    //     },
    //     {
    //         id: '5',
    //         title: '數劇集分割',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-01.jpg',
    //         openStatus: false,
    //     },
    //     {
    //         id: '6',
    //         title: '監督式學習',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-02.jpg',
    //         openStatus: false,
    //     },
    //     {
    //         id: '7',
    //         title: '最短距離、KNN',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-03.jpg',
    //         openStatus: false,
    //     },
    //     {
    //         id: '8',
    //         title: '決策樹的原理',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-04.jpg',
    //         openStatus: false,
    //     },
    //     {
    //         id: '9',
    //         title: '決策樹實作',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-01.jpg',
    //         openStatus: false,
    //     },
    //     {
    //         id: '10',
    //         title: 'K-means 分群',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-02.jpg',
    //         openStatus: false,
    //     },
    //     {
    //         id: '11',
    //         title: '非監督式學習',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-03.jpg',
    //         openStatus: false,
    //     },
    //     {
    //         id: '12',
    //         title: '階層式分群',
    //         description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    //         bgImage: '../../Images/map-04.jpg',
    //         openStatus: false,
    //     },
    // ];

    // const topicTemplate = `
    // <div class="card-wrap {{disable}}" topic-id="{{id}}">
    //     <div class="card">
    //         <div
    //             class="card-bg"
    //             style="background-image: url('../../Images/map-0{{imgIndex}}.jpg')"
    //         ></div>
    //         <div class="card-info">
    //             <h3>{{title}}</h3>
    //             <p>{{description}}</p>
    //         </div>
    //     </div>
    // </div>
    // `;

    // topicData.forEach((item, index) => {
    //     $('#mapContent').append(
    //         generateTopicCard({
    //             id: item.id,
    //             index: index,
    //             openStatus: item.openStatus,
    //             title: item.title,
    //             description: item.description,
    //         }),
    //     );
    // });

    // function generateTopicCard(props) {
    //     let template = topicTemplate;

    //     return generateHtml(template, {
    //         imgIndex: (props.index % 4) + 1,
    //         disable: props.openStatus ? '' : 'disable',
    //         ...props,
    //     });
    // }

    // $('#mapContent').slick({
    //     infinite: false,
    //     slidesToShow: 4,
    //     slidesToScroll: 4,
    //     arrows: false,
    // });

    // $(window).resize(function () {
    //     $('#mapContent').slick('resize');
    // });
});
