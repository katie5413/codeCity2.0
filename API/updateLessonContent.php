<?php
session_start();
include "../pdoInc.php";

$lessonContentDataRes = array();

if (isset($_POST['id']) && isset($_POST['content']) && isset($_POST['contentOrder'])) {

    $ID = $_POST['id'];
    $content = $_POST['content'];
    $contentOrder = $_POST['contentOrder'];


    $updateLessonContent = $dbh->prepare('UPDATE lessonContent SET content = ?, content_order = ?  WHERE id = ?');
    $updateLessonContent->execute(array($content, $contentOrder, $ID));

    $lessonContentData = array("contentType" => $contentType, "content" => $content);

    $lessonContentDataRes = array("status" => '200', "data" => $lessonContentData);
} else {
    $lessonContentDataRes = array("status" => '404');
}

echo json_encode($lessonContentDataRes);
