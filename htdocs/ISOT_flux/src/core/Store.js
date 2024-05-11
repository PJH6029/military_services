import { DEBUG_LOG } from "../debug.js";
import { observable, observe } from "./observer.js"

const _deepFrozen2 = observableObj => {


    const proxy = new Proxy(observableObj, {
        get(target, name) {
            if (Object.keys(target).includes(name)) {
                const observableValue = target[name];

                return _deepFrozen2(observableValue);
            } else {
                return target[name];
            }

        },
        set(target, name, value) {
            return false;
        }
    });

    return proxy;
}


const _deepFrozen = (observableObj, parentKey=null) => {
    // key의 get 시에 observableobj의 value가 리턴되어야 함
    // value는 하위 value 접근시 동일하게 적용되어야 함
    // 쓰기는 안됨


    const currObservableObj = parentKey ? observableObj[parentKey] : observableObj;

    if (currObservableObj === null) return {
        get: () => null
    }
    if (typeof currObservableObj !== "object") return {
        get: () => observableObj[parentKey]
    }

    const deepFrozenTwin = {};
    Object.keys(currObservableObj).forEach(key => {
        deepFrozenTwin[key] = _deepFrozen(currObservableObj, key);
    });

    DEBUG_LOG("Build new frozen state", currObservableObj, deepFrozenTwin);
    const proxy = new Proxy(currObservableObj, {
        get(target, name) {
            if (Object.keys(target).includes(name)) {
                const observableValue = target[name]; // proxy call to add observer
                // TODO observableObj[name]이 새로 assign 되면, deepFrozenChild 와 observableChild가 달라짐
                // store test store.state.g = {g1:10,g2:30,g3:40} 참고
                // const deepFrozenChild = deepFrozenTwin[name].get();
                // const deepFrozenChild = _deepFrozen(target, name).get();

                DEBUG_LOG("frozen get", target, name, deepFrozenChild);
                return deepFrozenChild;
            } else {
                // DEBUG_LOG("frozen get", target, name, target[name]);
                return target[name];
            }
        },
        set(target, name, value) {
            return false; // prevent direct allocation
        }
    });

    return {
        get: () => proxy,
    };
};

const deepFrozen = observableObj => _deepFrozen(observableObj).get();

// export const createStore = initState => {
//     let observableState = observable(initState);
//     let frozenState = deepFrozen(observableState);

//     const getState = () => frozenState;

//     const dispatch = async (action, {...payload}) => {
//         await 
//     };

//     const subscribe = callback => {
//         observe(callback);
//     };

//     return { getState, dispatch, subscribe };
// }

export class Store {
    // mutation: (state, payload)
    // action: (context: { rootState, state, dispatch, commit }, payload)

    #observableState; #mutations; #actions;
    #frozenState = {};

    constructor({ state, mutations, actions }) {
        this.#observableState = observable(state);
        this.#mutations = mutations;
        this.#actions = actions;
        // this.#frozenState = deepFrozen(this.#observableState); TODO readonly state
    }

    getState() {
        // return this.#frozenState;
        return this.#observableState;
    }

    // 동기 처리용. mutations에게 부탁
    commit(action, payload) { 
        this.#mutations[action](this.#observableState, payload);
    }

    subscribe(callback) {
        observe(callback);
    }

    // 비동기 처리용. actions에게 부탁. 비동기 처리 후 state 변경은 mutation을 commit하여 사용
    async dispatch(action, payload) { 
        return await this.#actions[action]({
            state: this.#observableState,
            commit: this.commit.bind(this),
            dispatch: this.dispatch.bind(this),
        }, payload);
    }
}