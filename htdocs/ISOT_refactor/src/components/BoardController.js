import { cardData, profileBox } from "../handlers/handlers.js";

export class BoardController extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#board-controller-template").innerHTML;

        /**
         * @member 현재 삭제 모드인지?
         */
        this.isRemoveMode = false;

        this.editingCard = null;

        const $cardBoard = document.querySelector("minimal-card-board");

        /**
         * @DOM 신송카드 추가 버튼
         */
        this.$cardAddBtn = this.shadowRoot.querySelector("#card-add-btn");
        this.$cardAddBtn.addEventListener("click", () => {
            const writer = document.createElement("card-writer");
            document.body.prepend(writer);
        });

        /**
         * @DOM 모두 읽음으로 표시 버튼
         */
        this.$readAllBtn = this.shadowRoot.querySelector("#read-all-btn");
        this.$readAllBtn.addEventListener("click", () => {
            $cardBoard.setAllCardRead();
        });

        /**
         * @DOM 필터 버튼 리스트
         * @description
         * 0 : 중요도 3 버튼
         * 1 : 중요도 2 버튼
         * 2 : 중요도 1 버튼
         * 3 : 멘션 버튼
         * 4 : 안읽음 버튼
         */
        this.$filterBtnList = [...this.shadowRoot.querySelectorAll("toggle-chip")];
        this.$filterBtnList.forEach((btn, index) => {
            btn.addEventListener("click", () => {
                this.toggleFilter(index);
            });
        });

        /**
         * 삭제 모드 토글 함수
         */
        const toggleRemoveMode = () => {
            this.isRemoveMode = !this.isRemoveMode;
            if (this.isRemoveMode) {
                // 변경한 모드가 삭제 모드면...
                $cardBoard.querySelectorAll("minimal-card").forEach((c) => {
                    c.setAttribute("dimmed", "");
                });
                this.$cardRemoveBtn.onclick = applyRemove;
            } else {
                // 변경한 모드가 삭제 모드가 아니면...
                disableRemoveMode();
            }
        };

        /**
         * 삭제 모드 탈출 함수
         */
        const disableRemoveMode = () => {
            $cardBoard.querySelectorAll("minimal-card").forEach((c) => {
                c.removeAttribute("dimmed");
                c.removeAttribute("checked");
            });
            this.isRemoveMode = false;
        };

        /**
         * 체크한 카드 삭제 적용 함수
         */
        const applyRemove = () => {
            const selectedCardList = [...$cardBoard.querySelectorAll("minimal-card")].filter((c) => c.hasAttribute("checked"));
            // 하나라도 체크했으면 적용
            if (selectedCardList.length !== 0) {
                const confirm = window.confirm(`${selectedCardList.length} 개의 카드가 선택되었습니다. 계속하시겠습니까?`);
                if (confirm) {
                    selectedCardList.forEach((card) => {
                        cardData.removeData(card.id);
                        cardData.removeMinimalCard(card.id);
                    });
                }
            }
            // 삭제 모드 탈출
            disableRemoveMode();
            this.$cardRemoveBtn.onclick = toggleRemoveMode;
        };

        /**
         * @DOM 카드 삭제 버튼
         */
        this.$cardRemoveBtn = this.shadowRoot.querySelector("#card-remove-btn");
        this.$cardRemoveBtn.onclick = toggleRemoveMode;

        this.filterList = this.filterList;
    }

    /**
     * @getter localStorage 에 저장된 필터 리스트를 직접 반환
     */
    get filterList() {
        return profileBox.getFilterList();
    }

    /**
     * @setter 필터 리스트를 주어진 값으로 설정하고, localStorage 에 이를 적용
     */
    set filterList(newVal) {
        profileBox.setFilterList(profileBox.currentProfile, newVal);
        this.loadFilterStyle();
        // 필터 적용
        this.applyFilter();
    }

    loadFilterStyle() {
        this.$filterBtnList.forEach((btn) => {
            btn.setAttribute("disabled", "");
        });
        profileBox.getFilterList().forEach((filter) => {
            this.$filterBtnList[filter].removeAttribute("disabled");
        });
    }

    /**
     * 필터 추가
     * @param {Number} filter 추가할 필터의 인덱스
     */
    addFilter(filter) {
        this.filterList = [...this.filterList, filter];
    }

    /**
     * 필터 삭제
     * @param {Number} filter 삭제할 필터의 인덱스 
     */
    removeFilter(filter) {
        let newFilterList = [...this.filterList];
        newFilterList.remove(filter);
        this.filterList = [...newFilterList];
    }

    /**
     * 필터 토글
     * @param {Number} filter 토글할 필터의 인덱스
     */
    toggleFilter(filter) {
        if (this.filterList.includes(filter)) {
            this.removeFilter(filter);
        } else {
            this.addFilter(filter);
        }
    }

    /**
     * 저장된 필터 리스트를 DOM에 실제로 적용
     * @dependent this.filterList
     */
    applyFilter() {
        const $cardBoard = document.querySelector("minimal-card-board");
        $cardBoard.querySelectorAll("minimal-card").forEach((c) => {
            // 중요도 필터링
            if (!this.filterList.includes(3 - c.priority)) {
                c.setAttribute("hidden", "");
            } else {
                c.removeAttribute("hidden");
            }

            // 멘션 필터링
            if (this.filterList.includes(3)) {
                if (!profileBox.getMailBox().includes(c.id)) {
                    c.setAttribute("hidden", "");
                }
            }

            // 안읽음 필터링
            if (this.filterList.includes(4)) {
                if (profileBox.getReadBox().includes(c.id)) {
                    c.setAttribute("hidden", "");
                }
            }
        });
    }
}