export default class User {
    constructor(id, name, endDate) {
        this.id = id;
        this.name = name;
        this.endDate = endDate;
    }

    static from(userJson) {
        return new User(userJson.id, userJson.name, userJson.end_date);
    }

    empty() {
        return !this.id;
    }
}