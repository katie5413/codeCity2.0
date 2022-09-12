<?php
session_start();
include "../pdoInc.php";


$res = array();
if (isset($_POST['classID'])) {
    // getLessonContent
    $findLessonContent = $dbh->prepare('SELECT id, contentType, content FROM lessonContent 
    WHERE contentType != ? AND contentType != ? AND id in (SELECT DISTINCT homeworkSubmit.homework_ID
    FROM
        `homeworkSubmit`
    WHERE student_ID in (SELECT classEnroll.user_ID
    FROM `classEnroll` 
    LEFT JOIN `user` 
    ON user.id = classEnroll.user_ID
    WHERE `class_ID` = ? AND `identity` != 1))
    ');
    $findLessonContent->execute(array('uploadImage','textArea',$_POST['classID']));

    $lessonContentArr = array();
    while ($lessonContentItem = $findLessonContent->fetch(PDO::FETCH_ASSOC)) {
        $lessonContent = array("id" => $lessonContentItem["id"], "type" => $lessonContentItem["contentType"], "content" => json_decode($lessonContentItem["content"]));

        array_push($lessonContentArr, $lessonContent);
    }
    $res = array("status" => '200', "data" => $lessonContentArr);
    echo json_encode($res);
}

// SELECT id, contentType, content FROM lessonContent 
// WHERE id in (SELECT DISTINCT homeworkSubmit.homework_ID
// FROM
//     `homeworkSubmit`
// WHERE student_ID in (SELECT classEnroll.user_ID
// FROM `classEnroll` 
// LEFT JOIN `user` 
// ON user.id = classEnroll.user_ID
// WHERE `class_ID` = 1 AND `identity` != 1))