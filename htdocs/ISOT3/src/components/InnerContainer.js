export default class InnerContainer extends HTMLElement {
    static get observedAttributes() {
        return ["header-text", "size"];        
    }

    constructor() {
        super();
        this.headerElem = document.createElement("div");
        this.headerElem.classList.add("inner-container-header");
        this.headerElem.style.order = "-1";
        this.appendChild(this.headerElem);
    }

    renderHeaderText() {
        this.headerElem.innerText = this.getAttribute("header-text");
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