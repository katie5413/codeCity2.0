function lessonContentModel(data, field) {
    data.forEach((item) => {
        let contentID = `${item.type}${item.id}`;
        switch (item.type) {
            case 'markdown':
                marked.use({
                    renderer: CodeCityExtension,
                });

                field.append(
                    `<div class="markdownArea section">${marked.parse(item.content)}</div>`,
                );
                break;
            case 'multipleChoice':
            case 'singleChoice':
                const multipleChoiceTemplate = `
                    <div id="{{quizTypeId}}" class="section quiz {{quizType}}" data-feedback="false">
                        <div class="halfCircle"></div>
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
                function generateMultipleChoice({ quizTypeId, id, quizType, content }) {
                    let template = multipleChoiceTemplate;
                    let optionHTML = ``;

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
                    });
                }

                field.append(
                    generateMultipleChoice({
                        id: item.id,
                        quizTypeId: `${contentID}`,
                        quizType: item.type,
                        content: item.content,
                    }),
                );

                // 重新註冊事件
                activeFeedBack(field);

                // 檢查是否作答過
                if (item.content.studentAnswer.length > 0) {
                    for (let i = 0; i < item.content.studentAnswer.length; i++) {
                        $(`#${item.type}${item.id}-${item.content.studentAnswer[i]}`).click();
                    }
                }

                if (checkAnswerSame(item.content.answer, item.content.studentAnswer)) {
                    $(`#${contentID} .status`).addClass('done');
                    $(`#${contentID} .submitAnswer`).remove();
                }

                function checkAnswerSame(answer, studentAnswer) {
                    let count = 0;
                    if (answer.length != studentAnswer.length) return false;
                    for (let i = 0; i < studentAnswer.length; i++) {
                        if (answer.includes(studentAnswer[i])) {
                            count++;
                        }

                        if (count == answer.length) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }

                $(`#${contentID} .submitAnswer`).on('click', function () {
                    let selectItem = $(`#${contentID}`).find('input[type="checkbox"]:checked');
                    let userAnswer = [];

                    // 檢查答案數量
                    if (selectItem.length == 0) {
                        // 一個都沒選的話，不會送到後台
                        setFieldFeedback($(`#${contentID}`), '請選擇答案', 'error');
                    } else {
                        let count = 0;
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
                            $(`#${contentID} .status`).addClass('done');
                            // 答對就不要再送了

                            $(`#${contentID} .submitAnswer`).remove();
                        } else {
                            setFieldFeedback($(`#${contentID}`), '再檢查一下吧', 'error');
                        }

                        checkLessonStatus();
                        // TODO: 不管對不對都要送「userAnswer」到後台
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

                function generateFillBlank({ id, quizTypeId, quizType, content }) {
                    let template = fillBlankTemplate;
                    let optionHTML = ``;

                    if (content.quizImageAlt) {
                        template = template.replace(
                            '<div class="content-img-content"></div>',
                            `<div class="content-img-content"><small>${content.quizImageAlt}</small></div>`,
                        );
                    } else {
                        template = template.replace('<div class="content-img-content">', '');
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
                    });
                }

                field.append(
                    generateFillBlank({
                        id: item.id,
                        quizTypeId: `${contentID}`,
                        quizType: item.type,
                        content: item.content,
                    }),
                );

                // 重新註冊事件
                activeFeedBack(field);

                // 檢查是否作答過
                if (item.content.studentAnswer.length > 0) {
                    for (let i = 0; i < item.content.studentAnswer.length; i++) {
                        $(`#${item.type}${item.id}-${i}`).attr(
                            'value',
                            item.content.studentAnswer[i],
                        );
                    }
                }

                if (checkFillBlankAnswerSame(item.content.answer, item.content.studentAnswer)) {
                    $(`#${contentID} .status`).addClass('done');
                    $(`#${contentID} .submitAnswer`).remove();
                }

                function checkFillBlankAnswerSame(answer, studentAnswer) {
                    let count = 0;
                    if (answer.length != studentAnswer.length) return false;
                    for (let i = 0; i < answer.length; i++) {
                        if (answer[i].ans.includes(studentAnswer[i])) {
                            count++;
                        }
                    }

                    if (count == answer.length) {
                        return true;
                    } else {
                        return false;
                    }
                }

                $(`#${contentID} .submitAnswer`).on('click', function () {
                    let selectItem = $(`#${contentID} .input`);
                    let userAnswer = [];

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
                        if (checkFillBlankAnswerSame(item.content.answer, userAnswer)) {
                            $(`#${contentID} .status`).addClass('done');
                            $(`#${contentID} .submitAnswer`).remove();
                        } else {
                            setFieldFeedback($(`#${contentID}`), '再檢查一下吧', 'error');
                        }

                        checkLessonStatus();
                        // TODO: 不管對不對都要送「userAnswer」到後台
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
                            <span class="icon"></span />
                            <span class="text">error message</span>
                        </div>
                        <button class="submitAnswer quiz-{{quizType}} button btn-secondary hide">提交</button>
                    </div>
                    <div class="status"></div>
                </div>
                `;

                function generateUploadImage({ quizTypeId, id, quizType, content }) {
                    let template = uploadImageTemplate;

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
                    });
                }

                field.append(
                    generateUploadImage({
                        id: item.id,
                        quizTypeId: `${contentID}`,
                        quizType: item.type,
                        content: item.content,
                    }),
                );

                // 檢查是否作答過
                if (item.content.studentAnswer.length > 0) {
                    $(`#${contentID} .uploadImageArea .imageSubmit`).attr(
                        'src',
                        item.content.studentAnswer[0].content,
                    );

                    if (item.content.studentAnswer[0].score) {
                        $(`#${contentID} .status`).addClass('done');
                    } else {
                        $(`#${contentID} .status`).addClass('wait');
                    }
                }

                // 重新註冊事件
                activeFeedBack(field);

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
                    $(`#${contentID} .status`).addClass('wait');
                    $(`#${contentID} .submitAnswer`).remove();
                    checkLessonStatus();
                    // TODO: 把資料送到後端
                });

                break;
            case 'textArea':
                const textAreaTemplate = `
                <div id="{{quizTypeId}}" class="section quiz {{quizType}}" data-feedback="false">
                    <div class="halfCircle"></div>
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

                function generateTextArea({ quizTypeId, id, quizType, content }) {
                    let template = textAreaTemplate;

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
                    });
                }

                field.append(
                    generateTextArea({
                        id: item.id,
                        quizTypeId: `${contentID}`,
                        quizType: item.type,
                        content: item.content,
                    }),
                );

                // 檢查是否作答過
                if (item.content.studentAnswer.length > 0) {
                    $(`#${contentID}Input`)[0].value = item.content.studentAnswer[0];

                    if (item.content.studentAnswer[0].score) {
                        $(`#${contentID} .status`).addClass('done');
                    } else {
                        $(`#${contentID} .status`).addClass('wait');
                    }
                }

                // 重新註冊事件
                activeFeedBack(field);

                $(`#${contentID} .submitAnswer`).on('click', function () {
                    let selectItem = $(`#${contentID} .input`);
                    let userAnswer = [];

                    for (let i = 0; i < selectItem.length; i++) {
                        if (selectItem[i].value.length > 0) {
                            userAnswer.push(selectItem[i].value);

                            $(`#${contentID} .status`).addClass('wait');
                            $(`#${contentID} .submitAnswer`).remove();

                            checkLessonStatus();

                            // TODO: 有填才會送資料到後台
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
            case '':
                break;
        }
    });

    // 塞完之後檢查任務完成狀況
    checkLessonStatus();

    function checkLessonStatus() {
        $('#currentFinishNum').text($('.quiz > .status.done').length);
        $('#totalNum').text($('.quiz > .status:not(.done,.wait)').length);
        $('#waitForScoreNum').text($('.quiz > .status.wait').length);
    }
}
