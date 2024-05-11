import { cardData, profileBox } from "../handlers/handlers.js";


export class SideBar extends HTMLElement {
    static get observedAttributes() {
        return ["select"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#side-bar-template").innerHTML;

        /**
         * @DOM 사이드바 메뉴들
         */
        this.$items = {
            home: this.shadowRoot.querySelector("#home"),
            vault: this.shadowRoot.querySelector("#vault"),
            scheduler: this.shadowRoot.querySelector("#scheduler-app"),
            notepad: this.shadowRoot.querySelector("#notepad"),
            calender: this.shadowRoot.querySelector("#calender-app"),
        };

        this.$pages = {
            home: document.querySelector("#home"),
            vault: document.querySelector("vault-app"),
            scheduler: document.querySelector("scheduler-app"),
            notepad: document.querySelector("#notepad"),
            calender: document.querySelector("calender-app"),
        }

        // 사이드바 메뉴 눌렀을 때 이벤트 바인딩
        Object.entries(this.$items).forEach(([key, ref]) => {
            ref.addEventListener("click", () => {
                this.setAttribute("select", key);
                this.switchPage(key);
            });
        });
        
        /**
         * @DOM 프로필 선택 메뉴
         */
        this.$profileSelect = this.shadowRoot.querySelector(".profile-select");

        /**
         * @DOM 안읽은 카드 카운터
         */
        this.$noReadCounter = this.shadowRoot.querySelector("#no-read");
        
        /**
         * @DOM 안읽고 멘션된 카드 카운터 
         */
        this.$noReadMentionCounter = this.shadowRoot.querySelector("#no-read-mention");
        
        /**
         * @DOM 버젼 메뉴
         */
        this.$isotInfo = this.shadowRoot.querySelector("#isot-info");
        this.$isotInfo.addEventListener("click", () => {
            alert(patch);
        });
    }

    /**
     * 안읽은 개수, 안읽음 + 멘션 개수 업데이트
     * when should executed?
     * 0. Init 시
     * 1. 프로필 변경 시
     * 2. 카드 추가 / 삭제 시
     * 3. 읽음으로 설정 / 안읽음으로 설정 시
     */
    updateCounter() {
        const noReadCount = cardData.length - profileBox.getReadBox(profileBox.currentProfile).length;
        const noReadMentionCount = profileBox.getMailBox(profileBox.currentProfile).length - profileBox.getReadBox(profileBox.currentProfile).filter((e) => profileBox.getMailBox(profileBox.currentProfile).includes(e)).length;

        // 텍스트 수정
        this.$noReadCounter.innerText = noReadCount;
        this.$noReadMentionCounter.innerText = noReadMentionCount;

        // 색 변경
        if (noReadCount <= 0) {
            this.$noReadCounter.parentElement.setAttribute("allRead", "");
        } else {
            this.$noReadCounter.parentElement.removeAttribute("allRead");
        }
        if (noReadMentionCount <= 0) {
            this.$noReadMentionCounter.parentElement.setAttribute("allRead", "");
        } else {
            this.$noReadMentionCounter.parentElement.removeAttribute("allRead");
        }
    }

    /**
     * 사이드바에 보여지는 프로필 이름 업데이트
     * when should executed?
     * 0. Init 시
     * 1. 프로필 변경 시
     */
    updateProfile() {
        this.shadowRoot.querySelector(".current-profile").innerText = profileBox.currentProfile;
    }

    /**
     * 선택된 메뉴의 선택 스타일 렌더링
     * @param {String} key 새로 선택한 메뉴의 고유키
     */
    renderMenuSelection(key) {
        this.shadowRoot.querySelectorAll(".item").forEach((i) => {
            i.removeAttribute("selected");
        });
        this.$items[key].setAttribute("selected", "");
    }

    /**
     * 주어진 메뉴 고유키의 페이지로 전환
     * @param {String} key 전환할 메뉴의 고유키
     */
    switchPage(key) {
        Object.keys(this.$pages).forEach((p) => {
            this.$pages[p].setAttribute("hidden", "");
        });
        this.$pages[key].removeAttribute("hidden");
        this.currentPage = key;
        if (key === "home") {
            document.querySelectorAll("quick-memo").forEach((q) => {
                q.updateHeight();
            });
        }
    }

    /**
     * @getter 현재 페이지 (localStorage 에서 자동으로 로드)
     * @returns 현재 페이지 고유키
     */
    get currentPage() {
        if (!localStorage.hasOwnProperty("ISOT2-currentPage")) this.currentPage = "home";
        return localStorage.getItem("ISOT2-currentPage");
    }

    /**
     * @setter 현재 페이지 설정 (localStorage 와 자동으로 동기화)
     * @param {String} newVal 설정할 페이지의 고유키
     */
    set currentPage(newVal) {
        localStorage.setItem("ISOT2-currentPage", newVal);
    }

    connectedCallback() {
        this.renderMenuSelection(this.currentPage);
        this.switchPage(this.currentPage);

        this.updateCounter();
        this.updateProfile();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this.renderMenuSelection(newVal);
    }
}