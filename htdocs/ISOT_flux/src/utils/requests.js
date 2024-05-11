async function GET({url, params}) {
    let urlWithParams = url;
    if (params) {
        const paramStr = Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&");
        urlWithParams += "?";
        urlWithParams += paramStr;
    }
    const response = await fetch(urlWithParams, {
        method: "GET",
        mode: "cors",
    });
    const json = await response.json();
    return json;
}

async function POST({url, body}) {
	const res = await fetch(url, {
      	method: "POST",
      	mode: "cors",
      	headers: {
			"Content-Type": "application/json",
		},
      	body: JSON.stringify(body),
    });	
    const json = await res.json();
    return json;
}

async function PUT({url, body}) {
    const response = await fetch(url, {
        method: "PUT",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const json = await response.json();
    return json;
}

async function DEL({url, body}) {
    const response = await fetch(url, {
        method: "DELETE",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const json = await response.json();
    return json;
}

const localTest = false;
const APIURL = !localTest ? "" : ""; // security issue

export { GET, POST, PUT, DEL, APIURL };