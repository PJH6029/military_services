import { DEBUG_LOG } from "../debug.js";

export const mutations = {
    SET: (state, payload) => {
        const keys = payload.key.split(".");
        let target = state;
        for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]];
        }
        console.log(state, target, keys[keys.length - 1], payload.value);
        target[keys[keys.length - 1]] = payload.value;
    },
    // SET_PARTIAL: (state, payload) => {
    //     const keys = payload.key.split(".");
    //     let target = state;
    //     for (let i = 0; i < keys.length - 1; i++) {
    //         target = target[keys[i]];
    //     }
    //     console.log(state, target, keys[keys.length - 1], payload.value);
    //     target[keys[keys.length - 1]] = {...target, ...payload.value}; // need to spread observable (access target)
    // } TODO for 편의성
    SELECT_APP: (state, payload) => {
        console.log("select", payload);
        state.global.currentApp = payload.currentAppName;
    },
    SET_ALL_CARDS: (state, payload={}) => {
        const { cards } = payload;
        state.cards.data = { ...cards };
    },
    GET_ALL_CARDS: (state, payload={}) => {
        return state.cards.data;
    },
};