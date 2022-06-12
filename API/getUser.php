<?php
session_start();
include "../pdoInc.php";


$userDataRes = array();
if (isset($_SESSION["userID"]) && isset($_SESSION["userEmail"])) {

    $userData = array("userID" => $_SESSION["userID"], "email" => $_SESSION["userEmail"], "name" => $_SESSION["userName"], "nickName" => $_SESSION["userNickName"], "avatar" => $_SESSION["userAvatar"], "point" => $_SESSION["userPoint"], 'userClass' => $_SESSION['userClass']);

    $userStatus = 1;

    $userDataRes = array("status" => '200', "data" => $userData, "user_status" => $userStatus);
} else {
    $userDataRes = array("status" => '404');
}

echo json_encode($userDataRes);
