<html>
<?php
    @session_start();
    if (!isset($_SESSION["userName"])) {
        echo "<script>location.replace('../auth/login.php')</script>";
    }
?>
<head>
    <title>ISOT MANAGER 2.0</title>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <link href="style.css" rel="stylesheet">

    <template id="pw-box-template">
        <style>
            * {
                font-size: 1.1rem;
            }

            :host {
                position: relative;
            }

            .container {
                width: 15rem;
                background-color: white;
                border-radius: 0.5rem;
                box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
            }

            .head {
                border-top-right-radius: 0.5rem;
                border-top-left-radius: 0.5rem;
                background-color: var(--primary);
                color: white;
                padding: 0.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .body {
                display: flex;
                flex-direction: column;
                padding: 0.75rem;
                gap: 0.75rem;
            }

            .show-btn, .remove-btn {
                cursor: pointer;
                padding: 0 0.4rem;
            }

            .show-btn > svg, .remove-btn > svg {
                fill: white;
            }

            .wrap {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .wrap-label {
                width: 4rem;
            }

            input { 
                width: 100%;
                font-size: 1rem;
                font-family: 'kakao';
                border: 1px var(--primary) solid;
                border-radius: 0.25rem;
                padding: 0.25rem;
                padding-left: 0.3rem;
                outline: none;
            }

            .title {
                background: transparent;
                color: white;
                border: none;
                font-size: 1.1rem;
                margin-right: 0.25rem;
            }

            .title:focus {
                outline: 1px white solid;
            }

            .last-date-container * {
                font-size: 0.9rem;
            }

            .new-div {
                display: none;
                position: absolute;
                color: white;
                background-color: #e91e63;
                padding: 0.25rem 0.5rem;
                border-radius: 0.5rem;
                right: -12px;
                top: -18px;
                font-size: 0.8rem;
            }
        </style>
        <div class="new-div">new</div>
        <div class="container">
            <div class="head">
                <input type="text" class="title" />
                <div class="show-btn">
                    <svg width="18" height="18" viewBox="0 0 16 16">
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                    </svg>
                </div>
                <div class="remove-btn">
                    <img src="./svgs/remove.svg">
                </div>
            </div>
            <div class="body">
                <div class="wrap">
                    <div class="wrap-label">ID</div>
                    <input id="id-input" type="text" />
                </div>
                <div class="wrap">
                    <div class="wrap-label">PW</div>
                    <input id="pw-input" type="password" />
                </div>
                <div class="wrap last-date-container">
                    <div class="wrap-label">최근 수정</div>
                    <div class="last-date"></div>
                </div>
            </div>
        </div>
    </template>

    <template id="vault-app-template">
        <style>
            .outer {
                width: calc(100% - 17.5rem);
                height: calc(100% - 2rem);
                margin-left: 14.5rem;
                padding: 1rem;
                position: relative;
            }

            .container { 
                display: flex;
                flex-direction: column;
                padding: 0.5rem;
                gap: 1rem;
                margin-bottom: 3rem;
            }

            .category {
                color: var(--primary);
                font-weight: bold;
                font-size: 1.75rem;
            }

            .card-box {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .add-btn {
                background-color: #00bcd4;
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 2.5rem;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .show-all-btn {
                padding: 0.5rem;
                border-radius: 0.5rem;
                position: fixed;
                top: 1rem;
                right: 2rem;
                background-color: var(--primary);
                color: white;
                display: flex;
                gap: 0.5rem;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }

            .show-all-btn > svg {
                fill: white;
                margin-bottom: -2px;
            }

            .add-div {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 15rem;
                border: 2px lightgray dashed;
                border-radius: 0.5rem;
                height: 10.75rem;
                cursor: pointer;
            }

            .footer {
                height: 10rem;
            }

            .header {
                font-size: 2rem;
                font-weight: bold;
                padding: 0.5rem 0.5rem 2rem 0.5rem;
                color: #d8d8d8;
            }
        </style>
        <div class="outer">
            <div class="show-all-btn">
                <svg width="18" height="18" viewBox="0 0 16 16">
                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                </svg>
                <div>전체 토글</div>
            </div>
            <div class="header">VAULT</div>
            <div class="container">
                <div class="category">
                    AFCCS 계정
                </div>
                <div class="card-box" id="AFCCS">
                    <!-- AFCCS -->
                </div>
            </div>
            <div class="container">
                <div class="category">
                    NAC
                </div>
                <div class="card-box" id="NAC">
                    <!-- NAC -->
                </div>
            </div>
            <div class="container">
                <div class="category">
                    서버 PW
                </div>
                <div class="card-box" id="SERVER">
                    <!-- SERVER -->
                </div>
            </div>
            <div class="container">
                <div class="category">
                    ETC
                </div>
                <div class="card-box" id="ETC">
                    <!-- ETC -->
                </div>
            </div>
            <div class="footer"></div>
        </div>
    </template>

    <template id="scheduler-template">
        <style>
            :host([hidden]) {
                display: none;
            }

            table {
                height: fit-content;
                text-align: center;
                font-weight: bold;
            }
            
            td {
                width: 3.6rem;
                min-width: 3.6rem;
            }

            td[sun], td[hol] {
                color:#e91e63;
            }
    
            td[sat] {
                color:#3f51b5;
            }

            tr > td:first-child {
                text-align: start;
                width: 6rem;
            }

            .desc-row {
                font-size: 0.75rem;
                height: 1rem;
            }

            .desc-row td {
                max-width: 3.5rem;
            }

            .schedule-row > td {
                font-size: 1.1rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 3.5rem;
                height: 2.5rem;
            }

            .month-row, .date-row {
                font-weight: 1.1rem;
            }

            tr[counting] {
                font-size: 0.9rem;
            }

            .scheduler-flex-wrapper {
                display: flex;
                flex-direction: column;
                width: calc(100% - 17.5rem);
                height: calc(100% - 2rem);
                margin-left: 14.5rem;
                padding: 1rem;
            }

            .scheduler-controller {
                display: flex;
                gap: 1rem;
            }

            .icon-btn {
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 4rem;

                width: 2rem;
                height: 2rem;
                
                background-color: var(--primary);
                font-weight: bold;
                cursor: pointer;
                transition: 0.2s ease-in-out;
            }

            #scheduler-next-month-btn > svg {
                transform: rotate(90deg);
            }
            #scheduler-next-month-btn:hover {
                transform: translate(5px);
            }

            #scheduler-current-month-btn > svg {
                transform: rotate(-90deg);
            }
            #scheduler-current-month-btn:hover {
                transform: translate(-5px);
            }

            #scheduler-today-btn:hover {
                transform: translateY(-3px);   
            }

            .txt-btn {
                border-radius: 4rem;

                display:flex;
                justify-content: center;
                align-items: center;

                height: 2rem;
                width: 5rem;
                background: var(--primary);
                color: white;
                font-weight: bold;
                font-size: 1rem;
                cursor: pointer;
                transition: 0.2s ease-in-out;
            }
        </style>
        <div class="scheduler-flex-wrapper">
            <div class="scheduler-controller">
                <div class="icon-btn" title="이번 달" id="scheduler-current-month-btn">
                    <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                    </svg>
                </div>
                <div class="icon-btn" title="다음 달" id="scheduler-next-month-btn">
                    <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                    </svg>
                </div>
                <div class="txt-btn" id="scheduler-today-btn">Today</div>
            </div>
            <div class="scheduler-container">
                <table>
                    <tr class="month-row">
                        <td>Recent.</td>
                    </tr>
                    <tr class="date-row">
                        <td></td>
                    </tr>
                    <tr class="gap-row"></tr>
                </table>
            </div>
        </div>

    </template>

    <template id="card-writer-template">
        <style>
            ::-webkit-scrollbar {
                display: none;
            }

            input {
                border: 3px var(--primary) solid;
                padding: 0.5rem 0.75rem;
                outline: none;
                border-radius: 0.5rem;
                font-family: 'kakao';
            }

            .back {
                opacity: 0;
                transition: all 0.1s ease-in-out;
                position: absolute;
                width: 100vw;
                height: 100vh;
                background-color: rgb(0 0 0 / 60%);
                z-index: 100;
                display: flex;
                align-items: center;
            }

            :host([appear]) .back {
                opacity: 1;
            }

            .click {
                width: 563px;
                height: 100%;
            }

            .window {
                height: calc(100% - 6rem);
                border-right: 5px var(--primary) solid;
                border-left: 5px var(--primary) solid;
                background-color: white;
                width: 45rem;
                padding: 3rem 2rem;
                box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
                overflow-y: scroll;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .head {
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
            }

            .head * {
                line-height: 100%;
            }

            .contentText {
                border: 3px var(--primary) solid;
                padding: 0.75rem;
                outline: none;
                border-radius: 0.5rem;
                font-family: 'kakao';
                resize: none;
                min-height: 15rem;
                line-height: normal;
            }

            .receiver {
                flex: 1;
            }

            .title, .writer, .receiver, .contentText {
                font-size: 1.1rem;
            }

            .writer {
                font-family: 'kakao';
                padding: 0.5rem;
                border: 3px var(--primary) solid;
                outline: none;
                border-radius: 0.5rem;
            }

            .writer[disabled] {
                opacity: 1;
                color: black;
            }

            .priority {
                font-size: 1.4rem;
                color: var(--primary);
            }

            .wrap {
                display: flex;
                gap: 0.5rem;
            }

            .desc {
                font-size: 2rem;
                padding-bottom: 0.5rem;
                font-weight: bold;
            }

            .priority-cont {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }

            .outer {
                width: 100%;
                display: flex;
                justify-content: space-between;
            }

            #confirm-btn {
                background-color: #00bcd4;
            }

            #cancel-btn {
                background-color: rgb(233, 30, 99);
            }
        </style>
        <div class="back">
            <div class="click"></div>
            <div class="window">
                <div class="desc">새 글 작성하기</div>
                <div class="outer">
                    <div class="priority-cont">
                        <toggle-chip text="!!!"></toggle-chip>
                        <toggle-chip disabled text="!!"></toggle-chip>
                        <toggle-chip disabled text="!"></toggle-chip>
                    </div>
                    <div class="wrap">
                        <chip-btn id="confirm-btn">확인</chip-btn>
                        <chip-btn id="cancel-btn">취소</chip-btn>
                    </div>
                </div>
                <div class="head">
                    <input type="text" class="title" placeholder="제목*" />
                    <div class="wrap">
                        <select class="writer" disabled>
                        </select>
                        <input type="text" class="receiver" placeholder="수신자 ex) @전체 / @방민수, @석지원" />
                    </div>
                    <textarea class="contentText" placeholder="내용*"></textarea>
                </div>
            </div>
            <div class="click"></div>
        </div>
    </template>

    <template id="modal-card-template">
        <style>
            ::-webkit-scrollbar {
                display: none;
            }

            .back {
                opacity: 0;
                transition: 0.1s ease-in-out;
                position: absolute;
                width: 100vw;
                height: 100vh;
                background-color: rgb(0 0 0 / 60%);
                z-index: 100;
                display: flex;
                align-items: center;
            }

            :host([appear]) .back {
                opacity: 1;
            }

            .click {
                flex: 1;
                height: 100%;
            }

            .window {
                height: calc(100% - 6rem);
                border-right: 5px var(--primary) solid;
                border-left: 5px var(--primary) solid;
                background-color: white;
                width: 45rem;
                padding: 3rem 2rem;
                box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
                overflow-y: scroll;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .title {
                font-weight: bold;
                font-size: 2rem;
            }

            .head {
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
            }

            .head * {
                line-height: 100%;
            }

            .contentText {
                padding: 2rem 0;
                font-size: 1.2rem;
                border-top: 3px var(--primary) solid;
                border-bottom: 3px var(--primary) solid;
            }

            .writer, .receiver, .creationTime {
                color: var(--primary);
                font-weight: bold;
            }

            .outer {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .pad-bot {
                padding-bottom: 0.8rem;
            }

            .pad-top {
                padding-top: 0.5rem;
            }

            .priority {
                font-weight: bold;
                font-size: 1.4rem;
                color: var(--primary);
            }

            .readCount {
                color: var(--primary);
                font-weight: bold;
            }

            .comment {
                margin-top: 1rem;
                padding-bottom: 10rem;
            }

            .comment-list {
                padding: 0.5rem;
                border: 2px var(--primary) solid;
                border-radius: 0.5rem;
                display: flex;
                flex-direction: column;
                gap: 0.2rem;
            }

            .comment-count {
                font-weight: bold;
                color: var(--primary);
                padding-bottom: 1rem;
            }

            .inner {
                display: flex;
                flex-direction: column;
                gap: 0.3rem;
            }

            .inner.end {
                flex-direction: row;
                align-items: flex-end;
            }

            .edit-btn > svg, .pin-btn svg {
                fill: white;
            }

            .pin-btn path {
                stroke: white;
                stroke-width: 0.4px;
            }

            .pin-btn #disable {
                display: none;
            }

            .pin-btn #enable {
                display: block;
            }

            .pin-btn[toDisable] #disable {
                display: block;
            }

            .pin-btn[toDisable] #enable {
                display: none;
            }

            chip-btn {
                gap: 0.5rem;
                justify-content: center;
                align-items: center;
                display: flex;
                font-size: 0.9rem;
            }

            .wrap {
                margin-top: 1rem;
                display: flex;
                gap: 0.5rem;
            }

            input {
                font-size: 1rem;
                color: black !important;
                font-weight: normal !important;
                border: 2px var(--primary) solid;
                padding: 0.4rem 0.5rem;
                outline: none;
                border-radius: 0.5rem;
                font-family: 'kakao';
                flex: 1;
            }

            .comment-writer {
                font-size: 1rem;
                font-family: 'kakao';
                padding: 0.3rem;
                border: 2px var(--primary) solid;
                outline: none;
                border-radius: 0.5rem;
            }

            .comment-writer[disabled] {
                opacity: 1;
                color: black;
            }

            .comment-wrap {
                display: flex;
                align-items: center;
            }

            .comment-div {
                flex: 1;
                display: flex;
                gap: 0.3rem;
            }

            .comment-div > div:first-child {
                padding: 0 0.25rem;
                color: var(--primary);
                text-align: center;
            }

            .comment-div > div:nth-child(3) {
                width: 3rem;
                text-align: center;
            }

            .comment-div > div:last-child {
                flex: 1;
                padding-left: 0.3rem;
            }

            .comment-wrap > .remove-btn {
                background-color: #e91e63;
                width: 1rem;
                height: 1rem;
                justify-content: center;
                align-items: center;
                border-radius: 3rem;
                display: flex;
                cursor: pointer;
            }

            .comment-wrap img {
                width: 1rem;
                height: 1rem;
                transform: rotate(45deg);
            }

            :host([priority="3"]) .priority {
                color: #e91e63;
            }

            :host([priority="2"]) .priority {
                color: #3f51b5;
            }

            :host([priority="1"]) .priority {
                color: #4caf50;
            }
        </style>
        <div class="back">
            <div class="click"></div>
            <div class="window">
                <div class="head">
                    <div class="outer pad-bot">
                        <div class="title">
                            <!-- 글 제목 -->
                        </div>
                        <div class="priority">
                            <!-- 중요도 -->
                        </div>
                    </div>
                    <div class="outer">
                        <div class="inner">
                            <div class="writer">
                                <!-- 작성자 -->
                            </div>
                            <div class="receiver">
                                <!-- 멘션된 사람 -->
                            </div>
                        </div>
                        <div class="inner end">
                            <chip-btn class="edit-btn" title="수정하기">
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" /><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                </svg>
                            </chip-btn>
                            <chip-btn class="pin-btn">
                                <svg width="16" height="16" viewBox="0 0 16 16" id="disable">
                                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a.5927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l 3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146zm.122 2.112v-.002.002zm0-.002v.002a.5.5 0 0 1-.122.51L6.293 6.878a.5.5 0 0 1-.511.12H5.78l-.014-.004a4.507 4.507 0 0 0-.288-.076 4.922 4.922 0 0 0-.765-.116c-.422-.028-.836.008-1.175.15l5.51 5.509c.141-.34.177-.753.149-1.175a4.924 4.924 0 0 0-.192-1.054l-.004-.013v-.001a.5.5 0 0 1 .12-.512l3.536-3.535a.5.5 0 0 1 .532-.115l.096.022c.087.017.208.034.344.034.114 0 .23-.011.343-.04L9.927 2.028c-.029.113-.04.23-.04.343a1.779 1.779 0 0 0 .062.46z" />
                                </svg>
                                <svg width="16" height="16" viewBox="0 0 16 16" id="enable">
                                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a.5927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l 3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                                </svg>
                            </chip-btn>
                            <chip-btn class="read-btn">읽지 않음으로</chip-btn>
                        </div>
                    </div>
                    <div class="outer pad-top">
                        <div class="creationTime">
                            <!-- 작성 시각 -->
                        </div>
                        <div class="readCount">
                            <!-- 읽은 사람 수 -->
                        </div>
                    </div>
                </div>
                <div class="contentText">
                    <!-- 글 내용 -->
                </div>
                <div class="comment">
                    <div class="comment-count">댓글[0]</div>
                    <div class="comment-list"></div>
                    <div class="wrap">
                        <select class="comment-writer" disabled>
                        </select>
                        <input type="text" class="comment-content" placeholder="내용*" />
                        <chip-btn class="comment-write-btn">작성하기</chip-btn>
                    </div>
                </div>
            </div>
            <div class="click"></div>
        </div>
    </template>

    <template id="minimal-card-board-template">
        <style>
            :host {
                flex: 1;
                background-color: white;
                box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
                border-radius: 0.5rem;
                overflow-y: scroll;
                padding-bottom: 0.5rem;
            }

            #top-btn {
                cursor: default;
                position: absolute; 
                bottom: 3rem; 
                left: 31.5rem;
                font-weight: bold;
                transition: 0.2s ease-in-out;
                opacity: 0;
                background-color: var(--primary);
            }

            #top-btn.show {
                cursor: pointer;
                opacity: 1;
            }

            #top-btn > svg path {
                stroke: white;
                stroke-width: 1px;
            }

            .icon-btn {
                background-color: #00bcd4;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 3rem;
                height: 1.9rem;
                border-radius: 1rem;
                cursor: pointer;
                transition: 0.2s ease-in-out;
            }

            .icon-btn:hover {
                transform: translateY(-2px);
            }

            #pinned {
                position: sticky;
                top: 0;
                width: 100%;
            }

            #search-input {
                font-size: 1rem;
                padding: 0.25rem;
                padding-left: 0.5rem;
                height: 2.5rem;
                width: 100%;
                border: 0.2rem var(--primary) solid;
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                font-family: 'kakao';
                outline: none;
            }
        </style>
        <div>
            <input type="text" placeholder="검색" id="search-input" />
        </div>
        <div id="pinned"></div>
        <slot></slot>
        <div class="icon-btn" title="맨 위로 올라가기" id="top-btn">
            <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
            </svg>
        </div>
    </template>

    <template id="minimal-card-template">
        <style>
            :host([hidden]) {
                display: none;
            }

            :host([read]) * {
                color: #adadad;
            }

            :host([pinned]) .container {
                background-color: var(--primary);
            }

            :host([pinned]) * {
                color: white;
                font-weight: normal;
            }

            :host([pinned]) .priority {
                color: white !important;
            }

            :host([pinned]) .head, :host([pinned]) .readCount {
                display: none;
            }

            :host([pinned]) .container {
                padding-bottom: 0.5rem;
                border-bottom: 2px #372e70 solid;
            }

            :host([pinned]) .title {
                font-size: 1.1rem;
            }

            .writer-receiver {
                display: none;
            }

            :host([pinned]) .writer-receiver {
                display: block;
            }

            .pin-icon {
                display: none;
                fill: white;
                margin-right: 0.5rem;
            }

            :host([pinned]) .pin-icon {
                display: block;
            }

            .container {
                color: #303030;
                font-size: 1rem;
                padding: 0.5rem 1rem;
                padding-bottom: 0.3rem;
                border-bottom: 2px lightgray solid;
                font-weight: bold;
                opacity: 1;
                transition: opacity 0.2s ease-in-out;
                display: flex;
                gap: 1rem;
                align-items: center;
                cursor: pointer;
            }

            .inner {
                width: 100%;
            }

            :host([dimmed]) .container {
                opacity: 0.4;
            }

            .head {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .creationTime {
                color: gray;
            }

            .body {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding: 0.4rem 0;
            }

            .wrap {
                display: flex;
                align-items: flex-end;
                gap: 0.5rem;
                font-size: 0.9rem;
            }

            .wrap > div {
                line-height: 110%;
            }

            .writer, .receiver {
                color: var(--primary);
            }

            .receiver {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 18rem;
            }

            .title {
                font-size: 1.2rem;
                line-height: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 20rem;
            }

            .readCount {
                line-height: 100%;
            }

            .check-div {
                background-color: var(--primary);
                width: 2.2rem;
                height: 2rem;
                justify-content: center;
                align-items: center;
                border-radius: 3rem;
                display: none;
                z-index: 100;
            }

            .check-div > img {
                width: 1.5rem;
                height: 1.5rem;
            }

            :host([checked]) .check-div {
                display: flex;
            }

            :host([priority="3"]) .priority {
                color: #e91e63;
            }

            :host([priority="2"]) .priority {
                color: #3f51b5;
            }

            :host([priority="1"]) .priority {
                color: #4caf50;
            }
        </style>
        <div class="container">
            <div class="check-div">
                <img src="./svgs/check.svg" />
            </div>
            <div class="inner">
                <div class="head">
                    <div class="wrap">
                        <div class="writer">
                            <!-- 작성자 -->
                        </div>
                        <div>→</div>
                        <div class="receiver">
                            <!-- 멘션된 사람 -->
                        </div>
                    </div>
                    <div class="priority">
                        <!-- 중요도 -->
                    </div>
                </div>
                <div class="body">
                    <div class="wrap">
                        <div class="pin-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a.5927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l 3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                            </svg>
                        </div>
                        <div class="title">
                            <!-- 글 제목 -->
                        </div>
                        <div class="comment">
                            <!-- 댓글 개수 -->
                        </div>
                    </div>
                    <div class="wrap">
                        <div class="creationTime">
                            <!-- 작성 시각 -->
                        </div>
                        <div>|</div>
                        <div class="readCount">
                            읽음 0 / 10
                        </div>
                        <div class="writer-receiver"></div>
                    </div>
                </div>
            </div>
        </div>
    </template>

    <template id="simple-card-template">
        <style>
            :host {
                display: flex;
                flex-direction: column;
                gap: 0.7rem;
                position: relative;
                color: black;
                padding: 1rem;
                background-color: white;
                box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
                border-radius: 0.5rem;
                transition: 0.2s ease-in-out;
                min-height: auto;
                max-height: auto;
            }

            :host([memo]) > ::slotted(textarea) {
                border: none;
                resize: none;
                font-size: 1.1rem;
                font-family: 'kakao';
            }
        </style>
        <slot></slot>
    </template>

    <template id="toggle-chip-style">
        <style>
            :host {
                font-size: 1rem;
                border: 2px transparent solid;
                border-radius: 1rem;
                padding: 0.2rem 1rem;

                background-color: var(--primary);
                color: white;
                text-align: center;
                user-select: none;
                transition: 0.2s ease-in-out;
            }

            :host(:hover) {
                transform: translateY(-2px);
                cursor: pointer;
            }

            :host([disabled]) {
                background-color: transparent;
                border: 2px var(--primary) solid;
                color: black;
            }
        </style>
        <div></div>
    </template>

    <template id="link-chip-style">
        <style>
            :host {
                font-size: 1rem;
                border: 2px transparent solid;
                border-radius: 1rem;
                padding: 0.2rem 1rem;
                background-color: var(--primary);
                color: white;
                text-align: center;
                user-select: none;
                transition: 0.2s ease-in-out;
            }

            :host(:hover) {
                cursor: pointer;
                transform: translateY(-2px);
            }

            :host([thin]) {
                height: 1rem;
                font-size: 0.75rem;
            }
        </style>
        <slot></slot>
    </template>

    <template id="clock-template">
        <style>
            .container {
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                align-items: center;
            }

            div {
                font-size: 1.5rem;
                font-weight: bold; 
                color: var(--primary);
            }
        </style>
        <simple-card>
            <div class="container">
                <div id="date"></div>
                <div id="time"></div>
            </div>
        </simple-card>
    </template>

    <template id="quick-memo-template">
        <style>
            .remove-btn {
                background-color: #e91e63;
                width: 1.5rem;
                height: 1.5rem;
                justify-content: center;
                align-items: center;
                border-radius: 3rem;
                display: flex;
                cursor: pointer;
            }

            .remove-btn > img {
                width: 1.5rem;
                height: 1.5rem;
                transform: rotate(45deg);
            }

            simple-card {
                gap: 0.6rem;
            }
        </style>
        <simple-card memo>
            <div class="remove-btn">
                <img src="./svgs/plus.svg" />
            </div>
            <textarea placeholder="네이스 네이스~"></textarea>
        </simple-card>
    </template>

    <template id="sidebar-template">
        <style>
            :host {
                position: fixed;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: space-between;
                width: 12rem;
                height: calc(100% - 1.5rem);
                padding: 0.75rem;
                background-color: var(--primary);
                box-shadow: 0 0 10px 0px rgb(0 0 0 / 10%);
                color: white;
            }

            .wrapper {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .header {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 1rem;
                cursor: pointer;
                padding: 0.5rem;
            }

            .header > p {
                font-size: 1rem;
                font-weight: bold;
                line-height: 1.1rem;
                margin: 0;
            }

            .header > svg {
                margin-top: 0.25rem;
            }

            .divider {
                width: 100%;
                height: 3px;
                background-color: white;
                border-radius: 2px;
            }

            .item {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                border-radius: 0.5rem;
                gap: 1rem;
                cursor: pointer;
                height: 2rem;
                padding: 0.3rem 1rem 0.3rem 1rem;
                transition: 0.2s ease-in-out;
            }

            .item[selected] {
                background-color: #372e70;
            }

            .item > p {
                font-size: 1rem;
            }

            .item > svg {
                fill: white;
                transition: 0.2s ease-in-out;
                margin-top: 0.1rem;
            }

            .info {
                justify-content: flex-end;
                font-family: consolas;
                font-size: 0.6rem;
                user-select: none;
                cursor: pointer;
                gap: 0.2rem;
                padding: 0.5rem;
            }

            .inner {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .profile-select {
                padding: 0.5rem 0.9rem;
                font-size: 1.1rem;
                background-color: #5e52a3;
                border-radius: 0.5rem;
                box-shadow: 0 0 10px 0px rgb(0 0 0 / 10%);
                cursor: pointer;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .profile-select svg {
                transform: rotate(180deg);
                stroke: white;
                stroke-width: 1px;
            }

            .profile-select-outer {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .counter {
                display: flex;
                font-size: 0.7rem;
                gap: 0.5rem;
                justify-content: space-between;
            }

            .counter > div {
                flex: 1;
                padding: 0.2rem 0.5rem;
                border-radius: 0.5rem;
                background-color: rgb(233, 30, 99);
                display: flex;
                justify-content: center;
                gap: 0.5rem;
                transition: 0.2s ease-in-out;
            }

            .counter > div:nth-child(1) {
                flex: 0.7;
            }

            .counter > div[allRead] {
                background-color: var(--primary);
            }

            .profile-options {
                background-color: #5e52a3;
                border-radius: 0.5rem;
                transition: 0.2s ease-in-out;
            }

            .profile-options[hidden] {
                opacity: 0;
            }

            .profile-options > div {
                padding: 0.5rem 1rem;
                cursor: pointer;
                transition: 0.1s ease-in-out;
            }

            .profile-options > div:hover {
                background-color: var(--primary);
                box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
            }

            .profile-options > div:first-child {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
            }

            .profile-options > div:last-child {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
            }
        </style>

        <div class="wrapper">
            <div class="header" onclick="location.reload()">
                <svg width="38" height="38" fill="white" viewBox="0 0 16 16">
                    <path d="M5 7h3V4H5v3Z"></path>
                    <path d="M1 2a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 9H1V8H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 6H1V5H.5a.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 .5 2H1Zm11 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7Zm2 0a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7ZM3.5 10a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6Zm0 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6ZM4 4h-.5a.5.5 0 0 0 0 1H4v1h-.5a.5.5 0 0 0 0 1H4a1 1 0 0 0 1 1v.5a.5.5 0 0 0 1 0V8h1v.5a.5.5 0 0 0 1 0V8a1 1 0 0 0 1-1h.5a.5.5 0 0 0 0-1H9V5h.5a.5.5 0 0 0 0-1H9a1 1 0 0 0-1-1v-.5a.5.5 0 0 0-1 0V3H6v-.5a.5.5 0 0 0-1 0V3a1 1 0 0 0-1 1Zm7 7.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5Z"></path>
                </svg>
                <p>ISOT MANAGER 2.0</p>
            </div>
            <div class="divider"></div>
            <div class="profile-select">
                <div class="profile-select-outer">
                    <div class="current-profile"></div>
                    <link-chip href="../auth/logout.php" thin>로그아웃</link-chip>
                </div>
                <div class="counter">
                    <div>
                        <span>안읽음</span>
                        <span id="no-read">1</span>
                    </div>
                    <div>
                        <span>안읽음 + @</span>
                        <span id="no-read-mention">0</span>
                    </div>
                </div>
            </div>
            <div class="inner">
                <div class="item" id="home">
                    <svg width="22" height="22" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" />
                        <path fill-rule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z" />
                    </svg>
                    <p>HOME</p>
                </div>
                <div class="item" id="vault">
                    <svg width="22" height="22" viewBox="0 0 16 16">
                        <path d="M9.778 9.414A2 2 0 1 1 6.95 6.586a2 2 0 0 1 2.828 2.828z"></path>
                        <path d="M2.5 0A1.5 1.5 0 0 0 1 1.5V3H.5a.5.5 0 0 0 0 1H1v3.5H.5a.5.5 0 0 0 0 1H1V12H.5a.5.5 0 0 0 0 1H1v1.5A1.5 1.5 0 0 0 2.5 16h12a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 14.5 0h-12zm3.036 4.464 1.09 1.09a3.003 3.003 0 0 1 3.476 0l1.09-1.09a.5.5 0 1 1 .707.708l-1.09 1.09c.74 1.037.74 2.44 0 3.476l1.09 1.09a.5.5 0 1 1-.707.708l-1.09-1.09a3.002 3.002 0 0 1-3.476 0l-1.09 1.09a.5.5 0 1 1-.708-.708l1.09-1.09a3.003 3.003 0 0 1 0-3.476l-1.09-1.09a.5.5 0 1 1 .708-.708zM14 6.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 1 0z"></path>
                    </svg>
                    <p>VAULT</p>
                </div>
                <div class="item" id="scheduler-app">
                    <svg width="22" height="22" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2h-11zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
                    </svg>
                    <p>SCHEDULER</p>
                </div>
                <div class="item" id="calender-app">
                    <svg width="22" height="22" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M0 1.5V13a1 1 0 0 0 1 1V1.5a.5.5 0 0 1 .5-.5H14a1 1 0 0 0-1-1H1.5A1.5 1.5 0 0 0 0 1.5z" />
                        <path fill-rule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v11A1.5 1.5 0 0 0 3.5 16h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 16 9.586V3.5A1.5 1.5 0 0 0 14.5 2h-11zm6 8.5a1 1 0 0 1 1-1h4.396a.25.25 0 0 1 .177.427l-5.146 5.146a.25.25 0 0 1-.427-.177V10.5z" />
                    </svg>
                    <p>CALENDER</p>
                </div>
                <div class="item" id="notepad">
                    <svg width="22" height="22" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M0 1.5V13a1 1 0 0 0 1 1V1.5a.5.5 0 0 1 .5-.5H14a1 1 0 0 0-1-1H1.5A1.5 1.5 0 0 0 0 1.5z" />
                        <path fill-rule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v11A1.5 1.5 0 0 0 3.5 16h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 16 9.586V3.5A1.5 1.5 0 0 0 14.5 2h-11zm6 8.5a1 1 0 0 1 1-1h4.396a.25.25 0 0 1 .177.427l-5.146 5.146a.25.25 0 0 1-.427-.177V10.5z" />
                    </svg>
                    <p>NOTEPAD</p>
                </div>
            </div>
        </div>
        <div class="wrapper info" id="isot-info">
            <span style="font-weight: bold; font-size: 1.1rem;">v2.15</span> last update 23.08.30.
        </div>
    </template>

    <template id="board-controller-template">
        <style>
            simple-card {
                order: 1;
            }

            .wrapper {
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start;
            }

            .divider {
                width: 0.15rem; 
                background-color: var(--primary); 
                margin: 0 0.5rem; 
                border-radius: 1rem;
            }

            .item {
                display: flex; 
                gap: 0.5rem;
            }

            #card-add-btn {
                background-color: #00bcd4;
            }

            #card-remove-btn {
                background-color: #e91e63;
                color: white;
            }

            .icon-btn {
                background-color: #00bcd4;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 3rem;
                height: 1.9rem;
                border-radius: 1rem;
                cursor: pointer;
                transition: 0.2s ease-in-out;
            }

            .icon-btn:hover {
                transform: translateY(-2px);
            }

            #card-filter {
                flex-wrap: wrap;
                align-items: center;
            }
        </style>
        <simple-card>
            <div class="wrapper">
                <div class="item" id="card-filter">
                    <toggle-chip text="!!!" title="매우 중요한 카드 표시"></toggle-chip>
                    <toggle-chip text="!!" title="중요한 카드 표시"></toggle-chip>
                    <toggle-chip text="!" title="보통 카드 표시"></toggle-chip>
                    <toggle-chip text="@" title="멘션된 카드만 표시" disabled></toggle-chip>
                    <toggle-chip text="안 읽음" title="아직 안읽은 카드만 표시" disabled></toggle-chip>
                    <chip-btn thin id="read-all-btn">모두 읽음으로 표시</chip-btn>
                </div>
                <div class="item">
                    <div class="icon-btn" id="card-add-btn" title="카드 추가">
                        <img src="./svgs/plus.svg" />
                    </div>
                    <div class="icon-btn" id="card-remove-btn" title="카드 삭제">
                        <img src="./svgs/remove.svg" />
                    </div>
                </div>
            </div>
        </simple-card>
    </template>

    <template id="cyc-converter-template">
        <style>
            simple-card {
                gap: 0;
            }

            .container {
                display: flex;
                gap: 0.8rem;
                flex-direction: column;
            }

            .header {
                font-size: 1.2rem; 
                font-weight: bold; 
                color: var(--primary);
                text-align: center;
            }

            #cyc-textarea {
                font-size: 0.8rem;
                padding: 0.25rem;
                padding-left: 0.5rem;
                height: 2rem;
                border: 0.2rem var(--primary) solid;
                border-radius: 0.5rem;
                resize: none;
                font-family: 'kakao';
                outline: none;
                flex: 1;
            }

            #cyc-table-container {
                opacity: 0;
                height: 0;
                flex: 1;
            }

            .inner {
                display: flex;
                gap: 1rem;
                color: var(--primary);
                font-weight: bold;
                text-align: center;
            }

            #ban-div {
                flex: 1;
            }

            #release-div {
                flex: 1
            }
        </style>
        <simple-card>
            <div class="container">
                <div class="header">
                    사위대 변환기
                </div>
                <div class="inner">
                    <textarea id="cyc-textarea" placeholder="여기에 붙여넣기"></textarea>
                    <chip-btn id="cyc-btn">변환</chip-btn>
                </div>
                <div class="inner">
                    <div id="ban-div">차단 IP : 0 개</div>
                    <div id="release-div">해제 IP : 0 개</div>
                </div>
            </div>
            <div id="cyc-table-container"></div>
        </simple-card>
    </template>

    <template id="worker-status-template">
        <style>
            simple-card {
                gap: 0.5rem;
            }

            .header {
                font-size: 1.2rem; 
                font-weight: bold; 
                color: var(--primary);
                text-align: center;
            }

            .display-container {
                display: flex;
                position: relative;
                width: 100%;
            }

            .display-inner {
                flex: 1; 
                display: flex; 
                flex-direction: column; 
                gap: 0.25rem; 
                padding: 0.5rem;
                padding-top: 0;
            }

            .display-header {
                text-align: center; 
                color: var(--primary); 
                font-weight: bold; 
                margin-bottom: 0.5rem;
                font-size: 1.1rem;
            }

            .divider {
                border: 1px var(--primary) dashed;
                margin: 1rem 0;
            }

            .btn-container {
                display: flex; 
                width: 100%; 
                gap: 0.5rem; 
                justify-content: center;
            }

            .display-table {
                width: 100%;
                display: flex;
                flex-direction: column;
                text-align: center;
                color: var(--primary);
                gap: 0.4rem;
            }

            .display-table > div:nth-child(odd) {
                display: flex;
                justify-content: center;
            }

            .display-table > div:nth-child(odd) > div {
                width: fit-content;
                background-color: var(--primary);
                color: white;
                border-radius: 0.5rem;
                padding: 0.2rem 1.8rem;
                font-size: 0.9rem;
            }

            .display-table > div:nth-child(even) {
                width: 100%;
                display: flex;
                justify-content: center;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-bottom: 0.4rem;
                font-weight: bold;
            }

            textarea {
                font-size: 0.8rem;
                padding: 0.25rem;
                padding-left: 0.5rem;
                height: 2rem;
                border: 0.2rem var(--primary) solid;
                border-radius: 0.5rem;
                resize: none;
                font-family: 'kakao';
                outline: none;
            }

            svg {
                fill: var(--primary);
                width: 20;
                height: 20;
            }

            svg path {
                stroke: var(--primary);
                stroke-width: 0.3px;
            }

            .cert-cont {
                margin-top: 0.5rem;
                font-weight: bold;
                font-size: 0.9rem;
            }

            .arrow {
                position: absolute;
                top: 42%;
                cursor: pointer;
            }

            .left {
                left: -7px;
            }

            .right {
                right: -7px;
            }

            .left > svg {
                transform: rotate(-90deg);
            }

            .right > svg {
                transform: rotate(90deg);
            }
        </style>
        <simple-card>
            <div class="header">근무자 현황</div>
            <div class="display-container">
                <div class="arrow left">
                    <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                    </svg>
                </div>
                <div class="arrow right">
                    <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                    </svg>
                </div>
                <div class="display-inner" id="today">
                    <div class="display-header">오늘 (03.24)</div>
                    <div class="display-table">
                        <div>
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.44a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.41a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"></path>
                            </svg>
                        </div>
                        <div class="day-cont">
                            <!-- 금일 주간 근무자 -->
                        </div>
                        <div>
                            <svg width="16" height="16" fill="black" viewBox="0 0 16 16">
                                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.55 1.533-.6a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"></path>
                            </svg>
                        </div>
                        <div class="night-cont">
                            <!-- 금일 야간 근무자 -->
                        </div>
                        <div class="cert-cont">CERT</div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="display-inner" id="tomorrow">
                    <div class="display-header">내일 (03.25)</div>
                    <div class="display-table">
                        <div>
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.44a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.41a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"></path>
                            </svg>
                        </div>
                        <div class="day-cont">
                            <!-- 익일 주간 근무자 -->
                        </div>
                        <div>
                            <svg width="16" height="16" fill="black" viewBox="0 0 16 16">
                                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.55 1.533-.6a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"></path>
                            </svg>
                        </div>
                        <div class="night-cont">
                            <!-- 익일 야간 근무자 -->
                        </div>
                        <div class="cert-cont">CERT</div>
                    </div>
                </div>
            </div>
            <div class="btn-container">
                <chip-btn thin id="cyc-btn">사위대 근무자 파악 복사</chip-btn>
                <chip-btn thin id="put-schedule-btn">스케쥴 붙여넣기</chip-btn>
            </div>
            <textarea placeholder="여기에 엑셀에서 복사한 데이터 붙여넣기" hidden></textarea>
        </simple-card>
    </template>

    <template id="chip-btn-template">
        <style>
            :host {
                font-size: 1rem;
                border: 2px transparent solid;
                border-radius: 1rem;
                padding: 0.2rem 1rem;
                background-color: var(--primary);
                color: white;
                text-align: center;
                user-select: none;
                transition: 0.2s ease-in-out;
                width: fit-content;
                font-weight: normal;
            }

            :host(:hover) {
                transform: translateY(-2px);
                cursor: pointer;
            }

            :host([thin]) {
                height: 1rem;
                font-size: 0.75rem;
            }
        </style>
        <slot></slot>
    </template>

    <template id="shortcut-container-template">
        <style>
            .container {
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                align-items: center; 
                gap: 0.8rem;
            }

            .header {
                font-size: 1.2rem; 
                font-weight: bold; 
                color: var(--primary);
                text-align: center;
            }

            .chip-container {
                display: flex; 
                justify-content: center; 
                align-items: center;
                gap: 0.5rem; 
                flex-wrap: wrap;
            }
        </style>
        <simple-card>
            <div class="container">
                <div class="header">바로가기</div>
                <div class="chip-container">
                    <!-- security issue -->
                </div>
            </div>
        </simple-card>
    </template>

    <template id="io-template">
        <style>
            .container {
                padding: 0 0.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .container > div:first-child {
                color: var(--primary);
                font-weight: bold;
            }

            .container > div:last-child {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                align-items: center;
            }
        </style>
        <simple-card>
            <div class="container">
                <div>DB 관리</div>
                <div>
                    <chip-btn thin id="export-btn">파일로 내보내기</chip-btn>
                    <chip-btn thin id="import-btn">파일에서 불러오기</chip-btn>
                </div>
            </div>
        </simple-card>
    </template>

    <template id="calender-template">  
        <style>
            :host {
                display: flex;
                width: calc(100% - 17.5rem);
                height: calc(100% - 2rem);
                margin-left: 14.5rem;
                padding: 1rem;
                justify-content: center;
            }

            :host([hidden]) {
                display: none;
            }

            table {
                flex: 2 1 0;
                height: fit-content;
                text-align: center;
                font-weight: bold;
            }

            .day-row, .week-row {
                text-align: right;
            }

            .day-row td, .week-row td {
                padding: 0.15rem 0.5rem 0.15rem 0;
            }

            td[sat], .week-info[sat] {
                color: #3f51b5;
            }

            td[sun], td[hol], .week-info[sun], .week-info[hol] {
                color: #e91e63;
            }


            td[before], .week-info[before] {
                color: rgba(210, 210, 210, 0.7);
            }

            td[after], .week-info[after] {
                color: rgba(210, 210, 210, 0.7);;
            }

            .mouse-area {
                flex: 1 1 0;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: 0.2s ease-in-out;
                cursor: pointer;
            }

            .icon-btn {
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 4rem;

                width: 3rem;
                height: 6rem;
                
                background-color: var(--primary);
                font-weight: bold;
            }

            #next-month-btn > svg {
                transform: rotate(90deg);
            }
            #next-month-area:hover {
                transform: translate(5px);
            }

            #prev-month-btn > svg {
                transform: rotate(-90deg);
            }
            #prev-month-area:hover {
                transform: translate(-5px);
            }

            #header {
                font-size: 2rem;
                font-weight: bold;
                padding: 0.5rem 0.5rem 0.5rem 0.5rem;
                color: #d8d8d8;
                text-align: left;
            }

            .header-btn {
                border-radius: 4rem;

                display:flex;
                justify-content: center;
                align-items: center;

                height: 2.5rem;
                background: var(--primary);
                color: white;
                font-weight: bold;
                font-size: 1rem;
                cursor: pointer;
                transition: 0.2s ease-in-out;
            }

            #today-btn {
                width: 6rem;
            }

            #today-btn:hover {
                transform: translateY(-3px);
            }

            #how-to-use-btn {
                width: 8rem;
            }

            #how-to-use-btn[desc] {
                width: 40rem;
            }

            #numbers-btn {
                width: 8rem;
            }


            .container {
                display: flex;
                flex-direction: column;
                /* width: 85%; */
            }

            .header {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .btn-cover {
                height: 2.5rem;
                width: 6rem;
                position: relative;
            }

            .knobs {
                z-index: 2;
            }

            .layer {
                width: 100%;
                background: var(--primary);
                transition: 0.3s ease all;
                z-index: 1;
                border-radius: 4rem;
            }

            .checkbox {
                position: relative;
                top: -3px;
                left: -4px;
                appearance: none;
                width: 100%;
                height: 100%;
                cursor: pointer;
                opacity: 0;
                z-index: 3;
            }

            .knobs, .layer {
                position: absolute;
                top: 0;
                right: 0;
                left: 0;
                bottom: 0;
            }

            .knobs {
                top: -0.35rem;
            }

            #display-toggle-btn .knobs:before {
                content: "주";
                position: absolute;
                top: 0.5rem;
                left: 0.1rem;
                border: 0.15rem white solid;
                color: white;
                font-weight: bold;
                border-radius: 4rem;
                width: 3rem;
                height: 2rem;
                
                display: flex;
                justify-content: center;
                align-items: center
            }

            #display-toggle-btn .checkbox:checked + .knobs:before {
                content: "월";
                left: 2.6rem;
                color: black;
                border: 0.15rem black solid;
            }

            #display-toggle-btn .checkbox:checked ~ .layer {
                /* background: var(--secondary); */
            }

            #display-toggle-btn .knobs,
            #display-toggle-btn .knobs:before,
            #display-toggle-btn .layer {
                transition: 0.2s ease all;
            }

            .calender-container[week] {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
            }

            .week-info {
                font-weight: bold;
                text-align: right;
            }

            .week {
                margin: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-size: 1.2rem;
            }
        </style>

        <div class="mouse-area" id="prev-month-area">
            <div class="icon-btn" title="이전 달" id="prev-month-btn">
                <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                </svg>
            </div>
        </div>
        <div class="container">
            <div class="header">
                <div id="header">Calender</div>
                <div class="header-btn" id="today-btn">Today</div>
                <div class="header-btn" id="how-to-use-btn">
                    How to Use
                </div>
                <div class="header-btn" id="numbers-btn">
                    주관사 번호
                </div>
                <div class="btn-cover">
                    <div class="toggle-btn" id="display-toggle-btn">
                        <input type="checkbox" class="checkbox">
                        <div class="knobs"></div>
                        <div class="layer"></div>
                    </div>
                </div>
            </div>
            <div class="calender-container">
                <table>
                    <tr class="day-row">
                    </tr>
                </table>
            </div>
        </div>
        <div class="mouse-area" id="next-month-area">
            <div class="icon-btn" title="다음 달" id="next-month-btn">
                <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                </svg>
            </div>
        </div>
    </template>


    <template id="date-desc-template">
        <style>
            :host {
                background: white;
            }

            input {
                border: 1px #ececec solid;
                border-radius: 5px;
                font-size: 0.9rem;
                font-weight: bold;
                font-family: 'kakao';
                width: 100%;
                height: 100%;
                text-align: center;
                background: transparent;
            }

            :host([hol]) > input {
                color: #e91e63;
            }

            :host([today]) > input {
                background: #00968812;
            }

            :host([before]) > input, :host([after]) > input {
                background: rgba(240, 240, 240, 0.7);
            }
        </style>
        <input type="text" />
    </template>

    <template id="calender-data-template">
        <style>
            ::-webkit-scrollbar {
                display: none;
            }

            :host {
                display: flex;
                padding: 0.2rem;
                color: black;
                background: white;
                box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
                border-radius: 0.5rem;
                border: 1px #ececec solid;
                transition: 0.2s ease-in-out;
            }

            textarea {
                resize: none;
                border: none;
                border-radius: 5px;
                font-size: 0.9rem;
                font-weight: bold;
                font-family: 'kakao';
                background: transparent;
                overflow: scroll;
                height: 5rem;
            }

            textarea::placeholder {
                color: #d8d8d8;
                font-size: 0.8rem;
            }

            :host([today]) {
                background: #00968812;
            }
            
            :host([before]), :host([after]) {
                background: rgba(240, 240, 240, 0.7);
            }

            :host([week]) {
                width: 28rem;
                height: 16rem;
            }

            :host([week]) textarea {
                width: 28rem;
                height: 16rem;
                font-size: 1.3rem;
            }

            :host([week]) textarea::placeholder {
                font-size: 1.3rem;
            }
        </style>
        <textarea placeholder="신나는 회의", onfocus="this.placeholder=''", onblur="this.placeholder='신나는 회의'"></textarea>
    </template>
