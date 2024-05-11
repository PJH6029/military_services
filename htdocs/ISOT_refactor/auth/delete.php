<html>
<head>
    <meta charset="UTF-8">
    <title>Delete</title>
    <link rel="stylesheet" href="./auth_style.css">
</head>
<body>
    <div class="container">
        <header>
            <h2>ISOT 2.0 Account Delete</h2>
        </header>
        <form method="post" action="do_delete.php">
            <div class="main-container">
                <div class="input-container">
                    <input type="text" name="userId" id="userId" placeholder="아이디" />
                    <input type="password" name="userPw" placeholder="비밀번호" />
                    <input type="text" name="userName" placeholder="이름" />
                </div>
                <button type="submit">확인</button>
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