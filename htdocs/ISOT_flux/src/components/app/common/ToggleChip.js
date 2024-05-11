import { Component } from "../../../core/Component.js";

export class ToggleChip extends Component {
    static get observedAttributes() {
        return ["text", "disabled"];
    }

    template() {
        return "<div></div>"
    }

    init() {
        this.$text = this.querySelector("div");
    }

    setEvent() {
        this.addEvent("click", "toggle-chip", (e) => {
            this.toggleAttribute("disabled");
        });
    }

    render() {
        this.$text.innerText = this.getAttribute("text");
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this.render();
    }
}
