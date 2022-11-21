<?php
session_start();
include "../pdoInc.php";


$res = array();
if (isset($_SESSION['userID'])) {
    // getActionLog
    $findActionLog = $dbh->prepare('SELECT action_code FROM actionLog WHERE user_ID = ? AND action_code LIKE ? AND submit_time > ?');
    $findActionLog->execute(array($_SESSION['userID'], 'getTodayAward', GETDATE()));

    $actionLogItem = $findActionLog->fetch(PDO::FETCH_ASSOC);

    if ($findActionLog->rowCount() > 0) {
        // 領過
        $getTodayAward = true;
    } else {
        $getTodayAward = false;
    }


    $res = array("status" => '200', "getTodayAward" => $getTodayAward);
} else {
    $res = array("status" => '404');
}

echo json_encode($res);
