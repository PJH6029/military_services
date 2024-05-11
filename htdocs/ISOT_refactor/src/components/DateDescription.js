import { GET, DEL, PUT, POST, APIURL } from "../utils/requests.js";

export class DateDescription extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#date-desc-template").innerHTML;

        // TODO delete userName
        this.info = { userName: null, ymd: null };

        const $calenderApp = document.querySelector("calender-app");

        this.$input = this.shadowRoot.querySelector("input");
        this.$input.addEventListener("change", () => {
            this.value = this.$input.value;

            if (!this.info.userName || !this.info.ymd) return;

            if (this.info.userName === "calender") {
                if (this.value === "") {
                    delete $calenderApp.calenderData[this.info.ymd]; // TODO 굳이 이중화할 필요 없긴 한데..
                    DEL(`${APIURL}/api/schedule.php`, this.info);
                    return;
                }

                $calenderApp.calenderData[this.info.ymd] = this.value;
                PUT(`${APIURL}/api/schedule.php`, { value: this.value, ...this.info });
            }
        });

        this._value = "";
    }

    set value(newVal) {
        this._value = newVal;
        this.$input.value = newVal;

        this.removeAttribute("HOL");
        if (/^\//.test(newVal)) {
            this.setAttribute("HOL", "");
        }

        const tmp = this.parentElement.id.split("-").slice(2);
        const $calenderApp = document.querySelector("calender-app");
        if (this.hasAttribute("HOL")) {
            $calenderApp.$table.querySelector(`#calender-week${parseInt(tmp[0])}`).querySelectorAll("td")[parseInt(tmp[1])].setAttribute("HOL", "");
        } else {
            $calenderApp.$table.querySelector(`#calender-week${parseInt(tmp[0])}`).querySelectorAll("td")[parseInt(tmp[1])].removeAttribute("HOL");
        }
    }

    get value() {
        return this._value;
    }
}