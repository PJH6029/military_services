<html>
<head>
    <meta charset="UTF-8">
    <title>Change Info</title>
    <link rel="stylesheet" href="./auth_style.css">
</head>
<body>
    <div class="container">
        <header>
            <h2>ISOT3.0 Change Info</h2>
        </header>
        <form method="post" action="do_change_info.php">
            <div class="main-container">
                <div class="input-container">
                    <input type="text" name="userId" id="userId" placeholder="아이디" readonly />
                    <input type="text" name="userName" id="userName" placeholder="이름" />
                    <input type="text" name="userEndDate" id="userEndDate" placeholder="전역일 (20220822)" />
                </div>
                <button type="submit">변경</button>
            </div>
        </form>
        <footer>
            <button onclick="location.replace('../index.php')">돌아가기</button>
        </footer>
    </div>

    <script>
        document.getElementById("userId").value = sessionStorage.getItem("userId");
        document.getElementById("userName").value = sessionStorage.getItem("userName");
        document.getElementById("userEndDate").value = sessionStorage.getItem("userEndDate");


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