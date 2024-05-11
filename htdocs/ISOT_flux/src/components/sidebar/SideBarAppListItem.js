import { Component } from "../../core/Component.js";
import { store } from "../../store/store.js";

export class SideBarAppListItem extends Component {
    template() {
        return `
            <img src="./img/svg/${this.getAttribute("name")}.svg">
            <p>${this.getAttribute("name").toUpperCase()}</p>
        `
    }

    init() {
        store.subscribe(() => {
            if (store.getState().global.currentApp == this.getAttribute("name")) {
                this.setAttribute("selected", "");
            } else {
                this.removeAttribute("selected");
            }
        });
    }
}