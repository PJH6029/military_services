import {GET, DEL, PUT, APIURL } from "../utils/requests.js";

/**
 * @handler 사이드바 태스크 핸들러
 */
const meetingHandler = {
    logError(msg) {
        console.error(`Error: from meeting handler / ${msg}`);
    },
    
    logMsg(msg) {
        console.log(`Log: from meeting handler / ${msg}`);
    },

    async getAllMeetingMemos() {
        const res = await GET(`${APIURL}/api/meeting.php`);
        // if (!res.success) {
        //     this.logError("DB 모든 데이터 조회 실패");
        //     return {id: -1};
        // }
        return res.resultData;
    },

    async editMeetingMemo(info) {
        if (!info.ymd || !info.content) {
            this.logError("Invalid ymd");
            alert("Invalid ymd");
            return -1;
        }
        const res = await PUT(`${APIURL}/api/meeting.php`, info);
        if (!res.success) {
            this.logError("DB 데이터 수정 실패");
            this.logError(res.error);
            return -1;
        }
        return res.contents; // TODO 뭘 리턴할지
    },

    async removeMeetingMemo(ymd) {
        const res = await DEL(`${APIURL}/api/meeting.php`, { ymd });
        if (!res.success) {
            this.logError("DB 데이터 삭제 실패");
            this.logError(res.error);
            return -1;
        }
        return res.success; // TODO 뭘 리턴할지
    }
};

export {meetingHandler as default}