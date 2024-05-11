const time = {
    breakTimeStr(timeStr, full=true) {
        if (!full) {
            timeStr += "000000";
        }
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
    toTimeStr(dateObj, full=true) {
        const front = dateObj.getFullYear() + (dateObj.getMonth() + 1).toString().padStart(2, 0) + dateObj.getDate().toString().padStart(2, 0);
        const back = dateObj.getHours().toString().padStart(2, 0) + dateObj.getMinutes().toString().padStart(2, 0) + dateObj.getSeconds().toString().padStart(2, 0);
        return full ? front + back : front;
    },
    toTimeObj(timeStr, full=true) {
        let timeObj = new Date();
        const { year, month, date, hours, minutes, seconds } = this.breakTimeStr(timeStr, full);
        
        year && timeObj.setFullYear(year);
        month && timeObj.setMonth(month-1);
        date && timeObj.setDate(date);
        hours && timeObj.setHours(hours);
        minutes && timeObj.setMinutes(minutes);
        seconds && timeObj.setSeconds(seconds);
        return timeObj;
    },
    getDayStr(timeStr, full=true) {
        const dayList = ['일', '월', '화', '수', '목', '금', '토'];
        return dayList[this.toTimeObj(timeStr, full).getDay()];
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
    },
    dateDiffInDay(d1, d2) {
        const diff = Math.abs(d1 - d2);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    },
}