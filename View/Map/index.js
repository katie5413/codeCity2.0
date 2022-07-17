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

                function getTopicsData(classID) {
                    $.ajax({
                        type: 'POST',
                        url: `../../API/getTopicsData.php`,
                        data: {
                            classID: classID,
                        },
                        dataType: 'json',
                        success: function (data) {
                            console.log('getTopicsData', data);
                        },
                    });
                }

                console.log(enrollClass, applyClass);

                // switch (userClassData.length) {
                //     case 0:
                //         setPopMsg('目前未加入班級，前往申請');
                //         setTimeout(function () {
                //             window.location.href = '../Setting';
                //         }, 3000);
                //         break;
                //     case 1:
                //         break;
                //     default:
                //         break;
                // }

                // if (0) {
                //     $('#classCodeArea .selectSelected').val($(this).text());
                // } else {
                // }
            } else {
                setPopMsg({ msg: '未登入，三秒後自動跳轉' });
                setTimeout(function () {
                    window.location.href = '../Login';
                }, 3000);
            }
        },
    });
    //

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

    $('.card-wrap:not(".disable")').on('click', function () {
        const topicID = $(this).attr('topic-id');
        $.ajax({
            type: 'POST',
            url: `../../API/setTopicID.php`,
            data: {
                topicID: topicID,
            },
            dataType: 'json',
            success: function (res) {
                console.log(res);
                if (res.topic_status == 1) {
                    window.location.href = '../Topic';
                } else {
                    setPopMsg({ msg: '無法進入課程，請確認課程已開放' });
                }
            },
        });
    });
});
