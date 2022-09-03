<?php
session_start();
include "../pdoInc.php";


$res = array();
$statusMsg = '缺少必要資料';
if (isset($_POST['name']) && isset($_POST['email']) && isset($_POST['password']) && isset($_POST['classID'])) {
    // 先檢查是否重複
    $findUserData = $dbh->prepare('SELECT id FROM user WHERE email = ?');
    $findUserData->execute(array($_POST['email']));
    $userDataItem = $findUserData->fetch(PDO::FETCH_ASSOC);

    if ($findUserData->rowCount() == 1) {
        // 重複
        $statusMsg = '帳號已存在';
    } else {

        $avatar = isset($_POST['avatar']) ? $_POST['avatar'] : null;
        $nickName = isset($_POST['nickName']) ? $_POST['nickName'] : null;

        $addUser = $dbh->prepare('INSERT INTO user (email, name, nickName, avatar, pwd ) VALUES (?, ?, ?,?,?)');
        $addUser->execute(array($_POST['email'], $_POST['name'], $nickName, $avatar, md5($_POST['password'])));


        // 拿 userID
        $findUserID = $dbh->prepare('SELECT id FROM user WHERE email = ?');
        $findUserID->execute(array($_POST['email']));
        $userIDItem = $findUserID->fetch(PDO::FETCH_ASSOC);

        if ($findUserID->rowCount() == 1) {
            $userID = $userIDItem['id'];

            date_default_timezone_set("Asia/Taipei");
            $date = date('y-m-d H:i:s'); // h -> 12hr, H -> 24hr
            $addClassEnroll = $dbh->prepare('INSERT INTO classEnroll (class_ID, user_ID, enroll_time,identity)  VALUES (?, ?, ?, ?)');
            $addClassEnroll->execute(array($_POST['classID'], $userID, $date, 0));
            $statusMsg = '帳號加入班級成功';
        }

        $userData = array('id' => $userID, 'email' => $_POST['email'], "name" => $_POST['name'], "nickName" => $nickName, "avatar" => $avatar);
    }

    $res = array("status" => '200', "data" => $userData, 'user_status' => $statusMsg);
} else {
    $res = array("status" => '404', 'user_status' => $statusMsg);
}

echo json_encode($res);
