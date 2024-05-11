import { Component } from "../../core/Component.js";
import { store } from "../../store/store.js";

export class SideBarFooter extends Component {
    template() {
        return `
            <span class="version">v${store.getState().global.version}</span> last update ${store.getState().global.lastUpdate}
        `;
    }

}