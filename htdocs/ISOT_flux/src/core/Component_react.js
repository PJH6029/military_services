import { store } from "../store/store.js";
import { DEBUG_LOG } from "../debug.js";

export class Component {
    $el;
    props;
    state;
    constructor($el, props) {
        this.$el = $el; // TODO ref or selector
        this.props = props;
        this.setup();
        this.init();
        this.setEvent(); // use event bubbling
    }

    init() {
        this.state = this.initState();
        store.subscribe(() => {
            this.render();
            console.log(this);
            this.mounted();
        }); // TODO 여기에 오는게 맞나?
    }

    setup() {} // for custom setup

    mounted() {}

    template() { return '' }

    render() {
        this.$el.innerHTML = this.template();
        console.log("rendered", this.$el);
    }

    // set events to target, using event bubbling
    setEvent() {
        // example
        // this.addEvent('click', '.addBtn', ({ target }) => {do something})
    } 

    addEvent(eventType, selector, callback) {
        this.$el.addEventListener(eventType, event => {
            if (!event.target.closest(selector)) return false;
            callback(event);
        });
    }

    initState() {
        return {};
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }
}