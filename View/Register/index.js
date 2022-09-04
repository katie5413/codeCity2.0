window.onload = function () {
    google.accounts.id.initialize({
        client_id: '685825699644-gou84ncq4etnkgmoof1ri4mb0b8171ai.apps.googleusercontent.com',
        callback: handleCredentialResponse,
    });
};

function handleCredentialResponse(response) {
    const responsePayload = jwt_decode(response.credential);

    $('#userEmail input').val(responsePayload.email);
    $('#userName input').val(responsePayload.name);
    $('#userAvatar').attr('src', responsePayload.picture);
    $('#userNickName input').val(responsePayload.given_name);
}

$(document).ready(function () {
    // welcome animation
    setTimeout(function () {
        $('#loader').fadeOut(1000);
    }, 1000);

    $('#parallax').animate({ scrollTop: document.body.scrollHeight }, { duration: 0 });

    setTimeout(function () {
        $('#registerTab .wrapper').fadeIn(1000);
        $('#parallax').animate({ scrollTop: 0 }, { duration: 6000 });
    }, 2000);
    // welcome animation end

    // 上傳圖片
    $('#upload_user_img').change(function () {
        var file = this.files[0];
        //用size属性判断文件大小不能超过5M ，前端直接判断的好处，免去服务器的压力。
        if (file.size > 5 * 1024 * 1024) {
            setFieldFeedback($('#registerTab'), `圖片不可超過 5MB`, 'error');
        }

        var reader = new FileReader();
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 base64 DataURL
            var base64 = reader.result;

            $('#userAvatar').attr('src', base64);
        };
        reader.readAsDataURL(file);
    });

    $('#profileAvatar label').on('click', function () {
        clearFieldFeedback($('#registerTab'));
    });

    $('#registerBtn').on('click', function () {
        const name = $('#userName input').val();
        const email = $('#userEmail input').val();
        const password = $('#userPassword input').val();
        const passwordCheck = $('#userPasswordCheck input').val();
        const nickName = $('#userNickName input').val() || null;
        const avatar = $('#userAvatar').attr('src');
        const classCode = $('#userClassCode input').val().toUpperCase() || null;
        let valid = true;

        const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;

        $('#registerTab .mustFill').each(function (index) {
            const value = $(this).val().trim();
            // 如果有更動就消除紅匡
            $(this)
                .parent()
                .on('click input', function () {
                    $(this).removeClass('alert');
                    clearFieldFeedback($('#registerTab'));
                });
            if (value == '') {
                setFieldFeedback($('#registerTab'), `${$(this).prev().prev().text()}`, 'error');
                $(this).parent().addClass('alert');
                $(this).focus();

                valid = false;
                return valid;
            }

            if ($(this).hasClass('emailVerify')) {
                if (value.search(emailRule) == -1) {
                    setFieldFeedback($('#registerTab'), `信箱格式不正確`, 'error');
                    $(this).parent().addClass('alert');
                    $(this).focus();
                    valid = false;
                    return valid;
                }
            }

            if ($(this).hasClass('passwordVerify')) {
                if (password != passwordCheck) {
                    setFieldFeedback($('#registerTab'), `兩次密碼不相符`, 'error');
                    $(this).parent().addClass('alert');
                    $(this).focus();
                    valid = false;

                    return valid;
                }
            }
        });

        if (valid) {
            if (classCode != null) {
                $.ajax({
                    type: 'POST',
                    url: `../../API/checkClassCodeExist.php`,
                    data: {
                        classCode: classCode,
                    },
                    dataType: 'json',
                    success: function (res) {
                        const classStatus = res.open_status;
                        const classID = res.class_id;

                        switch (classStatus) {
                            case -1:
                                // 註冊未成功
                                $('#userClassCode').addClass('alert');
                                $('#userClassCode input').focus();
                                setFieldFeedback($('#registerTab'), `班級代號不存在`, 'error');

                                $('#userClassCode input').on('click input', function () {
                                    $(this).parent().removeClass('alert');
                                    clearFieldFeedback($('#registerTab'));
                                });

                                break;
                            case 0:
                            // 可註冊，並直接登入
                            case 1:
                                // 可註冊，但須審核
                                $.ajax({
                                    type: 'POST',
                                    url: `../../API/addUser.php`,
                                    data: {
                                        name: name,
                                        email: email,
                                        password: password,
                                        nickName: nickName,
                                        avatar: avatar,
                                    },
                                    dataType: 'json',
                                    success: function (res) {
                                        if (res.user_status == 1) {
                                            console.log('addUser success', res.data);

                                            applyClass({
                                                classID,
                                                email,
                                                classOpenStatus: classStatus,
                                            });
                                        } else {
                                            $('#userEmail').addClass('alert');
                                            $('#userEmail input').focus();
                                            setFieldFeedback(
                                                $('#registerTab'),
                                                `信箱已被註冊`,
                                                'error',
                                            );

                                            $('#userEmail input').on('click input', function () {
                                                $(this).parent().removeClass('alert');
                                                clearFieldFeedback($('#registerTab'));
                                            });
                                        }
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        console.log('signUp', jqXHR, textStatus, errorThrown);
                                    },
                                });

                                break;
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('checkClassCodeExist', jqXHR, textStatus, errorThrown);
                    },
                });
            } else {
                $.ajax({
                    type: 'POST',
                    url: `../../API/addUser.php`,
                    data: {
                        name: name,
                        email: email,
                        password: password,
                        nickName: nickName,
                        avatar: avatar,
                    },
                    dataType: 'json',
                    success: function (res) {
                        if (res.user_status == 1) {
                            window.location.href = '../Map';
                        } else {
                            $('#userEmail').addClass('alert');
                            $('#userEmail input').focus();
                            setFieldFeedback($('#registerTab'), `信箱已被註冊`, 'error');

                            $('#userEmail input').on('click input', function () {
                                $(this).parent().removeClass('alert');
                                clearFieldFeedback($('#registerTab'));
                            });
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log('signUp', jqXHR, textStatus, errorThrown);
                    },
                });
            }
        }
    });

    function applyClass({ classID, email, classOpenStatus }) {
        $.ajax({
            type: 'POST',
            url: `../../API/applyClass.php`,
            data: {
                classID,
                email,
                classOpenStatus,
            },
            dataType: 'json',
            success: function (res) {
                console.log('applyClass success', res.data);
                window.location.href = '../Map';
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('applyClassFail', jqXHR, textStatus, errorThrown);
            },
        });
    }
});
