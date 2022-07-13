<?php
session_start();
include "../pdoInc.php";

$topicDataRes = array();

if (isset($_POST['name'])) {

    $name = $_POST['name'];
    $introduction = $_POST['introduction'];


    $addTopic = $dbh->prepare('INSERT INTO topic (title, introduction ) VALUES (?, ?)');
    $addTopic->execute(array($name, $introduction));

    $topicData = array("name" => $name, "introduction" => $introduction);

    $topicDataRes = array("status" => '200', "data" => $topicData);
} else {
    $topicDataRes = array("status" => '404');
}

echo json_encode($topicDataRes);
