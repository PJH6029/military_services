export default class ChipBtn extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = document.querySelector("#chip-btn-template").innerHTML;    
    }
}