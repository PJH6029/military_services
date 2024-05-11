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
$dbName = 'isotDB';

switch($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        doGET();
        break;
    case "POST":
        doPOST();
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
    $qry = "";
    if (isset($_GET["cardKey"])) {
        $qry = sprintf("SELECT * FROM quickMemoTable WHERE cardKey = '%s'", $_GET["cardKey"]);
    } else {
        $qry = "SELECT * FROM quickMemoTable";
    }

    $qryResult = $conn->query($qry);
    $responseData->count = mysqli_num_rows($qryResult);

    while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
        $responseData->resultData->$row["cardKey"] = ciconv("euc-kr", "utf-8", $row["content"]);
    }
    
    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPOST() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");
    
    $_POST = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("INSERT INTO quickMemoTable(cardKey, content) VALUES('%s', '%s')", $_POST["cardKey"], $_POST["content"]);
    $qryResult = $conn->query($qry);

    $responseData = new StdClass();
    $responseData->success = $conn->affected_rows !== 0;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doDEL() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names euckr");
    
    $_DEL = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("DELETE FROM quickMemoTable WHERE cardKey = '%s'", $_DEL["cardKey"]);
    $qryResult = $conn->query($qry);

    $responseData = new StdClass();
    $responseData->success = $conn->affected_rows !== 0;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPUT() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");

    $_PUT = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("UPDATE quickMemoTable SET content = '%s' WHERE cardKey = '%s'", $_PUT["content"], $_PUT["cardKey"]);
    $qryResult = $conn->query($qry);
    
    $responseData = new StdClass();
    $responseData->success = $conn->affected_rows !== 0;
    // $responseData->q = $qry;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

?>