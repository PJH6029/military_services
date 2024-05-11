import { GET, DEL, PUT, POST, APIURL } from "../utils/requests.js";
import { time } from "../utils/time.js";

const cardData = {
    _localData: {},
    async loadDataFromDB(lastDateStr='') {
        if (!(lastDateStr === '')) {
            // TODO date 검색 추가. 조건문에 regex 추가 
            await GET(`${APIURL}/api/cardData.php?lastDate=${lastDateStr}`).then((res) => {
                this._localData = { ...res.resultData };
            });        
        } else {
            await GET(`${APIURL}/api/cardData.php`).then((res) => {
                this._localData = { ...res.resultData };
            });
        }
    },
    /**
     * @getter localStorage 에 저장된 cardData를 직접 리턴
     */
    get data() {
        return this._localData;
    },
    /**
     * @setter cardData의 변경된 사항을 localStorage 에 바로 적용
     */
    set data(newVal) {
        this._localData = { ...newVal };

        // TODO need to find better way
        // profileBox.refreshMailBox();
        // profileBox.refreshReadBox();
    },
    /**
     * @getter 현재 저장된 모든 신송카드의 개수
     */
    get length() {
        return Object.keys(this.data).length;
    },
    /**
     * 데이터에 값을 추가 / 수정 (변경하고자 한다면 변경할 데이터의 키를 입력)
     * @param {String} key 추가 / 수정할 데이터의 고유키
     * @param {Object} data 추가 / 수정할 데이터 오브젝트
     */
    addData(key, data) {
        let newData = {...this.data};
        newData[key] = data;
        this.data = newData;
        POST(`${APIURL}/api/cardData.php`, {
            cardKey: key,
            ...data
        }).then((res) => {
            if (!res.success) console.error(res.error);
        });
    },
    editData(key, data) {
        let newData = {...this.data};
        newData[key] = data;
        this.data = newData;
        PUT(`${APIURL}/api/cardData.php`, {
            cardKey: key,
            ...data
        }).then((res) => {
            if (!res.success) console.error(res.error);
        });
    },
    /**
     * 데이터에 있는 값을 삭제
     * @param {String} cardKey 삭제할 데이터의 고유키 
     */
    removeData(cardKey) {
        DEL(`${APIURL}/api/cardData.php`, {
            cardKey
        }).then((res) => {
            if (!res.success) console.error("DB 데이터 삭제 실패");
        });

        // 참조하고 있는 오브젝트에서 해당 데이터를 삭제
        profileBox.nameList.forEach((p) => {
            if (profileBox.getReadBox(p).includes(cardKey)) {
                let newReadBox = [...profileBox.getReadBox(p)];
                newReadBox.remove(cardKey);
                profileBox.setReadBox(p, newReadBox);
            }
            if (profileBox.getMailBox(p).includes(cardKey)) {
                let newMailBox = [...profileBox.getMailBox(p)];
                newMailBox.remove(cardKey);
                profileBox.setMailBox(p, newMailBox);
            }
        });

        let newData = {...this.data};
        delete newData[cardKey];
        this.data = newData;
    },
    /**
     * 데이터에 있는 값을 이용해 신송카드를 document 에 스폰
     * @param {String} key 스폰할 데이터의 고유키
     */
    spawnMinimalCard(key) {
        const data = this.data[key];
        const mcard = document.createElement("minimal-card");
        mcard.id = key;
        mcard.initData(data);
        const $cardBoard = document.querySelector("minimal-card-board");
        $cardBoard.prepend(mcard);
        return mcard;
        // $sideBar.updateCounter();
    },

    spawnMinimalCardFromData(key, data) {
        this.data[key] = data;
        return this.spawnMinimalCard(key);
    },
    /**
     * document 에서 해당 고유키를 가진 신송카드 element를 삭제
     * @param {String} key 삭제할 신송카드의 고유키
     */
    removeMinimalCard(key) {
        const $cardBoard = document.querySelector("minimal-card-board");
        $cardBoard.querySelector("#" + key).remove();
    },
    /**
     * 저장된 모든 데이터를 이용해 document 에 모든 카드를 스폰
     */
    spawnAllMinimalCard() {
        Object.keys(this.data).forEach((key) => {
            this.spawnMinimalCard(key);
        });
    },
    async spawnAllPinnedCard() {
        const $cardBoard = document.querySelector("minimal-card-board");
        $cardBoard.pinnedContainer.innerHTML = "";
        const { count, resultData } = await GET(`${APIURL}/api/pinnedData.php`);
        cardData.data = {...cardData.data, ...resultData};
        if (count <= 0) return;
        Object.keys(resultData).forEach((key) => {
            const mcard = document.createElement("minimal-card");
            mcard.id = key;
            mcard.initData(resultData[key]);
            mcard.setAttribute("pinned", "");
            mcard.shadowRoot.querySelector(".writer-receiver").innerText = `${resultData[key].writer} → ${resultData[key].receiver}`;
            $cardBoard.pinnedContainer.prepend(mcard);
        });
    },
    /**
     * 데이터에 있는 값을 이용해 modal 스폰
     * @param {String} key 스폰할 데이터의 고유키
     */
    spawnModal(key) {
        const data = this.data[key];
        const modal = document.createElement("modal-card");
        modal.id = "M" + key; 
        modal.initData(data);
        document.body.prepend(modal);
    }
}

