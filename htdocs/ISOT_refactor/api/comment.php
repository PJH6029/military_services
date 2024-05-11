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
        // doPUT();
        break;
}

function doGET() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names euckr");

    $responseData = new StdClass();
    $qry = "";
    if (isset($_GET["cardKey"])) {
        $qry = sprintf("SELECT * FROM commentTable WHERE cardKey = '%s' ORDER BY creationTime ASC", $_GET["cardKey"]);
    } else {
        $qry = "SELECT * FROM commentTable ORDER BY creationTime ASC";
    }

    $qryResult = $conn->query($qry);
    $responseData->count = mysqli_num_rows($qryResult);

    while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
        $commentData = new StdClass();
        $commentData->writer = ciconv("euc-kr", "utf-8", $row["writer"]);
        $commentData->content = ciconv("euc-kr", "utf-8", $row["content"]);
        $commentData->cardKey = $row["cardKey"];
        $responseData->resultData->$row["creationTime"] = $commentData;
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

    $qry = sprintf("INSERT INTO commentTable (cardKey, writer, content, creationTime) VALUES ('%s', '%s', '%s', '%s');", $_POST["cardKey"], $_POST["writer"], addslashes($_POST["content"]), $_POST["creationTime"]);
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

    $qry = sprintf("DELETE FROM commentTable WHERE creationTime = '%s'", $_DEL["creationTime"]);
    $qryResult = $conn->query($qry);

    $responseData = new StdClass();
    $responseData->success = $qryResult && $conn->affected_rows !== 0;
    if (!$qryResult) $responseData->error = $conn->error;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

// function doPUT() {
//     $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
//     $conn->query("set names utf8");

//     $_PUT = json_decode(file_get_contents('php://input'), true);

//     $qry = sprintf("UPDATE commentTable SET contentText = '%s', priority = %d, receiver = '%s', title = '%s', writer = '%s', creationTime = '%s' WHERE cardKey = '%s'", addslashes($_PUT["contentText"]), $_PUT["priority"], $_PUT["receiver"], addslashes($_PUT["title"]), $_PUT["writer"], $_PUT["creationTime"], $_PUT["cardKey"]);
//     $qryResult = $conn->query($qry);
    
//     $responseData = new StdClass();
//     $responseData->success = $qryResult && $conn->affected_rows !== 0;
//     if (!$qryResult) $responseData->error = $conn->error;

//     header('Content-Type: application/json');
//     echo json_encode($responseData);

//     mysqli_close($conn);
//     exit;
// }

?>