<html>
<?php
    @session_start();
    if (!isset($_SESSION["userId"])) {
        echo "<script>location.replace('./auth/login.php')</script>";
    }
?>
<head>
	<title>ISOT MANAGER 3.0</title>
	<link rel="stylesheet" href="./src/style.css">
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
</head>
<body>
    <side-bar></side-bar>
    <div class="container">
        <home-app></home-app>
    </div>
	<script type="module" src="./src/index.js?ver=202302091443"></script>
    <script>
        <?php
            $userId = $_SESSION["userId"];
			$userName = $_SESSION["userName"];
			$userEndDate = $_SESSION["userEndDate"];
			echo "sessionStorage.setItem('userId', '$userId'); sessionStorage.setItem('userName', '$userName'); sessionStorage.setItem('userEndDate', '$userEndDate');";
        ?>
    </script>
</body>
</html>