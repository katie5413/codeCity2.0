<?php
session_start();
include "../pdoInc.php";


$res = array("status" => '404');

if (isset($_POST['classID'])) {

    $findTopicScore = $dbh->prepare("SELECT homeworkSubmit.student_ID , lesson.topic_ID, AVG(homeworkSubmit.score)
    FROM
    homeworkSubmit
    LEFT JOIN lessonContent
    ON homeworkSubmit.homework_ID = lessonContent.id 
    LEFT JOIN lesson
    ON lessonContent.lesson_ID = lesson.id
    WHERE homeworkSubmit.student_ID IN (SELECT classEnroll.user_ID
    FROM `classEnroll` 
    LEFT JOIN `user` 
    ON user.id = classEnroll.user_ID
    WHERE `class_ID` = ? AND `identity` != 1)  AND homeworkSubmit.score is NOT NULL
    GROUP BY lesson.topic_ID");
    $findTopicScore->execute(array($_POST['classID']));

    $topicDataArr = array();
    while ($topicScoreItem = $findTopicScore->fetch(PDO::FETCH_ASSOC)) {
        $tmp = array("student_ID" => $topicScoreItem["student_ID"], "topic_ID" => $topicScoreItem["topic_ID"], "avg" => $topicScoreItem["AVG(homeworkSubmit.score)"]);

        array_push($topicDataArr, $tmp);
    }
    $res = array("status" => '200', "data" => $topicDataArr, "classID" => $_POST['classID']);
}

echo json_encode($res);


// SELECT homeworkSubmit.student_ID , lesson.topic_ID, AVG(homeworkSubmit.score)
// FROM
//     `homeworkSubmit`
// LEFT JOIN `lessonContent`
// ON homeworkSubmit.homework_ID = lessonContent.id 
// LEFT JOIN `lesson`
// ON lessonContent.lesson_ID = lesson.id
// WHERE homeworkSubmit.student_ID IN (SELECT classEnroll.user_ID
// FROM `classEnroll` 
// LEFT JOIN `user` 
// ON user.id = classEnroll.user_ID
// WHERE `class_ID` = 1 AND `identity` != 1) AND homeworkSubmit.score is NOT NULL
// GROUP BY lesson.topic_ID