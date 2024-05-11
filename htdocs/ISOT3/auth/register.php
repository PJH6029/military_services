<html>
<head>
    <meta charset="UTF-8">
    <title>Register</title>
    <link rel="stylesheet" href="./auth_style.css">
</head>
<body>
    <div class="container">
        <header>
            <h2>ISOT 3.0 Register</h2>
        </header>
        <form method="post" action="do_register.php">
            <div class="main-container">
                <div class="input-container">
                    <input type="text" name="userId" id="userId" placeholder="아이디" />
                    <input type="password" name="userPw" placeholder="비밀번호" />
                    <input type="text" name="userName" placeholder="이름" />
                    <input type="text" name="userEndDate" placeholder="전역일 (20220822)" />
                </div>
                <button type="submit">등록하기</button>
            </div>
        </form>
        <footer>
            <button onclick="location.replace('login.php')">돌아가기</button>
        </footer>
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