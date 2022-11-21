<?php
session_start();
include "../pdoInc.php";

$res = array();

if (isset($_POST['updatePoint'])) {
    $targetUser = isset($_POST['userID']) ? $_POST['userID'] : $_SESSION['userID'];
    $updatePoint = $_POST['updatePoint'];
    $type = $_POST['type'];

    $findUserData = $dbh->prepare('SELECT point FROM user WHERE id = ?');
    $findUserData->execute(array($targetUser));
    $userDataItem = $findUserData->fetch(PDO::FETCH_ASSOC);


    $finalPoint = $userDataItem['point'] + intval($updatePoint);


    $update = $dbh->prepare('UPDATE user SET point = ?  WHERE id = ?');
    $update->execute(array($finalPoint, $targetUser));

    $data = array("userID" => $targetUser, "point" => $finalPoint,);

    $res = array("status" => '200', "data" => $data);
} else {
    $res = array("status" => '404');
}

echo json_encode($res);
