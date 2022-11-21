<?php
session_start();
include "../pdoInc.php";


$res = array("status" => '404');
if (isset($_POST['class_ID'])) {

    $classID =  $_POST['class_ID'];

    $findHomeworkData = $dbh->prepare('SELECT homeworkSubmit.id, homeworkSubmit.student_ID, homeworkSubmit.score, homeworkSubmit.homework_ID, homeworkSubmit.submitTime, homeworkSubmit.content,user.name, lessonContent.lesson_ID, lessonContent.contentType, lesson.title as lessonName, lesson.topic_ID,topic.title as topicName
    FROM homeworkSubmit
    INNER JOIN `lessonContent`
    ON homeworkSubmit.homework_ID = lessonContent.id
    INNER JOIN `lesson`
    ON lessonContent.lesson_ID = lesson.id
    INNER JOIN topic
    ON topic.id = lesson.topic_ID
    INNER JOIN user
    ON user.id = homeworkSubmit.student_ID
    WHERE student_ID in (SELECT classEnroll.user_ID
    FROM classEnroll 
    INNER JOIN user 
    ON user.id = classEnroll.user_ID
    WHERE score IS NOT NULL AND class_ID = ?)'); //  AND identity != 1
    $findHomeworkData->execute(array($classID));

    $homeworkDataArr = array();
    while ($homeworkDataItem = $findHomeworkData->fetch(PDO::FETCH_ASSOC)) {
        $res = array("submitID" => $homeworkDataItem["id"], "studentID" => $homeworkDataItem["student_ID"], "studentName" => $homeworkDataItem["name"], "topicID" => $homeworkDataItem["topic_ID"], "topicName" => $homeworkDataItem["topicName"], "lessonID" => $homeworkDataItem["lesson_ID"], "lessonName" => $homeworkDataItem["lessonName"], "contentType" => $homeworkDataItem["contentType"], "lessonContentID" => $homeworkDataItem["homework_ID"], "submitTime" => $homeworkDataItem["submitTime"], "content" => $homeworkDataItem["content"], "score" => $homeworkDataItem["score"]);

        array_push($homeworkDataArr, $res);
    }
    $res = array("status" => '200', "data" => $homeworkDataArr, 'class_ID' => $classID);
}

echo json_encode($res);

// SELECT
//     homeworkSubmit.id, homeworkSubmit.student_ID, homeworkSubmit.score, homeworkSubmit.homework_ID, homeworkSubmit.submitTime, homeworkSubmit.content,user.name, lessonContent.lesson_ID, lesson.title as lessonName, lesson.topic_ID,topic.title as topicName
// FROM
//     `homeworkSubmit`
// INNER JOIN `lessonContent`
// ON homeworkSubmit.homework_ID = lessonContent.id
// INNER JOIN `lesson`
// ON lessonContent.lesson_ID = lesson.id
// INNER JOIN topic
// ON topic.id = lesson.topic_ID
// INNER JOIN `user` 
// ON user.id = homeworkSubmit.student_ID
// WHERE student_ID in (SELECT classEnroll.user_ID
// FROM `classEnroll` 
// INNER JOIN `user` 
// ON user.id = classEnroll.user_ID
// WHERE `class_ID` = 1 AND `identity` != 1)
