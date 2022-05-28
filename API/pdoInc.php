<?php

//local
$db_server = "localhost";
$db_user = "root";
$db_passwd = "";
$db_name = "lineSimu";

date_default_timezone_set('Asia/Taipei');
try {
    $dsn = "mysql:host=$db_server;dbname=$db_name";
    $dbh = new PDO($dsn, $db_user, $db_passwd);
} catch (Exception $e) {
    die('無法對資料庫連線');
}

$dbh->exec("SET NAMES utf8");
