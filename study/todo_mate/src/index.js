SIDE_BAR_WIDTH_REM = 3;
DISPLAY_INIT_DATE = new Date();
START_DATE = new Date();
SELECTED_DATE = new Date();
DB = {};
LAST_TODO_ID = -1;
LOCAL_STORAGE_DB_KEY = 'todo-mate-db';

const COLORS = [
	"black", "white", "pink", "coral", 
	"lightsalmon", "salmon", "crimson", "brown", "red", 
	"orange", "yellow", "greenyellow", "lime","lightgreen", 
	"green", "olive", "skyblue", "aqua", "blue", 
	"navy", "violet","magenta", "purple","indigo",
];

const time = {
    breakTimeStr(timeStr) {
        let key = ["year", "month", "date", "hours", "minutes", "seconds"];
        let obj = {};
        let ary = [];
        ary.push(timeStr.substr(0, 4));
        for (let i = 1; i < 6; i++) {
            ary.push(timeStr.substr(2*i + 2, 2));
        }

        key.forEach((k, index) => {
            obj[k] = ary[index];
        });

        return obj;
    },
    toTimeStr(dateObj, full = true) {
        const front = dateObj.getFullYear() + (dateObj.getMonth() + 1).toString().padStart(2, 0) + dateObj.getDate().toString().padStart(2, 0);
        const back = dateObj.getHours().toString().padStart(2, 0) + dateObj.getMinutes().toString().padStart(2, 0) + dateObj.getSeconds().toString().padStart(2, 0);
        return full ? front + back : front;
    },
    toTimeObj(timeStr) {
        let timeObj = new Date();
        const { year, month, date, hours, minutes, seconds } = this.breakTimeStr(timeStr);
        
        year && timeObj.setFullYear(year);
        month && timeObj.setMonth(month-1);
        date && timeObj.setDate(date);
        hours && timeObj.setHours(hours);
        minutes && timeObj.setMinutes(minutes);
        seconds && timeObj.setSeconds(seconds);
        return timeObj;
    },
    getDayStr(timeStr) {
        const dayList = ['일', '월', '화', '수', '목', '금', '토'];
        return dayList[this.toTimeObj(timeStr).getDay()];
    },
	compareDate(d1, d2) {
		const d1Num = parseInt(this.toTimeStr(d1, false));
		const d2Num = parseInt(this.toTimeStr(d2, false));
		if (d1Num === d2Num) {
			return 0;
		} else if (d1Num > d2Num) {
			return 1;
		} else {
			return -1;
		}
	}
}


const divFocus = (elem) => {
	if (elem.innerText.length === 0) {
		elem.focus();
		return;
	}

	const selection = window.getSelection();
	const range = document.createRange();
	range.selectNodeContents(elem);
	range.collapse(false);
	selection.removeAllRanges();
	selection.addRange(range);
}

