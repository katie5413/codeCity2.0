<?php
session_start();
include "../pdoInc.php";

$res = array();

if (isset($_POST['actionCode']) && isset($_POST['windowID'])) {

    $actionCodeName = $_POST['actionCode'];
    $window_ID = $_POST['windowID'];
    $user_ID = $_SESSION['userID'];


    $addActionLog = $dbh->prepare('INSERT INTO actionLog (user_ID, action_code, window_ID) VALUES (?, ?, ?)');
    $addActionLog->execute(array($user_ID, $actionCodeName, $window_ID));


    $resData = array("userID" => $user_ID, "actionCode" => $_POST['actionCode'], 'windowID' => $window_ID);

    $res = array("status" => '200', "data" => $resData);
} else {
    $res = array("status" => '404');
}

echo json_encode($res);
