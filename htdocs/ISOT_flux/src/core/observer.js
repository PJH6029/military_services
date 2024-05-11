import { DEBUG_LOG } from "../debug.js";

let observerStack = [];

const currentObserver = () => {
    if (observerStack.length <= 0) return null;
    return observerStack[observerStack.length - 1];
}

const debounceFrame = (callback) => {
    let currentCallback = -1;
    return () => {
        cancelAnimationFrame(currentCallback);
        currentCallback = requestAnimationFrame(callback);
    }
};

const observe = cb => {
    // DEBUG_LOG("subscribe");
    observerStack.push(cb); // TODO optimize
    // currentObserver = debounceFrame(cb); // TODO debounce frame
    cb();
    observerStack.pop();
};

const observable = (obj) => {
    // console.log("Called observable constructor", obj);
    if (obj === null) return null;
    if (typeof(obj) !== "object") return obj;

    const observableTwin = {}
    Object.keys(obj).forEach(key => {
        observableTwin[key] = {
            observable: observable(obj[key]),
            observers: new Set(),
        };
    });

    // console.log("Build new observable proxy", obj, observableTwin);
    const proxy = new Proxy(obj, {
        get(target, name) {
            if (name === "_raw") return target;

            if (Object.keys(target).includes(name)) {
                // DEBUG_LOG("proxy get", target, name, observableTwin[name].observable);
                if (currentObserver()) {
                    observableTwin[name].observers.add(currentObserver());
                    // DEBUG_LOG("Add observer to " + name, observableTwin[name].observers);
                }
                return observableTwin[name].observable; // for observable values
            } else {
                // TODO 없는 친구를 미리 subscribe 한 다음, 나중에 set하면 observers가 없음
                // 당장은 initState에 모든 key를 전부 지정해주어야 함

                // DEBUG_LOG("proxy get", target, name, target[name]);
                return target[name]; // for forEach, map, ...etc
            }
        },
        set(target, name, value) {
            let spraedValue = value;

            // TODO for 편의성 (SET_PARTIAL)
            // Object.keys(value).forEach(valueKey => {
            //     if (value[valueKey]._raw !== undefined) {
            //         console.log("fuck", value[valueKey]._raw);
            //         if (value[valueKey]._raw instanceof Array) {
            //             spraedValue[valueKey] = value[valueKey]._raw;
            //         } else {
            //             spraedValue = {...spraedValue, ...value[valueKey]._raw};
            //         }
            //     }
            // });
            // Object.keys(value).forEach(valueKey => {
            //     if (value[valueKey]._raw === undefined) {
            //         spraedValue[valueKey] = value[valueKey];
            //     }
            // });

            // DEBUG_LOG("proxy set", target, name, value);

            if (target[name] === spraedValue) return true;
            if (JSON.stringify(target[name]) === JSON.stringify(spraedValue)) return true;

            const observableValue = observable(spraedValue); // 새로 만들땐 비싼 연산
            // DEBUG_LOG("new observable value", observableValue);
            if (!Object.keys(target).includes(name)) {
                // new member
                observableTwin[name] = {
                    observable: null,
                    observers: new Set(),
                }
            }

            target[name] = spraedValue;
            observableTwin[name].observable = observableValue;
            // DEBUG_LOG("publish", "#observsers: " + observableTwin[name].observers.size, name, observableValue);
            observableTwin[name].observers.forEach(cb => cb());
            return true;
        },
    });
    return proxy;
}


export { observable, observe };