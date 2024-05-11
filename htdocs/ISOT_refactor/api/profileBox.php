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
    case "PUT":
        doPUT();
        break;
}

function doGET() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names euckr");

    $responseData = new StdClass();
    

    if (!isset($_GET["userName"])) {

        $qry = "SELECT * From profileBoxTable";
        $qryResult = $conn->query($qry);
        
        while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
            $name = ciconv("euc-kr", "utf-8", $row["userName"]);
            $responseData->$name->filterList = $row["filterList"];
            $responseData->$name->mailBox = $row["mailBox"];
            $responseData->$name->readBox = $row["readBox"];
        }

        // $qry = "SELECT userName From profileBoxTable";
        // $qryResult = $conn->query($qry);
        
        // while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
        //     // $name = iconv("utf-8", "euc-kr", $row["userName"]);
        //     $name = $row["userName"];
        //     $utfName = ciconv("euc-kr", "utf-8", $row["userName"]);
        //     $qry2 = sprintf("SELECT * FROM profileBoxTable WHERE userName = '%s'", $name);
        //     $qryRes2 = $conn->query($qry2);

        //     // $row2 = $qryRes2->fetch_array(MYSQLI_ASSOC);

        //     $responseData->$utfName->filterList = "000";
        //     $responseData->$utfName->mailBox = "[]";
        //     $responseData->$utfName->readBox = "[]";
        // }
    } else {
        $qry = sprintf("SELECT * FROM profileBoxTable WHERE userName = '%s'", iconv("utf-8", "euc-kr", $_GET["userName"]));

        $qryResult = $conn->query($qry);
        $row = $qryResult->fetch_array(MYSQLI_ASSOC);
    
        if (isset($_GET["column"])) {
            if ($_GET["column"] === "filterList") {
                $responseData->filterList = $row["filterList"];
            } else if ($_GET["column"] === "mailBox") {
                $responseData->mailBox = $row["mailBox"];
            } else {
                $responseData->readBox = $row["readBox"];
            }
        }
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

    $qry = sprintf("INSERT INTO profileBoxTable (userName, filterList, mailBox, readBox) VALUES ('%s', '%s', '%s', '%s');", $_POST["userName"], $_POST["filterList"], $_POST["mailBox"], $_POST["readBox"]);
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

    $qry = sprintf("UPDATE profileBoxTable SET %s = '%s' WHERE userName = '%s'", $_PUT["column"], $_PUT["newVal"], $_PUT["userName"]);
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