<?php
session_start();
include "../pdoInc.php";

$lessonContentDataRes = array();

if (isset($_POST['lesson_ID']) && isset($_POST['contentType']) && isset($_POST['content']) && isset($_POST['contentOrder'])) {

    $lessonID = $_POST['lesson_ID'];
    $contentType = $_POST['contentType'];
    $content = $_POST['content'];
    $contentOrder = $_POST['contentOrder'];


    $addLessonContent = $dbh->prepare('INSERT INTO lessonContent (lesson_ID, contentType, content,content_order ) VALUES (?, ?, ?, ?)');
    $addLessonContent->execute(array($lessonID, $contentType, $content, $contentOrder));

    $lessonContentData = array("contentType" => $contentType, "content" => $content);

    $lessonContentDataRes = array("status" => '200', "data" => $lessonContentData);
} else {
    $lessonContentDataRes = array("status" => '404');
}

echo json_encode($lessonContentDataRes);
