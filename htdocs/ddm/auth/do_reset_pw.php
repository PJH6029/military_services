<?php

require("../api/ciconv.php");
header("Content-Type: text/html; charset=UTF-8");

$host = 'localhost';
$user = 'root';
$pw = 'isot2';
$dbName = 'ddm_db';

$conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
$conn->query("set names utf8");

$getQry = sprintf("SELECT end_date FROM user_table WHERE id = '%s'", $_POST["userId"]);
$getQryResult = $conn->query($getQry);
$row = $getQryResult->fetch_array(MYSQLI_ASSOC);

if ($row["end_date"] != $_POST["userEndDate"]) {
    echo "<script>alert('전역일이 일치하지 않습니다'); location.replace('login.php');</script>";
    return;
}

$qry = sprintf("UPDATE user_table SET password = '%s' WHERE id = '%s';", hash("sha256", $_POST["userPw"]), $_POST["userId"]);
$qryResult = $conn->query($qry);

if (!$qryResult || $conn->affected_rows == 0) {
    echo "<script>alert('재설정에 실패하였습니다'); location.replace('login.php');</script>";
    return;
}

echo "<script>alert('재설정이 완료되었습니다'); location.replace('login.php');</script>";

?>