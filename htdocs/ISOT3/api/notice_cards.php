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
$dbName = 'isot3_db';

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
    $conn->query("set names utf8");

    $responseData = new StdClass();
    $qry = "";
    if (isset($_GET["cardId"])) {
        // retrieve one card
        $qry = sprintf("SELECT * FROM notice_card_table WHERE id = '%s'", $_GET["cardId"]);
    } else if (isset($_GET["keyword"])) {
        // search
        $serachKey = $_GET["keyword"];
        $qry = "SELECT * FROM notice_card_table WHERE content LIKE '%".$serachKey."%' OR TITLE LIKE '%".$serachKey."%'";
    } else if (isset($_GET["pageLength"])) {
        // pagination
        if (isset($_GET["lastCardStamp"])) {
            $qry = sprintf("SELECT * FROM notice_card_table WHERE STRCMP(created_at, '%s') = -1 ORDER BY created_at DESC LIMIT %d", $_GET["lastCardStamp"], $_GET["pageLength"]);
        } else {
            $qry = sprintf("SELECT * FROM notice_card_table ORDER BY created_at DESC LIMIT %d", $_GET["pageLength"]);
        }
    } else {
        $qry = "SELECT * FROM notice_card_table ORDER BY created_at DESC";
    }

    $qryResult = $conn->query($qry);
    $responseData->count = mysqli_num_rows($qryResult);

    while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
        // TODO
        // comment count
        // $commentCntQry = sprintf("SELECT COUNT(*) FROM commentTable WHERE cardKey = '%s' ORDER BY creationTime ASC", $row["cardKey"]);
        // $commentCntQryRes = $conn->query($commentCntQry);
        // $commentCntRow = $commentCntQryRes->fetch_row();
        // $commentCnt = intval($commentCntRow[0]);

        $cardData = new StdClass();
        $cardData->id = $row["id"];
        $cardData->title = $row["title"];
        $cardData->content = $row["content"];
        $cardData->writer_id = $row["writer_id"];
        $cardData->priority = $row["priority"];
        $cardData->created_at = $row["created_at"];

        // TODO
        // $cardData->comment_count = $commentCnt;
        // $cardData->receivers_id = ~~

        $responseData->result->$row["id"] = $cardData;
    }
    $responseData->result = $resultArray;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPOST() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");
    
    $_POST = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("INSERT INTO notice_card_table (title, content, writer_id, priority) VALUES ('%s', '%s', '%s', %d);", addslashes($_POST["title"]), addslashes($_POST["content"]), $_POST["writer_id"], $_POST["priority"]);
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
    $conn->query("set names utf8");
    
    $_DEL = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("DELETE FROM notice_card_table WHERE id = %d", $_DEL["id"]);
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

    $qry = sprintf("UPDATE notice_card_table SET title = '%s', content = '%s', priority = %d WHERE id = %d", addslashes($_PUT["title"]), addslashes($_PUT["content"]), $_PUT["priority"], $_PUT["id"]);
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