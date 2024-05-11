import { time } from "../utils/time.js";

export class TextClock extends HTMLElement {
    static get observedAttributes() {
        return ["date", "time"];
    }

    constructor() {
        super();
        this.krDay = ['일', '월', '화', '수', '목', '금', '토'];

        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#clock-template").innerHTML;

        /**
         * @DOM 날짜 컨테이너
         */
        this.$dateDiv = this.shadowRoot.querySelector("#date");
        /**
         * @DOM 시간 컨테이너
         */
        this.$timeDiv = this.shadowRoot.querySelector("#time");
    }

    connectedCallback() {
        const tick = () => {
            const d = new Date();
            const v = {
                h : d.getHours(),
                m : d.getMinutes(),
                s : d.getSeconds(),
                mon : d.getMonth() + 1,
                date : d.getDate(),
                day : this.krDay[d.getDay()]
            };

            Object.keys(v).forEach((k) => {
                if (k !== "day") {
                    v[k] = v[k].toString().padStart(2, "0");
                }
            });

            this.setAttribute("time", `${v.h}:${v.m}:${v.s}`);
            this.setAttribute("date", `${v.mon}월 ${v.date}일 ${v.day}요일`);
        }

        tick();
        setInterval(tick, 1000);
        this.render();
    }

    render_date() {
        if (this.$dateDiv) this.$dateDiv.innerText = this.getAttribute("date");
    }

    render_time() {
        if (this.$timeDiv) this.$timeDiv.innerText = this.getAttribute("time");
    }

    render() {
        this.render_date();
        this.render_time();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        switch (attr) {
            case "date":
                this.render_date();
                break;
            case "time":
                this.render_time();
                break;
        }
    }
}