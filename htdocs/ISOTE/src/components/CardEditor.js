import CardHandler from "../handlers/CardHandler.js";

export default class CardEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#card-editor-template").innerHTML;
        this.card = {};

        this.taskApp = document.querySelector("task-app");
        this.DATETIME_DEFAULT_STR = "0000-00-00 00:00:00";

        /**
         * title: input
         * content: input
         * progress: toggle-chip
         * start: calender
         * end: calender
         * day: checkbox
         */

        

        /**
         * 데이터 입력 처리
         */

        // progress
        this.progressBtns = this.shadowRoot.querySelectorAll("toggle-chip");
        this.progressBtns.forEach((b, idx) => {
            b.addEventListener("click", () => {
                this.progressBtns.forEach(e => {
                    e.setAttribute("disabled", "");
                });
                b.removeAttribute("disabled");
                this.card.progress = idx;  // 0 1 2
            });
        });


        // date
        this.dateRefs = {};
        this.dateCancelBtns = this.shadowRoot.querySelectorAll(".date-cancel-btn");
        const _k2class = (k) => k.split("_").join("-");
        ["schedule_start", "schedule_end"].forEach(k => {
            this.dateRefs[k] = this.shadowRoot.querySelector("." + _k2class(k));
        });
        Object.entries(this.dateRefs).forEach(([key, ref], idx) => {
            ref.addEventListener("change", () => {
                this.card[key] = ref.value + ((key === "schedule_start") ? " 00:00:00" : " 23:59:59");
            });
            this.dateCancelBtns[idx].addEventListener("click", () => {
                ref.value = "";
                this.card[key] = null;
            });
        });

        
        // day
        this.dayBtns = this.shadowRoot.querySelectorAll(".checkbox-btn");
        this.dayBtns.forEach((b, idx) => {
            b.addEventListener("click", () => {
                b.toggleAttribute("selected");
                this.dayData = [];
                this.dayBtns.forEach((el, idx) => {
                    if (el.hasAttribute("selected")) this.dayData.push(idx);
                });
                this.card.schedule_day = this.dayData.sort().join("");
            });
        });

        // input
        this.inputRefs = {};
        ["title", "content"].forEach(k => {
            this.inputRefs[k] = this.shadowRoot.querySelector("." + _k2class(k));
        });
        Object.entries(this.inputRefs).forEach(([key, ref]) => {
            ref.addEventListener("change", () => {
                this.card[key] = ref.value;
            });
        });

        // confirm btn
        this.confirmBtn = this.shadowRoot.querySelector("#confirm-btn");
        this.confirmBtn.addEventListener("click", () => {
            this.updateCard().then(updatedCard => {
                if (!this.isNew) this.taskApp.shadowRoot.querySelector(`task-card[card-id='${updatedCard.id}']`).remove();
                this.taskApp.addCardElem(updatedCard);
                this.taskApp.updateCardCounts();
                this.exit();
            });
        });


        /**
         * 종료 이벤트
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

        this.contentInput = this.shadowRoot.querySelector(".content");
        this.contentInput.addEventListener("input", () => {
            this.updateHeight();
        });
    }

    async updateCard() {
        let updatedCard;
        if (this.isNew) {
            updatedCard = await CardHandler.addCard(this.card);
        } else {
            // const editable = Object.entries(this) // TODO 값이 같으지 확인
            updatedCard = await CardHandler.editCard(this.card);
        }
        return updatedCard;
    }

    init(isNew, card=null, progress=null, taskId=null) {
        this.isNew = isNew;

        if (this.isNew) {
            // 생성
            this.card = {};
            if (progress !== null) {
                this.card["progress"] = progress;
                // progress
                this.progressBtns.forEach((b, idx) => {
                    b.setAttribute("disabled", "");
                });
                this.progressBtns[this.card.progress].removeAttribute("disabled");
            }
            this.card["task_id"] = taskId;
            this.dayData = [];
        } else {
            // 수정
            this.card = {...card};
            this.dayData = [...this.card.schedule_day].map(v => parseInt(v));

            /**
             * 수정인 경우 기존 데이터 ref에 저장
             */
            // progress
            this.progressBtns.forEach((b, idx) => {
                b.setAttribute("disabled", "");
            });
            this.progressBtns[this.card.progress].removeAttribute("disabled");

            // day
            const daySplt = [...this.card.schedule_day].map(v => parseInt(v));
            this.dayBtns.forEach((b, idx) => {
                b.removeAttribute("selected");
                if (daySplt.includes(idx)) b.setAttribute("selected", "");
            });

            // inputs 
            Object.entries(this.inputRefs).forEach(([key, ref]) => {
                if (this.card[key]) {
                    ref.value = this.card[key];
                }
            });

            // dates
            Object.entries(this.dateRefs).forEach(([key, ref]) => {
                if (this.card[key]) {
                    ref.value = this.card[key].slice(0, 10);
                }
            });
        }
    }

    // 입력 내용에 맞춰서 textarea 높이 조절
    updateHeight() {
        this.contentInput.style.height = "";
        this.contentInput.style.height = (this.contentInput.scrollHeight + 10) + "px";
    }

    exit() {
        // 애니메이션 끝나고 remove 실행
        this.setAttribute("hide", "");
        setTimeout(() => {
            this.remove();
        }, 101);
    }

    connectedCallback() {
        // 생성 후 애니메이션 실행
        setTimeout(() => {
            this.removeAttribute("hide");
        }, 10);
    }
}