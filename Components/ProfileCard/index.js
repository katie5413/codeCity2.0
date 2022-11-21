function updateUserDashBoard(user) {
    if (user.avatar) {
        $('.profileCard .user img').attr('src', user.avatar);
    }

    if (user.name) {
        $('.profileCard .user .userName').text(user.name);
    }

    $('.profileCard .status .point p').text(user.point);
}
