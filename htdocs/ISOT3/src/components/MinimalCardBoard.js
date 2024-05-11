import CardHandler from "../handlers/CardHandler.js";

class MinimalCardBoardContent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    flex: 1;
                    background-color: white;
                    box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
                    border-radius: 0.5rem;
                    overflow-y: scroll;
                    padding-bottom: 0.5rem;
                }

                #top-btn {
                    cursor: default;
                    position: absolute; 
                    bottom: 3rem; 
                    left: 31.5rem;
                    font-weight: bold;
                    transition: 0.2s ease-in-out;
                    opacity: 0;
                    background-color: var(--primary);
                }

                #top-btn.show {
                    cursor: pointer;
                    opacity: 1;
                }

                #top-btn img {
                    width: 16px;
                }

                .icon-btn {
                    background-color: #00bcd4;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 3rem;
                    height: 1.9rem;
                    border-radius: 1rem;
                    cursor: pointer;
                    transition: 0.2s ease-in-out;
                }

                .icon-btn:hover {
                    transform: translateY(-2px);
                }

                #pinned {
                    position: sticky;
                    top: 0;
                    width: 100%;
                }

                #search-input {
                    font-size: 1rem;
                    padding: 0.25rem;
                    padding-left: 0.5rem;
                    height: 2.5rem;
                    width: 100%;
                    border: 0.2rem var(--primary) solid;
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    font-family: 'kakao';
                    outline: none;
                }

                ::-webkit-scrollbar {
                    display: none;
                }
            </style>
            <div>
                <input type="text" placeholder="검색" id="search-input" />
            </div>
            <div id="pinned"></div>
            <slot></slot>
            <div class="icon-btn" title="맨 위로 올라가기" id="top-btn">
                <img src="./img/svg/arrow.svg />
            </div>
        `;

        this.pinnedCardContainer = this.shadowRoot.getElementById("pinned");

        this.topBtn = this.shadowRoot.getElementById("top-btn");

        this.setEventListeners();

        this.boardTable = this.getAttribute("board-table");

        this.render();
    }

    setEventListeners() {
        this.addEventListener("scroll", (e) => {
            // show btn
            if (e.target.scrollTop > 300) {
                this.$topBtn.classList.add("show");
                this.$topBtn.onclick = () => {
                    $cardBoard.scroll({ behavior: "smooth", left: 0, top: 0 });
                };
            } else {
                this.$topBtn.classList.remove("show");
                this.$topBtn.onclick = "";
            }

            // pagination
            console.log(e.target.scrollHeight, e.target.clientHeight, e.target.scrollTop);
            if ((Math.abs(e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop)) < 10) {
                console.log("scroll bottom");
                // TODO pagination
            }
        });
    }

    async render() {
        const cards = await CardHandler.getNextCards({table: this.boardTable});
        Object.keys(cards).forEach(id => {
            const minimalCardElem = document.createElement("minimal-card");
            minimalCardElem.setAttribute("card-info", `${this.boardTable}-${id}`);
            this.prepend(minimalCardElem); // TODO or append?
        });
    }
}

class MinimalCardBoardController extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
        <style>
            simple-card {
                order: 1;
            }

            .wrapper {
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start;
            }

            .divider {
                width: 0.15rem; 
                background-color: var(--primary); 
                margin: 0 0.5rem; 
                border-radius: 1rem;
            }

            .item {
                display: flex; 
                gap: 0.5rem;
            }

            #card-add-btn {
                background-color: #00bcd4;
            }

            #card-remove-btn {
                background-color: #e91e63;
                color: white;
            }

            .icon-btn {
                background-color: #00bcd4;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 3rem;
                height: 1.9rem;
                border-radius: 1rem;
                cursor: pointer;
                transition: 0.2s ease-in-out;
            }

            .icon-btn:hover {
                transform: translateY(-2px);
            }

            #card-filter {
                flex-wrap: wrap;
                align-items: center;
            }
        </style>
        <simple-card>
            <div class="wrapper">
                <div class="item" id="card-filter">
                    <toggle-chip text="!!!" title="매우 중요한 카드 표시"></toggle-chip>
                    <toggle-chip text="!!" title="중요한 카드 표시"></toggle-chip>
                    <toggle-chip text="!" title="보통 카드 표시"></toggle-chip>
                    <toggle-chip text="@" title="멘션된 카드만 표시" disabled></toggle-chip>
                    <toggle-chip text="안 읽음" title="아직 안읽은 카드만 표시" disabled></toggle-chip>
                    <chip-btn thin id="read-all-btn">모두 읽음으로 표시</chip-btn>
                </div>
                <div class="item">
                    <div class="icon-btn" id="card-add-btn" title="카드 추가">
                        <img src="./img/svg/plus.svg" />
                    </div>
                    <div class="icon-btn" id="card-remove-btn" title="카드 삭제">
                        <img src="./img/svg/remove.svg" />
                    </div>
                </div>
            </div>
        </simple-card>
        `;

        this.boardTable = this.getAttribute("board-table");
        this.board = document.querySelector("home-app").shadowRoot.querySelector(`minimal-card-board[board-table='${this.boardTable}']`);
        this.boardContent = this.board.shadowRoot.querySelector("minimal-card-board-content");
        this.board.setAttribute("mode", "read"); // read or remove

        this.addCardBtn = this.shadowRoot.querySelector("#card-add-btn");
        this.addCardBtn.addEventListener("click", () => {
            // TODO            
        });

        this.readAllBtn = this.shadowRoot.querySelector("#read-all-btn");
        this.readAllBtn.addEventListener("click", () => {
            // TODO
        });

        // TODO filter priority & tag


        this.removeCardBtn = this.shadowRoot.querySelector("#card-remove-btn");
        const applyRemove = () => {
            const selectedCards = [...this.boardContent.querySelectorAll("minimal-card")].filter((c) => c.hasAttribute("checked"));
            if (selectedCards.length > 0) {
                const confirm = window.confirm(`${selectedCards.length} 개의 카드가 선택되었습니다. 계속하시겠습니까?`);
                if (confirm) {
                    // TODO
                    // using handler
                    selectedCards.forEach(card => {
                        this.board.removeCard(card)
                    });
                }
            }

            disableRemoveMode();
            this.removeCardBtn.onclick = toggleRemoveMode;
        }

        const disableRemoveMode = () => {
            this.boardContent.querySelectorAll("minimal-card").forEach(cardElem => {
                cardElem.removeAttribute("dimmed");
                cardElem.removeAttribute("checked");
            });
            this.board.setAttribute("mode", "read");
        };

        const enableRemoveMode = () => {
            this.boardContent.querySelectorAll("minimal-card").forEach(cardElem => {
                cardElem.setAttribute("dimmed", "");
            });
            this.removeCardBtn.onclick = applyRemove;
            this.board.setAttribute("mode", "remove");
        };

        const toggleRemoveMode = () => {
            const mode = this.board.getAttribute("mode");
            if (mode === "remove") {
                // remove to read
                disableRemoveMode();
            } else {
                enableRemoveMode();
            }
        }
        // use onclick to overwrite event listener
        this.removeCardBtn.onclick = toggleRemoveMode;
    }
}

class MinimalCardBoard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.boardTable = this.getAttribute("board-table");
        this.shadowRoot.innerHTML = `
            <minimal-card-board-controller board-table="${this.boardTable}"></minimal-card-board-controller>
            <minimal-card-board-content board-table="${this.boardTable}"></minimal-card-board-content>        
        `;
    }

    showModal(boardTable, cardId) {
        const modal = document.createElement("card-modal");
        modal.setAttribute("card-info", `${boardTable}-${cardId}`);
        document.body.prepend(modal);
    }
}

export { MinimalCardBoardContent, MinimalCardBoardController, MinimalCardBoard };