import User from "./User.js";
import {GET, APIURL} from "../utils/requests.js";

const UserHandler = {
    userUrl :`${APIURL}/users.php`,
    users: {},
    currnentPartner: null,
    // handle currentUser via session storage

    async loadUsers() {
        try {
            const json = await GET(this.userUrl);
            const userList = json.contents; // id, name, end_date
            userList.forEach(userJson => {
                this.users[userJson.id] = User.from(userJson);
            });
        } catch (error) {
            console.log("ERROR : ", error);
        }
    },

    getUserById(userId) {
        return this.users[userId] || null;
    },

    set currentUser(newUser) {
        sessionStorage.setItem("userId", newUser.id);
        sessionStorage.setItem("userName", newUser.name);
        sessionStorage.setItem("userEndDate", newUser.endDate);
    },

    get currentUser() {
        const id = sessionStorage.getItem("userId") || "";
        const name = sessionStorage.getItem("userName") || "";
        const endDate = sessionStorage.getItem("userEndDate") || "";
        return new User(id, name, endDate);
    }
};

export { UserHandler as default };