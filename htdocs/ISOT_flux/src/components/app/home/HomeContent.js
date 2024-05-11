import { Component } from "../../../core/Component.js";

export class HomeContent extends Component {

    init() {
        this.$header = document.createElement("div");
        this.$header.classList.add("content-header");
        this.$header.style.order = "-1";
        this.appendChild(this.$header);
    }

    static get observedAttributes() {
        return ["header-text", "size"];        
    }

    renderHeaderText() {
        this.$header.innerText = this.getAttribute("header-text");
    }

    renderSize() {
        this.style.flex = this.getAttribute("size");
    }

    render() {
        this.renderHeaderText();
        this.renderSize();
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        switch (attr) {
            case "header-text":
                this.renderHeaderText();
                break;
            case "size":
                this.renderSize();
                break;
        }
    }
}