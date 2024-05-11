import UserHandler from "../handlers/UserHandler.js";

export default class SideBar extends HTMLElement {
    static get observedAttributes() {
        return ["select"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: space-between;
                    width: var(--side-bar-width);
                    height: calc(100% - 1.5rem);
                    padding: 0.75rem;
                    background-color: var(--primary);
                    box-shadow: 0 0 10px 0px rgb(0 0 0 / 10%);
                    color: white;
                }

                .wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .header {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    padding: 0.5rem;
                }

                .header > p {
                    font-size: 1rem;
                    font-weight: bold;
                    line-height: 1.1rem;
                    margin: 0;
                }

                .header > img {
                    margin-top: 0.25rem;
                }

                .divider {
                    width: 100%;
                    height: 3px;
                    background-color: white;
                    border-radius: 2px;
                }

                .menu-item {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    border-radius: 0.5rem;
                    gap: 1rem;
                    cursor: pointer;
                    height: 2rem;
                    padding: 0.3rem 1rem 0.3rem 1rem;
                    transition: 0.2s ease-in-out;
                }

                .menu-item[selected] {
                    background-color: #372e70;
                }

                .menu-item > p {
                    font-size: 1rem;
                }

                .menu-item > img {
                    transition: 0.2s ease-in-out;
                    margin-top: 0.1rem;
                }

                .info {
                    justify-content: flex-end;
                    font-family: consolas;
                    font-size: 0.6rem;
                    user-select: none;
                    cursor: pointer;
                    gap: 0.2rem;
                    padding: 0.5rem;
                }

                .inner {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                img {
                    width: 22px;
                }

                #logo {
                    width: 38px;
                }

                .profile-box {
                    padding: 0.5rem 0.9rem;
                    font-size: 1.1rem;
                    background-color: #5e52a3;
                    border-radius: 0.5rem;
                    box-shadow: 0 0 10px 0px rgb(0 0 0 / 10%);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .my-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

            </style>

            <div class="wrapper">
                <div class="header" onclick="location.reload()">
                    <img id="logo" src="./img/svg/logo.svg" >
                    <p>ISOT MANAGER 3.0</p>
                </div>
                <div class="divider"></div>
                <div class="profile-box">
                    <div class="my-info">
                        <div class="current-profile"></div>
                        <chip-btn-link href="./auth/logout.php" thin>로그아웃</chip-btn-link>
                    </div>
                </div>
                <div class="inner">
                    <div class="menu-item" id="home">
                        <img id="home-icon" src="./img/svg/home.svg">
                        <p>HOME</p>
                    </div>
                </div>
            </div>
            <div class="wrapper info" id="isot-info">
                <span style="font-weight: bold; font-size: 1.1rem;">v2.13</span> last update 23.02.14
            </div>
        `;

        this.isotInfo = this.shadowRoot.getElementById("isot-info");

        this.apps = ["home", ];

        this.menus = {};
        this.pageRefs = {};

        this.apps.forEach(app => {
            this.menus[app] = this.shadowRoot.getElementById(app);
            this.pageRefs[app] = document.querySelector(`${app}-app`);
        });

        this.setEventListeners();
        this.updateProfile();
    }

    setEventListeners() {
        Object.entries(this.menus).forEach(([key, menuEl]) => {
            menuEl.addEventListener("click", () => {
                this.setAttribute("select", key);
            });
        });
    }

    updateProfile() {
        this.shadowRoot.querySelector(".current-profile").innerText = UserHandler.getCurrentUser().name;
    }

    makeSelected(app) {
        this.shadowRoot.querySelectorAll(".menu-item").forEach(el => {
            el.removeAttribute("selected");
        });
        this.menus[app].setAttribute("selected", "");
    }

    switchPage(app) {
        Object.values(this.pageRefs).forEach(ref => {
            ref.setAttribute("hidden", "");
        });
        this.pageRefs[app].removeAttribute("hidden");
    }

    connectedCallback() {
        this.setAttribute("select", "home");
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this.makeSelected(newVal);
        this.switchPage(newVal);
    }
}