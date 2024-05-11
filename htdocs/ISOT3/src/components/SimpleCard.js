export default class SimpleCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    gap: 0.7rem;
                    position: relative;
                    color: black;
                    padding: 1rem;
                    background-color: white;
                    box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
                    border-radius: 0.5rem;
                    transition: 0.2s ease-in-out;
                    min-height: auto;
                    max-height: auto;
                }
            </style>
            <slot></slot>
        `;
    }
}