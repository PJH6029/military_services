import { quickMemo } from "../handlers/handlers.js";

export class QuickMemo extends HTMLElement {
    static get observedAttributes() {
        return ["content"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#quick-memo-template").innerHTML;

        /**
         * @DOM 내용 입력 textarea
         */
        this.$contentTextArea = this.shadowRoot.querySelector("textarea");
        this.$contentTextArea.addEventListener("blur", () => {
            const newVal = this.$contentTextArea.value;
            if (this.getAttribute("content") !== newVal) {
                quickMemo.editData(this.getAttribute("key"), newVal);
            }
            this.setAttribute("content", newVal);
        });

        /**
         * @DOM 카드 삭제 버튼
         */
        this.$removeBtn = this.shadowRoot.querySelector(".remove-btn");
        this.$removeBtn.addEventListener("click", () => {
            quickMemo.removeMemo(this.getAttribute("key"));
        });

        this.updateHeight();
    }

    /**
     * 내용 길이에 따라 textarea 높이를 자동으로 재조정
     * when should executed?
     * 0. Init 시
     * 1. 내용 입력 시
     */
    updateHeight() {
        this.$contentTextArea.style.height = "";
        this.$contentTextArea.style.height = (this.$contentTextArea.scrollHeight + 20) + "px";
    }

    render() {
        this.$contentTextArea.value = this.getAttribute("content");
        this.updateHeight();
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this.render();
    }
}