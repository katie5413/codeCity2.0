<?php
session_start();
include "../pdoInc.php";


$lessonData = array();

if (isset($_POST['topic_ID'])) {

    // getLessonContent
    $findLessonData = $dbh->prepare('SELECT * FROM lesson WHERE topic_ID = ? ORDER BY content_order');
    $findLessonData->execute(array($_POST['topic_ID']));

    $lessonDataArr = array();
    while ($lessonDataItem = $findLessonData->fetch(PDO::FETCH_ASSOC)) {
        $lessonData = array("id" => $lessonDataItem["id"], "name" => $lessonDataItem["title"], "description" => $lessonDataItem["introduction"], "contentOrder" => $lessonDataItem["content_order"]);

        array_push($lessonDataArr, $lessonData);
    }
    $lessonData = array("status" => '200', "data" => $lessonDataArr);
}

echo json_encode($lessonData);
