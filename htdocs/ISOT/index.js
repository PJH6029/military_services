async function GET(url) {
    const response = await fetch(url, {
        method: "GET",
        mode: "cors",
    });
    return response.json();
}

async function POST(url, body) {
    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return response.json();
}

async function PUT(url, body) {
    const response = await fetch(url, {
        method: "PUT",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return response.json();
}

async function DEL(url, body) {
    const response = await fetch(url, {
        method: "DELETE",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return response.json();
}

const localTest = false;
const APIURL = !localTest ? "" : ""; // security issue

/**
 * 지정한 항목을 배열에서 삭제 (원본도 수정)
 * @param {*} item 삭제할 항목
 * @returns 삭제가 적용된 배열
 */
Array.prototype.remove = function (item) {
    if (this.indexOf(item) == -1) return this;
    this.splice(this.indexOf(item), 1); return this;
};

Array.prototype.equal = function (a) {
    return this.length === a.length && this.every((e) => a.includes(e));
};

Array.prototype.insert = function (index, item) {
    const back = [...this];
    back.splice(0, index);

    const front = [...this];
    front.splice(index, front.length - 1);

    this.splice(0, this.length);
    let newAry = [];

    newAry = [...front, item, ...back];
    this.push(...newAry);
    return this;
}

Date.prototype.getMaxDate = function () {
    let tempDate = new Date(this);
    tempDate.setDate(31);
    
    return tempDate.getMonth() === this.getMonth() ? 31 : 30;
}

/**
 * ----------
 * 레퍼런스 상수
 * ----------
 */

/**
 * @DOM 보드 컨트롤러
 */
const $boardCtrl = document.querySelector("board-controller");
$boardCtrl.setAttribute("profile", localStorage.getItem("ISOT2-profile"));

/**
 * @DOM 신송 카드 보드
 */
const $cardBoard = document.querySelector("minimal-card-board");

/**
 * @DOM 사이드바
 */
const $sideBar = document.querySelector("side-bar");


/**
 * @property 현재 수정하고 있는 카드, default 는 null
 */
let editingCard = null;

const $schedulerApp = document.querySelector("scheduler-app");

const $vaultApp = document.querySelector("vault-app");

const $calenderApp = document.querySelector("calender-app");

/**
 * ---------
 * 핸들러 & 툴
 * ---------
 */

/**
 * @handler 퀵메모 핸들러
 */
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

/**
 * @handler 신송카드 데이터 핸들러
 */
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
        profileBox.refreshMailBox();
        profileBox.refreshReadBox();
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

/**
 * @handler 프로필 핸들러
 */
const profileBox = {
    currentProfile: null,
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

const schedule2 = {
    async loadScheduleFromDB(userName, ymdStr) {
        await GET(`${APIURL}/api/schedule.php?userName=${userName}&ymd=${ymdStr}`)
    }
}

// 스케쥴 (근무자) 핸들러
const schedule = {
    get data() {
        if (localStorage.hasOwnProperty("ISOT2-scheduleData")) {
            return JSON.parse(localStorage.getItem("ISOT2-scheduleData"));
        } else {
            localStorage.setItem("ISOT2-scheduleData", JSON.stringify({}));
            return {};
        }
    },
    set data(newVal) {
        if (localStorage.hasOwnProperty("ISOT2-scheduleData")) {
            localStorage.setItem("ISOT2-scheduleData", JSON.stringify(newVal));
        } else {
            localStorage.setItem("ISOT2-scheduleData", JSON.stringify({}));
        }
    },
    _getMonthSchedule(rawData) {
        const rawMatrix = rawData.split('\n').map((row) => {
            return row.split('\t');
        });

        const monthText = rawMatrix[0][0];
        const ym = "20" + monthText.substr(0, 2) + monthText.substr(4, 1).padStart(2, 0);

        const dataMatrix = rawMatrix.filter((row, index) => {
            return index !== 0 && index % 2 === 0 && row.length > 1 && index < rawMatrix.length - 4;
        });

        const certList = rawMatrix[rawMatrix.length - 2];
        certList.shift();
        certList.shift();

        const personDataList = dataMatrix.map((row, index) => {
            const rawGrade = rawMatrix[index * 2 + 3][0];
            const grade = rawGrade.substring(rawGrade.length - 3, rawGrade.length - 1);
            const name = row[0];
            const data = [...row].splice(2);
            return { name, grade, data }; 
        });

        const dateList = [...rawMatrix[0]].splice(2);
        const scheduleDataList = dateList.map((d, index) => {
            const ymd = ym + d.toString().padStart(2, 0);
            const dayWorkList = personDataList.filter(({ data }) => data[index] === "주");
            const morningWorkList = personDataList.filter(({ data }) => data[index] === "오전");
            const afterWorkList = personDataList.filter(({ data }) => data[index] === "오후");
            const nightWorkList = personDataList.filter(({ data }) => data[index] === "야");
            return { ymd, morningWorkList, afterWorkList, dayWorkList, nightWorkList }; 
        });

        return { ym, personDataList, scheduleDataList, certList };
    },
    putSchedule(rawData) {
        const schedule = this._getMonthSchedule(rawData);
        const id = schedule.ym;
        this.data = {...this.data, [id]: schedule};
    },
    getDateSchedule(ymd) {
        const { year, month, date } = time.breakTimeStr(ymd);
        return this.data[`${year}${month.toString().padStart(2, 0)}`]?.scheduleDataList[date-1];
    },
    getCert(ymd) {
        const { year, month, date } = time.breakTimeStr(ymd);
        return this.data[`${year}${month.toString().padStart(2, 0)}`]?.certList[date-1];
    },
    getFullInfo(shortName) {
        switch (shortName) {
            case "":
                return
            // security issue
        };
    },
}

// 시간 관련 툴
const time = {
    breakTimeStr(timeStr) {
        let key = ["year", "month", "date", "hours", "minutes", "seconds"];
        let obj = {};
        let ary = [];
        ary.push(timeStr.substr(0, 4));
        for (let i = 1; i < 6; i++) {
            ary.push(timeStr.substr(2*i + 2, 2));
        }

        key.forEach((k, index) => {
            obj[k] = ary[index];
        });

        return obj;
    },
    toTimeStr(dateObj, full = true) {
        const front = dateObj.getFullYear() + (dateObj.getMonth() + 1).toString().padStart(2, 0) + dateObj.getDate().toString().padStart(2, 0);
        const back = dateObj.getHours().toString().padStart(2, 0) + dateObj.getMinutes().toString().padStart(2, 0) + dateObj.getSeconds().toString().padStart(2, 0);
        return full ? front + back : front;
    },
    toTimeObj(timeStr) {
        let timeObj = new Date();
        const { year, month, date, hours, minutes, seconds } = this.breakTimeStr(timeStr);
        
        year && timeObj.setFullYear(year);
        month && timeObj.setMonth(month-1);
        date && timeObj.setDate(date);
        hours && timeObj.setHours(hours);
        minutes && timeObj.setMinutes(minutes);
        seconds && timeObj.setSeconds(seconds);
        return timeObj;
    },
    getDayStr(timeStr) {
        const dayList = ['일', '월', '화', '수', '목', '금', '토'];
        return dayList[this.toTimeObj(timeStr).getDay()];
    }
}

const oldPatch = `
[v1.8 (220516)]
- 스케쥴 오오야비 대응
- 사위대 근무파악 주간 CERT 넣음
- 댓글 기능 (Beta) 추가
- 퀵메모 높이조절 버그 수정

[v1.7 (220422)]
- 근무자 현황에서 요일 보이게
- 모두 읽음으로 표시 버튼 생성

[v1.7 (220416)]
- 댓글 기능 제외하고 신송 기능 구현 완료 (게시판 형식)
- 사이드바 프로필 셀렉터 기능 구현 완료
- 버그 Fix

[v1.6 (220414)]
- 게시판 + 모달 형식으로 변경
- 작성자 추가 (이전 데이터들은 익명으로 처리)
- 댓글 기능 추가 예정 (더미만 있음)
- 보드 컨트롤러 공사중 (카드 추가만 작동)

[v1.5 (220329)]
- DB 내보내기 & 불러오기 기능 구현
- 버그 Fix

[v1.4 (220326)]
- 근무자 현황 (스케쥴) 위젯 구현
- 신송 버튼들 정리
- 이제 읽은 글의 제목은 회색으로 표시됩니다.

[v1.3 (220320)]
- 레이아웃 수정
- 새로운 프로필 셀렉터 더미만 만들어 놓음
- ISOT 검색 삭제
- 빠른 메모에도 자동 높이 구현

[v1.2 (220319)]
- 아이콘 변경
- 맨 위로 올라가는 버튼 svg 아이콘 넣음
- 패스워드 관리 프로그램 (Vault) 아이콘 넣음
- 카드 추가 창에서 입력 높이에 따라 textarea 높이가 자동으로 변경

[v1.2 (220318)]
- 빠른 메모 database 코드 수정
- 맨 위로 올라가는 버튼 구현

[v1.2 (220316)]
- 코드 리펙토링
- 빠른 메모 기능 구현
- 읽음처리하면 자동으로 카드 collpase
- 전체 collapse, 전체 expand 버튼 구현

[v1.1 (220315)]
- 사위대 변환기 구현
- 모두 읽음으로 처리 버튼 구현

[v1.0 (220314)]
- 신송 보드 관련 기능 구현
`;

const patch = `
[v2.15 (230830)]
- 검색 대상을 데이터 전체로 확장

[v2.14 (230704)]
- quick memo 오류 수정

[v2.13 (230314)]
- 한달 지난 공지 안뜨는 오류 해결
- 읽음 / 안읽음 버그 해결
- 스케줄표 좌우 짤리는거 해결
- 각종 최적화

[v.2.12 (230203)]
- ISOTE에 있는 캘린더 주/월 전환 기능 추가

[v.2.11 (221205)]
- 스케줄러 월 별 이동 추가
- 스케줄러 투데이 버튼 추가

[v.2.10 (221114)]
- 휴일 텍스트 버그 수정
- 회의 메모 기본값 변경
- 캘린더 사용법 / 주관사 번호 추가 

[v.2.9 (221112)]
- 캘린더 기본 기능 구현 완료

[v.2.8 (220928)]
- 공지 오류 수정

[v2.7 (220905)]
- 자신의 계정으로만 댓글 / 글 작성 가능
- VAULT (패스워드 관리) 기능 완성

[v2.6 (220831)]
- 신송노트 검색기능 추가

[v2.5 (220822)]
- 공지 기능 추가

[v2.4 (220727)]
- 로그인 기능 추가

[v2.3 (220725)]
- 스케쥴 일정 (공휴일, 훈련일정 등) 입력 구현
- 전역자 자동 숨김 처리 구현

[v2.2 (220724)]
- 스케쥴러 비어있는 값 처리 로직 수정

[v2.2 (220723)]
- 스케쥴러 기본 기능 구현완료

[v2.1 (220708)]
- 카드 삭제 버그 수정 (그냥 DB에 DELETE request를 안보냈음 ㅋㅋ)
- 메모 검색기능 구현완료

[v2.0 (220624)]
- 대규모 업데이트
- DB 서버 구축 및 데이터 연동 (스케쥴 관리 제외)
`;



/**
 * -----------
 * 컴포넌트 정의
 * -----------
 */

customElements.define("pw-box", class PwBox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#pw-box-template").innerHTML;

        this.$titleInput = this.shadowRoot.querySelector(".title");
        this.$idInput = this.shadowRoot.querySelector("#id-input");
        this.$pwInput = this.shadowRoot.querySelector("#pw-input");
        this.$lastDate = this.shadowRoot.querySelector(".last-date");
    }

    init(UID, { title, id, pw, lastDate, category }) {
        this.UID = UID;
        this.category = category;
        this.$titleInput.value = title;
        this.$idInput.value = id;
        this.$pwInput.value = pw;
        this.$lastDate.innerText = `${lastDate.substring(2, 4)}.${lastDate.substring(4, 6)}.${lastDate.substring(6, 8)}\xa0\xa0 ${lastDate.substring(8, 10)}:${lastDate.substring(10, 12)}`;

        $vaultApp.shadowRoot.querySelector("#" + this.category).prepend(this);

        this.attachEventHandler();
    }

    attachEventHandler() {
        this.$showBtn = this.shadowRoot.querySelector(".show-btn");
        this.$showBtn.addEventListener("click", () => {
            this.$pwInput.type = (this.$pwInput.type === "password") ? "text" : "password";
        });

        this.$removeBtn = this.shadowRoot.querySelector(".remove-btn");
        this.$removeBtn.addEventListener("click", () => {
            if (!confirm("ㄹㅇ?")) return;
            $vaultApp.deletePWInfo(this.UID);
        });

        this.$titleInput.addEventListener("change", () => {
            $vaultApp.updatePWInfo(this.UID, { title: this.$titleInput.value });
        });
        this.$idInput.addEventListener("change", () => {
            $vaultApp.updatePWInfo(this.UID, { id: this.$idInput.value });
        });
        this.$pwInput.addEventListener("change", () => {
            $vaultApp.updatePWInfo(this.UID, { pw: this.$pwInput.value });
        });
    }
});

customElements.define("vault-app", class VaultApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#vault-app-template").innerHTML;

        this.showAll = false;
        this.shadowRoot.querySelector(".show-all-btn").addEventListener("click", () => {
            this.shadowRoot.querySelectorAll("pw-box").forEach((pwBox) => {
                pwBox.$pwInput.type = (this.showAll) ? "password" : "text";
            });
            this.showAll = !this.showAll;
        });

        this.init();
    }

    async init() {
        const res = await GET(`${APIURL}/api/vault.php`);
        ["AFCCS", "NAC", "SERVER", "ETC"].forEach((category) => {
            this.shadowRoot.querySelector("#" + category).innerHTML = `<div class="add-div"><div class="add-btn"><img src="./svgs/plus.svg"></div></div>`;
        });

        this.shadowRoot.querySelectorAll(".add-div").forEach((div) => {
            div.addEventListener("click", () => {
                const category = div.parentElement.id;
                this.addPWInfo("", "", "", category);
            });
        });

        Object.entries(res.resultData).sort(([ak, av], [bk, bv]) => parseInt(av.lastDate) - parseInt(bv.lastDate)).forEach(([UID, data]) => {
            const pwBox = document.createElement("pw-box");
            pwBox.init(UID, data);
        });
    }

    addPWInfo(title, id, pw, category) {
        POST(`${APIURL}/api/vault.php`, {
            title, id, pw, category, lastDate: time.toTimeStr(new Date()).substring(0, 12)
        }).then((res) => {
            if (!res.success) console.error(res.error);
            this.init();
        });
    }

    updatePWInfo(UID, newVal) {
        PUT(`${APIURL}/api/vault.php`, {
            UID, ...newVal, lastDate: time.toTimeStr(new Date()).substring(0, 12)
        }).then((res) => {
            if (!res.success) console.error(res.error);
            this.init();
        });
    }

    deletePWInfo(UID) {
        DEL(`${APIURL}/api/vault.php`, {
            UID
        }).then((res) => {
            if (!res.success) console.error(res.error);
            this.init();
        });
    }
});

customElements.define("schedule-sel", class ScheduleSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                input {
                    border: 1px #ececec solid;
                    border-radius: 5px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    font-family: 'kakao';
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    background-color: transparent;
                }

                input[disabled] {
                    border: none;
                    cursor: pointer;
                }

                :host([today]) input {
                    background-color: #00968812;
                }

                :host([desc]) input, :host([calender]) input {
                    font-size: 0.75rem;
                }
    
                :host([vc]) > input, :host([off]) > input {
                    color: #9e9e9e;
                }
    
                :host([day]) > input {
                    color: #009688;
                }
    
                :host([nit]) > input {
                    color: #9c27b0;
                }
    
                :host([am]) > input {
                    color: #ff9800;
                }
    
                :host([pm]) > input {
                    color: #3f51b5;
                }

                :host([hol]) > input {
                    color: #e91e63;
                }
            </style>
            <input type="text" />
        `;

        this.info = { userName: null, ymd: null };

        this.$input = this.shadowRoot.querySelector("input");
        this.$input.addEventListener("change", () => {
            this.value = this.$input.value;

            if (!this.info.userName || !this.info.ymd) return;

            if (this.info.userName === "calender") {
                if (this.value == "") {
                    delete $schedulerApp.calenderData[this.info.ymd];
                    DEL(`${APIURL}/api/schedule.php`, this.info);
                    return;
                }
                $schedulerApp.calenderData[this.info.ymd] = this.value;
                PUT(`${APIURL}/api/schedule.php`, { value: this.value, ...this.info });
                return;
            }

            let index = $schedulerApp.scheduleData[this.info.userName].schedule.findIndex(({ ymd }) => {
                return (ymd === this.info.ymd);
            });

            if (index === -1) {
                const len = $schedulerApp.scheduleData[this.info.userName].schedule.push({ value: "", description: "", ...this.info });
                index = len - 1;
            }

            if (this.hasAttribute("desc")) {
                $schedulerApp.scheduleData[this.info.userName].schedule[index].description = this.value;
                PUT(`${APIURL}/api/schedule.php`, { description: this.value, ...this.info });
            } else {
                $schedulerApp.scheduleData[this.info.userName].schedule[index].value = this.value;
                PUT(`${APIURL}/api/schedule.php`, { value: this.value, ...this.info });
            }

            $schedulerApp.updateScheduleInfo();
            $schedulerApp.renderScheduleInfo();
        });

        this._value = "";
    }

    set value(newVal) {
        this._value = newVal;
        this.$input.value = newVal;

        if (this.hasAttribute("desc")) return;
        
        if (this.hasAttribute("calender")) {
            this.removeAttribute("HOL");
            if (/^\//.test(newVal)) {
                this.setAttribute("HOL", "");
            }

            const index = [...$schedulerApp.$gapRow.querySelectorAll("td")].indexOf(this.parentElement);
            if (this.hasAttribute("HOL")) {
                $schedulerApp.$dateRow.querySelectorAll("td")[index].setAttribute("HOL", "");
            } else {
                $schedulerApp.$dateRow.querySelectorAll("td")[index].removeAttribute("HOL");
            }
        } else {
            this.removeAttribute("VC");
            this.removeAttribute("DAY");
            this.removeAttribute("AM");
            this.removeAttribute("PM");
            this.removeAttribute("NIT");
            this.removeAttribute("OFF");
            this.removeAttribute("HOL");
            switch (newVal) {
                case "휴":
                case "격":
                    this.setAttribute("VC", "");
                    break;
                case "주":
                    this.setAttribute("DAY", "");
                    break;
                case "오전":
                    this.setAttribute("AM", "");
                    break;
                case "오후":
                    this.setAttribute("PM", "");
                    break;
                case "야":
                    this.setAttribute("NIT", "");
                    break;
                case "-":
                case "/":
                    this.setAttribute("OFF", "");
                    break;
            }
        }
    }

    get value() {
        return this._value;
    }
});

customElements.define("scheduler-app", class SchedulerApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#scheduler-template").innerHTML;

        this.$table = this.shadowRoot.querySelector("table");
        this.$monthRow = this.shadowRoot.querySelector(".month-row");
        this.$dateRow = this.shadowRoot.querySelector(".date-row");
        this.$gapRow = this.shadowRoot.querySelector(".gap-row");

        this.$currentMonthBtn = this.shadowRoot.querySelector("#scheduler-current-month-btn");
        this.$nextMonthBtn = this.shadowRoot.querySelector("#scheduler-next-month-btn");
        this.$todayBtn = this.shadowRoot.querySelector("#scheduler-today-btn");

        this.displayInitialDate = new Date();
        this.displayInitialDate.setDate(this.displayInitialDate.getDate() - 4);
        this.startDate = new Date(this.displayInitialDate.getFullYear(), this.displayInitialDate.getMonth(), 1);

        this.scheduleData = {};
        this.calenderData = {};
        this.maxCount = 25;

        this.addEventListener("wheel", (e) => {
            document.activeElement.blur();
            this.displayInitialDate.setDate(this.displayInitialDate.getDate() + (e.deltaY > 0 ? 1 : -1));
            this.renderSchedule();
        });

        this.$currentMonthBtn.addEventListener("click", (e) => {
            this.moveCurrentMonth();
            this.renderSchedule();
        });

        this.$nextMonthBtn.addEventListener("click", (e) => {
            this.moveNextMonth();
            this.renderSchedule();
        });

        this.$todayBtn.addEventListener("click", (e) => {
            this.displayInitialDate = new Date();
            this.displayInitialDate.setDate(this.displayInitialDate.getDate() - 4);
            this.renderSchedule();
        });

        this.initScheduleData();
    }

    moveCurrentMonth() {
        this.startDate = new Date(this.displayInitialDate.getFullYear(), this.displayInitialDate.getMonth(), 1);
        if (this.displayInitialDate.getDate() === 1) {
            this.startDate.setMonth(this.startDate.getMonth() - 1);
        }
        this.displayInitialDate = new Date(this.startDate);
    }

    moveNextMonth() {
        this.startDate = new Date(this.displayInitialDate.getFullYear(), this.displayInitialDate.getMonth(), 1);
        this.startDate.setMonth(this.startDate.getMonth() + 1);
        this.displayInitialDate = new Date(this.startDate);
    }
 
    addScheduleRow() {
        const scheduleRow = document.createElement("tr");
        scheduleRow.className = "schedule-row";

        const nameTd = document.createElement("td");
        nameTd.className = "name-td";

        scheduleRow.appendChild(nameTd);

        for (let i = 0; i < this.maxCount; i++) {
            const td = document.createElement("td");
            td.appendChild(document.createElement("schedule-sel"));
            scheduleRow.appendChild(td);
        }

        const descRow = document.createElement("tr");
        descRow.className = "desc-row";

        const personDescTd = document.createElement("td");
        
        descRow.appendChild(personDescTd);

        for (let i = 0; i < this.maxCount; i++) {
            const td = document.createElement("td");
            const sel = document.createElement("schedule-sel");
            sel.setAttribute("desc", "");
            td.appendChild(sel);
            descRow.appendChild(td);
        }

        this.$table.appendChild(scheduleRow);
        this.$table.appendChild(descRow);
    }

    async initScheduleData() {
        const userListRes = await GET(`${APIURL}/api/schedule.php?type=userList`);
        const userList = userListRes.resultData;

        for (let i = 0; i < this.maxCount; i++) {
            this.$monthRow.appendChild(document.createElement("td"));
            this.$dateRow.appendChild(document.createElement("td"));
        }

        for (let i = 0; i < this.maxCount + 1; i++) {
            const td = document.createElement("td");
            this.$gapRow.appendChild(td);
            if (i === 0) continue;
            const sel = document.createElement("schedule-sel");
            sel.setAttribute("calender", "");
            td.appendChild(sel);
        }

        for (let i = 0; i < userList.length; i++) {
            this.addScheduleRow();

            const scheduleRes = await GET(`${APIURL}/api/schedule.php?userName=${userList[i].name}`);
            // const infoRes = await GET(`${APIURL}/api/schedule.php?type=info&userName=${nameList[i]}`);

            this.scheduleData[userList[i].name] = { schedule: scheduleRes.resultData, info: userList[i] };
        }

        [{ type: "오전", color: "#ff9800" }, { type: "오후", color: "#3f51b5" }, { type: "주간", color: "#009688" }, { type: "야간", color: "#9c27b0" }].forEach(({ type, color }) => {
            const row = document.createElement("tr");
            row.setAttribute("counting", "");
            row.style["color"] = color;
            for (let i = 0; i < this.maxCount + 1; i++) {
                const td = document.createElement("td");
                if (i === 0) td.innerText = type;
                row.appendChild(td);
            }
            this.$table.appendChild(row);
        });

        this.scheduleInfo = {};
        this.updateScheduleInfo();

        const calenderRes = await GET(`${APIURL}/api/schedule.php?type=calender`);
        this.calenderData = calenderRes.resultData ?? {};

        this.renderSchedule();
    }

    updateScheduleInfo() {
        [{ type: "오전", searchName: "오전" }, { type: "오후", searchName: "오후" }, { type: "주간", searchName: "주" }, { type: "야간", searchName: "야" }].forEach(({ type, searchName }) => {
            let dList = Object.entries(this.scheduleData).map(([key, { schedule }]) => {
                return schedule.map(({ ymd }) => ymd);
            });
            let max = 0;
            let maxList = [];
            dList.forEach((list) => {
                if (list.length > max) {
                    max = list.length;
                    maxList = [...list];
                }
            });
            dList = [...maxList];
            dList.forEach((date) => {
                const count = Object.entries(this.scheduleData).filter(([key, { schedule }]) => {
                    const s = schedule.find(({ ymd }) => ymd === date);
                    return s && s.value === searchName;
                }).length;
                
                this.scheduleInfo[date] = { ...this.scheduleInfo[date], [type]: count };
            });
        });
    }

    renderScheduleInfo() {
        this.$table.querySelectorAll("tr[counting]").forEach((tr) => {
            const type = tr.querySelectorAll("td")[0].innerText;
            tr.querySelectorAll("td").forEach((td, i) => {
                if (i !== 0) {
                    const info = this.scheduleInfo[time.toTimeStr(this.dateList[i-1], false)];
                    td.innerText = info ? info[type] : "";
                }
            });
        });
    }

    async renderSchedule() {
        if (!schedule.data) return;

        this.$monthRow.children[0].innerHTML = '<td>Recent.</td>';
        this.$dateRow.children[0].innerHTML = '<td>07.16</td>';

        this.dateList = [];
        for (let i = 0; i < this.maxCount; i++) {
            let c = new Date(this.displayInitialDate);
            c.setDate(this.displayInitialDate.getDate() + i);
            this.dateList.push(c);
        }

        this.dateList.forEach((d, index) => {
            const td = this.$dateRow.children[index + 1];
            td.innerText = d.getDate();

            td.removeAttribute("sun", "");
            td.removeAttribute("sat", "");
            if (d.getDay() === 0) td.setAttribute("sun", "");
            if (d.getDay() === 6) td.setAttribute("sat", "");

            const upper = this.$monthRow.children[index + 1];
            upper.innerText = d.getDate() == 1 ? `${d.getMonth() + 1}월` : '';

            const gap = this.$gapRow.children[index + 1];
            gap.children[0].removeAttribute("today");

            if (time.toTimeStr(d, false) === time.toTimeStr(new Date(), false)) {
                upper.innerText = "✨";
                gap.children[0].setAttribute("today", "");
            }

            gap.children[0].info = { userName: "calender", ymd: time.toTimeStr(d, false) };
            gap.children[0].value = this.calenderData[time.toTimeStr(d, false)] ?? "";
        });

        let count = 0;
        Object.entries(this.scheduleData).sort((a, b) => a[1].info.endDate - b[1].info.endDate).forEach(([userName, { schedule, info }]) => {
            if (parseInt(time.toTimeStr(this.displayInitialDate, false)) <= parseInt(info.endDate)) {
                let nameTd = [...this.$table.querySelectorAll(".name-td")];
                if (!nameTd[count]) {
                    this.addScheduleRow();
                    nameTd = [...this.$table.querySelectorAll(".name-td")];

                    const trList = this.$table.querySelectorAll("tr");
                    if (!trList[trList.length - 1].hasAttribute("counting")) {
                        this.$table.querySelectorAll("tr[counting]").forEach((c) => {
                            this.$table.appendChild(c);
                        });
                    }
                }

                nameTd[count].innerText = userName;

                const scheduleRow = [...this.$table.querySelectorAll(".schedule-row")[count].querySelectorAll("td")];
                scheduleRow.shift();

                const descRow = [...this.$table.querySelectorAll(".desc-row")[count].querySelectorAll("td")];
                const personDesc = descRow.shift();
                
                for (let i = 0; i < this.maxCount; i++) {
                    const iDate = new Date(this.displayInitialDate);
                    iDate.setDate(iDate.getDate() + i);

                    const isToday = time.toTimeStr(iDate, false) === time.toTimeStr(new Date(), false);

                    scheduleRow[i].childNodes[0].removeAttribute("today");
                    descRow[i].childNodes[0].removeAttribute("today");

                    if (isToday) {
                        scheduleRow[i].childNodes[0].setAttribute("today", "");
                        descRow[i].childNodes[0].setAttribute("today", "");
                    }

                    scheduleRow[i].childNodes[0].info = { userName, ymd: time.toTimeStr(iDate, false) };
                    descRow[i].childNodes[0].info = { userName, ymd: time.toTimeStr(iDate, false) };
                    
                    personDesc.innerText = info.grade + "기";

                    const d = schedule.find(({ ymd }) => ymd === time.toTimeStr(iDate, false));
                    const val = d?.value;
                    const desc = d?.description;

                    scheduleRow[i].childNodes[0].value = val ?? "";
                    descRow[i].childNodes[0].value = desc ?? "";
                }

                count++;
            }
        });

        const tdLen = this.$table.querySelectorAll(".schedule-row").length;
        if (tdLen > count) {
            const delCount = tdLen - count;
            for (let i = 0; i < delCount; i++) {
                this.$table.querySelectorAll(".schedule-row")[tdLen - 1 - i].remove();
                this.$table.querySelectorAll(".desc-row")[tdLen - 1 - i].remove();
            }
        }

        this.renderScheduleInfo();
    }
});

/**
 * @component DB 관리 컴포넌트 정의
 */
customElements.define("io-card", class IOCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#io-template").innerHTML;

        /**
         * @DOM 내보내기 버튼
         */
        this.$exportBtn = this.shadowRoot.querySelector("#export-btn");
        this.$exportBtn.addEventListener("click", () => {
            isotDB.exportAsFile();
        });

        /**
         * @DOM 불러오기 버튼
         */
        this.$importBtn = this.shadowRoot.querySelector("#import-btn");
        this.$importBtn.addEventListener("click", () => {
            isotDB.importFromFile();
        });
    }
});

/**
 * @component 모달 컴포넌트 정의
 */
customElements.define("modal-card", class ModalCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#modal-card-template").innerHTML;

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
            editingCard = $cardBoard.querySelector("#" + this.cardKey);
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
        if ($cardBoard.querySelector("#" + this.cardKey)) {
            $cardBoard.querySelector("#" + this.cardKey).setThisCardRead();
        }
        // 맨 처음 읽은 수 계산
        this.updateReadCount();

        this.updateComment();
    }
});

/**
 * @component 신송 게시판 컴포넌트 정의
 */
customElements.define("minimal-card-board", class MinimalCardBoard extends HTMLElement {
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
});

/**
 * @component 신송 카드 컴포넌트 정의
 */
customElements.define("minimal-card", class MinimalCard extends HTMLElement {
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
        $sideBar.updateCounter();
    }

    connectedCallback() {
        this.updateReadCount();
        this.updateReadStyle();
    }
});

/**
 * @component 바로가기 컨테이너 컴포넌트 정의
 */
customElements.define("shortcut-container", class ShortcutContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#shortcut-container-template").innerHTML;
    }
});

/**
 * @component 칩 버튼 컴포넌트 정의
 */
customElements.define("chip-btn", class ChipBtnComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#chip-btn-template").innerHTML;
    }
});

/**
 * @component 근무자 현황 컴포넌트 정의
 */
customElements.define("worker-status", class WorkerStatus extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#worker-status-template").innerHTML;

        this.scope = ["today", "tomorrow"]
        this.adder = 0;
        this.scope.forEach((s) => {
            this[s] = {
                inner: this.shadowRoot.querySelector("#" + s),
                header: this.shadowRoot.querySelector("#" + s + " > .display-header"),
                dayCont: this.shadowRoot.querySelector("#" + s + " .day-cont"),
                nightCont: this.shadowRoot.querySelector("#" + s + " .night-cont"),
                certCont: this.shadowRoot.querySelector("#" + s + " .cert-cont")
            }
        });

        this.btns = {
            cycButton: this.shadowRoot.querySelector("#cyc-btn"),
            putSchedule: this.shadowRoot.querySelector("#put-schedule-btn"),
            left: this.shadowRoot.querySelector(".left"),
            right: this.shadowRoot.querySelector(".right")
        };

        this.putTextarea = this.shadowRoot.querySelector("textarea");

        this.btns.left.addEventListener("click", () => {
            this.adder -=2;
            this.render();
        });

        this.btns.right.addEventListener("click", () => {
            this.adder += 2;
            this.render();
        });

        this.btns.cycButton.addEventListener("click", () => {
            let tomorrowDate = new Date();
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            let afTomorrowDate = new Date(tomorrowDate);
            afTomorrowDate.setDate(afTomorrowDate.getDate() + 1);

            // TODO implement schedule.getDateSchedule() via scheduledb
            const tomorrowSchedule = schedule.getDateSchedule(time.toTimeStr(tomorrowDate, false));
            const afTomorrowSchdule = schedule.getDateSchedule(time.toTimeStr(afTomorrowDate, false));

            const tomorrowNight = tomorrowSchedule.nightWorkList.map((s) => `${s.grade} ${s.name}`);
            
            const { morningWorkList, afterWorkList, dayWorkList } = afTomorrowSchdule;
            const sortedDayWorkList = [...morningWorkList, ...afterWorkList, ...dayWorkList].sort((a, b) => {
                let worker = [a, b];
                let grade = [0, 0];

                worker.forEach((v, i) => {
                    switch (v.grade) {
                        case "병장":
                            grade[i] = 3;
                            break;
                        case "상병":
                            grade[i] = 2;
                            break;
                        case "일병":
                            grade[i] = 1;
                            break;
                        case "이병":
                            grade[i] = 0;
                    }
                });

                return grade[1] - grade[0];
            });
            const afTomorrowDay = sortedDayWorkList.map((s) => `${s.grade} ${s.name}`);

            let nightCert = '';
            let dayCert = '';

            try {
                const nightCertName = schedule.getCert(time.toTimeStr(tomorrowDate, false));
                if (!nightCertName) throw new ErrorEvent("NO_CERT_INFO");

                const { grade: nGrade, name: nName, tel: nTel } = schedule.getFullInfo(nightCertName);
                nightCert = `${nGrade} ${nName} (${nTel})`;

                const dayCertName = schedule.getCert(time.toTimeStr(afTomorrowDate, false));
                if (!dayCertName) throw new ErrorEvent("NO_CERT_INFO");

                const { grade: dGrade, name: dName, tel: dTel} = schedule.getFullInfo(dayCertName);
                dayCert = `${dGrade} ${dName} (${dTel})`;
            } catch (error) {
                console.error("ERROR - " + error.type);
            }

            const defaultDayWorker = afTomorrowDate.getDay() === 0 || afTomorrowDate.getDay() === 6 ? "" : " "; // security issue
            const str = `${tomorrowDate.getDate()}일 야간 근무자: ${tomorrowNight.join(', ')}\n     야간 CERT: ${nightCert}\n${afTomorrowDate.getDate()}일 주간 근무자: ${defaultDayWorker + afTomorrowDay.join(', ')}\n     주간 CERT: ${dayCert}`;

            const invisibleTextArea = document.createElement("textarea");
            this.shadowRoot.appendChild(invisibleTextArea);
            invisibleTextArea.value = str;

            invisibleTextArea.select();
            document.execCommand('Copy');
            invisibleTextArea.remove();
            alert("복사되었습니다");
        });

        this.btns.putSchedule.addEventListener("click", () => {
            if (this.putTextarea.hasAttribute("hidden")) {
                this.putTextarea.removeAttribute("hidden");
                this.btns.putSchedule.innerText = "확인";
            } else {
                if (this.putTextarea.value) {
                    schedule.putSchedule(this.putTextarea.value);
                    this.render();
                    this.putTextarea.value = "";
                }
                this.putTextarea.setAttribute("hidden", "");
                this.btns.putSchedule.innerText = "스케쥴 붙여넣기";
            }
        });

        this.render();  
    }

    render_header() {
        let todayDate = new Date();
        todayDate.setDate(new Date().getDate() + this.adder);
        this.today.ymd = time.toTimeStr(todayDate, false);

        let tomorrowDate = new Date();
        tomorrowDate.setDate(new Date().getDate() + 1 + this.adder);
        this.tomorrow.ymd = time.toTimeStr(tomorrowDate, false);

        this.scope.forEach((s) => {
            const { month, date } = time.breakTimeStr(this[s].ymd);
            const day = time.getDayStr(this[s].ymd);
            this[s].header.innerText = this.adder === 0 ? `${s === "today" ? "오늘" : "내일"} (${month}.${date} ${day})` : `${month}.${date} ${day}`;
        });
    }

    render_schedule() {
        this.scope.forEach((s) => {
            try {
                let newVal = schedule.getDateSchedule(this[s].ymd);
                if (!newVal) throw new ErrorEvent("NO_SCHEDULE_INFO");

                this[s].schedule = {...newVal};
                this[s].dayCont.innerHTML = "";
                this[s].schedule.morningWorkList.forEach((p) => {
                    let div = document.createElement("div");
                    div.innerText = `[A] ${p.name}`;
                    this[s].dayCont.appendChild(div);
                })
                this[s].schedule.afterWorkList.forEach((p) => {
                    let div = document.createElement("div");
                    div.innerText = `[P] ${p.name}`;
                    this[s].dayCont.appendChild(div);
                })
                this[s].schedule.dayWorkList.forEach((p) => {
                    let div = document.createElement("div");
                    div.innerText = p.name;
                    this[s].dayCont.appendChild(div);
                });
                this[s].nightCont.innerHTML = "";
                this[s].schedule.nightWorkList.forEach((p) => {
                    let div = document.createElement("div");
                    div.innerText = p.name;
                    this[s].nightCont.appendChild(div);
                });

                const certFullInfo = schedule.getFullInfo(schedule.getCert(this[s].ymd));
                const certStr = certFullInfo ? `${certFullInfo.grade} ${certFullInfo.name}` : "BLANK";
                this[s].certCont.innerText = `CERT - ${certStr}`;

                if (!certFullInfo) throw new ErrorEvent("NO_CERT_INFO");
            } catch (error) {
                console.warn("ERROR - " + error.type);
            }
        });
    }

    render() {
        this.render_header();
        this.render_schedule();
    }
});

customElements.define("cyc-converter", class CycConverter extends HTMLElement {
    // security issue
});

// 더미 카드 컴포넌트
customElements.define("simple-card", class SimpleCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#simple-card-template").innerHTML;
    }
});

// 컨테이너 컴포넌트
customElements.define("inner-container", class InnerContainer extends HTMLElement {
    static get observedAttributes() {
        return ["header-text", "size"];
    }

    constructor() {
        super();
        this.header = document.createElement("div");
        this.header.className = "inner-container-header";
        this.header.style['order'] = -1;
        this.appendChild(this.header);
    }

    render_headerText() {
       this.header.innerText = this.getAttribute("header-text");
    }

    render_size() {
        this.style['flex'] = this.getAttribute("size");
    }

    render() {
        this.render_headerText();
        this.render_size();
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        switch (attr) {
            case "header-text":
                this.render_headerText();
                break;
            case "size":
                this.render_size();
                break;
        }
    }
});

/**
 * @component 시계 컴포넌트 정의
 */
customElements.define("text-clock", class TextClock extends HTMLElement {
    static get observedAttributes() {
        return ["date", "time"];
    }

    constructor() {
        super();
        this.krDay = ['일', '월', '화', '수', '목', '금', '토'];

        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#clock-template").innerHTML;

        /**
         * @DOM 날짜 컨테이너
         */
        this.$dateDiv = this.shadowRoot.querySelector("#date");
        /**
         * @DOM 시간 컨테이너
         */
        this.$timeDiv = this.shadowRoot.querySelector("#time");
    }

    connectedCallback() {
        const tick = () => {
            const d = new Date();
            const v = {
                h : d.getHours(),
                m : d.getMinutes(),
                s : d.getSeconds(),
                mon : d.getMonth() + 1,
                date : d.getDate(),
                day : this.krDay[d.getDay()]
            };

            Object.keys(v).forEach((k) => {
                if (k !== "day") {
                    v[k] = v[k].toString().padStart(2, "0");
                }
            });

            this.setAttribute("time", `${v.h}:${v.m}:${v.s}`);
            this.setAttribute("date", `${v.mon}월 ${v.date}일 ${v.day}요일`);
        }

        tick();
        setInterval(tick, 1000);
        this.render();
    }

    render_date() {
        if (this.$dateDiv) this.$dateDiv.innerText = this.getAttribute("date");
    }

    render_time() {
        if (this.$timeDiv) this.$timeDiv.innerText = this.getAttribute("time");
    }

    render() {
        this.render_date();
        this.render_time();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        switch (attr) {
            case "date":
                this.render_date();
                break;
            case "time":
                this.render_time();
                break;
        }
    }
});

/**
 * @component 링크 칩 컴포넌트 정의
 */
customElements.define("link-chip", class LinkChip extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#link-chip-style").innerHTML;

        // 눌렀을 때 이벤트 바인딩
        this.addEventListener("click", () => {
            window.open(this.getAttribute("href"), "_blank");
        });
    }
});

/**
 * @component 토글 칩 컴포넌트 정의
 */
customElements.define("toggle-chip", class ToggleChip extends HTMLElement {
    static get observedAttributes() {
        return ["text", "disabled"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#toggle-chip-style").innerHTML;

        /**
         * @DOM 텍스트 컨테이너
         */
        this.$textDiv = this.shadowRoot.querySelector("div");

        // 눌렀을 때 이벤트 바인딩
        this.addEventListener("click", () => {
            this.toggleAttribute("disabled");
        });
    }

    render() {
        this.$textDiv.innerText = this.getAttribute("text");
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this.render();
    }
});

/**
 * @component 퀵 메모 컴포넌트 정의
 */
customElements.define("quick-memo", class QuickMemo extends HTMLElement {
    static get observedAttributes() {
        return ["content"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#quick-memo-template").innerHTML;

        /**
         * @DOM 내용 입력 textarea
         */
        this.$contentTextArea = this.shadowRoot.querySelector("textarea");
        this.$contentTextArea.addEventListener("blur", () => {
            const newVal = this.$contentTextArea.value;
            if (this.getAttribute("content") !== newVal) {
                quickMemo.editData(this.getAttribute("key"), newVal);
            }
            this.setAttribute("content", newVal);
        });

        /**
         * @DOM 카드 삭제 버튼
         */
        this.$removeBtn = this.shadowRoot.querySelector(".remove-btn");
        this.$removeBtn.addEventListener("click", () => {
            quickMemo.removeMemo(this.getAttribute("key"));
        });

        this.updateHeight();
    }

    /**
     * 내용 길이에 따라 textarea 높이를 자동으로 재조정
     * when should executed?
     * 0. Init 시
     * 1. 내용 입력 시
     */
    updateHeight() {
        this.$contentTextArea.style.height = "";
        this.$contentTextArea.style.height = (this.$contentTextArea.scrollHeight + 20) + "px";
    }

    render() {
        this.$contentTextArea.value = this.getAttribute("content");
        this.updateHeight();
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this.render();
    }
});

/**
 * @component 사이드바 컴포넌트 정의
 */
customElements.define("side-bar", class SideBar extends HTMLElement {
    static get observedAttributes() {
        return ["select"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#sidebar-template").innerHTML;

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
});

/**
 * @component 보드 컨트롤러 컴포넌트 정의
 */
customElements.define("board-controller", class BoardController extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#board-controller-template").innerHTML;

        /**
         * @member 현재 삭제 모드인지?
         */
        this.isRemoveMode = false;

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
});

// 카드 작성하는 화면 컴포넌트
customElements.define("card-writer", class CardWriter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#card-writer-template").innerHTML;

        // 입력 받을 값들의 키(중요도 제외)
        const inputKeys = ["title", "writer", "receiver", "contentText"];

        const timeStr = time.toTimeStr(new Date());
        if (editingCard != null) {
            // A. 수정
            // 기존 고유키 가져오기
            this.key = editingCard.id;

            // 입력받은 데이터를 오브젝트화함
            this.inputData = {
                priority: editingCard.priority,
                creationTime: timeStr,
                title: editingCard.title,
                writer: editingCard.writer,
                receiver: editingCard.receiver,
                contentText: cardData.data[editingCard.id].contentText
            };
        } else {
            // B. 새로 만들기
            // 키 생성
            this.key = "C" + timeStr;

            // 입력받은 데이터를 오브젝트화함
            this.inputData = {
                priority: 3,
                creationTime: timeStr,
                writer: profileBox.currentProfile
            };
        }

        /*
            -------------
            데이터 입력 처리
            -------------
        */

        // 1. 중요도 선택 버튼 click 이벤트 바인딩
        this.priorityBtns = this.shadowRoot.querySelectorAll("toggle-chip");
        this.priorityBtns.forEach((b, index) => {
            b.addEventListener("click", () => {
                this.priorityBtns.forEach((e) => {
                    e.setAttribute("disabled", "");
                });
                b.removeAttribute("disabled");
                this.inputData.priority = 3 - index;
            });
        });

        // 2. 나머지 입력 이벤트 바인딩
        // 동적으로 레퍼런스 오브젝트 생성
        this.inputRefs = {};
        inputKeys.forEach((k) => {
            this.inputRefs[k] = this.shadowRoot.querySelector("." + k);
        });
        // writer select 초기 설정
        profileBox.nameList.forEach((name) => {
            let opt = document.createElement("option");
            opt.innerText = name;
            this.inputRefs["writer"].appendChild(opt);
        });
        this.inputRefs["writer"].value = this.inputData["writer"];
        // 이벤트 바인딩
        Object.entries(this.inputRefs).forEach(([key, ref]) => {
            ref.addEventListener("change", () => {
                this.inputData[key] = ref.value;
            });
        });

        // 3. 확인 버튼 이벤트 (카드 생성)
        this.confirmBtn = this.shadowRoot.querySelector("#confirm-btn");
        this.confirmBtn.addEventListener("click", () => {
            if (this.inputData.receiver) {
                let filteredList = this.inputData.receiver.split("@").filter((e) => { return e != ''; }).map((e) => {
                    let e1 = e.replace(' ', '');
                    let e2 = e1.replace(',', '');
                    return e2;
                });
    
                if (filteredList.length === 1 && filteredList[0] === "전체") {
                    filteredList = profileBox.nameList;
                }
                filteredList.forEach((p) => {
                    if (!profileBox.getMailBox(p).includes(this.key)) profileBox.setMailBox(p, [...profileBox.getMailBox(p), this.key]);
                });
            }
            
            
            // -> 수정일 경우
            if (editingCard != null) {
                cardData.editData(this.key, this.inputData);
                cardData.removeMinimalCard(this.key);
                editingCard = null;
            } else {
                this.inputData.commentCount = 0;
                cardData.addData(this.key, this.inputData);
            }
            cardData.spawnMinimalCard(this.key);
            this.exit();
        });

        // -> 수정일 경우
        if (editingCard != null) {
            this.priorityBtns.forEach((b) => {
                b.setAttribute("disabled", "");
            });
            this.priorityBtns[3 - this.inputData.priority].removeAttribute("disabled");

            Object.entries(this.inputRefs).forEach(([key, ref]) => {
                ref.value = this.inputData[key];
            });
        }

        /*
            ---------
            종료 이벤트
            ---------
        */

        // 취소 버튼 눌렀을 때...
        this.cancelBtn = this.shadowRoot.querySelector("#cancel-btn");
        this.cancelBtn.addEventListener("click", () => {
            this.exit();
        });

        // 모달 바깥부분 눌렀을 때...
        this.clickAreas = this.shadowRoot.querySelectorAll(".click");
        this.clickAreas.forEach((c) => {
            c.addEventListener("click", (e) => {
                this.exit();
            });
        });

        // Esc 눌렀을 때...
        this.escBindingFunc = (e) => {
            if (e.key === "Escape") {
                this.exit();
                window.removeEventListener("keydown", this.escBindingFunc);
            }
        };
        window.addEventListener("keydown", this.escBindingFunc);

        this.contentInput = this.shadowRoot.querySelector(".contentText");
        this.contentInput.addEventListener("input", () => {
           this.updateHeight();
        });
    }

    // 입력 내용에 맞춰서 textarea 높이 조절
    updateHeight() {
        this.contentInput.style.height = "";
        this.contentInput.style.height = (this.contentInput.scrollHeight + 10) + "px";
    }

    // 종료 이벤트
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
        this.updateHeight();
    }
});

customElements.define("calender-data", class CalenderData extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#calender-data-template").innerHTML;

        this.$calenderApp = document.querySelector("calender-app");

        this.info = { ymd: null };

        this.$contentTextArea = this.shadowRoot.querySelector("textarea");
        this.$contentTextArea.addEventListener("change", () => {
            this.value = this.$contentTextArea.value;
            if (!this.info.ymd) return;

            if (this.value === "") {

               delete $calenderApp.calenderTxtData[this.info.ymd];
               DEL(`${APIURL}/api/calender.php`, this.info);
               return;
            }

            $calenderApp.calenderTxtData[this.info.ymd] = this.value;
            PUT(`${APIURL}/api/calender.php`, { content: this.value, ...this.info });
        });

        this._value = "";
    }

    set value(newVal) {
        this._value = newVal;
        this.$contentTextArea.value = newVal;
    }

    get value() {
        return this._value;
    }
});

customElements.define("date-desc", class DateDescription extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#date-desc-template").innerHTML;

        // TODO delete userName
        this.info = { userName: null, ymd: null };

        this.$input = this.shadowRoot.querySelector("input");
        this.$input.addEventListener("change", () => {
            this.value = this.$input.value;

            if (!this.info.userName || !this.info.ymd) return;

            if (this.info.userName === "calender") {
                if (this.value === "") {
                    delete $calenderApp.calenderData[this.info.ymd]; // TODO 굳이 이중화할 필요 없긴 한데..
                    DEL(`${APIURL}/api/schedule.php`, this.info);
                    return;
                }

                $calenderApp.calenderData[this.info.ymd] = this.value;
                PUT(`${APIURL}/api/schedule.php`, { value: this.value, ...this.info });
            }
        });

        this._value = "";
    }

    set value(newVal) {
        this._value = newVal;
        this.$input.value = newVal;

        this.removeAttribute("HOL");
        if (/^\//.test(newVal)) {
            this.setAttribute("HOL", "");
        }

        const tmp = this.parentElement.id.split("-").slice(2);
        if (this.hasAttribute("HOL")) {
            $calenderApp.$table.querySelector(`#calender-week${parseInt(tmp[0])}`).querySelectorAll("td")[parseInt(tmp[1])].setAttribute("HOL", "");
        } else {
            $calenderApp.$table.querySelector(`#calender-week${parseInt(tmp[0])}`).querySelectorAll("td")[parseInt(tmp[1])].removeAttribute("HOL");
        }
    }

    get value() {
        return this._value;
    }
});

