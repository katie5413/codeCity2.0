const fakeData = [
    {
        type: 'text',
        content:
            '# h1［文章標題］\n## h2［文章標題］\n### h3［次標題］\n#### h4［小標題］\n> block quote［引言］（bar 會隨著文字高度增加）\n\np［一般文字］\n\n**b［粗體文字］**\n\n一行字當中的`code ［ highlight 文字］`大概是這樣\n\n[a［連結文字］](https://myheroes.tw/codeCity/)\n\n1. 數字列表\n2. 數字列表\n3. 數字列表\n\n- 一般列表\n- 一般列表\n- 一般列表\n\n![圖片說明文字](https://katie5413.github.io/codeCity2.0/Images/city.png)\n\nhint~［提示］提示文字\n\nsum~［總結］總結文字',
    },
];

$(document).ready(function () {
    setTimeout(function () {
        $('#loader').fadeOut(800);
    }, 0);

    // 處理側邊欄
    activeSideMenu({ currentPage: 'navLesson', name: '單元名稱', link: '#' });

    // 動態顯示單元內容
    const pageData = fakeData;
    pageData.forEach((item) => {
        switch (item.type) {
            case 'text':

                marked.use({
                    renderer: CodeCityExtension,
                });

                $('#lessonContent').append(
                    `<div class="markdownArea">${marked.parse(item.content)}</div>`,
                );
                break;
        }
    });
});
