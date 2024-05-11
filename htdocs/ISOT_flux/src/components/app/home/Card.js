import { Component } from "../../../core/Component.js";
import { store } from "../../../store/store.js";
import { time } from "../../../utils/time.js";

class Card extends Component {
    static get observedAttributes() {
        return ["card-id"];
    }

    handleCardData(cardId) {
        this.cardId = cardId;
        store.subscribe(() => {
            this.render(this.getCard());
        });
    }

    getCard() {
        return store.getState().cards.data[this.cardId];
    }
    
    render(card) {
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        switch (attr) {
            case "card-id":
                this.handleCardData(newVal);
                break;
        }
    }
}

export class MinimalCard extends Card {

    template() {
        return `
        <div class="container">
            <div class="check-div">
                <img src="./img/svg/check.svg" />
            </div>
            <div class="inner">
                <div class="head">
                    <div class="wrap">
                        <div class="writer">
                            <!-- 작성자 -->
                        </div>
                        <div>→</div>
                        <div class="receiver">
                            <!-- 멘션된 사람 -->
                        </div>
                    </div>
                    <div class="priority">
                        <!-- 중요도 -->
                    </div>
                </div>
                <div class="body">
                    <div class="wrap">
                        <div class="pin-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16">
                                <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a.5927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l 3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                            </svg>
                        </div>
                        <div class="title">
                            <!-- 글 제목 -->
                        </div>
                        <div class="commentCount">
                            <!-- 댓글 개수 -->
                        </div>
                    </div>
                    <div class="wrap">
                        <div class="creationTime">
                            <!-- 작성 시각 -->
                        </div>
                        <div>|</div>
                        <div class="readCount">
                            읽음 0 / 10
                        </div>
                        <div class="writer-receiver"></div>
                    </div>
                </div>
            </div>
        </div>
        `
    }

    init() {
        // TODO mapping table 만들어서 read 유무 check 해야함.
        // TODO mapping table로 tag 도 구현해야함 (reciever)
        

        // card field: id, title, content, writer_id, priority, pinned, modified_at
        this.display = {
            priority: {
                repr: async (card) => {
                    return "!".repeat(parseInt(card.priority));
                },
            },
            commentCount: {
                repr: async (card) => {
                    const { commentCount } = card;
                    return parseInt(commentCount) !== 0 ? `[${commentCount}]` : "";
                },
            },
            // writer: {
            //     repr: async (card) => {
            //         if (!this.writer) {
            //             // this.writer = await UserHandler.getUser(card.writer_id);
            //             this.writer = {name: "홍길동"};
            //         }
            //         return this.writer.name;
            //     }
            // },
            readCount: {
                repr: async (card) => {
                    return "" // TODO
                }
            }
        };
        ["writer", "receiver", "title"].forEach(key => {
            this.display[key] = {
                repr: async card => card[key],
            };
        });
        ["creationTime"].forEach(key => {
            this.display[key] = {
                repr: async (card) => {
                    const timeStamp = card[key];
                    if (time.isToday(timeStamp)) {
                        const { hours, minutes } = time.breakTimeStr(timeStamp);
                        return `${hours}:${minutes}`;
                    }
                    const { month, date } = time.breakTimeStr(timeStamp);
                    return `${month}.${date}`;
                }
            };
        });

        
        Object.keys(this.display).forEach(key => {
            this.display[key].ref = this.querySelector("." + key);
        });


        // bind click
        this.addEventListener("click", () => {
            // TODO home app 등이 바뀌면 이 ref도 바꿔줘야 하는데, 주입하는 방법이 없나? 
            const board = document.querySelector("home-app").querySelector(`minimal-card-board[board-table='${this.cardTable}']`);
            if (board.getAttribute("mode") === "remove") {
                this.toggleAttribute("dimmed");
                this.toggleAttribute("checked");
            } else {
                board.showModal(this.cardTable, this.cardId);
            }
        });
    }

    // override
    render(card) {
        // console.log(card);
        Object.keys(this.display).forEach(key => {
            this.display[key].repr(card).then(repr => {
                this.display[key].ref.innerText = repr;
            });
        });
        this.setAttribute("priority", card.priority);
    }
}

