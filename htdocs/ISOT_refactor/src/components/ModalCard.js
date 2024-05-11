import { cardData, profileBox } from "../handlers/handlers.js";
import { GET, DEL, PUT, POST, APIURL } from "../utils/requests.js";
import { time } from "../utils/time.js";


export class ModalCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#modal-card-template").innerHTML;
        
        const $cardBoard = document.querySelector("minimal-card-board");

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
            creationTime: (timeStr) => {
                const { year, month, date, hours, minutes } = time.breakTimeStr(timeStr);
                return `작성일 : ${year}년 ${month}월 ${date}일 ${hours}:${minutes}`;
            },
            readCount: (countNum) => {
                return `읽음 ${countNum} / ${profileBox.nameList.length}`;
            },
            writer: (name) => {
                return `작성자 : ${name}`;
            },
            receiver: (names) => {
                return `멘션 : ${names}`;
            }
        };
        ["title", "contentText"].forEach((key) => {
            this.dataKeys[key] = (val) => {
                return val;
            }
        });

        /**
         * @DOM DOM 레퍼런스 오브젝트 (데이터 키 기준)
         */
        this.ref = {};
        Object.keys(this.dataKeys).forEach((k) => {
            this.ref[k] = this.shadowRoot.querySelector("." + k);
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

        /**
         * @DOM 수정 버튼
         */
        this.$editBtn = this.shadowRoot.querySelector(".edit-btn");
        this.$editBtn.addEventListener("click", () => {
            document.querySelector("board-controller").editingCard = $cardBoard.querySelector("#" + this.cardKey);
            const writer = document.createElement("card-writer");
            document.body.prepend(writer);
            this.remove();
        });

        /**
         * @DOM 읽음 / 안읽음 버튼
         */
        this.$readBtn = this.shadowRoot.querySelector(".read-btn");
        this.$readBtn.addEventListener("click", () => {
            $cardBoard.querySelector("#" + this.cardKey).setThisCardUnRead();
            this.updateReadCount();
        });

        this.$pinBtn = this.shadowRoot.querySelector(".pin-btn");
        this.isPinned = false;

        this.$pinBtn.addEventListener("click", () => {
            if (this.isPinned) {
                DEL(`${APIURL}/api/pinnedData.php`, {
                    cardKey: this.cardKey
                }).then((res) => {
                    if (!res.success) {
                        alert("현재 공지에 등록된 글이 아닙니다.");
                        return;
                    }
                    this.isPinned = false;
                    this.$pinBtn.removeAttribute("toDisable");
                    this.$pinBtn.title = "공지로 등록";
                });
            } else {
                POST(`${APIURL}/api/pinnedData.php`, {
                    cardKey: this.cardKey
                }).then((res) => {
                    if (!res.success) {
                        if (res.error.includes("Duplicate entry")) {
                            alert("이미 공지로 등록된 글입니다.");
                            return;
                        } else if (res.error.includes("Exceed Limit")) {
                            alert("공지 최대 개수는 3개입니다.");
                            return;
                        }
                    }
                    this.isPinned = true;
                    this.$pinBtn.setAttribute("toDisable", "");
                    this.$pinBtn.title = "공지에서 제거";
                });
            }
            cardData.spawnAllPinnedCard();
        });

        GET(`${APIURL}/api/pinnedData.php`).then((res) => {
            if (res.count <= 0) return;
            if (Object.keys(res.resultData).includes(this.cardKey)) {
                this.isPinned = true;
                this.$pinBtn.setAttribute("toDisable", "");
                this.$pinBtn.title = "공지에서 제거";
            } else {
                this.isPinned = false;
                this.$pinBtn.removeAttribute("toDisable");
                this.$pinBtn.title = "공지로 등록";
            }
        });

        /**
         * ---------
         * 종료 이벤트
         * ---------
         */

        /**
         * @DOM 바깥 부분 (어두운 부분)
         */
        this.clickAreas = this.shadowRoot.querySelectorAll(".click");
        this.clickAreas.forEach((c) => {
            c.addEventListener("click", (e) => {
                this.exit();
            });
        });

        // Esc 누르면...
        this.escBindingFunc = (e) => {
            if (e.key === "Escape") {
                this.exit();
                window.removeEventListener("keydown", this.escBindingFunc);
            }
        };
        window.addEventListener("keydown", this.escBindingFunc);

        /**
         * 댓글 기능 구현
         */
        this.$commentCount = this.shadowRoot.querySelector(".comment-count");
        this.$commentList = this.shadowRoot.querySelector(".comment-list");
        this.$commentWriter = this.shadowRoot.querySelector(".comment-writer");
        profileBox.nameList.forEach((name) => {
            let opt = document.createElement("option");
            opt.innerText = name;
            this.$commentWriter.appendChild(opt);
        });
        this.$commentWriter.value = profileBox.currentProfile;

        this.$commentContent = this.shadowRoot.querySelector(".comment-content");
        this.$commentWriteBtn = this.shadowRoot.querySelector(".comment-write-btn");
        this.$commentWriteBtn.addEventListener("click", () => {
            const body = {
                cardKey: this.cardKey,
                writer: this.$commentWriter.value,
                content: this.$commentContent.value,
                creationTime: time.toTimeStr(new Date())
            };
            POST(`${APIURL}/api/comment.php`, body).then((res) => {
                if (res.success) {
                    this.$commentContent.value = "";
                    this.updateComment();
                }
            });
        });
    }

    get cardKey() {
        return this.id.substring(1);
    }

    /**
     * 오브젝트로 데이터 초기화
     * @param {Object} data 초기화할 데이터 오브젝트 
     */
    initData({ title, priority, contentText, creationTime, writer, receiver }) {
        this.title = title;
        this.priority = priority;
        this.contentText = contentText;
        this.creationTime = creationTime;
        this.writer = writer ?? "익명";
        this.receiver = receiver ?? "";
    }

    async renderPinBtn() {

    }

    updateComment() {
        const $cardBoard = document.querySelector("minimal-card-board");
        GET(`${APIURL}/api/comment.php?cardKey=${this.cardKey}`).then((res) => {
            if (res.count !== 0) {
                const commentList = [];
                Object.entries(res.resultData).forEach(([creationTime, { content, cardKey, writer }]) => {
                    commentList.push({ cardKey, content, creationTime, writer });
                });

                this.$commentCount.innerText = `댓글 (Beta) [${commentList.length}]`;
                $cardBoard.querySelector("#" + this.cardKey).comment = res.count; // update comment count of minimal card 
                this.$commentList.innerHTML = "";
                
                commentList.forEach((c) => {
                    const { writer, content, creationTime } = c;
                    
                    const wrap = document.createElement("div");
                    wrap.className = "comment-wrap";

                    const { month, date, hours, minutes } = time.breakTimeStr(creationTime);
                    const isToday = creationTime.substr(0, 8) === time.toTimeStr(new Date()).substr(0, 8);

                    const commentDiv = document.createElement("div");
                    commentDiv.className = "comment-div";

                    const dateDiv = document.createElement("div");
                    dateDiv.innerText = isToday ? `${hours}:${minutes}` : `${month}/${date} ${hours}:${minutes}`;

                    const writerDiv = document.createElement("div");
                    writerDiv.innerText = writer;

                    const contentDiv = document.createElement("div");
                    contentDiv.innerText = content;

                    const divider = document.createElement("div");
                    divider.innerText = "|";

                    commentDiv.appendChild(dateDiv);
                    commentDiv.appendChild(divider.cloneNode(true));
                    commentDiv.appendChild(writerDiv);
                    commentDiv.appendChild(divider.cloneNode(true));
                    commentDiv.appendChild(contentDiv);

                    wrap.appendChild(commentDiv);

                    if (profileBox.currentProfile === writer) {
                        const removeBtn = document.createElement("div");
                        removeBtn.className = "remove-btn";
                        removeBtn.innerHTML = `<img src="./svgs/plus.svg"></img>`;
                        removeBtn.addEventListener("click", () => {
                            if (!confirm("정말로 삭제하시겠습니까?")) return;
                            DEL(`${APIURL}/api/comment.php`, { creationTime }).then((res) => {
                                if (res.success) {
                                    this.updateComment();
                                    $cardBoard.querySelector("#" + this.cardKey).comment--;
                                }
                            });
                        });
                        wrap.appendChild(removeBtn);
                    }

                    this.$commentList.appendChild(wrap);
                });
            } else {
                this.$commentList.innerHTML = "아직 댓글이 존재하지 않습니다.";
                this.$commentCount.innerText = `댓글 (Beta) [0]`;
            }
        });
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
            if (profileBox.getReadBox(name).includes(this.id.substr(1))) count++;
        });
        this.readCount = count;
    }

    /**
     * 종료 이벤트
     */
    exit() {
        // 애니메이션 끝나고 remove 실행
        this.removeAttribute("appear");
        setTimeout(() => {
            this.remove();
        }, 101);
    }

    connectedCallback() {
        // 생성 후 애니메이션 실행
        setTimeout(() => {
            this.setAttribute("appear", "");
        }, 10);
        // 모달 열리는 순간 읽음으로 표시 (현재 프로필)
        const $cardBoard = document.querySelector("minimal-card-board");
        if ($cardBoard.querySelector("#" + this.cardKey)) {
            $cardBoard.querySelector("#" + this.cardKey).setThisCardRead();
        }
        // 맨 처음 읽은 수 계산
        this.updateReadCount();

        this.updateComment();
    }
}