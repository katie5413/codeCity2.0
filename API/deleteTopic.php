<?php
session_start();
include "../pdoInc.php";

$topicDataRes = array();

if (isset($_POST['id'])) {

    $deleteTopic = $dbh->prepare('DELETE FROM topic WHERE id = ?');
    $deleteTopic->execute(array($_POST['id']));

    $topicData = array("id" => $_POST['id']);

    $topicDataRes = array("status" => '200', "data" => $topicData);
} else {
    $topicDataRes = array("status" => '404');
}

echo json_encode($topicDataRes);
