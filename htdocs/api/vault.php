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
$dbName = 'vaultdb';

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
    if (isset($_GET["category"])) {
        $qry = sprintf("SELECT * FROM vaultTable WHERE category = '%s'", $_GET["category"]);
    } else {
        $qry = "SELECT * FROM vaultTable";
    }
    $qryResult = $conn->query($qry);
    $responseData->count = mysqli_num_rows($qryResult);

    while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
        $pwData = new StdClass();
        $pwData->title = ciconv("euc-kr", "utf-8", $row["title"]);
        $pwData->id = $row["id"];
        $pwData->pw = ciconv("euc-kr", "utf-8", $row["pw"]);
        $pwData->lastDate = ciconv("euc-kr", "utf-8", $row["lastDate"]);
        $pwData->category = ciconv("euc-kr", "utf-8", $row["category"]);
        $responseData->resultData->$row["UID"] = $pwData;
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
    $_POST = json_decode(file_get_contents('php://input'), true);

    if (!isset($_POST["title"]) || !isset($_POST["id"]) || !isset($_POST["pw"]) || !isset($_POST["category"]) || !isset($_POST["lastDate"])) {
        $responseData->success = false;
        $responseData->error = "Input info invalid";
    } else {
        $qry = sprintf("INSERT INTO vaultTable (UID, title, id, pw, lastDate, category) VALUES (REPLACE(UUID(), '-', ''), '%s', '%s', '%s', '%s', '%s')", $_POST["title"], $_POST["id"], $_POST["pw"], $_POST["lastDate"], $_POST["category"]);
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

    $qry = sprintf("DELETE FROM vaultTable WHERE UID = '%s'", $_DEL["UID"]);
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
    function updateField($name, $conn, $_PUT) {
        if (!isset($_PUT[$name])) return;

        $qry = sprintf("UPDATE vaultTable SET %s = '%s' WHERE UID = '%s'", $name, $_PUT[$name], $_PUT["UID"]);
        $qryResult = $conn->query($qry);

        if (!$qryResult || ($name != "lastDate" && $conn->affected_rows === 0)) {
            throw new Exception("Query Failed While Updating ".$name);
        }
    }

    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");
    
    $_PUT = json_decode(file_get_contents('php://input'), true);

    $responseData = new StdClass();
    try {
        if (!isset($_PUT["UID"])) {
            throw new Exception("No UID Info");
        }

        updateField("title", $conn, $_PUT);
        updateField("id", $conn, $_PUT);
        updateField("pw", $conn, $_PUT);
        updateField("category", $conn, $_PUT);
        updateField("lastDate", $conn, $_PUT);

        $responseData->success = true;
    } catch (Exception $e) {
        $responseData->success = false;
        $responseData->error = $e->getMessage();
    }
    
    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

?>