const dbManager = {
	todoIds: [],
	loadDBFromLocalStorage() {
		if (!localStorage.hasOwnProperty(LOCAL_STORAGE_DB_KEY)) {
			dbManager.setDefaultDB();
			return;
		};
		const dbFromLocalStorage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DB_KEY));
		const {success, validatedDB} = dbManager.validateDB(dbFromLocalStorage);
		if (!success) {
			dbManager.setDefaultDB();
			return;
		};
	
		console.log("DB Load Success");
		this.applyValidatedDB(validatedDB);
	},
	loadDBFromFile(DBStr) {
		const backupObj = JSON.parse(DBStr);
		const {success, validatedDB} = dbManager.validateDB(backupObj);
		if (!success) {
			console.log("Load Failed");
			return;
		}

		console.log("DB Import Success");
		this.applyValidatedDB(validatedDB);
		this.commit();
	},

	applyValidatedDB(validatedDB) {
		DB = validatedDB;
		console.log(DB);

		this.todoIds = [];
		Object.keys(DB.todoData).forEach(dateKey => {
			Object.keys(DB.todoData[dateKey].todos).forEach(todoId => this.todoIds.push(parseInt(todoId)));
		});
		LAST_TODO_ID = Math.max(...this.todoIds);
	},

	setDefaultDB() {
		DB = {
			"goalData": {},
			"todoData": {},
		};
	},
	validateDB(DBObj) {
		console.log(DBObj);
		// todo data
		Object.keys(DBObj.todoData).forEach(dateKey => {
			let incompleteCntTmp = 0;
			Object.keys(DBObj.todoData[dateKey].todos).forEach(todoId => {
				if (!DBObj.todoData[dateKey].todos[todoId].done) incompleteCntTmp++;
			});
			// overwrite to correct errors
			// consider it's success
			DBObj.todoData[dateKey].incompleteCnt = incompleteCntTmp;
		});
		return {success: true, validatedDB: DBObj};
	},
	commit() {
		const {success, validatedDB} = this.validateDB(DB);
		if (success) {
			localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(validatedDB));
			console.log("DB commited to local storage");
			console.log(JSON.parse(localStorage.getItem(LOCAL_STORAGE_DB_KEY)));
		}
	},

	addTodo(todo) {
		const {success, validatedTodo} = this.validateTodo(todo);
		if (!success) {
			console.log("Validation of todo has failed", todo);
			return;
		}

		console.log("todo to add", validatedTodo);
		if (!DB.todoData[validatedTodo.date]) {
			DB.todoData[validatedTodo.date] = {
				todos: {},
				incompleteCnt: 0,
			};
		}
		DB.todoData[validatedTodo.date].todos[validatedTodo.id] = {...validatedTodo};
		if (!validatedTodo.done) {
			DB.todoData[validatedTodo.date].incompleteCnt++;
		}
		this.todoIds.push(validatedTodo.id);
		console.log("Add Success");
		this.commit();
	},

	removeTodo(todo) {
		const todoDatas = DB.todoData[todo.date];
		if (todoDatas) {
			if (todoDatas.todos[todo.id]) {
				delete todoDatas.todos[todo.id];
				this.todoIds.splice(this.todoIds.indexOf(todo), 1);
				console.log("Remove Success");
				this.commit();
				return true;
			}
		}
		return false;
	},

	updateTodo(newTodo) {
		const {success, validatedTodo} = this.validateTodo(newTodo);
		if (!success) {
			console.log("Validation of todo has failed", newTodo);
			return;
		}
		
		// data: content or done
		const todoDataToUpdate = DB.todoData[validatedTodo.date];
		if (!todoDataToUpdate) {
			return;
		}
		const prevTodo = {...todoDataToUpdate.todos[validatedTodo.id]};

		// done
		const doneUpdated = prevTodo.done !== validatedTodo.done;
		if (doneUpdated) {
			if (validatedTodo.done) {
				// false to true
				todoDataToUpdate.incompleteCnt--;
			} else {
				todoDataToUpdate.incompleteCnt++;
			}
		}

		todoDataToUpdate.todos[validatedTodo.id] = { ...validatedTodo };

		console.log("DB updated / from: ", prevTodo, " / to: ", validatedTodo);
		this.commit();
	},

	validateTodo(todo) {
		// id
		if (!typeof(todo.id) === "number") {
			try {
				todo.id = parseInt(todo.id);
			} catch (e) {
				console.log("Todo id is not a number")
				return {success: false, validatedTodo: {}};
			}
		}

		// goal id
		if (!this.getGoalKeys().includes(todo.goalId)) {
			console.log("Invalid goal id of todo");
			return {success: false, validatedTodo: {}};
		}

		// date
		const dateReg = /\d{8}/;
		if (!todo.date.match(dateReg)) {
			console.log("Invalid date str format");
			return {success: false, validatedTodo: {}};
		}

		// content
		if (!todo.content) {
			console.log("Empty todo content");
			return {success: false, validatedTodo: {}};
		}

		// done
		if (!typeof(todo.done) === "boolean") {
			console.log("Done field of todo must be boolean");
			return {success: false, validatedTodo: {}};
		}

		return {success: true, validatedTodo: todo};
	},

	updateGoal(newGoal) {
		const {success, validatedGoal} = this.validateGoal(newGoal);
		if (!success) {
			console.log("Validation of goal has failed", newGoal);
			alert("수정하시려는 목표의 정보들을 다시 확인하세요");
			return;
		}

		const goalToUpdate = DB.goalData[validatedGoal.id];
		if (!goalToUpdate) return;

		console.log("DB updated / from: ", goalToUpdate, " / to: ", validatedGoal);
		DB.goalData[validatedGoal.id] = { ...validatedGoal };
		this.commit();
	},

	validateGoal(goal) {
		// id
		if (!typeof(goal.id) === "number") {
			try {
				goal.id = parseInt(goal.id);
			} catch (e) {
				console.log("Goal id is not a number")
				return {success: false, validatedGoal: {}};
			}
		}

		// name
		if (!goal.name) {
			console.log("Empty goal name");
			return {success: false, validatedGoal: {}};
		}

		// color
		if (!COLORS.includes(goal.color)) {
			console.log("Empty goal color");
			return {success: false, validatedGoal: {}};
		}

		return { success: true, validatedGoal: goal};
	},

	getTodosAt(dateStr) {
		return DB.todoData[dateStr];
	},

	getGoals() {
		return DB.goalData;
	},
	getGoal(goalId) {
		return DB.goalData[goalId];
	},
	getGoalKeys() {
		return Object.keys(DB.goalData).map(e => parseInt(e)).sort();
	},

	backupAsFile() {
		this.commit();
		const DBStr = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
		download(DBStr, time.toTimeStr(new Date()) + "_TODO_MATE_DB.json"); 
	}
};

