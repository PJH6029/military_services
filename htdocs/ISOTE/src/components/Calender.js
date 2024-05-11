export default class Calender extends HTMLElement {
    static get observedAttributes() {
        return ["select"];
    } 

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = document.querySelector("#calender-app-template").innerHTML;
    }

    connectedCallback() {

    }

    attributeChangedCallback(attr, oldVal, newVal) {

    }
}