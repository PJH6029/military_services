<?php
    @session_start();
    @session_destroy();
?>

<html>
    <head>
        <title>Logout</title>
        <meta charset="utf-8" />
        <script>
            alert("로그아웃되었습니다.");
            location.replace("../ISOT/index.php");
        </script>
    </head>
</html>