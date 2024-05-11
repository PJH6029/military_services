export default class SideBar extends HTMLElement {
    /**
     * attributeChangedCallback 관측
     */
    static get observedAttributes() {
        return ["select"];
    }

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = document.querySelector("#side-bar-template").innerHTML;

        this.items = {
            task: this.shadowRoot.querySelector("#task"),
            // calender: this.shadowRoot.querySelector("#calender"),
            meeting: this.shadowRoot.querySelector("#meeting"),
        };

        this.pages = {
            task: document.querySelector("task-app"), // task dashboard
            // calender: document.querySelector("calender-app"), // default calender
            meeting: document.querySelector("meeting-app"), // meeting calender
        };

        this.taskListBtn = this.shadowRoot.querySelector("#task-more-btn");

        this.taskList = this.shadowRoot.querySelector("task-list");

        this.attachListeners();
    }

    /**
     * task list 로드
     */
     attachListeners() {
        Object.entries(this.items).forEach(([key, ref]) => {
            ref.addEventListener("click", () => {
                this.setAttribute("select", key);
                this.switchPage(key);
            });
        });

        this.taskListBtn.addEventListener("click", () => {
            if (this.taskListBtn.hasAttribute("up")) {
                this.taskList.hideList();
            } else {
                this.taskList.showList();
            }
            this.taskListBtn.toggleAttribute("up");
        });

        this.shadowRoot.querySelector("#task-menu").addEventListener("click", () => {
            document.querySelector("task-app").setAttribute("task-id", "dashboard");
            // this.taskListBtn.removeAttribute("up");
            // this.taskList.showList();
        });
    }

    /**
     * items의 선택된 키만 selected 처리
     */
    renderSidebar(key) {
        this.shadowRoot.querySelectorAll(".item").forEach(i => {
            i.removeAttribute("selected");
        });
        this.items[key].setAttribute("selected", "");

        if (!this.items.task.hasAttribute("selected")) {
            this.taskListBtn.removeAttribute("up");
            this.taskList.hideList();
        }
    }

    /**
     * pages의 선택된 키 외의 페이지 hide
     * @param {*} key page 키
     */
    switchPage(key) {
        Object.keys(this.pages).forEach((p) => {
            this.pages[p].setAttribute("hidden", "");
        });
        this.pages[key].removeAttribute("hidden");
        this.currentPage = key;
    }

    get currentPage() {
        if (!localStorage.hasOwnProperty("ISOTE-currentPage")) this.currentPage = "task";
        return localStorage.getItem("ISOTE-currentPage");
    }

    set currentPage(newVal) {
        localStorage.setItem("ISOTE-currentPage", newVal);
    }

    /**
     * element 생성 시 호출
     */
    connectedCallback() {
        this.renderSidebar(this.currentPage);
        this.switchPage(this.currentPage);
    }

    /**
     * attribute 변경 시 호출
     */
    attributeChangedCallback(attr, oldVal, newVal) {
        this.renderSidebar(newVal);
    }
}