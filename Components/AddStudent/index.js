$(document).ready(function () {
    $('#submitStudentData').on('click', function () {
        let data = JSON.parse($('#studentData').val());
        let classCode = $('#userClassCode input').val();

        console.log('click', data, classCode);

        $.ajax({
            type: 'POST',
            url: `../../API/checkClassCodeExist.php`,
            data: {
                classCode: classCode,
            },
            dataType: 'json',
            success: function (res) {
                console.log(res);
                const classStatus = res.open_status;

                const classID = res.class_id;

                switch (classStatus) {
                    case -1:
                        console.log(`班級代號不存在`);
                        // 註冊未成功

                        break;
                    default:
                        // 可註冊，並直接登入
                        data.forEach((item) => {
                            addUser({
                                ...item,
                                classID: classID,
                            });
                        });

                        break;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('checkClassCodeExistFail', jqXHR, textStatus, errorThrown);
            },
        });
    });

    function addUser({ name, email, password, classID }) {
        $.ajax({
            type: 'POST',
            url: `../../API/addUser.php`,
            data: {
                name,
                email,
                password,
            },
            dataType: 'json',
            success: function (res) {
                console.log('addUser success', res.data);

                applyClass({ classID, email });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('addUserFail', jqXHR, textStatus, errorThrown);
            },
        });
    }

    function applyClass({ classID, email }) {
        $.ajax({
            type: 'POST',
            url: `../../API/applyClass.php`,
            data: {
                classID,
                email,
                classOpenStatus: 0,
            },
            dataType: 'json',
            success: function (res) {
                console.log('applyClass success', res.data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('applyClassFail', jqXHR, textStatus, errorThrown);
            },
        });
    }
});
