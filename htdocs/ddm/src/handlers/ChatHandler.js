import { APIURL, GET, POST, DEL } from "../utils/requests.js";
import UserHandler from "./UserHandler.js";
import {Chat} from "./Chat.js";
import { REPLY_PATTERN, TWO_DAY_MILLISECONDS } from "../utils/const.js";
import time from "../utils/time.js";

const ChatHandler = {
    url: `${APIURL}/chats.php`,
    latestChatId: 0,
    prevChatCount: -1,
    chats: [],  // chat or emoji objs
    
    async send(content, isReply) { 
        const { success, error } = this.validate(content, isReply);
        if (!success) {
            return { success, error };
        }

        const body = {};
        body.content = content;
        body.writer_user_id = UserHandler.currentUser.id;
        body.receiver_user_id = UserHandler.currnentPartner.id;
        
        try {
            const json = await POST(this.url, body);
            return json;
        } catch (error) {
            console.log("ERROR : ", error);
            return { success: false, error };
        }
    },

    async delete(chatId) {
        const body = { id: chatId };
        try {
            const json = await DEL(this.url, body);
            console.log("delete complete");
            return json;
        } catch (error) {
            console.log("ERROR : ", error);
            return {};
        }
    },

    async countMyChats() {
        const params = `?user=${UserHandler.currentUser.id}&chatUpdate=true`;
        const json = await GET(this.url + params);
        return json.count;
    },

    async getRecentChats(limit) {
        const params = `?user=${UserHandler.currentUser.id}&limit=${limit}&chatUpdate=true`;
        const json = await GET(this.url + params);
        const data = json.contents;
        data.sort((a, b) => a.id - b.id);
        return data;
    },
    
    // TODO long polling 구현 
    async loadAllChats() {
        console.log(`load all chat with cu: ${UserHandler.currentUser.name} & cp: ${UserHandler.currnentPartner.name}`);
        const res = await this.loadChats();
        this.chats = res.map(chatJson => Chat.create(chatJson));
    },

    async loadNewChats() {
        console.log(`load new chat with cu: ${UserHandler.currentUser.name} & cp: ${UserHandler.currnentPartner.name}`);
        const res = await this.loadChats(this.latestChatId);
        this.chats = this.chats.concat(res.map(chatJson => Chat.create(chatJson)));
    },

    async loadChats(previousLatestChatId=null) {
        let params = `?user=${UserHandler.currentUser.id}&partner=${UserHandler.currnentPartner.id}`;
        if (previousLatestChatId !== null) {
            params += `&latestChatId=${previousLatestChatId}`;
        }

        // contents -> id, content, writer_user_id, receiver_user_id, created_at / ordered by id
        const json = await GET(this.url + params);
        const data = json.contents;

        if (data.length > 0) {
            this.latestChatId = data[data.length - 1].id;
        }

        const res = [];
        data.forEach(chatJson => {
            // 이틀 이상 지난 채팅 삭제
            const creationTimeObj = time.toTimeObj(chatJson.created_at);
            if ((new Date()) - creationTimeObj >= TWO_DAY_MILLISECONDS) {
                this.delete(chatJson.id);
            } else {
                res.push(chatJson);
            }
        });

        return res;
    },

    existsUserAndPartner() {
        return !!UserHandler.currentUser && !!UserHandler.currnentPartner && (!UserHandler.currentUser.empty() && !UserHandler.currnentPartner.empty());
    },

    validate(content, isReply) {
        if (!this.existsUserAndPartner()) {
            return { success: false, error: "사용자 또는 상대방 정보가 없습니다."};
        }
        if (this.emptyContent(content)) {
            return { success: false, error: "내용을 입력해주십시오."};
        }
        if (!isReply && this.containsReplyPattern(content)) {
            return { success: false, error: "특정 기능에 사용되는 패턴이 포함되어 있습니다. ex) ``` "};
        }
        return { success: true, error: "" };
    },

    emptyContent(content) {
        return content.replace(" ", "").replace("\t", "").replace("\n", "") === "";
    },

    containsReplyPattern(content) {
        return content.split(REPLY_PATTERN).length > 1;
    }
};

export { ChatHandler as default };