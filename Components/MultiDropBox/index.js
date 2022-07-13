function generateMultiDropBox({ allOptions, groupID, extraClassNames = [] }) {
    let multiDropBoxTemplate = `
        <div class="dropContainerMulti {{extraClassName}}">
            <input class="select-selected" readonly type="text" placeholder="請選擇" />
            <img src="../../Images/icon/direction/arrow-right-drop.svg" alt="icon" class="icon">
            <img src="../../Images/icon/general/clear.svg" alt="icon" class="drop__clear">
            <div class="line"></div>
            <div class="select-items"></div>
        </div>
        `;

    let options = '';
    for (let i = 0; i < allOptions.length; i++) {
        options += generateMultiDropBoxOption({
            index: allOptions[i].id,
            name: allOptions[i].name,
            group: `dropContainerMulti-${groupID}`,
        });
    }

    multiDropBoxTemplate = multiDropBoxTemplate.replace(
        '<div class="select-items"></div>',
        `<div class="select-items">${options}</div>`,
    );

    return generateHtml(multiDropBoxTemplate, {
        allOptions,
        groupID,
        extraClassName: extraClassNames.length > 0 ? extraClassNames.join(' ') : ' ',
    });
}

function generateMultiDropBoxOption({ index, name, group }) {
    let multiDropBoxOptionTemplate = `
        <div class="option" data-value={{index}}>
            <label for="{{group}}-{{index}}">
                <span class="text">{{name}}</span>
                <span class="check"></span>
                <input type="checkbox" id="{{group}}-{{index}}" name="{{group}}" />
            </label>
        </div>
        `;

    return generateHtml(multiDropBoxOptionTemplate, {
        index,
        name,
        group,
    });
}

$(document).on('click', '.dropContainerMulti', function () {
    if (!$(this).hasClass('active')) {
        // remove other's class when it has active
        $('.dropContainerMulti.active').removeClass('active');
        // active click item
    }
    $(this).toggleClass('active');
});

$(document).on('click', '.dropContainerMulti .option', function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).find('label').toggleClass('active');
    var selected =
        $(this).parent().siblings('.select-selected').val() == ''
            ? []
            : $(this).parent().siblings('.select-selected').val().split('、');
    var selectedId =
        $(this).parent().siblings('.select-selected').attr('select-id') == '' ||
        $(this).parent().siblings('.select-selected').attr('select-id') == undefined ||
        $(this).parent().siblings('.select-selected').attr('select-id') == 'undefined'
            ? []
            : $(this).parent().siblings('.select-selected').attr('select-id').split(',');
    var currentText = $(this).find('.text').text().trim();
    var currentValue = $(this).attr('data-value');
    if ($(this).find('label').hasClass('active')) {
        selected.push(currentText);
        selectedId.push(currentValue);
    } else {
        selected = selected.filter(function (item) {
            return item != currentText;
        });
        selectedId = selectedId.filter(function (item) {
            return item != currentValue;
        });
    }

    $(this).parent().siblings('.select-selected').val(selected.join('、')).trigger('change');
    $(this).parent().siblings('.select-selected').attr('select-id', selectedId.join(','));
});

$(document).on('click', '.dropContainerMulti .drop__clear', function (e) {
    e.stopPropagation();
    $(this).parent().find('input.select-selected[type="text"]').val('').trigger('change');
    $(this)
        .parent()
        .find('.select-items')
        .children()
        .each(function () {
            $(this).children().removeClass('active');
        });
    $(this).parent().find('.select-selected').attr('select-id', '');
});

$(document).on('click touchstart', function (e) {
    if ($('.dropContainerMulti') !== e.target && !$('.dropContainerMulti').has(e.target).length) {
        // courseManage 的下拉式選單專用
        if ($('.dropContainerMulti.active').hasClass('manageTopicChildrenNode')) {
            let updateID = $('.dropContainerMulti.active').closest('tr').attr('data-topic-id');
            sessionStorage.setItem('updateDataID', updateID);
        }
        $('.dropContainerMulti').removeClass('active');
    }
});