const profileBox = {
    _localData: null,
    async loadDataFromDB() {
        await GET(`${APIURL}/api/profileBox.php`).then((res) => {
            this._localData = { ...res };
            Object.keys(this._localData).forEach((name) => {
                this._localData[name].filterList = this._localData[name].filterList.split('');
                this._localData[name].filterList = this._localData[name].filterList.map((str) => +str);
                this._localData[name].originalMailBox = JSON.parse(this._localData[name].mailBox);
                this._localData[name].originalReadBox = JSON.parse(this._localData[name].readBox);
                this._localData[name].mailBox = this._localData[name].originalMailBox.filter(e => Object.keys(cardData.data).includes(e));
                this._localData[name].readBox = this._localData[name].originalReadBox.filter(e => Object.keys(cardData.data).includes(e));
            });
        });
    },
    get currentProfile() {
        return sessionStorage.getItem("userName", "");
    },
    get data() {
        return this._localData;
    },
    set data(newVal) {
        this._localData = { ...newVal };
    },
    /**
     * @getter 프로필 목록 (저장된 데이터 기준)
     */
    get nameList() {
        return Object.keys(this.data);
    },
    /**
     * 프로필 추가
     * @param {String} name 추가할 프로필의 이름 
     */
    addProfile(name) {
        this.data = {...this.data, [name]: {
            mailBox: [], readBox: []
        }};
    },
    /**
     * 프로필 삭제
     * @param {String} name 삭제할 프로필의 이름 
     */
    removeProfile(name) {
        let newData = {...this.data};
        delete newData[name];
        this.data = newData;
    },
    /**
     * 해당 프로필의 저장된 보드 필터 리스트를 리턴
     * @param {String} name 해당 프로필 이름 (파라미터 없을 시 현재 프로필 기준으로)
     * @returnss 필터 리스트
     */
    getFilterList(name = this.currentProfile) {
        if (!this.data) return [];
        return this.data[name].filterList;
    },
    /**
     * 해당 프로필의 보드 필터 리스트를 설정
     * @param {String} name 해당 프로필 이름 (default: 현재 프로필)
     * @param {Array} newVal 설정할 필터 리스트
     */
    setFilterList(name = this.currentProfile, newVal) {
        if (this.data) {
            PUT(`${APIURL}/api/profileBox.php`, { column: "filterList", newVal: newVal.join(''), userName: name }).then((res) => {
                if (!res.success) console.error(res.error);
            });
            let newData = {...this.data};
            newData[name].filterList = newVal;
            this.data = newData;
        }
    },
    /**
     * 해당 프로필의 읽음박스 (읽은 카드의 고유키 모음) 리턴
     * @param {String} name 해당 프로필 이름 (default: 현재 프로필)
     * @returnss 해당 프로필의 읽음박스
     */
    getReadBox(name = this.currentProfile) {
        if (!this.data) return [];
        return this.data[name].readBox;
    },
    /**
     * 해당 프로필의 읽음박스 (읽은 카드의 고유키 모음) 설정
     * @param {String} name 해당 프로필 이름 (default: 현재 프로필)
     * @param {Array} newVal 설정할 읽음박스 배열
     */
    setReadBox(name = this.currentProfile, newVal) {
        if (this.data && !this.data[name].readBox.equal(newVal)) {
            PUT(`${APIURL}/api/profileBox.php`, { column: "readBox", newVal: JSON.stringify(newVal), userName: name }).then((res) => {
                if (!res.success) console.error(res.error);
            });
            let newData = {...this.data};
            newData[name].readBox = newVal;
            this.data = newData;
        } 
    },
    refreshReadBox(name = this.currentProfile) {
        this.data[name].readBox = this.data[name].originalReadBox.filter(e => Object.keys(cardData.data).includes(e));
    },

    /**
     * 해당 프로필의 메일박스 (멘션된 카드의 고유키 모음) 리턴
     * @param {String} name 해당 프로필 이름 (default: 현재 프로필)
     */
    getMailBox(name = this.currentProfile) {
        if (!this.data) return [];
        console.log(this.data, name);
        return this.data[name].mailBox;
    },
    /**
     * 해당 프로필의 메일박스 설정
     * @param {String} name 해당 프로필 이름 (default: 현재 프로필)
     * @param {*} newVal 설정할 메일박스 배열
     */
    setMailBox(name = this.currentProfile, newVal) {
        if (this.data) {
            PUT(`${APIURL}/api/profileBox.php`, { column: "mailBox", newVal, newVal: JSON.stringify(newVal), userName: name }).then((res) => {
               if (!res.success) console.error(res.error);
            });
            let newData = {...this.data};
            newData[name].mailBox = newVal;
            this.data = newData;
        } 
    },
    refreshMailBox(name = this.currentProfile) {
        this.data[name].mailBox = this.data[name].originalMailBox.filter(e => Object.keys(cardData.data).includes(e));
    },
}

