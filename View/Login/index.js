window.onload = function () {
    google.accounts.id.initialize({
        client_id: '685825699644-gou84ncq4etnkgmoof1ri4mb0b8171ai.apps.googleusercontent.com',
        callback: handleCredentialResponse,
    });
};

function handleCredentialResponse(response) {
    const responsePayload = jwt_decode(response.credential);

    $.ajax({
        type: 'POST',
        url: `../../API/userLogin.php`,
        data: {
            email: responsePayload.email,
            loginType: 'google',
        },
        dataType: 'json',
        success: function (res) {
            if (res.login_status == 1) {
                window.location.href = '../Map';
            } else {
                $('#userEmail').addClass('alert');
                $('#userEmail input').focus();
                setFieldFeedback($('#loginTab'), `帳號或密碼錯誤`, 'error');

                $('#userEmail input').on('click input', function () {
                    $(this).parent().removeClass('alert');
                    clearFieldFeedback($('#loginTab'));
                });
            }
        },
    });
}

$(document).ready(function () {
    // welcome animation
    setTimeout(function () {
        $('#loader').fadeOut(1000);
    }, 1000);

    $('#parallax').animate({ scrollTop: document.body.scrollHeight }, { duration: 0 });

    setTimeout(function () {
        $('#loginTab .wrapper').fadeIn(1000);
        $('#parallax').animate({ scrollTop: 0 }, { duration: 6000 });
    }, 2000);
    // welcome animation end

    // login authorization
    // note: google login plz check dependencies/googleIdentity

    $('#loginBtn').on('click', function () {
        const email = $('#userEmail input').val();
        const password = $('#userPassword input').val();
        let errorMsgText = '';
        let valid = true;

        if (email.length === 0) {
            $('#userEmail').addClass('alert');
            errorMsgText += '信箱、';
            valid = false;
        }

        if (password.length === 0) {
            $('#userPassword').addClass('alert');
            errorMsgText += '密碼、';
            valid = false;
        }

        if (valid) {
            $.ajax({
                type: 'POST',
                url: `../../API/userLogin.php`,
                data: {
                    email: email,
                    password: password,
                    loginType: 'normal',
                },
                dataType: 'json',
                success: function (res) {
                    if (res.login_status == 1) {
                        window.location.href = '../Map';
                    } else {
                        $('#userEmail').addClass('alert');
                        $('#userEmail input').focus();
                        setFieldFeedback($('#loginTab'), `帳號或密碼錯誤`, 'error');

                        $('#userEmail input').on('click input', function () {
                            $(this).parent().removeClass('alert');
                            clearFieldFeedback($('#loginTab'));
                        });
                    }
                },
            });
        } else {
            errorMsgText = errorMsgText.slice(0, -1);
            setFieldFeedback($('#loginTab'), `${errorMsgText}必填`, 'error');

            $('#loginTab .formInput').on('click', function () {
                $(this).removeClass('alert');
                clearFieldFeedback($('#loginTab'));
            });
        }
    });
});
