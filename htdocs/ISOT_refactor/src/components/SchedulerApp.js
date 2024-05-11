import { GET, DEL, PUT, POST, APIURL } from "../utils/requests.js";
import { time } from "../utils/time.js";

export class SchedulerApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#scheduler-template").innerHTML;

        this.$table = this.shadowRoot.querySelector("table");
        this.$monthRow = this.shadowRoot.querySelector(".month-row");
        this.$dateRow = this.shadowRoot.querySelector(".date-row");
        this.$gapRow = this.shadowRoot.querySelector(".gap-row");

        this.$currentMonthBtn = this.shadowRoot.querySelector("#scheduler-current-month-btn");
        this.$nextMonthBtn = this.shadowRoot.querySelector("#scheduler-next-month-btn");
        this.$todayBtn = this.shadowRoot.querySelector("#scheduler-today-btn");

        this.displayInitialDate = new Date();
        this.displayInitialDate.setDate(this.displayInitialDate.getDate() - 4);
        this.startDate = new Date(this.displayInitialDate.getFullYear(), this.displayInitialDate.getMonth(), 1);

        this.scheduleData = {};
        this.calenderData = {};
        this.maxCount = 25;

        this.addEventListener("wheel", (e) => {
            document.activeElement.blur();
            this.displayInitialDate.setDate(this.displayInitialDate.getDate() + (e.deltaY > 0 ? 1 : -1));
            this.renderSchedule();
        });

        this.$currentMonthBtn.addEventListener("click", (e) => {
            this.moveCurrentMonth();
            this.renderSchedule();
        });

        this.$nextMonthBtn.addEventListener("click", (e) => {
            this.moveNextMonth();
            this.renderSchedule();
        });

        this.$todayBtn.addEventListener("click", (e) => {
            this.displayInitialDate = new Date();
            this.displayInitialDate.setDate(this.displayInitialDate.getDate() - 4);
            this.renderSchedule();
        });

        this.initScheduleData();
    }

    moveCurrentMonth() {
        this.startDate = new Date(this.displayInitialDate.getFullYear(), this.displayInitialDate.getMonth(), 1);
        if (this.displayInitialDate.getDate() === 1) {
            this.startDate.setMonth(this.startDate.getMonth() - 1);
        }
        this.displayInitialDate = new Date(this.startDate);
    }

    moveNextMonth() {
        this.startDate = new Date(this.displayInitialDate.getFullYear(), this.displayInitialDate.getMonth(), 1);
        this.startDate.setMonth(this.startDate.getMonth() + 1);
        this.displayInitialDate = new Date(this.startDate);
    }
 
    addScheduleRow() {
        const scheduleRow = document.createElement("tr");
        scheduleRow.className = "schedule-row";

        const nameTd = document.createElement("td");
        nameTd.className = "name-td";

        scheduleRow.appendChild(nameTd);

        for (let i = 0; i < this.maxCount; i++) {
            const td = document.createElement("td");
            td.appendChild(document.createElement("schedule-sel"));
            scheduleRow.appendChild(td);
        }

        const descRow = document.createElement("tr");
        descRow.className = "desc-row";

        const personDescTd = document.createElement("td");
        
        descRow.appendChild(personDescTd);

        for (let i = 0; i < this.maxCount; i++) {
            const td = document.createElement("td");
            const sel = document.createElement("schedule-sel");
            sel.setAttribute("desc", "");
            td.appendChild(sel);
            descRow.appendChild(td);
        }

        this.$table.appendChild(scheduleRow);
        this.$table.appendChild(descRow);
    }

    async initScheduleData() {
        const userListRes = await GET(`${APIURL}/api/schedule.php?type=userList`);
        const userList = userListRes.resultData;

        for (let i = 0; i < this.maxCount; i++) {
            this.$monthRow.appendChild(document.createElement("td"));
            this.$dateRow.appendChild(document.createElement("td"));
        }

        for (let i = 0; i < this.maxCount + 1; i++) {
            const td = document.createElement("td");
            this.$gapRow.appendChild(td);
            if (i === 0) continue;
            const sel = document.createElement("schedule-sel");
            sel.setAttribute("calender", "");
            td.appendChild(sel);
        }

        for (let i = 0; i < userList.length; i++) {
            this.addScheduleRow();

            const scheduleRes = await GET(`${APIURL}/api/schedule.php?userName=${userList[i].name}`);
            // const infoRes = await GET(`${APIURL}/api/schedule.php?type=info&userName=${nameList[i]}`);

            this.scheduleData[userList[i].name] = { schedule: scheduleRes.resultData, info: userList[i] };
        }

        [{ type: "오전", color: "#ff9800" }, { type: "오후", color: "#3f51b5" }, { type: "주간", color: "#009688" }, { type: "야간", color: "#9c27b0" }].forEach(({ type, color }) => {
            const row = document.createElement("tr");
            row.setAttribute("counting", "");
            row.style["color"] = color;
            for (let i = 0; i < this.maxCount + 1; i++) {
                const td = document.createElement("td");
                if (i === 0) td.innerText = type;
                row.appendChild(td);
            }
            this.$table.appendChild(row);
        });

        this.scheduleInfo = {};
        this.updateScheduleInfo();

        const calenderRes = await GET(`${APIURL}/api/schedule.php?type=calender`);
        this.calenderData = calenderRes.resultData ?? {};

        this.renderSchedule();
    }

    updateScheduleInfo() {
        [{ type: "오전", searchName: "오전" }, { type: "오후", searchName: "오후" }, { type: "주간", searchName: "주" }, { type: "야간", searchName: "야" }].forEach(({ type, searchName }) => {
            let dList = Object.entries(this.scheduleData).map(([key, { schedule }]) => {
                return schedule.map(({ ymd }) => ymd);
            });
            let max = 0;
            let maxList = [];
            dList.forEach((list) => {
                if (list.length > max) {
                    max = list.length;
                    maxList = [...list];
                }
            });
            dList = [...maxList];
            dList.forEach((date) => {
                const count = Object.entries(this.scheduleData).filter(([key, { schedule }]) => {
                    const s = schedule.find(({ ymd }) => ymd === date);
                    return s && s.value === searchName;
                }).length;
                
                this.scheduleInfo[date] = { ...this.scheduleInfo[date], [type]: count };
            });
        });
    }

    renderScheduleInfo() {
        this.$table.querySelectorAll("tr[counting]").forEach((tr) => {
            const type = tr.querySelectorAll("td")[0].innerText;
            tr.querySelectorAll("td").forEach((td, i) => {
                if (i !== 0) {
                    const info = this.scheduleInfo[time.toTimeStr(this.dateList[i-1], false)];
                    td.innerText = info ? info[type] : "";
                }
            });
        });
    }

    async renderSchedule() {
        if (!this.scheduleData) return;

        this.$monthRow.children[0].innerHTML = '<td>Recent.</td>';
        this.$dateRow.children[0].innerHTML = '<td>07.16</td>';

        this.dateList = [];
        for (let i = 0; i < this.maxCount; i++) {
            let c = new Date(this.displayInitialDate);
            c.setDate(this.displayInitialDate.getDate() + i);
            this.dateList.push(c);
        }

        this.dateList.forEach((d, index) => {
            const td = this.$dateRow.children[index + 1];
            td.innerText = d.getDate();

            td.removeAttribute("sun", "");
            td.removeAttribute("sat", "");
            if (d.getDay() === 0) td.setAttribute("sun", "");
            if (d.getDay() === 6) td.setAttribute("sat", "");

            const upper = this.$monthRow.children[index + 1];
            upper.innerText = d.getDate() == 1 ? `${d.getMonth() + 1}월` : '';

            const gap = this.$gapRow.children[index + 1];
            gap.children[0].removeAttribute("today");

            if (time.toTimeStr(d, false) === time.toTimeStr(new Date(), false)) {
                upper.innerText = "✨";
                gap.children[0].setAttribute("today", "");
            }

            gap.children[0].info = { userName: "calender", ymd: time.toTimeStr(d, false) };
            gap.children[0].value = this.calenderData[time.toTimeStr(d, false)] ?? "";
        });

        let count = 0;
        Object.entries(this.scheduleData).sort((a, b) => a[1].info.endDate - b[1].info.endDate).forEach(([userName, { schedule, info }]) => {
            if (parseInt(time.toTimeStr(this.displayInitialDate, false)) <= parseInt(info.endDate)) {
                let nameTd = [...this.$table.querySelectorAll(".name-td")];
                if (!nameTd[count]) {
                    this.addScheduleRow();
                    nameTd = [...this.$table.querySelectorAll(".name-td")];

                    const trList = this.$table.querySelectorAll("tr");
                    if (!trList[trList.length - 1].hasAttribute("counting")) {
                        this.$table.querySelectorAll("tr[counting]").forEach((c) => {
                            this.$table.appendChild(c);
                        });
                    }
                }

                nameTd[count].innerText = userName;

                const scheduleRow = [...this.$table.querySelectorAll(".schedule-row")[count].querySelectorAll("td")];
                scheduleRow.shift();

                const descRow = [...this.$table.querySelectorAll(".desc-row")[count].querySelectorAll("td")];
                const personDesc = descRow.shift();
                
                for (let i = 0; i < this.maxCount; i++) {
                    const iDate = new Date(this.displayInitialDate);
                    iDate.setDate(iDate.getDate() + i);

                    const isToday = time.toTimeStr(iDate, false) === time.toTimeStr(new Date(), false);

                    scheduleRow[i].childNodes[0].removeAttribute("today");
                    descRow[i].childNodes[0].removeAttribute("today");

                    if (isToday) {
                        scheduleRow[i].childNodes[0].setAttribute("today", "");
                        descRow[i].childNodes[0].setAttribute("today", "");
                    }

                    scheduleRow[i].childNodes[0].info = { userName, ymd: time.toTimeStr(iDate, false) };
                    descRow[i].childNodes[0].info = { userName, ymd: time.toTimeStr(iDate, false) };
                    
                    personDesc.innerText = info.grade + "기";

                    const d = schedule.find(({ ymd }) => ymd === time.toTimeStr(iDate, false));
                    const val = d?.value;
                    const desc = d?.description;

                    scheduleRow[i].childNodes[0].value = val ?? "";
                    descRow[i].childNodes[0].value = desc ?? "";
                }

                count++;
            }
        });

        const tdLen = this.$table.querySelectorAll(".schedule-row").length;
        if (tdLen > count) {
            const delCount = tdLen - count;
            for (let i = 0; i < delCount; i++) {
                this.$table.querySelectorAll(".schedule-row")[tdLen - 1 - i].remove();
                this.$table.querySelectorAll(".desc-row")[tdLen - 1 - i].remove();
            }
        }

        this.renderScheduleInfo();
    }
}