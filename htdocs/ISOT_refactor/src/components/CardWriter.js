import { cardData, profileBox } from "../handlers/handlers.js";
import { time } from "../utils/time.js";

export class CardWriter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#card-writer-template").innerHTML;

        // 입력 받을 값들의 키(중요도 제외)
        const inputKeys = ["title", "writer", "receiver", "contentText"];

        const timeStr = time.toTimeStr(new Date());
        const $boardController = document.querySelector("board-controller");
        const editingCard = $boardController.editingCard;

        if (editingCard != null) {
            // A. 수정
            // 기존 고유키 가져오기
            this.key = editingCard.id;

            // 입력받은 데이터를 오브젝트화함
            this.inputData = {
                priority: editingCard.priority,
                creationTime: timeStr,
                title: editingCard.title,
                writer: editingCard.writer,
                receiver: editingCard.receiver,
                contentText: cardData.data[editingCard.id].contentText
            };
        } else {
            // B. 새로 만들기
            // 키 생성
            this.key = "C" + timeStr;

            // 입력받은 데이터를 오브젝트화함
            this.inputData = {
                priority: 3,
                creationTime: timeStr,
                writer: profileBox.currentProfile
            };
        }

        /*
            -------------
            데이터 입력 처리
            -------------
        */

        // 1. 중요도 선택 버튼 click 이벤트 바인딩
        this.priorityBtns = this.shadowRoot.querySelectorAll("toggle-chip");
        this.priorityBtns.forEach((b, index) => {
            b.addEventListener("click", () => {
                this.priorityBtns.forEach((e) => {
                    e.setAttribute("disabled", "");
                });
                b.removeAttribute("disabled");
                this.inputData.priority = 3 - index;
            });
        });

        // 2. 나머지 입력 이벤트 바인딩
        // 동적으로 레퍼런스 오브젝트 생성
        this.inputRefs = {};
        inputKeys.forEach((k) => {
            this.inputRefs[k] = this.shadowRoot.querySelector("." + k);
        });
        // writer select 초기 설정
        profileBox.nameList.forEach((name) => {
            let opt = document.createElement("option");
            opt.innerText = name;
            this.inputRefs["writer"].appendChild(opt);
        });
        this.inputRefs["writer"].value = this.inputData["writer"];
        // 이벤트 바인딩
        Object.entries(this.inputRefs).forEach(([key, ref]) => {
            ref.addEventListener("change", () => {
                this.inputData[key] = ref.value;
            });
        });

        // 3. 확인 버튼 이벤트 (카드 생성)
        this.confirmBtn = this.shadowRoot.querySelector("#confirm-btn");
        this.confirmBtn.addEventListener("click", () => {
            if (this.inputData.receiver) {
                let filteredList = this.inputData.receiver.split("@").filter((e) => { return e != ''; }).map((e) => {
                    let e1 = e.replace(' ', '');
                    let e2 = e1.replace(',', '');
                    return e2;
                });
    
                if (filteredList.length === 1 && filteredList[0] === "전체") {
                    filteredList = profileBox.nameList;
                }
                filteredList.forEach((p) => {
                    if (!profileBox.getMailBox(p).includes(this.key)) profileBox.setMailBox(p, [...profileBox.getMailBox(p), this.key]);
                });
            }
            
            
            // -> 수정일 경우
            if (editingCard != null) {
                cardData.editData(this.key, this.inputData);
                cardData.removeMinimalCard(this.key);
                $boardController.editingCard = null;
            } else {
                this.inputData.commentCount = 0;
                cardData.addData(this.key, this.inputData);
            }
            cardData.spawnMinimalCard(this.key);
            this.exit();
        });

        // -> 수정일 경우
        if (editingCard != null) {
            this.priorityBtns.forEach((b) => {
                b.setAttribute("disabled", "");
            });
            this.priorityBtns[3 - this.inputData.priority].removeAttribute("disabled");

            Object.entries(this.inputRefs).forEach(([key, ref]) => {
                ref.value = this.inputData[key];
            });
        }

        /*
            ---------
            종료 이벤트
            ---------
        */

        // 취소 버튼 눌렀을 때...
        this.cancelBtn = this.shadowRoot.querySelector("#cancel-btn");
        this.cancelBtn.addEventListener("click", () => {
            this.exit();
        });

        // 모달 바깥부분 눌렀을 때...
        this.clickAreas = this.shadowRoot.querySelectorAll(".click");
        this.clickAreas.forEach((c) => {
            c.addEventListener("click", (e) => {
                this.exit();
            });
        });

        // Esc 눌렀을 때...
        this.escBindingFunc = (e) => {
            if (e.key === "Escape") {
                this.exit();
                window.removeEventListener("keydown", this.escBindingFunc);
            }
        };
        window.addEventListener("keydown", this.escBindingFunc);

        this.contentInput = this.shadowRoot.querySelector(".contentText");
        this.contentInput.addEventListener("input", () => {
           this.updateHeight();
        });
    }

    // 입력 내용에 맞춰서 textarea 높이 조절
    updateHeight() {
        this.contentInput.style.height = "";
        this.contentInput.style.height = (this.contentInput.scrollHeight + 10) + "px";
    }

    // 종료 이벤트
    exit() {
        // 애니메이션 끝나고 remove 실행
        this.removeAttribute("appear");
        setTimeout(() => {
            this.remove();
        }, 101);
    }

    connectedCallback() {
        // 생성 후 애니메이션 실행
        setTimeout(() => {
            this.setAttribute("appear", "");
        }, 10);
        this.updateHeight();
    }
}