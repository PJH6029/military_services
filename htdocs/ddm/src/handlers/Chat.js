import UserHandler from "./UserHandler.js";
import { REPLY_PATTERN, EMOJI_LIST, EMOJI_PATH } from "../utils/const.js";

export class Chat {
    constructor(chatJson) {
        this.id = chatJson.id;
        this.writer = UserHandler.getUserById(chatJson.writer_user_id);
        this.receiver = UserHandler.getUserById(chatJson.receiver_user_id);
        this.createdAt = chatJson.created_at;
        this.content = chatJson.content;

        this.isReply = Chat.isReply(chatJson);
        this.replyOrig = Chat.getReplyOrigFromContent(this.content);
        if (this.isReply) this.content = Chat.getReplyContentFromContent(this.content);
    }

    static create(chatJson) {
        if (Chat.isEmoji(chatJson)) {
            return new Emoji(chatJson);
        } else {
            return new Chat(chatJson);
        }
    }

    static isReply(chatJson) {
        return chatJson.content.split(REPLY_PATTERN).length > 1;
    }

    static getReplyOrigFromContent(content) {
        return content.split(REPLY_PATTERN)[0] || "";
    }

    static getReplyContentFromContent(content) {
        return content.split(REPLY_PATTERN)[1] || "";
    }

    static isEmoji(chatJson) {
        let contentWithReplyOrigTrimmed = "";
        if (Chat.isReply(chatJson)) {
            contentWithReplyOrigTrimmed = Chat.getReplyContentFromContent(chatJson.content);
        } else {
            contentWithReplyOrigTrimmed = chatJson.content;
        }
        return Chat._isEmojiFormat(contentWithReplyOrigTrimmed) && Chat._validateEmoji(contentWithReplyOrigTrimmed);
    }

    static _isEmojiFormat(content) {
        return (content.startsWith(":") && content.endsWith(":"));
    }

    static _validateEmoji(content) {
        return EMOJI_LIST.some(emojiFileName => Chat.foundEmojiFile(emojiFileName, content));
    }

    static foundEmojiFile(emojiFileName, content) {
        return content.replace(":", "").replace(":", "") === emojiFileName.split(".")[0];
    }
}

export class Emoji extends Chat {
    constructor(chatJson) {
        super(chatJson);
        // this.content = this.getEmojiNameFromContent(this.content);
    }

    // getEmojiNameFromContent(content) {
    //     return content.replace(":", "").replace(":", "") || "";
    // }

    static getEmojiSrc(emojiName, emojiType) {
        return `${EMOJI_PATH}${emojiName}.${emojiType}`;
    }

    
    static getEmojiSrcByFileName(emojiFileName) {
        return `${EMOJI_PATH}${emojiFileName}`;
    }

    static getEmojiSrcByName(emojiName) {
        const parsedEmojiName = emojiName.replace(":", "").replace(":", "");
        return this.getEmojiSrc(parsedEmojiName, this.getEmojiTypeFromEmojiList(parsedEmojiName));
    }

    static getEmojiTypeFromEmojiList(parsedEmojiName) {
        for (let i = 0; i < EMOJI_LIST.length; i++) {
            if (parsedEmojiName === EMOJI_LIST[i].split(".")[0]) {
                return EMOJI_LIST[i].split(".")[1];
            }
        }
    }

}