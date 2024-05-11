<?php
    @session_start();
    @session_destroy();
    echo "<script>sessionStorage.removeItem('userId'); sessionStorage.removeItem('userName');</script>";
?>

<html>
    <head>
        <title>Logout</title>
        <meta charset="utf-8" />
        <script>
            alert("로그아웃되었습니다.");
            location.replace("../index.php");
        </script>
    </head>
</html>