import { APIURL, GET, POST, DEL, PUT } from "../utils/requests.js";
import time from "../utils/time.js";

const CardHandler = {
    url: `${APIURL}/cards.php`,
    _localData: {
        daily: {
            lastStamp: null,
            cards: {},
        },
        notice: {
            lastStamp: null,
            cards: {},
        }
    },
    pageLength: 30,


    // load
    async loadAllCards({table}) {
        const json = await GET({url: this.url, params: {table, all: true}});
        this._localData[table].cards = {...json.result};
        this.updateLastStamp(json.result, table);
    },

    async loadNextCardPage({table}) {
        const params = {
            table,
            pageLength: this.pageLength
        };
        if (this._localData[table].lastStamp) {
            params.lastStamp = encodeURIComponent(this._localData[table].lastStamp);
        }
        
        const json = await GET({url: this.url, params});
        this._localData[table].cards = { ...this._localData[table].cards, ...json.result };
        this.updateLastStamp(json.result, table);

        // pagination을 위해 return
        console.log(json.result);
        return json.result;
    },

    async loadCard({id, table}) {
        const params = { id, table };
        const json = await GET({url: this.url, params});
        this._localData[table].cards = { ...this._localData[table].cards, ...json.result };
        this.updateLastStamp(json.result, table);
    },


    // get
    async getAllCards({table, refresh = false}) {
        if (refresh || !this._localData[table].cards) {
            await this.loadAllCards({table});
        }
        return this._localData[table].cards;
    },

    async getNextCards({table}) {
        return await this.loadNextCardPage({table});
    },

    async getCard({id, table, refresh = false}) {
        if (refresh || !this._localData[table].cards[id]) {
            await this.loadCard({id, table});
        }
        return this._localData[table].cards[id];
    },


    async addCard({data, table}) {
        data.modified_at = time.getCurrentTimeStamp();
        const { success, error } = this.validate(data);
        if (!success) {
            return { success, error };
        }

        try {
            const json = await POST({ url: this.url, body: {...data, table} });
            if (!json.success) {
                console.log(json.error);
                return { success, error: json.error };
            }

            this._localData[table].cards[data.id] = { ...data };
            return {success: true, error: ""};
        } catch (error) {
            console.log("ERROR : ", error);
            return { success: false, error };
        }
    },

    async editCard({data, table}) {
        data.modiofied_at = time.getCurrentTimeStamp();
        const { success, error } = this.validate(data);
        if (!success) {
            return { success, error };
        }

        try {
            const json = await PUT({ url: this.url, body: {...data, table} });
            if (!json.success) {
                console.log(json.error);
                return { success, error: json.error };
            }

            this._localData[table].cards[data.id] = { ...data };
            return {success: true, error: ""};
        } catch (error) {
            console.log("ERROR : ", error);
            return { success: false, error };
        }
    },

    async deleteCard({id, table}) {
        try {
            const json = await DEL({url: this.url, body: { id, table }});
            if (!json.success) {
                console.log(json.error);
                return { success, error: json.error };
            }

            delete this._localData[table].cards[id];
            console.log("delete complete");
            return {success: true, error: ""};
        } catch (error) {
            console.log("ERROR : ", error);
            return { success: false, error };
        }
    },

    updateLastStamp(cards, table) {
        if (!cards) return;

        const modificationTimes = Object.values(cards).map(v => ({
            stamp: v,
            parsed: time.toTimeNum(v.modified_at),
        }));
        modificationTimes.sort((a, b) => a.parsed - b.parsed);

        if (!this._localData[table].lastStamp) {
            this._localData[table].lastStamp = modificationTimes[modificationTimes.length - 1].stamp;
        } else if (modificationTimes[modificationTimes.length - 1].parsed > time.toTimeNum(this._localData[table].lastStamp)) {
            // update stamp
            this._localData[table].lastStamp = modificationTimes[modificationTimes.length - 1].stamp;
        }
    },

    validate(data) {
        // title, content: not null, not blank
        if (this.someEmpty(data.title, data.content)) {
            return { success: false, error: "Either title or content is empty"};
        }
        // priority, pinned: not null, exists default value
        // modified at: current time
        if (!data.modified_at || !time.isTimeStamp(data.modified_at)) {
            return { success: false, error: "Modification time is not set or invalid"};
        }
        return { success: true, error: "" };
    },

    someEmpty(...args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].toString() === "") {
                return true;
            }
        }
        return false;
    }
};

export { CardHandler as default };