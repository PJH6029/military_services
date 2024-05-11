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

    if (isset($_GET["task_id"])) {
        $qry = sprintf("SELECT * FROM task_card_table WHERE task_id = %d ORDER BY id", $_GET["task_id"]);
    } else if (isset($_GET["today"])) {
        // TODO
        // $qry = sprintf("SELECT * FROM task_card_table WHERE (schedule_day LIKE '%%%d%%') or (schedule_start != '0000-00-00 00:00:00' or (schedule_end != '0000-00-00 00:00:00' and NOW() <= schedule_end)) ORDER BY id", $_GET["today"]);
        $qry = sprintf("SELECT * FROM task_card_table WHERE (schedule_day LIKE '%%%d%%') ORDER BY id", $_GET["today"]);
    } else {
        $qry = "SELECT * FROM task_card_table ORDER BY id";
    }
    $qryResult = $conn->query($qry);
    $responseData->count = mysqli_num_rows($qryResult);

    $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry);
    file_put_contents("../log/card.log", $log, FILE_APPEND);

    $ary = array();
    while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
        $data = new StdClass();
        $data->id = $row["id"];
        $data->task_id = $row["task_id"];
        $data->title = ciconv("euc-kr", "utf-8", $row["title"]);
        $data->content = ciconv("euc-kr", "utf-8", $row["content"]);
        // $data->title = $row["title"];
        // $data->content = $row["content"];
        $data->progress = $row["progress"];
        $data->schedule_start = $row["schedule_start"];
        $data->schedule_end = $row["schedule_end"];
        $data->schedule_day = $row["schedule_day"];
        $data->created_at = $row["created_at"];
        array_push($ary, $data);
    }
    $responseData->contents = $ary;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPOST() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");

    $_POST = json_decode(file_get_contents('php://input'), true);

    // $qry = sprintf("INSERT INTO task_card_table(task_id, title, content, progress, schedule_start, schedule_end, schedule_day) VALUES(%d, '%s', '%s', %d, '%s', '%s', '%s')", 
    //                 $_POST["task_id"], ciconv("euc-kr", "utf-8", addslashes($_POST["name"])), ciconv("euc-kr", "utf-8", addslashes($_POST["content"])), $_POST["progress"], $_POST["schedule_start"], $_POST["schedule_end"], $_POST["schedule_day"]);
    $qry = sprintf("INSERT INTO task_card_table(task_id, title, content, progress, schedule_start, schedule_end, schedule_day) VALUES(%d, '%s', '%s', %d, '%s', '%s', '%s')", 
    $_POST["task_id"], addslashes($_POST["title"]), addslashes($_POST["content"]), $_POST["progress"], $_POST["schedule_start"], $_POST["schedule_end"], $_POST["schedule_day"]);
    
    $qryResult = $conn->query($qry);

    $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry);
    file_put_contents("../log/card.log", $log, FILE_APPEND);

    $responseData = new StdClass();
    $responseData->success = $conn->affected_rows !== 0;
    if (!$qryResult) {
        $responseData->error = $conn->error;
    } else {
        $conn->query("set names euckr");
        $qry2 = "SELECT * FROM task_card_table ORDER BY id DESC LIMIT 1";
        $qryResult2 = $conn->query($qry2);
        $responseData->count = mysqli_num_rows($qryResult2);

        $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry2);
        file_put_contents("../log/card.log", $log, FILE_APPEND);
            
        while ($row = $qryResult2->fetch_array(MYSQLI_ASSOC)) {
            $responseData->contents->id = $row["id"];
            $responseData->contents->task_id = $row["task_id"];
            $responseData->contents->title = ciconv("euc-kr", "utf-8", $row["title"]);
            $responseData->contents->content = ciconv("euc-kr", "utf-8", $row["content"]);
            // $responseData->contents->title = $row["title"];
            // $responseData->contents->content = $row["content"];
            $responseData->contents->progress = $row["progress"];
            $responseData->contents->schedule_start = $row["schedule_start"];
            $responseData->contents->schedule_end = $row["schedule_end"];
            $responseData->contents->schedule_day = $row["schedule_day"];
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

    $qry = sprintf("DELETE FROM task_card_table WHERE id = %d", $_DEL["id"]);
    $qryResult = $conn->query($qry);

    $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry);
    file_put_contents("../log/card.log", $log, FILE_APPEND);

    $responseData = new StdClass();
    $responseData->success = $conn->affected_rows !== 0;
    if (!$qryResult) $responseData->error = $conn->error;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

function doPUT() {
    function updateField($name, $conn, $_PUT, $isInt) {
        // if (!isset($_PUT[$name])) return;
        $qry = "";
        $val = "";
        if ($name == "title" || $name == "content") {
            // $val = addSlashes($_PUT[$name]);
            $val = addslashes($_PUT[$name]);
        } else {
            $val = $_PUT[$name];
        }

        if (!$isInt) {
            $qry = sprintf("UPDATE task_card_table SET %s = '%s' WHERE id = %d", $name, $val, $_PUT["id"]);
        } else {
            $qry = sprintf("UPDATE task_card_table SET %s = %d WHERE id = %d", $name, $_PUT[$name], $_PUT["id"]);
        }

        $qryResult = $conn->query($qry);

        $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry);
        file_put_contents("../log/card.log", $log, FILE_APPEND);

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
            throw new Exception("Invalid card id");
        }
        updateField("title", $conn, $_PUT, false);
        updateField("content", $conn, $_PUT, false);
        updateField("progress", $conn, $_PUT, true);
        updateField("schedule_start", $conn, $_PUT, false);
        updateField("schedule_end", $conn, $_PUT, false);
        updateField("schedule_day", $conn, $_PUT, false);
        updateField("task_id", $conn, $_PUT, false);

        $responseData->success = true;

        $conn->query("set names euckr");
        $qry2 = sprintf("SELECT * FROM task_card_table WHERE id = %d", $_PUT["id"]);
        $qryResult2 = $conn->query($qry2);
        $responseData->count = mysqli_num_rows($qryResult2);

        $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry2);
        file_put_contents("../log/card.log", $log, FILE_APPEND);
            
        while ($row = $qryResult2->fetch_array(MYSQLI_ASSOC)) {
            $responseData->contents->id = $row["id"];
            $responseData->contents->task_id = $row["task_id"];
            $responseData->contents->title = ciconv("euc-kr", "utf-8", $row["title"]);
            $responseData->contents->content = ciconv("euc-kr", "utf-8", $row["content"]);
            // $responseData->contents->content = $row["content"];
            // $responseData->contents->title = $row["title"];
            $responseData->contents->progress = $row["progress"];
            $responseData->contents->schedule_start = $row["schedule_start"];
            $responseData->contents->schedule_end = $row["schedule_end"];
            $responseData->contents->schedule_day = $row["schedule_day"];
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