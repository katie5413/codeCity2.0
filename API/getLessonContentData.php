<?php
session_start();
include "../pdoInc.php";


$lessonData = array();
if (isset($_POST['lessonID'])) {
    // getLessonContent
    $findLessonContent = $dbh->prepare('SELECT * FROM lessonContent WHERE lesson_ID = ?');
    $findLessonContent->execute(array($_POST['lessonID']));

    $lessonContentArr = array();
    while ($lessonContentItem = $findLessonContent->fetch(PDO::FETCH_ASSOC)) {
        $lessonContent = array("id" => $lessonContentItem["id"], "type" => $lessonContentItem["contentType"], "contentOrder" => $lessonContentItem["content_order"], "content" => json_decode($lessonContentItem["content"]));

        // 如果有給學生 ID
        if (isset($_POST['studentID'])) {
            switch ($lessonContentItem['contentType']) {

                case 'singleChoice':
                case 'multipleChoice':
                case 'fillBlank':
                    $lessonContentItem["studentAnswer"] = array('content' => array(), 'score' => null);

                    $findLessonContentSubmit = $dbh->prepare('SELECT content FROM practiceSubmit WHERE student_ID = ? and practice_ID =? ORDER BY time');
                    $findLessonContentSubmit->execute(array($_POST['studentID'], $lessonContentItem['id']));
                    while ($findLessonContentSubmitItem = $findLessonContentSubmit->fetch(PDO::FETCH_ASSOC)) {
                        if ($findLessonContentSubmit->rowCount() > 0) {
                            $tempContent = $findLessonContentSubmitItem['content'];
                            $tempScore = $findLessonContentSubmitItem['score'];
                            $arr = array();
                            $template = array('content' => array('0' => $tempContent), 'score' => $tempScore);
                            $lessonContentItem["studentAnswer"] = $template;
                        }
                    }
                    break;
                case 'uploadImage':
                case 'textArea':
                    $lessonContentItem["studentAnswer"] = array('content' => array(), 'score' => null);

                    $findLessonContentSubmit = $dbh->prepare('SELECT score, content FROM homeworkSubmit WHERE student_ID = ? and homework_ID =? ORDER BY time');
                    $findLessonContentSubmit->execute(array($_POST['studentID'], $lessonContentItem['id']));
                    while ($findLessonContentSubmitItem = $findLessonContentSubmit->fetch(PDO::FETCH_ASSOC)) {
                        if ($findLessonContentSubmit->rowCount() > 0) {
                            $tempContent = $findLessonContentSubmitItem['content'];
                            $tempScore = $findLessonContentSubmitItem['score'];
                            $arr = array();
                            $template = array('content' => array('0' => $tempContent), 'score' => $tempScore);
                            $lessonContentItem["studentAnswer"] = $template;
                        }
                    }
                    break;
            }
            $lessonContent = array("id" => $lessonContentItem["id"], "type" => $lessonContentItem["contentType"], "contentOrder" => $lessonContentItem["content_order"], "content" => json_decode($lessonContentItem["content"]), 'studentAnswer' => $lessonContentItem["studentAnswer"]);
        }

        array_push($lessonContentArr, $lessonContent);
    }
    $lessonData = array("status" => '200', "data" => $lessonContentArr);
    echo json_encode($lessonData);
}
