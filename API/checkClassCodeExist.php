<?php
session_start();
include "../pdoInc.php";


$classCodeRes = array();
if (isset($_POST['classCode'])) {
    // getUserData
    $findClassData = $dbh->prepare('SELECT id, class_code, open_status FROM class WHERE class_code = ?');
    $findClassData->execute(array($_POST['classCode']));

    $classDataItem = $findClassData->fetch(PDO::FETCH_ASSOC);

    // 只會有一筆
    if ($findClassData->rowCount() == 1) {
        $classOpenStatus = $classDataItem['open_status'];
    } else {
        $classOpenStatus = -1;
    }

    $classCodeRes = array("status" => '200', "open_status" => $classOpenStatus, "class_id" => $classDataItem['id']);
} else {
    $classCodeRes = array("status" => '404');
}

echo json_encode($classCodeRes);
