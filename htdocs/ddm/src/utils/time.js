const time = {
    breakTimeStr(timeStr) {
        let key = ["year", "month", "date", "hours", "minutes", "seconds"];

		const tmp = timeStr.split(" ");
		const ary = tmp[0].split("-").concat(tmp[1].split(":"));

		const obj = {};
		key.forEach((k, idx) => {
			obj[k] = ary[idx];
		});

        return obj;
    },

    toTimeStr(dateObj) {
        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, 0);
        const date = dateObj.getDate().toString().padStart(2, 0);
        const hours = dateObj.getHours().toString().padStart(2, 0);
        const minutes = dateObj.getMinutes().toString().padStart(2, 0);
        const seconds = dateObj.getSeconds().toString().padStart(2, 0);

        return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
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

    toTimeNum(timeStr) {
        const splt = timeStr.split(" ");
        const front = splt[0].split("-");
        const back = splt[1].split(":");
        return parseInt(front.concat(back).join(""));
    },

    getDayStr(timeStr) {
        const dayList = ['일', '월', '화', '수', '목', '금', '토'];
        return dayList[this.toTimeObj(timeStr).getDay()];
    },
    isToday(timeStr) {
        return timeStr.substr(0, 10) === time.toTimeStr(new Date()).substr(0, 10);
    }
}

export { time as default };