import UserHandler from "../handlers/UserHandler.js";

export default class UserContainer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    width: var(--user-list-width);
                    height: var(--main-height);
                    border: 2px solid black;
                    border-radius: 1rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding-top: 0.5rem;
                    overflow: auto;
                }

                :host::-webkit-scrollbar {
                    display: none;
                }
                
            </style>
        `;

        this.loadUsers().then(users => {
            // userbox for me
            const myBoxElem = document.createElement("user-box");
            myBoxElem.setUser(UserHandler.currentUser);
            myBoxElem.setAttribute("me", "");
            this.shadowRoot.append(myBoxElem);
            Object.entries(users).forEach(([userId, user]) => {
                if (UserHandler.currentUser.id !== userId) {
                    const userBoxElem = document.createElement("user-box");
                    userBoxElem.setUser(user);
                    this.shadowRoot.append(userBoxElem);
                }
            });
        });
    }

    setAllUserBoxUnselected() {
        this.shadowRoot.querySelectorAll("user-box").forEach(b => b.makeUnselected());
    }

    async loadUsers() {
        await UserHandler.loadUsers();
        return UserHandler.users;
    }
}