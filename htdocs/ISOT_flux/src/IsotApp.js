import { Component } from "./core/Component.js";
import { store } from "./store/store.js";

export class IsotApp extends Component {
    template() {
        return `
            <side-bar></side-bar>
            <div class="container">
                ${store.getState().global.apps.map(appName => {
                    return `<${appName}-app hidden></${appName}-app>`;
                }).join("")}
            </div>
        `;
    }

    init() {
        store.subscribe(() => {
            const currentApp = store.getState().global.currentApp;
            store.getState().global.apps.forEach(appName => {
                this.querySelector(`${appName}-app`).setAttribute("hidden", "");
            });
            this.querySelector(`${currentApp}-app`).removeAttribute("hidden");
        });
    }
}