<?php
session_start();
include "../pdoInc.php";


$res = array();

if (isset($_POST['lessonID'])) {
    // getLesson
    $findLessonData = $dbh->prepare('SELECT id, topic_ID, title  FROM lesson WHERE id = ?');
    $findLessonData->execute(array($_POST['lessonID']));

    while ($lessonDataItem = $findLessonData->fetch(PDO::FETCH_ASSOC)) {

        $findTopicData = $dbh->prepare('SELECT id, title  FROM topic WHERE id = ?');
        $findTopicData->execute(array($lessonDataItem["topic_ID"]));

        while ($topicDataItem = $findTopicData->fetch(PDO::FETCH_ASSOC)) {

            $data = array("topicID" => $topicDataItem["id"], "topicName" => $topicDataItem["title"], "lessonID" => $lessonDataItem["id"], "lessonName" => $lessonDataItem["title"]);


        }
    }
    $res = array("status" => '200', "data" => $data);
}

echo json_encode($res);