function initSideBar() {
	const widthToggleBtn = document.getElementById("see-more");
	widthToggleBtn.addEventListener("click", () => {
		SIDE_BAR_WIDTH_REM = (SIDE_BAR_WIDTH_REM === 3) ? 15 : 3;
		console.log(SIDE_BAR_WIDTH_REM);
		document.querySelector(".side-bar").style.width = SIDE_BAR_WIDTH_REM + "rem";
	});
}

function initCalender() {
	document.getElementById("month-prev-btn").addEventListener("click", () => {
		movePrevMonth();
		renderCalender();
	});
	document.getElementById("month-next-btn").addEventListener("click", () => {
		moveNextMonth();
		renderCalender();
	});
	document.getElementById("today-btn").addEventListener("click", () => {
		initDate();
		renderCalender();
	});


	// init calender
	document.querySelector(".calender-content").innerHTML = `<table id="calender-table"><tr class="day-row"></tr></table>`;
	const dayRow = document.querySelector(".day-row");
	["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day, i) => {
		const td = document.createElement("td");
		td.innerText = day;

		td.removeAttribute("sun", "");
        td.removeAttribute("sat", "");
        if (i === 0) td.setAttribute("sun", "");
        if (i === 6) td.setAttribute("sat", "");	
        dayRow.appendChild(td);
	});

	const addWeekRow = (idx) => {
		const weekRow = document.createElement("tr");
		weekRow.className = "week-row";
		weekRow.id = `calender-week${idx}`;

		for (let i = 0; i < 7; i++) {
			const td = document.createElement("td");
			td.id = `date-${idx}-${i}`;

			const dateInfoElem = createDateInfoElem();
			td.appendChild(dateInfoElem);
			weekRow.appendChild(td);
		}

		document.getElementById("calender-table").appendChild(weekRow);
	};

	for (let i = 0; i < 6; i++) {
		addWeekRow(i);
	} 

	initDate();
}

function initDate() {
	const today = new Date();
	const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
	START_DATE = monthStartDate;
	DISPLAY_INIT_DATE = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate() - START_DATE.getDay());
	SELECTED_DATE = new Date();
}

