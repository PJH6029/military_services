import UserContainer from "./components/UserContainer.js";
import UserBox from "./components/UserBox.js";
import ChatContainer from "./components/ChatContainer.js";
import ChatController from "./components/ChatController.js";
import ChatBox from "./components/ChatBox.js";
import { KEYCODE_SHIFT, POP_UP_TIME } from "./utils/const.js";
import EmojiContainer from "./components/EmojiContainer.js";
import UserHandler from "./handlers/UserHandler.js";
import ChatHandler from "./handlers/ChatHandler.js";


const patch = `
Made by 837 박정훈
Prototype source from 823 방민수, 836 이승민
[v1.0 (230203)]
- 개발 시작
[v1.1 (230209)]
- FE도 다 서버로 올려야징
[v1.2 (230211)]
- 기본적인 구현 완료
[v1.3 (230224)]
- 알림창 기본 구현 완료(버그 존재)
[v1.4 (230228)]
- 알림창 위치 수정, refresh 주기 30초로
`

const patchDisplay = 'v1.4. Last Update: 23. 02. 28.';


/**
 * initialize
 */

/**
 * custom elements
 */
customElements.define("user-container", UserContainer);
customElements.define("user-box", UserBox);
customElements.define("emoji-container", EmojiContainer);
customElements.define("chat-container", ChatContainer);
customElements.define("chat-box", ChatBox);
customElements.define("chat-controller", ChatController);
 
function setEventListeners() {
	//nav
	document.getElementById("how-to-use").addEventListener("click", () => {
		document.querySelector("chat-controller").createPopup(`
			1. 사용자를 눌러 대화하세요<br><br>
			2. 채팅을 쉴 때는, [채팅창 초기화] 또는 [채팅 그만하기] 버튼을 눌러주세요. <br> 서버가 힘들어합니다.<br><br>
			3. 이모지를 보내보세요<br><br>
			4. 채팅을 우클릭해서 답장을 보내보세요<br><br>
			5. 쉬프트를 누른 채로 엔터를 누르면 줄바꿈이 됩니다.<br><br>
			6. 이틀 이상 지난 채팅은 삭제됩니다. 계정 삭제 시 모든 채팅이 삭제됩니다.<br><br>
			7. 채팅 알람을 받으시려면 팝업 차단을 해제해주세요
		`, 3 * POP_UP_TIME);
	});

	document.getElementById("reset-chat").addEventListener("click", () => {
		document.querySelector("chat-container").setAttribute("partner-id", "none");

		document.querySelector("chat-container").resetInnerChatContainer();
	});

	document.getElementById("drop-chat").addEventListener("click", () => {
		document.querySelector("chat-container").setAttribute("partner-id", "none");
	});
	
	document.getElementById("logout-btn").addEventListener("click", () => {
		location.replace("./auth/logout.php");
	});
}

function isPopupBlocked() {
	const testWindow = window.open(", ", "width=1,height=1,scrollbars=no,menubar=no,location=no,status=no,resizable=no");
	let error = false;
	try {
		const child = testWindow.focus();
	} catch (e) {
		error = true
	}
	if (!error) {
		testWindow.close();
	}
	return error;
}

document.body.onload = () => {
	setEventListeners();
	console.log(isPopupBlocked());
	document.getElementById("ver-info").innerText = patchDisplay;
	document.querySelector("chat-controller").ensureListeningChatUpdate();
}

document.addEventListener("visibilitychange", () => {
	if (document.hidden) {
		console.log("hidden");
		document.querySelector("chat-container").setAttribute("partner-id", "none");
		// TODO 탭 나갔을 때 알림은 ok 이제 채팅 중에 다른 사람 채팅만 보면 됨 
	} else {
		console.log("show");
	}
});