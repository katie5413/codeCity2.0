<?php
session_start();
include "../pdoInc.php";


$res = array();

if (isset($_POST['topicID'])) {
    $findTopicData = $dbh->prepare('SELECT id, title  FROM topic WHERE id = ?');
    $findTopicData->execute(array($_POST['topicID']));

    while ($topicDataItem = $findTopicData->fetch(PDO::FETCH_ASSOC)) {

        $data = array("topicID" => $topicDataItem["id"], "topicName" => $topicDataItem["title"]);
    }
    $res = array("status" => '200', "data" => $data);
}

echo json_encode($res);