customElements.define("calender-app", class CalenderApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#calender-template").innerHTML;

        this.$table = this.shadowRoot.querySelector("table");
        // this.$headerRow = this.shadowRoot.querySelector(".header-row");
        this.$dayRow = this.shadowRoot.querySelector(".day-row");

        this.$calenderContaier = this.shadowRoot.querySelector(".calender-container");

        this.displayInitialDate = new Date();
        this.startDate = new Date();
        this.initDate();

        this.displayInitialDateWeek = new Date();
        this.initDateWeek();

        this.calenderData = {};
        this.maxRow = 6;
        this.numDays = 7;
        this.dayList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        this.$prevMonthBtn = this.shadowRoot.querySelector("#prev-month-area");
        this.$nextMonthBtn = this.shadowRoot.querySelector("#next-month-area");
        this.$todayBtn = this.shadowRoot.querySelector("#today-btn");
        this.$howToUseBtn = this.shadowRoot.querySelector("#how-to-use-btn");
        this.$howToUseCloseBtn = this.shadowRoot.querySelector("#how-to-use-close-btn");
        this.$numbersBtn = this.shadowRoot.querySelector("#numbers-btn");

        this.isWeekCurrent = true;
        this.checkBox = this.shadowRoot.querySelector(".checkbox");
        this.checkBox.addEventListener("click", () => {
            if (!this.checkBox.checked) {
                // 월
                this.renderCalender(true);
            } else {
                // 주
                this.renderCalender();
            }
        });

        this.$prevMonthBtn.addEventListener("click", (e) => {
            if (this.isWeekCurrent) {
                this.movePrevWeek();
            } else {
                this.movePrevMonth();
            }
            this.renderCalender(this.isWeekCurrent);
        });
        
        this.$nextMonthBtn.addEventListener("click", (e) => {
            if (this.isWeekCurrent) {
                this.moveNextWeek();
            } else {
                this.moveNextMonth();
            }
            this.renderCalender(this.isWeekCurrent);
        });

        this.$todayBtn.addEventListener("click", (e) => {
            if (this.isWeekCurrent) {
                this.initDateWeek();
            } else {
                this.initDate();
            }
            this.renderCalender(this.isWeekCurrent);
        });

        this.$howToUseBtn.addEventListener("click", (e) => {
            this.$howToUseBtn.toggleAttribute("desc");
            if (this.$howToUseBtn.hasAttribute("desc")) {
                // TODO find better way 
                setTimeout(() => {
                    this.$howToUseBtn.innerText = ""; // security issue
                }, 210);
            } else {
                this.$howToUseBtn.innerText = "How to Use";
            }
        });

        // TODO UI
        this.$numbersBtn.addEventListener("click", (e) => {
            alert(`

            `); // security issue
        });

        // TODO backup?
        // this.initCalender();
        this.initWeekCalender();
        this.loadCalenderData().then(() => {
            console.log("Loading calender data finished");
            this.renderCalender(true);
        });
    }

    initDate() {
        const today = new Date();
        const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.startDate = monthStartDate;
        this.displayInitialDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() - this.startDate.getDay());
    }

    initDateWeek() {
        const today = new Date();
        const weekStartkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        this.displayInitialDateWeek = weekStartkDate;
    }

    movePrevMonth() {
        this.startDate.setMonth(this.startDate.getMonth() - 1);
        this.displayInitialDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() - this.startDate.getDay());
    }

    moveNextMonth() {
        this.startDate.setMonth(this.startDate.getMonth() + 1);
        this.displayInitialDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate() - this.startDate.getDay());
    }

    movePrevWeek() {
        this.displayInitialDateWeek = new Date(this.displayInitialDateWeek.getFullYear(), this.displayInitialDateWeek.getMonth(), this.displayInitialDateWeek.getDate() - 7);
    }

    moveNextWeek() {
        this.displayInitialDateWeek = new Date(this.displayInitialDateWeek.getFullYear(), this.displayInitialDateWeek.getMonth(), this.displayInitialDateWeek.getDate() + 7);
    }
    
    renderCalender(week=false) {
        if (week) {
            if (!this.isWeekCurrent) this.initWeekCalender();
            this.renderWeekCalender();
            this.isWeekCurrent = true;
        } else {
            if (this.isWeekCurrent) this.initMonthCalender();
            this.renderMonthCalender();
            this.isWeekCurrent = false;
        }
    }

    renderWeekCalender() {
        const weekList = [];
        for (let i = 0; i < this.numDays; i++) {
            let d = new Date(this.displayInitialDateWeek);
            d.setDate(this.displayInitialDateWeek.getDate() + i);
            weekList.push(d);
        }

        weekList.forEach((d, i) => {
            const div = this.$calenderContaier.querySelector(`.week:nth-child(${i+1})`);
            div.querySelector(".date").innerText = d.getDate() == 1 ? `${d.getMonth() + 1}. ${d.getDate()}` : `${d.getDate()}`;
            
            const memo = div.querySelector("calender-data");

            div.removeAttribute("today");
            memo.removeAttribute("today");
            if (time.toTimeStr(d, false) === time.toTimeStr(new Date(), false)) {
                div.setAttribute("today", "");
                div.querySelector("calender-data").setAttribute("today", "");
            }

            memo.info = { ymd: time.toTimeStr(d, false) };
            memo.value = this.calenderTxtData[time.toTimeStr(d, false)] ?? "";
        })
        this.$calenderContaier.querySelector(`.week:nth-child(7)`).style.display = "none";
        this.$calenderContaier.querySelector(`.week:nth-child(1)`).style.display = "none";
    }

    renderMonthCalender() {
        // if (!calender.data) return; TODO
        this.weekList = [];
        for (let i = 0; i < this.maxRow; i++) {
            let week = [];
            for (let j = 0; j < this.numDays; j++) {
                let d = new Date(this.displayInitialDate);
                d.setDate(this.displayInitialDate.getDate() + i * this.numDays + j);
                week.push(d);
            }
            this.weekList.push(week);
        }

        let startDateList = [];
        const weekRows = this.$table.querySelectorAll(".week-row");
        const descRows = this.$table.querySelectorAll(".desc-row");
        const memoRows = this.$table.querySelectorAll(".memo-row");

        this.weekList.forEach((week, i) => {
            const weekRow = [...weekRows[i].querySelectorAll("td")];
            const descRow = [...descRows[i].querySelectorAll("td")];
            const memoRow = [...memoRows[i].querySelectorAll("td")];
            week.forEach((d, j) => {
                const weekTd = weekRow[j];
                const descTd = descRow[j];
                const memoTd = memoRow[j];

                weekTd.innerText = d.getDate() == 1 ? `${d.getMonth() + 1}. ${d.getDate()}` : `${d.getDate()}`;

                weekTd.removeAttribute("today");
                descTd.children[0].removeAttribute("today");
                memoTd.children[0].removeAttribute("today");
                if (time.toTimeStr(d, false) === time.toTimeStr(new Date(), false)) {
                    weekTd.setAttribute("today", "");
                    descTd.children[0].setAttribute("today", ""); // ㅏㅏ 왜 이렇게 짰지.. 이미 건너버린 강
                    memoTd.children[0].setAttribute("today", "");
                }

                if (d.getDate() == 1) {
                    startDateList.push([d, i]);
                }

                if (j == 0) {
                    weekTd.setAttribute("sun", "");
                    descTd.setAttribute("sun", "");
                    memoTd.setAttribute("sun", "");
                } else if (j == 6) {
                    weekTd.setAttribute("sat", "");
                    descTd.setAttribute("sat", "");
                    memoTd.setAttribute("sat", "");
                }

                weekTd.removeAttribute("before");
                weekTd.removeAttribute("after");
                descTd.children[0].removeAttribute("before");
                descTd.children[0].removeAttribute("after");
                memoTd.children[0].removeAttribute("before");
                memoTd.children[0].removeAttribute("after");

                if (parseInt(time.toTimeStr(d, false).slice(0, 6)) < parseInt(time.toTimeStr(this.startDate, false).slice(0, 6))) {
                    weekTd.setAttribute("before", "");
                    descTd.children[0].setAttribute("before", "");
                    memoTd.children[0].setAttribute("before", "");
                } else if (parseInt(time.toTimeStr(d, false).slice(0, 6)) > parseInt(time.toTimeStr(this.startDate, false).slice(0, 6))) {
                    weekTd.setAttribute("after", "");
                    descTd.children[0].setAttribute("after", "");
                    memoTd.children[0].setAttribute("after", "");
                }


                descTd.children[0].info = { userName: "calender", ymd: time.toTimeStr(d, false) };
                descTd.children[0].value = this.calenderData[time.toTimeStr(d, false)] ?? "";

                memoTd.children[0].info = { ymd: time.toTimeStr(d, false) };
                memoTd.children[0].value = this.calenderTxtData[time.toTimeStr(d, false)] ?? "";
            });
        });
    }

    addWeekRow(idx) {
        const weekRow = document.createElement("tr");
        weekRow.className = "week-row";
        weekRow.id = `calender-week${idx}`;

        for (let i = 0; i < this.numDays; i++) {
            const td = document.createElement("td");
            td.id = `date-idx-${idx}-${i}`;
            weekRow.appendChild(td);
        }

        const descRow = document.createElement("tr");
        descRow.className = "desc-row";

        for (let i = 0; i < this.numDays; i++) {
            const td = document.createElement("td");
            td.id = `desc-idx-${idx}-${i}`;
            const sel = document.createElement("date-desc");
            td.appendChild(sel);
            descRow.appendChild(td);
        }

        const memoRow = document.createElement("tr");
        memoRow.className = "memo-row";

        for (let i = 0; i < this.numDays; i++) {
            const td = document.createElement("td");
            const sel = document.createElement("calender-data");
            td.appendChild(sel);
            memoRow.appendChild(td);
        }

        this.$table.appendChild(weekRow);
        this.$table.appendChild(descRow);
        this.$table.appendChild(memoRow);
    }

    initMonthCalender() {
        this.$calenderContaier.innerHTML = `<table><tr class="day-row"></tr></table>`;
        this.$calenderContaier.removeAttribute("week");
        this.$table = this.shadowRoot.querySelector("table");
        this.$dayRow = this.shadowRoot.querySelector(".day-row");
        this.dayList.forEach((day, i) => {
            const td = document.createElement("td");
            td.innerText = day;

            td.removeAttribute("sun", "");
            td.removeAttribute("sat", "");
            if (i === 0) td.setAttribute("sun", "");
            if (i === 6) td.setAttribute("sat", "");
            this.$dayRow.appendChild(td);
        });

        for (let i = 0; i < this.maxRow; i++) {
            this.addWeekRow(i);
        }
    }

    initWeekCalender() {
        this.$calenderContaier.innerHTML = "";
        this.$calenderContaier.setAttribute("week", "");
        this.dayList.forEach((day, i) => {
            const div = document.createElement("div");
            div.classList.add("week");
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("week-info", "day");
            dayDiv.innerText = day;

            const dateDiv = document.createElement("div");
            dateDiv.classList.add("week-info", "date");
            dateDiv.innerText = 30;

            const calenderData = document.createElement("calender-data");
            calenderData.setAttribute("week", "");

            if (i === 0) {
                dayDiv.setAttribute("sun", "");
                dateDiv.setAttribute("sun", "");
            }
            if (i === 6) {
                dayDiv.setAttribute("sat", "");
                dateDiv.setAttribute("sat", "");
            }

            div.append(dayDiv, dateDiv, calenderData);
            this.$calenderContaier.appendChild(div);
        });
    }

    async loadCalenderData() {
        const calenderTxtRes = await GET(`${APIURL}/api/calender.php`);
        this.calenderTxtData = calenderTxtRes.resultData ?? {};
    }
});

