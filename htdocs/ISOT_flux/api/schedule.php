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
$dbName = 'scheduledb';

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
    function USRYMD($conn, $responseData) {
        $qry = sprintf("SELECT * FROM %s WHERE ymd = %s ORDER BY ymd ASC", iconv("utf-8", "euc-kr", $_GET["userName"]), $_GET["ymd"]);
        $qryResult = $conn->query($qry);
        $responseData->success = $qryResult && mysqli_num_rows($qryResult) !== 0;
        
        if (!$responseData->success) return;
        $row = $qryResult->fetch_array(MYSQLI_ASSOC);

        $scheduleData = new StdClass();
        $scheduleData->ymd = $row["ymd"];
        $scheduleData->value = ciconv("euc-kr", "utf-8", $row["value"]);
        $scheduleData->description = ciconv("euc-kr", "utf-8", $row["description"]);

        $responseData->resultData = $scheduleData;
    }
    function USR($conn, $responseData) {
        $qry = sprintf("SELECT * FROM %s ORDER BY ymd ASC", iconv("utf-8", "euc-kr", $_GET["userName"]));
        $qryResult = $conn->query($qry);

        $responseData->count = mysqli_num_rows($qryResult);
        $responseData->resultData = array();

        while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
            $data = new StdClass();
            $data->ymd = $row["ymd"];
            $data->value = ciconv("euc-kr", "utf-8", $row["value"]);
            $data->description = ciconv("euc-kr", "utf-8", $row["description"]);
            array_push($responseData->resultData, $data);
        }
    }
    function YMDVAL($conn, $responseData) {
        $getTableNameQry = sprintf("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '%s'", $GLOBALS['dbName']);
        $tableNameQryResult = $conn->query($getTableNameQry);

        $responseData->userCount = mysqli_num_rows($tableNameQryResult);
        $responseData->resultData = new StdClass();

        while ($tableNameRow = $tableNameQryResult->fetch_array(MYSQLI_ASSOC)) {
            $tableName = $tableNameRow["TABLE_NAME"];
            $tableNameUTF = ciconv("euc-kr", "utf-8", $tableName);
            $qry = sprintf("SELECT * FROM %s WHERE ymd = '%s' && value = '%s'", $tableName, $_GET["ymd"], iconv("utf-8", "euc-kr", $_GET["value"]));
            $qryResult = $conn->query($qry);

            $exist = $qryResult && mysqli_num_rows($qryResult) !== 0;
            if (!$exist) continue;
            $row = $qryResult->fetch_array(MYSQLI_ASSOC);
            
            $data = new StdClass();
            $data->ymd = $row["ymd"];
            $data->value = ciconv("euc-kr", "utf-8", $row["value"]);
            $data->description = ciconv("euc-kr", "utf-8", $row["description"]);
            $responseData->resultData->$tableNameUTF = $data;
        }
    }
    function YMD($conn, $responseData) {
        $getTableNameQry = sprintf("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '%s'", $GLOBALS['dbName']);
        $tableNameQryResult = $conn->query($getTableNameQry);

        $responseData->userCount = mysqli_num_rows($tableNameQryResult);
        $responseData->resultData = new StdClass();

        while ($tableNameRow = $tableNameQryResult->fetch_array(MYSQLI_ASSOC)) {
            $tableName = $tableNameRow["TABLE_NAME"];
            $tableNameUTF = ciconv("euc-kr", "utf-8", $tableName);
            $qry = sprintf("SELECT * FROM %s WHERE ymd = '%s'", $tableName, $_GET["ymd"]);
            $qryResult = $conn->query($qry);

            $exist = $qryResult && mysqli_num_rows($qryResult) !== 0;
            if (!$exist) continue;
            $row = $qryResult->fetch_array(MYSQLI_ASSOC);
            
            $data = new StdClass();
            $data->ymd = $row["ymd"];
            $data->value = ciconv("euc-kr", "utf-8", $row["value"]);
            $data->description = ciconv("euc-kr", "utf-8", $row["description"]);
            $responseData->resultData->$tableNameUTF = $data;
        }
    }

    function getUserList($responseData) {
        $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], "authdb");
        $conn->query("set names euckr");
        $qryResult = $conn->query("SELECT * FROM userTable");

        $userList = array();
        while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
            $userData = new StdClass();
            $name = $row["userName"];
            $nameUTF = ciconv("euc-kr", "utf-8", $name);

            $grade = $row["grade"];
            $endDate = $row["endDate"];

            $userData->name = $nameUTF;
            $userData->grade = $grade;
            $userData->endDate = $endDate;
            array_push($userList, $userData);
        }
        $responseData->resultData = $userList;
    }

    function getUserInfo($responseData) {
        $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], "authdb");
        $conn->query("set names euckr");
        $qry = sprintf("SELECT * FROM userTable WHERE userName = '%s'", iconv("utf-8", "euc-kr", $_GET["userName"]));
        $qryResult = $conn->query($qry);

        while ($infoRow = $qryResult->fetch_array(MYSQLI_ASSOC)) {
            $responseData->resultData->grade = $infoRow["grade"];
            $responseData->resultData->endDate = $infoRow["endDate"];
        }
    }

    function getCalender($conn, $responseData) {
        $getCalQry = "SELECT * FROM calenderTable";
        $getCalQryResult = $conn->query($getCalQry);

        while ($calRow = $getCalQryResult->fetch_array(MYSQLI_ASSOC)) {
            $calYMD = $calRow["ymd"];
            $calValue = $calRow["value"];
            $calValueUTF = ciconv("euc-kr", "utf-8", $calValue);
            $responseData->resultData->$calYMD = $calValueUTF;
        }
    }

    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names euckr");

    $responseData = new StdClass();

    if (isset($_GET["type"])) {
        if ($_GET["type"] === "userList") {
            getUserList($responseData);
        }
        // else if ($_GET["type"] === "info") {
        //     getUserInfo($responseData);
        // } 
        else if ($_GET["type"] === "calender") {
            getCalender($conn, $responseData);
        }
    } else {
        if (isset($_GET["userName"])) {
            if (isset($_GET["ymd"])) {
                USRYMD($conn, $responseData);
            } else {
                USR($conn, $responseData);
            }
        } else if (isset($_GET["ymd"])) {
            if (isset($_GET["value"])) {
                YMDVAL($conn, $responseData);
            } else {
                YMD($conn, $responseData);
            }
        }
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

    if (!isset($_DEL["userName"]) || !isset($_DEL["ymd"])) return;

    $qry = "";
    if ($_DEL["userName"] == "calender") {
        $qry = sprintf("DELETE FROM calenderTable WHERE ymd = '%s'", $_DEL["ymd"]);
    } else {
        $qry = sprintf("DELETE FROM %s WHERE ymd = '%s'", $_DEL["userName"], $_DEL["ymd"]);
    }
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

    if (!isset($_PUT["userName"]) || !isset($_PUT["ymd"])) {
        die();
    }

    $qry = "";

    if ($_PUT["userName"] == "calender") {
        $qry = sprintf("INSERT INTO calenderTable (ymd, value) VALUES ('%s', '%s') ON DUPLICATE KEY UPDATE value = '%s'", $_PUT["ymd"], $_PUT["value"], $_PUT["value"]);
    } else {
        if (isset($_PUT["value"]) && isset($_PUT["description"])) {
            $qry = sprintf("INSERT INTO %s (ymd, value, description) VALUES ('%s', '%s', '%s') ON DUPLICATE KEY UPDATE value = '%s', description = '%s'", $_PUT["userName"], $_PUT["ymd"], $_PUT["value"], $_PUT["description"], $_PUT["value"], $_PUT["description"]);
        } else if (isset($_PUT["value"])) {
            $qry = sprintf("INSERT INTO %s (ymd, value, description) VALUES ('%s', '%s', '%s') ON DUPLICATE KEY UPDATE value = '%s'", $_PUT["userName"], $_PUT["ymd"], $_PUT["value"], "", $_PUT["value"]);
        } else if (isset($_PUT["description"])) {
            $qry = sprintf("INSERT INTO %s (ymd, value, description) VALUES ('%s', '%s', '%s') ON DUPLICATE KEY UPDATE description = '%s'", $_PUT["userName"], $_PUT["ymd"], "", $_PUT["description"], $_PUT["description"]);
        } else {
            die();
        }
    }
    
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