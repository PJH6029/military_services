<?php

require("../api/ciconv.php");
header("Content-Type: text/html; charset=UTF-8");

$host = 'localhost';
$user = 'root';
$pw = 'isot2';
$dbName = 'authdb';

$conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
$conn->query("set names utf8");

$getQry = sprintf("SELECT endDate FROM userTable WHERE userId = '%s'", $_POST["userId"]);
$getQryResult = $conn->query($getQry);
$row = $getQryResult->fetch_array(MYSQLI_ASSOC);

if ($row["endDate"] != $_POST["userEndDate"]) {
    echo "<script>alert('전역일이 일치하지 않습니다'); location.replace('login.php');</script>";
    return;
}

$qry = sprintf("UPDATE userTable SET userPW = '%s' WHERE userId = '%s';", hash("sha256", $_POST["userPw"]), $_POST["userId"]);
$qryResult = $conn->query($qry);

if (!$qryResult || $conn->affected_rows == 0) {
    echo "<script>alert('재설정에 실패하였습니다'); location.replace('login.php');</script>";
    return;
}

echo "<script>alert('재설정이 완료되었습니다'); location.replace('login.php');</script>";

?>