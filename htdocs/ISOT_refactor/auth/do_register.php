<?php

require("../api/ciconv.php");
header("Content-Type: text/html; charset=UTF-8");

@session_start();

$host = 'localhost';
$user = 'root';
$pw = 'isot2';
$dbName = 'authdb';

$conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
$conn->query("set names utf8");

$qry = sprintf("INSERT INTO userTable (userId, userName, userPw, grade, endDate) VALUES ('%s', '%s', '%s', '%s', '%s');", $_POST["userId"], $_POST["userName"], hash("sha256", $_POST["userPw"]), $_POST["grade"], $_POST["endDate"]);
$qryResult = $conn->query($qry);

if ($conn->errno == 1062) {
    echo "<script>alert('중복 아이디 또는 이름입니다'); location.replace('register.php');</script>";
    return;
}

if (!$qryResult || $conn->affected_rows == 0) {
    echo "<script>alert('등록에 실패하였습니다'); location.replace('register.php');</script>";
    return;
}

$conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], "isotdb");
$conn->query("set names utf8");

$qry = sprintf("INSERT INTO profileBoxTable (userName, filterList, mailBox, readBox) VALUES ('%s', '%s', '%s', '%s');", $_POST["userName"], "000", "[]", "[]");
$qryResult = $conn->query($qry);

$conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], "scheduledb");
$conn->query("set names utf8");

$createTableQry = sprintf("CREATE TABLE `%s` (`ymd` CHAR(8) NOT NULL PRIMARY KEY, `value` VARCHAR(4), `description` VARCHAR(20))", $_POST["userName"]);
$createTableQryResult = $conn->query($createTableQry);

echo "<script>alert('등록이 완료되었습니다'); location.replace('login.php');</script>";

?>