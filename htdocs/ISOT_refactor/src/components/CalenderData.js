import { GET, DEL, PUT, POST, APIURL } from "../utils/requests.js";

export class CalenderData extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#calender-data-template").innerHTML;

        const $calenderApp = document.querySelector("calender-app");

        this.info = { ymd: null };

        this.$contentTextArea = this.shadowRoot.querySelector("textarea");
        this.$contentTextArea.addEventListener("change", () => {
            this.value = this.$contentTextArea.value;
            if (!this.info.ymd) return;

            if (this.value === "") {

               delete $calenderApp.calenderTxtData[this.info.ymd];
               DEL(`${APIURL}/api/calender.php`, this.info);
               return;
            }

            $calenderApp.calenderTxtData[this.info.ymd] = this.value;
            PUT(`${APIURL}/api/calender.php`, { content: this.value, ...this.info });
        });

        this._value = "";
    }

    set value(newVal) {
        this._value = newVal;
        this.$contentTextArea.value = newVal;
    }

    get value() {
        return this._value;
    }
}