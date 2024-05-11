import {GET, POST, DEL, PUT, APIURL } from "../utils/requests.js";

/**
 * @handler 사이드바 태스크 핸들러
 */
const cardHandler = {
    logError(msg) {
        console.error(`Error: from card handler / ${msg}`);
    },
    
    logMsg(msg) {
        console.log(`Log: from card handler / ${msg}`);
    },

    validated({title, content, progress, schedule_start, schedule_end, schedule_day}) {
        try {
            // required
            const test1 = title && content && (0 <= progress && progress < 3);

            // non-required
            const test2 = (!schedule_start || this.validDate(schedule_start)) && (!schedule_end || this.validDate(schedule_end));
            const res = test1 && test2;
            if (!res) {
                console.log({task_id, title, content, progress, schedule_start, schedule_end, schedule_day});
            }
            return res;
        } catch (error) {
            this.logError("Exception while validating inputs");
            this.logError(error);
            return false;
        }
    },

    validDate(val) {
        return /\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d/.test(val);
    },

    async getCard(id) {
        const res = await GET(`${APIURL}/api/card.php?id=${id}`);
        return res.contents;
    },

    async getAllCards() {
        const res = await GET(`${APIURL}/api/card.php`);
        return res.contents;
    },

    async getAllCardsOfDay(day) {
        const res = await GET(`${APIURL}/api/card.php?today=${day}`);
        return res.contents;
    },

    async getAllCardsOfTask(taskId) {
        const res = await GET(`${APIURL}/api/card.php?task_id=${taskId}`);
        return res.contents;
    },

    async addCard(newCard) {
        if (!this.validated(newCard)) {
            this.logError("Invalid input");
            alert("입력란을 다시 확인해주세요");
            return -1;
        }
        const res = await POST(`${APIURL}/api/card.php`, newCard);
        if (!res.success) {
            this.logError("DB 데이터 추가 실패");
            this.logError(res.error);
            return -1;
        }
        return res.contents;
    },

    async editCard(card) {
        if (!this.validated(card)) {
            this.logError("Invalid input");
            alert("입력란을 다시 확인해주세요");
            return -1;
        }
        const res = await PUT(`${APIURL}/api/card.php`, card);
        if (!res.success) {
            this.logError("DB 데이터 수정 실패");
            this.logError(res.error);
            return -1;
        }
        return res.contents;
    },

    async removeCard(id) {
        const res = await DEL(`${APIURL}/api/card.php`, { id });
        if (!res.success) {
            this.logError("DB 데이터 삭제 실패");
            this.logError(res.error);
            return -1;
        }
        return res.success;
    }
};

export {cardHandler as default}