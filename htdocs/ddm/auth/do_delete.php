<?php

require("../api/ciconv.php");
header("Content-Type: text/html; charset=UTF-8");

$host = 'localhost';
$user = 'root';
$pw = 'isot2';
$dbName = 'ddm_db';

try {
    if (!isset($_POST["userId"]) || !isset($_POST["userPw"]) || !isset($_POST["userName"])) {
        throw new Exception("Invalid Input");
    }

    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");
    $qry = sprintf("DELETE FROM user_table WHERE id = '%s' AND password = '%s' AND name = '%s'", $_POST["userId"], hash("sha256", $_POST["userPw"]), $_POST["userName"]);
    $qryResult = $conn->query($qry);

    if (!$qryResult || $conn->affected_rows === 0) {
        throw new Exception("Query Failed While Delete From userTable");
    }

    // $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], "isotdb");
    $conn->query("set names utf8");
    $chatQry = sprintf("DELETE FROM chat_table WHERE writer_user_id = '%s' or receiver_user_id = '%s'", $_POST["userId"], $_POST["userId"]);
    $chatQryResult = $conn->query($chatQry);

    if (!$chatQryResult || $conn->affected_rows === 0) {
        throw new Exception("Query Failed While Delete From Chat Table");
    }

    // $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], "scheduledb");
    // $conn->query("set names utf8");
    // $createTableQry = sprintf("DROP TABLE %s", $_POST["userName"]);
    // $createTableQryResult = $conn->query($createTableQry);

    // if (!$createTableQry) {
    //     throw new Exception("Query Failed While Drop Table in scheduledb");
    // }
    
} catch (Exception $e) {
    echo sprintf("<script>alert('%s'); location.replace('delete.php');</script>", $e->getMessage());
    exit;
}

echo "<script>alert('삭제가 완료되었습니다'); location.replace('login.php');</script>";

?>