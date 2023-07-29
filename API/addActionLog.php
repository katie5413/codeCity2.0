<?php
session_start();
include "../pdoInc.php";

$res = array();

if (isset($_POST['actionCode']) && isset($_POST['windowID'])) {

    $actionCodeName = $_POST['actionCode'];
    $window_ID = $_POST['windowID'];
    $user_ID = $_SESSION['userID'];


    if (isset($_POST['point'])) {
        $point = $_POST['point'];
        $addActionLog = $dbh->prepare('INSERT INTO actionLog (user_ID, action_code, window_ID,`point`) VALUES (?, ?, ?,?)');
        $addActionLog->execute(array($user_ID, $actionCodeName, $window_ID, $point));

        $resData = array("userID" => $user_ID, "actionCode" => $_POST['actionCode'], 'windowID' => $window_ID, 'point' => $point);
    } else {
        $addActionLog = $dbh->prepare('INSERT INTO actionLog (user_ID, action_code, window_ID,`point`) VALUES (?, ?, ?,?)');
        $addActionLog->execute(array($user_ID, $actionCodeName, $window_ID, 0));

        $resData = array("userID" => $user_ID, "actionCode" => $_POST['actionCode'], 'windowID' => $window_ID, 'point' => 0);
    }




    $res = array("status" => '200', "data" => $resData);
} else {
    $res = array("status" => '404');
}

echo json_encode($res);

// SELECT `user_ID`,`action_code`,`submit_time`,`window_ID`, `name` FROM `actionLog` inner join `user` on actionLog.user_ID =  user.id Where `user_ID` in (SELECT classEnroll.user_ID
// FROM `classEnroll` 
// INNER JOIN `user` 
// ON user.id = classEnroll.user_ID
// WHERE `class_ID` <= 3 AND `identity` != 1)