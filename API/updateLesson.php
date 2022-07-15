<?php
session_start();
include "../pdoInc.php";

$lessonDataRes = array();

if (isset($_POST['name']) && isset($_POST['id'])) {

    $name = $_POST['name'];
    $introduction = $_POST['introduction'];
    $contentOrder = $_POST['contentOrder'];


    $updateLesson = $dbh->prepare('UPDATE lesson SET title = ?, introduction = ?, contentOrder = ? WHERE id = ?');
    $updateLesson->execute(array($name, $introduction, $contentOrder, $_POST['id']));

    $lessonData = array("name" => $name, "introduction" => $introduction,);

    $lessonDataRes = array("status" => '200', "data" => $lessonData);
} else {
    $lessonDataRes = array("status" => '404');
}

echo json_encode($lessonDataRes);
