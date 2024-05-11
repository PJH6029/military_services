import TaskHandler from "../handlers/TaskHandler.js";

export default class TaskList extends HTMLElement {
	constructor() {
		super();

		this.attachShadow({mode: "open"});
        this.shadowRoot.innerHTML = document.querySelector("#task-list-template").innerHTML;

		this.listHeight = -1;
		this.itemContainer = this.shadowRoot.querySelector(".item-container");
		this.initPlus();
		this.loadAllTasks().then((tasks) => {
			tasks.forEach((task) => {
	            const taskItem = document.createElement("task-item");
	            taskItem.hide();
	            taskItem.setTask(task);
	            this.plusTask.insertAdjacentElement("beforebegin", taskItem);
			});
		});
	}

	async loadAllTasks() {
		const tmp = await TaskHandler.getAllTasks();
		return tmp;
	}

	initPlus() {
		const plusTask = document.createElement("div");
        plusTask.id = "plus-task-btn";
		plusTask.innerHTML = `<div class="add-div"><div class="add-btn"><img src="./svgs/plus.svg"></div></div>`

        plusTask.addEventListener("click", () => {
        	this.spawnNewTaskItem().then((newTask) => {
        		// switch page
				document.querySelector("task-app").setAttribute("task-id", newTask.id);
				document.querySelector("task-app").shadowRoot.querySelector("#task-name-input").focus();
        	});
        });

        this.itemContainer.appendChild(plusTask);
        this.plusTask = this.shadowRoot.querySelector("#plus-task-btn");
		this.hidePlus();
	}

	hidePlus() {
		this.plusTask.setAttribute("hide", "");
	}

	showPlus() {
		this.plusTask.removeAttribute("hide");
	}

	async spawnNewTaskItem() {
		// api call
		const newTaskItem = document.createElement("task-item");
		const newTask = await TaskHandler.addTask(newTaskItem.INITAL_NAME);
		this.plusTask.insertAdjacentElement("beforebegin", newTaskItem);

		newTaskItem.setTask(newTask);
		this.updateListHeight();
		return newTask;
	}

	async removeTask(task) {
		const isSuccess = await TaskHandler.removeTask(task.id);

		if (isSuccess) {
			// TODO 1225 php에서 id 리턴할 수 있을거 같은디?
			this.shadowRoot.querySelector(`task-item[task-id='${task.id}']`).remove();
			this.updateListHeight();

			alert(`"Task (${task.name})가 성공적으로 삭제되었습니다.`);
	        console.log(`Task with id ${task.id} is successfully deleted`);
	                
		} else {
			alert(`Task (${task.name})가 삭제되지 않았습니다.`);
	        console.log(`Deletion of Task with id ${task.id} is failed`);
		}
		return isSuccess;
	}

	updateListHeight() {
		this.listHeight = 0;
		const taskItems = this.shadowRoot.querySelectorAll("task-item");
        taskItems.forEach((taskItem) => {
            this.listHeight += taskItem.offsetHeight;
        });
        this.listHeight += 7 * (taskItems.length + 1);
		this.listHeight += this.plusTask.offsetHeight;
        // this.shadowRoot.style["height"] = this.taskListHeight;
		this.itemContainer.style["height"] = this.listHeight;
	}

	showList() {
		this.updateListHeight();
		this.shadowRoot.querySelectorAll("task-item").forEach((el) => el.show());
		this.showPlus();
	}

	hideList() {
        this.shadowRoot.querySelectorAll("task-item").forEach((el) => el.hide());
		this.hidePlus();
		this.itemContainer.style["height"] = 0;
        this.listHeight = 0;
	}
}