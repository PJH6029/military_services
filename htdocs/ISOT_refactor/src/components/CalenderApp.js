import { GET, DEL, PUT, POST, APIURL } from "../utils/requests.js";
import { time } from "../utils/time.js";


export  class CalenderApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#calender-template").innerHTML;

        this.$table = this.shadowRoot.querySelector("table");
        // this.$headerRow = this.shadowRoot.querySelector(".header-row");
        this.$dayRow = this.shadowRoot.querySelector(".day-row");

        this.$calenderContaier = this.shadowRoot.querySelector(".calender-container");

        this.displayInitialDate = new Date();
        this.startDate = new Date();
        this.initDate();

        this.displayInitialDateWeek = new Date();
        this.initDateWeek();

        this.calenderData = {};
        this.maxRow = 6;
        this.numDays = 7;
        this.dayList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        this.$prevMonthBtn = this.shadowRoot.querySelector("#prev-month-area");
        this.$nextMonthBtn = this.shadowRoot.querySelector("#next-month-area");
        this.$todayBtn = this.shadowRoot.querySelector("#today-btn");
        this.$howToUseBtn = this.shadowRoot.querySelector("#how-to-use-btn");
        this.$howToUseCloseBtn = this.shadowRoot.querySelector("#how-to-use-close-btn");
        this.$numbersBtn = this.shadowRoot.querySelector("#numbers-btn");

        this.isWeekCurrent = true;
        this.checkBox = this.shadowRoot.querySelector(".checkbox");
        this.checkBox.addEventListener("click", () => {
            if (!this.checkBox.checked) {
                // 월
                this.renderCalender(true);
            } else {
                // 주
                this.renderCalender();
            }
        });

        this.$prevMonthBtn.addEventListener("click", (e) => {
            if (this.isWeekCurrent) {
                this.movePrevWeek();
            } else {
                this.movePrevMonth();
            }
            this.renderCalender(this.isWeekCurrent);
        });
        
        this.$nextMonthBtn.addEventListener("click", (e) => {
            if (this.isWeekCurrent) {
                this.moveNextWeek();
            } else {
                this.moveNextMonth();
            }
            this.renderCalender(this.isWeekCurrent);
        });

        this.$todayBtn.addEventListener("click", (e) => {
            if (this.isWeekCurrent) {
                this.initDateWeek();
            } else {
                this.initDate();
            }
            this.renderCalender(this.isWeekCurrent);
        });

        this.$howToUseBtn.addEventListener("click", (e) => {
            this.$howToUseBtn.toggleAttribute("desc");
            if (this.$howToUseBtn.hasAttribute("desc")) {
                // TODO find better way 
                setTimeout(() => {
                    this.$howToUseBtn.innerText = ""; // security issue
                }, 210);
            } else {
                this.$howToUseBtn.innerText = "How to Use";
            }
        });

        // TODO UI
        this.$numbersBtn.addEventListener("click", (e) => {
            alert(`
            `); // security issue
        });

        // TODO backup?
        // this.initCalender();
        this.initWeekCalender();
        this.loadCalenderData().then(() => {
            console.log("Loading calender data finished");
            this.renderCalender(true);
        });
    }

    initDate() {
        const today = new Date();
        const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.startDate = monthStartDate;
        this.displayInitialDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() - this.startDate.getDay());
    }

    initDateWeek() {
        const today = new Date();
        const weekStartkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        this.displayInitialDateWeek = weekStartkDate;
    }

    movePrevMonth() {
        this.startDate.setMonth(this.startDate.getMonth() - 1);
        this.displayInitialDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() - this.startDate.getDay());
    }

    moveNextMonth() {
        this.startDate.setMonth(this.startDate.getMonth() + 1);
        this.displayInitialDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() - this.startDate.getDay());
    }

    movePrevWeek() {
        this.displayInitialDateWeek = new Date(this.displayInitialDateWeek.getFullYear(), this.displayInitialDateWeek.getMonth(), this.displayInitialDateWeek.getDate() - 7);
    }

    moveNextWeek() {
        this.displayInitialDateWeek = new Date(this.displayInitialDateWeek.getFullYear(), this.displayInitialDateWeek.getMonth(), this.displayInitialDateWeek.getDate() + 7);
    }
    
    renderCalender(week=false) {
        if (week) {
            if (!this.isWeekCurrent) this.initWeekCalender();
            this.renderWeekCalender();
            this.isWeekCurrent = true;
        } else {
            if (this.isWeekCurrent) this.initMonthCalender();
            this.renderMonthCalender();
            this.isWeekCurrent = false;
        }
    }

    renderWeekCalender() {
        const weekList = [];
        for (let i = 0; i < this.numDays; i++) {
            let d = new Date(this.displayInitialDateWeek);
            d.setDate(this.displayInitialDateWeek.getDate() + i);
            weekList.push(d);
        }

        weekList.forEach((d, i) => {
            const div = this.$calenderContaier.querySelector(`.week:nth-child(${i+1})`);
            div.querySelector(".date").innerText = d.getDate() == 1 ? `${d.getMonth() + 1}. ${d.getDate()}` : `${d.getDate()}`;
            
            const memo = div.querySelector("calender-data");

            div.removeAttribute("today");
            memo.removeAttribute("today");
            if (time.toTimeStr(d, false) === time.toTimeStr(new Date(), false)) {
                div.setAttribute("today", "");
                div.querySelector("calender-data").setAttribute("today", "");
            }

            memo.info = { ymd: time.toTimeStr(d, false) };
            memo.value = this.calenderTxtData[time.toTimeStr(d, false)] ?? "";
        })
        this.$calenderContaier.querySelector(`.week:nth-child(7)`).style.display = "none";
        this.$calenderContaier.querySelector(`.week:nth-child(1)`).style.display = "none";
    }

    renderMonthCalender() {
        // if (!calender.data) return; TODO
        this.weekList = [];
        for (let i = 0; i < this.maxRow; i++) {
            let week = [];
            for (let j = 0; j < this.numDays; j++) {
                let d = new Date(this.displayInitialDate);
                d.setDate(this.displayInitialDate.getDate() + i * this.numDays + j);
                week.push(d);
            }
            this.weekList.push(week);
        }

        let startDateList = [];
        const weekRows = this.$table.querySelectorAll(".week-row");
        const descRows = this.$table.querySelectorAll(".desc-row");
        const memoRows = this.$table.querySelectorAll(".memo-row");

        this.weekList.forEach((week, i) => {
            const weekRow = [...weekRows[i].querySelectorAll("td")];
            const descRow = [...descRows[i].querySelectorAll("td")];
            const memoRow = [...memoRows[i].querySelectorAll("td")];
            week.forEach((d, j) => {
                const weekTd = weekRow[j];
                const descTd = descRow[j];
                const memoTd = memoRow[j];

                weekTd.innerText = d.getDate() == 1 ? `${d.getMonth() + 1}. ${d.getDate()}` : `${d.getDate()}`;

                weekTd.removeAttribute("today");
                descTd.children[0].removeAttribute("today");
                memoTd.children[0].removeAttribute("today");
                if (time.toTimeStr(d, false) === time.toTimeStr(new Date(), false)) {
                    weekTd.setAttribute("today", "");
                    descTd.children[0].setAttribute("today", ""); // ㅏㅏ 왜 이렇게 짰지.. 이미 건너버린 강
                    memoTd.children[0].setAttribute("today", "");
                }

                if (d.getDate() == 1) {
                    startDateList.push([d, i]);
                }

                if (j == 0) {
                    weekTd.setAttribute("sun", "");
                    descTd.setAttribute("sun", "");
                    memoTd.setAttribute("sun", "");
                } else if (j == 6) {
                    weekTd.setAttribute("sat", "");
                    descTd.setAttribute("sat", "");
                    memoTd.setAttribute("sat", "");
                }

                weekTd.removeAttribute("before");
                weekTd.removeAttribute("after");
                descTd.children[0].removeAttribute("before");
                descTd.children[0].removeAttribute("after");
                memoTd.children[0].removeAttribute("before");
                memoTd.children[0].removeAttribute("after");

                if (parseInt(time.toTimeStr(d, false).slice(0, 6)) < parseInt(time.toTimeStr(this.startDate, false).slice(0, 6))) {
                    weekTd.setAttribute("before", "");
                    descTd.children[0].setAttribute("before", "");
                    memoTd.children[0].setAttribute("before", "");
                } else if (parseInt(time.toTimeStr(d, false).slice(0, 6)) > parseInt(time.toTimeStr(this.startDate, false).slice(0, 6))) {
                    weekTd.setAttribute("after", "");
                    descTd.children[0].setAttribute("after", "");
                    memoTd.children[0].setAttribute("after", "");
                }


                descTd.children[0].info = { userName: "calender", ymd: time.toTimeStr(d, false) };
                descTd.children[0].value = this.calenderData[time.toTimeStr(d, false)] ?? "";

                memoTd.children[0].info = { ymd: time.toTimeStr(d, false) };
                memoTd.children[0].value = this.calenderTxtData[time.toTimeStr(d, false)] ?? "";
            });
        });
    }

    addWeekRow(idx) {
        const weekRow = document.createElement("tr");
        weekRow.className = "week-row";
        weekRow.id = `calender-week${idx}`;

        for (let i = 0; i < this.numDays; i++) {
            const td = document.createElement("td");
            td.id = `date-idx-${idx}-${i}`;
            weekRow.appendChild(td);
        }

        const descRow = document.createElement("tr");
        descRow.className = "desc-row";

        for (let i = 0; i < this.numDays; i++) {
            const td = document.createElement("td");
            td.id = `desc-idx-${idx}-${i}`;
            const sel = document.createElement("date-desc");
            td.appendChild(sel);
            descRow.appendChild(td);
        }

        const memoRow = document.createElement("tr");
        memoRow.className = "memo-row";

        for (let i = 0; i < this.numDays; i++) {
            const td = document.createElement("td");
            const sel = document.createElement("calender-data");
            td.appendChild(sel);
            memoRow.appendChild(td);
        }

        this.$table.appendChild(weekRow);
        this.$table.appendChild(descRow);
        this.$table.appendChild(memoRow);
    }

    initMonthCalender() {
        this.$calenderContaier.innerHTML = `<table><tr class="day-row"></tr></table>`;
        this.$calenderContaier.removeAttribute("week");
        this.$table = this.shadowRoot.querySelector("table");
        this.$dayRow = this.shadowRoot.querySelector(".day-row");
        this.dayList.forEach((day, i) => {
            const td = document.createElement("td");
            td.innerText = day;

            td.removeAttribute("sun", "");
            td.removeAttribute("sat", "");
            if (i === 0) td.setAttribute("sun", "");
            if (i === 6) td.setAttribute("sat", "");
            this.$dayRow.appendChild(td);
        });

        for (let i = 0; i < this.maxRow; i++) {
            this.addWeekRow(i);
        }
    }

    initWeekCalender() {
        this.$calenderContaier.innerHTML = "";
        this.$calenderContaier.setAttribute("week", "");
        this.dayList.forEach((day, i) => {
            const div = document.createElement("div");
            div.classList.add("week");
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("week-info", "day");
            dayDiv.innerText = day;

            const dateDiv = document.createElement("div");
            dateDiv.classList.add("week-info", "date");
            dateDiv.innerText = 30;

            const calenderData = document.createElement("calender-data");
            calenderData.setAttribute("week", "");

            if (i === 0) {
                dayDiv.setAttribute("sun", "");
                dateDiv.setAttribute("sun", "");
            }
            if (i === 6) {
                dayDiv.setAttribute("sat", "");
                dateDiv.setAttribute("sat", "");
            }

            div.append(dayDiv, dateDiv, calenderData);
            this.$calenderContaier.appendChild(div);
        });
    }

    async loadCalenderData() {
        const calenderTxtRes = await GET(`${APIURL}/api/calender.php`);
        this.calenderTxtData = calenderTxtRes.resultData ?? {};
    }
}