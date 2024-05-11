export class ToggleChip extends HTMLElement {
    static get observedAttributes() {
        return ["text", "disabled"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#toggle-chip-template").innerHTML;

        /**
         * @DOM 텍스트 컨테이너
         */
        this.$textDiv = this.shadowRoot.querySelector("div");

        // 눌렀을 때 이벤트 바인딩
        this.addEventListener("click", () => {
            this.toggleAttribute("disabled");
        });
    }

    render() {
        this.$textDiv.innerText = this.getAttribute("text");
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this.render();
    }
}