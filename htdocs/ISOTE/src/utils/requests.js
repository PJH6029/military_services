async function GET(url) {
    const response = await fetch(url, {
        method: "GET",
        mode: "cors",
    });
    return response.json();
}

async function POST(url, body) {
    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return response.json();
}

async function PUT(url, body) {
    const response = await fetch(url, {
        method: "PUT",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return response.json();
}

async function DEL(url, body) {
    const response = await fetch(url, {
        method: "DELETE",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return response.json();
}

const localTest = false;
const APIURL = !localTest ? "" : "";  // security issue

export { GET, POST, PUT, DEL, APIURL }