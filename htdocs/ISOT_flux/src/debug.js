const isDebug = true;

const DEBUG_LOG = (...msg) => {
    if (isDebug) {
        console.log("DEBUG... // ", ...msg);
    }
}

export {isDebug, DEBUG_LOG};