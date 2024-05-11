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

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    doGET();
} 

function doGET() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names euckr");
    $responseData = new StdClass();
    $qry = "";

    if (isset($_GET["id"])) {
        $qry = sprintf("SELECT * FROM user_table WHERE id = %d", $_GET["id"]);
    } else {
        $qry = "SELECT * FROM user_table";
    }

    $qryResult = $conn->query($qry);
    $responseData->count = mysqli_num_rows($qryResult);

    $ary = array();
    while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
        $data = new StdClass();
        $data->id = ciconv("euc-kr", "utf-8", $row["id"]);
        $data->name = ciconv("euc-kr", "utf-8", $row["name"]);
        $data->end_date = ciconv("euc-kr", "utf-8", $row["end_date"]);
        array_push($ary, $data);
    }
    $responseData->contents = $ary;

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

?>