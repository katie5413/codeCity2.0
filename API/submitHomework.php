<?php
session_start();
include "../pdoInc.php";

$res = array();

// 一般來說只有學生會繳交作業，因此 id 拿 session 沒關係，如果老師交的話也沒差因為不會撞 id

if (isset($_POST['homeworkID']) && isset($_POST['studentAnswer']) && isset($_SESSION["userID"])) {

    $homeworkID = $_POST['homeworkID'];
    $studentAnswer = $_POST['studentAnswer'];
    $score = $_POST['score'];

    if (isset($_POST["score"])) {

        $action = $dbh->prepare('INSERT INTO homeworkSubmit (student_ID, homework_ID, content, score) VALUES (?, ?, ?, ?)');
        $action->execute(array($_SESSION["userID"], $homeworkID, $studentAnswer, $score));

        $resContent = array("homeworkID" => $homeworkID, "studentAnswer" => $studentAnswer, "score" => $score);
    } else {
        $action = $dbh->prepare('INSERT INTO homeworkSubmit (student_ID, homework_ID, content) VALUES (?, ?, ?)');
        $action->execute(array($_SESSION["userID"], $homeworkID, $studentAnswer));

        $resContent = array("homeworkID" => $homeworkID, "studentAnswer" => $studentAnswer);
    }


    $res = array("status" => '200', "data" => $resContent);
} else {
    $res = array("status" => '404');
}

echo json_encode($res);
