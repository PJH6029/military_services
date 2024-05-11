import { GET, DEL, PUT, POST, APIURL } from "../utils/requests.js";

export class ScheduleSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                input {
                    border: 1px #ececec solid;
                    border-radius: 5px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    font-family: 'kakao';
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    background-color: transparent;
                }

                input[disabled] {
                    border: none;
                    cursor: pointer;
                }

                :host([today]) input {
                    background-color: #00968812;
                }

                :host([desc]) input, :host([calender]) input {
                    font-size: 0.75rem;
                }
    
                :host([vc]) > input, :host([off]) > input {
                    color: #9e9e9e;
                }
    
                :host([day]) > input {
                    color: #009688;
                }
    
                :host([nit]) > input {
                    color: #9c27b0;
                }
    
                :host([am]) > input {
                    color: #ff9800;
                }
    
                :host([pm]) > input {
                    color: #3f51b5;
                }

                :host([hol]) > input {
                    color: #e91e63;
                }
            </style>
            <input type="text" />
        `;
        const $schedulerApp = document.querySelector("scheduler-app");

        this.info = { userName: null, ymd: null };

        this.$input = this.shadowRoot.querySelector("input");
        this.$input.addEventListener("change", () => {
            this.value = this.$input.value;

            if (!this.info.userName || !this.info.ymd) return;

            if (this.info.userName === "calender") {
                if (this.value == "") {
                    delete $schedulerApp.calenderData[this.info.ymd];
                    DEL(`${APIURL}/api/schedule.php`, this.info);
                    return;
                }
                $schedulerApp.calenderData[this.info.ymd] = this.value;
                PUT(`${APIURL}/api/schedule.php`, { value: this.value, ...this.info });
                return;
            }

            let index = $schedulerApp.scheduleData[this.info.userName].schedule.findIndex(({ ymd }) => {
                return (ymd === this.info.ymd);
            });

            if (index === -1) {
                const len = $schedulerApp.scheduleData[this.info.userName].schedule.push({ value: "", description: "", ...this.info });
                index = len - 1;
            }

            if (this.hasAttribute("desc")) {
                $schedulerApp.scheduleData[this.info.userName].schedule[index].description = this.value;
                PUT(`${APIURL}/api/schedule.php`, { description: this.value, ...this.info });
            } else {
                $schedulerApp.scheduleData[this.info.userName].schedule[index].value = this.value;
                PUT(`${APIURL}/api/schedule.php`, { value: this.value, ...this.info });
            }

            $schedulerApp.updateScheduleInfo();
            $schedulerApp.renderScheduleInfo();
        });

        this._value = "";
    }

    set value(newVal) {
        this._value = newVal;
        this.$input.value = newVal;
        const $schedulerApp = document.querySelector("scheduler-app");

        if (this.hasAttribute("desc")) return;
        
        if (this.hasAttribute("calender")) {
            this.removeAttribute("HOL");
            if (/^\//.test(newVal)) {
                this.setAttribute("HOL", "");
            }

            const index = [...$schedulerApp.$gapRow.querySelectorAll("td")].indexOf(this.parentElement);
            if (this.hasAttribute("HOL")) {
                $schedulerApp.$dateRow.querySelectorAll("td")[index].setAttribute("HOL", "");
            } else {
                $schedulerApp.$dateRow.querySelectorAll("td")[index].removeAttribute("HOL");
            }
        } else {
            this.removeAttribute("VC");
            this.removeAttribute("DAY");
            this.removeAttribute("AM");
            this.removeAttribute("PM");
            this.removeAttribute("NIT");
            this.removeAttribute("OFF");
            this.removeAttribute("HOL");
            switch (newVal) {
                case "휴":
                case "격":
                    this.setAttribute("VC", "");
                    break;
                case "주":
                    this.setAttribute("DAY", "");
                    break;
                case "오전":
                    this.setAttribute("AM", "");
                    break;
                case "오후":
                    this.setAttribute("PM", "");
                    break;
                case "야":
                    this.setAttribute("NIT", "");
                    break;
                case "-":
                case "/":
                    this.setAttribute("OFF", "");
                    break;
            }
        }
    }

    get value() {
        return this._value;
    }
}