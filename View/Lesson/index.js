const fakeData = [
    {
        id: '1',
        type: 'markdown',
        content: {
            data: '# h1［文章標題］\n## h2［文章標題］\n### h3［次標題］\n#### h4［小標題］\n> block quote［引言］（bar 會隨著文字高度增加）\n\np［一般文字］\n\n**b［粗體文字］**\n\n一行字當中的`code ［ highlight 文字］`大概是這樣\n\n```python\n x = 1;\n y = 1;\n```\n\n[a［連結文字］](https://myheroes.tw/codeCity/)\n\n1. 數字列表\n2. 數字列表\n3. 數字列表\n\n- 一般列表\n- 一般列表\n- 一般列表\n\n![圖片說明文字](https://katie5413.github.io/codeCity2.0/Images/city.png)\n\nhint~［提示］提示文字\n\nsum~［總結］總結文字',
        },
    },
    {
        id: '2',
        type: 'singleChoice',
        content: {
            quizTitle: '單選題目的標題（單選）',
            quizDetail: '作業說明文字（選填）',
            quizImage: '../../Images/city.png',
            quizImageAlt: '圖片說明文字（選填）',
            answer: ['0'],
            option: ['答案', '選項一', '選項二', '選項三'],
        },
        studentAnswer: {
            content: [],
            score: null,
        },
    },
    {
        id: '3',
        type: 'multipleChoice',
        content: {
            quizTitle: '多選題目的標題(多選)',
            quizDetail: '作業說明文字（選填）',
            quizImage: '../../Images/city.png',
            quizImageAlt: '圖片說明文字（選填）',
            answer: ['0', '1'],
            option: ['答案', '答案', '選項二', '選項三'],
        },
        studentAnswer: {
            content: [],
            score: null,
        },
    },
    {
        id: '4',
        type: 'fillBlank',
        content: {
            quizTitle: '填空題的標題',
            quizDetail: '作業說明文字（選填）',
            quizImage: '../../Images/city.png',
            quizImageAlt: '圖片說明文字（選填）',
            answer: [
                { id: 'A', ans: ['答案'] },
                { id: 'B', ans: ['答案', '答案一', '答案二'] },
            ],
        },
        studentAnswer: {
            content: ['',''],
            score: null,
        },
    },
    {
        id: '5',
        type: 'uploadImage',
        content: {
            quizTitle: '上傳圖片題目的標題',
            quizDetail: '作業說明文字（選填）',
        },
        studentAnswer: {
            content: [],
            score: null,
        },
    },
    {
        id: '6',
        type: 'textArea',
        content: {
            quizTitle: '段落文字題目的標題',
            quizDetail: '作業說明文字（選填）',
            quizImage: '../../Images/city.png',
            quizImageAlt: '圖片說明文字（選填）',
        },
        studentAnswer: {
            content: [],
            score: null,
        },
    },
    {
        id: '7',
        type: 'embed',
        content: {
            url: 'https://replit.com/@katie5413/codecityIframe#main.py',
        },
    },
    {
        id: '7',
        type: 'embedYoutube',
        content: {
            url: 'https://youtu.be/6P11LSAQ_nw',
        },
    },
];

$(document).ready(function () {
    // setTimeout(function () {
    //     $('#loader').fadeOut(800);
    // }, 2000);

    // 處理側邊欄
    activeSideMenu({ currentPage: 'navLesson', name: '單元名稱', link: '#' });
    // 動態顯示單元內容
    const pageData = {
        title: '單元標題',
        icon: '',
        tags: ['string', 'number'],
        content: fakeData,
    };

    $('#pageTitle').text(pageData.title);
    if (pageData.icon.length != 0) {
        $('#lessonIcon').attr('src', pageData.icon);
    }
    if (pageData.tags.length != 0) {
        pageData.tags.forEach((tag) => {
            $('#tagArea').append(generateTag({ name: tag }));
        });
    }

    function generateTag(props) {
        const tagTemplate = `
        <a class="button btn-primary btn-hollow" href="../Course/index.html#{{name}}">#{{name}}</a>
        `;
        return generateHtml(tagTemplate, {
            ...props,
        });
    }

    lessonContentModel(fakeData, $('#lessonContent'));

    // $.ajax({
    //     type: 'POST',
    //     url: `../../API/getLessonData.php`,
    //     data: {
    //         lessonID: 1,
    //         studentID: 1,
    //     },
    //     dataType: 'json',
    //     success: function (lessonContent) {
    //         console.log('getLessonData', lessonContent);
    //         // 塞課程內容
    //         lessonContentModel(lessonContent.data, $('#lessonContent'));
    //     },
    //     error: function (jqXHR, textStatus, errorThrown) {
    //         console.log('getLessonData Fail', jqXHR, textStatus, errorThrown);
    //     },
    // });
});