function moveNextMonth() {
	START_DATE.setMonth(START_DATE.getMonth() + 1);
	DISPLAY_INIT_DATE = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate() - START_DATE.getDay());
}

function movePrevMonth() {
	START_DATE.setMonth(START_DATE.getMonth() - 1);
	DISPLAY_INIT_DATE = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate() - START_DATE.getDay());
}

function createDateInfoElem() {
	const div = document.createElement("div");
	div.classList.add("date-info", "center");
	div.innerHTML = `
		<div class="date"></div>
		<div class="todo-thumbnail center">
			<span class="incomplete-cnt"></span>
		</div>
	`;
	return div;
}

function initTodoList() {
	// TODO
}

function renderCalender() {
	const weekList = [];
	for (let i = 0; i < 6; i++) {
		const week = [];
		for (let j = 0; j < 7; j++) {
			const d = new Date(DISPLAY_INIT_DATE);
			d.setDate(DISPLAY_INIT_DATE.getDate() + i * 7 + j);
			week.push(d);
		}
		weekList.push(week);
	}

	document.getElementById("month").innerText = START_DATE.getMonth() + 1;

	const weekRows = document.querySelectorAll(".week-row");
	weekList.forEach((week, i) => {
		const weekRow = [...weekRows[i].querySelectorAll("td")];
		week.forEach((d, j) => {
			const dateInfoElem = weekRow[j].querySelector(".date-info");

			dateInfoElem.querySelector(".date").innerText = d.getDate() == 1 ? `${d.getMonth() + 1}. ${d.getDate()}` : `${d.getDate()}`;

			dateInfoElem.removeAttribute("today");
			if (time.compareDate(d, new Date()) === 0) {
				dateInfoElem.setAttribute("today", "");
			}

			dateInfoElem.removeAttribute("sun");
			dateInfoElem.removeAttribute("sat");
			if (j === 0) {
				dateInfoElem.setAttribute("sun", "");
			} else if (j === 6) {
				dateInfoElem.setAttribute("sat", "");
			}

			dateInfoElem.removeAttribute("before");
			dateInfoElem.removeAttribute("after");
			if (parseInt(time.toTimeStr(d, false).slice(0, 6)) < parseInt(time.toTimeStr(START_DATE, false).slice(0, 6))) {
				dateInfoElem.setAttribute("before", "");
            } else if (parseInt(time.toTimeStr(d, false).slice(0, 6)) > parseInt(time.toTimeStr(START_DATE, false).slice(0, 6))) {
				dateInfoElem.setAttribute("after", "");
			}

			const dateStr = time.toTimeStr(d, false);
			let incompleteCntStr = "";
			dateInfoElem.removeAttribute("complete");
			if (dbManager.getTodosAt(dateStr) && Object.keys(dbManager.getTodosAt(dateStr).todos).length !== 0) {
				if (dbManager.getTodosAt(dateStr).incompleteCnt === 0) {
					incompleteCntStr = "✔";
					dateInfoElem.setAttribute("complete", "");
				} else {
					incompleteCntStr = dbManager.getTodosAt(dateStr).incompleteCnt;
				}
			}
			dateInfoElem.querySelector(".incomplete-cnt").innerText = incompleteCntStr;

			dateInfoElem.removeAttribute("selected");
			if (time.compareDate(d, SELECTED_DATE) === 0) {
				dateInfoElem.setAttribute("selected", "");
			}

			dateInfoElem.onclick = () => {
				if (time.compareDate(SELECTED_DATE, d) !== 0) {
					SELECTED_DATE = new Date(d);
					document.querySelectorAll(".date-info").forEach(el => el.removeAttribute("selected"));
					dateInfoElem.setAttribute("selected", "");
					renderTodoList();
				}
			};
		});
	});
}

