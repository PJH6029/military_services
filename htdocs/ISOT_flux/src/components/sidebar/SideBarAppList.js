import { Component } from "../../core/Component.js";
import { store } from "../../store/store.js";

export class SideBarAppList extends Component {
    template() {
        return `
            ${
                store.getState().global.apps.map(appName => {
                    return `<side-bar-app-list-item id=${appName}-app name=${appName}></side-bar-app-list-item>`
                }).join("")
            }
        `
    }
}