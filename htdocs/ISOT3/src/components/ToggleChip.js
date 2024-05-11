export default class ToggleChip extends HTMLElement {
    static get observedAttributes() {
        return ["text", "disabled"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    font-size: 1rem;
                    border: 2px transparent solid;
                    border-radius: 1rem;
                    padding: 0.2rem 1rem;

                    background-color: var(--primary);
                    color: white;
                    text-align: center;
                    user-select: none;
                    transition: 0.2s ease-in-out;
                }

                :host(:hover) {
                    transform: translateY(-2px);
                    cursor: pointer;
                }

                :host([disabled]) {
                    background-color: transparent;
                    border: 2px var(--primary) solid;
                    color: black;
                }
            </style>
            <div></div>
        `;

        this.$textDiv = this.shadowRoot.querySelector("div");

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
