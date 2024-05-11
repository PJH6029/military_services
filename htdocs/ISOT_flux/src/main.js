import CardWriter from "./components/CardWriter.js";
import { ChipBtn, ChipBtnLink, ChipBtnToggle } from "./components/ChipBtn.js";
import { WidgetClock } from "./components/Clock.js";
import HomeApp from "./components/HomeApp.js";
import InnerContainer from "./components/InnerContainer.js";
import { CardModal, MinimalCard } from "./components/Card.js";
import { MinimalCardBoard, MinimalCardBoardContent, MinimalCardBoardController } from "./components/MinimalCardBoard.js";
import SideBar from "./components/SideBar.js";
import SimpleCard from "./components/Simplecard.js";
import ToggleChip from "./components/ToggleChip.js";
import UserHandler from "./handlers/UserHandler.js";

const patch = `
Made by 837th 박정훈
Prototype source from 823th 방민수
[v1.0 (230408)]
- 개발 시작
`;

const patchDisplay = "v1.0. Last Update: 23. 04. 08.";

// custom elements
customElements.define("simple-card", SimpleCard);
customElements.define("toggle-chip", ToggleChip);

customElements.define("side-bar", SideBar);
customElements.define("home-app", HomeApp);
customElements.define("inner-container", InnerContainer);

customElements.define("minimal-card-board", MinimalCardBoard);
customElements.define("minimal-card-board-content", MinimalCardBoardContent);
customElements.define("minimal-card-board-controller", MinimalCardBoardController);
customElements.define("minimal-card", MinimalCard);

// customElements.define("minimal-daily-card", MinimalCard);
// customElements.define("minimal-notice-card", MinimalNoticeCard);

customElements.define("card-modal", CardModal);
customElements.define("card-writer", CardWriter);

customElements.define("chip-btn", ChipBtn);
customElements.define("chip-btn-link", ChipBtnLink);
customElements.define("chip-btn-toggle", ChipBtnToggle);

customElements.define("widget-clock", WidgetClock);

async function loadData() {
    // card
    // quick memo
    // users
    await UserHandler.loadAllUsers();
    // schedule
    // meeting
}

function renderData() {

}

function setEventListeners() {
    document.querySelector("side-bar").isotInfo.addEventListener("click", () => {
        alert(patch);
    });
}

document.body.onload = () => {
    setEventListeners();
    loadData()
    // .then(() => renderData());
};
