<?php
session_start();
include "../pdoInc.php";

$lessonDataRes = array();

if (isset($_POST['name']) && isset($_POST['topic_ID'])) {

    $topicID = $_POST['topic_ID'];
    $name = $_POST['name'];
    $introduction = $_POST['introduction'];
    $contentOrder = $_POST['contentOrder'];


    $addLesson = $dbh->prepare('INSERT INTO lesson (topic_ID, title, introduction,content_order ) VALUES (?, ?, ?, ?)');
    $addLesson->execute(array($topicID, $name, $introduction, $contentOrder));

    $lessonData = array("name" => $name, "introduction" => $introduction);

    $lessonDataRes = array("status" => '200', "data" => $lessonData);
} else {
    $lessonDataRes = array("status" => '404');
}

echo json_encode($lessonDataRes);
