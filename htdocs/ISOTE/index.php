<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <link href="./style.css" rel="stylesheet">
    <title>ISOT for Everyone</title>
    <template id="side-bar-template">
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
                background-color: var(--secondary);
            }

            .item p {
                font-size: 1rem;
            }

            .item svg {
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

            .icon-btn {
                background-color: var(--primary);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 2rem;
                height: 1.9rem;
                border-radius: 1rem;
                cursor: pointer;
                transition: 0.2s ease-in-out;
            }

            .icon-btn:hover {
                transform: translateY(2px);
            }

            .icon-btn > svg {
                transform: rotate(180deg);
            }

            #task-more-btn[up] > svg {
                transform: rotate(0deg);
            }

            #task-more-btn {
                margin-left: 1.5rem;
                opacity: 0;
            }

            #task:hover #task-more-btn {
                opacity: 1;
            }
                        
            #task {
                flex-direction: column;
                gap: 0.3rem;
                height: auto;
                cursor: auto;
            }

            #task-menu {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                gap: 1rem;
                height: 2rem;
                cursor: pointer;
            }

            #task-list {
                flex-direction: column;
                gap: 7px;
                display: flex;
                height: 0px;
                /* transition: 0.3s ease-in-out; */
            }

        </style>

        <div class="wrapper">
            <div class="header" onclick="location.reload()">
                <svg width="38" height="38" fill="white" viewBox="0 0 16 16">
                    <path d="M5 7h3V4H5v3Z"></path>
                    <path d="M1 2a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 9H1V8H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 6H1V5H.5a.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 .5 2H1Zm11 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7Zm2 0a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7ZM3.5 10a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6Zm0 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6ZM4 4h-.5a.5.5 0 0 0 0 1H4v1h-.5a.5.5 0 0 0 0 1H4a1 1 0 0 0 1 1v.5a.5.5 0 0 0 1 0V8h1v.5a.5.5 0 0 0 1 0V8a1 1 0 0 0 1-1h.5a.5.5 0 0 0 0-1H9V5h.5a.5.5 0 0 0 0-1H9a1 1 0 0 0-1-1v-.5a.5.5 0 0 0-1 0V3H6v-.5a.5.5 0 0 0-1 0V3a1 1 0 0 0-1 1Zm7 7.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5Z"></path>
                </svg>
                <p>ISOT for Everyone</p>
            </div>
            <div class="divider"></div>

            <!-- TODO: svg 제작 -->
            <div class="inner">
                <div class="item" id="task">
                    <div id="task-menu">
                        <svg width="22" height="22" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z" />
                            <path fill-rule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z" />
                        </svg>
                        <p>TASKS</p>
                        <div class="icon-btn" title="더 보기" id="task-more-btn">
                            <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                            </svg>
                        </div>
                    </div>
                    <task-list></task-list>
                </div>
                <!-- <div class="item" id="calender">
                    <svg width="22" height="22" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2h-11zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
                    </svg>
                    <p>CALENDER</p>
                </div> -->
                <div class="item" id="meeting">
                    <!-- <svg width="22" height="22" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M0 1.5V13a1 1 0 0 0 1 1V1.5a.5.5 0 0 1 .5-.5H14a1 1 0 0 0-1-1H1.5A1.5 1.5 0 0 0 0 1.5z" />
                        <path fill-rule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5v11A1.5 1.5 0 0 0 3.5 16h6.086a1.5 1.5 0 0 0 1.06-.44l4.915-4.914A1.5 1.5 0 0 0 16 9.586V3.5A1.5 1.5 0 0 0 14.5 2h-11zm6 8.5a1 1 0 0 1 1-1h4.396a.25.25 0 0 1 .177.427l-5.146 5.146a.25.25 0 0 1-.427-.177V10.5z" />
                    </svg> -->
                    <svg width="22" height="22" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2h-11zm5 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm-5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3zm9-1h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
                    </svg>
                    <p>MEETING</p>
                </div>
            </div>
        </div>
        <div class="wrapper info" id="isot-info">
            <span style="font-weight: bold; font-size: 1.1rem;">v1.2</span> last update 22.12.30<br>made by 823 방민수, 837 박정훈
        </div>
    </template>

    <template id="task-list-template">
        <style>
            .item-container {
                flex-direction: column;
                gap: 7px;
                display: flex;
                height: 0px;
                /* transition: 0.3s ease-in-out; */
            }

            #plus-task-btn {
                background-color: transparent;
                padding: 0 0 0 0;
                width: 10rem;
                cursor: pointer;
                visibility: show;
            }

            #plus-task-btn[hide] {
                cursor: pointer;
                visibility: hidden;
            }

            #plus-task-btn .add-div {
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px lightgray dashed;
                border-radius: 0.5rem;
                height: 1.6rem;
            }

            #plus-task-btn .add-btn {
                width: 1rem;
                height: 1rem;
                border-radius: 2.5rem;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        </style>
        <div class="item-container"></div>
    </template>

    <template id="task-item-template">
        <style>
            :host {
                background-color: var(--primary);
                border-radius: 0.5rem;
                cursor: pointer;
                /* transition: 0.1s ease-in-out; */ /* TODO transiton */
                /* transition-delay: 0.1s; */
                padding: 0.3rem 1rem 0.3rem 1rem;
                width: 8rem;
                /* opacity: 0; */
                visibility: show;
            }

            :host([hide]) {
                cursor: pointer;
                /* opacity: 1; */
                visibility: hidden;
            }

            input {
                width: 100%;
                font-size: 1rem;
                font-family: 'kakao';
                border: 0;
                background: transparent;
                color: white;
                cursor: pointer;
                outline: none;
            }
        </style>
        <span class="task-name"></span>
    </template>

    <template id="task-app-template">
        <style>
            :host {
                width: 100%;
                height: 100%;
            }

            :host([hidden]) {
                display: none;
            }

            :host([task-id=dashboard]) .card-container {
                display: none;
            }

            :host([task-id=dashboard]) #remove-btn {
                display: none;
            }

            :host(:not([task-id=dashboard])) .dashboard {
                display: none;
            }

            .task-container {
                /* width: 100%;
                height: 100%;
                position: relative; */
                padding-left: 0.5rem;
            }

            .card-container {
                display: flex;
                flex-direction: column;
                padding: 0.5rem;
                gap: 2rem;
                margin-bottom: 3rem;
                transition: 0.2s ease-in-out;
            }

            .category {
                /* color: var(--primary); */
                font-weight: bold;
                font-size: 1.75rem;
                padding: 0.5rem;
                border-radius: 1rem;
            }

            #category-before-start {
                background: rgb(238, 178, 178);
            }

            #category-in-progress {
                background: rgb(178, 209, 238);
            }

            #category-complete {
                background: rgb(180, 238, 178);
                cursor: pointer;
            }

            #complete[hide] {
                display: none;
            }
            
            .card-box {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }

            #task-name-input {
                font-size: 2rem;
                font-weight: bold;
                font-family: 'kakao';
                color: darkgray;
                border: 0;
                outline: none;
                background: transparent;
                width: 100%;
            }

            .header {
                padding: 0.5rem 0.5rem 2rem 0.5rem;
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

            .remove-btn {
                background: #e91e63;
                position: fixed;
                top: 1.5rem;
                right: 2rem;
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

            .add-div {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 25.7rem;
                border: 2px lightgray dashed;
                border-radius: 0.5rem;
                min-height: 7rem;
                cursor: pointer;
            }


            .text {
                font-size: 7rem;
                color: gray;
                text-align: center;
            }
            
            .dashboard {
                /* display: flex;
                justify-content: center;
                align-items: center; */
            
                width: 100%;
                height: 100%;
            }

            .dashboard-card-container {
                display: flex;
                flex-direction: column;
                padding: 0.5rem;
                gap: 2rem;
                margin-bottom: 3rem;
                transition: 0.2s ease-in-out;
                /* border-bottom: 3px var(--primary) solid; */
            }

            .task-name {
                /* color: var(--primary); */
                font-weight: bold;
                font-size: 1.75rem;
                padding: 0.5rem;
                border-radius: 1rem;
                /* border: 2px black solid; */
            }
            
            .complete-wrapper {
                display: flex;
                /* justify-content: flex-start; */
                /* align-items: center; */
                /* gap: 1rem; */
                /* height: 2rem; */
                cursor: pointer;
            }

            .complete-flex-wrapper {
                display: flex;
                align-items: center;
                gap: 0.3rem;
            }

            #card-more-btn {
                background-color: transparent;
                
            }

            #card-more-btn > svg {
                transition: 0.2s ease-in-out;
                transform: rotate(180deg);
            }

            #card-more-btn[up] > svg {
                transform: rotate(0deg);
            }
        </style>
        <div class="container">
            <div class="remove-btn icon-btn" id="remove-btn">
                <img src="./svgs/remove.svg">
            </div>
            <div class="header" id="task-name"><input type="text" id="task-name-input"></div>
            <div class="task-container">
                <div class="dashboard">
                    <!-- dashboard -->
                </div>
                
                <div class="card-container">
                    <div><span class="category" id="category-before-start">시작 전 (<span id="before-start-count">0</span>)</span></div>
                    <div class="card-box" id="before-start"></div>
                </div>
                <div class="card-container">
                    <div><span class="category" id="category-in-progress">진행 중 (<span id="in-progress-count">0</span>)</span></div>
                    <div class="card-box" id="in-progress"></div>
                </div>
                <div class="card-container">
                    <div class="complete-wrapper">
                        <div class="category complete-flex-wrapper" id="category-complete">
                            <span>완료(<span id="complete-count">0</span>)</span>
                            <div class="icon-btn" title="더 보기" id="card-more-btn">
                                <svg width="16" height="16" fill="black" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                                </svg>
                            </div> 
                        </div>
                    </div>
                    <div class="card-box" id="complete"></div>
                </div>
            </div>
        </div>
    </template>

    <template id="task-card-template">
        <style>
            .container {
                width: 25rem;
                background-color: white;
                border-radius: 0.5rem;
                box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
                padding: 0.5rem;
                cursor: pointer;
            }

            .divider {
                width: 100%;
                height: 3px;
                background-color: var(--primary);
                border-radius: 2px;
            }

            .body {
                padding: 0.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
            }


            .title {
                background: transparent;
                border: none;
                font-size: 1.3rem;
                margin-right: 0.25rem;
                font-weight: bold; 
                width: 100%;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }

            .remove-btn {
                background: var(--primary);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 3rem;
                height: 2rem;
                border-radius: 1rem;
                cursor: pointer;
                transition: 0.2s ease-in-out;
            }

            .progress {
                background: var(--primary);
                display: flex;
                justify-content: center;
                align-items: center;
                padding-left: 1rem;
                padding-right: 1rem;
                height: 2rem;
                min-width: 3rem;
                border-radius: 1rem;
                transition: 0.2s ease-in-out;
            }

            .footer {
                display: flex;
                padding: 0.5rem;
                justify-content: space-between;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
            }

        </style>
        <div class="container">
            <div class="body">
                <div class="title">제목</div>
                <div class="progress">진행 중</div>
                <div class="remove-btn icon-btn">
                    <img src="./svgs/remove.svg">
                </div>
            </div>
            <div class="divider"></div>
            <div class="footer">
                <div class="schedule">12.25 - 01.01</div>
                <div class="created-at">12.25</div>
            </div>
        </div>
    </template>

    <template id="calender-app-template">
        <style>
            :host {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
            }

            :host([hidden]) {
                display: none;
            }

            .text {
                font-size: 10rem;
                color: gray;
            }
        </style>
        <span class="text">공사중: CALENDER</span>
    </template>

    <template id="meeting-app-template">
        <style>
            :host {
                display: flex;
                justify-content: center;
                width: 100%;
                height: 100%;
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
                color: darkgray;
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
                width: 85%;
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

    <template id="meeting-data-template">
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
                width: 25rem;
                height: 20rem;
            }

            :host([week]) textarea {
                width: 25rem;
                height: 20rem;
                font-size: 1.5rem;
            }

            :host([week]) textarea::placeholder {
                font-size: 1.5rem;
            }
        </style>
        <textarea placeholder="신나는 회의", onfocus="this.placeholder=''", onblur="this.placeholder='신나는 회의'"></textarea>
    </template>

    <template id="card-modal-template">
        <style>
            ::-webkit-scrollbar {
                display: none;
            }

            .back {
                transition: 0.1s ease-in-out;
                position: absolute;
                width: 100vw;
                height: 100%;
                background-color: rgb(0 0 0 / 60%);
                z-index: 100;
                display: flex;
                align-items: center;
                opacity: 1;
            }

            :host([hide]) .back {
                opacity: 0;
            }

            .click {
                flex: 1;
                height: 100%;
            }

            .window {
                height: calc(100% - 6rem);
                /* height: 90vh; */
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


            .header {
                display: flex;
                flex-direction: column;
                gap: 0.4rem;
            }

            .header * {
                line-height: 100%;
            }

            .content {
                padding: 2rem 0;
                font-size: 1.2rem;
                border-top: 3px var(--primary) solid;
                /* border-bottom: 3px var(--primary) solid; */
            }

            .title-wrapper {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .title {
                font-weight: bold;
                font-size: 2rem;
                width: 35rem;
            }

            .date-wrapper {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .pad-bot {
                padding-bottom: 1rem;
            }

            .pad-top {
                padding-top: 0.5rem;
            }

            .edit-btn > svg, .pin-btn svg {
                fill: white;
            }

            chip-btn {
                gap: 0.5rem;
                justify-content: center;
                align-items: center;
                display: flex;
                font-size: 0.9rem;
                height: 1.35rem;
            }

            .wrap {
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: var(--primary);
                font-weight: bold;
            }

            .wrap-label {
                width: 4rem;
            }

            .wrap-content {
                width: 40rem;
            }

            .progress {
                background: var(--primary);
                display: flex;
                justify-content: center;
                align-items: center;
                padding-left: 1rem;
                padding-right: 1rem;
                height: 2rem;
                min-width: 3rem;
                border-radius: 1rem;
                transition: 0.2s ease-in-out;
            }
        </style>
        <div class="back">
            <div class="click"></div>
            <div class="window">
                <div class="header pad-bot">
                    <div class="title-wrapper pad-bot">
                        <div class="title"></div>
                        <div class="progress"></div>
                        <chip-btn class="edit-btn" title="수정하기">
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" /><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                            </svg>
                        </chip-btn>
                    </div>
                    <div class="date-wrapper">
                        <div class="wrap">
                            <div class="wrap-label">시작</div>
                            <div class="wrap-content schedule-start"></div>
                        </div>
                        <div class="wrap">
                            <div class="wrap-label">종료</div>
                            <div class="wrap-content schedule-end"></div>
                        </div>
                        <div class="wrap">
                            <div class="wrap-label">요일</div>
                            <div class="wrap-content schedule-day"></div>
                        </div>
                        <div class="wrap">
                            <div class="wrap-label">작성일</div>
                            <div class="wrap-content created-at"></div>
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div class="content"></div>
                </div>
            </div>
            <div class="click"></div>
        </div>
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

    <template id="toggle-chip-template">
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

    <template id="card-editor-template">
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
                opacity: 1;
                transition: all 0.1s ease-in-out;
                position: absolute;
                width: 100vw;
                height: 100vh;
                background-color: rgb(0 0 0 / 60%);
                z-index: 100;
                display: flex;
                align-items: center;
            }

            :host([hide]) .back {
                opacity: 0;
            }

            .click {
                /* width: 563px; */
                height: 100%;
                flex: 1;
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

            .container {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .date-wrapper {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .header {
                display: flex;
                justify-content: space-between;
                width: 100%;
            }

            .header * {
                line-height: 100%;
            }



            .title, .content {
                font-size: 1.1rem;
            }

            .submit {
                gap: 0.4rem;
            }

            .wrap {
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: var(--primary);
                font-weight: bold;
            }

            .progress {
                font-size: 1.4rem;
                color: var(--primary);
                display: flex;
                gap: 0.4rem;
                font-weight: normal;
            }

            .wrap-label {
                width: 4rem;
                font-size: 1.1rem;
            }

            .wrap-content {
                width: 40rem;
                min-height: 2rem;
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .content {
                border: 3px var(--primary) solid;
                padding: 0.75rem;
                outline: none;
                border-radius: 0.5rem;
                font-family: 'kakao';
                resize: none;
                min-height: 15rem;
                line-height: normal;
            }

            .desc {
                font-size: 2rem;
                padding-bottom: 0.5rem;
                font-weight: bold;
            }

            .schedule-day {
                display: flex;
            }

            .checkbox-btn {
                border: 2px var(--primary) solid;
                background: white;
                border-radius: 1rem;
                color: black;
                user-select: none;
                transition: 0.2s ease-in-out;
                width: 2rem;
                height: 2rem;
                font-weight: normal;
            }

            .checkbox-btn:hover {
                transform: translateY(-2px);
                cursor: pointer;
            }

            .checkbox-btn[selected] {
                border: 2px transparent solid;
                background: var(--primary);
                color: white;
            }

            .date-content::-webkit-calendar-picker-indicator {
                cursor: pointer;
            }

            #confirm-btn {
                background-color: #00bcd4;
            }

            #cancel-btn {
                background-color: rgb(233, 30, 99);
            }

            .red {
                color: red;
                padding-left: 0.2rem;
            }

            #before-start {
                border: 2px rgb(238, 178, 178) solid;
            }

            #in-progress {
                border: 2px rgb(178, 209, 238) solid;
            }

            #complete {
                border: 2px rgb(180, 238, 178) solid;
            }

            #before-start:not([disabled]) {
                border: 2px transparent solid;
                background: rgb(238, 178, 178);
            }

            #in-progress:not([disabled]) {
                border: 2px transparent solid;
                background: rgb(178, 209, 238);
            }

            #complete:not([disabled]) {
                border: 2px transparent solid;
                background: rgb(180, 238, 178);
            }

            toggle-chip, chip-btn {
                height: 1.4rem;
            }

            toggle-chip {
                color: black;
            }

            .date-cancel-btn {
                width: 5rem;
            }

            .center-btn {
                display: flex;
                justify-content: center;
                align-items: center;
            }
        </style>
        <div class="back">
            <div class="click"></div>
            <div class="window">
                <div class="desc">새 카드 작성하기</div>
                <div class="header pad-bot">
                    <div class="wrap progress">
                        <toggle-chip text="진행 전" id="before-start" class="center-btn"></toggle-chip>
                        <toggle-chip text="진행 중" id="in-progress" class="center-btn"></toggle-chip>
                        <toggle-chip text="완료" id="complete" class="center-btn"></toggle-chip>
                    </div>
                    <div class="wrap submit">
                        <chip-btn id="confirm-btn" class="center-btn">확인</chip-btn>
                        <chip-btn id="cancel-btn" class="center-btn">취소</chip-btn>
                    </div>
                </div>
                <div class="container">
                    <div class="title-wrapper pad-bot">
                        <div class="wrap">
                            <div class="wrap-label">제목<span class="red"> *</span></div>
                            <input type="text" class="wrap-content title">
                        </div>
                    </div>
                    <div class="date-wrapper">
                        <div class="wrap">
                            <div class="wrap-label">시작</div>
                            <div class="wrap-content">
                                <input type="date" class="wrap-content schedule-start date-content">
                                <chip-btn class="date-cancel-btn">지우기</chip-btn> 
                            </div>
                        </div>
                        <div class="wrap">
                            <div class="wrap-label">종료</div>
                            <div class="wrap-content">
                                <input type="date" class="wrap-content schedule-end date-content">
                                <chip-btn class="date-cancel-btn">지우기</chip-btn> 
                            </div>
                        </div>
                        <div class="wrap">
                            <div class="wrap-label">요일</div>
                            <div class="wrap-content schedule-day">
                                <div class="checkbox-btn center-btn">일</div>
                                <div class="checkbox-btn center-btn">월</div>
                                <div class="checkbox-btn center-btn">화</div>
                                <div class="checkbox-btn center-btn">수</div>
                                <div class="checkbox-btn center-btn">목</div>
                                <div class="checkbox-btn center-btn">금</div>
                                <div class="checkbox-btn center-btn">토</div>
                            </div>
                        </div>
                    </div>
                    <div class="content-wrapper">
                        <div class="wrap">
                            <div class="wrap-label">내용<span class="red"> *</span></div>
                            <textarea class="content wrap-content" placeholder="내용*"></textarea>
                        </div>
                    </div> 
                </div>
            </div>
            <div class="click"></div>
        </div>
    </template>
</head>
<body>
<side-bar></side-bar>
<div class="container">
    <task-app task-id=dashboard></task-app>
    <calender-app hidden></calender-app>
    <meeting-app hidden></meeting-app>
</div>
<script src="./index.js?ver=202212512116" type="module"></script>
</body>
</html>