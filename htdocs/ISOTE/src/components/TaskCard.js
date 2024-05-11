import time from "../utils/time.js";

export default class TaskCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = document.querySelector("#task-card-template").innerHTML;
        this.card = { id: -1 };
        this.taskApp = document.querySelector("task-app");
        this.DATETIME_DEFAULT_STR = "0000-00-00 00:00:00";

        /**
         * DOM ref objs
         */
        this.ref = {
            title: this.shadowRoot.querySelector(".title"),
            progress: this.shadowRoot.querySelector(".progress"),
            schedule: this.shadowRoot.querySelector(".schedule"),
            createdAt: this.shadowRoot.querySelector(".created-at"),
        };

        this.shadowRoot.querySelector(".container").addEventListener("click", () => {
            this.renderModal();
        });

        this.removeBtn = this.shadowRoot.querySelector(".remove-btn");
        this.removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!confirm("정말 삭제하시겠습니까?")) return;
            this.removeCard();
        });
    }

    setCard(card) {
        this.card = {...card};

        this.setAttribute("card-id", this.card.id);
        this.updateRef();
    }

    async removeCard() {
        if (this.validCurrentCard()) {
            const res = await this.taskApp.removeCard(this.card);
            return res;
        }
        return false;
    }

    validCurrentCard() {
        return this.card.id !== -1;
    }

    updateRef() {
        this.ref.title.innerText = this.card.title;
        this.ref.schedule.innerText = this.getScheduleInfo();
        this.ref.createdAt.innerText = "생성: " + this.getDateTimeInfo(this.card.created_at);
        this.ref.progress.innerText = ["진행 전", "진행 중", "완료"][parseInt(this.card.progress)];
        this.ref.progress.style.background = ["rgb(238, 178, 178)", "rgb(178, 209, 238)", "rgb(180, 238, 178)"][parseInt(this.card.progress)];
    }

    getDateTimeInfo(timeStrDB, schedule=false) {
        const timeStr = time.toTimeStrFromDB(timeStrDB);
        if (!schedule && timeStr.substr(8) === time.toTimeStr(new Date()).substr(8)) {
            const { hours, minutes } = time.breakTimeStr(timeStr);
            return `${hours}:${minutes}`;
        }
        const { month, date } = time.breakTimeStr(timeStr);
        return `${month}.${date}`;
    }

    getScheduleInfo() {
        if (!this.validDateTime(this.card.schedule_end) && !this.validDateTime(this.card.schedule_start)) {
            // 스케줄 날짜 입력 x
            return (this.card.schedule_day) ? this.getScheduleDayStr() : "";
        } else {
            const start = this.validDateTime(this.card.schedule_start) ? this.getDateTimeInfo(this.card.schedule_start, true) : "??";
            const end = this.validDateTime(this.card.schedule_end) ? this.getDateTimeInfo(this.card.schedule_end, true) : "미정";
            let res = start + "-" + end;
            return res + " " + ((this.card.schedule_day) ? this.getScheduleDayStr() : "");
        }
    }

    validDateTime(dateTime) {
        return dateTime && (dateTime != this.DATETIME_DEFAULT_STR);
    }

    getScheduleDayStr() {
        const dayArr = ["일", "월", "화", "수", "목", "금", "토"];
        const converted = [...this.card.schedule_day].map(v => parseInt(v)).map(v => dayArr[v]);
        return "(" + converted.join(", ") + ")";
    }

    renderModal() {
        const modal = document.createElement("card-modal");
        modal.setCard(this.card);
        document.body.prepend(modal);
    }
}