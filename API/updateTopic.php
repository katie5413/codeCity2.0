<?php
session_start();
include "../pdoInc.php";

$topicDataRes = array();

if (isset($_POST['name']) && isset($_POST['id'])) {

    $name = $_POST['name'];
    $introduction = $_POST['introduction'];


    $updateTopic = $dbh->prepare('UPDATE topic SET title = ?, introduction = ? WHERE id = ?');
    $updateTopic->execute(array($name, $introduction, $_POST['id']));

    $topicData = array("name" => $name, "introduction" => $introduction,);

    $topicDataRes = array("status" => '200', "data" => $topicData);
} else {
    $topicDataRes = array("status" => '404');
}

echo json_encode($topicDataRes);
