import ChatHandler from "../handlers/ChatHandler.js";
import LoaderHandler from "../handlers/LoaderHandler.js";
import UserHandler from "../handlers/UserHandler.js";
import { UPDATE_TIME_OUT_CNT } from "../utils/const.js";

export default class ChatContainer extends HTMLElement {
    static get observedAttributes() {
        return ["partner-id"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.loadingHTML = `
            <div id="loading">
                <span id="loading-text">대화 상대방을 선택하세요</span>
            </div>
        `;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    width: var(--container-width);
                    border: 2px solid black;
                    border-radius: 1rem;
                    position: relative;
                }

                #loading {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                #loading-text {
                    padding: 1rem;
                }

                .inner-chat-container {
                    overflow: auto;
                    height: 500px;
                }

                .inner-chat-container::-webkit-scrollbar {
                    display: none;
                }

                .emoji-preview-container {
                    position: absolute;
                    top: 0px;
                    right: 0px;
                    display: none;
                    z-index: 10;
                }
                
                #emoji-preview-img {
                    position: absolute;
                    right: 0px;
                    width: 20rem;
                    max-height: 300px;
                    border: 1px solid black;
                    opacity: 0.4;
                }
                
                #emoji-preview-cancel {
                    position: absolute;
                    top: -3px;
                    right: 2px;
                    width: 30px;
                    height: 30px;
                    font-size: 18px;
                    background: none;
                    border: none;
                }

                #to-bottom-btn {
                    cursor: pointer;
                    position: absolute;
                    left: 19rem;
                    bottom: 1rem;
                    transition: 0.2s ease-in-out;
                    justify-content: center;
                    align-items: center;
                    width: 2rem;
                    height: 1.5rem;
                    border: 1px solid black;
                    border-radius: 1rem;
                    background: white;
                    display: none;
                }

                #to-bottom-btn[show] {
                    display: flex;
                }

                #to-bottom-btn:hover {
                    transform: translateY(2px);
                    background: skyblue;
                }

                #to-bottom-btn svg {
                    transform: rotate(180deg);
                    fill: black;
                }
            </style>

            <div class="inner-chat-container">
            </div>
            <div id="to-bottom-btn">
                <svg width="16" height="16" fill="white" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"></path>
                </svg>
            </div>

            <div class="emoji-preview-container">
				<img id="emoji-preview-img"/>
				<button id="emoji-preview-cancel">ⓧ</button>
			</div>
        `;
        
        this.innerChatContainer = this.shadowRoot.querySelector(".inner-chat-container");
        this.innerChatContainer.innerHTML = this.loadingHTML;
        this.listeningToNewChat = false;

        this.toBottomBtn = this.shadowRoot.getElementById("to-bottom-btn");

        this.prevChatsLength = 0;
        this.zeroUpdatedCnt = 0;

        // TODO throttling
        // TODO scroll bug
        this.innerChatContainer.addEventListener("scroll", (e) => {
            this.listeningToNewChat = (Math.abs(e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop)) < 1;
            if (e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop > 300) {
                this.toBottomBtn.setAttribute("show", "");
            } else {
                this.toBottomBtn.removeAttribute("show");
            }
        });

        this.shadowRoot.getElementById("emoji-preview-cancel").addEventListener("click", () => {
            document.querySelector("chat-controller").onEmojiPreviewRemoveTrial();
        });

        this.shadowRoot.getElementById("to-bottom-btn").addEventListener("click", () => {
            this.scrollToBottom();
        });
    }

    renderCurrentUserInfo() {
        this.innerChatContainer.innerHTML = "";
        const info = {id: "아이디", name: "이름", endDate: "전역일", change: "변경 하려면"};
        const members = {name: UserHandler.currentUser.name, id: UserHandler.currentUser.id, endDate: UserHandler.currentUser.endDate, change: "클릭"};
        Object.entries(info).forEach(([k, v]) => {
            const infoElem = document.createElement("chat-box");
            infoElem.container.innerHTML = `
                <div class="chat-content">${v}: ${members[k]}</div>
            `
            infoElem.classList.add("self");
            this.innerChatContainer.append(infoElem);

            if (k == "change") {
                infoElem.setAttribute("info-change", "");
                infoElem.addEventListener("click", () => {
                    location.href = "./auth/change_info.php"; // 뒤로가기를 위해 href 사용
                });
            }
        });
    }

    renderChats() {
        this.innerChatContainer.innerHTML = "";

        ChatHandler.chats.forEach(chat => {
            const chatElem = document.createElement("chat-box");
            chatElem.setChat(chat);
            this.innerChatContainer.append(chatElem);
        });

        if (this.prevChatsLength === ChatHandler.chats.length) {
            this.zeroUpdatedCnt += 1;
        } else {
            this.zeroUpdatedCnt = 0;
        }

        this.prevChatsLength = ChatHandler.chats.length;

        if (this.listeningToNewChat) {
            console.log("listening to new chat. scroll to bottom");
            this.scrollToBottom();
        }
    }

    refreshBySend() {
        LoaderHandler.resetLoaders();
        this.loadAndRender(async () => { await ChatHandler.loadNewChats() })
        .then(() => {
            this.scrollToBottom();
        });
    }

    scrollToBottom(behavior="smooth") {
        // console.log("scroll");
        this.innerChatContainer.scrollTo({
            top: this.innerChatContainer.scrollHeight,
            behavior: behavior,
        });
    }

    setNextChatLoader(prevResult=true) {
        if (prevResult) {
            LoaderHandler.setNewLoader(() => { 
                this.loadAndRender(async () => { await ChatHandler.loadNewChats() });
            });
        } else {
            LoaderHandler.setNewLoader(() => { 
                this.loadAndRender(async () => { await ChatHandler.loadAllChats() }); 
            });
        }
    }

    async loadAndRender(loadCallbackFnc) {
        if (!ChatHandler.existsUserAndPartner()) {
            console.log("사용자 또는 상대방 정보가 없습니다.");
            this.setNextChatLoader(false);
        }
        // all or new
        await loadCallbackFnc();
        this.renderChats();
        this.setNextChatLoader();

        if (this.zeroUpdatedCnt === UPDATE_TIME_OUT_CNT) {
            document.querySelector("chat-controller").createPopup("업데이트될 내용이 없어 채팅이 중단되었습니다. 다시 채팅을 시작하려면 사용자를 선택해주세요.");
		    this.setAttribute("partner-id", "none");
            this.zeroUpdatedCnt = 0;
        }
    }

    resetInnerChatContainer() {
        this.innerChatContainer.innerHTML = this.loadingHTML;
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        LoaderHandler.resetLoaders();
		document.querySelector("user-container").setAllUserBoxUnselected();
        if (newVal !== "none" && newVal !== UserHandler.currentUser.id) {
            UserHandler.currnentPartner = UserHandler.getUserById(newVal);
            console.log("Current partner changed to " + UserHandler.currnentPartner.name);
            this.loadAndRender(async () => { await ChatHandler.loadAllChats() })
            .then(() => {
                this.scrollToBottom("auto");
            });
            // document.querySelector("chat-controller").dropListeningChatUpdate();
        } else {
            if (newVal === UserHandler.currentUser.id) {
                this.renderCurrentUserInfo();
            } else {
                UserHandler.currnentPartner = null;
            }
            
            // document.querySelector("chat-controller").ensureListeningChatUpdate();
        }
    }
}