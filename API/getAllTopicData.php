<?php
session_start();
include "../pdoInc.php";


$topicData = array();

// getLessonContent
$findTopicData = $dbh->prepare('SELECT * FROM topic ORDER BY orderNum');
$findTopicData->execute(array());

$topicDataArr = array();
while ($topicDataItem = $findTopicData->fetch(PDO::FETCH_ASSOC)) {
    $topicData = array("id" => $topicDataItem["id"], "name" => $topicDataItem["title"], "description" => $topicDataItem["introduction"]);

    array_push($topicDataArr, $topicData);
}
$topicData = array("status" => '200', "data" => $topicDataArr);
echo json_encode($topicData);
