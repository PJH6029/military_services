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

// crud의 c, u, d는 auth가 해줌
// 왜 이렇게 짰지.. 나도 몰것다 
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    doGET();
} 

function doGET() {
    $conn = new mysqli($GLOBALS['host'], $GLOBALS['user'], $GLOBALS['pw'], $GLOBALS['dbName']);
    $conn->query("set names utf8");
    $responseData = new StdClass();
    $qry = "";

    if (isset($_GET["id"])) {
        $qry = sprintf("SELECT * FROM user_table WHERE id = %d", $_GET["id"]);
    } else {
        $qry = "SELECT * FROM user_table";
    }

    $qryResult = $conn->query($qry);
    $responseData->count = mysqli_num_rows($qryResult);

    while ($row = $qryResult->fetch_array(MYSQLI_ASSOC)) {
        $data = new StdClass();
        $data->id = $row["id"];
        $data->name = $row["name"];
        $data->end_date = $row["end_date"];

        $responseData->result->$row["id"] = $data;
    }

    header('Content-Type: application/json');
    echo json_encode($responseData);

    mysqli_close($conn);
    exit;
}

?>