function renderTodoList() {
	const todoListContainer = document.querySelector(".todo-list-container");

	todoListContainer.innerHTML = "";
	// render goals (default page)
	dbManager.getGoalKeys().forEach(goalId => {
		const goal = dbManager.getGoal(goalId);
		const goalContainer = createGoalContainerElem(goal);
		todoListContainer.appendChild(goalContainer);
	});

	const selectedDateStr = time.toTimeStr(SELECTED_DATE, false);
	const selectedTodoData = dbManager.getTodosAt(selectedDateStr);
	console.log("DATE: " + selectedDateStr + ", DATA: ", selectedTodoData);
	if (selectedTodoData) {
		const todos = selectedTodoData.todos;
		Object.entries(todos).forEach(([k, todo]) => {
			const todoElem = createTodoElem(todo);

			todoListContainer.querySelector("#goal-" + todo.goalId).querySelector(".todo-list").appendChild(todoElem);
		});
	}
}

function createGoalContainerElem(goal, contenteditable=false) {
	const div = document.createElement("div");
	div.classList.add("goal-container");
	div.innerHTML = `
		<div class="goal-container-header">
			<div class="goal-desc">
				<div class="goal-name" contenteditable=${contenteditable}></div>
				<div class="add-todo-btn center">+</div>
			</div>
		</div>
		<div class="todo-list">
		</div>
	`;

	const goalNameElem = div.querySelector(".goal-name");
	goalNameElem.innerText = goal.name;
	div.id = "goal-" + goal.id;

	const dropdownSetting = (event) => {
		document.querySelectorAll(".dropdown").forEach(el => el.remove());
		const dropdownInfo = [
			{
				"content": "수정",
				"action": () => {
					createGoalModalElem(goal);
				},
			},
			{
				"content": "삭제",
				"action": () => {
					console.log("delete");
				},
			},
		];
		createDropdownElem(dropdownInfo, event.clientX, event.clientY);
	};

	div.querySelector(".goal-desc").addEventListener("contextmenu", (e) => {
		dropdownSetting(e);
	});

	div.querySelector(".add-todo-btn").addEventListener("click", () => {
		const newTodoData = {
			id: ++LAST_TODO_ID,
			content: "",
			date: time.toTimeStr(SELECTED_DATE, false),
			goalId: goal.id,
			done: false,
		}
		const newTodoElem = createTodoElem(newTodoData, true);
		div.querySelector(".todo-list").appendChild(newTodoElem);
		newTodoElem.querySelector(".todo-content").focus();
	});

	// apply style
	div.querySelector(".goal-name").style.color = goal.color;
	return div;
}

function createGoalModalElem(goal) {	
	const goalDisplay = {
		"name": "이름",
		"color": "색깔",
	};

	const div = document.createElement("div");
	div.classList.add("modal");
	div.id = "goal-modal-" + goal.id + "-" + Math.random();
	div.innerHTML = `
		<div class="modal-header">
			<div class="modal-btn modal-apply-btn center">✔</div>
			<div class="modal-btn modal-remove-btn center">X</div>
		</div>
		<div class="modal-container"></div>
	`;
	const modalContainer = div.querySelector(".modal-container");

	Object.keys(goal).forEach(key => {
		if (key === "id") return; // continue

		const infoElem = document.createElement("div");
		infoElem.classList.add("goal-modal-info");
		if (key !== "color") {
			infoElem.innerHTML = `
				<div class="info-label">${goalDisplay[key]}</div>
				<div class="info-value">
					<input class="info-input ${key}" type="text">
				</div>
			`;
			infoElem.querySelector(".info-input").value = goal[key];
		} else {
			// color
			infoElem.innerHTML = `
				<div class="info-label">${goalDisplay[key]}</div>
				<div class="info-value">
					<div class="color-palette">
						<div class="selected-color-wrapper center">
							<span class="color-cube selected-color"></span>
						</div>
						<div class="color-list"></div>
					</div>
				</div>
			`;
			const pallete = infoElem.querySelector(".color-list");
			infoElem.querySelector(".selected-color").style.background = goal.color;
			COLORS.forEach(color => {
				const colorCube = document.createElement("span");
				colorCube.classList.add("color-cube");
				colorCube.style.background = color;
				colorCube.addEventListener("click", () => {
					document.querySelector(".selected-color").style.background = color;
				});
				pallete.appendChild(colorCube);
			});
		}
		
		modalContainer.appendChild(infoElem);
	});

	div.querySelector(".modal-remove-btn").addEventListener("click", () => {
		document.querySelectorAll(".modal").forEach(el => el.remove());
	});

	div.querySelector(".modal-apply-btn").addEventListener("click", () => {
		// apply
		dbManager.updateGoal({
			...goal,
			name: div.querySelector(".name").value,
			color: div.querySelector(".selected-color").style.background,
		});
		document.querySelectorAll(".modal").forEach(el => el.remove());
		renderTodoList();
	});

	// bind enter
	div.addEventListener("keydown", (e) => {
		console.log("hi");
		if (e.keyCode === 13) {
			div.querySelector(".modal-apply-btn").click();
		}
	});

	document.body.prepend(div);
}

