<?php

require("ciconv.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization");
header("Content-Type: text/html; charset=UTF-8");

$host = 'localhost';
$user = 'root';
$pw = 'isot2';
$dbName = 'calenderdb';

switch ($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        doGET();
        break;
    case "DELETE":
        doDEL();
        break;
    case "PUT":
        doPUT();
        break;
}

function doGET() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names euckr");

    $responseData = new StdClass();

    $getCalTxtQry = "SELECT * FROM calendertexttable";
    $getCalTxtQryResult = $conn->query($getCalTxtQry);

    while ($calRow = $getCalTxtQryResult->fetch_array(MYSQLI_ASSOC)) {
        $calYMD = $calRow["ymd"];
        $calContent = $calRow["content"];
        $calContentUTF = ciconv("euc-kr", "utf-8", $calContent);
        $responseData->resultData->$calYMD = $calContentUTF;
    }

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doDEL() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");
    
    $_DEL = json_decode(file_get_contents('php://input'), true);

    if (!isset($_DEL["ymd"])) return;

    $qry = sprintf("DELETE FROM calendertexttable WHERE ymd = '%s'", $_DEL["ymd"]);
    $qryResult = $conn->query($qry);

    $responseData = new StdClass();
    $responseData->success = $qryResult && $conn->affected_rows !== 0;
    if (!$qryResult) $responseData->error = $conn->error;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPUT() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");
    
    $_PUT = json_decode(file_get_contents('php://input'), true);

    if (!isset($_PUT["ymd"])) {
        die();
    }

    $qry = sprintf("INSERT INTO calendertexttable (ymd, content) VALUES ('%s', '%s') ON DUPLICATE KEY UPDATE content = '%s'", $_PUT["ymd"], $_PUT["content"], $_PUT["content"]);

    $qryReulst = $conn->query($qry);

    $responseData = new StdClass();
    $responseData->success = $qryResult && $conn->affected_rows !== 0;
    if (!$qryResult) $responseData->error = $conn->error;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

?>