

const fakeData = [
    {
        id: '1',
        type: 'markdown',
        content: {
            data: "> [安德森鳶尾花卉資料集](https://zh.wikipedia.org/zh-tw/%E5%AE%89%E5%BE%B7%E6%A3%AE%E9%B8%A2%E5%B0%BE%E8%8A%B1%E5%8D%89%E6%95%B0%E6%8D%AE%E9%9B%86)（Anderson's Iris data set）包含了150個樣本，都屬於鳶尾屬下的3個亞屬，分別是山鳶尾、變色鳶尾和維吉尼亞鳶尾。(摘自[維基百科](https://zh.wikipedia.org/zh-tw/%E5%AE%89%E5%BE%B7%E6%A3%AE%E9%B8%A2%E5%B0%BE%E8%8A%B1%E5%8D%89%E6%95%B0%E6%8D%AE%E9%9B%86))\n> 有了這些花的[花萼和花瓣的長度和寬度]四種特徵，可以發展出鳶尾花的分類依據了([舉例](https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Iris_dataset_scatterplot.svg/440px-Iris_dataset_scatterplot.svg.png))。\n\n![Kosaciec szczecinkowaty Iris setosa.jpg](https://upload.wikimedia.org/wikipedia/commons/5/56/Kosaciec_szczecinkowaty_Iris_setosa.jpg)\n\n![commons.wikimedia.org/wiki/File:Iris_versicolor_FWS.jpg](https://upload.wikimedia.org/wikipedia/commons/c/cd/Iris_versicolor_FWS.jpg)\n\n![https://commons.wikimedia.org/wiki/File:Iris_virginica.jpg](https://upload.wikimedia.org/wikipedia/commons/9/9f/Iris_virginica.jpg)\n",
        },
    },
    {
        id: '2',
        type: 'markdown',
        content: {
            data: '## 資料(Data)蒐集的方法\n> 小天想要知道全班的段考平均，於是小天要了班上所有同學的考卷，記錄所有同學的分數來計算結果。\n上述說明其實就是資料蒐集的過程。若我們把計量放大，變成全校、全區、全縣市、全國... 難度也隨之提升。若只是要學習人工智慧的觀念，卻要大費周章地蒐集資料，這樣太辛苦了！有沒有更輕鬆的方法？\n\n一般常見幾種可以用來蒐集人工智慧學習資料的方式：\n- 自行蒐集想要的資料\n- 撰寫網路爬蟲 或 運用API取得資料\n- 利用開放資料庫網站或套件提供的資料\n- 花錢購買他人已蒐集好的資料\n\n> Data 稱為資料亦可稱為數據，因為很多時候會以數值來表示。\n### 補充介紹：從網站取得資料\n\n隨AI興起，有些網站開始提供所謂的「資料集(Datasets)」減輕初學者蒐集資料的辛勞。例如：\n* [Kaggle](https://www.kaggle.com/) - 提供學習人工智慧學習需要大量訓練資料。\n* [OpenML](https://www.openml.org/) - 開放資料庫，提供各種全世界蒐集到的資料集，提供機器學習使用。\n* [Scikit-learn](https://scikit-learn.org/stable/) - 程式語言整合的工具，其中也提供了Python使用的套件、資料集。',
        },
    },
    {
        id: '3',
        type: 'markdown',
        content: {
            data: '## 資料前處理\n\n> 小天蒐集了全班的國文小考成績，但是有同學登記不確實或是分數有缺，讓小天計算班平均有點困擾...  如果是你，會如何處理這些有缺的資料？\n| 座號 | 小考1 | 小考2 | 小考3 | 小考4 | 小考5 | 平均 |\n|---| -------- | -------- | -------- | -------- | -------- | -------- |\n| 1|100|65|55|63|82|**73.0**|\n|2|53|-|84|72|99|**?**|\n|3|97|-|76|-|77|**?**|\n|...|...|...|...|...|...|...\n|35|57|80|-|80|55|**?**|\n\n當我們在蒐集資料時，偶爾會發生些許意外，造成我們蒐集來的資料有缺失，而所謂*資料的前處理*，就是要透過一些方法來彌補缺失的資料。\n\n一般而言，缺失資料的處理不外乎下列幾種方法：\n\n1. `填值`：用平均值、中值、分位數、眾數、隨機值等替代\n* 效果一般，因為等於人為增加了雜質。\n2. `刪除`：直接將資料刪除\n* 僅能在資料量大的時候使用。\n3. `推估`：用其他變數做預測模型來算出缺失變數\n* 例如運用內插法計算缺值。',
        },
    },
    {
        id: '4',
        type: 'markdown',
        content: {
            data: "### pandas 基本操作\nPandas是一套Python 的套件，常用來處理矩陣類型資料的工具。\nPython人工智慧學習的領域裡，就常運用pandas來處理各種資料。\n將資料載入後，我們使用 pandas 套件來處理資料：\n```python\nimport pandas as pd  # 載入pandas\ngrades = [\n['王**', 95, 67],\n['林**', 80, 60],\n['陳**', 85, 77]\n]\n# 轉成pandas的DataFrame格式並印出\nprint( pd.DataFrame(grades) )  \n```\n```python\n     0   1   2\n0  王**  95  67\n1  林**  80  60\n2  陳**  85  77\n```\n",
        },
    },
    {
        id: '5',
        type: 'markdown',
        content: {
            data: "### pandas 資料類型\npandas 有兩種可以存放數據的資料類型，分別是 `Series` 與 `DataFrame`：\n* Series- 儲存**一維**資料，每個元素擁有自己的標籤。\n* DataFrame\n- 儲存**二維**資料，每列或欄擁有自己的標籤。\n這次練習的 iris 資料集屬於二維，須轉為 DataFrame 操作。 \n以下片段是載入資料，並隨機製造資料缺損的程式片段。\n完整範例程式可以參考[程式範例](#程式實作)。\n```python\nfrom sklearn.datasets import load_iris  # 載入資料集用\nimport pandas as pd \nimport numpy as np\nimport random\n# 載入轉Pandas DataFrame\ndata = pd.DataFrame( load_iris()['data'] , columns=load_iris()['feature_names'] ) \nfor i in range(data.size): # 隨機製造資料缺損(約30%)\ndata.iat[i//4,i%4] = np.nan if random.randint(0,10)<3 else data.iat[i//4,i%4]\ndata.info() # 印出\n```\n結果： 數字可能不盡相同，因為是隨機刪除某些資料\n```python\n<class 'pandas.core.frame.DataFrame'>\nRangeIndex: 150 entries, 0 to 149\nData columns (total 4 columns):\n #   Column             Non-Null Count  Dtype  \n這裡會出錯（格式不符）\n 0   sepal length (cm)  101 non-null    float64\n 1   sepal width (cm)   109 non-null    float64\n2   petal length (cm)  104 non-null    float64\n 3   petal width (cm)   116 non-null    float64\ndtypes: float64(4)\nmemory usage: 4.8 KB\n```\n",
        },
    },
    {
        id: '6',
        type: 'markdown',
        content: {
            data: "### 關於 `pandas.DataFrame` 的常用功能：\n詳細請見[官方網站](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html?highlight=dataframe#pandas.DataFrame)說明；這邊只講解跟練習有關的項目：\n```python\n# 載入轉Pandas DataFrame\ndata = pd.DataFrame( load_iris()['data'] ,\ncolumns=load_iris()['feature_names'] ) \n```\n* `pandas.DataFrame( data, columns)` ：轉換二維資料變成DataFrame 可接受5種參數在此我們只用data 和index 兩項參數：\n* data 二維的資料，在這個練習中是指鳶尾花iris 的資料\n* columns 是欄位名稱，在本練習中是指iris 的特徵\n",
        },
    },
    {
        id: '7',
        type: 'markdown',
        content: {
            data: "### 資料缺損的處理方法 [利用 pandas 進行資料補值]\n我們從前面的示範，抓挑出關於補植相關的語法\n```python\n# 資料填補\nd1 = data.fillna(0)  #[填值]\nd2 = data.dropna()   #[刪除]\nd3 = data.interpolate(method='linear')  #[推估](線性)\n```\n我們來介紹 pandas 進行資料補值的方法，一般而言，缺失資料的處理不外乎下列幾種方法：\n1. **填值**：用平均值、中值、分位數、眾數、隨機值等替代\n* 效果一般，因為等於人為增加了雜質。\n* 使用`DataFrame.fillna(x)` 方法，填值(x)進去\n2. **刪除**：直接將資料刪除\n* 僅能在資料量大的時候使用\n* `DataFrame.dropna()` 方法，直接將有缺的資料刪除\n3. **推估**：用其他變數做預測模型來算出缺失變數\n* 如果其他變數和缺失變數無關，則預測的結果無意義；\n* 如果預測結果相當準確，則又說明這個變數是沒必要加入建模的\n* `DataFrame.interpolate(method=<method>)` 方法，可以透過指定補值的方法來進行填補\n- `linear`：忽略索引值，視為等間距\n- `index`：參考索引的數值差做內差\n- `time`：以時間差做為內差比例，以插入給定的間隔長度 \n- [(more...)](http://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.interpolate.html)\n",
        },
    },
    {
        id: '8',
        type: 'textArea',
        content: {
            quizTitle:
                '[觀念題] 小葉正在學習機器學習，想蒐集雙北地區的空氣 pm2.5指標資料，請推薦適合小葉的資料蒐集方法？',
        },
        studentAnswer: {
            content: [],
            score: null,
        },
    },
    {
        id: '9',
        type: 'textArea',
        content: {
            quizTitle: '[觀念題]',
            quizDetail:
                ' 補習班高老闆招募許多工讀生在街頭隨機訪談高中生關於補習的經驗。問卷回收後發現有些欄位有缺失不完整例如「每周補習時數」這個欄位的空缺值，若希望修補，何種方法最不適當？',
        },
        studentAnswer: {
            content: [],
            score: null,
        },
    },
    {
        id: '10',
        type: 'fillBlank',
        content: {
            quizTitle: '[觀念題]',
            quizDetail:
                '運用Pandas來儲存待處裡的資料，一維的資料適合用__A__；二維的資料適合用__B__。',
            quizImage: '../../Images/city.png',
            quizImageAlt: '本來預設圖片是必填，但用純文字好像也可以',
            answer: [
                { id: 'A', ans: ['series'] },
                { id: 'B', ans: ['dataframe'] },
            ],
        },
        studentAnswer: {
            content: ['', ''],
            score: null,
        },
    },
];

$(document).ready(function () {
    // setTimeout(function () {
    //     $('#loader').fadeOut(800);
    // }, 2000);

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

    // 處理側邊欄

    addSideMenuSubPage({
        targetID: 'navTopicMap',
        subPage: [{ id: 'lessonID', name: pageData.title, link: '#' }],
    });

    activeSideMenu({ id: 'lessonID', type: 'sub' });

    // 側邊欄 END

    function generateTag(props) {
        const tagTemplate = `
        <a class="button btn-primary btn-hollow" href="../Topic/index.html#{{name}}">#{{name}}</a>
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
