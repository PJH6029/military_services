<?php

require("ciconv.php");
date_default_timezone_set("Asia/Seoul");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization");
header("Content-Type: text/html; charset=UTF-8");

$host = 'localhost';
$user = 'root';
$pw = 'isot2';
$dbName = 'isote_db';

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
    $conn->query("set names euckr"); // TODO 이게 뭔 역할

    $responseData = new StdClass();
    $qry = "";

    if (isset($_GET["id"])) {
        $qry = sprintf("SELECT * FROM task_table WHERE id = %d", $_GET["id"]);

        $qryResult = $conn->query($qry);
        $responseData->count = mysqli_num_rows($qryResult);
        
        while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
            $responseData->contents->id = $row["id"];
            $responseData->contents->name = ciconv("euc-kr", "utf-8", $row["name"]);
            // $responseData->contents->name = $row["name"];
            $responseData->contents->created_at = $row["created_at"];
        }
    } else {
        $qry = "SELECT * FROM task_table ORDER BY id";

        $qryResult = $conn->query($qry);
        $responseData->count = mysqli_num_rows($qryResult);

        $ary = array();
        while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
            $data = new StdClass();
            $data->id = $row["id"];
            $data->name = ciconv("euc-kr", "utf-8", $row["name"]);
            // $data->name = $row["name"];
            $data->created_at = $row["created_at"];
            array_push($ary, $data);
        }
        $responseData->contents = $ary;
    }

    $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry);
    file_put_contents("../log/task.log", $log, FILE_APPEND);
    
    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPOST() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");

    $_POST = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("INSERT INTO task_table(name) VALUES('%s')", $_POST["name"]);
    $qryResult = $conn->query($qry);

    $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry);
    file_put_contents("../log/task.log", $log, FILE_APPEND);

    $responseData = new StdClass();
    $responseData->success = $conn->affected_rows !== 0;
    if (!$qryResult) {
        $responseData->error = $conn->error;
    } else {
        $conn->query("set names euckr");
        $qry2 = "SELECT * FROM task_table ORDER BY id DESC LIMIT 1";
        $qryResult2 = $conn->query($qry2);
        $responseData->count = mysqli_num_rows($qryResult2);

        $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry2);
        file_put_contents("../log/task.log", $log, FILE_APPEND);
            
        while ($row = $qryResult2->fetch_array(MYSQLI_ASSOC)) {
            $responseData->contents->id = $row["id"];
            $responseData->contents->name = ciconv("euc-kr", "utf-8", $row["name"]);
            // $responseData->contents->name = $row["name"];
            $responseData->contents->created_at = $row["created_at"];
        }
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

    $qry = sprintf("DELETE FROM task_table WHERE id = %d", $_DEL["id"]);
    $qryResult = $conn->query($qry);

    $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry);
    file_put_contents("../log/task.log", $log, FILE_APPEND);

    $responseData = new StdClass();
    $responseData->success = $conn->affected_rows !== 0;
    if (!$qryResult) $responseData->error = $conn->error;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPUT() {
    function updateField($name, $conn, $_PUT) {
        if (!isset($_PUT[$name])) return;

        $qry = sprintf("UPDATE task_table SET %s = '%s' WHERE id = %d", $name, $_PUT[$name], $_PUT["id"]);
        $qryResult = $conn->query($qry);

        $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry);
        file_put_contents("../log/task.log", $log, FILE_APPEND);

        if (!$qryResult) {
            throw new Exception("Query Failed While Updating ".$name);
        }
    }

    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");

    $_PUT = json_decode(file_get_contents('php://input'), true);
    
    $responseData = new StdClass();
    try {
        if (!isset($_PUT["id"])) {
            throw new Exception("Invalid task id");
        }
        updateField("name", $conn, $_PUT);

        $responseData->success = true;

        $conn->query("set names euckr");
        $qry2 = sprintf("SELECT * FROM task_table WHERE id = %d", $_PUT["id"]);
        $qryResult2 = $conn->query($qry2);
        $responseData->count = mysqli_num_rows($qryResult2);

        $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry2);
        file_put_contents("../log/task.log", $log, FILE_APPEND);
            
        while ($row = $qryResult2->fetch_array(MYSQLI_ASSOC)) {
            $responseData->contents->id = $row["id"];
            $responseData->contents->name = ciconv("euc-kr", "utf-8", $row["name"]);
            // $responseData->contents->name = $row["name"];
            $responseData->contents->created_at = $row["created_at"];
        }
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