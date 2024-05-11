import {PwBox} from "./components/PwBox.js";
import {VaultApp} from "./components/VaultApp.js";
import { ScheduleSelector } from "./components/ScheduleSelector.js";
import { SchedulerApp } from "./components/SchedulerApp.js";
import { ModalCard } from "./components/ModalCard.js";
import { MinimalCardBoard } from "./components/MinimalCardBoard.js";
import { MinimalCard } from "./components/MinimalCard.js";
import { ShortcutContainer } from "./components/ShortcutContainer.js";
import { ChipBtnComponent } from "./components/ChipBtnComponent.js";
import { SimpleCard } from "./components/SimpleCard.js";
import { InnerContainer } from "./components/InnerContainer.js";
import { TextClock } from "./components/TextClock.js";
import { LinkChip } from "./components/LinkChip.js";
import { ToggleChip } from "./components/ToggleChip.js";
import { QuickMemo } from "./components/QuickMemo.js";
import { SideBar } from "./components/SideBar.js";
import { BoardController } from "./components/BoardController.js";
import { CardWriter } from "./components/CardWriter.js";
import { CalenderData } from "./components/CalenderData.js";
import { DateDescription } from "./components/DateDescription.js";
import { CalenderApp } from "./components/CalenderApp.js";
import { cardData, profileBox, quickMemo } from "./handlers/handlers.js";
import { GET, DEL, PUT, POST, APIURL } from "./utils/requests.js";
import { time } from "./utils/time.js";

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
[v2.16 (230929)]
- 소스 코드 모듈화 시작

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

// TODO

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


// TODO editing card
// custom elements
customElements.define("pw-box", PwBox);
customElements.define("vault-app", VaultApp);
customElements.define("schedule-sel", ScheduleSelector);
customElements.define("scheduler-app", SchedulerApp);
customElements.define("modal-card", ModalCard);
customElements.define("minimal-card-board", MinimalCardBoard);
customElements.define("minimal-card", MinimalCard);
customElements.define("shortcut-container", ShortcutContainer);
customElements.define("chip-btn", ChipBtnComponent);
customElements.define("simple-card", SimpleCard); //
customElements.define("inner-container", InnerContainer); // 
customElements.define("text-clock", TextClock);
customElements.define("link-chip", LinkChip);
customElements.define("toggle-chip", ToggleChip);
customElements.define("quick-memo", QuickMemo);
customElements.define("side-bar", SideBar);
customElements.define("board-controller", BoardController);
customElements.define("card-writer", CardWriter);
customElements.define("calender-data", CalenderData);
customElements.define("date-desc", DateDescription);
customElements.define("calender-app", CalenderApp);



/**
 * ----------
 * Initialize
 * ----------
 */
document.querySelector("#add-quickmemo").onclick = () => {
    quickMemo.addNewMemo();
}

const $boardCtrl = document.querySelector("board-controller");
 

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

const $cardBoard = document.querySelector("minimal-card-board");
const $sideBar = document.querySelector("side-bar");

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

$sideBar.updateProfile();