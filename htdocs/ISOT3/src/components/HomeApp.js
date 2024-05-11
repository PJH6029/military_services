export default class HomeApp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                }

                .container {
                    width: 100%;
                    height: 100%;

                    display: flex;
                    flex-direction: column;
                }

                header {
                    min-height: 4rem;
                    display: flex;
                    gap: 1.5rem;
                    padding: 1rem;
                }

                .content-wrapper {
                    display: flex;
                    gap: 1.5rem;
                    padding: 1rem;
                    overflow: hidden;
                }

                inner-container {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    gap: 1rem;
                    transition: 0.2s ease-in-out;
                }

                .inner-container-header {
                    font-size: 2rem;
                    color: #d8d8d8;
                    font-weight: bold;
                    padding: 0.5rem;
                }

                ::-webkit-scrollbar {
                    display: none;
                }
            </style>
            <div class="container">
                <header>
                    <widget-clock></widget-clock>
                    <widget-clock></widget-clock>
                    <widget-clock></widget-clock>
                    <widget-clock></widget-clock>
                    <!-- <widget-scheduler></widget-scheduler> -->
                    <!-- <widget-meeting></widget-meeting> -->
                </header>
                <div class="content-wrapper">
                    <inner-container header-text="일일 신송" size="12">
                        <minimal-card-board board-table="daily" id="daily-board"></minimal-card-board>
                    </inner-container>
                    <inner-container header-text="공지" size="12">
                        <minimal-card-board board-table="notice" id="notice-board"></minimal-card-board>
                    </inner-container>
                    <inner-container header-text="빠른 메모" size="6">
                        <quick-memo-board></quick-memo-board>
                    </inner-container>
                </div>
            </div>
        `;
    }
}