/**
 * @handler 시간관련 툴
 */
const time = {
/**
 * 
 * @param {string} timeStr YYYYMMDDHHmmss
 * @returns {object} timeobj
 */
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

    toTimeStrFromDB(timeDBStr) {
        const splt = timeDBStr.split(" ");
        const front = splt[0].split("-");
        const back = splt[1].split(":");
        return front.concat(back).join("");
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
    }
};

export {time as default}