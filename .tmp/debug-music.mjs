const list = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
const target = list.find((p) => p.type === "page" && p.url.startsWith("http://127.0.0.1:3100"));
if (!target) throw new Error("no app tab");
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
await new Promise((res) => (ws.onopen = res));
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Runtime.enable");
await send("Page.enable");
const raw = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (!r.result) return { cdpError: r.error ?? r };
  if (r.result.exceptionDetails) return { exception: r.result.exceptionDetails.text };
  return { value: r.result.result.value };
};
console.log("title:", await raw("document.title"));
console.log("music state:", await raw("JSON.stringify(window.__music ?? null)"));
console.log("playing labels:", await raw("[...document.querySelectorAll('button')].map(b => b.getAttribute('aria-label')).filter(Boolean).filter(l => l.includes('Kotak') || l.includes('Manis'))"));
console.log("section exists:", await raw(`!![...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "musik")`));
console.log("contexts:", await send("Runtime.enable"));
ws.close();
