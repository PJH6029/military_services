export class Component extends HTMLElement {
    state;

    constructor() {
        super();
        this.state = this.initState();
        this.beforeTemplate();
        this.attachTemplate();
        this._initTemplate = "__INITIAL_TEMPLATE__";
        this._initiated = false;
        this.init();
        this.setEvent();
    }


    addEvent(eventType, selector, callback) {
        this.addEventListener(eventType, event => {
            console.log(event.target, selector, event.target.closest(selector));
            if (!event.target.closest(selector)) return false;
            callback(event);
        });
    }
    
    setEvent() {}

    beforeTemplate() {}

    template() {
        return this._initTemplate;
    }

    attachTemplate() {
        // this.attachShadow({ mode: "open" });
        const template = this.template();
        if (template !== this._initTemplate) {
            this.innerHTML = this.template();
        }
    }

    init() {}

    initState() {
        return {};
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        // TODO render? 일단은 수동
    }
}