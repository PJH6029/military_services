import {Emoji} from "../handlers/Chat.js";
import { EMOJI_LIST } from "../utils/const.js";

export default class EmojiContainer extends HTMLElement {
    static get observedAttributes() {
        return ["preview-emoji"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    padding-top: 0.5rem;
                    height: var(--main-height);
                    overflow: auto;
                    border: 2px solid black;
                    border-radius: 1rem;
                }

                :host::-webkit-scrollbar {
                    display: none;
                }

                :host([hidden]) {
                    display: none;
                }

                .container {
                    display: flex;
                    flex-direction: column;
                }

                .emoji {
                    width: 80px;
                    margin: 10px;
                }
            </style>
            <div class="container"></div>
        `;
        this.container = this.shadowRoot.querySelector(".container");
        this.chatController = document.querySelector("chat-controller");
        this.chatContainer = document.querySelector("chat-container");

        this.render();
    }

    render() {
        this.container.innerHTML = "";
        EMOJI_LIST.forEach(emojiFileName => {
            const [emojiName, emojiType] = emojiFileName.split(".");
            const src = Emoji.getEmojiSrc(emojiName, emojiType);

            const emojiImgElem = document.createElement("img");
            emojiImgElem.classList.add("emoji");
            emojiImgElem.setAttribute("src", src);
            emojiImgElem.id = "emoji-" + emojiName;
            emojiImgElem.addEventListener("click", () => {
                this.emojiClicked(emojiFileName);
            });

            this.container.append(emojiImgElem);
        });
    }


    emojiClicked(emojiFileName) {
        if (this.getAttribute("preview-emoji") === emojiFileName) {
            // remove preview
            this.chatController.onEmojiPreviewRemoveTrial();
        } else {
            this.setAttribute("preview-emoji", emojiFileName);
            // this.chatController.emojiSelected = true;
            this.chatController.setEmojiToInput(emojiFileName.split(".")[0]);
        }
    }

    renderPreviewEmoji(emojiFileName) {
        if (emojiFileName === "none") {
            this.chatContainer.shadowRoot.querySelector(".emoji-preview-container").style.display = "none";
            return;
        }
        
        this.chatContainer.shadowRoot.querySelector("#emoji-preview-img").setAttribute("src", Emoji.getEmojiSrcByFileName(emojiFileName));
        this.chatContainer.shadowRoot.querySelector(".emoji-preview-container").style.display = "block";
        this.chatController.chatInput.focus();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        if (attr === "preview-emoji") {
            this.renderPreviewEmoji(newVal);
        }
    }
}