class ChipBtn extends HTMLElement {
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
                    width: fit-content;
                    font-weight: normal;
                }

                :host(:hover) {
                    transform: translateY(-2px);
                    cursor: pointer;
                }

                :host([thin]) {
                    height: 1rem;
                    font-size: 0.75rem;
                }
            </style>
            <slot></slot>
        `;
    }
}

class ChipBtnLink extends HTMLElement {
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
                    cursor: pointer;
                    transform: translateY(-2px);
                }

                :host([thin]) {
                    height: 1rem;
                    font-size: 0.75rem;
                }
            </style>
            <slot></slot>
        `;

        this.addEventListener("click", () => {
            window.open(this.getAttribute("href"), "_blank");
        });
    }
}

class ChipBtnToggle extends HTMLElement {
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
            <slot></slot>
        `;

        this.addEventListener("click", () => {
            this.toggleAttribute("disabled");
        });
    }
}

export { ChipBtn, ChipBtnLink, ChipBtnToggle };