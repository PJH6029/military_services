import { Component } from "../../../core/Component.js";

export class HomeApp extends Component {
    template() {
        return `
            <home-content header-text="신송" size="16" style="flex: 16 1 0%">
                <minimal-card-board mode="read"></minimal-card-board>
            </home-content>
            <home-content header-text="위젯" size="12" style="flex: 12 1 0%">
                <widget-board></wideget-board>
            </home-content>
            <home-content header-text="빠른 메모" size="6" style="flex: 6 1 0%">
                <quick-memo-board></quick-memo-board>
            </home-content>
        `;
    }
}