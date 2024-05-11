import { Component } from "../../../core/Component.js";
import { DEBUG_LOG } from "../../../debug.js";
import { store } from "../../../store/store.js";
import { ScrollBox } from "../common/ScrollBox.js";
import { MinimalCard } from "./Card.js";

export class MinimalCardBoardContent extends Component {
    template() {
        return `
            <div>
                <input type="text" placeholder="검색" id="search-input" />
            </div>
            <div id="pinned"></div>
            <div class="card-container">
            <div class="icon-btn" title="맨 위로 올라가기" id="top-btn">
                <img src="./img/svg/arrow.svg />
            </div>
            </div>
            
        `
    }

    init() {
        this.$scrollBox = new ScrollBox();
        this.querySelector(".card-container").appendChild(this.$scrollBox);

        this.$topBtn = this.querySelector("#top-btn");
        store.subscribe(() => {
            this.renderCards();
        });
        store.dispatch("SET_ALL_CARDS");
    }

    setEvent() {
        const $scrollBox = this.querySelector("scroll-box");
        $scrollBox.addEvent("scroll", "scroll-box", (e) => {
            // show btn
            console.log(e.target.scrollTop);
            if (e.target.scrollTop > 300) {
                this.$topBtn.classList.add("show");
                this.$topBtn.onclick = () => {
                    this.scroll({ behavior: "smooth", left: 0, top: 0 });
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

    renderCards() {
        this.querySelector("scroll-box").innerHTML = "";
        const cards = store.getState().cards.data;
        Object.keys(cards)
        // .filter((id, idx) => idx < 40)
        .forEach(id => {
            const $minimalCard = new MinimalCard();
            $minimalCard.setAttribute("card-id", `${id}`);
            this.querySelector("scroll-box").prepend($minimalCard); // TODO or append?
        });
    }
}

export class MinimalCardBoardController extends Component {
    template() {
        return `
        <div class="simple-card">
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
        </div>
        `
    }
}

export class MinimalCardBoard extends Component {
    static get observedAttributes() {
        return ["mode"];        
    }

    template() {
        return `
            <minimal-card-board-controller></minimal-card-board-controller>
            <minimal-card-board-content></minimal-card-board-content>        
        `
    }

    init() {
        this.$controller = this.querySelector("minimal-card-board-controller");
        this.$content = this.querySelector("minimal-card-board-content");
        this.setMode("read");
    }

    setEvent() {
        this.addEvent("click", "#card-add-btn", (e) => {
            // TODO
        });
        this.addEvent("click", "#read-all-btn", (e) => {
            // TODO
        });

        this.addEvent("click", "#card-remove-btn", (e) => {
            const mode = this.getAttribute("mode");
            if (mode === "read") {
                DEBUG_LOG("read to remove")
                this.setMode("remove");
            } else if (mode === "remove") {
                DEBUG_LOG("remove to read")
                const selectedCards = parseInt(this.getAttribute("selected-cards"));
                if (selectedCards > 0) {
                    // delete
                    this.$board.removeCards();
                }
                this.setMode("read");
            }
        });
    }

    setMode(mode) {
        this.setAttribute("mode", mode);
    }

    onModeChanged() {
        const mode = this.getAttribute("mode");
        if (!["read", "remove"].includes(mode)) return;

        const enableRemoveMode = () => {
            this.$content.querySelectorAll("minimal-card").forEach(cardElem => {
                cardElem.setAttribute("dimmed", "");
            });
        }

        const disableRemoveMode = () => {
            this.$content.querySelectorAll("minimal-card").forEach(cardElem => {
                cardElem.removeAttribute("dimmed");
                cardElem.removeAttribute("checked");
            });
        };

        if (mode === "read") {
            DEBUG_LOG("read")
            disableRemoveMode();
        } else {
            DEBUG_LOG("remove");
            enableRemoveMode();
        }
    }

    removeCards() {
        // TODO
        const selectedCards = [...this.boardContent.querySelectorAll("minimal-card")].filter((c) => c.hasAttribute("checked"));
        if (selectedCards.length > 0) {
            const confirm = window.confirm(`${selectedCards.length} 개의 카드가 선택되었습니다. 계속하시겠습니까?`);
            if (confirm) {
                // TODO
                // using handler
                selectedCards.forEach(card => {
                    this.$board.removeCard(card)
                });
            }
        }

    }

    attributeChangedCallback(attr, oldVal, newVal) {
        switch (attr) {
            case "mode":
                this.onModeChanged();
                break;
        }
    }
}

