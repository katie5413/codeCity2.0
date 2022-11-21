<?php
session_start();
include "../pdoInc.php";


$res = array();
if (isset($_SESSION["userID"]) && isset($_SESSION["userEmail"])) {

    $findUserData = $dbh->prepare('SELECT id, email, name, nickName, avatar, point FROM user WHERE id = ?');
    $findUserData->execute(array($_SESSION["userID"]));
    $userDataItem = $findUserData->fetch(PDO::FETCH_ASSOC);

    if ($findUserData->rowCount() == 1) {
        $attendClass = array();

        // 檢查班級狀態，並存成 array 
        $findUserClass = $dbh->prepare('SELECT * FROM classEnroll INNER JOIN class on classEnroll.class_ID = class.id WHERE user_ID = ?');
        $findUserClass->execute(array($userDataItem["id"]));

        while ($userClassItem = $findUserClass->fetch(PDO::FETCH_ASSOC)) {
            array_push($attendClass, array("classID" => $userClassItem['class_ID'], "classCode" => $userClassItem['class_code'], "className" => $userClassItem['class_name'], "identity" => $userClassItem['identity'], "enrollTime" => $userClassItem['enroll_time']));
        }


        $userData = array("id" => $userDataItem["id"], "email" => $userDataItem["email"], "name" => $userDataItem["name"], "nickName" => $userDataItem["nickName"], "avatar" => $userDataItem["avatar"], "point" => $userDataItem["point"], 'userClass' => $attendClass);

        $userStatus = 1;

        $_SESSION['userID'] = $userDataItem["id"];
        $_SESSION['userEmail'] = $userDataItem["email"];
        $_SESSION['userName'] = $userDataItem["name"];
        $_SESSION['userNickName'] = $userDataItem["nickName"];
        $_SESSION['userAvatar'] = $userDataItem["avatar"];
        $_SESSION['userPoint'] = $userDataItem["point"];
        $_SESSION['userClass'] = $attendClass; // class_ID
    }


    $res = array("status" => '200', "data" => $userData, "user_status" => $userStatus);
} else {
    $res = array("status" => '404');
}

echo json_encode($res);
