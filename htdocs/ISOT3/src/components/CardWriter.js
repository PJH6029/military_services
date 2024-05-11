import CardHandler from "../handlers/CardHandler.js";
import UserHandler from "../handlers/UserHandler.js";

export default class CardWriter extends HTMLElement {
    static get observedAttributes() {
        return ["card-info"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                ::-webkit-scrollbar {
                    display: none;
                }

                input {
                    border: 3px var(--primary) solid;
                    padding: 0.5rem 0.75rem;
                    outline: none;
                    border-radius: 0.5rem;
                    font-family: 'kakao';
                }

                .back {
                    opacity: 0;
                    transition: all 0.1s ease-in-out;
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
                    width: 563px;
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

                .head {
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }

                .head * {
                    line-height: 100%;
                }

                .content {
                    border: 3px var(--primary) solid;
                    padding: 0.75rem;
                    outline: none;
                    border-radius: 0.5rem;
                    font-family: 'kakao';
                    resize: none;
                    min-height: 15rem;
                    line-height: normal;
                }

                .receiver {
                    flex: 1;
                }

                .title, .writer, .receiver, .content {
                    font-size: 1.1rem;
                }

                .writer {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-width: 4rem;
                    border: 3px var(--primary) solid;
                    outline: none;
                    border-radius: 0.5rem;
                }

                .writer[disabled] {
                    opacity: 1;
                    color: black;
                }

                .priority {
                    font-size: 1.4rem;
                    color: var(--primary);
                }

                .wrap {
                    display: flex;
                    gap: 0.5rem;
                }

                .desc {
                    font-size: 2rem;
                    padding-bottom: 0.5rem;
                    font-weight: bold;
                }

                .priority-count {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .outer {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                }

                #confirm-btn {
                    background-color: #00bcd4;
                }

                #cancel-btn {
                    background-color: rgb(233, 30, 99);
                }
            </style>
            <div class="back">
                <div class="click"></div>
                <div class="window">
                    <div class="desc">새 글 작성하기</div>
                    <div class="outer">
                        <div class="priority-count">
                            <toggle-chip text="!!!"></toggle-chip>
                            <toggle-chip disabled text="!!"></toggle-chip>
                            <toggle-chip disabled text="!"></toggle-chip>
                        </div>
                        <div class="wrap">
                            <chip-btn id="confirm-btn">확인</chip-btn>
                            <chip-btn id="cancel-btn">취소</chip-btn>
                        </div>
                    </div>
                    <div class="head">
                        <input type="text" class="title" placeholder="제목*" />
                        <div class="wrap">
                            <div class="writer"></div>
                            <input type="text" class="receiver" placeholder="수신자 ex) @전체 / @방민수, @석지원" />
                        </div>
                        <textarea class="content" placeholder="내용*"></textarea>
                    </div>
                </div>
                <div class="click"></div>
            </div>
        `;


        this.cardToEdit = {
            // id: null, // 신규면 필요 없음
            title: null,
            content: null,
            writer_id: null,
            priority: null,
            pinned: null,
        };

        this.priorityBtns = this.shadowRoot.querySelectorAll("toggle-chip");
        this.priorityBtns.forEach((b, index) => {
            b.addEventListener("click", () => {
                this.priorityBtns.forEach((e) => {
                    e.setAttribute("disabled", "");
                });
                b.removeAttribute("disabled");
            });
        });

        // TODO receiver
        this.renderFnc = {};
        ["title", "content"].forEach(key => {
            this.renderFnc[key] = (card) => {
                this.shadowRoot.querySelector("." + key).value = card[key];
            };
        });
        ["writer"].forEach(key => {
            this.renderFnc[key] = (card) => {
                this.shadowRoot.querySelector("." + key).innerText = UserHandler.getCurrentUser().name;
            }
        });
        ["priority"].forEach(key => {
            this.renderFnc[key] = (card) => {
                this.priorityBtns.forEach((b) => {
                    b.setAttribute("disabled", "");
                });
                this.priorityBtns[3 - card.priority].removeAttribute("disabled");
            }
        });

        this.confirmBtn = this.shadowRoot.querySelector("#confirm-btn");
        this.confirmBtn.addEventListener("click", () => {
            const isNew = this.getAttribute("card-info") === "new";
            const dataHandleMethod = (isNew) ? CardHandler.addCard : CardHandler.editCard;
            console.log(dataHandleMethod);
            
            this.updateCardToEdit();
            dataHandleMethod.call(CardHandler, {data: this.cardToEdit, table: this.cardTable});

            this.exit();
            const board = document.querySelector("home-app").shadowRoot.querySelector(`minimal-card-board[board-table='${this.cardTable}']`);
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
    }

    updateCardToEdit() {
        // title, content, priority, pinned
        ["title", "content"].forEach(key => {
            this.cardToEdit[key] = this.shadowRoot.querySelector("." + key).value;
        });
        
        ["priority"].forEach(key => {
            this.priorityBtns.forEach((b, index) => {
                if (!b.hasAttribute("disabled")) {
                    this.cardToEdit[key] = 3 - index;
                }
            });
        });

        console.log(this.cardToEdit);
        // TODO pinned
    }

    newCard() {
        this.cardToEdit = {
            title: "",
            content: "",
            writer_id: UserHandler.getCurrentUser().id,
            priority: 3,
            pinned: 0,
        };
        this.renderCard();
    }

    editCard(cardTable, cardId) {
        this.getCard(cardTable, cardId).then(card => {
            console.log(card);
            this.cardToEdit = {...card};
            this.renderCard();
        });
    }

    async getCard(cardTable, cardId) {
        return CardHandler.getCard({id: cardId, table: cardTable});
    }

    renderCard() {
        Object.keys(this.renderFnc).forEach(key => {
            (this.renderFnc[key])(this.cardToEdit);
        });
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
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        switch (attr) {
            case "card-info":
                if (!newVal) return;

                if (newVal === "new") {
                    // new card
                    this.newCard();
                } else {
                    // edit card
                    const [ cardTable, cardId ] = newVal.split("-");
                    this.cardTable = cardTable;
                    this.cardId = cardId;
                    this.editCard(cardTable, cardId);
                }
                break;
        }
    }
}