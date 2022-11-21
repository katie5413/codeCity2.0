<?php
session_start();
include "../pdoInc.php";


$res = array("status" => '404');

if (isset($_SESSION['userID'])) {

    $findLessonContent = $dbh->prepare("SELECT
    homeworkSubmit.id, homeworkSubmit.student_ID , lesson.topic_ID, homeworkSubmit.score, homeworkSubmit.submitTime, homeworkSubmit.content, lessonContent.contentType
    FROM
        `homeworkSubmit`
    INNER JOIN `lessonContent`
    ON homeworkSubmit.homework_ID = lessonContent.id 
    INNER JOIN `lesson`
    ON lessonContent.lesson_ID = lesson.id
    WHERE homeworkSubmit.student_ID = ?
    AND homeworkSubmit.score is NOT NULL
    AND lessonContent.contentType!=?
    AND lessonContent.contentType!=?");
    $findLessonContent->execute(array($_SESSION['userID'],'uploadImage','textArea'));

    $lessonContentArr = array();
    while ($lessonContentItem = $findLessonContent->fetch(PDO::FETCH_ASSOC)) {
        $lessonContent = array("id" => $lessonContentItem["id"], "type" => $lessonContentItem["contentType"], "content" => json_decode($lessonContentItem["content"]));

        array_push($lessonContentArr, $lessonContent);
    }
    $res = array("status" => '200', "data" => $lessonContentArr);}

echo json_encode($res);


// SELECT
//     homeworkSubmit.id, homeworkSubmit.student_ID , lesson.topic_ID, homeworkSubmit.score, homeworkSubmit.submitTime, homeworkSubmit.content, lessonContent.contentType
// FROM
//     `homeworkSubmit`
// INNER JOIN `lessonContent`
// ON homeworkSubmit.homework_ID = lessonContent.id 
// INNER JOIN `lesson`
// ON lessonContent.lesson_ID = lesson.id
// WHERE homeworkSubmit.student_ID = 10 AND homeworkSubmit.score is NOT NULL AND lessonContent.contentType!="uploadImage" AND lessonContent.contentType!="textArea"