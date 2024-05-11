import SideBar from "./src/components/SideBar.js";
import Task from "./src/components/Task.js";
import Calender from "./src/components/Calender.js";
import Meeting from "./src/components/Meeting.js";
import TaskItem from "./src/components/TaskItem.js";
import TaskList from "./src/components/TaskList.js";
import TaskCard from "./src/components/TaskCard.js";
import MeetingData from "./src/components/MeetingData.js";
import CardModal from "./src/components/CardModal.js";
import ChipBtn from "./src/components/ChipBtn.js";
import CardEditor from "./src/components/CardEditor.js";
import ToggleChip from "./src/components/ToggleChip.js";

const patch = `
Huge respect to 823 방민수
Made by 837 박정훈
[v1.0 (221221)]
- 개발 시작
- 사이드바 일부 구현 완료
[v1.1 (221225)]
- Task바 구현 완료
- Task 별 보드 구현 완료
- Meeting 포팅 완료, 주 별 모드 구현 완료
[v1.2 (221227)]
- 모달 일부 구현 완료
[v1.3 (221230)]
- Card CRUD 구현 완료
`;

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
 * @DOM 사이드바
 */
const $sideBar = document.querySelector("side-bar");

/**
 * 핸들러
 */



/**
 * 컴포넌트 정의
 */
customElements.define("task-item", TaskItem);
customElements.define("task-list", TaskList);
customElements.define("side-bar", SideBar);
customElements.define("task-card", TaskCard);
customElements.define("task-app", Task);
customElements.define("calender-app", Calender);
customElements.define("meeting-data", MeetingData);
customElements.define("meeting-app", Meeting);
customElements.define("card-modal", CardModal);
customElements.define("chip-btn", ChipBtn);
customElements.define("card-editor", CardEditor);
customElements.define("toggle-chip", ToggleChip);



/**
 * initalize
 */
document.querySelector("side-bar").shadowRoot.querySelector("#isot-info").onclick = () => {
    alert(patch);
}