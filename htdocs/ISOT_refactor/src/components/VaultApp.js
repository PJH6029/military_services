import { GET, DEL, PUT, POST, APIURL } from "../utils/requests.js";
import { time } from "../utils/time.js";

export class VaultApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#vault-app-template").innerHTML;

        this.showAll = false;
        this.shadowRoot.querySelector(".show-all-btn").addEventListener("click", () => {
            this.shadowRoot.querySelectorAll("pw-box").forEach((pwBox) => {
                pwBox.$pwInput.type = (this.showAll) ? "password" : "text";
            });
            this.showAll = !this.showAll;
        });

        this.init();
    }

    async init() {
        const res = await GET(`${APIURL}/api/vault.php`);
        ["AFCCS", "NAC", "SERVER", "ETC"].forEach((category) => {
            this.shadowRoot.querySelector("#" + category).innerHTML = `<div class="add-div"><div class="add-btn"><img src="./svgs/plus.svg"></div></div>`;
        });

        this.shadowRoot.querySelectorAll(".add-div").forEach((div) => {
            div.addEventListener("click", () => {
                const category = div.parentElement.id;
                this.addPWInfo("", "", "", category);
            });
        });

        Object.entries(res.resultData).sort(([ak, av], [bk, bv]) => parseInt(av.lastDate) - parseInt(bv.lastDate)).forEach(([UID, data]) => {
            const pwBox = document.createElement("pw-box");
            pwBox.init(UID, data);
        });
    }

    addPWInfo(title, id, pw, category) {
        POST(`${APIURL}/api/vault.php`, {
            title, id, pw, category, lastDate: time.toTimeStr(new Date()).substring(0, 12)
        }).then((res) => {
            if (!res.success) console.error(res.error);
            this.init();
        });
    }

    updatePWInfo(UID, newVal) {
        PUT(`${APIURL}/api/vault.php`, {
            UID, ...newVal, lastDate: time.toTimeStr(new Date()).substring(0, 12)
        }).then((res) => {
            if (!res.success) console.error(res.error);
            this.init();
        });
    }

    deletePWInfo(UID) {
        DEL(`${APIURL}/api/vault.php`, {
            UID
        }).then((res) => {
            if (!res.success) console.error(res.error);
            this.init();
        });
    }
}