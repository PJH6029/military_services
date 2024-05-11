import UserHandler from "../handlers/UserHandler.js";

export default class UserBox extends HTMLElement {
    static get observedAttributes() {
        return ["user-id"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    width: 9rem;
                    font-size: 1.5rem;
                    text-align: center;
                    border: 2px solid black;
                    border-radius: 1rem;
                    cursor: pointer;
                    height: fit-content;
                }
                :host([selected]) {
                    background: pink;
                }
                :host(:hover) {
                    font-weight: bold;
                }
                :host([me]) {
                    background: lightgray;
                }
                :host([me][selected]) {
                    background: black;
                    color: white;
                }
            </style>
            <span class="user-info"></span>
        `;

        this.user = null;

        this.addEventListener("click", () => {
            document.querySelector("chat-container").setAttribute("partner-id", this.user.id);
            this.makeSelected();
            document.querySelector("chat-controller").chatInput.focus();
        });
    }

    setUser(user) {
        this.user = user;
        this.setAttribute("user-id", this.user.id);
    }

    makeSelected() {
        this.setAttribute("selected", "");
    }

    makeUnselected() {
        this.removeAttribute("selected");
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        if (this.user.id === UserHandler.currentUser.id) {
            this.shadowRoot.querySelector(".user-info").innerText = `내 정보`;
        } else {
            this.shadowRoot.querySelector(".user-info").innerText = `${this.user.name}`;
        }
    }
}