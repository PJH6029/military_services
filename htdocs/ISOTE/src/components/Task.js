import CardHandler from "../handlers/CardHandler.js";
import TaskHandler from "../handlers/TaskHandler.js";
import time from "../utils/time.js";

export default class Task extends HTMLElement {
    static get observedAttributes() {
        return ["task-id"];
    }

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = document.querySelector("#task-app-template").innerHTML;

        this.dashBoard = this.shadowRoot.querySelector(".dashboard");
        this.taskList = document.querySelector("side-bar").shadowRoot.querySelector("task-list");
        this.cardBoxes = [
            this.shadowRoot.querySelector("#before-start"),
            this.shadowRoot.querySelector("#in-progress"),
            this.shadowRoot.querySelector("#complete"),
        ]

        this.cardCounts = [
            this.shadowRoot.querySelector("#before-start-count"),
            this.shadowRoot.querySelector("#in-progress-count"),
            this.shadowRoot.querySelector("#complete-count"),
        ]

        this.currentTask = {id: -1};
        this.currrentCards = [];
        this.myTaskItemEl = null;
        this.isDashboard = false;

        this.taskNameInput = this.shadowRoot.querySelector("#task-name-input");
        this.removeBtn = this.shadowRoot.querySelector("#remove-btn");
        this.shadowRoot.querySelector("#category-complete").addEventListener("click", () => {
            this.containers.complete.toggleAttribute("hide");
            this.shadowRoot.querySelector("#card-more-btn").toggleAttribute("up");
        });
        this.initTaskApp();
    }

    async renderTask(taskId) {
        // taskId = parseInt(taskId); // TODO 이거 왜 안됨 
        if (taskId !== this.currentTask.id) {
            // console.log("load new task");
            await this.updateCurrentTask(taskId); // TODO 이러면 쿼리가 넘 많아지긴 함
        }

        this.containers = {};
        ["before-start", "in-progress", "complete"].forEach(k => {
            this.containers[k] = this.shadowRoot.querySelector("#" + k);
        });
        this.containers.complete.setAttribute("hide", "");

        Object.entries(this.containers).forEach(([k, ref]) => {
            ref.innerHTML = `<div class="add-div"><div class="add-btn"><img src="./svgs/plus.svg"></div></div>`;
        })

        this.shadowRoot.querySelectorAll(".add-div").forEach((div) => {
            div.addEventListener("click", () => {
                const progress = div.parentElement.id;
                this.addNewCardOf(progress);
            });
        });

        this.taskNameInput.value = this.currentTask.name;

        this.currrentCards
            .sort((a, b) => parseInt(time.toTimeStrFromDB(a.created_at)) - parseInt(time.toTimeStrFromDB(b.created_at)))
            .forEach(data => {
                this.addCardElem(data);
            });

        this.updateCardCounts();
    }

    async renderDashboard() {
        // TODO
        this.taskNameInput.value = "DASHBOARD / 오늘 할 일";
        this.resetCurrentTaskToDashboard();

        const cards = await this.getTodayCards();
        // console.log(cards);
        const todayTaskIds = [];
        cards.forEach(card => {
            if (!todayTaskIds.includes(card.task_id)) {
                // new task
                todayTaskIds.push(card.task_id)
            }
        });
        todayTaskIds.sort();

        // render tasks & cards
        const tasks = {};
        const _getTask = async (taskId) => {
            tasks[taskId] = await TaskHandler.getTask(taskId);
        };
        const promises = todayTaskIds.map((taskId) => _getTask(taskId));
        await Promise.all(promises);
        // ready for sort
        todayTaskIds.forEach((taskId) => {
            // render tasks
            const cardContainer = document.createElement("div");
            cardContainer.classList.add("dashboard-card-container");
            cardContainer.innerHTML = `
                <div><span class="task-name">${tasks[taskId].name}</span></div>
                <div class="card-box" id="task-id-${taskId}"></div>
            `;
            this.dashBoard.append(cardContainer);
        });

        // render cards
        cards
        .sort((a, b) => parseInt(time.toTimeStrFromDB(a.created_at)) - parseInt(time.toTimeStrFromDB(b.created_at)))
        .sort((a, b) => b.progress - a.progress)
        .forEach(data => {
            if (parseInt(data.progress) !== 2) {
                const taskCardElem = document.createElement("task-card");
                taskCardElem.setCard(data);
                this.shadowRoot.querySelector(`#task-id-${data.task_id}`).prepend(taskCardElem);
            }
        });
    }

    async getTodayCards() {
        const today = new Date();
        const res = await CardHandler.getAllCardsOfDay(today.getDay());
        return res;
    }

    async updateCurrentTask(newTaskId) {
        this.currentTask = await TaskHandler.getTask(newTaskId);
        this.currrentCards = await CardHandler.getAllCardsOfTask(newTaskId);
        this.myTaskItemEl = this.taskList.shadowRoot.querySelector(`task-item[task-id="${this.currentTask.id}"]`);
        this.isDashboard = false;
    }

    resetCurrentTaskToDashboard() {
        this.currentTask = {id: -1};
        this.myTaskItemEl = null;
        this.isDashboard = true;
        this.dashBoard.innerHTML = "";
    }

    validCurrentTask() {
        return this.currentTask.id !== -1;
    }


    initTaskApp() {
        this.taskNameInput.addEventListener("blur", (e) => {
            if (this.validCurrentTask()) {
                const newVal = this.taskNameInput.value;
                TaskHandler.editTask(this.currentTask.id, newVal);

                // update cached vars;
                this.currentTask.name = newVal;
            }
        });

        this.taskNameInput.addEventListener("keyup", () => {
            if (this.validCurrentTask()) {
                this.myTaskItemEl.shadowRoot.querySelector(".task-name").innerText = this.taskNameInput.value;
            }
        });

        this.removeBtn.addEventListener("click", () => {
            if (!confirm("정말 삭제하시겠습니까?")) return;
            this.removeTask().then((success) => {
                if (success) {
                    this.setAttribute("task-id", "dashboard"); // switch to dashboard
                }
            });
        });

    }

    async removeTask() {
        if (this.validCurrentTask()) {
            const res = await this.taskList.removeTask(this.currentTask);
            if (res) {
                // TODO SET NULL 왜 안됨
                const cards = await CardHandler.getAllCardsOfTask(this.currentTask.id);
                cards.forEach(card => {
                    CardHandler.removeCard(card.id);
                })
            }
            return res;
        }
        return false;
    }

    async removeCard(card) {
        const isSuccess = await CardHandler.removeCard(card.id);

        if (isSuccess) {
            this.shadowRoot.querySelector(`task-card[card-id='${card.id}']`).remove();

			alert(`"Card (${card.title})가 성공적으로 삭제되었습니다.`);
	        console.log(`Card with id ${card.id} is successfully deleted`);
	                
		} else {
			alert(`Card (${card.name})가 삭제되지 않았습니다.`);
	        console.log(`Deletion of Card with id ${card.id} is failed`);
		}
		return isSuccess;
    }

    addNewCardOf(progress) {
        const progressNum = {"before-start": 0, "in-progress": 1, "complete": 2}[progress];
        const editor = document.createElement("card-editor");
        editor.init(true, null, progressNum, this.currentTask.id);
        document.body.prepend(editor);
    }

    addCardElem(card) {
        const taskCardElem = document.createElement("task-card");
        taskCardElem.setCard(card);
        this.cardBoxes[card.progress].prepend(taskCardElem);
    }
    updateCardCounts() {
        this.cardCounts.forEach((cntEl, idx) => {
            cntEl.innerText = this.cardBoxes[idx].querySelectorAll("task-card").length;
        });
    }

    connectedCallback() {

    }

    attributeChangedCallback(attr, oldVal, newVal) {
        // console.log("taskId changed: " + newVal);
        if (newVal !== "dashboard") {
            this.renderTask(newVal);
        } else {
            this.renderDashboard();
        }
        
    }
}