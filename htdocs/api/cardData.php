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
        $qry = sprintf("SELECT * FROM cardDataTable WHERE cardKey = '%s'", $_GET["cardKey"]);
    } else if (isset($_GET["keyword"])) {
        $utfKey = iconv("utf-8", "euc-kr", $_GET["keyword"]);
        $qry = "SELECT * FROM cardDataTable WHERE contentText LIKE '%".$utfKey."%' OR TITLE LIKE '%".$utfKey."%'";
    } else if (isset($_GET["lastDate"])) {
        $qry = sprintf("SELECT * FROM carddataTable WHERE STRCMP(creationTime, '%s') = 1 ORDER BY creationTime ASC", $_GET["lastDate"]);
    } else if (isset($_GET["pageLength"])) {
        if (isset($_GET["lastCardDate"])) {
            $qry = sprintf("SELECT * FROM carddataTable WHERE STRCMP(creationTime, '%s') = -1 ORDER BY creationTime DESC LIMIT %d", $_GET["lastCardDate"], $_GET["pageLength"]);
        } else {
            $qry = sprintf("SELECT * FROM carddataTable ORDER BY creationTime DESC LIMIT %d", $_GET["pageLength"]);
        }
    } else {
        $qry = "SELECT * FROM cardDataTable ORDER BY creationTime ASC";
    }

    $qryResult = $conn->query($qry);
    $responseData->count = mysqli_num_rows($qryResult);

    // if (isset($_GET["keyword"])) {
    //     $ary = array();
    //     while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
    //         array_push($ary, $row["cardKey"]);
    //     }
    //     $responseData->resultData = $ary;
    // } else {
        while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
            // comment count
            $commentCntQry = sprintf("SELECT COUNT(*) FROM commentTable WHERE cardKey = '%s' ORDER BY creationTime ASC", $row["cardKey"]);
            $commentCntQryRes = $conn->query($commentCntQry);
            $commentCntRow = $commentCntQryRes->fetch_row();
            $commentCnt = intval($commentCntRow[0]);

            $cardData = new StdClass();
            $cardData->contentText = ciconv("euc-kr", "utf-8", $row["contentText"]);
            $cardData->priority = $row["priority"];
            $cardData->receiver = ciconv("euc-kr", "utf-8", $row["receiver"]);
            $cardData->title = ciconv("euc-kr", "utf-8", $row["title"]);
            $cardData->writer = ciconv("euc-kr", "utf-8", $row["writer"]);
            $cardData->creationTime = ciconv("euc-kr", "utf-8", $row["creationTime"]);
            $cardData->commentCount = $commentCnt;
            $responseData->resultData->$row["cardKey"] = $cardData;
        }
    // }
    
    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPOST() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");
    
    $_POST = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("INSERT INTO cardDataTable (cardKey, contentText, priority, receiver, title, writer, creationTime) VALUES ('%s', '%s', %d, '%s', '%s', '%s', '%s');", $_POST["cardKey"], addslashes($_POST["contentText"]), $_POST["priority"], $_POST["receiver"], addslashes($_POST["title"]), $_POST["writer"], $_POST["creationTime"]);
    $qryResult = $conn->query($qry);

    $responseData = new StdClass();
    $responseData->success = $qryResult && $conn->affected_rows !== 0;
    if (!$qryResult) $responseData->error = $conn->error;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doDEL() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names euckr");
    
    $_DEL = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("DELETE FROM cardDataTable WHERE cardKey = '%s'", $_DEL["cardKey"]);
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

    $qry = sprintf("UPDATE cardDataTable SET contentText = '%s', priority = %d, receiver = '%s', title = '%s', writer = '%s', creationTime = '%s' WHERE cardKey = '%s'", addslashes($_PUT["contentText"]), $_PUT["priority"], $_PUT["receiver"], addslashes($_PUT["title"]), $_PUT["writer"], $_PUT["creationTime"], $_PUT["cardKey"]);
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