import { cardData, profileBox } from "../handlers/handlers.js";
import { time } from "../utils/time.js";

export class MinimalCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#minimal-card-template").innerHTML;

        /**
         * @private 컴포넌트 데이터
         */
        this._data = {};

        /**
         * @member 데이터 키 오브젝트
         * @key 데이터 키
         * @value 해당 데이터 키의 print 함수 
         */
        this.dataKeys = {
            priority: (priorityNum) => {
                this.setAttribute("priority", priorityNum);
                return "!".repeat(priorityNum);
            },
            comment: (commentNum) => {
                return commentNum !== 0 ? `[${commentNum}]` : '';
            },
            creationTime: (timeStr) => {
                if (timeStr.substr(8) === time.toTimeStr(new Date()).substr(8)) {
                    const { hours, minutes } = time.breakTimeStr(timeStr);
                    return `${hours}:${minutes}`;
                }
                const { month, date } = time.breakTimeStr(timeStr);
                return `${month}.${date}`;
            },
            readCount: (countNum) => {
                return `읽음 ${countNum} / ${profileBox.nameList.length}`;
            }
        };
        ["writer", "receiver", "title"].forEach((key) => {
            this.dataKeys[key] = (val) => {
                return val;
            };
        });

        /**
         * @DOM DOM 레퍼런스 오브젝트 (데이터 키 기준)
         */
        this.ref = {};
        Object.keys(this.dataKeys).forEach((key) => {
            this.ref[key] = this.shadowRoot.querySelector("." + key);
        });

        // getter, setter 정의
        Object.entries(this.dataKeys).forEach(([key, printFunc]) => {
            Object.defineProperty(this, key, {
                get: () => {
                    return this._data[key];
                },
                set: (newVal) => {
                    this._data[key] = newVal;
                    this.ref[key].innerText = printFunc(newVal);
                }
            });
        });

        // 클릭 이벤트
        this.addEventListener("click", () => {
            const $boardCtrl = document.querySelector("board-controller");
            if ($boardCtrl.isRemoveMode) {
                // 삭제 모드인 경우...
                this.toggleAttribute("dimmed");
                this.toggleAttribute("checked");
            } else {
                // 일반 모드인 경우...
                cardData.spawnModal(this.id); 
            }
        });
    }

    /**
     * 오브젝트로 데이터 초기화
     * @param {Object} data 초기화할 데이터 오브젝트 
     */
    initData({ title, priority, creationTime, writer, receiver, commentCount }) {
        this.title = title;
        this.priority = priority;
        this.creationTime = creationTime;
        this.writer = writer ?? "익명";
        this.receiver = receiver ?? "";
        this.comment = commentCount ?? 0;
    }

    /**
     * 읽은 수 계산
     * when should executed?
     * 1. 읽음 처리 시
     * 2. 스폰 시
     */
    updateReadCount() {
        let count = 0;
        profileBox.nameList.forEach((name) => {
            if (profileBox.getReadBox(name).includes(this.id)) {
                count++;
            }
        });
        this.readCount = count;
    }

    /**
     * 현재 카드가 읽혔는지 확인하고 스타일 적용
     */
    updateReadStyle() {
        if (profileBox.getReadBox().includes(this.id)) {
            this.setAttribute("read", "");
        } else {
            this.removeAttribute("read");
        }
    }

    /**
     * 현재 카드를 읽음으로 표시
     */
    setThisCardRead() {
        let newReadBox = [...profileBox.getReadBox(), this.id];
        profileBox.setReadBox(profileBox.currentProfile, new Array(...new Set(newReadBox)));
        this.updateReadStyle();
        this.updateReadCount();
        const $sideBar = document.querySelector("side-bar");
        $sideBar.updateCounter();
    }

    /**
     * 현재 카드를 읽지 않음으로 표시
     */
    setThisCardUnRead() {
        let newReadBox = [...profileBox.getReadBox()];
        newReadBox.remove(this.id);
        profileBox.setReadBox(profileBox.currentProfile, newReadBox);
        this.updateReadStyle();
        this.updateReadCount();
        const $sideBar = document.querySelector("side-bar");
        $sideBar.updateCounter();
    }

    connectedCallback() {
        this.updateReadCount();
        this.updateReadStyle();
    }
}