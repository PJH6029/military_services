import { REFRESH_TIME, ALERT_REFRESH_TIME } from "../utils/const.js";

const LoaderHandler = {
    loaders: [],
    updateListeners: [],
    listening: false,

    setNewLoader(callbackfnc) {
        this.loaders.push(setTimeout(callbackfnc, REFRESH_TIME));
        // this.loaders.push(setTimeout(callbackfnc, 0));
    },

    resetLoaders() {
        this.loaders.forEach(timeoutfnc => clearTimeout(timeoutfnc));
        this.loaders = [];
    },

    setNewUpdateListener(callbackfnc) {
        this.updateListeners.push(setTimeout(callbackfnc, ALERT_REFRESH_TIME));
        this.listening = true;
    },

    resetUpdateListener() {
        this.updateListeners.forEach(timeoutfnc => clearTimeout(timeoutfnc));
        this.updateListeners = [];
        this.listening = false;
    },
};

export { LoaderHandler as default };