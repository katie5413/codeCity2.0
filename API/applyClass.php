<?php
session_start();
include "../pdoInc.php";


$res = array();
if (isset($_POST['classID']) && isset($_POST['classOpenStatus'])) {


    $classOpenStatus = $_POST["classOpenStatus"] || 1;

    if ($_POST['email']) {
        $findUserData = $dbh->prepare('SELECT id, `name` FROM user WHERE email = ?');
        $findUserData->execute(array($_POST['email']));
        $userDataItem = $findUserData->fetch(PDO::FETCH_ASSOC);

        $userID  = $userDataItem['id'];
    }

    if ($_POST["userID"]) {
        $findUserData = $dbh->prepare('SELECT id, `name` FROM user WHERE id = ?');
        $findUserData->execute(array($_POST['userID']));
        $userDataItem = $findUserData->fetch(PDO::FETCH_ASSOC);

        $userID  = $userDataItem['id'];
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


    $resData = array('id' => $userID);

    $userDataStatus = 1;
    $res = array("status" => '200', "data" => $resData);
} else {
    $res = array("status" => '404');
}

echo json_encode($res);