</head>

<body>

<side-bar></side-bar>

<div id="home">
    <div class="container">
        <inner-container header-text="신송" size="12">
            <board-controller></board-controller>
            <minimal-card-board></minimal-card-board>
        </inner-container>
        <inner-container header-text="위젯" size="16">
            <div class="widget-container">
                <div>
                    <text-clock></text-clock>
                    <worker-status></worker-status>
                </div>
                <div>
                    <shortcut-container></shortcut-container>
                    <cyc-converter></cyc-converter>
                </div>
            </div>
        </inner-container>
        <inner-container header-text="빠른 메모" size="6" id="quick-memo">
            <simple-card>
                <div style="display: flex; gap: 1rem;">
                    <input type="text" style="flex: 1" placeholder="메모 검색" id="search-memo-input"/>
                    <div class="icon-btn" style="background-color: #00bcd4;" onclick="quickMemo.addNewMemo()">
                        <img src="./svgs/plus.svg" />
                    </div>
                </div>
            </simple-card>
            <div class="board" id="memo-board">
            </div>
        </inner-container>
    </div>
</div>

<scheduler-app hidden></scheduler-app>
<vault-app hidden></vault-app>
<calender-app hidden></calender-app>
<div id="notepad">
    <a href="./assets/code.zip" download style="float:right;">code</a>
</div>

<script type="text/javascript" src="index.js?ver=202307041806"></script>
<script>
    <?php
        $name = $_SESSION["userName"];
        echo "profileBox.currentProfile = '$name';";
    ?>

    $sideBar.updateProfile();
</script>

</body>
</html>