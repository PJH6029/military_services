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
$dbName = 'ddm_db';

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

    $utfPartner = iconv("utf-8", "euc-kr", $_GET["partner"]);
    $utfUser = iconv("utf-8", "euc-kr", $_GET["user"]);

    // $log = sprintf("%s / Q: %s\n", date("Y-m-d H:i:s"), $qry);
    // file_put_contents("../log/chats.log", $log, FILE_APPEND);

    $ary = array();
    $responseData->hi = 0;
    $i = 0;
    while (true) {
        if (isset($_GET["latestChatId"])) {
            // new
            $qry = sprintf("SELECT * FROM chat_table WHERE id > %d and ((writer_user_id = '%s' and receiver_user_id = '%s') or (writer_user_id = '%s' and receiver_user_id = '%s')) ORDER BY id", 
                            $_GET["latestChatId"], $utfUser, $utfPartner, $utfPartner, $utfUser);
        } else {
            $qry = sprintf("SELECT * FROM chat_table WHERE ((writer_user_id = '%s' and receiver_user_id = '%s') or (writer_user_id = '%s' and receiver_user_id = '%s')) ORDER BY id", 
                            $utfUser, $utfPartner, $utfPartner, $utfUser);
        }
    
        $qryResult = $conn->query($qry);
        $num_rows = mysqli_num_rows($qryResult);
        if ($num_rows > 0) {
            $responseData->count = $num_rows;
           
            while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
                $data = new StdClass();
                $data->id = $row["id"];
                $data->content = ciconv("euc-kr", "utf-8", $row["content"]);
                $data->writer_user_id = $row["writer_user_id"];
                $data->receiver_user_id = $row["receiver_user_id"];
                $data->created_at = $row["created_at"];
                array_push($ary, $data);
            }
            break;
        } else {
            $i += 1;
            $responseData->hi = $i;
        }

        usleep(2500);
    }

    // if (isset($_GET["latestChatId"])) {
    //     // new
    //     $qry = sprintf("SELECT * FROM chat_table WHERE id > %d and ((writer_user_id = '%s' and receiver_user_id = '%s') or (writer_user_id = '%s' and receiver_user_id = '%s')) ORDER BY id", 
    //                     $_GET["latestChatId"], $utfUser, $utfPartner, $utfPartner, $utfUser);
    // } else {
    //     $qry = sprintf("SELECT * FROM chat_table WHERE ((writer_user_id = '%s' and receiver_user_id = '%s') or (writer_user_id = '%s' and receiver_user_id = '%s')) ORDER BY id", 
    //                     $utfUser, $utfPartner, $utfPartner, $utfUser);
    // }

    // $qryResult = $conn->query($qry);
    // $num_rows = mysqli_num_rows($qryResult);
    // $responseData->count = $num_rows;

    // $ary = array();
    // while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
    //     $data = new StdClass();
    //     $data->id = $row["id"];
    //     $data->content = ciconv("euc-kr", "utf-8", $row["content"]);
    //     $data->writer_user_id = $row["writer_user_id"];
    //     $data->receiver_user_id = $row["receiver_user_id"];
    //     $data->created_at = $row["created_at"];
    //     array_push($ary, $data);
    // }
    

    $responseData->contents = $ary;

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

    $utfWriter = iconv("utf-8", "euc-kr", $_POST["writer_user_id"]);
    $utfReceiver = iconv("utf-8", "euc-kr", $_POST["receiver_user_id"]);

    $qry = sprintf("INSERT INTO chat_table(content, writer_user_id, receiver_user_id) VALUES('%s', '%s', '%s')", 
                    addslashes($_POST["content"]), $_POST["writer_user_id"], $_POST["receiver_user_id"]);
    
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
    $conn->query("set names euckr");
    
    $_DEL = json_decode(file_get_contents('php://input'), true);

    $qry = sprintf("DELETE FROM chat_table WHERE id = %d", $_DEL["id"]);
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

}

?>