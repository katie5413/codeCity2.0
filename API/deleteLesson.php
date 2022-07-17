<?php
session_start();
include "../pdoInc.php";

$lessondataRes = array();

if (isset($_POST['id'])) {

    $deleteLesson = $dbh->prepare('DELETE FROM lesson WHERE id = ?');
    $deleteLesson->execute(array($_POST['id']));

    $lessondata = array("id" => $_POST['id']);

    $lessondataRes = array("status" => '200', "data" => $lessondata);
} else {
    $lessondataRes = array("status" => '404');
}

echo json_encode($lessondataRes);
