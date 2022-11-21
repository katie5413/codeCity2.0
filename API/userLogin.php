<?php
session_start();
include "../pdoInc.php";


$userDataRes = array();
if (isset($_POST['loginType'])) {
    switch ($_POST['loginType']) {
        case 'normal':
            $findUserData = $dbh->prepare('SELECT * FROM user WHERE email = ? and pwd = ?');
            $findUserData->execute(array($_POST['email'], md5($_POST['password'])));
            $userDataItem = $findUserData->fetch(PDO::FETCH_ASSOC);
            break;

        case 'google':
            $findUserData = $dbh->prepare('SELECT * FROM user WHERE email = ?');
            $findUserData->execute(array($_POST['email']));
            $userDataItem = $findUserData->fetch(PDO::FETCH_ASSOC);
            break;
    }

    $loginStatus = 0;
    $userData = array();
    if ($findUserData->rowCount() == 1) {
        $attendClass = array();

        // 檢查班級狀態，並存成 array 
        $findUserClass = $dbh->prepare('SELECT * FROM classEnroll INNER JOIN class on classEnroll.class_ID = class.id WHERE user_ID = ?');
        $findUserClass->execute(array($userDataItem["id"]));

        while ($userClassItem = $findUserClass->fetch(PDO::FETCH_ASSOC)) {
            array_push($attendClass, array("classID" => $userClassItem['class_ID'], "classCode" => $userClassItem['class_code'], "className" => $userClassItem['class_name'], "identity" => $userClassItem['identity'], "enrollTime" => $userClassItem['enroll_time']));
        }

        $loginStatus = 1;
        $userData = array("id" => $userDataItem["id"], "email" => $userDataItem["email"], "name" => $userDataItem["name"], "nickName" => $userDataItem["nickName"], "avatar" => $userDataItem["avatar"], "point" => $userDataItem["point"], 'userClass' => $attendClass);
    }

    $_SESSION['userID'] = $userDataItem["id"];
    $_SESSION['userEmail'] = $userDataItem["email"];
    $_SESSION['userName'] = $userDataItem["name"];
    $_SESSION['userNickName'] = $userDataItem["nickName"];
    $_SESSION['userAvatar'] = $userDataItem["avatar"];
    $_SESSION['userPoint'] = $userDataItem["point"];
    $_SESSION['userClass'] = $attendClass; // class_ID

    $userDataRes = array("status" => '200', "data" => $userData, "login_status" => $loginStatus);
} else {
    $userDataRes = array("status" => '404');
}

echo json_encode($userDataRes);
