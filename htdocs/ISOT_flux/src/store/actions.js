import { DEBUG_LOG } from "../debug.js";
import { GET, PUT, POST, DEL, APIURL } from "../utils/requests.js";
import { time } from "../utils/time.js";

const urls = {
    card: `${APIURL}/cards.php`,
}

export const actions = {
    SET_ALL_CARDS: async (context, payload={}) => {
        const params = {};
        if (payload.lastDateStr) params.lastDateStr = payload.lastDateStr;
        // TODO pagination
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 2);
        params.lastDate = time.toTimeStr(lastMonth);

        const json = await GET({
            url: `${APIURL}/cardData.php`,
            params
        });
        context.commit("SET_ALL_CARDS", {
            cards: json.resultData
        });
    },
};