class CardModal extends Card {
    constructor() {
        super();
        this.shadowRoot.innerHTML = `
            <style>
                ::-webkit-scrollbar {
                    display: none;
                }

                .back {
                    opacity: 0;
                    transition: 0.1s ease-in-out;
                    position: absolute;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgb(0 0 0 / 60%);
                    z-index: 100;
                    display: flex;
                    align-items: center;
                }

                :host([appear]) .back {
                    opacity: 1;
                }

                .click {
                    flex: 1;
                    height: 100%;
                }

                .window {
                    height: calc(100% - 6rem);
                    border-right: 5px var(--primary) solid;
                    border-left: 5px var(--primary) solid;
                    background-color: white;
                    width: 45rem;
                    padding: 3rem 2rem;
                    box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
                    overflow-y: scroll;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .title {
                    font-weight: bold;
                    font-size: 2rem;
                }

                .head {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                .head * {
                    line-height: 100%;
                }

                .content {
                    padding: 2rem 0;
                    font-size: 1.2rem;
                    border-top: 3px var(--primary) solid;
                    border-bottom: 3px var(--primary) solid;
                }

                .writer, .receiver, .created_at, .modified_at {
                    color: var(--primary);
                    font-weight: bold;
                }

                .outer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .pad-bot {
                    padding-bottom: 0.8rem;
                }

                .pad-top {
                    padding-top: 0.5rem;
                }

                .priority {
                    font-weight: bold;
                    font-size: 1.4rem;
                    color: var(--primary);
                }

                .read_count {
                    color: var(--primary);
                    font-weight: bold;
                }

                .comment {
                    margin-top: 1rem;
                    padding-bottom: 10rem;
                }

                .comment-list {
                    padding: 0.5rem;
                    border: 2px var(--primary) solid;
                    border-radius: 0.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }

                .comment-count {
                    font-weight: bold;
                    color: var(--primary);
                    padding-bottom: 1rem;
                }

                .inner {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                }

                .inner.end {
                    flex-direction: row;
                    align-items: flex-end;
                }

                .edit-btn > svg, .pin-btn svg {
                    fill: white;
                }

                .pin-btn path {
                    stroke: white;
                    stroke-width: 0.4px;
                }

                .pin-btn #disable {
                    display: none;
                }

                .pin-btn #enable {
                    display: block;
                }

                .pin-btn[toDisable] #disable {
                    display: block;
                }

                .pin-btn[toDisable] #enable {
                    display: none;
                }

                chip-btn {
                    gap: 0.5rem;
                    justify-content: center;
                    align-items: center;
                    display: flex;
                    font-size: 0.9rem;
                }

                .wrap {
                    margin-top: 1rem;
                    display: flex;
                    gap: 0.5rem;
                }

                input {
                    font-size: 1rem;
                    color: black !important;
                    font-weight: normal !important;
                    border: 2px var(--primary) solid;
                    padding: 0.4rem 0.5rem;
                    outline: none;
                    border-radius: 0.5rem;
                    font-family: 'kakao';
                    flex: 1;
                }

                .comment-writer {
                    font-size: 1rem;
                    font-family: 'kakao';
                    padding: 0.3rem;
                    border: 2px var(--primary) solid;
                    outline: none;
                    border-radius: 0.5rem;
                }

                .comment-writer[disabled] {
                    opacity: 1;
                    color: black;
                }

                .comment-wrap {
                    display: flex;
                    align-items: center;
                }

                .comment-div {
                    flex: 1;
                    display: flex;
                    gap: 0.3rem;
                }

                .comment-div > div:first-child {
                    padding: 0 0.25rem;
                    color: var(--primary);
                    text-align: center;
                }

                .comment-div > div:nth-child(3) {
                    width: 3rem;
                    text-align: center;
                }

                .comment-div > div:last-child {
                    flex: 1;
                    padding-left: 0.3rem;
                }

                .comment-wrap > .remove-btn {
                    background-color: #e91e63;
                    width: 1rem;
                    height: 1rem;
                    justify-content: center;
                    align-items: center;
                    border-radius: 3rem;
                    display: flex;
                    cursor: pointer;
                }

                .comment-wrap img {
                    width: 1rem;
                    height: 1rem;
                    transform: rotate(45deg);
                }

                :host([priority="3"]) .priority {
                    color: #e91e63;
                }

                :host([priority="2"]) .priority {
                    color: #3f51b5;
                }

                :host([priority="1"]) .priority {
                    color: #4caf50;
                }

                .flex-gap {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
            </style>
            <div class="back">
                <div class="click"></div>
                <div class="window">
                    <div class="head">
                        <div class="outer pad-bot">
                            <div class="title">
                                <!-- 글 제목 -->
                            </div>
                            <div class="priority">
                                <!-- 중요도 -->
                            </div>
                        </div>
                        <div class="outer">
                            <div class="inner">
                                <div class="writer">
                                    <!-- 작성자 -->
                                </div>
                                <div class="receiver">
                                    <!-- 멘션된 사람 -->
                                </div>
                            </div>
                            <div class="inner end">
                                <chip-btn class="edit-btn" title="수정하기">
                                    <svg width="16" height="16" viewBox="0 0 16 16">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" /><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                    </svg>
                                </chip-btn>
                                <chip-btn class="pin-btn">
                                    <svg width="16" height="16" viewBox="0 0 16 16" id="disable">
                                        <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a.5927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l 3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146zm.122 2.112v-.002.002zm0-.002v.002a.5.5 0 0 1-.122.51L6.293 6.878a.5.5 0 0 1-.511.12H5.78l-.014-.004a4.507 4.507 0 0 0-.288-.076 4.922 4.922 0 0 0-.765-.116c-.422-.028-.836.008-1.175.15l5.51 5.509c.141-.34.177-.753.149-1.175a4.924 4.924 0 0 0-.192-1.054l-.004-.013v-.001a.5.5 0 0 1 .12-.512l3.536-3.535a.5.5 0 0 1 .532-.115l.096.022c.087.017.208.034.344.034.114 0 .23-.011.343-.04L9.927 2.028c-.029.113-.04.23-.04.343a1.779 1.779 0 0 0 .062.46z" />
                                    </svg>
                                    <svg width="16" height="16" viewBox="0 0 16 16" id="enable">
                                        <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a.5927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l 3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
                                    </svg>
                                </chip-btn>
                                <chip-btn class="read-btn">읽지 않음으로</chip-btn>
                            </div>
                        </div>
                        <div class="outer pad-top">
                            <div class="flex-gap">
                                <div class="created_at">
                                    <!-- 작성 시각 -->
                                </div>
                                <div class="modified_at">
                                    <!-- 작성 시각 -->
                                </div>
                            </div>
                            <div class="read_count">
                                <!-- 읽은 사람 수 -->
                            </div>
                        </div>
                    </div>
                    <div class="content">
                        <!-- 글 내용 -->
                    </div>
                    <div class="comment">
                        <div class="comment-count">댓글[0]</div>
                        <div class="comment-list"></div>
                        <div class="wrap">
                            <select class="comment-writer" disabled>
                            </select>
                            <input type="text" class="comment-content" placeholder="내용*" />
                            <chip-btn class="comment-write-btn">작성하기</chip-btn>
                        </div>
                    </div>
                </div>
                <div class="click"></div>
            </div>
        `;

        this.display = {
            priority: {
                repr: async (card) => {
                    return "!".repeat(parseInt(card.priority));
                },  
            },
            comment: {
                repr: async (card) => "", // TODO
            },
            writer: {
                repr: async (card) => {
                    if (!this.writer) {
                        this.writer = await UserHandler.getUser(card.writer_id);
                    }
                    return `작성자 : ${this.writer.name}`;
                }
            },
        };
        ["title", "content"].forEach(key => {
            this.display[key] = {
                repr: async card => card[key],
            };
        });
        [{key: "created_at", ko: "작성일"}, {key: "modified_at", ko: "수정일"}].forEach(({key, ko}) => {
            this.display[key] = {
                repr: async (card) => {
                    const timeStamp = card[key];
                    const { year, month, date, hours, minutes } = time.breakTimeStr(timeStamp);
                    return `${ko} : ${year}년 ${month}월 ${date}일 ${hours}:${minutes}`;
                }
            };
        });

        Object.keys(this.display).forEach(key => {
            this.display[key].ref = this.shadowRoot.querySelector("." + key);
        });

        // bind exit
        this.shadowRoot.querySelectorAll(".click").forEach(elem => {
            elem.addEventListener("click", () => {
                this.exit();
            });
        });
        const escFn = (e) => {
            if (e.key === "Escape") {
                this.exit();
                window.removeEventListener("keydown", escFn);
            }
        }
        window.addEventListener("keydown", escFn);

        this.shadowRoot.querySelector(".edit-btn").addEventListener("click", () => {
            // TODO edit
            const writer = document.createElement("card-writer");
            writer.setAttribute("card-info", this.getAttribute("card-info"));
            document.body.prepend(writer);
            this.remove();
        });

        this.shadowRoot.querySelector(".read-btn").addEventListener("click", () => {
            // TODO read
        });

        this.shadowRoot.querySelector(".pin-btn").addEventListener("click", () => {
            // TODO pin
        });

        // TODO comment
    }

    // override
    render(card) {
        Object.keys(this.display).forEach(key => {
            this.display[key].repr(card).then(repr => {
                this.display[key].ref.innerText = repr;
            });
        });
        this.setAttribute("priority", card.priority);
    }

    exit() {
        this.removeAttribute("appear");
        setTimeout(() => {
            this.remove();
        }, 101);
    }

    connectedCallback() {
        setTimeout(() => {
            this.setAttribute("appear", "");
        }, 10);

        // TODO read
    }
}
