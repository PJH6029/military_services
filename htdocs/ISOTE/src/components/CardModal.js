import time from "../utils/time.js";
export default class CardModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#card-modal-template").innerHTML;
        this.card = { id: -1 };
        // this.setAttribute("hide", "");
        this.DATETIME_DEFAULT_STR = "0000-00-00 00:00:00";

        const _dateTimePrintFunc = (timeStrDB, full=false) => {
            if (timeStrDB === this.DATETIME_DEFAULT_STR) return "";
            const timeStr = time.toTimeStrFromDB(timeStrDB);
            const { year, month, date, hours, minutes } = time.breakTimeStr(timeStr);
            return (full) ? `${year}년 ${month}월 ${date}일 ${hours}:${minutes}` : `${year}년 ${month}월 ${date}일`;
        };

        
        const _getScheduleDayStr = (scheduleDayStr) => {
            const dayArr = ["일", "월", "화", "수", "목", "금", "토"];
            const converted = [...scheduleDayStr].map(v => parseInt(v)).map(v => dayArr[v]);
            return converted.join(", ");
        }

        /**
         * @member 데이터 키 오브젝트
         * @key 데이터 키
         * @value 해당 데이터 키의 print 함수
         */
        this.dataKeys = {
            progress: progressNum => ["진행 전", "진행 중", "완료"][progressNum],
            schedule_day: scheduleDayStr => scheduleDayStr ? _getScheduleDayStr(scheduleDayStr) : "",
        };
        // ["task_id", 
        ["title", "content"].forEach(key => {
            this.dataKeys[key] = v => v ? v : "";
        });
        ["schedule_start", "schedule_end"].forEach(key => {
            this.dataKeys[key] = v => v ? _dateTimePrintFunc(v) : "";
        });
        this.dataKeys["created_at"] = v => _dateTimePrintFunc(v, true);

        /**
         * DOM ref objs
         */
        this.ref = {};
        const _k2class = (k) => k.split("_").join("-");
        Object.keys(this.dataKeys).forEach(k => {
            this.ref[k] = this.shadowRoot.querySelector("." + _k2class(k));
        });

        this.editBtn = this.shadowRoot.querySelector(".edit-btn");
        this.editBtn.addEventListener("click", () => {
            const editor = document.createElement("card-editor");
            editor.init(false, this.card);
            document.body.prepend(editor);
            this.exit();
        });

        /**
         *  종료 이벤트 
         */

        // 어두운 부분
        this.clickAreas = this.shadowRoot.querySelectorAll(".click");
        this.clickAreas.forEach((c) => {
            c.addEventListener("click", (e) => {
                this.exit();
            });
        });

        // ESC
        // Esc 누르면...
        const _escBindingFunc = (e) => {
            if (e.key === "Escape") {
                this.exit();
                window.removeEventListener("keydown", _escBindingFunc);
            }
        };
        window.addEventListener("keydown", _escBindingFunc);
    }

    setCard(card) {
        this.card = {...card};
        Object.entries(this.ref).forEach(([key, ref]) => {
            ref.innerText = this.dataKeys[key](this.card[key]);
        });
        this.ref["progress"].style.background = ["rgb(238, 178, 178)", "rgb(178, 209, 238)", "rgb(180, 238, 178)"][parseInt(this.card.progress)];
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