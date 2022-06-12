<?php
session_start();
include "../pdoInc.php";


$userDataRes = array();
$topicStatus = 0;
if (isset($_POST['topicID']) && isset($_POST['classID']) && isset($_SESSION["userID"])) {

    $_SESSION['topicID'] = $_POST['topicID'];
    $topicStatus = 1;

    $userDataRes = array("status" => '200', "data" => $topicData, "topic_status" => $topicStatus);
} else {
    $userDataRes = array("status" => '404');
}

echo json_encode($userDataRes);
