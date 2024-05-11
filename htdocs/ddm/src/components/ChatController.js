import ChatHandler from "../handlers/ChatHandler.js";
import LoaderHandler from "../handlers/LoaderHandler.js";
import UserHandler from "../handlers/UserHandler.js";
import {KEYCODE_ENTER, POP_UP_TIME, KEYCODE_SHIFT, REPLY_PATTERN} from "../utils/const.js";

export default class ChatController extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        width: calc(var(--main-width) - var(--user-list-width));
                        display: flex;
                        height: 200px;
                    }
                    
                    .content-container {
                        width: 80%;
                        display: flex;
                        flex-direction: column;
                    }

                    textarea {
                        height: 100%;
                        resize: none;
                        border: 2px solid black;
                        border-radius: 1rem;
                        padding: 0.5rem;
                        font-size: 1rem;
                        font-family: "kakao";
                    }
                    
                    textarea::placeholder {
                        color: #d0d0d0;
                        font-family: "kakao";
                    }
                    
                    input {
                        width: 10%;
                    }

                    .reply-container {
                        display: none;
                        justify-content: space-between;
                        height: fit-content;
                        border: 2px solid black;
                        border-radius: 1rem;
                        margin-bottom: 0.5rem;
                        padding: 0.1rem;
                    }

                    .reply-inner-container {
                        display: flex;
                    }

                    #reply-cancel {
                        height: 2rem;
                    }

                    #reply-header {
                        min-width: 5rem;
                    }

                    #reply-content {
                        font-weight: bold;
                        word-break: break-all;
                    }

                    input[type="button"] {
                        background: white;
                        border: 2px solid skyblue;
                        border-radius: 0.5rem;
                        cursor: pointer;
                    }

                    input[type="button"]:hover {
                        background: skyblue;
                        color: white;
                    }
                
                </style>

                <div class="content-container">
                    <div class="reply-container">
                        <div class="reply-inner-container">
                            <div id="reply-header">Reply to : &nbsp;</div>
                            <div id="reply-content"></div>
                        </div>
                        <button id="reply-cancel">ⓧ</button>
                    </div>
                    <textarea id="chat-input" name="chat-input" placeholder="let's chat!"></textarea>
                </div>
                <input type="button" id="send-btn" value="▲"/>
				<input type="button" id="emoji-btn" value="🙂"/>
        `;

        this.shiftPressed = false;
        this.dropdownActive = false;
        this.replyActive = false;

        this.chatInput = this.shadowRoot.getElementById("chat-input");
        this.replyContainer = this.shadowRoot.querySelector(".reply-container");
        this.replyContent = this.shadowRoot.getElementById("reply-content");
        this.replyRemoveBtn = this.shadowRoot.getElementById("reply-cancel");

        this.emojiContainer = document.querySelector("emoji-container");

        this.prevChatCount = -1;

        this.setEventListeners();
    }

    setEventListeners() {
        this.shadowRoot.getElementById("send-btn").addEventListener("click", () => {
            this.send();
        });

        // bind enter key
        this.chatInput.addEventListener("keydown", (e) => {
            if (e.keyCode === KEYCODE_ENTER) {
                if (!this.shiftPressed) {
                    e.preventDefault();
                    this.send();
                };
            }
        });

        this.shadowRoot.getElementById("emoji-btn").addEventListener("click", () => {
            document.querySelector("emoji-container").toggleAttribute("hidden");
        });

        
        //shift toggle
        document.body.addEventListener("keydown", key => {
            if (key.keyCode === KEYCODE_SHIFT) this.shiftPressed = true;
        });
        document.body.addEventListener("keyup", key => {
            if (key.keyCode === KEYCODE_SHIFT) this.shiftPressed = false;	
        });

        // unable right click
        document.body.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            return false;
        });

        // remove dropdown by click
        document.body.addEventListener("click", () => {
            this.onDropdownRemoveTrial();
        });

        // reply mode remove btn
        this.replyRemoveBtn.addEventListener("click", () => {
            this.onReplyContainerRemoveTrial();
        });
    }

    ensureListeningChatUpdate() {
        if (!LoaderHandler.listening) {
            this.listenChatUpdate();
        }
    }

    async listenChatUpdate() {
        // TODO 누군가와 대화중일 때 다른사람에게 톡이 오면??? + 내가 이 사용자와 대화하는 중에 다른 창을 켰을 때, 이 사람에게 톡이 오면??
        // 기본으로 깔아놓는다면, 내가 이 사람과 대화할 때 계속 창이 열릴텐데 이건 어떻게 컨트롤할까?? -> 이걸 택하고 예외처리하는게 제일 나아보이긴 함
        // 기본으로 깔면, 1분 사이에 이뤄진 채팅을 prevCount가 반영을 못해서, 1분마다 계속 뜰꺼임
        // TODO read 기준으로 하는게 더 나을수도? 채팅을 하다가, 다른걸 보면 그 사이 와도 잠수 상태가 되어야 반영되므로 알람이 안옴 
        console.log("start listening chat count");
        const count = await ChatHandler.countMyChats();
        // this.prevChatCount = count;
        this.updateChatCount(count);
        console.log("initial count: " + count);

        LoaderHandler.setNewUpdateListener(() => { 
            this.handleChatCount();
        });
    }

    async handleChatCount() {
        const count = await ChatHandler.countMyChats();
        console.log(count);

        // 이전 정보랑 다르면 window open
        if (this.prevChatCount !== -1 && this.prevChatCount !== count) {
            const numNewChats = count - this.prevChatCount;
            const res = await ChatHandler.getRecentChats(numNewChats);

            const writersSet = new Set();
            res.forEach(chat => writersSet.add(chat.writer_user_id));
            
            const writerNames = [];
            writersSet.forEach(writerId => {
                if (!UserHandler.currnentPartner || writerId !== UserHandler.currnentPartner.id) {
                    const user = UserHandler.getUserById(writerId);
                    if (user) {
                        writerNames.push(user.name);
                    }
                }
            });
            
            console.log(writerNames);
            if (writerNames.length > 0) {
                const writers = writerNames.join(",");
                console.log("set writers: " + writers);
                localStorage.setItem("writers", writers);
    
                const popupWidth = 820;
                const popupHeight = 80;
                const left = window.innerWidth - popupWidth;
                const top = window.innerHeight - popupHeight;
    
                const features = [
                    "width=" + popupWidth,
                    "height=" + popupHeight,
                    "scrollbars=no",
                    "top=" + top,
                    "left=" + left,
                ].join(",");
                window.open("./alert.html", "_blank", features);
            } else {
                console.log("remove writers")
                if (localStorage.hasOwnProperty("writers")) {
                    localStorage.removeItem("writers");
                }
            }
        }

        // this.prevChatCount = count;
        this.updateChatCount(count);
        LoaderHandler.setNewUpdateListener(() => { 
            this.handleChatCount();
        });
    }

    dropListeningChatUpdate() {
        console.log("drop listening chat count");
        LoaderHandler.resetUpdateListener();
    }

    updateChatCount(newChatCount) {
        this.prevChatCount = newChatCount;
    }

    send() {
        let content = this.chatInput.value;
        if (this.replyActive) {
            content = this.replyContent.innerText + REPLY_PATTERN + content;
        }
        // TODO flag 안넘기는 방법은 없나..
        ChatHandler.send(content, this.replyActive).then(({ success, error }) => {
            if (!success) {
                this.createPopup(error);
                return;
            }
            document.querySelector("chat-container").refreshBySend();
            this.chatInput.value = "";
            this.onReplyContainerRemoveTrial();
            this.onEmojiPreviewRemoveTrial();
        });   
    }
    
    createPopup(content, popupTime=POP_UP_TIME) {
        const popupId = Math.random();
        const popupElem = document.createElement("div");
        popupElem.classList.add("popup");
        popupElem.id = `popup-${popupId}`;
        popupElem.innerHTML = content;
        document.body.prepend(popupElem);
        
        setTimeout(() => { document.getElementById(`popup-${popupId}`).remove() }, popupTime);
    }

    createDropdown(dropdownInfo, x, y) {
        const dropwdownId = Math.random();
        const dropdownElem = document.createElement("div");
        dropdownElem.classList.add("dropdown");
        dropdownElem.id = `dropdown-${dropwdownId}`;
        dropdownElem.style.left = x + "px";
        dropdownElem.style.top = y + "px";

        // dropdown 메뉴가 많아질 때 확장 용이하게 
        dropdownInfo.forEach(({ content, action }) => {
            const selectElem = document.createElement("div");
            selectElem.classList.add("dropdown-select");
            selectElem.innerText = content;
            selectElem.addEventListener("click", () => {
                action();
            });
            dropdownElem.append(selectElem);
        });

        document.body.prepend(dropdownElem);
        this.dropdownActive = true;
    }

    onDropdownRemoveTrial() {
        if (this.dropdownActive) {
            document.querySelector(".dropdown").remove();
            this.dropdownActive = false;
        }
    }

    setReplyOrToggle(replyOrig) {
        if (this.replyActive && this.replyContent.innerText === replyOrig) {
            this.onReplyContainerRemoveTrial();
            return;
        }
        this.replyActive = true;
        this.replyContainer.style.display = "flex";
        this.replyContent.innerText = replyOrig;
        this.chatInput.focus();
    }

    onReplyContainerRemoveTrial() {
        this.replyActive = false;
        this.replyContainer.style.display = "none";
    }

    onEmojiPreviewRemoveTrial() {
        this.emojiContainer.setAttribute("preview-emoji", "none");
        this.chatInput.value = "";
    }

    setEmojiToInput(emojiName) {
        this.chatInput.value = ":" + emojiName + ":";
    }
}