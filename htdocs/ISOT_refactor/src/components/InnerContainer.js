export class InnerContainer extends HTMLElement {
    static get observedAttributes() {
        return ["header-text", "size"];
    }

    constructor() {
        super();
        this.header = document.createElement("div");
        this.header.className = "inner-container-header";
        this.header.style['order'] = -1;
        this.appendChild(this.header);
    }

    render_headerText() {
       this.header.innerText = this.getAttribute("header-text");
    }

    render_size() {
        this.style['flex'] = this.getAttribute("size");
    }

    render() {
        this.render_headerText();
        this.render_size();
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        switch (attr) {
            case "header-text":
                this.render_headerText();
                break;
            case "size":
                this.render_size();
                break;
        }
    }
}