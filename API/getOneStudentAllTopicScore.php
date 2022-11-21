<?php
session_start();
include "../pdoInc.php";


$res = array("status" => '404');

if (isset($_POST['userID'])) {

    $findTopicScore = $dbh->prepare("SELECT homeworkSubmit.student_ID , lesson.topic_ID, SUM(homeworkSubmit.score),AVG(homeworkSubmit.score)
    FROM
    homeworkSubmit
    INNER JOIN lessonContent
    ON homeworkSubmit.homework_ID = lessonContent.id 
    INNER JOIN lesson
    ON lessonContent.lesson_ID = lesson.id
    WHERE homeworkSubmit.student_ID = ? AND homeworkSubmit.score is NOT NULL
    GROUP BY lesson.topic_ID");
    $findTopicScore->execute(array($_POST['userID']));

    $topicDataArr = array();
    while ($topicScoreItem = $findTopicScore->fetch(PDO::FETCH_ASSOC)) {
        $tmp = array("topic_ID" => $topicScoreItem["topic_ID"], "sum" => $topicScoreItem["SUM(homeworkSubmit.score)"], "avg" => $topicScoreItem["AVG(homeworkSubmit.score)"]);

        array_push($topicDataArr, $tmp);
    }
    $res = array("status" => '200', "data" => $topicDataArr, "student_ID" => $_POST['userID']);
}

echo json_encode($res);


// SELECT
//     homeworkSubmit.student_ID , lesson.topic_ID, SUM(homeworkSubmit.score),AVG(homeworkSubmit.score)
// FROM
//     `homeworkSubmit`
// INNER JOIN `lessonContent`
// ON homeworkSubmit.homework_ID = lessonContent.id 
// INNER JOIN `lesson`
// ON lessonContent.lesson_ID = lesson.id
// WHERE homeworkSubmit.student_ID = ? AND homeworkSubmit.score is NOT NULL
// GROUP BY lesson.topic_ID