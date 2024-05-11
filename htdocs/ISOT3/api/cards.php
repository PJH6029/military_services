<?php

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

function response($responseData) {
    header('Content-Type: application/json');
    echo json_encode($responseData);
}

function reportError($responseData, $errMsg) {
    $responseData->success = false;
    $responseData->error = $errMsg;
}

function ensureTableName($responseData, $conn, $params) {   
    if (isset($params["table"])) {
        // hard coded table name
        switch ($params["table"]) {
            case "daily":
                return "daily_card_table";
            case "notice":
                return "notice_card_table";
        }
    }

    reportError($responseData, "Table is not set");
    response($responseData);
    mysqli_close($conn);
    exit;
}

function ensureTableConnection($responseData, $conn, $tableName) {
    $qry = sprintf("SELECT * FROM `%s` LIMIT 1", $tableName);
    $qryResult = $conn->query($qry);
    if (!$qryResult) {
        reportError($responseData, "Cannot connect to table which name is ".$tableName);
        response($responseData);
        mysqli_close($conn);
        exit;
    }
    return true;
}


// request example
// GET /api/cards.php?tableName=daily&id=12
function doGET() {
    function makeQuery($tableName, $params) {
        $qry = "";
        // search
        if (isset($params["keyword"])) {
            $searchKey = $params["keyword"];
            $qry = sprintf("SELECT * FROM `%s` WHERE content LIKE '%%%s%%' OR title LIKE '%%%s%%'", $tableName, $searchKey, $searchKey);
            return $qry;
        }

        // retrieve one card
        if (isset($params["id"])) {
            $qry = sprintf("SELECT * FROM `%s` WHERE id = %d", $tableName, $params["id"]);
            return $qry;
        }

        // retireve many cards. pagination
        // paginate by modification time
        if (isset($params["pageLength"])) {
            if (isset($params["lastStamp"])) {
                $qry = sprintf("SELECT * FROM `%s` WHERE `modified_at` < '%s' ORDER BY `modified_at` DESC LIMIT %d", $tableName, $params["lastStamp"], $params["pageLength"]);
            } else {
                // first retrieval
                $qry = sprintf("SELECT * FROM `%s` ORDER BY `modified_at` DESC LIMIT %d", $tableName, $params["pageLength"]);
            }
            return $qry;
        }

        // retireve all cards
        if (isset($params["all"])) {
            if ($params["all"] === "true") {
                $qry = sprintf("SELECT * FROM `%s` ORDER BY `modified_at` DESC", $tableName);
                return $qry;
            }
        }

        return $qry;
    }

    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");

    $responseData = new StdClass();
    $qry = "";

    $tableName = ensureTableName($responseData, $conn, $_GET);
    ensureTableConnection($responseData, $conn, $tableName);

    $qry = makeQuery($tableName, $_GET);
    if (!$qry) {
        reportError($responseData, "Cannot build correct query from your parameters");
        response($responseData);
        mysqli_close($conn);
        exit;
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
        $cardData->pinned = $row["pinned"];
        $cardData->created_at = $row["created_at"];
        $cardData->modified_at = $row["modified_at"];

        // TODO
        // $cardData->comment_count = $commentCnt;
        // $cardData->receivers_id = ~~

        $responseData->result->$row["id"] = $cardData;
    }

    response($responseData);
    mysqli_close($conn);
    exit;
}

function doPOST() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");

    $responseData = new StdClass();

    $_POST = json_decode(file_get_contents('php://input'), true);

    $tableName = ensureTableName($responseData, $conn, $_POST);
    ensureTableConnection($responseData, $conn, $tableName);

    $qry = sprintf("INSERT INTO `%s` (title, content, writer_id, priority, pinned, modified_at) VALUES ('%s', '%s', '%s', %d, %d, '%s');", 
                    $tableName, addslashes($_POST["title"]), addslashes($_POST["content"]), $_POST["writer_id"], $_POST["priority"], $_POST["pinned"], $_POST["modified_at"]);
    $qryResult = $conn->query($qry);

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

    $responseData = new StdClass();
    
    $_DEL = json_decode(file_get_contents('php://input'), true);

    $tableName = ensureTableName($responseData, $conn, $_DEL);
    ensureTableConnection($responseData, $conn, $tableName);

    $qry = sprintf("DELETE FROM `%s` WHERE id = %d", $tableName, $_DEL["id"]);
    $qryResult = $conn->query($qry);

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

    $responseData = new StdClass();

    $_PUT = json_decode(file_get_contents('php://input'), true);

    $tableName = ensureTableName($responseData, $conn, $_PUT);
    ensureTableConnection($responseData, $conn, $tableName);

    $qry = sprintf("UPDATE `%s` SET title = '%s', content = '%s', priority = %d, pinned = %d, modified_at = '%s' WHERE id = %d", 
                    $tableName, addslashes($_PUT["title"]), addslashes($_PUT["content"]), $_PUT["priority"], $_PUT["pinned"], $_PUT["modified_at"], $_PUT["id"]);
    $qryResult = $conn->query($qry);
    
    $responseData->success = $qryResult && $conn->affected_rows !== 0;
    if (!$qryResult) $responseData->error = $conn->error;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

?>