function createTodoElem(todo, contenteditable=false) {
	const div = document.createElement("div");
	div.classList.add("todo", "todo-center");
	div.id = "todo-" + todo.id;
	div.innerHTML = `
		<div class="todo-wrapper todo-center">
			<div class="todo-center">
				<input type="checkbox" class="todo-checkbox" id="todo-checkbox-${todo.id}">
			</div>
			<div class="todo-content todo-center" contenteditable=${contenteditable}></div>
			<label for="todo-checkbox-${todo.id}"></label>
		</div>
		<div class="todo-setting center">...</div>
	`;

	div.querySelector(".todo-content").innerText = todo.content;
	div.querySelector(".todo-checkbox").checked = todo.done;

	div.querySelector(".todo-checkbox").addEventListener("click", (e) => {
		dbManager.updateTodo({
			...todo,
			content: div.querySelector(".todo-content").innerText,
			done: div.querySelector(".todo-checkbox").checked,
		});
		// update calender cnt
		renderCalender();
	});

	div.querySelector(".todo-content").addEventListener("blur", (e) => {
		const text = div.querySelector(".todo-content").innerText;
		if (!text) {
			console.log("Empty content. Delete");
			dbManager.removeTodo(todo);
			e.target.parentNode.parentNode.remove();
			return;
		}

		// TODO bind??
		// const dbManagerFunc = (dbManager.todoIds.includes(todo.id)) ? dbManager.updateTodo : dbManager.addTodo;

		if (!dbManager.todoIds.includes(todo.id)) {
			// add
			dbManager.addTodo({
				...todo,
				content: div.querySelector(".todo-content").innerText,
				done: div.querySelector(".todo-checkbox").checked,
			});
		} else {
			// edit
			dbManager.updateTodo({
				...todo,
				content: div.querySelector(".todo-content").innerText,
				done: div.querySelector(".todo-checkbox").checked,
			});
		}
		e.target.removeAttribute("contenteditable");
		renderCalender();
	});

	// bind enter
	div.querySelector(".todo-content").addEventListener("keydown", (e) => {
		if (e.keyCode === 13) {
			e.target.innerText = e.target.innerText.trim();
			e.target.blur();
		}
	});


	const dropdownSetting = (event) => {
		document.querySelectorAll(".dropdown").forEach(el => el.remove());
		const dropdownInfo = [
			{
				"content": "수정",
				"action": () => {
					const contentElem = div.querySelector(".todo-content")
					contentElem.setAttribute("contenteditable", true);
					
					divFocus(contentElem);
				},
			},
			{
				"content": "삭제",
				"action": () => {
					const success = dbManager.removeTodo(todo);
					if (success) {
						div.remove();
					}
				}
			},
		];
		createDropdownElem(dropdownInfo, event.clientX, event.clientY);
	};

	// bind contextmenu to edit/delete
	div.addEventListener("contextmenu", (e) => {
		dropdownSetting(e);
	});

	// bind setting btn to edit/delete
	div.querySelector(".todo-setting").addEventListener('click', (e) => {
		dropdownSetting(e);
		e.stopPropagation();
	});

	// apply style
	div.querySelector(".todo-checkbox").style["accent-color"] = dbManager.getGoal(todo.goalId).color;
	return div;
}

