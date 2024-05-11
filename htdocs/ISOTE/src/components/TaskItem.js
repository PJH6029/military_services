export default class TaskItem extends HTMLElement {
    // static get observedAttributes() {
    //     return ["task-select"];
    // } 

    constructor() {
        super();
        this.INITAL_NAME = "new task!";
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = document.querySelector("#task-item-template").innerHTML;
        this.task = { id: -1 };

        this.addEventListener("click", () => {
            const taskApp = document.querySelector("task-app");
            // switch page
            taskApp.setAttribute("task-id", this.task.id);
        });
    }

    /**
     * 
     * @param {string} name task name
     */
    setTask(task) {
        this.task = {...task};
        this.shadowRoot.querySelector(".task-name").innerHTML = task.name;
        this.setAttribute("task-id", task.id);
    }

    show() {
        this.removeAttribute("hide");
    }

    hide() {
        this.setAttribute("hide", "");
    }

    connectedCallback() {

    }

    attributeChangedCallback(attr, oldVal, newVal) {

    }
}