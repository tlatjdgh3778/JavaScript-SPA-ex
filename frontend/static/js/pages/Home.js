export default class {
    constructor() {
        document.title = "Home";
    }
    async getHtml() {
        return `
            <h1>This is Home Page</h1>
        `;
    }
}
