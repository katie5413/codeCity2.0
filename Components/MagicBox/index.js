// ['1','2',...]
function luckyDraw({ studentData, quantity }) {
    let list = [];

    for (let i = 0; i < quantity.length; i++) {
        chooseOne({ data: studentData });
    }

    return list.map((item) => studentData[item]);

    // 回傳 index ，並檢查是否有重複
    function chooseOne({ data }) {
        let index = Math.random() * data.length;
        if (list.indexOf(index) > -1) {
            return chooseOne({ data });
        } else {
            list.push(index);
        }
    }
}

function activeMagicBox() {
    $('#magicBox').addClass('active');
    $('#luckyDrawBtn').on('click', function () {
        openModal({
            targetModal: $(`#luckyDrawModal`),
            // actionType: actionType,
            modalTitle: `抽人`,
        });

        // studentList
        function getStudentData({ classID }) {
            $.ajax({
                type: 'POST',
                url: `../../API/getStudentListByClassID.php`,
                data: {
                    class_ID: classID,
                },
                dataType: 'json',
                success: function (res) {
                    // 塞表格內容
                    studentData = res.data;
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('getStudentListByClassID Fail', jqXHR, textStatus, errorThrown);
                },
            });
        }
    });
}

$(document).on('click', '.dropMenuBox', function () {
    // remove active when click item already has active
    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
    } else {
        // remove other's class when it has active
        $('.dropMenuBox.active').removeClass('active');
        // active click item
        $(this).toggleClass('active');
    }

    $(this)
        .find('.selectItems')
        .children()
        .each(function () {
            $(this).show();
        });
    $(this).find('.selectSelected').attr('select-id', '');
});

$(document).on('click', '.dropMenuBox .option', function () {
    $(this).parent().siblings('.selectSelected').val($(this).text());
    $(this).parent().siblings('.selectSelected').attr('select-id', $(this).attr('value'));
});

$(document).on('click', function (e) {
    if ($('.dropMenuBox') !== e.target && !$('.dropMenuBox').has(e.target).length) {
        $('.dropMenuBox').removeClass('active');
    }
});
