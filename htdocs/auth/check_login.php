<?php

require("../api/ciconv.php");
header("Content-Type: text/html; charset=UTF-8");

@session_start();

$host = 'localhost';
$user = 'root';
$pw = 'isot2';
$dbName = 'authdb';

$conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
$conn->query("set names euckr");

$getQry = sprintf("SELECT * FROM userTable WHERE userId = '%s'", $_POST["userId"]);
$getQryResult = $conn->query($getQry);

if (!$getQryResult || mysqli_num_rows($getQryResult) == 0) {
    echo "<script>alert('존재하지 않는 계정입니다'); location.replace('login.php');</script>";
    return;
}

$row = $getQryResult->fetch_array(MYSQLI_ASSOC);
if (hash("sha256", $_POST["userPw"]) == $row["userPw"]) {
    $_SESSION["userName"] = ciconv("euc-kr", "utf-8", $row["userName"]);
    echo "<script>location.replace('../ISOT/index.php')</script>";
} else {
    echo "<script>alert('아이디 또는 비밀번호를 확인해 주세요'); location.replace('login.php');</script>";
}

?>