import { APIURL, GET, POST, DEL } from "../utils/requests.js";

const UserHandler = {
    url: `${APIURL}/users.php`,
    _localData: {
        users: {},
        currentUser: null,
    },
    
    async loadAllUsers() {
        const json = await GET({url: this.url});
        this._localData.users = { ...json.result };
    },

    async loadUser(id) {
        const params = { id };
        const json = await GET({url: this.url, params});
        this._localData.users = { ...this._localData.users, ...json.result };
    },

    async getAllUsers(refresh=false) {
        if (refresh || !this._localData.users) {
            await this.loadAllUsers();
        }
        return this._localData.users;
    },

    async getUser(id, refresh=false) {
        if (refresh || !this._localData.users[id]) {
            await this.loadUser(id);
        }
        return this._localData.users[id];
    },

    getCurrentUser(refresh=false) {
        if (refresh || !this._localData.currentUser) {
            const currentUser = {};
            currentUser.name = sessionStorage.getItem("userName") || "홍길동";
            currentUser.end_date = sessionStorage.getItem("userEndDate") || "99999999";
            currentUser.id = sessionStorage.getItem("userId") || "-1";
            this._localData.currentUser = currentUser;
        }
        return this._localData.currentUser;
    }
}

export { UserHandler as default };