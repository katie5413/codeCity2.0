<?php
session_start();
include "../pdoInc.php";


$res = array();
if (isset($_SESSION['userID'])) {
    // getActionLog
    $findActionLog = $dbh->prepare('SELECT action_code, submit_time FROM actionLog WHERE user_ID = ? AND action_code LIKE ? AND submit_time > ?');
    $findActionLog->execute(array($_SESSION['userID'], 'getTodayAward', date("Y-m-d")));

    $getTodayAward = false;

    while ($actionLogItem = $findActionLog->fetch(PDO::FETCH_ASSOC)) {

        $getTodayAward = true;
    }



    $res = array("status" => '200', "getTodayAward" => $getTodayAward, "today" => date("Y-m-d"), 'studentID' => $_SESSION['userID']);
} else {
    $res = array("status" => '404');
}

echo json_encode($res);
