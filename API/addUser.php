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

        $avatar = isset($_POST['avatar']) ? $_POST['avatar'] : null;
        $nickName = isset($_POST['nickName']) ? $_POST['nickName'] : null;

        $addUser = $dbh->prepare('INSERT INTO user (email, name, nickName, avatar, pwd ) VALUES (?, ?, ?,?,?)');
        $addUser->execute(array($_POST['email'], $_POST['name'], $nickName, $avatar, md5($_POST['password'])));

        $userData = array('email' => $_POST['email'], "name" => $_POST['name']);
        $userDataStatus = 1;

        $userDataRes = array("status" => '200', "data" => $userData, 'user_status' => $userDataStatus);
    }
} else {
    $userDataRes = array("status" => '404');
}

echo json_encode($userDataRes);
