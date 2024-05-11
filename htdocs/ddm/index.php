<html>
<?php
    @session_start();
    if (!isset($_SESSION["userId"])) {
        echo "<script>location.replace('./auth/login.php')</script>";
    }
?>
<head>
	<title>뛰엠</title>
	<link rel="stylesheet" href="./src/style.css">
	<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
</head>
<body>
	<header>
		<span id="title">뛰엠</span>
		<img id="logo" src="./img/logo/jungtong_logo.png"/>
	</header>
	<nav>
		<button id="how-to-use">사용법</button>
		<button id="reset-chat">채팅창 초기화</button>
		<button id="drop-chat">채팅 그만하기</button>
		<!-- <button id="notify">알림 테스트</button> -->
		<button id="logout-btn">로그아웃</button>
	</nav>


	<div class="container">
		<user-container></user-container>
		<div class="main-container">
			<chat-container></chat-container>
			<chat-controller></chat-controller>

		</div>
		<emoji-container hidden></emoji-container>
	</div>
	<footer>
		<div id="ver-info"></div>
	</footer>

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