function createDropdownElem(dropdownInfo, x, y) {
	const dropdownId = Math.random();
	const dropdownElem = document.createElement("div");
	dropdownElem.classList.add("dropdown");
	dropdownElem.id = "dropdown-" + dropdownId;
	dropdownElem.style.left = x + "px";
	dropdownElem.style.top = y + "px";

	dropdownInfo.forEach(({ content, action }) => {
		const selectElem = document.createElement("div");
		selectElem.classList.add("dropdown-select");
		selectElem.innerText = content;
		selectElem.addEventListener("click", () => {
			action();
		});
		dropdownElem.append(selectElem);
	});
	document.body.prepend(dropdownElem);
}


function init() {
	initSideBar();
	initCalender();
	initTodoList();
	setEventListeners();
}

function setEventListeners() {
	document.body.addEventListener("click", () => {
		document.querySelectorAll(".dropdown").forEach(el => el.remove());
	});
	document.getElementById("backup-btn").addEventListener("click", () => {
		dbManager.backupAsFile();
	});
	document.getElementById("load-backup-btn").addEventListener("click", (e) => {
		document.getElementById("load-backup-box").style.display = "flex";
		e.target.style.display = "none";
	});
	document.getElementById("load-backup-cancel").addEventListener("click", () => {
		document.getElementById("load-backup-btn").style.display = "block";
		document.getElementById("load-backup-box").style.display = "none";
	});
	document.getElementById("load-backup-input").addEventListener("change", () => {
		document.getElementById("load-backup-confirm").removeAttribute("disabled");
	});
	document.getElementById("load-backup-confirm").addEventListener("click", (e) => {
		e.target.blur();
		e.target.setAttribute("disabled", "");
		e.target.innerText = "로딩중...";

		const fileList = document.getElementById("load-backup-input").files;
		const reader = new FileReader();
		reader.readAsText(fileList[0]);
		reader.onload = () => {
			dbManager.loadDBFromFile(reader.result);
			alert("불러오기 완료!");
			location.reload();
		};
	});
}

function download(content, filename) {
	const uriContent = URL.createObjectURL(new Blob([content], {type: "text/plain"}));
	const link = document.createElement("a");
	link.setAttribute("href", uriContent);
	link.setAttribute("download", filename);
	link.click();
}

async function sibalDBjaljomMandeulji() {
	DB = {
		"goalData": {
			'0': {
				"id": 0,
				"name": "todo_test0",
				"color":"green",
			},
			'1': {
				"id": 1,
				"name": "todo_test1",
				"color":"red",
			},
		},
		"todoData": {
			"20230423": {
				"todos": {
					"0": {
						"id": 0,
						"date":"20230423",
						"content":"testtest",
						"done":false,
						"goalId":0
					},
					"2":{
						"id":2,
						"date":"20230423",
						"content":"test2test2",
						"done":true,
						"goalId":1
					}
				},
				"incompleteCnt":1
			},
			"20230424":{
				"todos":{
					"1":{
						"id":1,
						"date":"20230424",
						"content":"testtesttest",
						"done":true,
						"goalId":0
					},
					"3":{
						"id":3,
						"date":"20230424",
						"content":"duplicatetest",
						"done":true,
						"goalId":0
					}
				},
				"incompleteCnt":0
			}
		}
	};
	dbManager.commit();
}


async function loadData() {
	// sibalDBjaljomMandeulji();
	dbManager.loadDBFromLocalStorage();
}

function renderData() {
	renderCalender();
	renderTodoList();
}

window.onload = function() {
	init();
	loadData().then(() => {
		renderData();
	});
}


/*
기능 구현 사항

<TODO 내에서>
- todo crud

<list 단위>
- goal crud

<기타>
- 루틴 설정
- 사이드바
- 백업

*/