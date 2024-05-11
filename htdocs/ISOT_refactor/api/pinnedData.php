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
}

function doGET() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names euckr");

    $responseData = new StdClass();

    $qry = "SELECT cardKey FROM pinnedTable";
    $qryResult = $conn->query($qry);

    $responseData->count = mysqli_num_rows($qryResult);

    
    while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
        $responseData->resultData->$row["cardKey"] = 3;
        
        $getDataQry = sprintf("SELECT * FROM cardDataTable WHERE cardKey = '%s'", $row["cardKey"]);
        $cardDataResult = $conn->query($getDataQry)->fetch_array(MYSQLI_ASSOC);

        $cardData = new StdClass();
        $cardData->contentText = ciconv("euc-kr", "utf-8", $cardDataResult["contentText"]);
        $cardData->priority = $cardDataResult["priority"];
        $cardData->receiver = ciconv("euc-kr", "utf-8", $cardDataResult["receiver"]);
        $cardData->title = ciconv("euc-kr", "utf-8", $cardDataResult["title"]);
        $cardData->writer = ciconv("euc-kr", "utf-8", $cardDataResult["writer"]);
        $cardData->creationTime = ciconv("euc-kr", "utf-8", $cardDataResult["creationTime"]);
        $responseData->resultData->$cardDataResult["cardKey"] = $cardData;
        
    }
    
    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPOST() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");

    $responseData = new StdClass();

    $countQry = "SELECT cardKey FROM pinnedTable";
    $countQryResult = $conn->query($countQry);
    if (mysqli_num_rows($countQryResult) >= 3) {
        $responseData->success = false;
        $responseData->error = "Exceed Limit";
    } else {
        $_POST = json_decode(file_get_contents('php://input'), true);

        $qry = sprintf("INSERT INTO pinnedTable (cardKey) VALUES ('%s')", $_POST["cardKey"]);
        $qryResult = $conn->query($qry);
        
        $responseData->success = $qryResult && $conn->affected_rows !== 0;
        if (!$qryResult) $responseData->error = $conn->error;
    }

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doDEL() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names euckr");
    
    $_DEL = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("DELETE FROM pinnedTable WHERE cardKey = '%s'", $_DEL["cardKey"]);
    $qryResult = $conn->query($qry);

    $responseData = new StdClass();
    $responseData->success = $qryResult && $conn->affected_rows !== 0;
    if (!$qryResult) $responseData->error = $conn->error;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

?>