import UserHandler from "../handlers/UserHandler.js";
import {Emoji} from "../handlers/Chat.js";
import time from "../utils/time.js";

export default class ChatBox extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        this.chat = null;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    margin: 10px;
                    margin-bottom: 20px;
                    display: flex;
                }

                .container {
                    width: fit-content;
                    display: flex;
                    flex-direction: column;
                }
                
                :host(.other) {
                    justify-content: flex-start;
                }
                
                :host(.self) {
                    justify-content: flex-end;
                }

                :host(.self) .chat-content {
                    background-color: #FEFE80;
                }

                :host(.self[info-change]) .chat-content:hover {
                    background: white;
                    cursor: pointer;
                }

                .chat-content-container {
                    display: flex;
                }

                .chat-emoji {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .chat-info {
                    margin-bottom: 3px;
                    display: flex;
                    justify-content: space-between;
                    gap: 3rem;
                    font-size: 0.9rem;
                }

                :host(.self) .chat-info {
                    justify-content: flex-end;
                }

                .chat-content {
                    padding: 10px;
                    font-size: 16px;
                    border: 1px solid black;
                    border-radius: 7px;
                    max-width: 20rem;
                    word-break: break-all;
                }

                .chat-content img {
                    max-height: 5rem;
                }
                
                .chat-reply {
                    margin-top: 5px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 15rem;
                    white-space: nowrap;
                }


            </style>
            <div class="container"></div>
        `;
        this.container = this.shadowRoot.querySelector(".container");
        this.chatController = document.querySelector("chat-controller");
        this.container.addEventListener("contextmenu", (e) => {
            // 기존의 dropdown 삭제
            this.chatController.onDropdownRemoveTrial();

            const dropdownInfo = [
                {
                    content: "답장",
                    action: () => {
                        this.chatController.setReplyOrToggle(this.chat.content);
                    },
                },
            ];
            this.chatController.createDropdown(dropdownInfo, e.clientX, e.clientY);
        });
    }

    setChat(chat) {
        this.id = "chat-" + chat.id;
        this.chat = chat;
        let innerHTML = "";
        if (chat.writer.id === UserHandler.currentUser.id) {
            this.classList.add("self");
            innerHTML = `
                <div class="chat-info">
                    <span class="chat-time">${this.getDisplayTime(chat.createdAt)}</span>
                </div>
            `;
        } else {
            this.classList.add("other");
            innerHTML = `
                <div class="chat-info">
                    <span class="chat-user">
                        <span class="chat-name">${chat.writer.name}</span>
                    </span>
                    <span class="chat-time">${this.getDisplayTime(chat.createdAt)}</span>
                </div>
            `;
        }

        if (chat.isReply) {
            innerHTML += `<div class="chat-reply">답장 : ${chat.replyOrig}</div>`;
        }

        if (chat instanceof Emoji) {
            innerHTML += `
            <div class="chat-content-container">
                <div class="chat-content chat-emoji">
                    <img src="${Emoji.getEmojiSrcByName(chat.content)}">
                </div>
            </div>
            `;
        } else {
            innerHTML += `<div class="chat-content-container"><div class="chat-content">${this.getEnterReplaced(chat.content)}</div></div>`;
        }
        this.container.innerHTML = innerHTML;
    }

    getDisplayTime(timestampFormat) {
        if (time.isToday(timestampFormat)) {
            const { hours, minutes } = time.breakTimeStr(timestampFormat);
            return `${hours}:${minutes}`;
        }

        const { month, date, hours, minutes } = time.breakTimeStr(timestampFormat);
        return `${month}-${date} ${hours}:${minutes}`;
    }

    // TODO better way
    getEnterReplaced(content) {
        while (content.includes("\n")) {
            content = content.replace("\n", "<br>");
        }
        return content;
        // return content.replaceAll("\n", "<br>");
    }
}