import { Component } from "../../core/Component.js";
import { SideBarAppList } from "./SideBarAppList.js";
import { SideBarFooter } from "./SideBarFooter.js";
import { SideBarHeader } from "./SideBarHeader.js";
import { store } from "../../store/store.js";

export class SideBar extends Component {
    setup() {
        store.dispatch(state => {
            state.sideBar = {
                appList: ["home", "vault", "scheduler", "calender"],
                selectedApp: "home",
            };
        });
    }

    template() {
        return `
            <div class="header"></div>
            <div class="divider"></div>
            <div class="wrapper flex-col">
                <div class="profile"></div>
                <div class="app-list flex-col"></div>
            </div>
            <div class="footer flex-col"></div>
        `;
    }

    mounted() {
        new SideBarHeader(this.$el.querySelector(".header"));
        console.log(store.getState());
        const appListState = store.selectState(state => state.sideBar.appList);

        // new SideBarProfile(this.$el.querySelector(".profile")); // TODO
        new SideBarAppList(this.$el.querySelector(".app-list"));
        new SideBarFooter(this.$el.querySelector(".footer"));

        appListState.keys().forEach(key => {
            const appName = appListState[key];
            this.addEvent("click", `#${appName}-app`, event => {
                this.selectApp(appName);
            });
        });
    }

    selectApp(appName) {
        store.dispatch(state => {
            state.sideBar.selectedApp = appName;
        });
    }
}