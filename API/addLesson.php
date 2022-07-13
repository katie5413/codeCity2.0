<?php
session_start();
include "../pdoInc.php";

$topicDataRes = array();

if (isset($_POST['name'])&&isset($_POST['topic_ID'])) {

    $topicID = $_POST['topic_ID'];
    $name = $_POST['name'];
    $introduction = $_POST['introduction'];



    $addLesson = $dbh->prepare('INSERT INTO topic (title, introduction ) VALUES (?, ?)');
    $addLesson->execute(array($name, $introduction));

    $topicData = array("name" => $name, "introduction" => $introduction);

    $topicDataRes = array("status" => '200', "data" => $topicData);
} else {
    $topicDataRes = array("status" => '404');
}

echo json_encode($topicDataRes);
