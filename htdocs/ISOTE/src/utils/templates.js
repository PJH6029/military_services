export default async function getTemplate(filepath) {
    const response = await fetch(filepath);
    const txt = await response.text();
    const html = new DOMParser().parseFromString(txt, "text/html");
    return html.querySelector("template");
}