/**
 * ----------
 * Initialize
 * ----------
 */

// 메모 검색 기능
const $searchMemoInput = document.querySelector("#search-memo-input");
$searchMemoInput.addEventListener("keyup", () => {
    const inputVal = $searchMemoInput.value;
    document.querySelectorAll("#memo-board > quick-memo").forEach((m) => {
        m.style["display"] = "";
    });
    if (!inputVal) return;
    document.querySelectorAll("#memo-board > quick-memo").forEach((m) => {
        if (!m.getAttribute("content").includes(inputVal)) m.style["display"] = "none";
    });
});

const $searchInput = $cardBoard.shadowRoot.querySelector("#search-input");
$searchInput.addEventListener("change", async () => {
    const inputVal = $searchInput.value;
    $cardBoard.querySelectorAll("minimal-card").forEach((m) => {
        m.setAttribute("hidden", "");
    });
    $cardBoard.querySelectorAll("minimal-card[search-result='']").forEach(m => {
        m.remove();
    });
    if (!inputVal) {
        $cardBoard.querySelectorAll("minimal-card").forEach((m) => {
            m.removeAttribute("hidden");
        });
        return;
    }

    const { resultData } = await GET(`${APIURL}/api/cardData.php?keyword=${inputVal}`);
    // $cardBoard.querySelectorAll("minimal-card").forEach((m) => {
    //     if (!resultData.includes(m.id)) m.setAttribute("hidden", "");
    // });
    Object.entries(resultData).forEach(([key, data]) => {
        const mcard = cardData.spawnMinimalCardFromData(key, data);
        mcard.setAttribute("search-result", "");
    });
});

// 모든 퀵메모 스폰
quickMemo.spawnAllMemo();

document.body.onload = () => {
    document.querySelectorAll("quick-memo").forEach((q) => {
        q.updateHeight();
    });
}

const todayDateObj = new Date();
const lastMonthDateObj = new Date(todayDateObj);
lastMonthDateObj.setMonth(lastMonthDateObj.getMonth() - 2);
cardData.loadDataFromDB(time.toTimeStr(lastMonthDateObj)).then(() => {
    profileBox.loadDataFromDB().then(() => {
        console.log("Load Complete.");
        // 모든 신송 카드 스폰
        cardData.spawnAllPinnedCard();
        cardData.spawnAllMinimalCard();
        $sideBar.updateCounter();

        $boardCtrl.loadFilterStyle();
    });
});