import {GET, POST, DEL, PUT, APIURL } from "../utils/requests.js";

/**
 * @handler 사이드바 태스크 핸들러
 */
const taskHandler = {
    logError(msg) {
        console.error(`Error: from task handler / ${msg}`);
    },
    
    logMsg(msg) {
        console.log(`Log: from task handler / ${msg}`);
    },

    async getTask(id) {
        const res = await GET(`${APIURL}/api/task.php?id=${id}`);
        // if (!res.success) {
        //     this.logError("DB 데이터 조회 실패, id: " + id);
        //     return {id: -1};
        // }
        return res.contents;
    },

    async getAllTasks() {
        const res = await GET(`${APIURL}/api/task.php`);
        // if (!res.success) {
        //     this.logError("DB 모든 데이터 조회 실패");
        //     return {id: -1};
        // }
        return res.contents;
    },

    async addTask(name) {
        if (!name) {
            this.logError("Invalid name");
            alert("이름을 다시 확인해주세요");
            return -1;
        }
        const res = await POST(`${APIURL}/api/task.php`, { name });
        if (!res.success) {
            this.logError("DB 데이터 추가 실패");
            this.logError(res.error);
            return -1;
        }
        return res.contents; // TODO 뭘 리턴할지
    },

    async editTask(id, name) {
        if (!name) {
            this.logError("Invalid name");
            alert("이름을 다시 확인해주세요");
            return -1;
        }
        const res = await PUT(`${APIURL}/api/task.php`, { id, name });
        if (!res.success) {
            // TODO 성공적인 query여도 수정사항이 없으면 안 바뀜
            this.logError("DB 데이터 수정 실패");
            this.logError(res.error);
            return -1;
        }
        return res.contents; // TODO 뭘 리턴할지
    },

    async removeTask(id) {
        const res = await DEL(`${APIURL}/api/task.php`, { id });
        if (!res.success) {
            this.logError("DB 데이터 삭제 실패");
            this.logError(res.error);
            return -1;
        }
        return res.success; // TODO 뭘 리턴할지
    }
};

export {taskHandler as default}