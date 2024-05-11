import { Store } from "../core/Store.js";
import { mutations } from "./mutations.js";
import { actions } from "./actions.js";

export const store = new Store({
    state: {
        global: {
            version: "",
            lastUpdate: "",
            apps: [],
            currentApp: "",
        },
        cards: {
            data: {},
        }
    },
    mutations: mutations,
    actions: actions,
});