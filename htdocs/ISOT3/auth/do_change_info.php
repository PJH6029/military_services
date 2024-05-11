<?php

require("../api/ciconv.php");
header("Content-Type: text/html; charset=UTF-8");

$host = 'localhost';
$user = 'root';
$pw = 'isot2';
$dbName = 'isot3_db';

$conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
$conn->query("set names utf8");

$getQry = sprintf("SELECT `end_date` FROM `user_table` WHERE `id` = '%s'", $_POST["userId"]);
$getQryResult = $conn->query($getQry);
if (!$getQryResult) {
    throw new Exception("Query Failed While Get User From userTable");
}

$row = $getQryResult->fetch_array(MYSQLI_ASSOC);


$qry = sprintf("UPDATE user_table SET name = '%s', end_date = '%s' WHERE id = '%s';", $_POST["userName"], $_POST["userEndDate"], $_POST["userId"]);
$qryResult = $conn->query($qry);

$uN = $_POST["userName"];
if (!$qryResult || $conn->affected_rows == 0) {
    echo "<script>alert('재설정에 실패하였습니다'); location.replace('../index.php');</script>";
    return;
}

echo "<script>alert('재설정이 완료되었습니다. 다시 로그인해주세요'); location.replace('logout.php');</script>";

?>