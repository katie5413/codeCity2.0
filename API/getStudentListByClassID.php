<?php
session_start();
include "../pdoInc.php";


$res = array("status" => '404');
if (isset($_POST['class_ID'])) {

    $classID =  $_POST['class_ID'];

    $findStudentData = $dbh->prepare('SELECT classEnroll.user_ID, classEnroll.enroll_time ,user.name, user.point, user.email
    FROM classEnroll
    LEFT JOIN user
    ON user.id = classEnroll.user_ID
    WHERE class_ID = ? AND identity != 1 AND enroll_time IS NOT NULL');
    $findStudentData->execute(array($classID));

    $studentDataArr = array();
    while ($studentDataItem = $findStudentData->fetch(PDO::FETCH_ASSOC)) {
        $res = array("studentID" => $studentDataItem["user_ID"], "name" => $studentDataItem["name"], "email" => $studentDataItem["email"], "point" => $studentDataItem["point"], "enroll_time" => $studentDataItem["enroll_time"]);

        array_push($studentDataArr, $res);
    }
    $res = array("status" => '200', "data" => $studentDataArr, 'class_ID' => $classID);
}

echo json_encode($res);

// SELECT classEnroll.id, classEnroll.user_ID, classEnroll.enroll_time ,user.name, user.point, user.email
// FROM `classEnroll` 
// LEFT JOIN `user` 
// ON user.id = classEnroll.user_ID
// WHERE `class_ID` = 1 AND `identity` != 1