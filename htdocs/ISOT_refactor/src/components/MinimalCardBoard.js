export class MinimalCardBoard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#minimal-card-board-template").innerHTML;

        this.pinnedContainer = this.shadowRoot.querySelector("#pinned");

        /**
         * @DOM 맨 위로 올라가는 버튼
         */
        this.$topBtn = this.shadowRoot.querySelector("#top-btn");

        // 어느 정도 내려가면 버튼이 보이게...
        const $cardBoard = document.querySelector("minimal-card-board");
        this.addEventListener("scroll", (e) => {
            if (e.target.scrollTop > 300) {
                this.$topBtn.classList.add("show");
                this.$topBtn.onclick = () => {
                    $cardBoard.scroll({ behavior: "smooth", left: 0, top: 0 });
                };
            } else {
                this.$topBtn.classList.remove("show");
                this.$topBtn.onclick = "";
            }
        });
    }

    /**
     * 모든 카드가 읽혔는지 확인하고 스타일 적용
     */
    updateAllCardReadStyle() {
        this.querySelectorAll("minimal-card").forEach((c) => {
            c.updateReadStyle();
            c.updateReadCount();
        });
    }

    /**
     * 모든 카드를 읽음으로 설정
     */
    setAllCardRead() {
        this.querySelectorAll("minimal-card").forEach((c) => {
            c.setThisCardRead();
        });
        this.updateAllCardReadStyle();
    }
}