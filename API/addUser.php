<?php
session_start();
include "../pdoInc.php";


$userDataRes = array();
if (isset($_POST['name']) && isset($_POST['email']) && isset($_POST['password'])) {
    // 先檢查是否重複
    $findUserData = $dbh->prepare('SELECT id FROM user WHERE email = ?');
    $findUserData->execute(array($_POST['email']));
    $userDataItem = $findUserData->fetch(PDO::FETCH_ASSOC);

    if ($findUserData->rowCount() == 1) {
        // 重複
        $userDataStatus = -1;
    } else {

        $classCode = isset($POST['classCode']) ? $POST['classCode'] : null;
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
        }

        // 如果有輸入班級代號，且班級是公開的，才可以加入
        if ($_POST['classOpenStatus'] == 0) {
            date_default_timezone_set("Asia/Taipei");
            $date = date('y-m-d H:i:s'); // h -> 12hr, H -> 24hr
            $addClassEnroll = $dbh->prepare('INSERT INTO classEnroll (class_ID, user_ID, enroll_time,identity)  VALUES (?, ?, ?, ?)');
            $addClassEnroll->execute(array($_POST['classID'], $userID, $date, 0));
        } else if ($_POST['classOpenStatus'] == 1) {
            // 若課程為不公開，一樣會註冊，但不會有 enroll time;
            $addClassEnroll = $dbh->prepare('INSERT INTO classEnroll (class_ID, user_ID,identity)  VALUES (?, ?, ?)');
            $addClassEnroll->execute(array($_POST['classID'], $userID, 0));
        }


        $userData = array('id' => $userID, 'email' => $_POST['email'], "name" => $_POST['name'], "nickName" => $nickName, "avatar" => $avatar, "classCode" => $classCode);
        $_SESSION['userData'] = json_encode($userData);
        $userDataStatus = 1;
    }

    array_push($userDataRes, $userDataStatus);

    $userDataRes = array("status" => '200', "data" => $userData, 'user_status' => $userDataStatus);
} else {
    $userDataRes = array("status" => '404');
}

echo json_encode($userDataRes);
