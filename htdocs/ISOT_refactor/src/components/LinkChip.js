export class LinkChip extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = document.querySelector("#link-chip-template").innerHTML;

        // 눌렀을 때 이벤트 바인딩
        this.addEventListener("click", () => {
            window.open(this.getAttribute("href"), "_blank");
        });
    }
}