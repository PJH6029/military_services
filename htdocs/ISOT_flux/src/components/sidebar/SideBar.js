import { Component } from "../../core/Component.js";
import { store } from "../../store/store.js";

export class SideBar extends Component {
    template() {
        return `
            <side-bar-header></side-bar-header>
            <div class="divider"></div>
            <div class="wrapper">
                <side-bar-profile></side-bar-profile>
                <side-bar-app-list></side-bar-app-list>
            </div>
            <side-bar-footer></side-bar-footer>
        `
    }

    setEvent() {
        store.getState().global.apps.forEach(appName => {
            this.addEvent("click", `#${appName}-app`, event => {
                this.selectApp(appName);
            });
        });
        this.addEvent("click", "side-bar-footer", event => {
            // alert(store.getState().global.patch);
            alert("TODO");
        });

        this.addEvent("click", "side-bar-header", event => {
            location.reload();
        });
    }

    selectApp(appName) {
        store.commit("SELECT_APP", {
            currentAppName: appName
        });
    }
}