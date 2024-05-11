export class PwBox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#pw-box-template").innerHTML;

        this.$titleInput = this.shadowRoot.querySelector(".title");
        this.$idInput = this.shadowRoot.querySelector("#id-input");
        this.$pwInput = this.shadowRoot.querySelector("#pw-input");
        this.$lastDate = this.shadowRoot.querySelector(".last-date");
    }

    init(UID, { title, id, pw, lastDate, category }) {
        const $vaultApp = document.querySelector("vault-app");

        this.UID = UID;
        this.category = category;
        this.$titleInput.value = title;
        this.$idInput.value = id;
        this.$pwInput.value = pw;
        this.$lastDate.innerText = `${lastDate.substring(2, 4)}.${lastDate.substring(4, 6)}.${lastDate.substring(6, 8)}\xa0\xa0 ${lastDate.substring(8, 10)}:${lastDate.substring(10, 12)}`;

        $vaultApp.shadowRoot.querySelector("#" + this.category).prepend(this);

        this.attachEventHandler();
    }

    attachEventHandler() {
        const $vaultApp = document.querySelector("vault-app");

        this.$showBtn = this.shadowRoot.querySelector(".show-btn");
        this.$showBtn.addEventListener("click", () => {
            this.$pwInput.type = (this.$pwInput.type === "password") ? "text" : "password";
        });

        this.$removeBtn = this.shadowRoot.querySelector(".remove-btn");
        this.$removeBtn.addEventListener("click", () => {
            if (!confirm("ㄹㅇ?")) return;
            $vaultApp.deletePWInfo(this.UID);
        });

        this.$titleInput.addEventListener("change", () => {
            $vaultApp.updatePWInfo(this.UID, { title: this.$titleInput.value });
        });
        this.$idInput.addEventListener("change", () => {
            $vaultApp.updatePWInfo(this.UID, { id: this.$idInput.value });
        });
        this.$pwInput.addEventListener("change", () => {
            $vaultApp.updatePWInfo(this.UID, { pw: this.$pwInput.value });
        });
    }
}