const quickMemo = {
    /**
     * DB에 데이터 추가 (키값 자동생성)
     * @param {String} content 메모 내용
     */
    addData(content = "") {
        let cardKey = "M" + time.toTimeStr(new Date());
        POST(`${APIURL}/api/quickMemo.php`, {
            cardKey, content
        }).then((res) => {
            if (!res.success) console.error("DB 데이터 추가 실패");
        });
        return cardKey;
    },
    /**
     * DB 데이터 수정
     * @param {String} cardKey 변경할 메모 데이터의 고유키
     * @param {String} content 새로운 내용
     */
    editData(cardKey, content) {
        // TODO 수정 시 맨 위에 오게 하려면 이렇게 해야 함
        DEL(`${APIURL}/api/quickMemo.php`, {
            cardKey
        }).then((res) => {
            if (!res.success) {
                console.error("DB 데이터 삭제 실패");
                return;
            }

            quickMemo.addData(content);
        });

        // PUT(`${APIURL}/api/quickMemo.php`, {
        //     cardKey, content
        // }).then((res) => {
        //     if (!res.success) console.error("DB 데이터 수정 실패");
        // });
    },
    /**
     * DB 데이터 삭제
     * @param {String} cardKey 삭제할 데이터의 고유키
     */
    removeData(cardKey) {
        DEL(`${APIURL}/api/quickMemo.php`, {
            cardKey
        }).then((res) => {
            if (!res.success) console.error("DB 데이터 삭제 실패");
        });
    },
    /**
     * cardKey, content 정보를 바탕으로 document 에 카드 엘리먼트 스폰
     * @param {String} cardKey  스폰할 메모 엘리먼트의 고유키
     * @param {String} content  스폰할 메모 엘리먼트의 내용
     * @returns 스폰한 엘리먼트
     */
    spawnMemoElement(cardKey, content = "") {
        const newMemo = document.createElement("quick-memo");
        newMemo.setAttribute("key", cardKey);
        newMemo.setAttribute("content", content);
        document.querySelector("#memo-board").prepend(newMemo);
        return newMemo;
    },
    /**
     * 데이터에 있는 값을 이용해 document 에 메모 컴포넌트 스폰
     * @param {String} cardKey 스폰할 데이터의 고유키
     */
    spawnMemo(cardKey) {
        GET(`${APIURL}/api/quickMemo.php?cardKey=${cardKey}`).then((res) => {
            if (res.count === 0) {
                console.error("DB 데이터 조회 실패");
                return;
            }
            this.spawnMemoElement(cardKey, res.resultData[cardKey]);
        });
    },
    /**
     * 모든 데이터를 이용해 document 에 모든 메모 컴포넌트 스폰
     */
    spawnAllMemo() {
        GET(`${APIURL}/api/quickMemo.php`).then((res) => {
            if (res.count === 0) return;
            Object.entries(res.resultData)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([cardKey, content]) => {
                this.spawnMemoElement(cardKey, content);
            });
        });
    },
    /**
     * 새로운 메모 생성 (데이터 추가 및 document 에 스폰)
     */
    addNewMemo() {
        const cardKey = this.addData();
        this.spawnMemoElement(cardKey);
    },
    /**
     * 메모 삭제 (데이터 삭제 및 element 삭제)
     * @param {String} cardKey 삭제할 메모의 고유키
     */
    removeMemo(cardKey) {
        document.querySelectorAll("#memo-board > quick-memo").forEach((memo) => {
            if (memo.getAttribute("key") === cardKey) memo.remove();
        });
        this.removeData(cardKey);
    }
}

export { cardData, profileBox, quickMemo };