class WidgetClock extends HTMLElement {
    static get observedAttributes() {
        return ["date", "time"];
    }

    constructor() {
        super();
        this.dayKR = ["일", "월", "화", "수", "목", "금", "토"];

        this.attachShadow({ mode: "open" });
        // TODO width 지정을 하면 반응형이 안되고, wrap으로 두면 시간에 따라 너비가 계속 바뀌고...
        this.shadowRoot.innerHTML = `
            <style>
                .container {
                    display: flex; 
                    justify-content: center; 
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                    width: 18rem;
                }

                div {
                    font-size: 1.5rem;
                    font-weight: bold; 
                    color: var(--primary);
                }

            </style>
            <simple-card>
                <div class="container">
                    <div class="time-text" id="date"></div>
                    <div class="time-text" id="time"></div>
                </div>
            </simple-card>
        `;

        this.dateElem = this.shadowRoot.getElementById("date");
        this.timeElem = this.shadowRoot.getElementById("time");
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
                day : this.dayKR[d.getDay()]
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

    render() {
        this.renderDate();
        this.renderTime();
    }

    renderDate() {
        this.dateElem.innerText = this.getAttribute("date");
    }

    renderTime() {
        this.timeElem.innerText = this.getAttribute("time");
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        switch (attr) {
            case "date":
                this.renderDate();
                break;
            case "time":
                this.renderTime();
                break;
        }
    }
}

export { WidgetClock };