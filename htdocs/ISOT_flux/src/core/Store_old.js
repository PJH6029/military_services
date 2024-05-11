import { observable, observe } from "./observer.js";

const deepCopy = obj => {
    if (typeof(obj) === "function ") throw Error("State cannot have functions as values");
    if (obj === null) return null; // typeof(null) === "object"
    if (typeof(obj) !== "object") return obj; // 6 types except object

    if (obj instanceof Array) {
        const copiedArr = [];
        obj.forEach(item => {
            const deepCopiedChild = deepCopy(item);
            copiedArr.push(deepCopiedChild);
        });
        return copiedArr;
    } else {
        const copiedObj = {};
        Object.getOwnPropertyNames(obj).forEach(key => {
            const deepCopiedChild = deepCopy(obj[key]);
            copiedObj[key] = deepCopiedChild;
        });
        return copiedObj;
    }
}

const deepFrozen = observableObj => {
    // typeof : string, number, boolean, undefined, symbol, object, function
    const frozenState = {};

    if (typeof(observableObj) === "function") throw Error("State cannot have functions as values");
    if (observableObj === null) return null; // typeof(null) === "object"
    if (typeof(observableObj) !== "object") return observableObj; // 6 types except object

    Object.getOwnPropertyNames(observableObj).forEach(key => {
        // console.log(obj, key, obj[key]);
        if (typeof(observableObj[key]) === "function") throw Error("State cannot have functions as values");
        else if (observableObj[key] === null) {
            Object.defineProperty(frozenState, key, {
                get: () => null,
            });
        } else if (typeof(observableObj[key]) !== "object") {
            Object.defineProperty(frozenState, key, {
                get: () => {
                    // console.log("get get", observableObj[key]); 
                    // console.log(observableObj, key, observableObj[key], typeof(observableObj[key]))
                    return observableObj[key];
                }, // get에서 observableObj[key]의 getter가 evaluate 돼야 함
            });
        } else {
            const deepFrozenVal = deepFrozen(observableObj[key]); // TODO extensible 해도 되는지
            Object.defineProperty(frozenState, key, {
                get: () => {
                    // console.log("GET GET", key, deepFrozenVal);
                    // console.log(observableObj, key, observableObj[key], typeof(observableObj[key]))
                    return deepFrozenVal;
                },
            });
        }
    });
    return frozenState;
};

const updateState = (observableState, newState) => {
    console.log("UPDATE STATE", observableState, newState);
    // if (typeof(observableState) === "function") throw Error("State cannot have functions as values");
    // if (observableState === null) return null; // typeof(null) === "object"
    // if (typeof(observableState) !== "object") return observableState; // 6 types except object

    Object.getOwnPropertyNames(newState).forEach(key => {
        const value = newState[key];
        if (!observableState[key]) return; // TODO new State에서 새로 등장한 key도 업데이트 해야하지 않을까? 
        console.log("SET EVALUATED ", key, observableState[key], value);
        observableState[key] = value; // publish. observable을 통해 일괄적인 notify가 아닌, 각 value에 맞게 notify할 수 있음
        // TODO observable에서 equiality check 해도, object 는 key냐 prop이냐 차이로 false 나옴
        if (newState[key] !== null && typeof(newState[key]) === "object") {
            updateState(observableState[key], value);
        }    
    });
}

const createStore = reducer => {
    const observableState = observable(reducer());
    console.log(observableState);

    console.log("building frozen state", observableState);
    const frozenState = deepFrozen(observableState);
    console.log("finish building frozen state");

    const dispatch = action => {
        const newState = reducer(observableState, action); // reducer: (state, action) => state. 객체 상태를 변경하면 새로운 객체를 반환하기만 하면 됨.
        console.log("update state", observableState, newState);
        updateState(observableState, newState);
    }

    const getState = () => frozenState;

    const subscribe = (callback) => {
        observe(callback);
    };

    return { getState, dispatch, subscribe };
};

const createReducer = ({initState, actions}) => {
    const newState = (state, action) => {
        console.log("reducing...");
        const result = deepCopy(state); // TODO too expensive
        console.log("Copy: ", result);
        try {
            actions[action.type](result, action);
        } catch (e) {
            console.error(e);
            throw Error("Cannot execute action");
        }

        console.log("finish reducing");
        console.log(state, result);
        return result;
    }

    return (state = initState, action={}) => {
        if (!action.type) return state;
        return newState(state, action);
    };
};