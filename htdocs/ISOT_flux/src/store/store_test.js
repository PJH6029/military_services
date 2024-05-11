import { observable, observe } from "../core/observer.js";
import { Store } from "../core/Store.js";
import {GET, APIURL} from "../utils/requests.js";

const initState = {
    a: 1,
    b: "one",
    c: null,
    e: undefined,
    g: {
        g1: 1,
        g2: 2,
        g3: {
            g11: 11,
            g12: 1,
            g13: 2,
        }
    },
    h: [1, 2, 3],
    i: {
        i1: 1,
        i2: {
            i21: {
                i211: 1,
                i212: 2,
            },
        }
    }
};

export const SET_A = "SET_A";
/////////// test observable
console.log("OBSERVALBE TEST");

const observableObj = observable(initState);

console.log(observableObj);
console.log("\n");
observe(() => console.log(`a:${observableObj.a}, b:${observableObj.b}`));
observe(() => console.log(`b:${observableObj.b}, h[1]:${observableObj.h[1]}`));
observe(() => console.log(`b:${observableObj.b}, h[1]:${observableObj.h[1]} 222222`));
observe(() => console.log(`a:${observableObj.a}, b:${observableObj.b} 222222`));
observe(() => console.log(`a:${observableObj.a}, g.g1:${observableObj.g.g1}, g.g3.g11:${observableObj.g.g3.g11}`));
observe(() => console.log(`a:${observableObj.a}, g.g1:${observableObj.g.g1}, g.g3.g11:${observableObj.g.g3.g11} 222`));
observe(() => console.log(`i:${observableObj.i}, i.i2:${observableObj.i.i2} i.i2.i21:${observableObj.i.i2.i21}`));


console.log("\niterate state");
Object.keys(observableObj).forEach(key => console.log(key, observableObj[key]));
Object.keys(observableObj.g).forEach(key => console.log(key, observableObj.g[key]));
observableObj.h.forEach(item => console.log(item));
// console.log("\nstate.a = 10");
// observableObj.a = 10;
// console.log("\nstate.g.g1 = 20");
// observableObj.g.g1 = 20;
// console.log("\nstate.g.g3.g11 = 40");
// observableObj.g.g3.g11 = 40;
// console.log("\nstate.h[1] = 40");
// observableObj.h[1] = 40;
// console.log("\nstate.g = {g1:10,g2:30,g3:40}");
// observableObj.g = {g1:10,g2:30,g3:40};
// console.log("\nstate.g = {g1:10,g2:30,g3:{g11:123,g12:234,g13:345}}"); // observer 그대로 가져가는지
// observableObj.g = {g1:10,g2:30,g3:{g11:123,g12:234,g13:345}};
// console.log("\nstate.h = [5,6,7]"); // array test
// observableObj.h = [5,6,7];
// // console.log("\nstate.i = {i1: 123}");
// // observableObj.i = {i1: 123};
// // console.log("\nstate.i = {i2: 12345}");
// // observableObj.i = {i2: 12345};
// console.log("\nstate.i = {i2: {i21: 21}}");
// observableObj.i = {i2: {i21: 21}};
// console.log("\nstate.i = {i2: {i21: {i212: 212}}}");
// observableObj.i = {i2: {i21: {i212: 212}}};
let s = observableObj;
s = observableObj.i;
console.log(s);
s.i2 = 101;
console.log(s);
console.log("\n");


///////////// test store

console.log("STORE TEST");

export const store = new Store({
    state: initState,
    mutations: {
        SET_A: (state, payload) => {
            state.a = payload;
        },
        SET_G: (state, payload) => {
            state.g = payload;
        },
        SET_G_G1: (state, payload) => {
            state.g.g1 = payload;
        },
        SET_G_G3_G11: (state, payload) => {
            state.g.g3.g11 = payload;
        },
        SET_H1: (state, payload) => {
            state.h[1] = payload;
        },
        SET_H: (state, payload) => {
            state.h = payload;
        },
        SET_I: (state, payload) => {
            state.i = payload;
        },
        SET_J: (state, payload) => {
            state.j = payload;
        }
    },
    actions: {
        SET_G_ASYNC: async (context, payload) => {
            const json = await GET({ url: `${APIURL}/ping.php`});
            console.log(json);
            context.commit("SET_G", payload);
        },
        SET_G_NONASYNC: (context, payload) => {
            context.commit("SET_G", payload);
        },
        SET_G_INNER_ASYNC: (context, payload) => {
            GET({ url: `${APIURL}/ping.php` })
            .then(json => {
                console.log(json);
                context.commit("SET_G", payload);
            });
        }
    },
})
console.log(store.getState());
store.subscribe(() => console.log(`a:${store.getState().a}, b:${store.getState().b}`));
store.subscribe(() => console.log(`a:${store.getState().a}, b:${store.getState().b} 222222`));
store.subscribe(() => console.log(`h:${store.getState().h}`)); // 여기도 toString 과정에서 h[1]을 접근해서 publish됨
store.subscribe(() => console.log(`b:${store.getState().b}, h[1]:${store.getState().h[1]}`));
store.subscribe(() => console.log(`b:${store.getState().b}, h[1]:${store.getState().h[1]} 222222`));
store.subscribe(() => console.log(`a:${store.getState().a}, g.g1:${store.getState().g.g1}, g.g3.g11:${store.getState().g.g3.g11}`));
store.subscribe(() => console.log(`j:${JSON.stringify(store.getState().j)}`));

try {
    store.getState().a = 100;
} catch (e) {
    console.error(e);
}

console.log(store.getState());
console.log("\nstore.state.a = 10");
store.commit("SET_A", 10);
console.log("\nstore.state.g.g1 = 20");
store.commit("SET_G_G1", 20);
console.log("\nstore.state.g.g3.g11 = 40");
store.commit("SET_G_G3_G11", 40);
console.log("\nstore.state.h[1] = 40");
store.commit("SET_H1", 40);
console.log("\nstore.state.g = {g1:10,g2:30,g3:40}");
store.commit("SET_G", {g1:10,g2:30,g3:40});
console.log("\nstore.state.g = {g1:10,g2:30,g3:{g11:123,g12:234,g13:345}}");
store.commit("SET_G", {g1:10,g2:30,g3:{g11:123,g12:234,g13:345}});
console.log("\nstore.state.h = [5,6,7]");
store.commit("SET_H", [5, 6, 7]);
console.log("\nstore.state.i = {i2: {i21: 21}}");
store.commit("SET_I", {i2: {i21: 21}});
console.log("\nstore.state.i = {i2: {i21: {i212: 212}}}");
store.commit("SET_I", {i2: {i21: {i212: 212}}});
console.log("\nstore.state.j = {j1: 1, j2: 2}");
store.commit("SET_J", {j1: 1, j2: 2}); // TODO

// store.subscribe(() => console.log(`j:${JSON.stringify(store.getState().j)}`));
