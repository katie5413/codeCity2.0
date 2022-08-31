function lessonContentModel(props) {
    const { data, field, windowID } = props;
    data.forEach((item) => {
        // 每道題目會用「題型」＋「id」組成識別用的唯一 id
        let contentID = `${item.type}${item.id}`;

        let avgScore = item.studentAnswer != null ? getAvgScore(item.studentAnswer) : -1;

        // 非測驗： markdown, embedRepl, embedYoutube
        // 測驗（自動批改）： singleChoice, multipleChoice, fillblank
        // 測驗（教師批改）： uploadImage, textArea
        switch (item.type) {
            case 'markdown':
                marked.use({
                    renderer: CodeCityExtension,
                });

                hljs.initLineNumbersOnLoad();

                field.append(
                    `<div id="${contentID}" class="markdownArea section">${marked.parse(
                        item.content.data,
                    )}</div>`,
                );

                const imgGroup = $(`#${contentID}`).find('.content-img');

                let flag = 1;
                imgGroup.each(function (i, img) {
                    if (imgGroup.eq(i).next().hasClass('content-img')) {
                        flag++;
                        console.log(flag);
                    } else if (flag > 1) {
                        for (let j = 0; j < flag; j++) {
                            imgGroup.eq(i - j).addClass(`group${flag}`);
                        }
                        flag = 0;
                    }
                });

                $('.content-img-content').dotdotdot({
                    ellipsis: '\u2026',
                    height: 26,
                    watch: true,
                });

                $('code.hljs').each(function (i, block) {
                    hljs.lineNumbersBlock(block);
                });
                break;
            case 'embed':
                let urlRepl = item.content.url;

                // 正確格式如下： https://replit.com/{@帳號}/{專案名稱}?lite=true
                if (urlRepl.indexOf('replit.com') != -1) {
                    // 如果有 # 檔名 就無法成功
                    if (urlRepl.indexOf('#') != -1) {
                        urlRepl = urlRepl.split('#')[0];
                    }
                    urlRepl += '?lite=true';
                }

                const embedTemplate = `
                    <div id="${contentID}" class="section embedBlock">
                        <div class="sectionContentArea">
                            <iframe
                                width="100%"
                                height="500px"
                                frameborder="0"
                                src="${urlRepl}"
                            ></iframe>
                        </div>
                    </div>
                `;

                field.append(generateHtml(embedTemplate));

                break;
            case 'embedIframe':
                let iFrameCode = item.content.code;

                const embedIframeTemplate = `
                        <div id="${contentID}" class="section embedBlock">
                            <div class="sectionContentArea">
                                ${iFrameCode}
                            </div>
                        </div>
                    `;

                field.append(generateHtml(embedIframeTemplate));

                break;
            case 'embedYoutube':
                let urlYoutube = item.content.url;

                // 正確格式如下： https://youtu.be/6P11LSAQ_nw
                if (urlYoutube.indexOf('https://youtu.be/') != -1) {
                    // 把前面清掉，只留後面
                    urlYoutube = urlYoutube.replace('https://youtu.be/', '');

                    const embedYoutubeTemplate = `
                    <div id="${contentID}" class="section embedBlock">
                        <div class="sectionContentArea">
                            <iframe
                                width="100%"
                                height="500px"
                                src="https://www.youtube.com/embed/${urlYoutube}"
                                title="YouTube video player"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            ></iframe>
                        </div>
                    </div>
                    `;

                    field.append(generateHtml(embedYoutubeTemplate));
                } else {
                    console.log('非 Youtube');
                }

                break;
            case 'multipleChoice':
            case 'singleChoice':
                const multipleChoiceTemplate = `
                    <div id="{{quizTypeId}}" class="section quiz {{quizType}}" data-feedback="false">
                        <div class="halfCircle"></div>
                        <div class="score"></div>
                        <h3 class="sectionTitle">
                            <img
                                class="icon"
                                src="../../Images/icon/type/multiChoice.svg"
                            />{{quizTitle}}
                        </h3>
                        <div class="sectionContentArea">
                            <div class="text"></div>
                            <div class="content-img"></div>
                            <div class="optionArea"></div>
                            <div class="feedbackMsg maxContent">
                            <span class="icon"></span/>
                                <span class="text">error message</span>
                            </div>
                            <button class="submitAnswer quiz-{{quizType}} button btn-secondary">提交</button>
                        </div>
                        <div class="status"></div>
                    </div>
                `;

                const multipleChoiceOptionTemplate = `<div class="optionArea">
                    <div class="condition__button">
                        <input type="checkbox" id="{{quizTypeIdIndex}}" name="{{quizTypeId}}" />
                        <label for="{{quizTypeIdIndex}}"
                            ><span class="check"></span
                            ><span class="text">{{optionName}}</span></label
                        >
                    </div>
                </div>`;
                function generateMultipleChoice({ quizTypeId, id, quizType, content, score }) {
                    let template = multipleChoiceTemplate;
                    let optionHTML = ``;

                    if (score > -1) {
                        template = template.replace(
                            '<div class="score"></div>',
                            `<div class="score">${score}</div>`,
                        );
                    } else {
                        template = template.replace('<div class="score"></div>', ``);
                    }

                    if (content.quizDetail) {
                        template = template.replace(
                            '<div class="text"></div>',
                            `<div class="text">${content.quizDetail}</div>`,
                        );
                    }

                    if (content.quizImage) {
                        template = template.replace(
                            '<div class="content-img"></div>',
                            `<div class="content-img">
                            <img src="${content.quizImage}" />
                            <div class="content-img-content"></div>
                        </div>`,
                        );
                    }

                    if (content.quizImageAlt) {
                        template = template.replace(
                            '<div class="content-img-content"></div>',
                            `<div class="content-img-content">
                            <small>${content.quizImageAlt}</small>
                        </div>`,
                        );
                    }

                    if (content.option.length > 0) {
                        function generateOption({ quizTypeIdIndex, quizTypeId, optionName }) {
                            let optionTemplate = multipleChoiceOptionTemplate;

                            return generateHtml(optionTemplate, {
                                quizTypeIdIndex,
                                quizTypeId,
                                optionName,
                            });
                        }

                        for (let i = 0; i < content.option.length; i++) {
                            optionHTML += generateOption({
                                optionName: content.option[i],
                                quizType,
                                quizTypeIdIndex: `${contentID}-${i}`,
                                quizTypeId: `${contentID}`,
                            });
                        }

                        template = template.replace('<div class="optionArea"></div>', optionHTML);
                    }

                    return generateHtml(template, {
                        id,
                        quizTypeId,
                        quizType,
                        quizTitle: content.quizTitle,
                        score,
                    });
                }

                field.append(
                    generateMultipleChoice({
                        id: item.id,
                        quizTypeId: `${contentID}`,
                        quizType: item.type,
                        content: item.content,
                        score: avgScore,
                    }),
                );

                // 檢查是否作答過
                if (item.studentAnswer.length > 0) {
                    checkOpenStatus({
                        type: 'auto',
                        studentAnswer: item.studentAnswer,
                        passLimit: 100,
                        contentID,
                    });
                }

                // 提交
                $(`#${contentID} .submitAnswer`).on('click', function () {
                    let selectItem = $(`#${contentID}`).find('input[type="checkbox"]:checked');
                    let userAnswer = [];

                    // 檢查答案數量
                    if (selectItem.length == 0) {
                        // 一個都沒選的話，不會送到後台
                        setFieldFeedback($(`#${contentID}`), '請選擇答案', 'error');
                    } else {
                        let score = 0;
                        let count = 0; // 與答案相符的題數
                        for (let i = 0; i < selectItem.length; i++) {
                            let selectId = selectItem[i].getAttribute('id');
                            userAnswer.push(selectId.charAt(selectId.length - 1));

                            // 檢查答案
                            if (
                                item.content.answer.includes(selectId.charAt(selectId.length - 1))
                            ) {
                                count++;
                            }
                        }

                        // 與答案相符
                        if (
                            count == item.content.answer.length &&
                            item.content.answer.length == selectItem.length
                        ) {
                            // 改該題的 status
                            score = 100;

                            sendActionLog({
                                actionCode: `submitPractice-Correct-${contentID}`,
                                windowID: windowID,
                            });

                            checkOpenStatus({
                                type: 'auto',
                                studentAnswer: [
                                    {
                                        score,
                                        submitTime: new Date(),
                                    },
                                ],
                                passLimit: 100,
                                contentID,
                            });
                        } else {
                            // 選擇題：全對或全錯
                            sendActionLog({
                                actionCode: `submitPractice-Wrong-${contentID}`,
                                windowID: windowID,
                            });
                            setFieldFeedback($(`#${contentID}`), '再檢查一下吧', 'error');
                        }

                        updateLessonStatus();

                        submitAnswer({
                            homeworkID: item.id,
                            studentAnswer: JSON.stringify(userAnswer),
                            score: score,
                        });
                    }
                });

                $('.condition__button').on('click', function () {
                    let quiz = $(this).closest('.quiz');
                    clearFieldFeedback(quiz);
                });
                break;
            case 'fillBlank':
                const fillBlankTemplate = `
                    <div id="{{quizTypeId}}" class="section quiz {{quizType}}" data-feedback="false">
                        <div class="halfCircle"></div>
                        <div class="score"></div>
                        <h3 class="sectionTitle">
                            <img
                                class="icon"
                                src="../../Images/icon/type/fillBlank.svg"
                            />{{quizTitle}}
                        </h3>
                        <div class="sectionContentArea">
                            <div class="text"></div>
                            <div class="content-img">
                                <img src="{{quizImage}}" />
                                <div class="content-img-content"></div>
                            </div>
                            <div class="optionArea"></div>
                            <div class="feedbackMsg maxContent">
                                <span class="icon"></span/>
                                <span class="text">error message</span>
                            </div>
                            <button class="submitAnswer quiz-{{quizType}} button btn-secondary">提交</button>
                        </div>
                        <div class="status"></div>
                    </div>
                `;
                const fillBlankInputTemplate = `
                <div class="formInput icon">
                    <div class="iconArea">{{quizIndex}}</div>
                    <input
                        id="{{quizTypeIdIndex}}"
                        class="input"
                        type="text"
                    />
                </div>
                `;

                function generateFillBlank({ id, quizTypeId, quizType, content, score }) {
                    let template = fillBlankTemplate;
                    let optionHTML = ``;

                    if (score > -1) {
                        template = template.replace(
                            '<div class="score"></div>',
                            `<div class="score">${score}</div>`,
                        );
                    } else {
                        template = template.replace('<div class="score"></div>', ``);
                    }

                    if (content.quizImageAlt) {
                        template = template.replace(
                            '<div class="content-img-content"></div>',
                            `<div class="content-img-content"><small>${content.quizImageAlt}</small></div>`,
                        );
                    } else {
                        template = template.replace('<div class="content-img-content"></div>', '');
                    }

                    if (content.quizDetail) {
                        template = template.replace(
                            '<div class="text"></div>',
                            `<div class="text">${content.quizDetail}</div>`,
                        );
                    }

                    if (content.answer.length > 0) {
                        function generateInput({ quizTypeIdIndex, quizIndex }) {
                            let optionTemplate = fillBlankInputTemplate;

                            return generateHtml(optionTemplate, {
                                quizTypeIdIndex,
                                quizIndex,
                            });
                        }

                        // 顯示題號
                        for (let i = 0; i < content.answer.length; i++) {
                            optionHTML += generateInput({
                                quizTypeIdIndex: `${contentID}-${i}`,
                                quizIndex: content.answer[i].id,
                            });
                        }

                        template = template.replace('<div class="optionArea"></div>', optionHTML);
                    }

                    return generateHtml(template, {
                        id,
                        quizTypeId,
                        quizType,
                        quizTitle: content.quizTitle,
                        quizImage: content.quizImage,
                        score,
                    });
                }

                field.append(
                    generateFillBlank({
                        id: item.id,
                        quizTypeId: `${contentID}`,
                        quizType: item.type,
                        content: item.content,
                        score: avgScore,
                    }),
                );

                // 檢查是否作答過
                if (item.studentAnswer.length > 0) {
                    checkOpenStatus({
                        type: 'auto',
                        studentAnswer: item.studentAnswer,
                        passLimit: 100,
                        contentID,
                    });
                }

                // 提交
                $(`#${contentID} .submitAnswer`).on('click', function () {
                    let selectItem = $(`#${contentID} .input`);
                    let userAnswer = [];
                    let score = 0;

                    for (let i = 0; i < selectItem.length; i++) {
                        if (selectItem[i].value.length > 0) {
                            userAnswer.push(selectItem[i].value);
                        } else {
                            selectItem.eq(i).parent().addClass('alert');
                        }
                    }

                    // 檢查答案數量
                    if (userAnswer.length != item.content.answer.length) {
                        // 沒填完的話，不會送到後台
                        setFieldFeedback($(`#${contentID}`), '請輸入答案', 'error');
                    } else {
                        const answer = item.content.answer;
                        let count = 0;
                        let totalQuestion = answer.length;
                        let score = 0;
                        // console.log(answer, userAnswer);
                        if (answer.length != userAnswer.length) return false;
                        for (let i = 0; i < answer.length; i++) {
                            // console.log(answer[i].ans, userAnswer[i].toLowerCase());
                            if (answer[i].ans.includes(userAnswer[i].toLowerCase())) {
                                count++;
                            }
                        }

                        // 算分
                        score = Math.round((count / totalQuestion) * 100);

                        if (count == answer.length) {
                            checkOpenStatus({
                                type: 'auto',
                                studentAnswer: [
                                    {
                                        score,
                                        submitTime: new Date(),
                                    },
                                ],
                                passLimit: 100,
                                contentID,
                            });
                            sendActionLog({
                                actionCode: `submitPractice-Correct-${contentID}`,
                                windowID: windowID,
                            });
                        } else {
                            sendActionLog({
                                actionCode: `submitPractice-Wrong-${contentID}`,
                                windowID: windowID,
                            });
                            setFieldFeedback($(`#${contentID}`), '再檢查一下吧', 'error');
                        }

                        updateLessonStatus();
                        // 不管對不對都要送「userAnswer」到後台

                        submitAnswer({
                            homeworkID: item.id,
                            studentAnswer: JSON.stringify(userAnswer),
                            score: score,
                        });
                    }
                });

                $('.formInput').on('click', function () {
                    let quiz = $(this).closest('.quiz');
                    $(this).removeClass('alert');
                    clearFieldFeedback(quiz);
                });

                break;
            case 'uploadImage':
                const uploadImageTemplate = `
                <div id="{{quizTypeId}}" class="section quiz {{quizType}}" data-feedback="false">
                    <div class="halfCircle"></div>
                    <div class="score"></div>
                    <h3 class="sectionTitle">
                        <img class="icon" src="../../Images/icon/type/uploadImage.svg" />{{quizTitle}}
                    </h3>
                    <div class="sectionContentArea">
                        <div class="text"></div>
                        <div class="content-img">
                            <input type="file" name="{{quizTypeId}}Button" id="{{quizTypeId}}Button" accept=".jpg, .jpeg, .png, .svg"
                                hidden />
                            <label for="{{quizTypeId}}Button">
                                <div class="defaultImg uploadImageArea">
                                    <img class="imageSubmit" src="../../Images/uploadImage.svg" alt="imageSubmit" />
                                </div>
                            </label>
                        </div>

                        <div class="feedbackMsg maxContent">
                            <span class="icon"></span>
                            <span class="text">error message</span>
                        </div>
                        <button class="submitAnswer quiz-{{quizType}} button btn-secondary hide">提交</button>
                    </div>
                    <div class="status"></div>
                </div>
                `;

                function generateUploadImage({ quizTypeId, id, quizType, content, score }) {
                    let template = uploadImageTemplate;

                    if (score > -1) {
                        template = template.replace(
                            '<div class="score"></div>',
                            `<div class="score">${score}</div>`,
                        );
                    } else {
                        template = template.replace('<div class="score"></div>', ``);
                    }

                    if (content.quizDetail) {
                        template = template.replace(
                            '<div class="text"></div>',
                            `<div class="text">${content.quizDetail}</div>`,
                        );
                    }

                    return generateHtml(template, {
                        id,
                        quizTypeId,
                        quizType,
                        quizTitle: content.quizTitle,
                        score,
                    });
                }

                field.append(
                    generateUploadImage({
                        id: item.id,
                        quizTypeId: `${contentID}`,
                        quizType: item.type,
                        content: item.content,
                        score: avgScore,
                    }),
                );

                // 檢查是否作答過
                if (item.studentAnswer.length > 0) {
                    checkOpenStatus({
                        type: 'manual',
                        studentAnswer: item.studentAnswer,
                        contentID,
                    });
                    const imageSrc = JSON.parse(item.studentAnswer[0].content);
                    $(`#${contentID} .uploadImageArea`).removeClass('defaultImg');

                    $(`#${contentID} .uploadImageArea .imageSubmit`).attr('src', imageSrc);
                }

                // 重新註冊事件
                activeFeedBack($(`#${contentID}`));

                // 上傳留言圖片
                $(`#${contentID}Button`).change(function () {
                    var file = this.files[0];
                    //用size属性判断文件大小不能超过5M ，前端直接判断的好处，免去服务器的压力。
                    if (file.size > 5 * 1024 * 1024) {
                        setFieldFeedback($(`#${contentID}`), '檔案不能超過 5MB ', 'error');
                    } else {
                        var reader = new FileReader();
                        reader.onload = function () {
                            // 通过 reader.result 来访问生成的 base64 DataURL
                            var base64 = reader.result;

                            $(`#${contentID} .uploadImageArea .imageSubmit`).attr('src', base64);
                        };
                        reader.readAsDataURL(file);
                        $(`#${contentID} .submitAnswer`).removeClass('hide');
                        $(`#${contentID} .uploadImageArea`).removeClass('defaultImg');
                    }
                });

                $(`#${contentID} .uploadImageArea`).on('click', function () {
                    clearFieldFeedback($(`#${contentID}`));
                });

                $(`#${contentID} .submitAnswer`).on('click', function () {
                    const userAnswer = [
                        $(`#${contentID} .uploadImageArea .imageSubmit`).attr('src'),
                    ];
                    let score = -1;

                    checkOpenStatus({
                        type: 'manual',
                        studentAnswer: [
                            {
                                score,
                            },
                        ],
                        contentID,
                    });

                    sendActionLog({
                        actionCode: `submitHomework-${contentID}`,
                        windowID: windowID,
                    });

                    submitAnswer({
                        homeworkID: item.id,
                        studentAnswer: JSON.stringify(userAnswer),
                    });

                    updateLessonStatus();
                });

                break;
            case 'textArea':
                const textAreaTemplate = `
                <div id="{{quizTypeId}}" class="section quiz {{quizType}}" data-feedback="false">
                    <div class="halfCircle"></div>
                    <div class="score"></div>
                    <h3 class="sectionTitle">
                        <img
                            class="icon"
                            src="../../Images/icon/type/quote.svg"
                        />{{quizTitle}}
                    </h3>
                    <div class="sectionContentArea">
                        <div class="text"></div>
                        <div class="content-img"></div>
                        <div class="optionArea">
                        <div class="formInput">
                            <textarea id="{{quizTypeId}}Input" class="input" placeholder="請輸入段落文字"></textarea>
                        </div>
                        </div>
                        <div class="feedbackMsg maxContent">
                        <span class="icon"></span/>
                            <span class="text">error message</span>
                        </div>
                        <button class="submitAnswer quiz-{{quizType}} button btn-secondary">提交</button>
                    </div>
                    <div class="status"></div>
                </div>
            `;

                function generateTextArea({ quizTypeId, id, quizType, content, score }) {
                    let template = textAreaTemplate;

                    if (score > -1) {
                        template = template.replace(
                            '<div class="score"></div>',
                            `<div class="score">${score}</div>`,
                        );
                    } else {
                        template = template.replace('<div class="score"></div>', ``);
                    }

                    if (content.quizDetail) {
                        template = template.replace(
                            '<div class="text"></div>',
                            `<div class="text">${content.quizDetail}</div>`,
                        );
                    }

                    if (content.quizImage) {
                        template = template.replace(
                            '<div class="content-img"></div>',
                            `<div class="content-img">
                            <img src="${content.quizImage}" />
                            <div class="content-img-content"></div>
                        </div>`,
                        );
                    }

                    if (content.quizImageAlt) {
                        template = template.replace(
                            '<div class="content-img-content"></div>',
                            `<div class="content-img-content">
                            <small>${content.quizImageAlt}</small>
                        </div>`,
                        );
                    }

                    return generateHtml(template, {
                        id,
                        quizTypeId,
                        quizType,
                        quizTitle: content.quizTitle,
                        score,
                    });
                }

                field.append(
                    generateTextArea({
                        id: item.id,
                        quizTypeId: `${contentID}`,
                        quizType: item.type,
                        content: item.content,
                        score: avgScore,
                    }),
                );

                // 檢查是否作答過
                if (item.studentAnswer.length > 0) {
                    checkOpenStatus({
                        type: 'manual',
                        studentAnswer: item.studentAnswer,
                        contentID,
                    });
                    const userAnswer = JSON.parse(item.studentAnswer[0].content);
                    $(`#${contentID} textarea`).val(userAnswer);
                }

                // 重新註冊事件
                activeFeedBack($(`#${contentID}`));

                $(`#${contentID} .submitAnswer`).on('click', function () {
                    let selectItem = $(`#${contentID} .input`);
                    let userAnswer = [];

                    for (let i = 0; i < selectItem.length; i++) {
                        if (selectItem[i].value.length > 0) {
                            userAnswer.push(selectItem[i].value);

                            // 有填才會送資料到後台

                            let score = -1;

                            checkOpenStatus({
                                type: 'manual',
                                studentAnswer: [
                                    {
                                        score,
                                    },
                                ],
                                contentID,
                            });

                            sendActionLog({
                                actionCode: `submitHomework-${contentID}`,
                                windowID: windowID,
                            });

                            submitAnswer({
                                homeworkID: item.id,
                                studentAnswer: JSON.stringify(userAnswer),
                            });

                            updateLessonStatus();
                        } else {
                            selectItem.eq(i).parent().addClass('alert');

                            // 沒填完的話，不會送到後台
                            setFieldFeedback($(`#${contentID}`), '請輸入答案', 'error');
                        }
                    }
                });

                $('.formInput').on('click', function () {
                    let quiz = $(this).closest('.quiz');
                    $(this).removeClass('alert');
                    clearFieldFeedback(quiz);
                });

                break;
        }
    });

    // 塞完之後檢查任務完成狀況
    updateLessonStatus();

    function updateLessonStatus() {
        $('#currentFinishNum').text($('.quiz > .status.done').length);
        $('#totalNum').text($('.quiz > .status:not(.done,.wait)').length);
        $('#waitForScoreNum').text($('.quiz > .status.wait').length);
    }

    function submitAnswer(props) {
        $.ajax({
            type: 'POST',
            url: `../../API/submitHomework.php`,
            data: {
                ...props,
            },
            dataType: 'json',
            success: function (userAnswerStatus) {
                console.log('submitHomework', userAnswerStatus);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('submitHomework Fail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    function checkOpenStatus(props) {
        let { type, studentAnswer, passLimit, contentID } = props;

        switch (type) {
            case 'auto':
                for (let i = 0; i < studentAnswer.length; i++) {
                    // 答對過
                    // 因為時間是最新的在前面，所以只要找到第一筆就可以中斷了
                    if (studentAnswer[i].score == passLimit) {
                        // 有答對過就顯示勾
                        $(`#${contentID} .status`).addClass('done');

                        const lastPassSubmitTime = new Date(studentAnswer[i].submitTime);
                        let nextOpenTime = new Date(lastPassSubmitTime);
                        nextOpenTime.setDate(lastPassSubmitTime.getDate() + 1);
                        const now = new Date();

                        if (now < nextOpenTime) {
                            // 不開放就把提交刪掉，以及下次可作答時間
                            $(`#${contentID} .submitAnswer`).remove();
                            $(`#${contentID} .sectionContentArea`).append(
                                `<p>下次開放時間：${formattedTime(nextOpenTime)}</p>`,
                            );
                        }

                        break;
                    }
                }
                break;
            case 'manual':
                // MUST: studentAnswer, type, score, contentID
                for (let i = 0; i < studentAnswer.length; i++) {
                    // 答對過
                    // 因為時間是最新的在前面，所以只要找到第一筆就可以中斷了

                    if (studentAnswer[i].score == null || studentAnswer[i].score < 0) {
                        // 等待評分
                        $(`#${contentID} .status`).addClass('wait');
                        $(`#${contentID} .sectionContentArea`).append(
                            `<p>教師未批改之前皆可重交</p>`,
                        );
                        break;
                    }
                    if (studentAnswer[i].score >= 0) {
                        // 有批改過就顯示勾，並且不接受重交
                        $(`#${contentID} .status`).addClass('done');
                        $(`#${contentID} .submitAnswer`).remove();

                        break;
                    }
                }
                break;
        }
    }

    function getAvgScore(studentAnswer) {
        let totalScore = 0;
        let totalRecordNum = 0;
        studentAnswer.forEach((record) => {
            if (record.score >= 0 && record.score != null) {
                totalScore += record.score;
                totalRecordNum++;
            }
        });

        if (totalRecordNum == 0) {
            return -1;
        }

        return Math.round((totalScore * 10) / totalRecordNum) / 10;
    }

    function formattedTime(time) {
        const month = time.getMonth() + 1 > 9 ? time.getMonth() + 1 : '0' + (time.getMonth() + 1);
        const date = time.getDate() > 9 ? time.getDate() : '0' + time.getDate();
        const hour = time.getHours() > 9 ? time.getHours() : '0' + time.getHours();
        const minute = time.getMinutes() > 9 ? time.getMinutes() : '0' + time.getMinutes();
        let formatted_time =
            time.getFullYear() + '-' + month + '-' + date + ' ' + hour + ':' + minute;

        return formatted_time;
    }
}
