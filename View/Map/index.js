$(document).ready(function () {
    const windowID = generateUniqueId();
    // 進入頁面
    sendActionLog({ actionCode: 'enterPageMap', windowID: windowID });

    // 離開頁面
    window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        sendActionLog({ actionCode: 'closePageMap', windowID: windowID });
        e.returnValue = 'beforeunload';
    });

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
                    sessionStorage.setItem('classID', enrollClass[0].classID);

                    // deal dropBox options
                    for (let i = 0; i < enrollClass.length; i++) {
                        let option = document.createElement('div');
                        option.classList.add('option');
                        option.setAttribute('value', enrollClass[i].classID);
                        option.append(document.createTextNode(enrollClass[i].className));
                        $('#classCodeArea .selectItems').append(option);
                    }
                } else if (applyClass.length > 0) {
                    setPopMsg({ msg: '申請加入班級中，請聯絡班級教師加快流程' });
                } else {
                    setPopMsg({ msg: '目前未加入班級，前往 [設定頁面] 申請' });
                }

                console.log(enrollClass, applyClass);
            } else {
                setPopMsg({ msg: '未登入，三秒後自動跳轉' });
                setTimeout(function () {
                    window.location.href = '../Login';
                }, 3000);
            }
        },
    });

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
