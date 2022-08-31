<?php
session_start();
include "../pdoInc.php";

$res = array();

if (isset($_POST['name']) && isset($_POST['id'])) {

    $name = $_POST['name'];
    $introduction = $_POST['introduction'];
    $contentOrder = $_POST['contentOrder'];


    $updateLesson = $dbh->prepare('UPDATE lesson SET title = ?, introduction = ?, content_order = ? WHERE id = ?');
    $updateLesson->execute(array($name, $introduction, $contentOrder, $_POST['id']));

    $lessonData = array("name" => $name, "introduction" => $introduction, 'contentOrder' => $contentOrder);

    $res = array("status" => '200', "data" => $lessonData);
} else {
    $res = array("status" => '404');
}

echo json_encode($res);
