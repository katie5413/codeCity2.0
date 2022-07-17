<?php
session_start();
include "../pdoInc.php";

$lessonContentdataRes = array();

if (isset($_POST['id'])) {

    $deleteLessonContent = $dbh->prepare('DELETE FROM lessonContent WHERE id = ?');
    $deleteLessonContent->execute(array($_POST['id']));

    $lessonContentdata = array("id" => $_POST['id']);

    $lessonContentdataRes = array("status" => '200', "data" => $lessonContentdata);
} else {
    $lessonContentdataRes = array("status" => '404');
}

echo json_encode($lessonContentdataRes);
