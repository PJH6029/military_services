<html>
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <link rel="stylesheet" href="./auth_style.css">
</head>
<body>
    <div class="container">
        <header>
            <h2>ISOT 3.0 로그인</h2>
        </header>
        <form method="post" action="check_login.php">
            <div class="main-container">
                <div class="input-container">
                    <input type="text" name="userId" id="userId" placeholder="아이디" />
                    <input type="password" name="userPw" id="userPw" placeholder="비밀번호" />
                </div>
                <button type="submit">로그인</button>
            </div>
        </form>
        <footer>
            <button onclick="location.replace('register.php')">계정 등록</button>
            <button onclick="location.replace('delete.php')">계정 삭제</button>
            <button onclick="location.replace('reset_pw.php')">비밀번호 재설정</button>
        </footer>
        <div class="info">이 페이지는 <span style="font-weight: bold">Chrome / Edge</span>에 최적화되어 있습니다<br>회원가입 문의: 4454</div>
    </div>

    <script>
        document.getElementById("userId").focus();
        // bind enter key
        document.querySelectorAll("input").forEach(inputElem => {
            inputElem.addEventListener("keydown", (e) => {
                if (e.keyCode === 13) {
                    document.body.forms[0].submit();
                }
            });
        });
    </script>
</body>
</html>