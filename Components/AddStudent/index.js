$('#submitStudentData').on('click', function () {
    let data = JSON.parse($('#studentData').val());
    let classCode = $('#userClassCode input').val();

    $.ajax({
        type: 'POST',
        url: `../../API/checkClassCodeExist.php`,
        data: {
            classCode: classCode,
        },
        dataType: 'json',
        success: function (res) {
            let classStatus = res.open_status;

            switch (classStatus) {
                case -1:
                    console.log(`班級代號不存在`);
                    // 註冊未成功

                    break;
                case 0:
                // 可註冊，並直接登入
                case 1:
                    // 可註冊，但須審核
                    data.forEach((item) => {
                        console.log(item);
                        $.ajax({
                            type: 'POST',
                            url: `../../API/addUser.php`,
                            data: {
                                name: item.name,
                                email: item.email,
                                password: item.password,
                                // nickName: item.nickName,
                                classID: res.class_id,
                                classOpenStatus: 0,
                                classCode: classCode,
                            },
                            dataType: 'json',
                            success: function (res) {
                                console.log(res.data);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log('addUser', jqXHR, textStatus, errorThrown);
                            },
                        });
                    });

                    break;
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('checkClassCodeExist', jqXHR, textStatus, errorThrown);
        },
    });
});
